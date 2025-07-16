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

import { Paper, useMediaQuery } from "@material-ui/core";
import FilterListIcon from "@material-ui/icons/FilterList";
import { Modal } from "antd";
import { Button, Col, DatePicker, Form, Row, Select } from "antd";
import axios from "apis/axios.global";
import AuditFindingsTable from "./AuditFindingsTable";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { ArrowsAltOutlined } from "@ant-design/icons";
import AuditByProcessChart from "./AuditByProcessChart";
import AuditByClauseChart from "./AuditByClauseChart";
import AuditBySystemChart from "./AuditBySystemChart";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  ChartTooltip,
  Legend
);

interface Dataset {
  label: string;
  data: number[];
  backgroundColor: any;
}
type props = {
  allChartData?: any;
  selectedUnits?: any;
  setSelectedUnits?: any;
  selectedAuditType?: any;
  setSelectedAuditType?: any;
  setAuditTableData?: any;
  showModalCharts?: any;
  setSelectedDateRange?: any;
  getChartData?: any;
};

const AuditDCharts = ({
  allChartData,
  selectedUnits,
  setSelectedUnits,
  selectedAuditType,
  setSelectedAuditType,
  setAuditTableData,
  showModalCharts,
  setSelectedDateRange,
  getChartData,
}: props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);

  // const [selectedfilterLocation, setSelectedfilterLocation] = useState([
  //   userInfo.location.locationName,
  // ]);
  const [tableData, setTableData] = useState();

  const [selectedSystemId, setSelectedSystemId] = useState();

  const handleClickSystem = (e: any, index: any) => {
    const indexToMatch = index[0]?.index;

    const matchedObject = allChartData?.system[indexToMatch];

    const matchedId = matchedObject?.id;
    setSelectedSystemId(matchedId);
    showModalCharts();
  };

  // const handleClickSystem = (e: any, index: number) => {
  //   const matchedObject = allChartData?.system[index];

  //   if (matchedObject) {
  //     const matchedId = matchedObject.id;
  //     setSelectedSystemId(matchedId);
  //     showModalCharts();
  //   } else {
  //     console.error("No matched object found at index", index);
  //   }
  // };

  const handleClickProcess = (e: any, index: any) => {
    const indexToMatch = index[0]?.index;
    if (typeof indexToMatch !== "undefined") {
      const matchedObject =
        allChartData.auditCoverage.usedDocuments[indexToMatch];

      if (matchedObject) {
        const matchedId = matchedObject.id;
        setTableData(matchedId);
      }
    }
  };

  const handleClickAgeing = (e: any, index: any) => {
    const indexToMatch = index[0]?.index;

    if (typeof indexToMatch !== "undefined") {
      const matchedObject = allChartData?.ageAnalysis?.datasets[indexToMatch];

      if (matchedObject) {
        const matchedId = matchedObject.label;
        setTableData(matchedId);
      }
    }
  };

  useEffect(() => {
    getTableDataBySystem();
  }, [selectedSystemId]);

  const getTableDataBySystem = async () => {
    const response = await axios.get(
      `/api/audits/chartData?location[]=${selectedUnits.id}&auditType[]=${selectedAuditType?.id}&clickedSystem=${selectedSystemId}`
    );
    setAuditTableData(response.data.tableData);
  };

  const chartRef5 = useRef<any>(null);

  useEffect(() => {
    const ctx = chartRef5.current.getContext("2d");
    let chart = null as any;
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

    if (ctx) {
      const data = allChartData?.ageAnalysis;
      console.log("data", data);

      if (data) {
        // Prepare datasets
        const datasets = data?.datasets.map((dataset: any) => {
          return {
            label: dataset.label,
            backgroundColor: BackgroundColor,
            data: dataset?.data.map((range: number[]) => {
              // Generate an array containing the values within the range
              const valuesInRange = [];
              for (let i = range[0]; i <= range[1]; i++) {
                valuesInRange.push(i);
              }
              return valuesInRange;
            }),
          };
        });
        console.log("datasets", datasets);

        chart = new ChartJS(ctx, {
          type: "bar",
          data: {
            labels: data.labels,
            datasets: datasets,
          },
          options: {
            indexAxis: "y",
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
              datalabels: {
                color: "white",
                font: {
                  size: 0,
                },
              },
              legend: {
                display: false,
                position: "right",
              },
              title: {
                display: true,
                text: "Ageing Analysis by Findings Type",
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
                  // color: "#4d4d4d",
                  // font: {
                  //   size: 12,
                  //   weight: "bold",
                  // },
                  callback: function (value, index, values) {
                    if (Number.isInteger(value)) {
                      return value;
                    } else {
                      return "";
                    }
                  },
                },
                stacked: true,
              },
              x: {
                grid: {
                  borderWidth: 3,
                  lineWidth: 1,
                },
                ticks: {
                  // color: "#4d4d4d",
                  // font: {
                  //   size: 12,
                  //   weight: "bold",
                  // },
                  callback: function (value, index, values) {
                    if (Number.isInteger(value)) {
                      return value;
                    } else {
                      return "";
                    }
                  },
                },
                stacked: true,
              },
            },
            onClick: (e, index) => {
              handleClickAgeing(e, index);
            },
          },
        });
      }
    }

    return () => {
      chart?.destroy();
    };
  }, [allChartData]);

  // Modals

  // modal for system chart

  const [isModalOpenForSystemChart, setIsModalOpenForSystemChart] =
    useState(false);

  const showModalForSystemChart = () => {
    setIsModalOpenForSystemChart(true);
  };

  const handleOkForSystemChart = () => {
    setIsModalOpenForSystemChart(false);
  };

  const handleCancelForSystemChart = () => {
    setIsModalOpenForSystemChart(false);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
    // handleFilterClick();
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [isModalOpenForClauseChart, setIsModalOpenForClauseChart] =
    useState(false);

  const showModalForClauseChart = () => {
    setIsModalOpenForClauseChart(true);
    // handleFilterClick();
  };

  const handleOkForClauseChart = () => {
    setIsModalOpenForClauseChart(false);
  };

  const handleCancelForClauseChart = () => {
    setIsModalOpenForClauseChart(false);
  };

  // modal for table
  const [auditFindingTable, setAuditFindingTable] = useState(false);
  const [isModalOpenForTable, setIsModalOpenForTable] = useState(false);

  const showModalForTablet = () => {
    setIsModalOpenForTable(true);
    setAuditFindingTable(true);
  };

  const handleOkForTable = () => {
    setIsModalOpenForTable(false);
    setAuditFindingTable(false);
  };

  const handleCancelForTable = () => {
    setIsModalOpenForTable(false);
    setAuditFindingTable(false);
  };

  const [locations, setLocations] = useState([]);
  const handleFilterClick = () => {
    const locationNames = allChartData?.findingData.map(
      (item: any) => item?.locationName
    );
    setLocations(locationNames);
  };

  return (
    <div style={{ padding: matches ? "0px 20px" : "0px 10px" }}>
      <div
        style={{
          display: "flex",

          justifyContent: "space-evenly",
          // width: "100vw",
          flexWrap: "wrap",
          // backgroundColor: "#F8F9F9",
          // backgroundColor: "red",
          paddingBottom: "15px",
        }}
      >
        {/* <Paper
          elevation={0}
          style={{
            marginTop: "15px",
            padding: "15px",
            border: "1px solid #d7cdc1",
            borderRadius: "5px",
            display: "flex",
            width: "450px",
            height: "280px",
          }}
        >
          <div style={{ width: "400px", height: "260px" }}>
            <AuditBySystemChart
              allChartData={allChartData}
              handleClickSystem={handleClickSystem}
            />
          </div>

          <ArrowsAltOutlined onClick={showModalForSystemChart} />
       
        </Paper> */}

        <Paper
          elevation={0}
          style={{
            marginTop: "15px",
            padding: matches ? "15px" : "5px",
            border: "1px solid #d7cdc1",
            borderRadius: "5px",
            display: "flex",
            width: matches ? "450px" : "100%",
            height: "280px",
          }}
        >
          <AuditByProcessChart allChartData={allChartData} />
          {matches ? <ArrowsAltOutlined onClick={showModal} /> : null}
        </Paper>

        <Paper
          elevation={0}
          style={{
            marginTop: "15px",
            padding: matches ? "15px" : "5px",
            border: "1px solid #d7cdc1",
            borderRadius: "5px",
            display: "flex",
            width: matches ? "450px" : "100%",
            height: "280px",
          }}
        >
          <div style={{ width: matches ? "400px" : "96%", height: "260px" }}>
            <AuditByClauseChart allChartData={allChartData} />
          </div>

          {matches ? (
            <ArrowsAltOutlined onClick={showModalForClauseChart} />
          ) : null}
        </Paper>

        <Paper
          elevation={0}
          style={{
            marginTop: "15px",
            padding: matches ? "15px" : "5px",
            border: "1px solid #d7cdc1",
            borderRadius: "5px",
            width: matches ? "450px" : "100%",
            height: "280px",
          }}
        >
          <div style={{ width: "100%", height: "100%" }}>
            <canvas
              ref={chartRef5}
              // width={matches ? "420" : "100%"}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </Paper>
        <Paper
          elevation={0}
          style={{
            marginTop: "15px",
            padding: matches ? "15px" : "5px",

            width: "100%",
            // border: "1px solid #d7cdc1",
            borderRadius: "5px",
            // overflowX: "scroll",
          }}
        >
          <AuditFindingsTable
            allChartData={allChartData}
            auditFindingTable={auditFindingTable}
          />
          {/* <ArrowsAltOutlined
            onClick={showModalForTablet}
            style={{ marginLeft: "10px" }}
          /> */}
        </Paper>
        {/* <div>
          <canvas
            ref={chartRef}
            width="340"
            height="195"
            style={{ marginTop: "15px", padding: "15px" }}
          />
        </div> */}
      </div>

      {/* // -----------------Modals-------------------------- */}

      <Modal
        // title="Basic Modal"
        open={isModalOpenForSystemChart}
        onOk={handleOkForSystemChart}
        onCancel={handleCancelForSystemChart}
        width="90vw"
        style={{ display: "flex", justifyContent: "center" }}
        footer={null}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "38px",
              cursor: "pointer",
              marginTop: "-5px",
            }}
          />
        }
      >
        <div
          style={{
            width: "80vw",
            height: "60vh",
            padding: "10px 100px",
          }}
        >
          <AuditBySystemChart
            allChartData={allChartData}
            handleClickSystem={handleClickSystem}
          />
        </div>
      </Modal>

      <Modal
        // title="Basic Modal"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width="90vw"
        style={{ display: "flex", justifyContent: "center" }}
        footer={null}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "38px",
              cursor: "pointer",
              marginTop: "-5px",
            }}
          />
        }
      >
        <div
          style={{
            width: "80vw",
            height: "60vh",
          }}
        >
          <AuditByProcessChart allChartData={allChartData} />
        </div>
      </Modal>

      <Modal
        // title="Basic Modal"
        open={isModalOpenForClauseChart}
        onOk={handleOkForClauseChart}
        onCancel={handleCancelForClauseChart}
        width="90vw"
        style={{ display: "flex", justifyContent: "center" }}
        footer={null}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "38px",
              cursor: "pointer",
              marginTop: "-5px",
            }}
          />
        }
      >
        <div
          style={{
            width: "80vw",
            height: "60vh",
          }}
        >
          <AuditByClauseChart allChartData={allChartData} />
        </div>
      </Modal>

      <Modal
        // title="Basic Modal"
        open={isModalOpenForTable}
        onOk={handleOkForTable}
        onCancel={handleCancelForTable}
        width="90vw"
        zIndex={2000}
        style={{ display: "flex", justifyContent: "center" }}
        footer={null}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "38px",
              cursor: "pointer",
              marginTop: "-5px",
            }}
          />
        }
      >
        <div
          style={{
            width: "86vw",
            height: "60vh",
            marginTop: "25px",
          }}
        >
          <AuditFindingsTable
            allChartData={allChartData}
            auditFindingTable={auditFindingTable}
          />
        </div>
      </Modal>
    </div>
  );
};

export default AuditDCharts;
