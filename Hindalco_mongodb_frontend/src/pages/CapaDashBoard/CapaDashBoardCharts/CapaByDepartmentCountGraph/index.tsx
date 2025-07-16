import React, { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip as ChartTooltip,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
} from "chart.js";
import axios from "apis/axios.global";
import { Modal } from "antd";

ChartJS.register(
  Title,
  ChartTooltip,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend
);

type props = {
  setSelectedCapaIds?: any;
  showModalCharts?: any;
  newChartData?: any;
};

const CapaByDepartmentCountGraph = ({
  setSelectedCapaIds,
  showModalCharts,
  newChartData,
}: props) => {
  const chartRef = useRef<any>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (newChartData.length === 0) {
      return;
    }

    const backgroundColors = [
      "#DC5F00",
      "#39ac39",
      "#cc0000",
      "#373A40",
      "#FCCE00",
      "#21618C",
    ];

    const labels = newChartData.map((data: any) => data.deptName);
    const datasets = [
      {
        label: "Grand Total",
        data: newChartData.map((data: any) => data.totalCount),
        backgroundColor: backgroundColors[0],
        yAxisID: "y",
      },
      {
        label: "Completed",
        data: newChartData.map((data: any) => data.completedCount),
        backgroundColor: backgroundColors[1],
        yAxisID: "y",
      },

      {
        label: "Pending",
        data: newChartData.map((data: any) => data.pendingCount),
        backgroundColor: backgroundColors[2],
        yAxisID: "y",
      },
      {
        label: "Sum of WIP",
        data: newChartData.map((data: any) => data.wipCount),
        backgroundColor: backgroundColors[3],
        yAxisID: "y",
      },
      {
        label: "Rejected",
        data: newChartData.map((data: any) => data.rejectedCount),
        backgroundColor: backgroundColors[4],
        yAxisID: "y",
      },
      {
        label: "Percentage Completion",
        data: newChartData.map((data: any) =>
          data?.completionPercentage?.toFixed(2)
        ),
        backgroundColor: backgroundColors[5],
        yAxisID: "y1",
      },
    ];

    chartInstance.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 20,
              callback: (value) => (Number.isInteger(value) ? value : null),
            },
          },
          y1: {
            position: "right",
            beginAtZero: true,
            ticks: {
              stepSize: 10,
              callback: (value) => `${value}%`,
            },
            grid: {
              drawOnChartArea: false, // only want the grid lines for one axis
            },
          },
          x: {
            beginAtZero: true,
          },
        },
        plugins: {
          datalabels: {
            color: "white", // Change the color of data labels
            font: {
              size: 14, // Increase the size of data labels
            },
            formatter: function (value, context) {
              if (context.dataset?.label === "Percentage Completion") {
                return value + "%";
              }
              return value;
            },
          },
          legend: {
            display: true,
            position: "bottom",
          },
          title: {
            display: true,
            text: "Department wise Status Count",

            font: {
              size: 16,
              weight: "1",
              family: "'Poppins', sans-serif", // Change the font family here
            },
            align: "center",
            color: "black",
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": " + context.parsed.y;
                }
                return label;
              },
            },
          },
        },
        onClick: (e, activeElements) => {
          if (activeElements.length > 0) {
            const datasetIndex = activeElements[0].datasetIndex;
            const index = activeElements[0].index;
            let ids = [];
            switch (datasets[datasetIndex].label) {
              case "Completed":
                ids = newChartData[index].completedIds;
                break;
              case "Pending":
                ids = newChartData[index].pendingIds;
                break;
              case "Sum of WIP":
                ids = newChartData[index].wipIds;
                break;
              case "Rejected":
                ids = newChartData[index].rejectedIds;
                break;
              case "Grand Total":
                ids = [
                  ...(newChartData[index].completedIds || []),
                  ...(newChartData[index].pendingIds || []),
                  ...(newChartData[index].wipIds || []),
                  ...(newChartData[index].rejectedIds || []),
                ];
                break;

              default:
                ids = [];
            }
            setSelectedCapaIds(ids);
            showModalCharts();
          }
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [newChartData]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default CapaByDepartmentCountGraph;
