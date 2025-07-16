import CreateOrgForm from "../../../components/CreateOrgForm";
import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { theme } from "../../../theme/index";
import { ThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { SnackbarProvider } from "notistack";
import axios from "../../../apis/axios.global";

const originalEnv = process.env

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

beforeEach(() => {
  process.env = {
    ...originalEnv,
    REDIRECT_URL: "REDIRECT_URL",
  };
});

describe("<CreateOrgForm /> component tests -> ", () => {
  test("should render <CreateOrgForm /> component", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <SnackbarProvider>
            <CreateOrgForm />
          </SnackbarProvider>
        </RecoilRoot>
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should invoke handleChange function when there is a change in textfield value", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <SnackbarProvider>
            <CreateOrgForm />
          </SnackbarProvider>
        </RecoilRoot>
      </ThemeProvider>
    );
    let organizationName: any = screen.queryByTestId("organization-name");
    fireEvent.change(organizationName, {
      target: { value: "Random Organization Name" },
    });
    expect(organizationName).toHaveValue("Random Organization Name");
  });

  test("should invoke handlechange function when there is a change in instance url field", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <SnackbarProvider>
            <CreateOrgForm />
          </SnackbarProvider>
        </RecoilRoot>
      </ThemeProvider>
    );
    let organizationName: any = screen.queryByTestId("organization-name");
    fireEvent.change(organizationName, {
      target: { value: "randomname" },
    });
    let instanceUrl: any = screen.queryByTestId("instance-url");
    expect(instanceUrl.value).toEqual(`https://randomname.undefined/`);
  });

  test("should invoke handlechange function when there is a change in select field", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <SnackbarProvider>
            <CreateOrgForm />
          </SnackbarProvider>
        </RecoilRoot>
      </ThemeProvider>
    );
    let principalGeographyParent: any = screen.queryByTestId(
      "principal-geography"
    );
    fireEvent.mouseDown(principalGeographyParent);
    waitFor(() => {
      let optionOne = screen.getByText(/india/i);
      fireEvent.click(optionOne);
      waitFor(() => {
        expect(/india/i).toBeInTheDocument();
      });
    });
  });

  test("should invoke submit function when submit button is clicked", async () => {
    const mockPost = jest.spyOn(mockAxios, "post");
    mockAxios.post.mockResolvedValueOnce({
      data: {
        data: {},
      },
    });
    const { container, getByText, getByTestId, getByRole } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <SnackbarProvider>
            <CreateOrgForm />
          </SnackbarProvider>
        </RecoilRoot>
      </ThemeProvider>
    );
    let organizationName: any = screen.queryByTestId("organization-name");
    fireEvent.change(organizationName, { target: { value: "organization" } });
    let principalGeographyParent: any = getByRole("button", { name: /​/i });
    expect(principalGeographyParent).toBeInTheDocument();
    userEvent.click(principalGeographyParent);
    await waitFor(() => {
      expect(getByText(/india/i)).toBeInTheDocument();
      let optionOne: any = screen.getByText(/india/i);
      fireEvent.click(optionOne);
      waitFor(() => {
        expect(
          screen.getByRole("button", {
            name: /india/i,
          })
        ).toBeInTheDocument();
        let submitButton: any = screen.queryByTestId("custom-button");
        fireEvent.click(submitButton);
      });
    });
  });

  test("should invoke submit function when submit button is clicked and handle a failed request", () => {
    const mockPost = jest.spyOn(mockAxios, "post");
    mockAxios.post.mockRejectedValueOnce({
     response: {
      status: 409
     }
    });
    const { container, getByText, getByTestId, getByRole } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <SnackbarProvider>
            <CreateOrgForm />
          </SnackbarProvider>
        </RecoilRoot>
      </ThemeProvider>
    );
    let organizationName: any = screen.queryByTestId("organization-name");
    fireEvent.change(organizationName, { target: { value: "organization" } });
    let principalGeographyParent: any = getByRole("button", { name: /​/i });
    expect(principalGeographyParent).toBeInTheDocument();
    userEvent.click(principalGeographyParent);
    waitFor(() => {
      expect(getByText(/india/i)).toBeInTheDocument();
      let optionOne: any = screen.getByText(/india/i);
      fireEvent.click(optionOne);
      waitFor(() => {
        expect(
          screen.getByRole("button", {
            name: /india/i,
          })
        ).toBeInTheDocument();
        let submitButton: any = screen.queryByTestId("custom-button");
        fireEvent.click(submitButton);
      });
    });
  });
});
