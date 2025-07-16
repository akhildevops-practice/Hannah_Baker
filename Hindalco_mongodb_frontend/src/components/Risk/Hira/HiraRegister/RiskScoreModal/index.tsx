//react, reactrouter
import { useEffect, useState } from "react";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
//antd
import { Modal } from "antd";
// import Tooltip from "@material-ui/core/Tooltip";
import {Tooltip} from "antd"
//material-ui
import { CircularProgress, Typography, useMediaQuery } from "@material-ui/core";

//styles
import useStyles from "./style";
// import Popover from "@material-ui/core/Popover";
import IconButton from "@material-ui/core/IconButton";
// import Popover from "antd";
import { Popover, Button } from "antd"; // Import the Popover from antd
type Props = {
  //new
  preMitigationScoreModal?: any;
  toggleScoreModal?: any;
  existingRiskConfig?: any;
  riskScoreModal?: any;
  preMitigation?: any;
  setPreMitigation?: any;
  preScore?: any;
  setPreScore?: any;
  scoreData?: any;
  setScoreData?: any;
  score?: any;
  setScore?: any;
  levelColor?: any;
  setLevelColor?: any;
  isPreOrPost?: any;
  setIsPreOrPost?: any;
  selectedCell?: any;
  setSelectedCell?: any;
  handleOk?: any;
  handleSaveScore?: any;
  isAspImp?: any;
};

const getComparisonFunction = (operator: any) => {
  switch (operator) {
    case "<":
      return (a: any, b: any) => a < b;
    case ">":
      return (a: any, b: any) => a > b;
    case "<=":
      return (a: any, b: any) => a <= b;
    case ">=":
      return (a: any, b: any) => a >= b;
    default:
      return () => false;
  }
};

