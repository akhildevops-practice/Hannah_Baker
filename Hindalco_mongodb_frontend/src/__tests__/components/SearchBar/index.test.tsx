import { ReactNode } from "react";
import SearchBar from "../../../components/SearchBar/index";
import { screen, render, fireEvent } from "@testing-library/react";
import Settings from "../../../pages/Settings/index";
import { SnackbarProvider } from "notistack";
import { BrowserRouter as Router } from "react-router-dom";
import { theme } from "../../../theme/index";
import { ThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";

const mockUseNavigate: any = jest.fn();
const functionSpy = jest.fn();

jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockUseNavigate,
  useHref: () => "abc",
  BrowserRouter: ({ children }: { children: ReactNode }) => <>{children}</>,
  Route: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const dummyValue = {
  search: "search-value",
};

describe("<SearchBar /> component tests -> ", () => {
  test("should render <SearchBar /> component ", () => {
    const { container } = render(
      <SearchBar
        handleChange={functionSpy}
        placeholder="search"
        name="search"
        values={dummyValue}
        handleApply={jest.fn()}
      />
    );
    expect(container).toBeInTheDocument();
  });

  test("should invoke onSubmit when search field value changes and enter key is pressed", async () => {
    sessionStorage.setItem(
      "kc_token",
      "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJlQjVlLTdpQkxoN1pCcF9rdTJoZXFLcDBMT3JmOWNScF9mWHE1RjdsaVNBIn0.eyJleHAiOjE2NDgwNTI0NTQsImlhdCI6MTY0ODAxNjQ1NCwianRpIjoiYmJkNzAzMzEtZTE2Zi00ZGI2LWFkYzAtOWU1NzJmZGMxYzhjIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMjkuOTE6ODA4MC9hdXRoL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOlsiYXNkZmFzZGYtcmVhbG0iLCJ0eHhzeHNzZHhwLXJlYWxtIiwiaGVsbG8tcmVhbG0iLCJ0eHhzc3NkeHAtcmVhbG0iLCJ0eGR4cC1yZWFsbSIsIm1hc3Rlci1yZWFsbSIsImhlbGxmZHNkZG9vc2Zmc3h4c3Nzc3hzby1yZWFsbSIsImhlbGxmZHNkZG9vc3N4eHhzby1yZWFsbSIsInZsY2MtcmVhbG0iLCJ0eHhzZHhzc2R4cC1yZWFsbSIsInNhbXBsZS1yZWFsbSIsImhlbGxmZG9veHh4by1yZWFsbSIsInR4eHNzc2R4eHNzZHhzcC1yZWFsbSIsImhlbGxmZHNkZG9vc3N4eHNzeHNvLXJlYWxtIiwid2Rzcy1yZWFsbSIsInR4eHNzc3NzY3NzZHh4eHNhenNkeGpzcC1yZWFsbSIsImhlbGxvb28tcmVhbG0iLCJ0eHhzY3NzZHh4c3NkeHNwLXJlYWxtIiwiaGVsbG9veHh4by1yZWFsbSIsImhlbGxmZHNkZG9veHh4c28tcmVhbG0iLCJ0eHhzc2R4c3NkeHAtcmVhbG0iLCJoZWxsZmRkZHNkZG9vc2Z4eGNmc2Rkc3NzeHhzc3NzeHNvLXJlYWxtIiwidHh4c3Nzc3Njc3NkeHN4eHNhenNkeGpzcC1yZWFsbSIsImxlbm92by1yZWFsbSIsInJhbmRvbW9yZy1yZWFsbSIsInR4eHNzc2R4eHNzZHhwLXJlYWxtIiwid2RzZHNzLXJlYWxtIiwid2Rzc3MtcmVhbG0iLCJ3ZHMtcmVhbG0iLCJsaW1lcm9hZC1yZWFsbSIsInR4c2R4cC1yZWFsbSIsIm5ld29yZy1yZWFsbSIsImhlbGxmZHNkZG9vc2Zmc2RkeHhzc3NzeHNvLXJlYWxtIiwiYW5vdGhlcm9yZ2FuaXphdGlvbm5hbWUtcmVhbG0iLCJoZWxsZmRzZGRvb3NmZnN4eHNzeHNvLXJlYWxtIiwid2RzZHNkZGRzLXJlYWxtIiwiaGVsbGZkb294eHhzby1yZWFsbSIsIndkLXJlYWxtIiwibmVsbC1yZWFsbSIsInR4ZHAtcmVhbG0iLCJ0eHNzZHhwLXJlYWxtIiwiaGVsbGZkc2Rkb29zZmZzZGRzc3N4eHNzc3N4c28tcmVhbG0iLCI3dGhoZWF2ZW4tcmVhbG0iLCJoZWxsZmRzZGRvb3NmeHhjZnNkZHNzc3h4c3Nzc3hzby1yZWFsbSIsInR4eHNzc3NzY3NzZHh4eHNhc2R4anNwLXJlYWxtIiwic3RlZWxiaXJkLXJlYWxtIiwidHh4c3NkeHhzc2R4cC1yZWFsbSIsInRkcC1yZWFsbSIsIm9yZ2FuaXphdGlvbjItcmVhbG0iLCJ0cC1yZWFsbSJdLCJzdWIiOiJlZWZiNGFlNi03M2YyLTQ2ZTQtYThjOC0xYTZiOTBhNDY0M2EiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhZG1pbi1jbGkiLCJzZXNzaW9uX3N0YXRlIjoiNTVjMjg4ODUtNDdiZi00Zjk0LWJlYmItMzhhMGU3NGJkMTdkIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMDAvKiIsIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImNyZWF0ZS1yZWFsbSIsIm9mZmxpbmVfYWNjZXNzIiwiYWRtaW4iXX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCByb2xlcyIsInNpZCI6IjU1YzI4ODg1LTQ3YmYtNGY5NC1iZWJiLTM4YTBlNzRiZDE3ZCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6InByYW5pdHByYWthc2gyQGdtYWlsLmNvbSJ9.a4pCMbGGFE4NYKua6Px8JM3GzbA9ZZc2Fmy_nfd_O4JF9BDKaZ9pnatxAUzN4__r2uavFDOsYnDDYXutziKuCwfIxWMMc5DvP3poIeSF723H34Khljc-QV5-6ISQOvNtdDyJY1kR0Oytk-xw0FfgvoprZivc219APlDqH9Qu3UoO8oHDf87fiK4Vbek0JrpHUcW4FPOc3WiY4MOjL2a0elVsfn48yeX4S-KgHFyFRMOWFaPMMcfnu1l6rMQg2c2Ila6KtPDMv1uY8K1lfmPjouzqGQAVc-UCWphn0gZLVMDXH0Gp8fZJC8glvwX03Ys_ZBJKLaC7eijs0bgi3vPqPw"
    );
    let { container } = render(
      <SnackbarProvider>
        <RecoilRoot>
          <ThemeProvider theme={theme}>
            <Router>
              <Settings />
            </Router>
          </ThemeProvider>
        </RecoilRoot>
      </SnackbarProvider>
    );
    let fab: any = screen.queryByTestId("fab");
    fireEvent.click(fab);
    let searchField: any = screen.queryAllByTestId("search-field");
    fireEvent.change(searchField[0], { target: { value: "randomsearch" } });
    fireEvent.submit(searchField[0]);
  });
});
