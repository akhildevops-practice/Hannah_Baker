import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip as ChartTooltip,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
} from "chart.js";
import { Tag } from "antd";
import { useMediaQuery } from "@material-ui/core";

type props = {
  deptData?: any;
  setFilterQuery?: any;
  entity?: any;
  location?: any;
  entityId?: any;
  locationId?: any;
  name?: any;
  activeTab?: any;
  isModalOpenForDeptChart?: any;
};

const ByDepartmentChart = ({
  deptData,
  setFilterQuery,
  entity,
  location,
  locationId,
  entityId,
  name,
  activeTab,
  isModalOpenForDeptChart,
}: props) => {
  const smallScreen = useMediaQuery("(min-width:450px)");
  const chartRef1 = useRef<any>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef1.current.getContext("2d");

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Set max length for labels
    const maxLength = isModalOpenForDeptChart ? 15 : 6;

    // Shorten labels based on maxLength
    const labels = deptData?.map((value: any) =>
      value?.entityName.length > maxLength
        ? value?.entityName.substring(0, maxLength) + "..."
        : value?.entityName
    );
    const fullLabels = deptData?.map((value: any) => value?.entityName);
    const datas: any = deptData?.map((value: any) => value?.count);
    const BackgroundColor = [
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
    ];

    let backgroundColors = [...BackgroundColor]; // Using predefined colors initially

    // If the number of data points exceeds the number of predefined colors,
    // generate additional random colors
    if (datas?.length > BackgroundColor?.length) {
      const remainingColorsCount = datas?.length - BackgroundColor?.length;
      for (let i = 0; i < remainingColorsCount; i++) {
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(
          16
        )}`;
        backgroundColors.push(randomColor);
      }
    }

    chartInstance.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "set1",
            data: datas,
            backgroundColor: backgroundColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            color: "white",
            font: {
              size: 12,
            },
          },
          legend: {
            display: false,
            position: "right",
          },
          title: {
            display: true,
            text: locationId?.includes("All")
              ? `${name} By Unit`
              : `${name} By Dept/Vertical`,
            font: {
              size: 14,
              weight: "1",
              family: "'Poppins', sans-serif",
            },
            color: "Black",
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
              title: function (tooltipItem: any) {
                const index = tooltipItem[0]?.dataIndex;
                return fullLabels[index]; // Show full label in tooltip
              },
              label: function (tooltipItem: any) {
                const datasetLabel = tooltipItem.dataset.label || "";
                const value = tooltipItem.raw;
                return `${datasetLabel}: ${value}`;
              },
            },
          },
        },
        scales: {
          y: {
            grid: {
              borderWidth: 3,
              lineWidth: 1,
            },
            ticks: {
              autoSkip: false,
              maxRotation: 0,
              minRotation: 0,
              callback: function (value) {
                if (Number.isInteger(value)) {
                  return value;
                } else {
                  return "";
                }
              },
            },
          },
          x: {
            grid: {
              borderWidth: 3,
              lineWidth: 1,
            },
            ticks: {
              autoSkip: false,
              maxRotation: isModalOpenForDeptChart ? 90 : 0,
              minRotation: 0,
              callback: function (value: any) {
                const label = (this.getLabelForValue(value) as string) || "";
                return label;
              },
            },
          },
        },
        onClick: (e, index: any) => {
          setFilterQuery({ entityId: deptData[index[0]?.index]?.entityId });
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [deptData, setFilterQuery]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {smallScreen ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Tag color="cyan">{`Unit: ${
            location.find((value: any) => value?.id === locationId)
              ?.locationName || ""
          }`}</Tag>
          {[1, 3, 5, 7, 9, 16].includes(activeTab) ? (
            <Tag color="gold">Dept: All</Tag>
          ) : (
            !locationId?.includes("All") && (
              <Tag color="gold">{`Dept: ${entityId
                .map((value: any) => {
                  const entityData = entity.find(
                    (item: any) => item.id === value
                  );
                  return entityData?.entityName;
                })
                .join(" , ")}`}</Tag>
            )
          )}
        </div>
      ) : null}
      <div style={{ width: "100%", height: "100%" }}>
        <canvas ref={chartRef1} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};

export default ByDepartmentChart;
