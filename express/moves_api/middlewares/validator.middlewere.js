import { validationResult } from "express-validator"

export function validateRequest(req,res,next){
    // يستخرج اي خطا ارسل من المكتبة
    const errors = validationResult(req)
    // اذا لا يوجد اخطاء
    if(errors.isEmpty()){
        return next()
    }
    return res.status(400).json({errors:errors.array()})
}