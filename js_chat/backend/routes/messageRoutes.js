const express = require("express");
const { protect } = require("../middleware/authMiddleware.js");

const {sendMessages,allMessages} = require("../controllers/messageControllers.js");
const router = express.Router();

router.route("/").post(protect, sendMessages);
router.route("/:chatId").get(protect, allMessages);

 
module.exports = router;
