import { ReactNode } from "react";
import ExpandingSubListMobile from "../../../components/ExpandingSubListMobile";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardIcon from "../../../assets/sidebarIcons/DashBoardWhite.svg";
import DocIcon from "../../../assets/sidebarIcons/DocWhite.svg";
import MasterIcon from "../../../assets/sidebarIcons/MasterWhite.svg";
import SettingsIcon from "../../../assets/sidebarIcons/SettingsWhite.svg";
import UserIcon from "../../../assets/sidebarIcons/UserWhite.svg";
import { theme } from "../../../theme";
import { ThemeProvider } from "@material-ui/core";

const mockUseNavigate = jest
  .fn()
  .mockImplementation((to: string, options?: any) => {});
let clickSpy: any;

beforeAll(() => {
  clickSpy = jest.fn();
});

import { BrowserRouter as Router } from "react-router-dom";

const icons = {
  Dashboard: <img src={DashboardIcon} alt="Dashboard" />,
  "Process Documents": <img src={DocIcon} alt="process documents" />,
  Master: <img src={MasterIcon} alt="Master" />,
  Settings: <img src={SettingsIcon} alt="Settings" />,
  User: <img src={UserIcon} alt="User" />,
};

const dummyProcessDocIcons = {
  "Document Type": <img src={DocIcon} alt="notifications" />,
  "Create New Document": <img src={DocIcon} alt="notifications" />,
  "View Published Documents": <img src={DocIcon} alt="notifications" />,
};

const dummyProcessDocList = [
  "Document Type",
  "Create New Document",
  "View Published Documents",
];

describe("<ExpandingSubListMobile /> component tests -> ", () => {
  beforeEach(() => {
    jest.mock("react-router-dom", () => ({
      ...(jest.requireActual("react-router-dom") as any),
      useNavigate: () => mockUseNavigate,
      useHref: () => "abc",
      BrowserRouter: ({ children }: { children: ReactNode }) => <>{children}</>,
      Route: ({ children }: { children: ReactNode }) => <>{children}</>,
    }));
  });
  test("should render <ExpandingSubListMobile /> component", () => {
    const activeTabUrl: any = "http://localhost:3001/master/documenttype";
    const { container } = render(
      <ThemeProvider theme={theme}>
        <ExpandingSubListMobile
          data={dummyProcessDocList}
          title={activeTabUrl}
          icon={icons["Master"]}
          key={activeTabUrl}
          childIcons={dummyProcessDocIcons["Document Type"]}
          handleDrawerClose={clickSpy}
        />
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should display clickable sub list item", () => {
    const activeTabUrl: any = "http://localhost:3001/master/documenttype";

    const { container } = render(
      <ThemeProvider theme={theme}>
        <Router>
          <ExpandingSubListMobile
            data={dummyProcessDocList}
            title={activeTabUrl}
            icon={icons["Master"]}
            key={activeTabUrl}
            childIcons={dummyProcessDocIcons["Document Type"]}
            handleDrawerClose={clickSpy}
          />
        </Router>
      </ThemeProvider>
    );
    let subListMobileItem: any = screen.queryByTestId(
      "expanding-sub-list-mobile-item"
    );
    fireEvent.click(subListMobileItem);
    let subListMobileSubItem: any = screen.queryAllByTestId(
      "expanding-sub-list-sub-item"
    );
    fireEvent.click(subListMobileSubItem[1]);
  });
});
