import CustomMobileViewAppBar from "../../../components/CustomMobileViewAppBar";
import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import { theme } from "../../../theme";
import { ThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { SnackbarProvider } from "notistack";
import setToken from "../../../utils/setToken";
import axios from "../../../apis/axios.global";
import { BrowserRouter as Router } from "react-router-dom";

let clickSpy: () => void;
beforeAll(() => {
  clickSpy = jest.fn();
});

const dummyData: any = {
  open: false,
  handleDrawerClose: () => clickSpy(),
  handleDrawerOpen: () => clickSpy(),
};

jest.mock("axios", () => {
  return {
    create: () => {
      return {
        interceptors: {
          request: { eject: jest.fn(), use: jest.fn() },
          response: { eject: jest.fn(), use: jest.fn() },
        },
        get: () => jest.fn(),
        post: () => jest.fn(),
      };
    },
  };
});

const mockAxios = axios as jest.Mocked<typeof axios>;

describe("<CustomMobileViewAppBar /> tests -> ", () => {
  test("should render <CustomMobileViewAppBar /> component", () => {
    setToken(
      "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJyVFN1czhlUWJVS1NEY1Jld2ZSYUg1Ym50enZVLTZMOHZOMEtkS3BfTkZJIn0.eyJleHAiOjE2NjEzNDM0NDMsImlhdCI6MTY2MTM0MzE0MywiYXV0aF90aW1lIjoxNjYxMzQyNTQyLCJqdGkiOiJhYjViN2QzOC1hYzk1LTQwMjgtOWQwZi01ZTYxNmE2NTM3MGQiLCJpc3MiOiJodHRwOi8vMTkyLjE2OC4yOS4xMjQ6ODA4MC9hdXRoL3JlYWxtcy9iZW5xIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjMwMjBiNzBmLWRkMmUtNDllZi04YWM5LWYzYWUyM2MxMGZiMSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFkbWluLWNsaSIsIm5vbmNlIjoiN2IwOGVkZTctYTY4Mi00Y2U3LTlkMDctNjU5OTE1ZmRmMTVkIiwic2Vzc2lvbl9zdGF0ZSI6ImRmMTVjNDEzLTBkZDYtNGNiYS04MWE3LWZiNzUwOTc0ODJhNiIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cDovL2JlbnEubG9jYWxob3N0OjMwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtYmVucSIsIk9SRy1BRE1JTiIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIiwic2lkIjoiZGYxNWM0MTMtMGRkNi00Y2JhLTgxYTctZmI3NTA5NzQ4MmE2IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJNcmlkdWwgU2hhcm1hIiwicHJlZmVycmVkX3VzZXJuYW1lIjoib3JnYWRtaW4iLCJnaXZlbl9uYW1lIjoiTXJpZHVsIiwiZmFtaWx5X25hbWUiOiJTaGFybWEiLCJlbWFpbCI6Im1yaWR1bEB0ZWNodmFyaWFibGUuY29tIn0.R86XzI2yaOLjb-jVo4I4gLSac7vTtgEtTGhlka0TWhHdelxHEoTxTChPPS0g4OvRSfO4VBCWAZfX60bEw2zUHA1xOvk1eXjg9exPRPMAlH9QfsWVHkfLPgyt2X2ID2rzGBDOoysLtAYxtLVJt3IzreJO7-P0nDUy6LPnXIv3veyW8Byt5aMc279mm1DsF5qOsXXwHTTDiAOec7hOV5nij4aOfagMtHGo31kaQ-E1kUw5dPNoBSQ0Kf2bqM-ls1GlSKB802AKrUGuOj0YjvSj5xqh1rhB3fW0t0zrI_2AKZ5QXD7M3my8K93OeC0lhqztVCu8TviAEA11xym_g0dw-g"
    );
    const { container } = render(
      <SnackbarProvider>
        <RecoilRoot>
          <ThemeProvider theme={theme}>
            <CustomMobileViewAppBar
              handleLogout={clickSpy}
              open={dummyData.open}
              handleDrawerClose={dummyData.handleDrawerClose}
              handleDrawerOpen={dummyData.handleDrawerOpen}
            />
          </ThemeProvider>
        </RecoilRoot>
      </SnackbarProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should open drawer on button click", () => {
    setToken(
      "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJyVFN1czhlUWJVS1NEY1Jld2ZSYUg1Ym50enZVLTZMOHZOMEtkS3BfTkZJIn0.eyJleHAiOjE2NjEzNDM0NDMsImlhdCI6MTY2MTM0MzE0MywiYXV0aF90aW1lIjoxNjYxMzQyNTQyLCJqdGkiOiJhYjViN2QzOC1hYzk1LTQwMjgtOWQwZi01ZTYxNmE2NTM3MGQiLCJpc3MiOiJodHRwOi8vMTkyLjE2OC4yOS4xMjQ6ODA4MC9hdXRoL3JlYWxtcy9iZW5xIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjMwMjBiNzBmLWRkMmUtNDllZi04YWM5LWYzYWUyM2MxMGZiMSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFkbWluLWNsaSIsIm5vbmNlIjoiN2IwOGVkZTctYTY4Mi00Y2U3LTlkMDctNjU5OTE1ZmRmMTVkIiwic2Vzc2lvbl9zdGF0ZSI6ImRmMTVjNDEzLTBkZDYtNGNiYS04MWE3LWZiNzUwOTc0ODJhNiIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cDovL2JlbnEubG9jYWxob3N0OjMwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtYmVucSIsIk9SRy1BRE1JTiIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIiwic2lkIjoiZGYxNWM0MTMtMGRkNi00Y2JhLTgxYTctZmI3NTA5NzQ4MmE2IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJNcmlkdWwgU2hhcm1hIiwicHJlZmVycmVkX3VzZXJuYW1lIjoib3JnYWRtaW4iLCJnaXZlbl9uYW1lIjoiTXJpZHVsIiwiZmFtaWx5X25hbWUiOiJTaGFybWEiLCJlbWFpbCI6Im1yaWR1bEB0ZWNodmFyaWFibGUuY29tIn0.R86XzI2yaOLjb-jVo4I4gLSac7vTtgEtTGhlka0TWhHdelxHEoTxTChPPS0g4OvRSfO4VBCWAZfX60bEw2zUHA1xOvk1eXjg9exPRPMAlH9QfsWVHkfLPgyt2X2ID2rzGBDOoysLtAYxtLVJt3IzreJO7-P0nDUy6LPnXIv3veyW8Byt5aMc279mm1DsF5qOsXXwHTTDiAOec7hOV5nij4aOfagMtHGo31kaQ-E1kUw5dPNoBSQ0Kf2bqM-ls1GlSKB802AKrUGuOj0YjvSj5xqh1rhB3fW0t0zrI_2AKZ5QXD7M3my8K93OeC0lhqztVCu8TviAEA11xym_g0dw-g"
    );

    const { container } = render(
      <SnackbarProvider>
        <RecoilRoot>
          <ThemeProvider theme={theme}>
            <CustomMobileViewAppBar
              handleLogout={clickSpy}
              open={dummyData.open}
              handleDrawerClose={dummyData.handleDrawerClose}
              handleDrawerOpen={dummyData.handleDrawerOpen}
            />
          </ThemeProvider>
        </RecoilRoot>
      </SnackbarProvider>
    );
    let openButton: any = screen.queryByTestId("drawer-open-button");
    fireEvent.click(openButton);
    waitFor(() => {
      let drawerContainer: any = screen.queryByTestId("drawer-container");
      expect(drawerContainer).toBeInTheDocument();
    });
  });

  test("should close drawer on button click", () => {
    setToken(
      "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJyVFN1czhlUWJVS1NEY1Jld2ZSYUg1Ym50enZVLTZMOHZOMEtkS3BfTkZJIn0.eyJleHAiOjE2NjEzNDM0NDMsImlhdCI6MTY2MTM0MzE0MywiYXV0aF90aW1lIjoxNjYxMzQyNTQyLCJqdGkiOiJhYjViN2QzOC1hYzk1LTQwMjgtOWQwZi01ZTYxNmE2NTM3MGQiLCJpc3MiOiJodHRwOi8vMTkyLjE2OC4yOS4xMjQ6ODA4MC9hdXRoL3JlYWxtcy9iZW5xIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjMwMjBiNzBmLWRkMmUtNDllZi04YWM5LWYzYWUyM2MxMGZiMSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFkbWluLWNsaSIsIm5vbmNlIjoiN2IwOGVkZTctYTY4Mi00Y2U3LTlkMDctNjU5OTE1ZmRmMTVkIiwic2Vzc2lvbl9zdGF0ZSI6ImRmMTVjNDEzLTBkZDYtNGNiYS04MWE3LWZiNzUwOTc0ODJhNiIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cDovL2JlbnEubG9jYWxob3N0OjMwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtYmVucSIsIk9SRy1BRE1JTiIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIiwic2lkIjoiZGYxNWM0MTMtMGRkNi00Y2JhLTgxYTctZmI3NTA5NzQ4MmE2IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJNcmlkdWwgU2hhcm1hIiwicHJlZmVycmVkX3VzZXJuYW1lIjoib3JnYWRtaW4iLCJnaXZlbl9uYW1lIjoiTXJpZHVsIiwiZmFtaWx5X25hbWUiOiJTaGFybWEiLCJlbWFpbCI6Im1yaWR1bEB0ZWNodmFyaWFibGUuY29tIn0.R86XzI2yaOLjb-jVo4I4gLSac7vTtgEtTGhlka0TWhHdelxHEoTxTChPPS0g4OvRSfO4VBCWAZfX60bEw2zUHA1xOvk1eXjg9exPRPMAlH9QfsWVHkfLPgyt2X2ID2rzGBDOoysLtAYxtLVJt3IzreJO7-P0nDUy6LPnXIv3veyW8Byt5aMc279mm1DsF5qOsXXwHTTDiAOec7hOV5nij4aOfagMtHGo31kaQ-E1kUw5dPNoBSQ0Kf2bqM-ls1GlSKB802AKrUGuOj0YjvSj5xqh1rhB3fW0t0zrI_2AKZ5QXD7M3my8K93OeC0lhqztVCu8TviAEA11xym_g0dw-g"
    );

    const { container } = render(
      <SnackbarProvider>
        <RecoilRoot>
          <ThemeProvider theme={theme}>
            <CustomMobileViewAppBar
              handleLogout={clickSpy}
              open={dummyData.open}
              handleDrawerClose={dummyData.handleDrawerClose}
              handleDrawerOpen={dummyData.handleDrawerOpen}
            />
          </ThemeProvider>
        </RecoilRoot>
      </SnackbarProvider>
    );
    let openButton: any = screen.queryByTestId("drawer-open-button");
    fireEvent.click(openButton);
    waitFor(() => {
      let closeButton: any = screen.queryByTestId("drawer-close-button");
      fireEvent.click(closeButton);
      waitFor(() => {
        let drawerContainer: any = screen.queryByTestId("drawer-container");
        expect(drawerContainer).not.toBeInTheDocument();
      });
    });
  });

  test("should invoke the file upload function when a event change triggered in the file input", () => {
    const mockPost = jest.spyOn(mockAxios, "post");
    mockAxios.post.mockResolvedValueOnce({
      data: {},
      status: 201,
    });
    const mockGet = jest.spyOn(mockAxios, "get");
    mockAxios.get.mockResolvedValueOnce({
      data: {},
    });
    setToken(
      "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJyVFN1czhlUWJVS1NEY1Jld2ZSYUg1Ym50enZVLTZMOHZOMEtkS3BfTkZJIn0.eyJleHAiOjE2NjEzNDM0NDMsImlhdCI6MTY2MTM0MzE0MywiYXV0aF90aW1lIjoxNjYxMzQyNTQyLCJqdGkiOiJhYjViN2QzOC1hYzk1LTQwMjgtOWQwZi01ZTYxNmE2NTM3MGQiLCJpc3MiOiJodHRwOi8vMTkyLjE2OC4yOS4xMjQ6ODA4MC9hdXRoL3JlYWxtcy9iZW5xIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjMwMjBiNzBmLWRkMmUtNDllZi04YWM5LWYzYWUyM2MxMGZiMSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFkbWluLWNsaSIsIm5vbmNlIjoiN2IwOGVkZTctYTY4Mi00Y2U3LTlkMDctNjU5OTE1ZmRmMTVkIiwic2Vzc2lvbl9zdGF0ZSI6ImRmMTVjNDEzLTBkZDYtNGNiYS04MWE3LWZiNzUwOTc0ODJhNiIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cDovL2JlbnEubG9jYWxob3N0OjMwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtYmVucSIsIk9SRy1BRE1JTiIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIiwic2lkIjoiZGYxNWM0MTMtMGRkNi00Y2JhLTgxYTctZmI3NTA5NzQ4MmE2IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJNcmlkdWwgU2hhcm1hIiwicHJlZmVycmVkX3VzZXJuYW1lIjoib3JnYWRtaW4iLCJnaXZlbl9uYW1lIjoiTXJpZHVsIiwiZmFtaWx5X25hbWUiOiJTaGFybWEiLCJlbWFpbCI6Im1yaWR1bEB0ZWNodmFyaWFibGUuY29tIn0.R86XzI2yaOLjb-jVo4I4gLSac7vTtgEtTGhlka0TWhHdelxHEoTxTChPPS0g4OvRSfO4VBCWAZfX60bEw2zUHA1xOvk1eXjg9exPRPMAlH9QfsWVHkfLPgyt2X2ID2rzGBDOoysLtAYxtLVJt3IzreJO7-P0nDUy6LPnXIv3veyW8Byt5aMc279mm1DsF5qOsXXwHTTDiAOec7hOV5nij4aOfagMtHGo31kaQ-E1kUw5dPNoBSQ0Kf2bqM-ls1GlSKB802AKrUGuOj0YjvSj5xqh1rhB3fW0t0zrI_2AKZ5QXD7M3my8K93OeC0lhqztVCu8TviAEA11xym_g0dw-g"
    );
    const { container } = render(
      <Router>
        <SnackbarProvider>
          <RecoilRoot>
            <ThemeProvider theme={theme}>
              <CustomMobileViewAppBar
                handleLogout={clickSpy}
                open={true}
                handleDrawerClose={dummyData.handleDrawerClose}
                handleDrawerOpen={dummyData.handleDrawerOpen}
              />
            </ThemeProvider>
          </RecoilRoot>
        </SnackbarProvider>
      </Router>
    );

    const fileInput: any = screen.queryByTestId("file-input");
    fireEvent.change(fileInput, {
      target: {
        files: [new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" })],
      },
    });
    expect(mockPost).toBeCalledTimes(1);
    expect(mockGet).toBeCalledTimes(1);
  });
});
