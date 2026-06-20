import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { TextField } from "@mui/material";
import toast from "../../utils/toast.js";
import axios from "axios";
import { ChatState } from "../../context/chatProvider.js";
import ListItemButton from "@mui/material/ListItemButton";
import ListItem from "@mui/material/ListItem";
import UserListItem from "../UserAvatar/UserListItem.js";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import Chip from "@mui/material/Chip";

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

export const CreateGroupModal = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, chats, setChats } = ChatState();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleDeleteChip = (_id) => {
    // setSelectedUsers(selectedUsers.filter(user=>user._id!==_id))
    setSelectedUsers((prev) => prev.filter((user) => user._id !== _id));
    toast("User removed", "info");
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
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
      console.log("Search results2:", data[0]);
    } catch (error) {
      console.error("Error during search:", error);
      toast("An error occurred while searching", "error");
    }
  };
  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length === 0) {
      toast("Please fill all the feilds", "warning");
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setChats([data,...chats])
      handleClose();
      toast("new grup chat created", "success");
      
    } catch (error) { 
      toast("falled to created the grup: "+error, "error");
    }
  };
  const handleGroup = (userObj) => {
    if (selectedUsers.some((user) => user._id === userObj._id)) {
      toast("user alredy added", "warning");
      return;
    }
    setSelectedUsers([userObj, ...selectedUsers]);
  };

  return (
    <>
      <Button
        size="small"
        variant="contained"
        color="primary"
        sx={{ textTransform: "none", fontSize: "12px" }}
        onClick={handleOpen}
      >
        {children}
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle} >
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{ textAlign: "center" }}
          >
            Create Group Chat
          </Typography>{" "}
          <TextField
            placeholder="Group Name"
            fullWidth
            margin="normal"
            size="small"
            onChange={(e) => setGroupChatName(e.target.value)}
            value={groupChatName}
          ></TextField>
          <TextField
            placeholder="Add Users eg:jhone, jana"
            fullWidth
            //   margin="normal"
            size="small"
            onChange={(e) => handleSearch(e.target.value)}
            value={search}
          ></TextField>
          {/* grup users */}
          <Stack direction="row" sx={{ displat:"flex", flexWrap: "wrap",gap:"3px",mt:"3px"}}>
            {selectedUsers.map((userObj) => (
              <Chip
                label={userObj.name}
                key={userObj._id}
                color="secondary"
                size="small"
                onDelete={() => handleDeleteChip(userObj._id)}
              />
            ))}
          </Stack>
          {/* users list */}
          <List>
            {loading ? (
              <Stack spacing={1}>
                <Skeleton variant="rectangular" width="100%" height={47} />
                <Skeleton variant="rectangular" width="100%" height={47} />
                <Skeleton variant="rectangular" width="100%" height={47} />
              </Stack>
            ) : searchResult.length === 0 ? (
              <Typography>No users found</Typography>
            ) : (
              searchResult.map((userObj) => (
                <ListItem key={userObj._id} disablePadding>
                  <ListItemButton
                    style={{ padding: "4px" }}
                    onClick={() => handleGroup(userObj)}
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
            color="primary"
            sx={{
              textTransform: "none",
              fontSize: "12px",
              mt: "10px",
            }}
            onClick={handleSubmit}
          >
            Create Group
          </Button>
        </Box>
      </Modal>
    </>
  );
};
