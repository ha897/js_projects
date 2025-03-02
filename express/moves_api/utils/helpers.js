import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { initDB } from "./db.js"
dotenv.config();

export function generateToken(userId){
    return jwt.sign({userId},process.env.JWT_SECRET)
}

export function asyncHandler(fn){
    return (req,res,next)=>{
        return Promise.resolve(fn(req,res,next)).catch(next)
    }
}