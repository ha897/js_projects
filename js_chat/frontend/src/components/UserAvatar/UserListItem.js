import * as React from "react";
import { Avatar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
// import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
// import PlayArrowIcon from '@mui/icons-material/PlayArrow';
// import SkipNextIcon from '@mui/icons-material/SkipNext';

const UserListItem = ({ user }) => {
  const theme = useTheme();

  return (
    <Card sx={{ display: "flex", width: "100%" }}
    >
      <Avatar
        sx={{ width: 35, height: 35, cursor: "pointer", m: "6px 8px" }}
        alt={user.name}
        src={user.pic}
      />
      <Box
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        <CardContent
        style={{padding: "0px"}}
          sx={{
            flex: "1 0 auto",
            p: "4px",
            display: "flex",
            flexDirection: "column",

            justifyContent: "center",
            alignItems: "left",
          }}
        >
          <Typography component="div" variant="body2">
            {user.name}
          </Typography>

          <Typography
            variant="subtitle2"
            component="div"
            sx={{ color: "text.secondary" }}
          >
            {user.email}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
};
export default UserListItem;
