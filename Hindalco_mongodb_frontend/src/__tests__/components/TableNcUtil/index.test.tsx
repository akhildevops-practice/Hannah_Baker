import { fireEvent, render } from "@testing-library/react";
import TableNcUtil from "../../../components/TableNcUtil";
import { BrowserRouter as Router } from "react-router-dom";
import setToken from "../../../utils/setToken";

describe("TableNcUtil Test", () => {
  it("should render TableNcUtil properly", () => {
    const { container } = render(
      <Router>
        <TableNcUtil id={1} count={10} isDraft={true} />
      </Router>
    );
  });

  it("should be clickable", () => {
    setToken(
      "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJyVFN1czhlUWJVS1NEY1Jld2ZSYUg1Ym50enZVLTZMOHZOMEtkS3BfTkZJIn0.eyJleHAiOjE2NjEzMjU0MjAsImlhdCI6MTY2MTMyNTEyMCwiYXV0aF90aW1lIjoxNjYxMzIyNDE0LCJqdGkiOiJmZmRhYjgyMS1hYTQ2LTQ4N2YtODgyYy1kMjM1NWI2MTNhMzUiLCJpc3MiOiJodHRwOi8vMTkyLjE2OC4yOS4xMjQ6ODA4MC9hdXRoL3JlYWxtcy9iZW5xIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImY3NmM0MjU5LTA3NTUtNDE4MC04YTc0LTRjYWRhNjE1YzQzNCIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFkbWluLWNsaSIsIm5vbmNlIjoiYTkwNGJhZDAtZWMzZS00NTRmLTlhY2YtMzhjYWQ2YTU4ZDBhIiwic2Vzc2lvbl9zdGF0ZSI6IjNhMzkxOTEzLTk0NzgtNDU1Yi1hNTM3LWM2OTZmMWMyZDBlNCIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cDovL2JlbnEubG9jYWxob3N0OjMwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtYmVucSIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJBVURJVE9SIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6IjNhMzkxOTEzLTk0NzgtNDU1Yi1hNTM3LWM2OTZmMWMyZDBlNCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6Ik1yaWR1bCBhdWRpdG9yIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYXVkaXRvciIsImdpdmVuX25hbWUiOiJNcmlkdWwiLCJmYW1pbHlfbmFtZSI6ImF1ZGl0b3IiLCJlbWFpbCI6Im1yaWR1bDEwMjRAZ21haWwuY29tIn0.EY5L8eTwFYs4hwsGp-7JgjIvcRC_P4s6K_N1WJONjIdkry5Wg9elhwjw4b1RjLOiRB4YlQbOag0PZiZA4FpLUKTiFuN2YIvuop6WTOsXur0mlFTN5GyITfT3zaJ1S4hGWJXT4LY7tbipNfzYyH1pOmclTB9FbiagW15gYturQ1QdZn3VXtxJmoH2YEFMVH_0A8AnNqxwLmE99onmPpFAxMrtAmyJ9melFy-nPi5t8zA_Q0Qfpd6fvXj2X5r1svR_dIa5kNpY_t78Aj_nVExCJt2WjngkTFnC1bGCndWhGOUd3Zho14B34xlUmEe5O1HsZUV-QnN4GNn8KENfPvP_9w"
    );
    const screen = render(
      <Router>
        <TableNcUtil id={1} count={10} isDraft={true} />
      </Router>
    );
    const underlineText = screen.getByTestId("click");
    fireEvent.click(underlineText);

    const iconButton = screen.getByTestId("auditorClick");
    fireEvent.click(iconButton);
  });
});
