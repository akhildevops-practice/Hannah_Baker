import React from "react";
import AuditSectionHeader from "../../../components/AuditSectionHeader";
import { screen, render, fireEvent, getByText, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { theme } from "../../../theme/index";

let clickSpy: () => void;
beforeAll(() => {
  clickSpy = jest.fn();
});

describe("<AuditSectionHeader /> component tests -> ", () => {
  test("should display <AuditSectionHeader /> component", () => {
    const { container } = render(   
      <ThemeProvider theme={theme}>
      <RecoilRoot>
      <AuditSectionHeader
        index={1}
        title={`Section Title`}
        addSection={clickSpy}
        removeSection={clickSpy}
        onChange={clickSpy}
      />
      </RecoilRoot>
      </ThemeProvider>
      );
    expect(container).toBeInTheDocument();
  });

  test("should open a confirmation dialog box when delete section button is clicked", () => {
    const { container } = render(   
      <ThemeProvider theme={theme}>
      <RecoilRoot>
      <AuditSectionHeader
        index={1}
        title={`Section Title`}
        addSection={clickSpy}
        removeSection={clickSpy}
        onChange={clickSpy}
      />
      </RecoilRoot>
      </ThemeProvider>
      );
      
      waitFor(() => {
      const deleteButton: any = screen.queryByTestId("delete-section-button");
      fireEvent.click(deleteButton);
      waitFor(() => {
        expect(container).toBeInTheDocument();
      const yesButton: any = screen.queryByTestId("remove-button");
      fireEvent.click(yesButton);
      expect(clickSpy).toBeCalled();
      })
    })
  })
});
