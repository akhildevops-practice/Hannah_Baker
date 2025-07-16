import React from "react";
import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import ProcessDocForms from "../../../components/ProcessDocForms";
import { RecoilRoot } from "recoil";
import { ThemeProvider } from "@material-ui/core";
import { theme } from "../../../theme/index";
import { SnackbarProvider } from "notistack";

describe("<ProcessDocForms /> component tests -> ", () => {
  test("should display <ProcessDocForms /> on the screen", () => {
    const { container } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <RecoilRoot>
            <ProcessDocForms edit={false} />
          </RecoilRoot>
        </ThemeProvider>
      </SnackbarProvider>
    );
    expect(container).toBeInTheDocument();
  });
});
