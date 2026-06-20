import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import { Typography } from "@mui/material";
import ListItemButton from "@mui/material/ListItemButton";
import CircularProgress from "@mui/material/CircularProgress";
import ListItemText from "@mui/material/ListItemText";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import axios from "axios";
import UserListItem from "./UserAvatar/UserListItem.js";
import { ChatState } from "../context/chatProvider";

// import InboxIcon from '@mui/icons-material/MoveToInbox';
// import MailIcon from '@mui/icons-material/Mail';
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import toast from "../utils/toast.js";
// import top100Films from './top100Films';

export default function DrawerSearch({ user, children }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [searchResult, setSearchResult] = React.useState([]);
  const { chats, setChats, selectedChat, setSelectedChat } = ChatState();
  const [loading, setLoading] = React.useState(false);
  const handleSearch = async () => {
    if (search.trim() === "") {
      toast("Please enter a search term", "warning");
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `http://localhost:5000/api/user?search=${encodeURIComponent(search)}`,
        config
      );
      setLoading(false);
      setSearchResult(data);
      console.log("Search results3:", data[0]);
    } catch (error) {
      console.error("Error during search:", error);
      toast("An error occurred while searching", "error");
    }
  };
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const accessChat = async (userId) => {
    try {
      setLoading(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/chat",
        { userId },
        config
      );
      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      setLoading(false);
      // onClose();
    } catch (error) {
      console.error("Error accessing chat:", error);
    }
  };

  const DrawerList = (
    <Box sx={{ width: 300, p: "15px",height:"100%" ,display:"flex",flexDirection:"column" }} role="presentation">
      <List>
        <ListItem key={0} disablePadding>
          {/* <ListItemText primary= /> */}
          <Typography variant="h5" fontFamily="Work Sans">
            Searsh user
          </Typography>
        </ListItem>
        <ListItem key="Inbox" disablePadding>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="username or email..."
            sx={{ mr: "10px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="contained" onClick={handleSearch}>
            Go
          </Button>
        </ListItem>
      </List>
      <Divider />
      <Box sx={{ overflowY: "auto",flex: 1 }} role="presentation">
        <List>
          {loading ? (
            <Stack spacing={1}>
              <Skeleton variant="rectangular" width="100%" height={47} />
              <Skeleton variant="rectangular" width="100%" height={47} />
              <Skeleton variant="rectangular" width="100%" height={47} />
            </Stack>
          ) :
           searchResult.length === 0 ? (
            <Typography>No users found</Typography>
          ) : (
            searchResult.map((userObj) => (
              <ListItem key={userObj._id} disablePadding>
                <ListItemButton
                  style={{ padding: "4px" }}
                  onClick={() => accessChat(userObj._id)}
                >
                  <UserListItem user={userObj} />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </Box>
  );
  return (
    <div>
      <Button onClick={toggleDrawer(true)}>{children}</Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}
