import React from "react";
import { fireEvent, screen, render } from "@testing-library/react";
import DynamicFormComponent from "../../../components/DynamicFormComponent";
import { RecoilRoot } from "recoil";
import { theme } from "../../../theme/index";
import ThemeProvider from "@material-ui/styles/ThemeProvider";

describe("<DynamicFormComponent /> tests -> ", () => {
  test("should render <DynamicFormComponent /> ", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <DynamicFormComponent />
        </RecoilRoot>
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });
});
