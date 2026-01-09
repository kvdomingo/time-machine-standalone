import { createTheme, responsiveFontSizes } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontFamily: ['"Nunito"', "sans-serif"].join(", "),
  },
});

export default responsiveFontSizes(theme);
