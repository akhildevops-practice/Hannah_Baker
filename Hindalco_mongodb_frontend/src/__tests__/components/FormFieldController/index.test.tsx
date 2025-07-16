import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import FormFieldController from "../../../components/FormFieldController";
import { theme } from "../../../theme/index";
import ThemeProvider from "@material-ui/styles/ThemeProvider";

describe("<FormFieldController /> tests ->  ", () => {
  test("should render <FormFieldController /> component ", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <FormFieldController label="Test Controller">
          <div>Child Node</div>
        </FormFieldController>
      </ThemeProvider>
    );
  });
});
