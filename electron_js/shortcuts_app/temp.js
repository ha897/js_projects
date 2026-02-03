// ============= File Shortcuts =============

function addShortcutFile(event, shortcutFormula, filePath, saveInDB = true) {
    const isAlreadyRegistered = globalShortcut.isRegistered(shortcutFormula);
    
    console.log(`محاولة تسجيل اختصار ملف: ${shortcutFormula}`);
    console.log(`مسجل مسبقاً: ${isAlreadyRegistered}`);
    console.log(`حفظ في DB: ${saveInDB}`);
    
    // ✅ إذا كان مسجلاً مسبقاً والطلب من المستخدم (saveInDB = true)
    if (isAlreadyRegistered && saveInDB === true) {
        dialog.showMessageBox(shortcutFileWin || mainWin, {
            type: "question",
            title: "اختصار موجود",
            message: `الاختصار ${shortcutFormula} موجود مسبقاً.\nهل تريد استبداله؟`,
            buttons: ["نعم، استبدل", "لا، إلغاء"],
            defaultId: 1
        }).then(({ response }) => {
            if (response === 1) {
                console.log("تم إلغاء العملية من قبل المستخدم");
                return;
            }
            
            // حذف القديم
            globalShortcut.unregister(shortcutFormula);
            mainWin.webContents.send("delete-file-shortcut-DB", shortcutFormula);
            
            // تسجيل الجديد
            registerFileShortcut(shortcutFormula, filePath, saveInDB);
        });
        return;
    }
    
    // ✅ إذا كان مسجلاً والطلب من تحميل DB (saveInDB = false)
    if (isAlreadyRegistered && saveInDB === false) {
        console.log(`الاختصار ${shortcutFormula} موجود بالفعل، تم تجاهل إعادة التسجيل`);
        return;
    }
    
    // ✅ تسجيل الاختصار الجديد
    registerFileShortcut(shortcutFormula, filePath, saveInDB);
}

function registerFileShortcut(shortcutFormula, filePath, saveInDB) {
    const shortcutRegistered = globalShortcut.register(shortcutFormula, () => {
        shell.openPath(filePath)
            .then(result => {
                if (result) {
                    console.error('حدث خطأ أثناء فتح الملف:', result);
                    
                    dialog.showMessageBox({
                        type: "error",
                        title: "خطأ",
                        message: `فشل فتح الملف:\n${result}`
                    });
                }
            });
    });
    
    if (!shortcutRegistered) {
        console.error(`❌ فشل تسجيل اختصار الملف: ${shortcutFormula}`);
        
        dialog.showMessageBox(shortcutFileWin || mainWin, {
            type: "error",
            title: "خطأ",
            message: `فشل تسجيل الاختصار ${shortcutFormula}.\nقد يكون محجوزاً من قبل النظام.`
        });
        
        return;
    }
    
    console.log(`✅ تم تسجيل اختصار الملف بنجاح: ${shortcutFormula}`);
    
    // حفظ في قاعدة البيانات
    if (saveInDB === true) {
        mainWin.webContents.send("add-file-shortcut-DB", shortcutFormula, filePath);
        
        // ✅ إغلاق نافذة الإضافة بعد النجاح
        if (shortcutFileWin) {
            setTimeout(() => {
                shortcutFileWin.close();
            }, 500);
        }
    }
}