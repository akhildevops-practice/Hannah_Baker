import React from "react";
import { screen, render, fireEvent } from "@testing-library/react";
import LocAdminForm from "../../../components/LocAdminForm";
import { theme } from "../../../theme/index";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import { RecoilRoot } from "recoil";
import { SnackbarProvider } from "notistack";
import axios from "../../../apis/axios.global";

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

const mockFunction = jest.fn();

const mockInitVal = {
  firstName: "Random",
  lastName: "Name",
  username: "username",
  email: "email",
};

describe("<LocAdminForm /> component tests -> ", () => {
  test("should render <LocAdminForm /> component", () => {
    const mockGet = jest.spyOn(mockAxios, "get");
    mockAxios.get.mockResolvedValueOnce({
      data: {
        firstName: "firstname",
        lastName: "lastname",
        username: "username",
        email: "email",
        id: "id",
        kc_id: "kc_id",
      },
    });
    const { container } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <RecoilRoot>
            <LocAdminForm
              initVal={mockInitVal}
              handleDiscard={mockFunction}
              handleSubmit={mockFunction}
              isLoading={false}
            />
          </RecoilRoot>
        </ThemeProvider>
      </SnackbarProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should invoke a click handler function after clicking the custom button", () => {
    const { container } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <RecoilRoot>
            <LocAdminForm
              initVal={mockInitVal}
              handleDiscard={mockFunction}
              handleSubmit={mockFunction}
              isLoading={false}
            />
          </RecoilRoot>
        </ThemeProvider>
      </SnackbarProvider>
    );
    let customButton: any = screen.queryByTestId("custom-button");
    fireEvent.click(customButton);
  });

  test("should invoke the submit handler function when edit is true", () => {
    const { container } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <RecoilRoot>
            <LocAdminForm
              initVal={mockInitVal}
              handleDiscard={mockFunction}
              handleSubmit={mockFunction}
              isLoading={false}
              isEdit={true}
            />
          </RecoilRoot>
        </ThemeProvider>
      </SnackbarProvider>
    );
    let customButton: any = screen.queryByTestId("custom-button");
    fireEvent.click(customButton);
  });
});
