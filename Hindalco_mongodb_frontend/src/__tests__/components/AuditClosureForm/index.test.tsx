import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { theme } from "../../../theme/index";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import { RecoilRoot } from "recoil";
import { SnackbarProvider } from "notistack";
import AuditClosureForm from "../../../components/AuditClosureForm";
import { BrowserRouter as Router } from "react-router-dom";

describe("AuditClosureForm Render Test", () => {
  test("should render <AuditClosureForm/> component", () => {
    const { container } = render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <Router>
            <SnackbarProvider>
              <AuditClosureForm disabled={false} />
            </SnackbarProvider>
          </Router>
        </ThemeProvider>
      </RecoilRoot>
    );
    expect(container).toBeInTheDocument();
  });
});
