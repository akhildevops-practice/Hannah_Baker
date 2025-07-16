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

type Props = {
  typeData?: any;
  setFilterQuery?: any;
  entity?: any;
  location?: any;
  locationId?: any;
  entityId?: any;
  name?: any;
  activeTab?: any;
  isModalOpenForTypeChart?: boolean;
};

const ByTypeChart = ({
  typeData,
  setFilterQuery,
  entity,
  location,
  locationId,
  entityId,
  name,
  activeTab,
  isModalOpenForTypeChart,
}: Props) => {
  const smallScreen = useMediaQuery("(min-width:450px)");
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

  const chartRef3 = useRef<any>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef3?.current?.getContext("2d");

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Set max length based on isModalOpenForTypeChart flag
    const maxLength = isModalOpenForTypeChart ? 15 : 6;

    // Shorten labels based on maxLength
    const labels = typeData?.map((value: any) =>
      value?.docTypeName?.length > maxLength
        ? value?.docTypeName.substring(0, maxLength) + "..."
        : value?.docTypeName
    );
    const fullLabels = typeData?.map((value: any) => value?.docTypeName);
    const datas: any = typeData?.map((value: any) => value?.count);

    chartInstance.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "",
            data: datas,
            backgroundColor: BackgroundColor,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            color: "white", // Change the color of data labels
            font: {
              size: 14, // Increase the size of data labels
            },
          },
          legend: {
            display: false,
            position: "right",
          },
          title: {
            display: true,
            text: `${name} By Type`,
            font: {
              size: 16,
              weight: "1",
              family: "'Poppins', sans-serif", // Change the font family here
            },
            color: "Black",
          },
          tooltip: {
            enabled: true,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            borderColor: "#fff",
            borderWidth: 1,
            titleFont: {
              size: 16, // Increase font size
              weight: "bold",
            },
            bodyFont: {
              size: 14, // Increase font size
              weight: "normal",
            },
            padding: 10, // Add more padding
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
              color: "black",
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
              maxRotation: isModalOpenForTypeChart ? 80 : 0,
              minRotation: 0,
              callback: function (value: any) {
                const label = (this.getLabelForValue(value) as string) || "";
                return label;
              },
            },
          },
        },
        onClick: (e, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            setFilterQuery({ type: typeData[index]?.doctypeId });
          }
        },
      },
    });

    // Cleanup function to destroy chart instance
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [typeData, setFilterQuery, isModalOpenForTypeChart]);

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

      <canvas ref={chartRef3} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default ByTypeChart;
