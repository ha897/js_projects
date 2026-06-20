// SELECT USER FUNC TO PROTECT ERRORS selectedChat.users[1]
import { ChatState } from "../context/chatProvider";
import { useState, useEffect, useRef } from "react"; // أضف هذا فوق

// import MessageBubble from "./MessageBubble";
import ProfileModal from "./miscellaneous/ProfileModal";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import toast from "../utils/toast.js";
import ScrollableChat from "./ScrollableChat";

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
import { getSender,getSenderAll } from "../config/ChatLogics";
import UpdateGroupChat from "./miscellaneous/UpdateGroupChat";
import Lottie from "react-lottie";
import * as animationData from "../animation/typing.json";

// const ENDPOINT = "http://localhost:5000";
// var socket, selectedChatCompare;
// var selectedChatCompare;


const SingleChat = ({ fetchAgain, setFetchAgain,socket }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

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

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) {
      return;
    }

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    // !!!!!!!!!!!!@@@@@@@@@@@
    let lastTypingTime = new Date().getTime();
    // var timerLength = 3000;
    var timerLength = 4000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  // const lastTypingTime = useRef(null);
  // const typingTimeout = useRef(null);

  // const typingHandler = (e) => {

  //   // socket.emit("typing", selectedChat._id);
  //   setNewMessage(e.target.value);

  //   if (!socketConnected) return;

  //   if (!typing) {
  //     setTyping(true);
  //     socket.emit("typing", selectedChat._id);
  //   }

  //   lastTypingTime.current = new Date().getTime();

  //   if (typingTimeout.current) {
  //     clearTimeout(typingTimeout.current)
  //   };

  //   typingTimeout.current = setTimeout(() => {
  //     const timeNow = new Date().getTime();
  //     const timeDiff = timeNow - lastTypingTime.current;

  //     if (timeDiff >= 4000 && typing) {
  //       socket.emit("stop typing", selectedChat._id);
  //       setTyping(false);
  //     }
  //   }, 4000);
  // };

  const sendMessage = async (e) => {
    if (e._reactName==="onClick" || (e.key === "Enter" && newMessage)) {
      socket.emit("stop typing", selectedChat._id);

      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.post(
          "http://localhost:5000/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        setNewMessage(""); //del ###
        socket.emit("new message", data);

        setMessages([...messages, data]);
        setFetchAgain(!fetchAgain)
      } catch (error) {
        toast("Error Occurred!Front: " + error, "error");
      }
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `http://localhost:5000/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast("Error Occurred!", "error");
    }
  };
  useEffect(() => {
    // socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => {
      setIsTyping(true);
    });
    socket.on("stop typing", () => {
      setIsTyping(false);
    });
    // return () => {
    //   socket.disconnect();
    // };
  }, []);

  useEffect(() => {
    fetchMessages();
    // selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      console.log("notification:");
      console.log(newMessageRecieved, "++++");
      console.log(notification);

      if (
        !selectedChat ||
        selectedChat._id !== newMessageRecieved.chat._id
      ) {
        setNotification((prev) => {
          const exists = prev.some(
            (n) => n.chat._id === newMessageRecieved.chat._id
          );
          if (exists) return prev;
          // setFetchAgain(!fetchAgain);
          return [newMessageRecieved, ...prev];
        });
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageRecieved]);
      }
    });
  }, []);

  return !selectedChat ? (
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
  ) : (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",

          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {/* back to chat list */}
          <Button
            size="small"
            onClick={() => setSelectedChat(undefined)}
            sx={{
              fontSize: "18px",
              width: "40px",
              minWidth: "40px",
              height: "40px",
              borderRadius: "50%",
              textTransform: "none",
              display: {
                xs: "flex",
                sm: "none",
                md: "none",
                lg: "none",
              },
            }}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </Button>

          <Typography variant="h6" fontWeight={600}>
            {selectedChat &&
              (selectedChat.isGroupChat
                ? selectedChat.chatName
                : getSender(user, selectedChat.users))}
          </Typography>
        </Box>
        {selectedChat &&
          (selectedChat.isGroupChat ? (
            <UpdateGroupChat
              fetchAgain={fetchAgain}
              setFetchAgain={setFetchAgain}
              fetchMessages={fetchMessages}
            />
          ) : (
            <ProfileModal user={getSenderAll(user, selectedChat.users)}>
              <Button
                size="small"
                variant="contained"
                color="primary"
                sx={{
                  fontSize: "18px",
                  width: "40px",
                  minWidth: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  textTransform: "none",
                }}
              >
                <i className="fa-solid fa-eye"></i>
              </Button>
            </ProfileModal>
          ))}
      </Box>
      <Box
        sx={{
          bgcolor: "grey.300",
          height: "100%",
          borderRadius: "10px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <CircularProgress size={70} />
          </Box>
        ) : (
          <>
            <ScrollableChat messages={messages} />

            <Box
              sx={{
                height: "55px",
                display: "flex",
                alignItems: "center",
                p: 1,
                gap: 1,
              }}
              style={{
                position: "relative",
              }}
            >
              {isTyping && (
                <div style={{ position: "absolute", top: "-18px" }}>
                  <Lottie
                    options={defaultOptions}
                    width={40}
                    style={{ margin: 0 }}
                  />
                </div>
              )}
              {/* {typing &&<div>loading2...</div>} */}

              <TextField
                fullWidth
                size="small"
                placeholder="write message..."
                sx={{
                  bgcolor: "white",
                  borderRadius: "20px",
                  "& fieldset": { border: "none" },
                }}
                onChange={typingHandler}
                value={newMessage}
                onKeyDown={sendMessage}
                />
              <IconButton
                color="primary"
                onClick={sendMessage}

                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  fontSize: "18px",
                  p: "12px",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                <i className="fa-solid fa-paper-plane"></i>
              </IconButton>
            </Box>
          </>
        )}
      </Box>
    </>
  );
};
export default SingleChat;
