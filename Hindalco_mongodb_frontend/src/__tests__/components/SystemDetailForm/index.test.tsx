import React from "react";
import { screen, fireEvent, render } from "@testing-library/react";
import SystemDetailForm from "../../../components/MasterAddOrEditForm/SystemDetailForm";
import { RecoilRoot } from "recoil";
import { ThemeProvider } from "@material-ui/core";
import { theme } from "../../../theme/index";
import axios from "../../../apis/axios.global";
import { SnackbarProvider } from "notistack";

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

let handleDiscardSpy: any;
let handleSubmitSpy: any;

beforeAll(() => {
  handleDiscardSpy = jest.fn();
  handleSubmitSpy = jest.fn();
});

const mockFormData = {};
const mockSystemTypes: any = [
  {
    id: "123123",
    name: "System types",
  },
];

describe("<SystemDetailForm /> component tests -> ", () => {
  test("should render <SystemDetailForm /> component on the screen", () => {
    const mockGet = jest.spyOn(mockAxios, "get");
    mockAxios.get.mockResolvedValue({
      data: {},
    });
    const { container } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <RecoilRoot>
            <SystemDetailForm
              isEdit={false}
              initVal={mockFormData}
              handleDiscard={handleDiscardSpy}
              handleSubmit={handleSubmitSpy}
              isLoading={false}
              rerender={false}
              systemTypes={mockSystemTypes}
            />
          </RecoilRoot>
        </ThemeProvider>
      </SnackbarProvider>
    );
    expect(container).toBeInTheDocument();
  });
});
