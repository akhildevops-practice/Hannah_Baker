import React from "react";
import CheckBoxComponent from "../../../components/CheckBoxComponent";
import { screen, render, fireEvent, getByText, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { theme } from "../../../theme/index";

let clickSpy: () => void;
beforeAll(() => {
  clickSpy = jest.fn();
});

const mockRadioData = [
    {
        name: "yes",
        checked: false,
        value: 0
    },
    {
        name: "no",
        checked: false,
        value: 0
    },
    {
        name: "na",
        checked: false,
        value: 0
    }
]

describe("<CheckBoxComponent /> component tests -> ", () => {
  test("should display <CheckBoxComponent /> component", () => {
    const { container } = render(   
      <ThemeProvider theme={theme}>
      <RecoilRoot>
      <CheckBoxComponent
        data={mockRadioData}
        handler={clickSpy}
        disabled={false}
      />
      </RecoilRoot>
      </ThemeProvider>
      );
    expect(container).toBeInTheDocument();
  });
});
