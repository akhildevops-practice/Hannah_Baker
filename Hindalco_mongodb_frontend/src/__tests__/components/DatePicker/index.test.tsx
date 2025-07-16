import { fireEvent, render, screen } from "@testing-library/react";
import DatePicker from "../../../components/DatePicker";

const mockFn = jest.fn(() => {});

const dummyData = {
  documentStartDate: "22/04/2033",
  documentEndDate: "20/06/2021",
};

describe("<Datepicker /> component test", () => {
  test("should render properly", () => {
    const { container } = render(
      <DatePicker searchValues={dummyData} dateFields={mockFn} />
    );
    expect(container).toBeInTheDocument();
  });

  test("should call prop functions on onchange method", () => {
    const { container } = render(
      <DatePicker searchValues={dummyData} dateFields={mockFn} />
    );

    const startDate = screen.queryByTestId("start-date");
    const endDate = screen.queryByTestId("end-date");

    fireEvent.change(startDate!, {
      target: { value: "22/05/2022" },
    });
    fireEvent.change(endDate!, {
      target: { value: "22/05/2022" },
    });

    expect(mockFn).toBeCalledTimes(2);
  });
});
