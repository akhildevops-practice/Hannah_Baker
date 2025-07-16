import React from "react";
import ChecklistForm from "../../../components/ChecklistForm";
import { fireEvent, screen, render } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import { ThemeProvider } from "@material-ui/core";
import { theme } from "../../../theme/index";

describe("<ChecklistForm /> component tests -> ", () => {
  test("should render <ChecklistForm /> component", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <ChecklistForm disabled={true} />
        </RecoilRoot>
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });
});
