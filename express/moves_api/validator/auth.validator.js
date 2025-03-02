import { body } from "express-validator"

export function loginValidator(){
    return [
        // التحقق ما اذا كان الايميل موجودا
        body("email").notEmpty().withMessage("email is required"),
        // التحقق من انه ايميل صحيح البنية
        body("email").isEmail().withMessage("invalid email"),
        // التحقق ما اذا كان كلمة المرور موجودا
        body("email").notEmpty().withMessage("email is required"),
    ]
}