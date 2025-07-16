import { render, screen } from "@testing-library/react";
import { theme } from "../../../theme/index";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import { RecoilRoot } from "recoil";
import { SnackbarProvider } from "notistack";
import { BrowserRouter as Router, useParams } from "react-router-dom";
import ReactRouter from "react-router";
import AuditInfoForm from "../../../components/AuditInfoForm";

const demoSystemTypes = [
  { id: "1", name: "System 1" },
  { id: "2", name: "System 2" },
  { id: "3", name: "System 3" },
];

const demoSubSystemTypes = [
  { id: "1", name: "SubSystem 1" },
  { id: "2", name: "SubSystem 2" },
  { id: "3", name: "SubSystem 3" },
];

jest.mock("react-router", () => ({
  ...(jest.requireActual("react-router") as any),
  useParams: () => {
    return {
      id: "4",
    };
  },
}));

describe("AuditInfoForm Render Test", () => {
  test("should render <AuditInfoForm/> component", () => {
    const { container } = render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <Router>
            <SnackbarProvider>
              <AuditInfoForm
                systemTypes={demoSystemTypes}
                subSystemTypes={demoSubSystemTypes}
                disabled={true}
              />
            </SnackbarProvider>
          </Router>
        </ThemeProvider>
      </RecoilRoot>
    );
    expect(container).toBeInTheDocument();
  });
});
