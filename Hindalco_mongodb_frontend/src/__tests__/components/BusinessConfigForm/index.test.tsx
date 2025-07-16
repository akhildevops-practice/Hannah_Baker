import BusinessConfigForm from "../../../components/BusinessConfigForm";
import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import { theme } from "../../../theme/index";
import { ThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";

const deleteField = jest.fn();

describe("<BusinessConfigForm /> component tests -> ", () => {
  test("should render <BusinessConfigForm /> component", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <BusinessConfigForm deleteField={deleteField} />
        </RecoilRoot>
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should invoke handleChange function when there is a change in textfield value", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <BusinessConfigForm deleteField={deleteField} />
        </RecoilRoot>
      </ThemeProvider>
    );
    let businessUnits: any = screen.queryAllByTestId("dynamic-form-field");
    fireEvent.change(businessUnits[0], {
      target: { value: "Random Business Unit" },
    });
    expect(businessUnits[0]).toHaveValue("Random Business Unit");
  });

  test("should invoke handleChange function when a change occurs in fiscal year quarters", () => {
    const { container, getByText, queryByLabelText } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <BusinessConfigForm deleteField={deleteField} />
        </RecoilRoot>
      </ThemeProvider>
    );
    let fiscalYearQuartersParent: any = screen.queryAllByRole("button");
    fireEvent.mouseDown(fiscalYearQuartersParent[0]);
    waitFor(() => {
      let tempVar = getByText(/april - mar/i);
      fireEvent.click(tempVar);
      waitFor(() => {
        expect(fiscalYearQuartersParent).toBe("April - Mar");
      });
    });
  });
});
