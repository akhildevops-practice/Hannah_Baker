import React from "react";
import ActionButton from "../../../components/ActionButton/index";
import { screen, render, fireEvent, getByText } from "@testing-library/react";

let clickSpy: () => void;
beforeAll(() => {
  clickSpy = jest.fn();
});

const dummyData: any = [
  {
    icon: "test-icon",
    label: "test-label",
    handler: () => jest.fn(),
  },
];
const dummyDataWithFunction: any = [
  {
    icon: "test-icon",
    label: "test-label",
    handler: () => clickSpy(),
  },
];
const dummyDataWithFourItems: any = [
  {
    icon: "test-icon-one",
    label: "test-label-two",
    handler: () => clickSpy(),
  },
  {
    icon: "test-icon-two",
    label: "test-label-two",
    handler: () => clickSpy(),
  },
  {
    icon: "test-icon-two",
    label: "test-label-two",
    handler: () => clickSpy(),
  },
  {
    icon: "test-icon-two",
    label: "test-label-two",
    handler: () => clickSpy(),
  },
];

describe("<ActionButton /> component tests -> ", () => {
  test("should display <ActionButton /> component", () => {
    let actionButton;
    const { container } = render(<ActionButton actions={dummyData} />);
    expect(container).toBeInTheDocument();
  });

  test("should call function on click", () => {
    let actionPopper: any;
    let actionItem: any;
    render(<ActionButton actions={dummyDataWithFunction} />);
    actionPopper = screen.queryByTestId("action-popper");
    fireEvent.click(actionPopper);
    actionItem = screen.queryByTestId("action-item");
    fireEvent.click(actionItem);
    expect(clickSpy).toBeCalled();
  });

  test("should display the icon which is passed in the action data set item", () => {
    let actionPopper: any;
    const { getByText } = render(
      <ActionButton actions={dummyDataWithFunction} />
    );
    actionPopper = screen.queryByTestId("action-popper");
    fireEvent.click(actionPopper);
    expect(getByText("test-icon")).toBeInTheDocument();
  });

  test("should display the label which is passed in the action data set item", () => {
    let actionPopper: any;
    const { getByText } = render(
      <ActionButton actions={dummyDataWithFunction} />
    );
    actionPopper = screen.queryByTestId("action-popper");
    fireEvent.click(actionPopper);
    expect(getByText("test-label")).toBeInTheDocument();
  });

  test("should display the exact number of items which are passed in the action data set", () => {
    let actionPopper: any;
    let actionItemsArray: any;
    render(<ActionButton actions={dummyDataWithFourItems} />);
    actionPopper = screen.queryByTestId("action-popper");
    fireEvent.click(actionPopper);
    actionItemsArray = screen.queryAllByTestId("action-item");
    expect(actionItemsArray.length).toBe(dummyDataWithFourItems.length);
  });
});