const RiskScoreModal = ({
  preMitigationScoreModal,
  toggleScoreModal,
  existingRiskConfig,
  preMitigation,
  setPreMitigation,
  preScore,
  setPreScore,
  scoreData,
  setScoreData,
  score,
  setScore,
  isPreOrPost,
  setIsPreOrPost,
  levelColor,
  setLevelColor,
  selectedCell = null,
  setSelectedCell,
  handleOk,
  handleSaveScore,
  riskScoreModal,
  isAspImp = false,
}: Props) => {
  const matches = useMediaQuery("(min-width:822px)");
  const classes = useStyles();
  // const [selectedCell, setSelectedCell] = useState<any>(null);
  const [tableData, setTableData] = useState<any>([]);
  const [scoreLegends, setScoreLegends] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [anchorEl, setAnchorEl] = useState<any>(null);
  useEffect(() => {
    // console.log(
    //   "checkrisk existingRiskConfig in RiskScoreModal-->",
    //   existingRiskConfig
    // );
    // console.log(
    //   "checkscore,  preMitigationScoreModal, selectedcell, riskScoreModal-->",
    //   preMitigationScoreModal,
    //   selectedCell,
    //   riskScoreModal
    // );

    setIsLoading(true);
    setTableData(constructTableData(existingRiskConfig?.hiraMatrixData));
  }, [existingRiskConfig, preMitigationScoreModal?.open]);

  // useEffect(() => {
  //   console.log("checkrisk in pre mitigation modal selectedCell", selectedCell);
  // }, [selectedCell]);

  useEffect(() => {
    // console.log("check tableData in pre mitigation-->", tableData);
    if (!!tableData && !!tableData.length) {
      const maxScore = tableData.reduce((max: any, row: any) => {
        const rowMax = Math.max(...row.values);
        return rowMax > max ? rowMax : max;
      }, 0);
      const relevantRiskLevels = existingRiskConfig?.riskLevelData?.filter(
        (level: any) => {
          const [, riskValue] = level.riskLevel
            .match(/([<>]=?)(-?\d+)/)
            .slice(1);
          return Number(riskValue) <= maxScore;
        }
      );
      setScoreLegends(relevantRiskLevels);
      setIsLoading(false);
    }
  }, [tableData]);

  // useEffect(() => {
  //   console.log("checkrisk scoreLegends-->", scoreLegends);
  // }, [scoreLegends]);

  const handleCellClick = (rowIndex: any, colIndex: any) => {
    if (preMitigationScoreModal.mode === "view") {
      // If the mode is "view", do not allow cell selection
      return;
    }

    if (
      selectedCell &&
      selectedCell[0] === rowIndex &&
      selectedCell[1] === colIndex
    ) {
      setSelectedCell(null); // Deselect the cell if it was already selected
    } else {
      if ((rowIndex + 1) * (colIndex + 1) < 5) {
        setLevelColor("green");
      } else if ((rowIndex + 1) * (colIndex + 1) < 10) {
        setLevelColor("yellow");
      } else if ((rowIndex + 1) * (colIndex + 1) < 15) {
        setLevelColor("orange");
      } else if ((rowIndex + 1) * (colIndex + 1) < 25) {
        setLevelColor("red");
      }

      setSelectedCell([rowIndex, colIndex]); // Otherwise, select the new cell
      handleSaveScore(riskScoreModal?.mode, [rowIndex, colIndex]);
      // console.log(
      //   "checkrisk handleClellclick",
      //   (rowIndex + 1) * (colIndex + 1)
      // );

      setPreScore((rowIndex + 1) * (colIndex + 1));
    }
  };

  const getRiskColor = (value: number) => {
    for (let i = 0; i < existingRiskConfig?.riskLevelData.length; i++) {
      const [label, color] =
        existingRiskConfig?.riskLevelData[i]?.riskIndicator?.split("-");
      const [operator, riskValue] =
        existingRiskConfig?.riskLevelData[i].riskLevel.split("-");
      const compare = getComparisonFunction(operator);
      // console.log("riskLevelData[i]-->", existingRiskConfig?.riskLevelData[i]);
      const riskLevel = existingRiskConfig?.riskLevelData[i]?.riskLevel;
      
      if (compare(value, Number(riskValue))) {
        // return riskLevel === "<=-3"
        //   ? "#52c41a"
        //   : riskLevel === "<=-6"
        //   ? "#ffec3d"
        //   : riskLevel === "<=-12"
        //   ? "#FF8C00"
        //   : "#f5222d";
        return existingRiskConfig?.riskIndicatorData[i].color;
      }
    }
    return "white";
  };

  const constructTableData = (cumulativeData: any) => {
    return cumulativeData?.map((item: any, index: number) => {
      // console.log("check item in construct table data-->", item);

      const rowIndex = index + 1;
      return {
        label: item?.criteriaType,
        values: [1, 2, 3, 4, 5].map((colIndex) => rowIndex * colIndex),
        texts: [
          item?.score1Text,
          item?.score2Text,
          item?.score3Text,
          item?.score4Text,
          item?.score5Text,
        ],
      };
    });
  };

  // Handle opening the popover
  const handlePopoverOpen = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the popover
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  // Check if the popover is open
  const open = Boolean(anchorEl);

  return (
    <>
      <Modal
        title={
          <div style={{ fontSize: matches ? "16px" : "14px", display: "flex" }}>
            <div>
              {" "}
              Score: {(selectedCell?.[0] + 1) * (selectedCell?.[1] + 1)}
            </div>
            <div style={{ marginLeft: "auto", marginRight: "auto" }}>
                <>
                  {!!selectedCell?.length
                    ? `(Severity = ${selectedCell?.[1] + 1} * Probability = ${
                        selectedCell?.[0] + 1
                      })`
                    : ""}{" "}
                </>
            </div>
          </div>
        }
        centered
        open={preMitigationScoreModal.open}
        onCancel={toggleScoreModal}
        onOk={toggleScoreModal}
        footer={isAspImp ? null : undefined}
        width={matches ? "70%" : "100%"}
      >
        {isLoading ? (
          <CircularProgress />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: matches ? "row" : "column",
              width: "100%",
              gap: matches ? "0px" : "15px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              {/* Y-Axis Label */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: "8px",
                  width: "100%",
                }}
              >
                {/* Rotated "Severity" text */}
                <div
                  style={{
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "14px",
                    marginRight: "10px",
                  }}
                >
                  Severity
                </div>

                {/* Table */}
                <div style={{ width: "100%", overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "center",
                      fontSize: "14px",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: "#f5f5f5",
                          fontWeight: "bold",
                        }}
                      >
                        <th colSpan={6} style={{ padding: "10px" }}>
                          Probability
                        </th>
                      </tr>
                      <tr>
                        {existingRiskConfig?.hiraMatrixHeader?.map(
                          (header: any, index: any) => (
                            <th
                              key={index}
                              style={{
                                padding: "8px",
                                border: "1px solid #ddd",
                                backgroundColor: "#f9fafb",
                              }}
                            >
                              {header}
                            </th>
                          )
                        ) ||
                          ["1", "2", "3", "4", "5"].map(
                            (header: any, index: any) => (
                              <th
                                key={index}
                                style={{
                                  padding: "8px",
                                  border: "1px solid #ddd",
                                  backgroundColor: "#f9fafb",
                                }}
                              >
                                {header}
                              </th>
                            )
                          )}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row: any, rowIndex: number) => (
                        <tr
                          key={rowIndex}
                          style={{
                            backgroundColor:
                              rowIndex % 2 === 0 ? "#ffffff" : "#f9f9f9",
                          }}
                        >
                          <td
                            style={{
                              padding: "8px",
                              fontWeight: "bold",
                              border: "1px solid #ddd",
                              backgroundColor: "#f4f7fb",
                            }}
                          >
                            {row.label}
                          </td>
                          {row.values.map((cellValue: any, colIndex: any) => {
                            const cellColor = getRiskColor(cellValue);

                            const isSelected =
                              selectedCell &&
                              selectedCell[1] === rowIndex && // Check if this row is selected
                              selectedCell[0] === colIndex; // Check if this column is selected

                            return (
                              <td
                                key={colIndex}
                                style={{
                                  padding: "8px",
                                  border: "1px solid #ddd",
                                  cursor: "pointer",
                                  backgroundColor: cellColor,
                                  position: "relative",
                                }}
                                onClick={() =>
                                  handleCellClick(rowIndex, colIndex)
                                }
                              >
                                <Tooltip
                                  title={row.texts[colIndex]} // Use the Ant Design Tooltip
                                  placement="top" // Optional: You can customize the tooltip placement
                                >
                                  <div
                                    style={{
                                      backgroundColor: isSelected
                                        ? `white`
                                        : cellColor,
                                      border: `8px solid ${cellColor}`,
                                      borderRadius: "50%",
                                      width: "35px",
                                      height: "35px",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      margin: "auto",
                                      boxShadow: isSelected
                                        ? "0 0 6px rgba(0, 0, 0, 0.3)"
                                        : "",
                                    }}
                                  >
                                    {cellValue}
                                  </div>
                                </Tooltip>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div
              style={{ marginLeft: "20px", width: "100%", maxWidth: "300px" }}
            >
              {scoreLegends?.map((level: any, index: any) => {
                const [label, color] = level.riskIndicator.split("-");
                const description =
                  level.description ||
                  `This level represents ${label.trim()} risks.`;
                const riskLevel = level?.riskLevel;
                return (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: color,
                      // riskLevel === "<=-3"
                      // ? "#52c41a"
                      // : riskLevel === "<=-6"
                      // ? "#ffec3d"
                      // : riskLevel === "<=-12"
                      // ? "#FF8C00"
                      // : "#f5222d",
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                      color: "black",
                      fontWeight: "bold",
                      width: "100%",
                      letterSpacing: "0.6px",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>{`${label.trim()} (${
                      level.riskLevel
                    })`}</div>
                    <div
                      style={{
                        fontWeight: "normal",
                        fontSize: "12px",
                        marginTop: "5px",
                        textAlign: "center",
                      }}
                    >
                      {description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
export default RiskScoreModal;
