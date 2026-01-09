import { Box } from "@mui/material";

import Loading from "./Loading";

function FullPageLoading() {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Loading height="10vh" width="10vh" />
    </Box>
  );
}

export default FullPageLoading;
