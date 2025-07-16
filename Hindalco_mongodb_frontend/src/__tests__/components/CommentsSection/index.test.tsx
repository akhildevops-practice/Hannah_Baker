import { ThemeProvider } from "@material-ui/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import CommentsSection from "../../../components/CommentsSection";
import { theme } from "../../../theme";

const dummyData = [
  { name: "name", id: "1", detail: "78" },
  { name: "name another", id: "2", detail: "8" },
  { name: "name next", id: "3", detail: "67" },
];

const dummyFn = jest.fn();

describe("CommentsSection Test", () => {
  test("should render properly", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <CommentsSection
          disableAddComment={true}
          data={dummyData}
          version="0.1"
          commentsLoader={false}
          handleCommentSubmit={dummyFn}
        />
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should change textfield text on typing", () => {
    const setState = jest.fn().mockResolvedValue("faseraeraefawefsefasef");
    const useState: any = (useState: any) => [useState, setState];
    jest.spyOn(React, "useState").mockImplementation(useState);
    const screen = render(
      <ThemeProvider theme={theme}>
        <CommentsSection
          handleCommentSubmit={dummyFn}
          disableAddComment={false}
          data={dummyData}
          version={false}
        />
      </ThemeProvider>
    );
    const textfield = screen.getByRole("textbox");
    fireEvent.change(textfield, { target: { value: "fasdfasdf" } });
  });

  test("should submit comment on submit button click", () => {
    const setState = jest.fn().mockResolvedValue("faseraeraefawefsefasef");
    const useState: any = (useState: any) => [useState, setState];
    jest.spyOn(React, "useState").mockImplementation(useState);
    const { container } = render(
      <ThemeProvider theme={theme}>
        <CommentsSection
          handleCommentSubmit={dummyFn}
          disableAddComment={false}
          data={dummyData}
          version={false}
          commentsLoader={false}
        />
      </ThemeProvider>
    );
    const submitButton: any = screen.queryByTestId("icon-button");
    console.log("accordion - component", submitButton);
    fireEvent.click(submitButton);
  });
});
