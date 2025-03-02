import express from "express"
import morgan from "morgan"
import dotenv from "dotenv"
import { initDB } from "./utils/db.js"
import authRoute from "./routes/auth.route.js"
import movieRoute from "./routes/movies.route.js"
import reviewRoute from "./routes/reviews.route.js"
import watchlistRoute from "./routes/watchlist.route.js"
import bodyParser from "body-parser"
import { createDefaulteAdmin } from "./utils/admin.js"

// بعد الاتصال بقاعدة البيانات انشا الادمن
initDB().then(() => {
    createDefaulteAdmin()
})
dotenv.config();
const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"))
app.use(express.json())

app.get("/", (req, res) => {
    res.json({ message: "welcome to move API" })
})
app.use("/api/auth", authRoute)
app.use("/api/movies", movieRoute)
app.use("/api/reviews", reviewRoute)
app.use("/api/watchlist", watchlistRoute)

// اذا كنت الراوت غير موجود سينفض هذه الطبقة
app.use((req, res) => {
    res.status(404).json({ error: "can not find the page" })
})
// اي اخطاء بالمشروع
app.use((err, req, res, next) => {
    console.log("error: " + err.message)
})
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})