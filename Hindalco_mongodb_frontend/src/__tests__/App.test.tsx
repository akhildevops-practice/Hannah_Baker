import { render } from "@testing-library/react";
import App from "../../src/App";

describe("<App /> component tests -> ", () => {
  test("should render <App /> component", () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
