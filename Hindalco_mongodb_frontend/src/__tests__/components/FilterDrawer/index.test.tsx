import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FilterDrawer from "../../../components/FilterDrawer";
import { theme } from "../../../theme";
import { Snackbar, ThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import BasicLayout from "../../../layout/BasicLayout/index";
import { BrowserRouter as Router } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import Recoil from "recoil"

const functionSpy = jest.fn();

// jest.mock("recoil", () => ({
//   ...(jest.requireActual("recoil") as any),
//   useRecoilState: () => true,
// }));

describe("<FilterDrawer /> component tests -> ", () => {
  test("should render <FilterDrawer/> component", () => {
    const { container } = render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <FilterDrawer
            resultText={"no results found"}
            handleApply={functionSpy}
            handleDiscard={functionSpy}
          >
            <div>Child Node</div>
          </FilterDrawer>
        </ThemeProvider>
      </RecoilRoot>
    );
    expect(container).toBeInTheDocument();
  });

  test("should open drawer when fab button is clicked", () => {
    const { container, getByText } = render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <FilterDrawer
            resultText={"no results found"}
            handleApply={functionSpy}
            handleDiscard={functionSpy}
          >
            <div>Child Node</div>
          </FilterDrawer>
        </ThemeProvider>
      </RecoilRoot>
    );
    let fab: any = screen.queryByTestId("fab");
    fireEvent.click(fab);
    expect(getByText(/child node/i)).toBeInTheDocument();
  });

  test("should close drawer when close button is clicked", () => {
    const { container, getByText } = render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <FilterDrawer
            resultText={"no results found"}
            handleApply={functionSpy}
            handleDiscard={functionSpy}
          >
            <div>Child Node</div>
          </FilterDrawer>
        </ThemeProvider>
      </RecoilRoot>
    );
    let fab: any = screen.queryByTestId("fab");
    fireEvent.click(fab);
    let closeDrawerButton: any = screen.queryByTestId("close-drawer-button");
    fireEvent.click(closeDrawerButton);
    waitFor(() => {
      expect(getByText(/child node/i)).not.toBeInTheDocument();
    });
  });

  test("should invoke discard handler when discard button is clicked", () => {
    const { container, getByText } = render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <FilterDrawer
            resultText={"no results found"}
            handleApply={functionSpy}
            handleDiscard={functionSpy}
          >
            <div>Child Node</div>
          </FilterDrawer>
        </ThemeProvider>
      </RecoilRoot>
    );
    let fab: any = screen.queryByTestId("fab");
    fireEvent.click(fab);
    waitFor(() => {
      let discardButton: any = screen.queryByTestId("discard-button");
      fireEvent.click(discardButton);
      expect(functionSpy).toBeCalled();
    })
  })

  test("should invoke apply handler when apply button is clicked", () => {
    const { container, getByText } = render(
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <FilterDrawer
            resultText={"no results found"}
            handleApply={functionSpy}
            handleDiscard={functionSpy}
          >
            <div>Child Node</div>
          </FilterDrawer>
        </ThemeProvider>
      </RecoilRoot>
    );
    let fab: any = screen.queryByTestId("fab");
    fireEvent.click(fab);
    waitFor(() => {
      let applyButton: any = screen.queryByTestId("apply-button");
      fireEvent.click(applyButton);
      expect(functionSpy).toBeCalled();
    })
  })

});
