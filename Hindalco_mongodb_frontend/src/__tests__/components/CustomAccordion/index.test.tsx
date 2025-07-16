import React from "react";
import ComponentGenerator from "../../../components/ComponentGenerator";
import { screen, render, fireEvent, getByText, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { theme } from "../../../theme/index";
import { ComponentType } from "../../../utils/enums";
import CustomAccordion from "../../../components/CustomAccordion";

let clickSpy: () => void;
beforeAll(() => {
  clickSpy = jest.fn();
});

describe("<CustomAccordion /> tests -> ", () => {
  test("should display <CustomAccordion /> component", () => {
    const { container } = render(   
      <ThemeProvider theme={theme}>
      <RecoilRoot>
      <CustomAccordion name="Random Accordion" panel='panel1' expanded={false} handleChange={clickSpy}>
        <div>Accordion Forms</div>
      </CustomAccordion>
      </RecoilRoot>
      </ThemeProvider>
      );
    expect(container).toBeInTheDocument();
  });

  test("should display <CustomAccordion /> component when change handler is false", () => {
    const { container } = render(   
        <ThemeProvider theme={theme}>
        <RecoilRoot>
        <CustomAccordion name="Random Accordion" panel='panel1' changeHandler={false} expanded={false} handleChange={clickSpy}>
          <div>Accordion Forms</div>
        </CustomAccordion>
        </RecoilRoot>
        </ThemeProvider>
        );
      expect(container).toBeInTheDocument();
  })
});
