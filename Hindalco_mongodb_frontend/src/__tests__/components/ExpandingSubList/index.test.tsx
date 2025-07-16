import ExpandingSubList from "../../../components/ExpandingSubList";
import { screen, render, fireEvent } from "@testing-library/react";
import DashboardIcon from "../../../assets/sidebarIcons/DashBoardWhite.svg";
import DocIcon from "../../../assets/sidebarIcons/DocWhite.svg";
import MasterIcon from "../../../assets/sidebarIcons/MasterWhite.svg";
import SettingsIcon from "../../../assets/sidebarIcons/SettingsWhite.svg";
import UserIcon from "../../../assets/sidebarIcons/UserWhite.svg";

const mockUseNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockUseNavigate,
}));

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

describe("<ExpandingSubList /> component tests -> ", () => {
  test("should render <ExpandingSubList /> component", () => {
    const activeTabUrl: any = "http://localhost:3001/master/documenttype";
    const { container } = render(
      <ExpandingSubList
        data={dummyProcessDocList}
        title={activeTabUrl}
        icon={icons["Master"]}
        key={activeTabUrl}
        childIcons={dummyProcessDocIcons["Document Type"]}
      />
    );
    expect(container).toBeInTheDocument();
  });

  test("should call a function on tab click", () => {
    let activeTabUrl: any;
    activeTabUrl = "http://localhost:3001/master/documenttype";
    const { container } = render(
      <ExpandingSubList
        data={dummyProcessDocList}
        title={activeTabUrl}
        icon={icons["Master"]}
        key={activeTabUrl}
        childIcons={dummyProcessDocIcons["Document Type"]}
      />
    );
    let activeTab: any = screen.queryAllByTestId("expanding-sub-list-tab");
    fireEvent.click(activeTab[1]);
  });
});
