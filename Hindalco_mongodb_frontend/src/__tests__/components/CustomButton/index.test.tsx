import CustomButton from "../../../components/CustomButton";
import { screen, render, fireEvent } from "@testing-library/react";
import { theme } from "../../../theme/index";
import { ThemeProvider } from "@material-ui/core";

let clickSpy = jest.fn();

describe("<CustomButton /> component tests -> ", () => {
  test("should render <CustomButton /> component test", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <CustomButton text="test-button" handleClick={clickSpy} />
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should invoke function on button click", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <CustomButton text="test-button" handleClick={clickSpy} />
      </ThemeProvider>
    );
    let customButton: any = screen.queryByTestId("custom-button");
    fireEvent.click(customButton);
    expect(clickSpy).toBeCalled();
  });
});
