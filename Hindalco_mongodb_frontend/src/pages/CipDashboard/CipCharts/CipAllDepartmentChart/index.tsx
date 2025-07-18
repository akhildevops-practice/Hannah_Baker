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
  showModalCharts?: any;
  setSelectedCipIdForAllDepartment?: any;
  cipAllDepartmentData?: any;
  setSelectedCipStatus?: any;
};

const CipAllDepartmentChart = ({
  showModalCharts,
  setSelectedCipIdForAllDepartment,
  cipAllDepartmentData,
  setSelectedCipStatus,
}: props) => {
  const chartRef = useRef<any>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (cipAllDepartmentData.length === 0) {
      return;
    }

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

    const labels = cipAllDepartmentData.map((data: any) => data.deptName);
    const datasets = [
      {
        label: "Draft",
        data: cipAllDepartmentData.map((data: any) => data.darftCount),
        backgroundColor: backgroundColors[0],
        yAxisID: "y",
      },
      {
        label: "Approved",
        data: cipAllDepartmentData.map((data: any) => data.approvedCount),
        backgroundColor: backgroundColors[1],
        yAxisID: "y",
      },

      {
        label: "Cancelled",
        data: cipAllDepartmentData.map((data: any) => data.cancelledCount),
        backgroundColor: backgroundColors[2],
        yAxisID: "y",
      },
      {
        label: "Closed",
        data: cipAllDepartmentData.map((data: any) => data.closedCount),
        backgroundColor: backgroundColors[3],
        yAxisID: "y",
      },
      {
        label: "Complete",
        data: cipAllDepartmentData.map((data: any) => data.completeCount),
        backgroundColor: backgroundColors[4],
        yAxisID: "y",
      },
      {
        label: "Dropped",
        data: cipAllDepartmentData.map((data: any) => data.droppedCount),
        backgroundColor: backgroundColors[5],
        yAxisID: "y",
      },
      {
        label: "InApproval",
        data: cipAllDepartmentData.map((data: any) => data.inApprovalCount),
        backgroundColor: backgroundColors[6],
        yAxisID: "y",
      },
      {
        label: "InProgress",
        data: cipAllDepartmentData.map((data: any) => data.inProgressCount),
        backgroundColor: backgroundColors[7],
        yAxisID: "y",
      },
      {
        label: "InReview",
        data: cipAllDepartmentData.map((data: any) => data.inReviewCount),
        backgroundColor: backgroundColors[8],
        yAxisID: "y",
      },
      {
        label: "InVerification",
        data: cipAllDepartmentData.map((data: any) => data.inVerificationCount),
        backgroundColor: backgroundColors[9],
        yAxisID: "y",
      },
      {
        label: "Edit",
        data: cipAllDepartmentData.map((data: any) => data.editCount),
        backgroundColor: backgroundColors[10],
        yAxisID: "y",
      },
    ];

    chartInstance.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels, // deptName as x-axis labels
        datasets, // datasets remain the same
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true, // Enable stacking on x-axis
          },
          y: {
            beginAtZero: true,
            stacked: true, // Enable stacking on y-axis
            ticks: {
              stepSize: 20,
              callback: (value) => (Number.isInteger(value) ? value : null),
            },
          },
        },
        plugins: {
          datalabels: {
            color: "white",
            font: {
              size: 14,
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
            text: "Department-wise Status Count",
            font: {
              size: 16,
              weight: "1",
              family: "'Poppins', sans-serif",
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
              case "Draft":
                ids = cipAllDepartmentData[index].draftIds;
                break;
              case "Approved":
                ids = cipAllDepartmentData[index].approvedIds;
                break;
              case "Cancelled":
                ids = cipAllDepartmentData[index].cancelledIds;
                break;
              case "Closed":
                ids = cipAllDepartmentData[index].closedIds;
                break;
              case "Complete":
                ids = cipAllDepartmentData[index].completeIds;
                break;
              case "Dropped":
                ids = cipAllDepartmentData[index].droppedIds;
                break;
              case "InApproval":
                ids = cipAllDepartmentData[index].inApprovalIds;
                break;
              case "InProgress":
                ids = cipAllDepartmentData[index].inProgressIds;
                break;
              case "InReview":
                ids = cipAllDepartmentData[index].inReviewIds;
                break;
              case "InVerification":
                ids = cipAllDepartmentData[index].inVerificationIds;
                break;
              case "Edit":
                ids = cipAllDepartmentData[index].editIds;
                break;
              default:
                ids = [];
            }
            setSelectedCipStatus("");
            setSelectedCipIdForAllDepartment(ids);
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
  }, [cipAllDepartmentData]);
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default CipAllDepartmentChart;
