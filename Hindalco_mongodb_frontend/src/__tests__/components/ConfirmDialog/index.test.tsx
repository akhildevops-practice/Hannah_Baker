import { render } from "@testing-library/react";
import ConfirmDialog from "../../../components/ConfirmDialog";

const functionSpy = jest.fn();

describe("<ConfirmDialog /> component tests -> ", () => {
  test("should render <ConfirmDialog /> component", () => {
    const { container } = render(
      <ConfirmDialog
        handleDelete={functionSpy}
        handleClose={functionSpy}
        open={true}
      />
    );
    expect(container).toBeInTheDocument();
  });
});
