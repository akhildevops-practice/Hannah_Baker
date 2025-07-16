import React from "react";
import { screen, render, fireEvent } from "@testing-library/react";
import HintQuestions from "../../../components/HintQuestions";
import { ThemeProvider } from "@material-ui/core";
import { theme } from "../../../theme/index";

let changeHandler: any;
let numeric = {
  id: 123123,
  title: "",
  inputType: "numeric",
  options: [
    {
      name: "yes",
      checked: false,
      value: 0,
    },
    {
      name: "no",
      checked: false,
      value: 0,
    },
    {
      name: "na",
      checked: false,
      value: 0,
    },
  ],
  value: "",
  questionScore: 0,
  score: [
    {
      name: "gt",
      value: 0,
      score: 0,
    },
    {
      name: "lt",
      value: 10,
      score: 0,
    },
  ],
  slider: true,
  open: false,
  required: true,
  hint: "",
  allowImageUpload: false,
  image: "",
  imageName: "",
  nc: {
    type: "",
    comment: "",
    clause: "",
    severity: "",
  },
};

let text = {
  id: 123123,
  title: "",
  inputType: "text",
  options: [
    {
      name: "yes",
      checked: false,
      value: 0,
    },
    {
      name: "no",
      checked: false,
      value: 0,
    },
    {
      name: "na",
      checked: false,
      value: 0,
    },
  ],
  value: "",
  questionScore: 0,
  score: [
    {
      name: "gt",
      value: 0,
      score: 0,
    },
    {
      name: "lt",
      value: 10,
      score: 0,
    },
  ],
  slider: true,
  open: false,
  required: true,
  hint: "",
  allowImageUpload: false,
  image: "",
  imageName: "",
  nc: {
    type: "",
    comment: "",
    clause: "",
    severity: "",
  },
};

let radio = {
  id: 123123,
  title: "",
  inputType: "radio",
  options: [
    {
      name: "yes",
      checked: false,
      value: 0,
    },
    {
      name: "no",
      checked: false,
      value: 0,
    },
    {
      name: "na",
      checked: false,
      value: 0,
    },
  ],
  value: "",
  questionScore: 0,
  score: [
    {
      name: "gt",
      value: 0,
      score: 0,
    },
    {
      name: "lt",
      value: 10,
      score: 0,
    },
  ],
  slider: true,
  open: false,
  required: true,
  hint: "",
  allowImageUpload: false,
  image: "",
  imageName: "",
  nc: {
    type: "",
    comment: "",
    clause: "",
    severity: "",
  },
};

let checkbox = {
  id: 123123,
  title: "",
  inputType: "checkbox",
  options: [
    {
      name: "yes",
      checked: false,
      value: 0,
    },
    {
      name: "no",
      checked: false,
      value: 0,
    },
    {
      name: "na",
      checked: false,
      value: 0,
    },
  ],
  value: "",
  questionScore: 0,
  score: [
    {
      name: "gt",
      value: 0,
      score: 0,
    },
    {
      name: "lt",
      value: 10,
      score: 0,
    },
  ],
  slider: true,
  open: false,
  required: true,
  hint: "",
  allowImageUpload: false,
  image: "",
  imageName: "",
  nc: {
    type: "",
    comment: "",
    clause: "",
    severity: "",
  },
};

beforeAll(() => {
  changeHandler = jest.fn();
});

describe("<HintQuestions /> component tests -> ", () => {
  test("should render <HintQuestions/> component", () => {
    // const questionData = ;
    const inputType = "numeric";
    const { container } = render(
      <ThemeProvider theme={theme}>
        <HintQuestions
          onChange={changeHandler}
          hintData={numeric}
          questionType={inputType}
        />
      </ThemeProvider>
    );
    const numericTextField: any = screen.queryByTestId("number-text-field");
    const numericTextFieldTwo: any = screen.queryByTestId(
      "number-text-field-2"
    );
    fireEvent.keyDown(numericTextField, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });
    fireEvent.keyDown(numericTextFieldTwo, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });
    expect(container).toBeInTheDocument();
  });

  //   test("should invoke onKeyDown handler when key down event is triggered on the score field", () => {
  //     const inputType = "numeric";
  //     const { container } = render(
  //       <ThemeProvider theme={theme}>
  //         <HintQuestions
  //           onChange={changeHandler}
  //           hintData={numeric}
  //           questionType={inputType}
  //         />
  //       </ThemeProvider>
  //     );
  //     const scoreTextField: any = screen.queryByTestId("score-text-field");
  //     // fireEvent.keyDown(scoreTextField, {
  //     //   key: "Enter",
  //     //   code: "Enter",
  //     //   charCode: 13,
  //     // });
  //     fireEvent.keyDown(scoreTextField, { key: "A", code: "KeyA" });
  //     expect(container).toBeInTheDocument();
  //   });

  test("should render <HintQuestions /> component when input type is text", () => {
    const inputType = "text";
    const { container } = render(
      <ThemeProvider theme={theme}>
        <HintQuestions
          onChange={changeHandler}
          hintData={text}
          questionType={inputType}
        />
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should render <HintQuestions /> component when input type is checkbox", () => {
    // const questionData = {};
    const inputType = "checkbox";
    const { container } = render(
      <ThemeProvider theme={theme}>
        <HintQuestions
          onChange={changeHandler}
          hintData={checkbox}
          questionType={inputType}
        />
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should render <HintQuestions /> component when input type is radio", () => {
    // const questionData = {};
    const inputType = "radio";
    const { container } = render(
      <ThemeProvider theme={theme}>
        <HintQuestions
          onChange={changeHandler}
          hintData={radio}
          questionType={inputType}
        />
      </ThemeProvider>
    );
    const radioScoreField: any = screen.queryByTestId("radio-score-field-2");
    fireEvent.keyDown(radioScoreField, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });
    expect(container).toBeInTheDocument();
  });
});
