import { User } from "../models/index.js"
import bcrypt from "bcrypt"
import { generateToken } from "../utils/helpers.js"

export async function regester(req, res) {
    console.log(req.body)
    const user = await User.findOne({ where: { email: req.body.email } })
    if (user) {
        res.status(400).json({ message: "user alredy exists" })
        return;
    }
    // 10 عدد دورات
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    })
    const token = generateToken(newUser.id);

    res.status(201).json({
        token,
        user: {
            id: newUser.id,
            name: newUser.name,
            id: newUser.id
        }
    })
}

export async function login(req, res) {
    console.log(req)
    const user = await User.findOne({ where: { email: req.body.email } })
    if(!user){
        res.status(404).json({message:"email or password are wrong"})
    }
    const isValidPassword = await bcrypt.compare(req.body.password, user.password)

    if(!isValidPassword){
        res.status(404).json({message:"email or password are wrong"})
    }

    const token = generateToken(user.id)
    res.json({token})

}

export async function getCurrentUser(req, res) {
    const user = await User.findByPk(req.body.id)
    if (!user) {
        return res.status(404).json({ message: "user not found" })
    }
    res.json({
        id: user.id,
        name: user.name,
        email: user.email
    })
}