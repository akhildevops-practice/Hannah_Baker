import React from "react";
import GraphComponent from "../../../components/GraphComponent";
import { render, screen, fireEvent } from "@testing-library/react";
import { Alignment, ChartType, Position } from "../../../utils/enums";

let clickSpy: any;

beforeAll(() => {
  clickSpy = jest.fn();
});

//--------
// dummy pie chart data
let mockPieData = {
  labels: [
    {
      label: "System 1",
      id: "e8ed850e-ba73-4dab-9a19-e91cef562680",
    },
    {
      label: "System 3",
      id: "5ed63796-1caa-4154-955b-40e549c5c08b",
    },
  ],
  datasets: [5, 5],
};

//--------

describe("<GraphComponent /> tests -> ", () => {
  test("should render <GraphComponent /> on the screen", () => {
    const { container } = render(
      <GraphComponent
        chartType={ChartType.PIE}
        displayTitle={true}
        title="Document Type"
        legendsAlignment={Alignment.START}
        legendsPosition={Position.BOTTOM}
        isStacked={false}
        chartData={mockPieData}
        handleChartDataClick={clickSpy}
        searchTitle="documentType"
      />
    );

    expect(container).toBeInTheDocument();
  });

  test("should render <GraphComponent /> on the screen when only default values are specified", () => {
    const { container } = render(
      <GraphComponent
        chartType={ChartType.PIE}
        title="Document Type"
        //   displayTitle={true}
        //   legendsAlignment={Alignment.START}
        //   legendsPosition={Position.BOTTOM}
        //   isStacked={false}
        chartData={mockPieData}
        handleChartDataClick={clickSpy}
        searchTitle="documentType"
      />
    );

    expect(container).toBeInTheDocument();
  });
});
