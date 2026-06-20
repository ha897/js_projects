import { useState } from "react";
import DrawerSearch from "../DrawerSearch.js";
import {
  Box,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  Avatar,
  Button,
  Divider,
  IconButton,
} from "@mui/material";
import ProfileModal from "./ProfileModal";
import { ChatState } from "../../context/chatProvider";
import { useNavigate } from "react-router-dom";
import Badge from "@mui/material/Badge";
import { getSender } from "../../config/ChatLogics";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();
  const navigate = useNavigate();

  // لإدارة القوائم المنسدلة
  const [anchorElBell, setAnchorElBell] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenBell = (event) => setAnchorElBell(event.currentTarget);
  const handleCloseBell = () => setAnchorElBell(null);
  const goToChat = (notf) => {
    setSelectedChat(notf.chat)
setNotification((prev) => prev.filter((n) => n._id !== notf._id));
  setAnchorElBell(null)
  };

  const handleOpenUser = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUser = () => setAnchorElUser(null);
  const logoutHandler = () => {
    localStorage.removeItem("user-info");
    setSelectedChat(undefined);
    navigate("/");
  };
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      bgcolor="white"
      width="100%"
      p="5px 10px"
      border={1}
      borderColor="grey.300"
    >
      {/* زر البحث */}
      <Tooltip title="Search Users to chat" placement="bottom-end" arrow>
        {/* <Button
          variant="text"
          sx={{
            p: "10px",
            border: "none",
            boxShadow: "none",
            "&:focus": { boxShadow: "none" },
            "&:active": { boxShadow: "none" },
          }}> */}

        <DrawerSearch user={user}>
          <i className="fas fa-search"></i>
          <Typography sx={{ display: { xs: "none", md: "flex" }, px: 2 }}>
            Search User
          </Typography>
        </DrawerSearch>
        {/* </Button> */}
      </Tooltip>

      {/* العنوان */}
      <Typography variant="h4" fontFamily="Work Sans">
        Talk-A-Tive
      </Typography>

      <Box display="flex" alignItems="center">
        {/* زر الإشعارات */}
        <IconButton
          onClick={handleOpenBell}
          sx={{
            border: "none",
            boxShadow: "none",
            "&:focus": { boxShadow: "none" },
            "&:active": { boxShadow: "none" },
            mr: 1,
          }}
        >
          {notification.length > 0 ? (
            <Badge badgeContent={notification.length} color="primary">
              <i className="fa-solid fa-bell"></i>
            </Badge>
          ) : (
            <i className="fa-solid fa-bell"></i>
          )}
        </IconButton>

        <Menu
          anchorEl={anchorElBell}
          open={Boolean(anchorElBell)}
          onClose={handleCloseBell}
        >
          {notification.length > 0 ? (
            notification.map((notif) => (
              <MenuItem onClick={()=>goToChat(notif)}>
                {/* get sender */}
                new message in {notif.chat.isGroupChat ?notif.chat.chatName:getSender(user,notif.chat.users)}
              </MenuItem>
            ))
          ) : (
            <MenuItem onClick={handleCloseBell}>No Notifications</MenuItem>
          )}
        </Menu>

        {/* قائمة المستخدم */}
        <Button
          onClick={handleOpenUser}
          endIcon={<i className="fa-solid fa-chevron-down"></i>}
          sx={{
            border: "none",
            boxShadow: "none",
            "&:focus": { boxShadow: "none" },
            "&:active": { boxShadow: "none" },
            p: "4px",
          }}
        >
          <Avatar
            sx={{ width: 25, height: 25, cursor: "pointer" }}
            alt={user.name}
            src={user.pic}
          />
        </Button>

        <Menu
          anchorEl={anchorElUser}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUser}
        >
          <ProfileModal user={user}>
            <MenuItem>My Profile</MenuItem>
          </ProfileModal>
          <Divider />
          <MenuItem onClick={logoutHandler}>Logout</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default SideDrawer;
