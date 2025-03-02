import express from "express";
import * as movieControllers from "../controllers/movies.controller.js";
import { asyncHandler } from "../utils/helpers.js"
import { authenticateUser } from "../middlewares/auth.middleware.js"
import { authenticateAdmin } from "../middlewares/admin.middleware.js"
// import { authenticateUser } from "../middlewares/auth.middleware.js"
const router = express.Router()

router.get("/",asyncHandler(movieControllers.getMovies))
router.get("/:id",asyncHandler(movieControllers.getMovie))
router.post("/",
    authenticateUser,
    asyncHandler(authenticateAdmin),
    asyncHandler(movieControllers.createMovies
    ))
// يستخرج الاي دي من خلال req.params لانه موجود بالرابط
router.put("/:id",
    authenticateUser,
    asyncHandler(authenticateAdmin),
    asyncHandler(movieControllers.updateMovie
    ))
router.delete("/:id",
    authenticateUser,
    asyncHandler(authenticateAdmin),
    asyncHandler(movieControllers.deleteMovie
    ))


export default router