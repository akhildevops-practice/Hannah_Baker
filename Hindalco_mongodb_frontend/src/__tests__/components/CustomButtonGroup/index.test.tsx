import React from "react";
// import ComponentGenerator from "../../../components/ComponentGenerator";
import CustomButtonGroup from "../../../components/CustomButtonGroup";
import {
  screen,
  render,
  fireEvent,
  getByText,
  waitFor,
} from "@testing-library/react";
import { ThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { theme } from "../../../theme/index";
import { ComponentType } from "../../../utils/enums";

let clickSpy: () => void;
beforeAll(() => {
  clickSpy = jest.fn();
});

describe("<CustomButtonGroup /> tests -> ", () => {
  test("should display <CustomButtonGroup /> component", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <CustomButtonGroup
            options={["Option One", "Option Two"]}
            handleSubmit={clickSpy}
            disableBtnFor={[]}
          />
        </RecoilRoot>
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should display the dropdown menu when the dropdown button is clicked", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <CustomButtonGroup
            options={["Option One", "Option Two"]}
            handleSubmit={clickSpy}
            disableBtnFor={[]}
          />
        </RecoilRoot>
      </ThemeProvider>
    );
    const dropDownButton: any = screen.queryByTestId("button-group-dropdown");
    fireEvent.click(dropDownButton);
    const menuItem: any = screen.queryByText(/option two/i);
    fireEvent.click(menuItem);
    expect(clickSpy).toBeCalled();
  });
});
