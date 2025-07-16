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
import { Modal } from "antd";

ChartJS.register(
  Title,
  ChartTooltip,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend
);

type Props = {
  chartDataForAlllocation?: any;
  setSelectedCostCipId?: any;
  showModalCharts?: any;
  setSelectedCostCipIdForAllLocation?: any;
  setSelectedCipStatus?: any;
};

const CipAllLocationGraph = ({
  chartDataForAlllocation,
  setSelectedCostCipId,
  showModalCharts,
  setSelectedCostCipIdForAllLocation,
  setSelectedCipStatus,
}: Props) => {
  const chartRef = useRef<any>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!chartDataForAlllocation.length) return;

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
    ];

    const labels = chartDataForAlllocation.map(
      (data: any) => data.locationName
    );

    const datasets = [
      {
        label: "Draft",
        data: chartDataForAlllocation.map((data: any) => data.draftCount),
        backgroundColor: backgroundColors[0],
      },
      {
        label: "InReview",
        data: chartDataForAlllocation.map((data: any) => data.inReviewCount),
        backgroundColor: backgroundColors[1],
      },
      {
        label: "InApproval",
        data: chartDataForAlllocation.map((data: any) => data.inApprovalCount),
        backgroundColor: backgroundColors[2],
      },
      {
        label: "Approved",
        data: chartDataForAlllocation.map((data: any) => data.approvedCount),
        backgroundColor: backgroundColors[3],
      },
      {
        label: "InProgress",
        data: chartDataForAlllocation.map((data: any) => data.inProgressCount),
        backgroundColor: backgroundColors[4],
      },
      {
        label: "Complete",
        data: chartDataForAlllocation.map((data: any) => data.completeCount),
        backgroundColor: backgroundColors[5],
      },
      {
        label: "InVerification",
        data: chartDataForAlllocation.map(
          (data: any) => data.inVerificationCount
        ),
        backgroundColor: backgroundColors[6],
      },
      {
        label: "Closed",
        data: chartDataForAlllocation.map((data: any) => data.closedCount),
        backgroundColor: backgroundColors[7],
      },
      {
        label: "Cancelled",
        data: chartDataForAlllocation.map((data: any) => data.cancelledCount),
        backgroundColor: backgroundColors[8],
      },
      {
        label: "Dropped",
        data: chartDataForAlllocation.map((data: any) => data.droppedCount),
        backgroundColor: backgroundColors[9],
      },
      {
        label: "Edit",
        data: chartDataForAlllocation.map((data: any) => data.editCount),
        backgroundColor: backgroundColors[10],
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
        onClick: (event: any) => {
          const points = chartInstance.current.getElementsAtEventForMode(
            event,
            "nearest",
            { intersect: true },
            false
          );

          if (points.length) {
            const { datasetIndex, index } = points[0];
            const selectedDatasetLabel =
              chartInstance.current.data.datasets[datasetIndex].label;

            // Find corresponding IDs based on the dataset label and location index
            const locationData = chartDataForAlllocation[index];
            let selectedIds: string[] = [];

            switch (selectedDatasetLabel) {
              case "Draft":
                selectedIds = locationData.draftIds;
                break;
              case "InReview":
                selectedIds = locationData.inReviewIds;
                break;
              case "InApproval":
                selectedIds = locationData.inApprovalIds;
                break;
              case "Approved":
                selectedIds = locationData.approvedIds;
                break;
              case "InProgress":
                selectedIds = locationData.inProgressIds;
                break;
              case "Complete":
                selectedIds = locationData.completeIds;
                break;
              case "InVerification":
                selectedIds = locationData.inVerificationIds;
                break;
              case "Closed":
                selectedIds = locationData.closedIds;
                break;
              case "Cancelled":
                selectedIds = locationData.cancelledIds;
                break;
              case "Dropped":
                selectedIds = locationData.droppedIds;
                break;
              case "Edit":
                selectedIds = locationData.editIds;
                break;
              default:
                break;
            }

            // Update the state if IDs are found
            setSelectedCipStatus("");
            setSelectedCostCipIdForAllLocation(selectedIds);
            showModalCharts();
            // showModalCharts();
          }
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            beginAtZero: true,
          },
        },
        plugins: {
          datalabels: {
            color: "white", // Change the color of data labels
            font: {
              size: 14, // Increase the size of data labels
            },
            display: (context) => {
              // Show labels only for non-zero values
              const value = context.dataset.data[context.dataIndex];
              return value !== 0;
            },
          },
          legend: {
            display: true,
            position: "bottom",
          },
          title: {
            display: true,
            text: "Unit-wise Status Count",
            font: {
              size: 14,
            },
            align: "center",
            color: "black",
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartDataForAlllocation]);

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default CipAllLocationGraph;
