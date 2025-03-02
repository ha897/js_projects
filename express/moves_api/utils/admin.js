import bcrypt from "bcrypt";
import { User } from "../models/index.js"
import dotenv from "dotenv"

dotenv.config();
export async function createDefaulteAdmin() {
    const admin = await User.findOne({ where: { email: "admin@admin.com" } })
    if (!admin) {
        const hachedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
        await User.create({
            name: "admin",
            email: "admin@admin.com",
            password: hachedPassword,
            isAdmin: true
        })
    }
}
