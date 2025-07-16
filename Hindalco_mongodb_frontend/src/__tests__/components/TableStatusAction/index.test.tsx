import { render } from "@testing-library/react";
import TableStatusAction from "../../../components/TableStatusAction";

const testFn = jest.fn();

describe("<TableStatusAction /> test", () => {
  test("should render TableStatusAction component", () => {
    const { container } = render(
      <TableStatusAction
        status="NC"
        enableDelete={true}
        handleDelete={testFn}
        handleEdit={testFn}
      />
    );
    expect(container).toBeInTheDocument();
  });
});
