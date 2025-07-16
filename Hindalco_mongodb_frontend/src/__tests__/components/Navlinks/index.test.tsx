import { ReactNode } from "react";
import Navlinks from "../../../components/Navlinks";
import TopBarNavLinks from "../../../components/TopBarNavLinks";
import { screen, render, fireEvent } from "@testing-library/react";
import { theme } from "../../../theme/index";
import { ThemeProvider } from "@material-ui/core";
import { BrowserRouter as Router } from "react-router-dom";
import {RecoilRoot} from "recoil";

let clickSpy = jest.fn();
let setOpenSpy = jest.fn().mockImplementation((currentStatus: boolean) => {
});

const topList = [
  "Dashboard",
  "Process Documents",
  "Master",
  "Settings",
  "User",
];

describe("<Navlinks /> component tests -> ", () => {
  jest.mock("react-router-dom", () => ({
    ...(jest.requireActual("react-router-dom") as any),
    useHref: () => "abc",
    BrowserRouter: ({ children }: { children: ReactNode }) => <>{children}</>,
    Route: ({ children }: { children: ReactNode }) => <>{children}</>,
  }));
  test("should render <Navlinks /> component", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Router>
          <Navlinks
            text={topList[1]}
            icon={topList[1]}
            key={topList[1]}
            activeTab={topList[1]}
            setOpen={clickSpy}
          />
        </Router>
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should render mobile view", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Router>
          <Navlinks
            text={topList[1]}
            icon={topList[1]}
            key={topList[1]}
            activeTab={topList[1]}
            mobile={true}
          />
        </Router>
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should invoke function on nav list item click", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Router>
          <Navlinks
            text={topList[1]}
            icon={topList[1]}
            key={topList[1]}
            activeTab={topList[1]}
            mobile={true}
            handleDrawerClose={clickSpy}
          />
        </Router>
      </ThemeProvider>
    );
    let listItem: any = screen.queryByTestId("expanding-sub-list-sub-item");
    fireEvent.click(listItem);
    expect(clickSpy).toBeCalled();
  });

  test("should render component when link and active tab are equal to - Process Documents", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Router>
          <Navlinks
            text={topList[2]}
            icon={topList[2]}
            key={topList[2]}
            activeTab={topList[2]}
            mobile={true}
            handleDrawerClose={clickSpy}
          />
        </Router>
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should render component when link and active tab are not equal ", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Router>
          <Navlinks
            text={topList[1]}
            icon={topList[2]}
            key={topList[2]}
            activeTab={topList[3]}
            mobile={false}
            handleDrawerClose={clickSpy}
          />
        </Router>
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should invoke function on nav list item click when mobile view is not active", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
        <Router>
          <TopBarNavLinks open={true} setOpen={setOpenSpy} />
        </Router>
        </RecoilRoot>
      </ThemeProvider>
    );
    let iconButton: any = screen.queryAllByTestId("link-icon-button");
    fireEvent.click(iconButton[0]);
    expect(setOpenSpy).toBeCalled();
  });

  test("should invoke setOpen on icon button click when mobile view is not active and link tag is equal to Process Documents", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
        <Router>
          <TopBarNavLinks open={true} setOpen={setOpenSpy} />
        </Router>
        </RecoilRoot>
      </ThemeProvider>
    );
    let iconButton: any = screen.queryAllByTestId("link-icon-button");
    fireEvent.click(iconButton[1]);
    expect(setOpenSpy).toBeCalled();
  });
});
