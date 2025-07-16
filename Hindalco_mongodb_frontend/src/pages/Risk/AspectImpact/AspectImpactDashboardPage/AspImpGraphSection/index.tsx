import { Paper, Typography, useMediaQuery } from "@material-ui/core";

import { useEffect, useState } from "react";
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";
// import HiraRiskMeterChart from "./HiraRiskMeterChart";
import useStyles from "./style";
import CategoryDonughtChart from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactDashboard/CategoryDonughtChart";
import { Button, message, Modal, Table, Tag, Tooltip } from "antd";
import AspectTrendLineChart from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactDashboard/AspectTrendLineChart";
// import HiraScoreTrendChart from "./HiraScoreTrendChart";
import { ArrowsAltOutlined } from "@ant-design/icons";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import AspectImpactConsolidatedTableChart from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactDashboard/AspectImpactConsolidatedTableChart";
import { FileExcelTwoTone } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
type Props = {
  formData: any;
  impactGroupedData?: any;
  aspectGroupedData?: any;
  topTenData?: any;
  tableFilters?: any;
  setTableFilters?: any;
  tags?: any;
  tagsWithoutDeptFilter?: any;
  consolidatedCountTableData?: any;
};
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
  "#0585FC",
  "#F2BB00",
  "#7cbf3f",
  // Add more colors as needed
];

