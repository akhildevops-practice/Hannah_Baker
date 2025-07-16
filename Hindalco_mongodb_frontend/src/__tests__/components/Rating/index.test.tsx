import { render } from "@testing-library/react";
import Rating from "../../../components/Rating";

const demoFn = jest.fn(() => {});

describe("<Rating /> component testing", () => {
  test("should render properly", () => {
    const { container } = render(
      <Rating
        value={5}
        name="jintu"
        readOnly={false}
        size="small"
        onChange={demoFn}
      />
    );
    expect(container).toBeInTheDocument();
  });
});
