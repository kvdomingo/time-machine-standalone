import { Grid, List, ListItem, Pagination } from "@mui/material";
import { getRouteApi } from "@tanstack/react-router";
import type { PaginatedResponse } from "@/api/types/checkIn.ts";
import type { Checkin } from "@/db-collections";
import CheckInAddEdit from "./CheckInAddEdit";
import CheckInItem from "./CheckInItem";

interface CheckInListProps {
  data: PaginatedResponse<Checkin[]>;
}

const Route = getRouteApi("/");

function CheckInList({ data }: CheckInListProps) {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  async function handlePageChange(page: number) {
    await navigate({ to: "/", search: { ...search, page } });
  }

  return (
    <>
      <List
        sx={{
          "& li": {
            border: "1px solid #DDD",
          },
          "& li:first-child": {
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
          },
          "& li:last-child": {
            borderBottomLeftRadius: "10px",
            borderBottomRightRadius: "10px",
          },
        }}
      >
        <ListItem>
          <CheckInAddEdit />
        </ListItem>
        {data.count > 0 ? (
          data.results.map((c) => <CheckInItem checkIn={c} key={c.id} />)
        ) : (
          <ListItem sx={{ color: "text.secondary" }}>
            No check ins within the selected time period
          </ListItem>
        )}
      </List>
      <Grid container justifyContent="center">
        <Pagination
          count={Math.ceil(data.count / 10)}
          page={search.page}
          onChange={(_, page) => handlePageChange(page)}
        />
      </Grid>
    </>
  );
}

export default CheckInList;
