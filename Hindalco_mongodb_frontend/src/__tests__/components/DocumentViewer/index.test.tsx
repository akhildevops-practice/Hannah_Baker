import { render } from "@testing-library/react";
import DocumentViewer from "../../../components/DocumentViewer";

describe("<DocumentViewer /> component", () => {
  test("should check if the component is rendering properly with pdf file name", () => {
    const { container } = render(<DocumentViewer fileLink="link.pdf" />);
    expect(container).toBeInTheDocument();
  });

  test("should check if the component is rendering properly without pdf file name", () => {
    const { container } = render(<DocumentViewer fileLink="link.txt" />);
    expect(container).toBeInTheDocument();
  });
});
