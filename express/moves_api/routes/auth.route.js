import express from "express";
import * as authControllers from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/helpers.js"
import { authenticateUser } from "../middlewares/auth.middleware.js"
import { validateRequest } from "../middlewares/validator.middlewere.js"
import { loginValidator } from "../validator/auth.validator.js"
const router = express.Router()

router.post("/login", loginValidator(), validateRequest, asyncHandler(authControllers.login))
router.post("/regester", asyncHandler(authControllers.regester))
router.get("/me", authenticateUser, asyncHandler(authControllers.getCurrentUser))

export default router