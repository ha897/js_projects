const express = require("express");
const { protect } = require("../middleware/authMiddleware.js");

const {
  accessChat,
  fetchChat,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
} = require("../controllers/chatControllers");
const router = express.Router();

router.route("/").post(protect, accessChat);//get chat
router.route("/").get(protect, fetchChat);//get all user chats
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/groupadd").put(protect, addToGroup);
router.route("/groupremove").put(protect, removeFromGroup);

module.exports = router;
