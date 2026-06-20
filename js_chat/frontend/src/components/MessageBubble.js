import { Box, Paper, Typography } from "@mui/material";

const MessageBubble = ({ text, sender }) => {
  const isMe = sender === "me";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isMe ? "flex-end" : "flex-start", //rhight or left alignment based on sender
        mb: 1,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          maxWidth: "70%",
          px: 1.5,
          py: 1,
          bgcolor: isMe ? "#4a90e2" : "#f0f0f0",
          color: isMe ? "white" : "black",
          borderRadius: "15px",
          borderTopRightRadius: isMe ? "0px" : "15px",
          borderTopLeftRadius: isMe ? "15px" : "0px",
        }}
      >
        <Typography variant="body1">{text}</Typography>
      </Paper>
    </Box>
  );
};
export default MessageBubble;