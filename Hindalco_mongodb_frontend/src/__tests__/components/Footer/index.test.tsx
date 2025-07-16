import { ReactNode } from "react";
import Footer from "../../../components/Footer";
import { render } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import { BrowserRouter as Router } from "react-router-dom";

describe("<Footer /> component tests -> ", () => {
  jest.mock("react-router-dom", () => ({
    ...(jest.requireActual("react-router-dom") as any),
    useHref: () => "abc",
    BrowserRouter: ({ children }: { children: ReactNode }) => <>{children}</>,
    Route: ({ children }: { children: ReactNode }) => <>{children}</>,
  }));
  test("should render <Footer /> component", () => {
    const { container } = render(
      <RecoilRoot>
        <Router>
          <Footer />
        </Router>
      </RecoilRoot>
    );
    expect(container).toBeInTheDocument();
  });
});
