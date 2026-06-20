import { useState } from "react";
import { Box } from "@chakra-ui/layout";
import { ChatState } from "../context/chatProvider";

import SideDrawer from "../components/miscellaneous/SideDrawer.js";
import MyChats from "../components/MyChats.js";
import ChatBox from "../components/ChatBox.js";

const ChatPage = () => {
  const { user } = ChatState();
  const [fetchAgain,setFetchAgain] = useState(false);

  return (
    // <div style={{ width: "100%",display:"flex",flexDirection:"column",height:"100vh" }}>
    //   {user && <SideDrawer />}
    //   <Box d="flex" justifyContent="space-between" w="100%" sx={{flex: "1"}} p="10px">
    //     {user && <MyChats fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
    //     {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
    //   </Box>
    // </div>
    <div style={{ width: "100%", display:"flex", flexDirection:"column", height:"100vh" }}>
  {user && <SideDrawer />}

  <Box 
    sx={{ 
      flex: "1 1 auto",   // يتمدد ليأخذ كل الباقي
      minHeight: 0,       // مهم لتجنّب مشاكل الـ scroll
      display: "flex", 
      justifyContent: "space-between", 
      width: "100%", 
      p: "10px" 
    }}
  >
    {user && <MyChats fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
    {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
  </Box>
</div>

  );
};

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { ChatState } from "../context/ChatProvider";

// const ChatPage = () => {
//   const {user} = ChatState();
//   const [chats, setChats] = useState(["eee", "eee", "eee"]);

//   return (
//     <div className="chat-page">
//       <div className="chat-header">
//         <h2>Chats</h2>
//       </div>
//       <div className="chat-info">
//         <div className="chat-list">
//         <div className="chat-list-header">
//           My Chats <button>New Group Chat +</button>
//       </div>
//         <div className="chats">
//           {chats.map((chat) => {
//             return (
//               <div key={chat} className="chat-item">
//                 <h3>{chat}</h3>
//               </div>
//             );
//           })}
//           </div>
//         </div>
//         <div className="chat-view"></div>
//       </div>
//     </div>
//   );
// };
export default ChatPage;
