export const getSender = (loggedUser, users)=>{
  if(loggedUser === undefined) return users[1];
  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
}   
export const getSenderAll = (loggedUser, users)=>{
  if(loggedUser === undefined) return users[1];
  return users[0]._id === loggedUser._id ? users[1] : users[0];
}   
export const isSameSender = (messages, currentIndex) => {
  // التحقق من صحة المعاملات
  if (!messages || !Array.isArray(messages) || currentIndex < 0 || currentIndex >= messages.length) {
    return false;
  }
  
  // إذا كانت هذه الرسالة الأخيرة، فلا يوجد مرسل تالي للمقارنة
  if (currentIndex === messages.length - 1) {
    return false;
  }
  
  const currentMessage = messages[currentIndex];
  const nextMessage = messages[currentIndex + 1];
  
  // التحقق من وجود بيانات المرسل
  if (!currentMessage?.sender || !nextMessage?.sender) {
    return false;
  }
  
  // مقارنة معرفات المرسلين
  return currentMessage.sender._id === nextMessage.sender._id;
};

// إصدار متقدم - يتيح استثناء مستخدمين معينين من المقارنة
// export const isSameSenderAdvanced = (messages, currentIndex, excludeUserIds = []) => {
//   // التحقق من صحة المعاملات
//   if (!messages || !Array.isArray(messages) || currentIndex < 0 || currentIndex >= messages.length) {
//     return false;
//   }
  
//   // إذا كانت هذه الرسالة الأخيرة، فلا يوجد مرسل تالي للمقارنة
//   if (currentIndex === messages.length - 1) {
//     return false;
//   }
  
//   const currentMessage = messages[currentIndex];
//   const nextMessage = messages[currentIndex + 1];
  
//   // التحقق من وجود بيانات المرسل
//   if (!currentMessage?.sender || !nextMessage?.sender) {
//     return false;
//   }
  
//   // إذا كان المرسل الحالي في قائمة الاستثناء، إرجاع false
//   if (excludeUserIds.includes(currentMessage.sender._id)) {
//     return false;
//   }
  
//   // مقارنة معرفات المرسلين
//   return currentMessage.sender._id === nextMessage.sender._id;
// };

// // إصدار للتحقق من المرسل السابق بدلاً من التالي
// export const isSameSenderAsPrevious = (messages, currentIndex, excludeUserIds = []) => {
//   // التحقق من صحة المعاملات
//   if (!messages || !Array.isArray(messages) || currentIndex <= 0 || currentIndex >= messages.length) {
//     return false;
//   }
  
//   const currentMessage = messages[currentIndex];
//   const previousMessage = messages[currentIndex - 1];
  
//   // التحقق من وجود بيانات المرسل
//   if (!currentMessage?.sender || !previousMessage?.sender) {
//     return false;
//   }
  
//   // إذا كان المرسل الحالي في قائمة الاستثناء، إرجاع false
//   if (excludeUserIds.includes(currentMessage.sender._id)) {
//     return false;
//   }
  
//   // مقارنة معرفات المرسلين
//   return currentMessage.sender._id === previousMessage.sender._id;
// };

export const isLastMessage = (messages, currentIndex) => {
  // التحقق من صحة المعاملات
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return false;
  }
  
  if (currentIndex < 0 || currentIndex >= messages.length) {
    return false;
  }
  
  // التحقق من أن هذا هو الفهرس الأخير
  return currentIndex === messages.length - 1;
};

// // إصدار متقدم - يتحقق من كون الرسالة الأخيرة ومن مرسل محدد
// export const isLastMessageFromSender = (messages, currentIndex, senderId) => {
//   // التحقق من صحة المعاملات
//   if (!messages || !Array.isArray(messages) || messages.length === 0) {
//     return false;
//   }
  
//   if (currentIndex < 0 || currentIndex >= messages.length) {
//     return false;
//   }
  
//   // التحقق من أن هذا هو الفهرس الأخير
//   if (currentIndex !== messages.length - 1) {
//     return false;
//   }
  
//   const lastMessage = messages[currentIndex];
  
//   // التحقق من وجود بيانات المرسل
//   if (!lastMessage?.sender?._id) {
//     return false;
//   }
  
//   // التحقق من تطابق معرف المرسل
//   return lastMessage.sender._id === senderId;
// };

// // إصدار للتحقق من كون الرسالة الأخيرة وليست من مستخدمين مستثنيين
// export const isLastMessageExcluding = (messages, currentIndex, excludeUserIds = []) => {
//   // التحقق من صحة المعاملات
//   if (!messages || !Array.isArray(messages) || messages.length === 0) {
//     return false;
//   }
  
//   if (currentIndex < 0 || currentIndex >= messages.length) {
//     return false;
//   }
  
//   // التحقق من أن هذا هو الفهرس الأخير
//   if (currentIndex !== messages.length - 1) {
//     return false;
//   }
  
//   const lastMessage = messages[currentIndex];
  
//   // التحقق من وجود بيانات المرسل
//   if (!lastMessage?.sender?._id) {
//     return false;
//   }
  
//   // التحقق من أن المرسل ليس في قائمة المستثنيين
//   return !excludeUserIds.includes(lastMessage.sender._id);
// };

// // إصدار يتحقق من آخر رسالة من أي مرسل عدا المستخدم المحدد (مشابه للدالة الأصلية)
// export const isLastMessageFromOthers = (messages, currentIndex, userId) => {
//   return isLastMessageExcluding(messages, currentIndex, [userId]);
// };
