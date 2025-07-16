import React from "react";
import TextComponent from "../../../components/TextComponent";
import { screen, render, fireEvent, getByText, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { theme } from "../../../theme/index";

let clickSpy: () => void;
beforeAll(() => {
  clickSpy = jest.fn();
});

describe("<TextComponent /> tests -> ", () => {
  test("should display <TextComponent /> component", () => {
    const { container } = render(   
      <ThemeProvider theme={theme}>
      <RecoilRoot>
      <TextComponent handler={clickSpy} disabled={false} value={"Random Text"} />
      </RecoilRoot>
      </ThemeProvider>
      );
    expect(container).toBeInTheDocument();
  });
});
