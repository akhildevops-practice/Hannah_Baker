{/* <NumericComponent
handler={handler}
inputHandlerType={inputHandlerType!}
data={numericData}
disabled={disabled}
value={textValue}
/> */}

import React from "react";
import NumericComponent from "../../../components/NumericComponent";
import { screen, render, fireEvent, getByText, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { theme } from "../../../theme/index";
import {InputHandlerType} from "../../../utils/enums";


let clickSpy: () => void;
beforeAll(() => {
  clickSpy = jest.fn();
});


describe("<NumericComponent /> component tests -> ", () => {
  test("should display <NumericComponent /> component", () => {
    const { container } = render(   
      <ThemeProvider theme={theme}>
      <RecoilRoot>
      <NumericComponent
        handler={clickSpy}
        inputHandlerType={InputHandlerType.TEXT}
        data={[]}
        disabled={false}
        value={`21`}
      />
      </RecoilRoot>
      </ThemeProvider>
      );
    expect(container).toBeInTheDocument();
  });

  test("should display slider component when input handler type is changed", () => {
    const { container } = render(   
        <ThemeProvider theme={theme}>
        <RecoilRoot>
        <NumericComponent
          handler={clickSpy}
          inputHandlerType={InputHandlerType.SLIDER}
          data={[]}
          disabled={false}
          value={`21`}
        />
        </RecoilRoot>
        </ThemeProvider>
        );
      expect(container).toBeInTheDocument();
  })

  test("should invoke the handle change function when field value changes in  <NumericComponent /> text type", () => {
    const { container } = render(   
      <ThemeProvider theme={theme}>
      <RecoilRoot>
      <NumericComponent
        handler={clickSpy}
        inputHandlerType={InputHandlerType.TEXT}
        data={[]}
        disabled={false}
        value={`21`}
      />
      </RecoilRoot>
      </ThemeProvider>
      );
      waitFor(() => {
          expect(container).toBeInTheDocument();
          const textField : any = screen.getByTestId("numeric-text-component");
          fireEvent.change(textField, {target: {value: "Jintu rocks"}})
          expect(/jintu/).toBeInTheDocument();
      }) 
  });
});
