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
import { useMediaQuery } from "@material-ui/core";

type props = {
  chartData?: any;
  handleClickCipCost?: any;
};

const TopCipsChart = ({ chartData, handleClickCipCost }: props) => {
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

      const names = chartData?.highCostWiseData?.map(
        (item: any) => item?.title
      );
      const datas = chartData?.highCostWiseData?.map((item: any) => item?.cost);

      chart = new ChartJS(ctx, {
        type: "bar",

        data: {
          labels: names,
          datasets: [
            {
              label: "set1",
              data: datas,
              backgroundColor: BackgroundColor,
              // borderColor: BorderColor,
              borderWidth: 1,
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
              text: "Top 5 Cips with Status in terms of Value(Open)",
              font: {
                size: 16,
                weight: "1",
                family: "'Poppins', sans-serif", // Change the font family here
              },
              align: "center",
              color: "black",
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
          onClick: (e, index) => {
            handleClickCipCost(e, index);

            // getCipCostTableData();
          },
          scales: {
            y: {
              grid: {
                borderWidth: 3,
                lineWidth: 1,
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
                borderWidth: 3,
                lineWidth: 1,
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

          // onClick: handleClick,
        },
      });
    }

    return () => {
      chart?.destroy();
    };
  }, [chartData, matches]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {" "}
      <canvas ref={chartRef1} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default TopCipsChart;
