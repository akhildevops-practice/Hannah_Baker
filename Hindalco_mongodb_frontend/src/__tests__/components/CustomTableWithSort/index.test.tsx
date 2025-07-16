import { render } from "@testing-library/react";
import CustomTableWithSort from "../../../components/CustomTableWithSort";

const dummyHeaders = [
  {
    title: "header 1",
    field: "h1",
    sortable: true,
  },
  {
    title: "header 2",
    field: "h2",
    sortable: true,
  },
  {
    title: "header 3",
    field: "h3",
    sortable: false,
  },
];
const dummyFields = ["h1", "h2", "h3"];
const dummyData = [{ h1: "asdf", h2: "qwert", h3: "zxcv" }];

const sortFunction = jest.fn(() => {});

describe("<CustomTableWithSort /> test", () => {
  it("should render <CustomTableWithSort /> properly", () => {
    const { container } = render(
      <CustomTableWithSort
        sortFunction={sortFunction}
        data={dummyData}
        headers={dummyHeaders}
        fields={dummyFields}
      />
    );
    expect(container).toBeInTheDocument();
  });
});
