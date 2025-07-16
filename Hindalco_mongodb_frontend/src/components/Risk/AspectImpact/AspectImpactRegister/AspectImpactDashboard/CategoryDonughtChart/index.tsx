import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Tag } from "antd";
import { useMediaQuery } from "@material-ui/core";

ChartJS.register(ArcElement, ChartTooltip, Legend, ChartDataLabels);

type ImpactTypeCount = {
  impactTypeName: string;
  impactType: string;
  count: number;
  percentage: string;
};

type Props = {
  impactTypeCounts: ImpactTypeCount[];
  setTableFilters?: any;
  tags?: any;
  isModalView?: boolean;
};

const CategoryDonughtChart = ({
  impactTypeCounts,
  setTableFilters,
  tags,
  isModalView = false,
}: Props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");
    let chart = null as any;

    if (ctx && impactTypeCounts.length > 0) {
      // Filter out categories with zero percentage
      const filteredImpactTypeCounts = impactTypeCounts.filter(
        (item) => parseFloat(item.percentage.replace("%", "")) > 0
      );

      const labels = filteredImpactTypeCounts.map(
        (item) => item.impactTypeName
      );
      const impactTypes = filteredImpactTypeCounts.map(
        (item) => item.impactType
      );
      const data = filteredImpactTypeCounts.map((item) =>
        parseFloat(item.percentage.replace("%", ""))
      );

      const backgroundColors = [
        "#21618C",
        "#DC5F00",
        "#686D76",
        "#C73659",
        "#373A40",
        "#f0cb28",
        "#699eb0",
        "#b4a97e",
        "#CCC5A8",
        "#DBDB46",
        "#6b85fa",
        "#0585FC",
        "#F2BB00",
        "#7cbf3f",
        // Add more colors as needed
      ];

      chart = new ChartJS(ctx, {
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              data,
              backgroundColor: backgroundColors.slice(0, labels.length),
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 10,  // Added extra spacing to prevent overlap
              bottom: 20, // Extra spacing below
            },
          },
          plugins: {
            legend: {
              display: false, // Hide the built-in legend
            },
            title: {
              display: true,
              text: "",
              font: {
                size: 16,
                weight: "1",
                family: "'Poppins', sans-serif",
              },
              align: "center",
              color: "black",
              padding: {
                top: 5,
                bottom: 10,
              },
            },
            tooltip: {
              enabled: true,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              borderColor: "#fff",
              borderWidth: 1,
              titleFont: {
                size: 16,
                weight: "bold",
              },
              bodyFont: {
                size: 14,
                weight: "normal",
              },
              padding: 10,
              callbacks: {
                label: (context) => {
                  const label = context.label || "";
                  const percentage = impactTypeCounts.find(
                    (item) => item.impactTypeName === label
                  )?.percentage;
                  return label && percentage ? `${label}: ${percentage}` : "";
                },
              },
            },
            datalabels: {
              color: "#fff",
              anchor: "end",
              align: "start",
              offset: 4,
              font: {
                size: 12,
              },
              formatter: (value) => (value !== 0 ? value + "%" : null),
             
            },
            
          },
          onClick: (event: any, elements: any) => {
            if (elements.length > 0) {
              const elementIndex = elements[0].index;
              const impactType = impactTypes[elementIndex];
              // console.log("checkdashboard Impact Type Clicked:", impactType);
              setTableFilters({
                impactType: impactType,
              });
              // Handle the click event here, possibly manipulate state or trigger actions
            }
          },
        },
      });
    }

    return () => {
      chart?.destroy();
    };
  }, [impactTypeCounts]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* {matches && tags?.length ? (
        <div
          style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}
        >
          {tags.map((tag: any, index: any) => (
            <Tag color={tag.color} key={index}>
              {tag.tagName}
            </Tag>
          ))}
        </div>
      ) : null} */}

      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ position: "relative", width: "100%", height: isModalView ? "400px" : "280px", bottom : "16px" }}>
          <canvas
            ref={chartRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "90%",
              height: isModalView ? "400px" : "280px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryDonughtChart;
