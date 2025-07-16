import React from "react";
import { fireEvent, screen, render } from "@testing-library/react";
import QuestionCard from "../../../components/QuestionCard";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import { theme } from "../../../theme/index";
import { RecoilRoot } from "recoil";

let addQuestionSpy: any;
let removeQuestionSpy: any;
let handleChangeSpy: any;

beforeAll(() => {
  addQuestionSpy = jest.fn();
  removeQuestionSpy = jest.fn();
  handleChangeSpy = jest.fn();
});

describe("<QuestionCard /> component tests -> ", () => {
  test("should render <QuestionCard /> component on the screen", () => {
    const data = {};
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <QuestionCard
            questionData={data}
            addQuestion={addQuestionSpy}
            removeQuestion={removeQuestionSpy}
            onChange={handleChangeSpy}
          />
        </RecoilRoot>
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should invoke the collapse handler when the collapse button is clicked", () => {
    const data = {};
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <QuestionCard
            questionData={data}
            addQuestion={addQuestionSpy}
            removeQuestion={removeQuestionSpy}
            onChange={handleChangeSpy}
          />
        </RecoilRoot>
      </ThemeProvider>
    );
    const collapseButton: any = screen.queryByTestId("collapse-button");
    fireEvent.click(collapseButton);
  });

  test("should add a new question field when add question button is clicked", () => {
    const data = {};
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <QuestionCard
            questionData={data}
            addQuestion={addQuestionSpy}
            removeQuestion={removeQuestionSpy}
            onChange={handleChangeSpy}
          />
        </RecoilRoot>
      </ThemeProvider>
    );
    const addQuestionButton: any = screen.queryByTestId("add-question-button");
    fireEvent.click(addQuestionButton);
    expect(addQuestionSpy).toBeCalled();
  });

  test("should invoke the handleChange function when the settings accordion is clicked", () => {
    const data = {};
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <QuestionCard
            questionData={data}
            addQuestion={addQuestionSpy}
            removeQuestion={removeQuestionSpy}
            onChange={handleChangeSpy}
          />
        </RecoilRoot>
      </ThemeProvider>
    );
    const settingsAccordion: any = screen.queryByTestId("accordion-component");
    fireEvent.click(settingsAccordion);
  });
});
