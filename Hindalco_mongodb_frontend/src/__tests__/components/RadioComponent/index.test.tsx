import React from "react";
import RadioComponent from "../../../components/RadioComponent";
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


describe("<RadioComponent /> component tests -> ", () => {
  test("should display <RadioComponent /> component", () => {
    const { container } = render(   
      <ThemeProvider theme={theme}>
      <RecoilRoot>
      <RadioComponent
        handler={clickSpy}
        data={mockRadioData}
        disabled={false}
      />
      </RecoilRoot>
      </ThemeProvider>
      );
    expect(container).toBeInTheDocument();
  });
});
