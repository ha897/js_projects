import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { TextField } from "@mui/material";
import toast from "../../utils/toast.js";
import axios from "axios";
import ListItemButton from "@mui/material/ListItemButton";
import ListItem from "@mui/material/ListItem";
import UserListItem from "../UserAvatar/UserListItem.js";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import Chip from "@mui/material/Chip";
import { ChatState } from "../../context/chatProvider";
import CircularProgress from "@mui/material/CircularProgress";

const modalStyle = {
  width: {
    xs: "300px",
    sm: "500px",
  },
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  //   border: '2px solid #000',
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
};
const UpdateGroupChat = ({ fetchAgain, setFetchAgain, fetchMessages}) => {
  const [open, setOpen] = useState(false);
  //   const { user , selectedChat, setSelectedChat } = ChatState();
  const { user, chats, setChats, selectedChat, setSelectedChat } = ChatState();

  //   const [groupChatName, setGroupChatName] = useState(selectedChat.chatName);
  const [newGroupChatName, setNewGroupChatName] = useState(
    selectedChat.chatName
  );
  const [selectedUsers, setSelectedUsers] = useState(selectedChat.users);
  const [search, setSearch] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
//   const handleLeaveGroup =()=>{
//   user._id
// }
  const handleDeleteUser = async (_id) => {
    // groupremove
    if (selectedChat.groupAdmin._id !== user._id && _id !== user._id) {
  toast( "Only admins can remove someone!", "error");
  return;
}

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "http://localhost:5000/api/chat/groupremove",
        {
          chatId: selectedChat._id,
          userId: _id,
        },
        config
      );

      _id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages()
      // setLoading(false);

      console.log("data: ", data);
      // handleClose();
      toast("delete user", "success");
    } catch (error) {
      toast("falled to delete user: " + error, "error");
    }
    // setSelectedUsers(selectedUsers.filter(user=>user._id!==_id))
    setSelectedUsers((prev) => prev.filter((user) => user._id !== _id));
    toast("User removed", "info");
  };

  const handleSearch = async (query) => {
    // if(query===""){

    // }
    setSearch(query);
    if (!query) {
      return;
    }
    try {
      setSearchLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `http://localhost:5000/api/user?search=${encodeURIComponent(search)}`,
        config
      );
      setSearchLoading(false);
      setSearchResult(data);
      console.log("Search results1:", data[0]);
    } catch (error) {
      console.error("Error during search:", error);
      toast("An error occurred while searching", "error");
    }
  };
  const handleRename = async () => {
    if (!newGroupChatName) {
      return;
    }
    if (!selectedChat.chatName || selectedUsers.length === 0) {
      toast("Please fill all the feilds", "warning");
      return;
    }
    if (newGroupChatName === selectedChat.chatName) {
      toast("no changes in chatname", "warning");
      return;
    }
    try {
      setRenameLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      console.log("Chat id:", selectedChat._id);
      console.log("Renaming chat to:", newGroupChatName);
      const { data } = await axios.put(
        "http://localhost:5000/api/chat/rename",
        {
          chatId: selectedChat._id,
          chatName: newGroupChatName,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
      setChats(chats.map((chat) => (chat._id === data._id ? data : chat)));
      console.log("data: ", data);
      //   handleClose();
      toast("update group", "success");
    } catch (error) {
      toast("falled to update the group: " + error, "error");
      setRenameLoading(false);
    }
  };

  const handleAddUser = async (userObj) => {
    if (selectedUsers.some((user) => user._id === userObj._id)) {
      toast("user alredy added", "warning");
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      console.log("Chat id: ", selectedChat._id);
      console.log("user id: ", userObj._id);
      const { data } = await axios.put(
        "http://localhost:5000/api/chat/groupadd",
        {
          chatId: selectedChat._id,
          userId: userObj._id,
        },
        config
      );
      console.log("data: ", data);
      //   handleClose();
      toast("user added", "success");
      setSelectedUsers([userObj, ...selectedUsers]);
    } catch (error) {
      toast("falled to add user: " + error, "error");
    }
  };

  return (
    <>
      <Button
        size="small"
        variant="contained"
        color="primary"
        onClick={handleOpen}
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
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{ textAlign: "center" }}
          >
            Update Group Chat
          </Typography>{" "}
          {/* ///////////////////// */}
          <Stack
            direction="row"
            sx={{ displat: "flex", flexWrap: "wrap", gap: "3px", mt: "3px" }}
          >
            {selectedUsers.map((userObj) =>
              selectedChat.groupAdmin._id !== userObj._id &&
              selectedChat.groupAdmin._id === user._id ? (
                <Chip
                  label={userObj.name}
                  key={userObj._id}
                  color="secondary"
                  size="small"
                  onDelete={() => handleDeleteUser(userObj._id)}
                />
              ) : (
                <Chip
                  label={userObj.name}
                  key={userObj._id}
                  color="secondary"
                  size="small"
                />
              )
            )}
          </Stack>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <TextField
              placeholder="Group Name"
              fullWidth
              margin="normal"
              size="small"
              sx={{ my: "10px" }}
              onChange={(e) => setNewGroupChatName(e.target.value)}
              value={newGroupChatName}
            ></TextField>
            <Button
              size="large"
              variant="contained"
              disabled={renameLoading}
              color="primary"
              sx={{
                textTransform: "none",
                fontSize: "12px",
                height: "fit-content",
                my: "10px",
              }}
              onClick={handleRename}
            >
              {renameLoading && (
                <CircularProgress size="21px" sx={{ position: "absolute" }} />
              )}
              rename
            </Button>
          </Box>
          <TextField
            placeholder="Add Users eg:jhone, jana"
            fullWidth
            //   margin="normal"
            size="small"
            onChange={(e) => handleSearch(e.target.value)}
            value={search}
          ></TextField>
          {/* grup users */}
          {/* users list */}
          <List>
            {searchLoading ? (
              <Stack spacing={1}>
                <Skeleton variant="rectangular" width="100%" height={47} />
                <Skeleton variant="rectangular" width="100%" height={47} />
                <Skeleton variant="rectangular" width="100%" height={47} />
              </Stack>
            ) : search === "" ? null : searchResult.length === 0 ? (
              <Typography>No users found</Typography>
            ) : (
              searchResult.map((userObj) => (
                <ListItem key={userObj._id} disablePadding>
                  <ListItemButton
                    style={{ padding: "4px" }}
                    onClick={() => handleAddUser(userObj)}
                  >
                    <UserListItem user={userObj} />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
          <Button
            size="large"
            variant="contained"
            color="error"
            sx={{
              textTransform: "none",
              fontSize: "12px",
            }}
            onClick={()=>handleDeleteUser(user._id)}
          >
            Leave Group
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default UpdateGroupChat;
