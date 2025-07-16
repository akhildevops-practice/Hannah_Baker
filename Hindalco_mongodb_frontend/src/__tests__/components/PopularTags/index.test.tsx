import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import { first } from "lodash";
import PopularTags from "../../../components/PopularTags";

const mockFn = jest.fn(() => {});
const demoTags = [
  "tag 1",
  "tag 2",
  "tag 3",
  "tag 4",
  "tag 5",
  "tag 6",
  "tag 7",
  "tag 8",
  "tag 9",
  "tag 10",
];

describe("<PopularTags /> component tests -> ", () => {
  test("should render <PopularTags /> component properly with alternateStyling true", () => {
    const { container } = render(
      <PopularTags
        header="header"
        centerTag="center tag"
        tags={demoTags}
        totalDocs={3}
        clickHandler={mockFn}
        alternateStyling={true}
      />
    );
    expect(container).toBeInTheDocument();
  });

  test("should render <PopularTags /> component properly with alternateStyling false and no header", () => {
    const { container } = render(
      <PopularTags
        centerTag="center tag"
        tags={demoTags}
        totalDocs={3}
        clickHandler={mockFn}
        alternateStyling={false}
      />
    );
    expect(container).toBeInTheDocument();
  });

  test("should call mockFn function on tags onclick event", () => {
    const { container } = render(
      <PopularTags
        centerTag="center tag"
        tags={demoTags}
        totalDocs={3}
        clickHandler={mockFn}
        alternateStyling={false}
      />
    );

    const tagZero = screen.queryByTestId("tag-0");
    const tagOne = screen.queryByTestId("tag-1");
    const tagTwo = screen.queryByTestId("tag-2");
    const tagThree = screen.queryByTestId("tag-3");
    const tagFour = screen.queryByTestId("tag-4");
    const tagFive = screen.queryByTestId("tag-5");
    const tagSix = screen.queryByTestId("tag-6");
    const tagSeven = screen.queryByTestId("tag-7");
    const tagEight = screen.queryByTestId("tag-8");
    const tagNine = screen.queryByTestId("tag-9");

    fireEvent.click(tagZero!);
    fireEvent.click(tagOne!);
    fireEvent.click(tagTwo!);
    fireEvent.click(tagThree!);
    fireEvent.click(tagFour!);
    fireEvent.click(tagFive!);
    fireEvent.click(tagSix!);
    fireEvent.click(tagSeven!);
    fireEvent.click(tagEight!);
    fireEvent.click(tagNine!);

    expect(mockFn).toBeCalledTimes(10);
  });

  //tag-1
});
