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

type props = {
  allChartData?: any;
};

const AuditByProcessChart = ({ allChartData }: props) => {
  const chartRef3 = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    const ctx = chartRef3.current?.getContext("2d");
    if (ctx) {
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
      const counts =
        allChartData?.auditCoverage?.usedDocuments.map(
          (item: any) => item.count
        ) || [];
      const names =
        allChartData?.auditCoverage?.usedDocuments.map(
          (item: any) => item.name
        ) || [];

      // Destroy the previous chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Create a new chart instance
      chartInstanceRef.current = new ChartJS(ctx, {
        type: "line",
        data: {
          labels: names,
          datasets: [
            {
              label: "set1",
              data: counts,
              backgroundColor: BackgroundColor,
              borderColor: "#ff4d4d", // Change the color of the line
              borderWidth: 3,
            },
          ],
        },
        options: {
          responsive: true, // Make the chart responsive
          maintainAspectRatio: false, // Ensure the chart fills the container

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
              text: "Process",
              font: {
                size: 16,
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
                maxRotation: 0,
                minRotation: 0,
              },
            },
          },
        },
      });
    }

    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [allChartData]);
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={chartRef3} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default AuditByProcessChart;
