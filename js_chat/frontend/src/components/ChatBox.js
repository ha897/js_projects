import { ChatState } from "../context/chatProvider";
import MessageBubble from "./MessageBubble";
import SingleChat from "./SingleChat";
import GroupChat from "./GroupChat";
import { useEffect } from "react";

import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  IconButton,
} from "@mui/material";
import { io } from "socket.io-client";

const ENDPOINT = "http://localhost:5000";
var socket;
// var socket, selectedChatCompare;

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const {
    user,
    setUser,
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  // useEffect(() => {
  //   selectedChatCompare = selectedChat;
  // }, [selectedChat]);
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("message recieved", (newMessageRecieved) => {
      console.log(newMessageRecieved, "++++");
      console.log(notification);
      console.log(
        notification.some((n) => n.sender._id === newMessageRecieved.sender._id)
      );
      if (!selectedChat || selectedChat._id !== newMessageRecieved.chat._id) {
        // notification

        // if (!notification.some((n) => n._id === newMessageRecieved._id)) {
        setNotification((prev) => {
          const exists = prev.some(
            (n) => n.chat._id === newMessageRecieved.chat._id
          );
          if (exists) return prev;
          // setFetchAgain(!fetchAgain);
          return [newMessageRecieved, ...prev];
        });
      }
    });
  }, []);
  return (
    <Paper
      elevation={3}
      width={{
        xs: "95%", // للشاشات الصغيرة (موبايل)
        sm: "80%", // للشاشات المتوسطة (تابلت)
        md: "60%", // للشاشات الكبيرة (لابتوب)
        lg: "50%", // للشاشات الأكبر (ديسكتوب)
      }}
      sx={{
        width: {
          xs: "100%", // للشاشات الصغيرة (موبايل)
          sm: "69%", // للشاشات المتوسطة (تابلت)
          md: "74%", // للشاشات الكبيرة (لابتوب)
          lg: "74%", // للشاشات الأكبر (ديسكتوب)
        },
        height: "100%",
        borderRadius: "10px",
        p: 1.5,
        display: {
          xs: selectedChat ? "flex" : "none",
          sm: "flex",
          md: "flex",
          lg: "flex",
        },
        flexDirection: "column",
        bgcolor: "#fff",
      }}
    >
      {/* <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} /> */}
      {!selectedChat ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="h5" fontWeight={600} color="text.secondary">
            Click on a user to start chating
          </Typography>
        </Box>
      ) : selectedChat.isGroupChat ? (
        <GroupChat
          fetchAgain={fetchAgain}
          setFetchAgain={setFetchAgain}
          socket={socket}
        />
      ) : (
        <SingleChat
          fetchAgain={fetchAgain}
          setFetchAgain={setFetchAgain}
          socket={socket}
        />
      )}
    </Paper>
  );
};
export default ChatBox;
