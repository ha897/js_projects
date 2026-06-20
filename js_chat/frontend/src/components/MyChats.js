import { useState, useEffect } from "react";
import { ChatState } from "../context/chatProvider";
import { getSender } from "../config/ChatLogics";
import { CreateGroupModal } from "./miscellaneous/CreateGroupModal.js";
import toast from "../utils/toast";
import axios from "axios";

import {
  Box,
  Typography,
  Button,
  Tooltip,
  List,
  TextField,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import Modal from "@mui/material/Modal";

const MyChats = ({ fetchAgain, setFetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const [loadingChat, setLoadingChat] = useState(true);
  const { user, setUser, selectedChat, setSelectedChat, chats, setChats } =
    ChatState();
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    // border: '1px  solid #000',
    borderRadius: "10px",
    boxShadow: 24,
    p: 4,
  };
  const fetchChats = async () => {
    // console.log(user._id);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        "http://localhost:5000/api/chat",
        config
      );
      setChats(data);
      setLoadingChat(false);
    } catch (error) {
      toast("Error Occured: " + error, "error");
    }
  };
  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("user-info")));
    fetchChats();
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
          sm: "30%", // للشاشات المتوسطة (تابلت)
          md: "25%", // للشاشات الكبيرة (لابتوب)
          lg: "25%", // للشاشات الأكبر (ديسكتوب)
        },
        height: "100%",
        borderRadius: "10px",
        p: 2,
        display: {
          xs: selectedChat ? "none" : "flex",
          sm: "flex",
          md: "flex",
          lg: "flex",
        },
        flexDirection: "column",
        bgcolor: "#fff",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{width:"50%"}}>
          My Chats
        </Typography>
        <CreateGroupModal>New Group Chat +</CreateGroupModal>
      </Box>

      {/* Chats List */}
      <List sx={{ display: "flex", flexDirection: "column", gap: 1,height:"100%", overflowY: "auto" }}>
        {loadingChat && <span>loading...</span>}
        {(chats && chats.length > 0)
          ? chats.map((chat) => (
              <ListItem
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                sx={{
                  bgcolor:
                    selectedChat?._id === chat._id ? "primary.main" : "#E5E5E5",
                  color:
                    selectedChat?._id === chat._id ? "white" : "black",
                  borderRadius: "10px",
                  cursor: "pointer",
                  // color  : "white",
                  "&:hover": {
                    bgcolor:
                      selectedChat?._id === chat._id
                        ? "primary.dark"
                        : "grey.300",
                  },
                }}
              >
                <Tooltip
                                key={chat._id}

                  enterDelay={800}
                  title={
                    chat.isGroupChat
                      ? chat.chatName
                      : getSender(loggedUser, chat.users)
                  }
                >
                  <ListItemText
                    // primary={chat.isGroupChat? chat.chatName:chat.users[1].name }
                    sx={{
                      "& .MuiListItemText-primary": {
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      },
                    }}
                    // sx={{
                    //   whiteSpace: "nowrap",
                    //   overflow: "hidden",
                    //   textOverflow: "ellipsis",
                    // }}
                    primary={
                      chat.isGroupChat
                        ? chat.chatName
                        : getSender(loggedUser, chat.users)
                    }
                    primaryTypographyProps={{
                      fontSize: "15px",
                      fontWeight: 500,
                    }}
                  />
                </Tooltip>
              </ListItem>
            ))
          : !loadingChat && (
              <Typography variant="body2" color="text.secondary">
                no chats yet
              </Typography>
            )}
      </List>
    </Paper>
  );
};

export default MyChats;
