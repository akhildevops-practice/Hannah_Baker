import { ReactNode } from "react";
import TopBarNavLinks from "../../../components/TopBarNavLinks";
import { render } from "@testing-library/react";
import { theme } from "../../../theme";
import { ThemeProvider } from "@material-ui/core";
import { BrowserRouter as Router } from "react-router-dom";
import { RecoilRoot } from "recoil";

let setOpenSpy: any = jest.fn();

describe("<TopBarNavLinks /> component tests -> ", () => {
  jest.mock("react-router-dom", () => ({
    ...(jest.requireActual("react-router-dom") as any),
    useHref: () => "abc",
    BrowserRouter: ({ children }: { children: ReactNode }) => <>{children}</>,
    Route: ({ children }: { children: ReactNode }) => <>{children}</>,
  }));
  test("should render <TopBarNavLinks /> component", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <Router>
            <TopBarNavLinks open={true} setOpen={setOpenSpy} />
          </Router>
        </RecoilRoot>
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });
});
