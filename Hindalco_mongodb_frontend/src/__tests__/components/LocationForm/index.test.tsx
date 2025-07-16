import React from "react";
import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import LocationForm from "components/MasterAddOrEditForm/LocationForm";
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
        put: () => jest.fn(),
      };
    },
  };
});

export const locForm = {
  locationName: "",
  locationType: "",
  description: "",
  organization: "",
  businessType: [""],
  locationId: "",
  bu: "",
  id: "",
};

jest.mock("recoil", () => ({
  ...(jest.requireActual("recoil") as any),
  useRecoilState: () => [
    {
      locationName: "LocationName",
      locationType: "LocationType",
      description: "description",
      organization: "organization",
      businessType: ["bu", "bu"],
      locationId: "id",
      bu: "bu",
      id: "id",
    },
  ],
}));

const mockAxios = axios as jest.Mocked<typeof axios>;

describe("<LocationForm /> component tests ->", () => {
  test("should render <LocationForm /> component", () => {
    const mockPost = jest.spyOn(mockAxios, "get");
    mockAxios.get.mockResolvedValueOnce({
      data: {
        something: "intheway",
      },
    });

    const { container } = render(
      <SnackbarProvider>
        <RecoilRoot>
          <ThemeProvider theme={theme}>
            <LocationForm isEdit={false} disableFormFields={false} />
          </ThemeProvider>
        </RecoilRoot>
      </SnackbarProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should invoke submit handler on button click", () => {
    const mockPost = jest.spyOn(mockAxios, "get");
    mockAxios.get.mockResolvedValueOnce({
      data: {
        something: "intheway",
      },
    });

    const { container } = render(
      <SnackbarProvider>
        <RecoilRoot>
          <ThemeProvider theme={theme}>
            <LocationForm isEdit={false} disableFormFields={false} />
          </ThemeProvider>
        </RecoilRoot>
      </SnackbarProvider>
    );

    waitFor(() => {
      expect(container).toBeInTheDocument();
      let submitButton: any = screen.queryByTestId("custom-button");
      fireEvent.click(submitButton);
    });
  });

  test("should invoke submit handler function when edit state is true", () => {
    const mockGet = jest.spyOn(mockAxios, "get");
    mockAxios.get.mockResolvedValue({
      something: "intheway",
    });
    const mockPut = jest.spyOn(mockAxios, "put");
    mockAxios.put.mockResolvedValueOnce({
      data: {
        something: "intheway",
      },
    });

    const { container } = render(
      <SnackbarProvider>
        <RecoilRoot>
          <ThemeProvider theme={theme}>
            <LocationForm isEdit={true} disableFormFields={false} />
          </ThemeProvider>
        </RecoilRoot>
      </SnackbarProvider>
    );

    waitFor(() => {
      let submitButton: any = screen.queryByTestId("custom-button");
    });
  });
});
