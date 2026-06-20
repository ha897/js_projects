import MessageBubble from "./MessageBubble";
import GroupMessageBubble from "./GroupMessageBubble";
import { ChatState } from "../context/chatProvider";
import ScrollableFeed from "react-scrollable-feed";
import { isSameSender, isLastMessage } from "../config/ChatLogics";
import { Box } from "@mui/material";

const ScrollableChat = ({ messages }) => {
  const { user, selectedChat } = ChatState();
  return (
    <Box
      sx={{
        flex: 1,
        p: "5px",
        // overflowY: "auto",
        height: "calc(100% - 55px)",
        "& > *":{
                  height: "100% !important",
        }

      }}
      >
      <ScrollableFeed>
        {messages?.map((msg, i) =>
          selectedChat.isGroupChat ? (
            <GroupMessageBubble
              key={msg._id}
              text={msg.content}
              sender={msg.sender._id === user._id ? "me" : msg.sender}
              isSameSender={isSameSender(messages, i)}
              isLastMessage={isLastMessage(messages, i)}
              
            />
          ) : (
            <MessageBubble
              key={msg._id}
              text={msg.content}
              //  showProfile= isSameSender(messages, msg, i, user._id) isLastMessage(messages, i, user._id)
              sender={msg.sender._id === user._id ? "me" : "other"}
            />
          )
        )}
      </ScrollableFeed>
    </Box>
  );
};
export default ScrollableChat;
