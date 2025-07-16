import { ReactNode } from "react";
import MobileTopBarNavLinks from "../../../components/MobileTopBarNavLinks";
import { render } from "@testing-library/react";
import { theme } from "../../../theme/index";
import { ThemeProvider } from "@material-ui/core";
import { BrowserRouter as Router } from "react-router-dom";
import {RecoilRoot} from "recoil";

let handleDrawerCloseSpy = jest.fn();

describe("<MobileTopBarNavLinks /> component tests -> ", () => {
  jest.mock("react-router-dom", () => ({
    ...(jest.requireActual("react-router-dom") as any),
    useHref: () => "abc",
    BrowserRouter: ({ children }: { children: ReactNode }) => <>{children}</>,
    Route: ({ children }: { children: ReactNode }) => <>{children}</>,
  }));
  test("should render <MobileTopBarNavLinks /> component", () => {
    const { container } = render(
      <RecoilRoot>
      <ThemeProvider theme={theme}>
        <Router>
          <MobileTopBarNavLinks
            handleLogout={jest.fn()}
            handleDrawerClose={handleDrawerCloseSpy}
          />
        </Router>
      </ThemeProvider>
      </RecoilRoot>
    );
    expect(container).toBeInTheDocument();
  });
});
