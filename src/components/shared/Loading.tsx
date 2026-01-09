import { CircularProgress } from "@mui/material";

interface LoadingProps {
  height?: string | number;
  width?: string | number;
}

function Loading({ height, width }: LoadingProps) {
  return <CircularProgress color="primary" size={width ?? height ?? "1em"} />;
}

export default Loading;
