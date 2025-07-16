import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ChartTooltip,
  Legend
);

type Props = {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      fill: boolean;
    }[];
  };
};

const AspectTrendLineChart = ({ data }: Props) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  console.log("checka inside line chart");

  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");
    let chart = null as any;
    const staticData = {
      labels: ["2022", "2023", "2024", "2025", "2026"],
      datasets: [
        {
          label: "Power consumption to run the sawing machine",
          data: [1, 1.5, 1.2, 1.3, 1.6],
          borderColor: "#21618C",
          fill: false,
        },
        {
          label: "Power consumption to run the scalping machine",
          data: [1.2, 1.6, 1.4, 1.8, 2.0],
          borderColor: "#DC5F00",
          fill: false,
        },
        {
          label: "Power consumption to run the electrical furnace",
          data: [1.5, 2.0, 2.5, 2.3, 2.1],
          borderColor: "#686D76",
          fill: false,
        },
        {
          label: "Fume Generation",
          data: [0.8, 0.9, 1.0, 1.1, 1.2],
          borderColor: "#C73659",
          fill: false,
        },
      ],
    };

    if (ctx && data.labels.length > 0) {
      chart = new ChartJS(ctx, {
        type: "line",
        data: {
          // labels: staticData.labels,
          // datasets: staticData.datasets,
          labels: data.labels,
          datasets: data.datasets,
        },
        // options: {
        //   responsive: true,
        //   maintainAspectRatio: true,
        //   scales: {
        //     y: {
        //       beginAtZero: true,
        //       ticks: {
        //         stepSize: 1,
        //       },
        //     },
        //   },
        // },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
              afterFit: function (scale) {
                scale.width = 80; // reduces the scale width, creating a gap between y-axis and lines
              },
            },
            x: {
              afterFit: function (scale) {
                scale.height = 30; // reduces the scale height, creating a gap after the last label
              },
            },
          },
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: false,
              text: "",
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
            },
          },
          elements: {
            point: {
              radius: 0, // Removes the points from the line chart, if desired
            },
            line: {
              tension: 0.3, // Can adjust the line tension to make the line straight or curved
            },
          },
          layout: {
            padding: {
              left: 10,
              right: 20,
              top: 0,
              bottom: 0,
            },
          },
        },
      });
    }

    return () => {
      chart?.destroy();
    };
  }, [data]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <canvas ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default AspectTrendLineChart;

/**
 * 
 *     const staticData = {
      labels: ["FY22", "FY23", "FY24", "FY25", "FY26"],
      datasets: [
        {
          label: "Sludge Generation",
          data: [5, 6, 7, 6, 5],
          borderColor: "#3e95cd",
          fill: false,
        },
        {
          label: "Spillage/Leakage",
          data: [9, 8, 7, 8, 8],
          borderColor: "#8e5ea2",
          fill: false,
        },
        {
          label: "Generation & Dispose",
          data: [7, 6, 5, 6, 6],
          borderColor: "#3cba9f",
          fill: false,
        },
      ],
    };
 */