const AspImpGraphSection = ({
  formData,
  impactGroupedData,
  aspectGroupedData,
  topTenData,
  tableFilters,
  setTableFilters,
  tags,
  tagsWithoutDeptFilter,
  consolidatedCountTableData,
}: Props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const userDetails = getSessionStorage();
  const classes = useStyles();

  const nonZeroImpacts =
    impactGroupedData?.filter((item: any) => item.count > 0) || [];
  // split into two halves
  const mid = Math.ceil(nonZeroImpacts?.length / 2);
  const leftItems = nonZeroImpacts?.slice(0, mid);
  const rightItems = nonZeroImpacts?.slice(mid);

  const [isModalOpenForCategory, setIsModalOpenForCategory] = useState(false);

  const showModalForCategory = () => {
    setIsModalOpenForCategory(true);
  };
  const handleOkForCategory = () => {
    setIsModalOpenForCategory(false);
  };

  const handleCancelForCategory = () => {
    setIsModalOpenForCategory(false);
  };

  const [isModalOpenForScore, setIsModalOpenForScore] = useState(false);

  const showModalForScore = () => {
    setIsModalOpenForScore(true);
  };
  const handleOkForScore = () => {
    setIsModalOpenForScore(false);
  };

  const handleCancelForScore = () => {
    setIsModalOpenForScore(false);
  };

  const exportConsolidatedToExcel = () => {
    if (!consolidatedCountTableData?.length) {
      message.warning("No consolidated data to export.");
      return;
    }

    const excelData: any[] = [];

    consolidatedCountTableData.forEach((location: any) => {
      location.entityGroupedCount?.forEach((entity: any) => {
        excelData.push({
          "Corp Func/Unit": location.locationName,
          "Dept/Vertical": entity.entityName,
          Draft: entity.DRAFT ?? 0,
          "In Review": entity.IN_REVIEW ?? 0,
          "In Approval": entity.IN_APPROVAL ?? 0,
          Approved: entity.APPROVED ?? 0,
          Total: entity.total ?? 0,
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set all columns to width 20
    worksheet["!cols"] = new Array(Object.keys(excelData[0]).length).fill({
      wch: 20,
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Aspect Impact Consolidated"
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });

    const s2ab = (s: string) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
      return buf;
    };

    const data = new Blob([s2ab(excelBuffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, "Aspect_Impact_Consolidated_Report.xlsx");
  };

  const impactCountColumns = [
    {
      title: "Impact Category",
      dataIndex: "impactTypeName",
      key: "impactTypeName",
      //   width: 350,
    },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
      //   render: (text: any) => moment(text).format("DD/MM/YYYY HH:mm"),
    },
  ];

  const topTenAspImpColumns = [
    {
      title: "Dept/Vertical",
      dataIndex: "entityName",
      key: "entityName",
    },
    {
      title: "Stage",
      dataIndex: "jobTitle",
      key: "jobTitle",
      render: (text: any, record: any) => {
        let displayText = text;
        let isTruncated = false;

        if (text && text.length > 30) {
          displayText = text.substring(0, 30) + "...";
          isTruncated = true;
        }
        return isTruncated ? (
          <Tooltip title={text}>
            <div
              style={{
                verticalAlign: "top", // Align text to the top
                display: "flex",
                alignItems: "center",
                // textDecorationLine: "underline",
                // cursor: "pointer",
                // display: "block", // Make the content behave like a block element
              }}
              //   onClick={() => handleOpenHiraView(record)}
            >
              <span style={{ textTransform: "capitalize" }}>{displayText}</span>
            </div>
          </Tooltip>
        ) : (
          <div
            style={{
              verticalAlign: "top", // Align text to the top
              display: "flex",
              alignItems: "center",
              //   textDecorationLine: "underline",
              //   cursor: "pointer",
              // display: "block", // Make the content behave like a block element
            }}
            // onClick={() => handleOpenHiraView(record)}
          >
            <span style={{ textTransform: "capitalize" }}>{displayText}</span>
          </div>
        );
      },
    },
    {
      title: "Activity",
      dataIndex: "activity",
      key: "activity",
      render: (text: any, record: any) => {
        let displayText = text;
        let isTruncated = false;

        if (text && text.length > 30) {
          displayText = text.substring(0, 30) + "...";
          isTruncated = true;
        }
        return isTruncated ? (
          <Tooltip title={text}>
            {/* <div
              style={{
                verticalAlign: "top", // Align text to the top
                display: "flex",
                alignItems: "center",
                textDecorationLine: "underline",
                cursor: "pointer",
                // display: "block", // Make the content behave like a block element
              }}
              onClick={() => handleOpenHiraView(record)}
            > */}
            <span style={{ textTransform: "capitalize" }}>{displayText}</span>
            {/* </div> */}
          </Tooltip>
        ) : (
          //   <div
          //     style={{
          //       verticalAlign: "top", // Align text to the top
          //       display: "flex",
          //       alignItems: "center",
          //       textDecorationLine: "underline",
          //       cursor: "pointer",
          //       // display: "block", // Make the content behave like a block element
          //     }}
          //     // onClick={() => handleOpenHiraView(record)}
          //   >
          <span style={{ textTransform: "capitalize" }}>{displayText}</span>
          //   </div>
        );
      },
    },
    {
      title: "Score",
      dataIndex: "postMitigationScore",
      key: "postMitigationScore",
      //   render: (text: any) => moment(text).format("DD/MM/YYYY HH:mm"),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start", // Changed to flex-start to align items from the start
        flexWrap: "wrap",
        padding: "15px 0",
        margin: matches ? "3px 45px 10px 45px" : "3px 5px 10px 5px",
      }}
    >
      <Paper
        elevation={3}
        style={{
          position: "relative",
          width: matches ? "47%" : "100%",
          height: "320px",
          margin: matches ? " 0px 15px" : "30px 5px",
          padding: matches ? "10px" : "5px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        }}
      >
        {matches ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            {tags?.length ? (
              <>
                {tags?.map((tag: any, index: any) => (
                  <Tag color={tag?.color} key={index}>
                    {tag?.tagName}
                  </Tag>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>
        ) : null}
        <Typography
          variant="h6"
          align="center"
          gutterBottom
          style={{ fontSize: "16px", color: "black" }}
        >
          Life Cycle Stages By Category
        </Typography>
        <div style={{ display: "flex", width: "100%", flex: 1 }}>
          {/* Left Legends */}
          <div
            style={{
              width: "25%",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              overflowY: "auto",
              justifyContent: "center",
              maxHeight: "280px",
              alignSelf: "center",
            }}
          >
              {leftItems?.map((item: any, index: number) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "11px",
                    fontFamily: "Poppins",
                    cursor: "pointer",
                  }}
                  title={`${item.impactTypeName}: ${item.percentage}`}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      minWidth: "8px",
                      minHeight: "8px",
                      backgroundColor: backgroundColors[index],
                      borderRadius: "2px",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.impactTypeName}
                  </span>
                </div>
              ))}
          </div>

          {/* Chart */}
          <div style={{ width: "50%", height: "100%" }}>
            {!!aspectGroupedData?.labels?.length && (
              <CategoryDonughtChart
                impactTypeCounts={impactGroupedData}
                setTableFilters={setTableFilters}
                tags={tags}
              />
            )}
          </div>

          {/* Right Legends */}
          <div
            style={{
              width: "25%",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              overflowY: "auto",
              justifyContent: "center",
              maxHeight: "280px",
              alignSelf: "center",
            }}
          >
            {rightItems?.map((item: any, index: number) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "11px",
                    fontFamily: "Poppins",
                    cursor: "pointer",
                  }}
                  title={`${item.impactTypeName}: ${item.percentage}`}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      minWidth: "8px",
                      minHeight: "8px",
                      backgroundColor:
                        backgroundColors[
                          index + Math.ceil(impactGroupedData.length / 2)
                        ],
                      borderRadius: "2px",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.impactTypeName}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {matches ? (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              cursor: "pointer",
            }}
          >
            <ArrowsAltOutlined onClick={showModalForCategory} />
          </div>
        ) : null}
      </Paper>

      <Paper
        elevation={3}
        style={{
          width: matches ? "45%" : "100%", // Maintain width consistency
          height: "300px", // Set fixed height
          overflow: "auto", // Make it scrollable
          margin: matches ? "15px" : "0px",
          padding: matches ? "20px" : "5px",
          display: "flex",
          flexDirection: "column", // Align items vertically
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          position: "relative", // Ensure proper positioning for arrow
        }}
      >
        {matches ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            {tags?.length ? (
              <>
                {tags?.map((tag: any, index: any) => (
                  <Tag color={tag?.color} key={index}>
                    {tag?.tagName}
                  </Tag>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>
        ) : null}
        <Typography
          variant="h6"
          align="center"
          gutterBottom
          style={{ fontSize: "16px", color: "black" }}
        >
          Trend Analysis
        </Typography>
        {!!aspectGroupedData?.labels?.length && (
          <div style={{ flex: 1 }}>
            <AspectTrendLineChart data={aspectGroupedData} />
          </div>
        )}

        {matches ? (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
            }}
          >
            <ArrowsAltOutlined onClick={showModalForScore} />
          </div>
        ) : null}
      </Paper>

      <Paper
        elevation={3}
        style={{
          width: matches ? "47%" : "100%", // Maintain width consistent with other Papers
          height: "400px", // Set a fixed height
          overflow: "auto", // Make it scrollable
          margin: matches ? "15px" : "0px",
          padding: matches ? "20px" : "5px",
          display: "flex",
          flexDirection: "column", // Align items vertically
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        }}
      >
        <div className={classes.tableContainer}>
          {matches ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              {tags?.length ? (
                <>
                  {tags?.map((tag: any, index: any) => (
                    <Tag color={tag?.color} key={index}>
                      {tag?.tagName}
                    </Tag>
                  ))}
                </>
              ) : (
                <></>
              )}
            </div>
          ) : null}
          <Typography
            variant="h6"
            align="center"
            gutterBottom
            style={{ fontSize: "16px", color: "black" }}
          >
            By Impact Type
          </Typography>
          <Table
            columns={impactCountColumns}
            dataSource={impactGroupedData}
            pagination={false}
          />
        </div>
      </Paper>
      <Paper
        elevation={3}
        style={{
          width: matches ? "45%" : "100%", // Maintain width consistent with other Papers
          height: "400px", // Set a fixed height
          overflow: "auto", // Make it scrollable
          margin: matches ? "15px" : "0px",
          padding: matches ? "20px" : "5px",
          display: "flex",
          flexDirection: "column", // Align items vertically
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        }}
      >
        <div className={classes.tableContainer}>
          {matches ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              {tags?.length ? (
                <>
                  {tags?.map((tag: any, index: any) => (
                    <Tag color={tag?.color} key={index}>
                      {tag?.tagName}
                    </Tag>
                  ))}
                </>
              ) : (
                <></>
              )}
            </div>
          ) : null}
          <Typography
            variant="h6"
            align="center"
            gutterBottom
            style={{ fontSize: "16px", color: "black" }}
          >
            Top 10 Risks
          </Typography>
          <Table
            columns={topTenAspImpColumns}
            dataSource={topTenData}
            pagination={false}
          />
        </div>
      </Paper>

      <Paper
        elevation={3}
        style={{
          position: "relative",
          width: "100%", // Maintain width consistent with other Papers
          height: "400px", // Set a fixed height
          overflow: "auto", // Make it scrollable
          margin: matches ? "15px" : "15px 5px",
          padding: matches ? "10px" : "10px 5px",
          display: "flex",
          flexDirection: "column", // Ensures button and table stack correctly
          justifyContent: "flex-start",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        }}
      >
        {/* Button container - Right Aligned */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end", // Align button to the right
            padding: "12px 20px",
          }}
        >
          <Button
            type="primary"
            onClick={exportConsolidatedToExcel}
            icon={<FileExcelTwoTone />}
          >
            Download Excel
          </Button>
        </div>

        {/* Table below */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <AspectImpactConsolidatedTableChart
            consolidatedCountTableData={consolidatedCountTableData}
          />
        </div>
      </Paper>

      <Modal
        open={isModalOpenForCategory}
        onOk={handleOkForCategory}
        onCancel={handleCancelForCategory}
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
            width: "60vw",
            // height: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            {tags?.length ? (
              <>
                {tags?.map((tag: any, index: any) => (
                  <Tag color={tag?.color} key={index}>
                    {tag?.tagName}
                  </Tag>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>
          <Typography
            variant="h6"
            align="center"
            gutterBottom
            style={{ fontSize: "18px", color: "black", marginBottom: "20px" }}
          >
            Life Cycle Stages By Category
          </Typography>
          <div
            style={{
              width: "100%",
              height: "520px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", width: "100%" }}>
              {/* Left Legends */}
              <div
                style={{
                  width: "25%",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  overflowY: "auto",
                  justifyContent: "center",
                  maxHeight: "620px",
                  alignSelf: "center",
                }}
              >
                {leftItems?.map((item: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      fontSize: "16px",
                      fontFamily: "Poppins",
                      cursor: "pointer",
                    }}
                    title={`${item.impactTypeName}: ${item.percentage}`}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        minWidth: "16px",
                        minHeight: "16px",
                        backgroundColor: backgroundColors[index],
                        borderRadius: "4px",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: 500,
                      }}
                    >
                      {item.impactTypeName}
                    </span>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div style={{ width: "50%", height: "620px" }}>
                <CategoryDonughtChart
                  impactTypeCounts={impactGroupedData}
                  setTableFilters={setTableFilters}
                  tags={tags}
                  isModalView={true}
                />
              </div>

              {/* Right Legends */}
              <div
                style={{
                  width: "25%",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  overflowY: "auto",
                  justifyContent: "center",
                  maxHeight: "620px",
                  alignSelf: "center",
                }}
              >
                {rightItems?.map((item: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      fontSize: "16px",
                      fontFamily: "Poppins",
                      cursor: "pointer",
                    }}
                    title={`${item.impactTypeName}: ${item.percentage}`}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        minWidth: "16px",
                        minHeight: "16px",
                        backgroundColor:
                          backgroundColors[
                            index + Math.ceil(nonZeroImpacts.length / 2)
                          ],
                        borderRadius: "4px",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: 500,
                      }}
                    >
                      {item.impactTypeName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={isModalOpenForScore}
        onOk={handleOkForScore}
        onCancel={handleCancelForScore}
        width={800}
        style={{ display: "flex", justifyContent: "center" }}
        bodyStyle={{
          width: "800px",
          display: "flex",
          justifyContent: "center",
        }}
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
        <div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            {tags?.length ? (
              <>
                {tags?.map((tag: any, index: any) => (
                  <Tag color={tag.color} key={index}>
                    {tag.tagName}
                  </Tag>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>
          <Typography
            variant="h6"
            align="center"
            gutterBottom
            style={{ fontSize: "18px", color: "black", marginBottom: "20px" }}
          >
            Trend Analysis
          </Typography>
          <div
            style={{
              width: "550px",
              height: "400px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <AspectTrendLineChart
              data={aspectGroupedData}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AspImpGraphSection;
