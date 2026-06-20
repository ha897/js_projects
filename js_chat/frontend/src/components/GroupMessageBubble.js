import { Box, Paper, Typography, Avatar } from "@mui/material";
import Tooltip from '@mui/material/Tooltip';

const GroupMessageBubble = ({ 
  text, 
  sender, 
  messages, 
  currentIndex, 
  currentUserId,
  isSameSender: propIsSameSender, // للحالات التي تمرر القيم مباشرة
  isLastMessage: propIsLastMessage // للحالات التي تمرر القيم مباشرة
}) => {
  
  // استخدام الدوال المحسنة أو القيم الممررة مباشرة
  const isSameSender = propIsSameSender !== undefined 
    ? propIsSameSender 
    : (messages && currentIndex !== undefined) 
      ? isSameSenderAdvanced(messages, currentIndex, currentUserId ? [currentUserId] : [])
      : false;
      
  const isLastMessage = propIsLastMessage !== undefined 
    ? propIsLastMessage 
    : (messages && currentIndex !== undefined) 
      ? isLastMessageExcluding(messages, currentIndex, currentUserId ? [currentUserId] : [])
      : false;
  
  // تحديد ما إذا كان يجب إظهار صورة المرسل
  const showProfile = !isSameSender || isLastMessage;
  
  // تحديد ما إذا كانت الرسالة من المستخدم الحالي
  const isMe = currentUserId ? sender._id === currentUserId : sender === "me";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isMe ? "flex-end" : "flex-start",
        alignItems: "center",
        // إضافة هامش يسار للرسائل من الآخرين عندما لا نعرض الصورة
        ml: !isMe && !showProfile ? "40px" : "0px", // 50px = عرض الأفاتار + هامش
        mr: isMe && isSameSender ? "0px" : "0px",
        // تقليل المسافة بين الرسائل المتتالية من نفس المرسل
        mb: isSameSender && !isLastMessage ? "3px" : "16px",
      }}
    >
      {/* عرض أفاتار المرسل للرسائل من الآخرين فقط */}
      {!isMe && showProfile && (
        <Tooltip title={sender.name} arrarrow placement="bottom-start">
          <span>
        <Avatar
          sx={{ 
            width: 32, 
            height: 32, 
            cursor: "pointer",
            mr: 1, // هامش يمين للأفاتار
            alignSelf: "flex-end" // محاذاة الأفاتار مع أسفل الرسالة
          }}
          alt={sender.name || sender}
          src={sender.pic}
        >
          {/* إظهار الحرف الأول من الاسم إذا لم توجد صورة */}
          {!sender.pic && (sender.name || sender).charAt(0).toUpperCase()}
        </Avatar>
          </span>
          </Tooltip>
      )}

      <Paper
        elevation={2}
        sx={{
          maxWidth: "70%",
          px: 2,
          py: 1.5,
          bgcolor: isMe ? "#4a90e2" : "#f5f5f5",
          color: isMe ? "white" : "#333",
          borderRadius: "16px",
          
          // تخصيص الزوايا حسب موقع الرسالة والمرسل
          ...(isMe ? {
            // رسائل المستخدم الحالي (يمين)
            borderTopRightRadius: isSameSender ? "16px" : "4px",
            borderBottomRightRadius: (isSameSender && !isLastMessage) ? "16px" : "4px",
          } : {
            // رسائل الآخرين (يسار)
            borderTopLeftRadius: isSameSender ? "16px" : "4px", 
            borderBottomLeftRadius: (isSameSender && !isLastMessage) ? "16px" : "4px",
          }),
          
          // إضافة ظل خفيف
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Typography 
          variant="body1" 
          sx={{ 
            wordBreak: "break-word",
            lineHeight: 1.4 
          }}
        >
          {text}
        </Typography>
      </Paper>
    </Box>
  );
};

export default GroupMessageBubble;

// دوال مساعدة (يجب استيرادها من ملف منفصل)
const isSameSenderAdvanced = (messages, currentIndex, excludeUserIds = []) => {
  if (!messages || !Array.isArray(messages) || currentIndex < 0 || currentIndex >= messages.length) {
    return false;
  }
  
  if (currentIndex === messages.length - 1) {
    return false;
  }
  
  const currentMessage = messages[currentIndex];
  const nextMessage = messages[currentIndex + 1];
  
  if (!currentMessage?.sender || !nextMessage?.sender) {
    return false;
  }
  
  if (excludeUserIds.includes(currentMessage.sender._id)) {
    return false;
  }
  
  return currentMessage.sender._id === nextMessage.sender._id;
};

const isLastMessageExcluding = (messages, currentIndex, excludeUserIds = []) => {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return false;
  }
  
  if (currentIndex < 0 || currentIndex >= messages.length) {
    return false;
  }
  
  if (currentIndex !== messages.length - 1) {
    return false;
  }
  
  const lastMessage = messages[currentIndex];
  
  if (!lastMessage?.sender?._id) {
    return false;
  }
  
  return !excludeUserIds.includes(lastMessage.sender._id);
};