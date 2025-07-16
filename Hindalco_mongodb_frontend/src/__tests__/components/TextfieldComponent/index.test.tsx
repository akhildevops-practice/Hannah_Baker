

import CustomMobileViewAppBar from "../../../components/CustomMobileViewAppBar";
import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import { theme } from "../../../theme";
import { ThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import {SnackbarProvider} from "notistack";
import setToken from "../../../utils/setToken";
import axios from "../../../apis/axios.global";
import { BrowserRouter as Router } from "react-router-dom";
import TextFieldComponent from "../../../components/TextfieldComponent";


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

describe("<TextfieldComponent /> tests -> ", () => {
  test("should render <TextfieldComponent /> component", () => {
    const { container } = render(
      <SnackbarProvider>
      <RecoilRoot>
        <ThemeProvider theme={theme}>
        <TextFieldComponent
label="Section Title"
type="text"
name="title"
value={''}
onChange={clickSpy}
autoFocus={true}
/>
        </ThemeProvider>
      </RecoilRoot>
      </SnackbarProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should invoke handle change function when textfield value changes", () => {
    const { container } = render(
        <SnackbarProvider>
        <RecoilRoot>
          <ThemeProvider theme={theme}>
          <TextFieldComponent
  label="Section Title"
  type="text"
  name="title"
  value={''}
  onChange={clickSpy}
  autoFocus={true}
  />
          </ThemeProvider>
        </RecoilRoot>
        </SnackbarProvider>
      );
      const textfieldComponent: any = screen.queryByTestId("textfield-component");
      fireEvent.change(textfieldComponent, {target: {value: "random shit"}}) 
      expect(container).toBeInTheDocument();
  })

});
