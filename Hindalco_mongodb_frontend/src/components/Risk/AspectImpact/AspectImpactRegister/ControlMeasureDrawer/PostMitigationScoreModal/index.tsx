//react, reactrouter
import { useEffect, useState } from "react";

//antd
import { Modal, Tooltip } from "antd";

//material-ui
import { CircularProgress, useMediaQuery } from "@material-ui/core";

//styles
import useStyles from "./style";

type Props = {
  postMitigationScoreModal?: any;
  toggleScoreModal?: any;

  existingRiskConfig: any;
  //   setConfigData?: any;
  postMitigation?: any;
  setPostMitigation?: any;
  postScore?: any;
  setPostScore?: any;
  setSelectedPostScoreColor?: any;

  levelColor?: any;
  setLevelColor?: any;
  selectedCell?: any;
  setSelectedCell?: any;
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

const PostMitigationScoreModal = ({
  postMitigationScoreModal,
  toggleScoreModal,
  existingRiskConfig,
  postMitigation,
  setPostMitigation,
  postScore,
  setPostScore,
  setSelectedPostScoreColor,

  levelColor,
  setLevelColor,
  selectedCell = null,
  setSelectedCell,
}: Props) => {
  const classes = useStyles();
  // const [selectedCell, setSelectedCell] = useState<any>(null);
  const [tableData, setTableData] = useState<any>([]);
  const [scoreLegends, setScoreLegends] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<any>(false);
  const matches = useMediaQuery("(min-width:822px)");
  useEffect(() => {
    // console.log(
    //   "checkrisk config data in post mitigation-->",
    //   existingRiskConfig
    // );
    // console.log(
    //   "checkrisk post mitigation data in post mitigation-->",
    //   postMitigation
    // );

    setIsLoading(true);
    setTableData(constructTableData(postMitigation));
  }, [postMitigation]);

  useEffect(() => {
    // console.log("checkrisk tableData in post mitigation-->", tableData);
    if (!!tableData && !!tableData.length) {
      const maxScore = tableData.reduce((max: any, row: any) => {
        const rowMax = Math.max(...row.values);
        return rowMax > max ? rowMax : max;
      }, 0);
      const relevantRiskLevels = existingRiskConfig?.riskIndicatorData?.filter(
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

  useEffect(() => {
    console.log("check selected cell-->", selectedCell);
  }, [selectedCell]);

  const handleCellClick = (rowIndex: any, colIndex: any) => {
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
      setPostScore((rowIndex + 1) * (colIndex + 1));
    }
  };
  const getRiskColor = (value: number) => {
    for (let i = 0; i < existingRiskConfig?.riskLevelData.length; i++) {
      const [label, color] =
        existingRiskConfig?.riskLevelData[i]?.riskIndicator?.split("-");
      const [operator, riskValue] =
        existingRiskConfig?.riskLevelData[i].riskLevel.split("-");
      const compare = getComparisonFunction(operator);

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

  return (
    <>
      <Modal
        title={
          <div style={{ fontSize: matches ? "16px" : "14px", display:"flex"  }}>
            <div>
              {" "}
              Score: {(selectedCell?.[0] + 1) * (selectedCell?.[1] + 1)}
            </div>
            <div style={{ marginLeft: "auto", marginRight: "auto" }}>
              {" "}
              {!!selectedCell?.length
                ? `(Severity = ${selectedCell?.[0] + 1} * Probability = ${
                    selectedCell?.[1] + 1
                  })`
                : ""}{" "}
            </div>
          </div>
        }
        centered
        open={postMitigationScoreModal.open}
        onCancel={toggleScoreModal}
        onOk={toggleScoreModal}
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
                              selectedCell[0] === rowIndex && // Check if this row is selected
                              selectedCell[1] === colIndex; // Check if this column is selected

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
                  `This level represents ${label.trim()} risks.`; // Fallback description if not provided.
                const riskLevel = level?.riskLevel;
                return (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: color,
                      // backgroundColor: riskLevel === "<=-3"
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

export default PostMitigationScoreModal;
