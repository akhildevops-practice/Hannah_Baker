import { render } from "@testing-library/react";
import TableRatingUtil from "../../../components/TableRatingUtil";

const demoData = [
  { name: "jintu@techvariable.com" },
  { name: "das@techvariable.com" },
];

const secondaryDemoData = [
  {
    assignedRole: [
      {
        role: "some role",
      },
    ],
  },
  {
    assignedRole: [
      {
        role: "some role 2",
      },
    ],
  },
];

describe("TableRatingUtil Test", () => {
  test("should render TableRatingUtil without secondary data", () => {
    const { container } = render(
      <TableRatingUtil
        data={demoData}
        name="Demo"
        currentRating={3}
        overallRating={2}
        disable={true}
        secondaryData={false}
      />
    );
    expect(container).toBeInTheDocument();
  });

  test("should render TableRatingUtil with secondary data", () => {
    const { container } = render(
      <TableRatingUtil
        data={secondaryDemoData}
        name="Demo"
        currentRating={3}
        overallRating={2}
        disable={true}
        secondaryData={true}
        secondaryDataName="secondary"
      />
    );
    expect(container).toBeInTheDocument();
  });
});
