import React, { useEffect, useRef } from "react";

import { Chart as ChartJS } from "chart.js";
import { useMediaQuery } from "@material-ui/core";

type props = {
  sourceChartData?: any;
  setSelectedCapaIds?: any;
  showModalCharts?: any;
};

const BySourceChart = ({
  sourceChartData,
  setSelectedCapaIds,
  showModalCharts,
}: props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:470px)");
  const chartRef1 = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef1.current.getContext("2d");
    let chart = null as any;

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

      const names = sourceChartData?.map((item: any) => item?.Origin);
      const datas = sourceChartData?.map((item: any) => item?.count);

      chart = new ChartJS(ctx, {
        type: "bar",

        data: {
          labels: names,
          datasets: [
            {
              label: "Origin",
              data: datas,
              backgroundColor: BackgroundColor,
              // borderColor: BorderColor,
              borderWidth: 1,
              maxBarThickness: 60,
            },
          ],
        },

        options: {
          indexAxis: matches ? "y" : "x",
          responsive: true, // This line is added to make the graph non-responsive
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
              align: "start",
              text: "By Source",
              font: {
                size: 14,
                weight: "600",
                family: "'Poppins', sans-serif", // Change the font family here
              },
              color: "black",
              padding: {
                top: 10,
                bottom: 30,
              },
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
            },
          },
          //   onClick: (e, index) => {
          //     handleClickCipCost(e, index);

          //     // getCipCostTableData();
          //   },
          scales: {
            y: {
              grid: {
                drawOnChartArea: false, // removes vertical grid lines
                drawBorder: true, // keeps the X-axis line
                drawTicks: true, // optional: keeps X-axis ticks
              },
              //   stacked: true,
              ticks: {
                stepSize: 1,
                // callback: function (value, index, values) {
                //   if (Number.isInteger(value)) {
                //     return value;
                //   } else {
                //     return "";
                //   }
                // },
              },
            },

            x: {
              grid: {
                drawOnChartArea: false, // removes vertical grid lines
                drawBorder: true, // keeps the X-axis line
                drawTicks: true, // optional: keeps X-axis ticks
              },
              //   stacked: true,
              ticks: matches
                ? {
                    callback: function (value) {
                      return Number.isInteger(value) ? value : "";
                    },
                    color: "#4d4d4d",
                    font: {
                      size: 12,
                      weight: "bold",
                      family: "Poppins",
                    },
                  }
                : {},
            },
          },

          onClick: (event: any, elements: any[]) => {
            const points = chart.getElementsAtEventForMode(
              event,
              "nearest",
              { intersect: true },
              true
            );
            if (points.length) {
              const index = points[0].index;
              const ids = sourceChartData?.[index]?.ids || [];
              setSelectedCapaIds?.(ids);
              showModalCharts?.(true); // Optional: show modal on click
            }
          },
        },
      });
    }

    return () => {
      chart?.destroy();
    };
  }, [sourceChartData]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {" "}
      <canvas ref={chartRef1} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default BySourceChart;
