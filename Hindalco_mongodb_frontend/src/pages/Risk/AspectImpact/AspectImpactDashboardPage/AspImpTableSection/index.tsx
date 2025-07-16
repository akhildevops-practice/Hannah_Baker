import { Tooltip } from "@material-ui/core";
import useStyles from "./style";
import { Space, Table, Tag, Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { PaginationProps } from "antd";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import HistoryIcon from "@material-ui/icons/History";
import ChatIcon from "@material-ui/icons/Chat";
import { useState } from "react";
import moment from "moment";

import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
type Props = {
  tableData: any;
  handleChangePageNewForAll?: any;
  paginationForAll?: any;
  showTotalForAll?: any;
  setFormType?: any;
  setAspImpDrawerOpen?: any;
  setRiskId?: any;
};

const expandIcon = ({ expanded, onExpand, record }: any) => {
  const icon = expanded ? <MinusCircleOutlined /> : <PlusCircleOutlined />;
  // console.log("record", record);
  if (record?.mitigations?.length > 0) {
    return <a onClick={(e) => onExpand(record, e)}>{icon}</a>;
  }
  return null;
};

const calculateIfSignificant = (rowData: any) => {
  if (rowData?.legalImpact === "Yes") {
    return true;
  } else if (rowData?.interestedParties?.length) {
    return true;
  } else {
    if (rowData?.mitigations && rowData?.mitigations?.length) {
      if (rowData?.postMitigationScore >= 9 || rowData?.postSeverity >= 3) {
        return true;
      }
    } else {
      if (rowData?.preMitigationScore >= 9 || rowData?.preSeverity >= 3) {
        return true;
      }
    }
  }
};

const getComparisonFunction = (operator: string) => {
  switch (operator) {
    case "<=":
      return (score: any, threshold: any) => score <= threshold;
    case "<":
      return (score: any, threshold: any) => score < threshold;
    case ">":
      return (score: any, threshold: any) => score > threshold;
    case ">=":
      return (score: any, threshold: any) => score >= threshold;
    default:
      return () => false;
  }
};
const determineColor = (score: number, riskConfig: any[]): string => {
  for (let config of riskConfig) {
    const [operator, threshold] = config.riskLevel.split("-");
    const compare = getComparisonFunction(operator);
    if (compare(score, Number(threshold))) {
      return config.riskIndicator.split("-")[1]; // Extracting color from the "Risk-label"
    }
  }
  return "white"; // Return a default color if none match
};

const AspImpTableSection = ({
  tableData,
  handleChangePageNewForAll,
  paginationForAll,
  showTotalForAll,
  setAspImpDrawerOpen,
  setFormType,
  setRiskId,
}: Props) => {
  const classes = useStyles();

  const navigate = useNavigate();

  const handleView = (id: any) => {
    setRiskId(id);
    setFormType("edit");
    setAspImpDrawerOpen(true);
  };

  const columns: ColumnsType<any> = [
    {
      title: "S.No",
      dataIndex: "sNo",
      key: "sNo",
      width: "100px", // You can adjust the width as needed
      align: "center",
      render: (text: any, _record: any, index: number) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Life Cycle Stage",
      dataIndex: "jobTitle",
      key: "jobTitle",
      width: 200,
      render: (text, record: any) => {
        let displayText = text;
        let isTruncated = false;

        if (text && text?.length > 15) {
          displayText = text.substring(0, 15) + "...";
          isTruncated = true;
        }
        if (record.type) {
          let displayTextForNestedRow = record?.comments;
          let isTruncatedForNestedRow = false;

          if (record?.comments && record?.comments?.length > 15) {
            displayTextForNestedRow = record?.comments.substring(0, 15) + "...";
            isTruncatedForNestedRow = true;
          }
          console.log("checkrisk inside record.type", record?.comments);

          // console.log("checkrisk hira columns recored", record);

         
          // If the current row has children, return text without the expand icon

          return (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  textDecorationLine: "underline",
                  cursor: "pointer",
                }}
                // onClick={() => handleEditMitigation(record, parent)}
              >
                <span style={{ textTransform: "capitalize" }}>
                  {" "}
                  {isTruncatedForNestedRow ? (
                    <Tooltip title={record?.comments}>
                      <span>{displayTextForNestedRow}</span>
                    </Tooltip>
                  ) : (
                    <span>{displayTextForNestedRow}</span>
                  )}
                </span>
              
              </div>
            </div>
          );
        }
        // Otherwise, return text with the expand icon
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              onClick={() => handleView(record.id)}
              style={{
                textDecorationLine: "underline",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {isTruncated ? (
                <Tooltip title={text}>
                  <span>{displayText}</span>
                </Tooltip>
              ) : (
                <span>{displayText}</span>
              )}
            </div>
            {/* {hoveredRow === record.id && (
              <div
                style={{
                  paddingRight: "10px",
                  color: "#636363",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
                onClick={() => handleEdit(record.id)}
              >
                <ExpandIcon /> <span>Open</span>
              </div>
            )} */}
          </div>
        );
      },

      sorter: (a, b) => a.jobTitle.length - b.jobTitle.length,
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Activities",
      dataIndex: "activity",
      key: "activity",
      width: 250,
      render: (text, record: any) => {
        let displayText = text;
        let isTruncated = false;

        if (text && text.length > 20) {
          displayText = text.substring(0, 20) + "...";
          isTruncated = true;
        }
        return (
          <>
            {isTruncated ? (
              <Tooltip title={text}>
                <span>{displayText}</span>
              </Tooltip>
            ) : (
              <span>{displayText}</span>
            )}
          </>
        );
      },
    },
    {
      title: "Aspect Type",
      dataIndex: "aspectType",
      key: "aspectType",
      // responsive: ["md"],
      render: (_: any, record: any) =>
        record?.selectedAspectType?.name || "N/A",
    },
    {
      title: "Specific Env. Aspect",
      dataIndex: "specificEnvAspect",
      key: "specificEnvAspect",
      width: 250,
      render: (text, record: any) => {
        let displayText = text;
        let isTruncated = false;

        if (text && text.length > 20) {
          displayText = text.substring(0, 20) + "...";
          isTruncated = true;
        }
        return (
          <>
            {isTruncated ? (
              <Tooltip title={text}>
                <span>{displayText}</span>
              </Tooltip>
            ) : (
              <span>{displayText}</span>
            )}
          </>
        );
      },
    },
    {
      title: "Created On",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200,
      render: (_: any, record: any) => {
        if (!!record.createdAt) {
          return moment(record.createdAt).format("DD-MM-YYYY");
        } else {
          return;
        }
      },
      //   ...getColumnSearchProps("createdAt"),
    },

    {
      title: "Impact Type",
      dataIndex: "impactType",
      key: "impactType",
      // responsive: ["md"],
      render: (_: any, record: any) =>
        !!record?.selectedImpactType?.name
          ? record?.selectedImpactType?.name
          : "N/A",
    },
    {
      title: "Specific Env. Impact",
      dataIndex: "specificEnvImpact",
      key: "specificEnvImpact",
      width: 250,
      render: (text, record: any) => {
        let displayText = text;
        let isTruncated = false;

        if (text && text.length > 20) {
          displayText = text.substring(0, 20) + "...";
          isTruncated = true;
        }
        return (
          <>
            {isTruncated ? (
              <Tooltip title={text}>
                <span>{displayText}</span>
              </Tooltip>
            ) : (
              <span>{displayText}</span>
            )}
          </>
        );
      },
    },
    {
      title: "Condition",
      dataIndex: "condition",
      key: "condition",
      // responsive: ["md"],
      render: (_: any, record: any) =>
        !!record?.selectedCondition?.name
          ? record?.selectedCondition?.name
          : "N/A",
    },
    {
      title: "Legal Impact",
      dataIndex: "legalImpact",
      key: "legalImpact",
      // responsive: ["md"],
      render: (_: any, record: any) =>
        record?.legalImpact === "Yes" ? (
          <CheckCircleIcon style={{ fill: "#ED2939" }} />
        ) : (
          ""
        ),
    },
    {
      title: "Dept/Vertical",
      dataIndex: "entity",
      key: "entity",
      // responsive: ["md"],
      render: (_: any, record: any) => !record.type && record.entity,
    },
    {
      title: "P",
      dataIndex: "preProbability",
      key: "preProbability",
      align: "center",
      render: (_: any, record: any) => !record.type && record.preSeverity,
    },
    {
      title: "S",
      dataIndex: "preSeverity",
      key: "preSeverity",
      align: "center",
      render: (_: any, record: any) => !record.type && record.preProbability,
    },
    {
      title: "Pre Score",
      dataIndex: "significanceScore",
      key: "significanceScore",
      width: 350,
      render: (_: any, record: any) => {
        if (record.preMitigationScore > 0 || record.postMitigationScore > 0) {
          const parent = tableData.find((parentRecord: any) =>
            parentRecord?.mitigations?.some(
              (child: any) => child._id === record._id
            )
          );
          //   const riskConfig =
          //     parent?.hiraConfigId?.riskLevelData?.map((item: any) => ({
          //       ...item,
          //       color: item.riskIndicator.split("-")[1],
          //     })) || [];

          //   const preColor =
          //     record.preMitigationScore > 0
          //       ? determineColor(
          //           record.preMitigationScore,
          //           riskConfig?.riskIndicatorData
          //         )
          //       : "transparent";

          const preScore =
            record?.preSeverity * record?.preProbability || "N/A";

          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                whiteSpace: "nowrap",
              }}
            >
              {record.preMitigationScore > 0 && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginRight: "10px",
                  }}
                >
                  {/* <div
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: preColor,
                      marginLeft: "5px",
                      marginRight: "5px",
                    }}
                  /> */}
                  {/* <Tooltip title="Click For Risk Heatmap"> */}
                  {/* <Typography.Link
                      onClick={() => toggleScoreModal(record, "pre")}
                      style={{ textDecoration: "underline" }}
                    > */}
                  {preScore}
                  {/* </Typography.Link> */}
                  {/* </Tooltip> */}
                </span>
              )}
              {record.preMitigationScore > 0 &&
                record.postMitigationScore > 0 && (
                  <span style={{ marginRight: "5px", marginLeft: "5px" }}>
                    |
                  </span>
                )}
            </div>
          );
        } else {
          return null; // return null or any placeholder if both scores are not greater than 0.
        }
      },
    },
    {
      title: "P",
      dataIndex: "postSeverity",
      key: "postSeverity",
      align: "center",
      render: (_: any, record: any) => !record.type && record.postSeverity,
    },
    {
      title: "S",
      dataIndex: "postProbability",
      key: "postProbability",
      align: "center",
      render: (_: any, record: any) => !record.type && record.postProbability,
    },
    {
      title: "Post Score",
      dataIndex: "significanceScore",
      key: "significanceScore",
      width: 350,
      render: (_: any, record: any) => {
        if (record.preMitigationScore > 0 || record.postMitigationScore > 0) {
          const parent = tableData.find((parentRecord: any) =>
            parentRecord?.mitigations?.some(
              (child: any) => child._id === record._id
            )
          );
          //   const riskConfig =
          //     parent?.hiraConfigId?.riskLevelData?.map((item: any) => ({
          //       ...item,
          //       color: item.riskIndicator.split("-")[1],
          //     })) || [];
          //   const postColor =
          //     record.postMitigationScore > 0
          //       ? determineColor(
          //           record.postMitigationScore,
          //           riskConfig?.riskIndicatorData
          //         )
          //       : "transparent";
          const postScore =
            record?.postSeverity * record?.postProbability || "N/A";
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                whiteSpace: "nowrap",
              }}
            >
              {record.postMitigationScore > 0 && (
                <span style={{ display: "flex", alignItems: "center" }}>
                  {/* <div
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: postColor,
                      marginLeft: "5px",
                      marginRight: "5px",
                    }}
                  /> */}
                  {/* <Typography.Link
                    onClick={() => toggleScoreModal(record, "post")}
                    style={{ textDecoration: "underline" }}
                  > */}
                  {postScore}
                  {/* </Typography.Link> */}
                </span>
              )}
            </div>
          );
        } else {
          return null; // return null or any placeholder if both scores are not greater than 0.
        }
      },
    },
    {
      //   title: (
      //     <div
      //       style={{
      //         display: "flex",
      //         alignItems: "center",
      //         justifyContent: "center",
      //       }}
      //     >
      //       {" "}
      //       {/* <Tooltip title="Significant Criteria!" color="blue"> */}
      //       <AntdPopover
      //         content={
      //           <div>
      //             <p style={{ padding: "1px" }}>
      //               {
      //                 "Product of severity and probability >= 9, the aspect will be considered significant."
      //               }
      //             </p>
      //             <p style={{ padding: "1px" }}>
      //               Severity score is higher than 3, the aspect will be considered
      //               significant.
      //             </p>
      //             <p style={{ padding: "1px" }}>
      //               Any legal requirement and interested party concerns will be
      //               considered significant.
      //             </p>
      //           </div>
      //         }
      //         trigger="click"
      //         // open={true}
      //         // onOpenChange={(visible) => setTourPopoverVisible(visible)}
      //       >
      //         <div style={{ marginRight: "20px" }}>
      //           <IconButton aria-label="help">
      //             <SignificantIcon />
      //           </IconButton>
      //         </div>
      //       </AntdPopover>
      //       {/* </Tooltip> */}
      //     </div>
      //   ),
      title: "Siginficant",
      dataIndex: "significant",
      key: "significant",
      // responsive: ["md"],
      render: (_: any, record: any) => {
        if (!record.type) {
          // console.log("checkrisk s/ns record in significant", record);

          return calculateIfSignificant(record) ? (
            <CheckCircleIcon style={{ fill: "#ED2939" }} />
          ) : (
            ""
          );
        }
      },
    },
  ];
  const rowClassName = (record: any) => {
    return record.highlight ? "highlighted-row" : "";
  };

  const mitigationColumns: ColumnsType<any> = [
    {
      title: "Additional Control Measure",
      dataIndex: "comments",
      key: "comments",
      width: 250,
      render: (text, record: any) => {
        let displayText = text;
        let isTruncated = false;

        if (text && text.length > 20) {
          displayText = text.substring(0, 20) + "...";
          isTruncated = true;
        }
        // const parent = tableData.find((parentRecord) =>
        //   parentRecord?.mitigations?.some(
        //     (child: any) => child._id === record._id
        //   )
        // );
        // const color = determineColor(
        //   record.lastScore,
        //   existingRiskConfig?.riskIndicatorData
        // );
        return (
          <>
            {isTruncated ? (
              <div>
                <Tooltip title={text}>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      textDecorationLine: "underline",
                      cursor: "pointer",
                    }}
                    // onClick={() => handleEditMitigation(record, parent)}
                  >
                    {displayText}
                  </span>
                </Tooltip>
                {/* {!!record?.lastScore && (
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: color,
                      marginLeft: "5px",
                    }}
                  />
                )} */}
              </div>
            ) : (
              <div>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    textDecorationLine: "underline",
                    cursor: "pointer",
                  }}
                  //   onClick={() => handleEditMitigation(record, parent)}
                >
                  {displayText}
                </span>
                {/* {!!record?.lastScore && (
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: color,
                      marginLeft: "5px",
                    }}
                  />
                )} */}
              </div>
            )}
          </>
        );
      },
    },
    {
      title: "Stage",
      dataIndex: "stage",
      key: "stage",
      // responsive: ["md"],
      render: (_: any, record: any) => _,
    },
    {
      title: "Responsible Person",
      dataIndex: "responsiblePerson",
      key: "responsiblePerson",
      width: 250,
      render: (text, record: any) => {
        return (
          <>
            {record?.responsiblePersonDetails
              ? record?.responsiblePersonDetails?.firstname +
                " " +
                record?.responsiblePersonDetails?.lastname
              : record?.responsiblePerson
              ? record?.responsiblePerson
              : ""}
          </>
        );
      },
    },
  ];

  return (
    <>
      <div
        className={classes.tableContainer}
        id="table1"
        // style={{  height: "300px" }}
      >
        <Table
          columns={columns}
          dataSource={tableData}
          expandable={{
            expandedRowRender: (record: any) => {
              return (
                <Table
                  className={classes.subTableContainer}
                  style={{
                    width: 1200,
                    paddingBottom: "20px",
                    paddingTop: "20px",
                  }}
                  columns={mitigationColumns}
                  bordered
                  dataSource={record?.mitigations}
                  pagination={false}
                />
              );
            },
            expandIcon,
          }}
          rowKey={"id"}
          // className={classes.riskTable}
          rowClassName={rowClassName}
          //   onRow={(record) => ({
          //     onMouseEnter: () => handleMouseEnter(record),
          //     onMouseLeave: handleMouseLeave,
          //   })}
          pagination={false}
        />
      </div>
      <div className={classes.pagination}>
        <Pagination
          size="small"
          current={paginationForAll?.current}
          pageSize={paginationForAll?.pageSize}
          total={paginationForAll?.total}
          showTotal={showTotalForAll}
          showSizeChanger
          showQuickJumper
          onChange={(page, pageSize) => {
            handleChangePageNewForAll(page, pageSize);
          }}
        />
      </div>
    </>
  );
};

export default AspImpTableSection;
