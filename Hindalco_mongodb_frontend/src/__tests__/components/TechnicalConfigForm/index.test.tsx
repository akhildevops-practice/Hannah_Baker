import TechnicalConfigForm from "../../../components/TechnicalConfigForm";
import { screen, render, fireEvent } from "@testing-library/react";
import { theme } from "../../../theme/index";
import { ThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";

describe("<TechnicalConfigForm /> component tests -> ", () => {
  test("should render <TechnicalConfigForm /> component", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <TechnicalConfigForm />
        </RecoilRoot>
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should invoke onchange function when the value textfield changes", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <TechnicalConfigForm />
        </RecoilRoot>
      </ThemeProvider>
    );
    let loginUrl: any = screen.queryByTestId("login-url");
    fireEvent.change(loginUrl, { target: { value: "Random Url" } });
    expect(loginUrl).toHaveValue("Random Url");
  });
});
