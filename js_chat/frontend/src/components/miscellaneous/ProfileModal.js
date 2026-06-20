import React, { useState } from "react";

import {
  Button,
  Dialog,
  Avatar,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";

const ProfileModal = ({ user, children }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      {/* <div> */}
        {children ? (
          <span onClick={handleClickOpen}>{children}</span>
        ) : (
          <i className="fa-solid fa-user"></i>
        )}
      {/* </div> */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle
          id="alert-dialog-title"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ width: "98%", textAlign: "center" }}>{user.name}</span>
          <Button
            onClick={handleClose}
            sx={{
              minWidth: 0,
              width: 20,
              height: 20,
              borderRadius: "50%",
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </Button>
        </DialogTitle>
        <DialogContent>
          {/* <DialogContentText id="alert-dialog-description">
            Let Google help apps determine location. This means sending
            anonymous location data to Google, even when no apps are running.
          </DialogContentText> */}
          {/* <span
            style={{
              display: "flex",
              justifyContent: "center",

              borderRadius: "50%",
              overflow: "hidden",
              margin: "auto",
              marginBottom: "25px",
            }}
          >
            <img src={user.pic} alt={user.name} />
          </span> */}
          <Avatar
            sx={{ width: "260px", height: "260px", cursor: "pointer",m:"auto",mb:"25px",fontSize:"150px" }}
            alt={user.name}
            src={user.pic}
          />
          <Typography variant="h6" fontFamily="Work Sans">
            Email: {user.email}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileModal;
