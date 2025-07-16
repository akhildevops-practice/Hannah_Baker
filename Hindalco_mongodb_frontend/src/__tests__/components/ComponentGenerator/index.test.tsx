import React from "react";
import ComponentGenerator from "../../../components/ComponentGenerator";
import { screen, render, fireEvent, getByText, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { theme } from "../../../theme/index";
import { ComponentType } from "../../../utils/enums";

let clickSpy: () => void;
beforeAll(() => {
  clickSpy = jest.fn();
});

describe("<ComponentGenerator /> tests -> ", () => {
  test("should display <ComponentGenerator /> component", () => {
    const { container } = render(   
      <ThemeProvider theme={theme}>
      <RecoilRoot>
      <ComponentGenerator
                      disabled={false}
                      type={ComponentType.NUMERIC}
                      handler={clickSpy}
                      numericData={4}
                    />
      </RecoilRoot>
      </ThemeProvider>
      );
    expect(container).toBeInTheDocument();
  });
});
