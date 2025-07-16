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

type props = {
  allChartData?: any;
};

const AuditByClauseChart = ({ allChartData }: props) => {
  const chartRef4 = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    const ctx = chartRef4.current?.getContext("2d");
    if (ctx) {
      const counts =
        allChartData?.findingsConducted?.clauseData.map(
          (item: any) => item.count
        ) || [];
      const names =
        allChartData?.findingsConducted?.clauseData.map(
          (item: any) => item.name
        ) || [];
      console.log("names", names);
      console.log("allChartData", allChartData);
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

      // Destroy the previous chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Create a new chart instance
      chartInstanceRef.current = new ChartJS(ctx, {
        type: "bar",
        data: {
          labels: names,
          datasets: [
            {
              label: "set1",
              data: counts,
              backgroundColor: BackgroundColor,
              borderWidth: 1,
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
              text: "By Clause",
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
              ticks: {
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0,
                callback: function (value, index: any, values: any) {
                  const maxLength = 10;
                  const label = names[index] || "";

                  console.log("Label at index", index, ":", label);

                  // Wrap long labels
                  const words = label.split(" ");
                  const wrappedLabel = words
                    .map((word: any, i: any) => {
                      if (i !== 0 && i % 2 === 0) return "\n" + word;
                      return word;
                    })
                    .join(" ");

                  console.log("Wrapped Label: ", wrappedLabel);

                  // Truncate if longer than maxLength
                  if (label.length > maxLength) {
                    return label.substring(0, maxLength) + "...";
                  }

                  return wrappedLabel;
                },
              },
              grid: {
                borderWidth: 3,
                lineWidth: 1,
              },
            },
          },
        },
      });
    }

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [allChartData]);
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={chartRef4} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default AuditByClauseChart;
