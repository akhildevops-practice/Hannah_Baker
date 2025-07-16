//react
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

//moment
import moment from "moment";

//antd
import {
  Table,
  Row,
  Col,
  Space,
  Tooltip,
  Button,
  DatePicker,
  Form,
  Pagination,
  Typography,
  Popover as AntdPopover,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { PaginationProps } from "antd";
import { ReactComponent as SignificantIcon } from "assets/icons/significantIcon.svg";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";


import ChatIcon from "@material-ui/icons/Chat";
import HistoryIcon from "@material-ui/icons/History";
import PeopleIcon from "@material-ui/icons/People";
//<--table icons

//thirdparty libs
import { useSnackbar } from "notistack";

//utils
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
//styles
import useStyles from "./style";
import "./new.css";

//components

import HiraWorkflowCommentsDrawer from "components/Risk/Hira/HiraRegisterReview/HiraWorkflowCommentsDrawer";
import HiraWorkflowHistoryDrawer from "components/Risk/Hira/HiraRegisterReview/HiraWorkflowHistoryDrawer";
import { Box, CircularProgress, IconButton, Popover } from "@material-ui/core";
import RiskScoreModal from "components/Risk/Hira/HiraRegister/RiskScoreModal";

const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;

const { RangePicker } = DatePicker;
const HiraRevisionHistoryPage = () => {
  const userDetails = getSessionStorage();
  const orgId = sessionStorage.getItem("orgId");
  const params = useParams<any>();
  const navigate = useNavigate();
  const location = useLocation();

  const [tableData, setTableData] = useState<any[]>([]);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);

  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [mitigationModal, setMitigationModal] = useState<any>({
    open: false,
    mode: "create",
    data: {},
  });
 
  const [hoveredRow, setHoveredRow] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [existingRiskConfig, setExistingRiskConfig] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [dateForm] = Form.useForm();
  const [iconColor, setIconColor] = useState("#380036");
  // const params = useParams();

  const [selectedJobTitle, setSelectedJobTitle] = useState<any>(null);

  // const [hiraConsolidatedStatus, setHiraConsolidatedStatus] =
  //   useState<any>("open");
  const [hiraInWorkflow, setHiraInWorkflow] = useState<any>(null);

  const [hiraWorkflowModal, setHiraWorkflowModal] = useState<any>({
    open: false,
    data: null,
    status: hiraInWorkflow?.status,
  });

  const [hiraStatus, setHiraStatus] = useState<any>("open");

  const [hiraWorkflowCommentsDrawer, setHiraWorkflowCommentsDrawer] =
    useState<any>({
      open: false,
      data: hiraInWorkflow,
    });

  const [hiraWorkflowHistoryDrawer, setHiraWorkflowHistoryDrawer] =
    useState<any>({
      open: false,
      data: hiraInWorkflow,
    });

  const [anchorEl, setAnchorEl] = useState(null);
  const openPopover = Boolean(anchorEl);
  const [anchorElDate, setAnchorElDate] = useState(null);

  const [riskScoreModal, setRiskScoreModal] = useState<any>({
    open: false,
    data: {},
  });

  const [levelColor, setLevelColor] = useState<any>("yellow");
  const [riskScore, setRiskScore] = useState<any>(0);
  const [selectedCell, setSelectedCell] = useState<any>(null);

  const [selectedWorkflowCycle, setSelectedWorkflowCycle] = useState<any>(null);
  const [selectedHiraId, setSelectedHiraId] = useState<any>(null);
  const classes = useStyles();
  const [hiraWithStepsLoading, setHiraWithStepsLoading] = useState<any>(false);
  const [hiraRegisterData, setHiraRegisterData] = useState<any>(null);
  const { enqueueSnackbar } = useSnackbar();


  useEffect(() => {
    fetchHiraConfig();
    if (!!params?.hiraId && params?.cycleNumber) {
      console.log("checkrisk7 params in revision page", params);
      
      setSelectedHiraId(location?.state?.jobTitle);
      setSelectedWorkflowCycle(parseInt(params?.cycleNumber));
      getHiraWithSteps(params?.hiraId, 1,10);
    }
  }, [params]);

  const getHiraWithSteps = async (hiraId : any, page:any=1, pageSize:any=10) => {
    try {
      setHiraWithStepsLoading(true);
      let query:any = `/api/riskregister/hira/getArchivedHiraWithSteps/${hiraId}?`;
      if(page && pageSize){
        query += `&page=${page}&pageSize=${pageSize}`;
      }
      const res = await axios.get(query);

      // console.log("checkrisk3 res in getHiraWithSteps", res);
      if(res?.status === 200) {
        if(res?.data?.steps && res?.data?.steps?.length) {
          let hiraDetails = res?.data?.hira;
          // getSectionOptions(hiraDetails?.entityId);
          // getAllAreaMaster(hiraDetails?.locationId);
          // hiraHeaderForm?.setFieldsValue({
          //   jobTitle: hiraDetails?.jobTitle,
          //   area: hiraDetails?.area,
          //   section: hiraDetails?.section,
          //   riskType: hiraDetails?.riskType,
          //   condition: hiraDetails?.condition,
          //   assesmentTeam: hiraDetails?.assesmentTeam,
          //   additionalAssesmentTeam: hiraDetails?.additionalAssesmentTeam,
          // });
          // setHiraHeaderFormData({
          //   jobTitle: hiraDetails?.jobTitle,
          //   area: hiraDetails?.area,
          //   section: hiraDetails?.section,
          //   entity: hiraDetails?.entityId,
          //   riskType: hiraDetails?.riskType,
          //   condition: hiraDetails?.condition,
          //   assesmentTeam: hiraDetails?.assesmentTeam,
          //   additionalAssesmentTeam: hiraDetails?.additionalAssesmentTeam
          // });
          setHiraRegisterData(res?.data?.hira);
          const stepsData = res?.data?.steps?.map((obj:any)=> ({
            ...obj,
            id : obj?._id,
            key : obj?._id,
            sNo : obj?.sNo,
            subStepNo : obj?.subStepNo,
            isOldEntry: true,
            highlight: false,
            hazardName : obj?.hazardTypeDetails?.name,
            responsiblePersonName : obj?.responsiblePerson ? obj?.responsiblePersonDetails?.firstname + " " + obj?.responsiblePersonDetails?.lastname : ""
          }))
          setTableData([...stepsData]);
          setPagination((prev) => ({ ...prev, total: res?.data?.stepsCount }));
          setHiraWithStepsLoading(false);
        }
      }
    }  catch (error:any) {
      setHiraWithStepsLoading(false);
      if (error?.response) {
        // Request was made, server responded with a status code out of the range of 2xx
        // console.log("Error response data:", error.response.data);
        // console.log("Error response status:", error.response.status);
        // console.log("Error response headers:", error.response.headers);
        if(error.response.status === 404){
          enqueueSnackbar("HIRA Not Found!", {
            variant: "error",
          });
          navigate("/risk/riskregister/HIRA");
        }
      } else {
        // Something else happened while making the request
        console.log("Error message:", error.message);
        enqueueSnackbar("Something went wrong while fetching HIRA", {
          variant: "error",
        })
        navigate("/risk/riskregister/HIRA");
      }
      console.log("Error config:", error.config);
    }
  }

  const getReviewedByDetails = () => {
    const latestOngoingWorkflow = hiraRegisterData?.workflow?.slice(hiraRegisterData?.workflow?.length -1)[0]
    if(latestOngoingWorkflow?.reviewedBy) {
      return {
        reviewedBy : latestOngoingWorkflow?.reviewedByUserDetails?.firstname + " " + latestOngoingWorkflow?.reviewedByUserDetails?.lastname,
        reviewedOn :moment(latestOngoingWorkflow?.reviewedOn).format("DD/MM/YYYY HH:mm")
      }
    } else return {reviewedBy : "N/A", reviewedOn : "N/A"}
  }

  const getApprovedByDetails = () => {
    console.log("checkrisk7 in getAPprovedby details revision pge HIRAregisterData", hiraRegisterData);
    
    const latestOngoingWorkflow = hiraRegisterData?.workflow?.slice(hiraRegisterData?.workflow?.length -1)[0]
    console.log("checkrisk7 in getAPprovedby details revision pge", latestOngoingWorkflow);
    
    if(latestOngoingWorkflow?.approvedBy) {
      return {
        approvedBy : latestOngoingWorkflow?.approvedByUserDetails?.firstname + " " + latestOngoingWorkflow?.approvedByUserDetails?.lastname,
        approvedOn :moment(latestOngoingWorkflow?.approvedOn).format("DD/MM/YYYY HH:mm")
      }
    } else return {approvedBy : "N/A", approvedOn : "N/A"}
  }

  // useEffect(() => {
  //   fetchRisks(selectedJobTitle);
  // }, [statusFilter, dateFilter, search]);


  const fetchHiraConfig = async () => {
    try {
      const res = await axios.get(`/api/riskconfig/getHiraConfig/${orgId}`);
      console.log("check res", res);
      if (res.status === 200 || res.status === 201) {
        if (!!res.data && !!res.data.length) {
          const data = res.data[0];
          setExistingRiskConfig({
            ...data,
            riskIndicatorData:
              data?.riskLevelData.map((item: any) => ({
                ...item,
                color: item.riskIndicator.split("-")[1],
              })) || [],
          });
        } else {
          setExistingRiskConfig(null);
        }
      }
    } catch (error) {
      console.log("errror in fetch config", error);
    }
  };

  const handleMouseEnter = (record: any) => {
    setHoveredRow(record.id);
  };

  const handleMouseLeave = () => {
    setHoveredRow(null);
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

  const columns: any = [
    {
      title: "S.No",
      dataIndex: "sNo",
      key: "sNo",
      editable: true,
      align: "center",
      width: "50px", // You can adjust the width as needed
      render: (text: any, record: any, index: number) => (
        <div
          style={{
            verticalAlign: "top", // Align text to the top
            // display: "block", // Make the content behave like a block element
          }}
        >
          {record?.subStepNo !== "" && parseFloat(record?.subStepNo) > 1.1 ? (
            <></>
          ) : (
            text
          )}
        </div>
      ),
    },

    {
      title: "Basic Step of Job",
      dataIndex: "jobBasicStep",
      key: "jobBasicStep",
      width: 250,
      editable: true,
      inputType: "text",
      render: (text: any, record: any) => {
        // console.log("checkrisk record -->", record);

        let displayText = text;
        let isTruncated = false;

        if (text && text.length > 30) {
          displayText = text.substring(0, 30) + "...";
          isTruncated = true;
        }
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {isTruncated ? (
              <>
                {record?.subStepNo !== "" &&
                parseFloat(record?.subStepNo) > 1.1 ? (
                  <></>
                ) : (
                  <>
                    <Tooltip title={text}>
                      <span>{displayText}</span>
                    </Tooltip>
                  </>
                )}
              </>
            ) : (
              <>
                {record?.subStepNo !== "" &&
                parseFloat(record?.subStepNo) > 1.1 ? (
                  <></>
                ) : (
                  <>
                    <span>{displayText}</span>
                  </>
                )}
              </>
            )}
          </div>
        );
      },
    },
    {
      title: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {" "}
          {/* <Tooltip title="Significant Criteria!" color="blue"> */}
          <AntdPopover
            content={
              <div>
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    // border: "1px solid #efefef",
                    padding: "4px",
                  }}
                >
                  Significant Criteria - (P * S) is greater than or equal to 8
                </p>
              </div>
            }
            trigger="click"
            // open={true}
            // onOpenChange={(visible) => setTourPopoverVisible(visible)}
          >
            <div style={{ marginRight: "20px" }}>
              <IconButton aria-label="help">
                <SignificantIcon />
              </IconButton>
            </div>
          </AntdPopover>
          {/* </Tooltip> */}
        </div>
      ),
      dataIndex: "significant",
      key: "significant",
      align: "center",
      editable: false, // This is computed field, not directly editable
      render: (_: any, record: any) => {
        if (!record.type) {
          // console.log("checkrisk s/ns record in significant", record);

          return record?.preProbability * record?.preSeverity >= 8 ? (
            <CheckCircleIcon style={{ fill: "#ED2939" }} />
          ) : (
            ""
          );
        }
      },
    },
    {
      title: "Hazard",
      dataIndex: "hazardTypeId",
      key: "hazardTypeId",
      // width: 300,
      editable: true,
      render: (_: any, record: any) => record?.hazardName || "N/A",
    },
    {
      title: "Hazard Description",
      dataIndex: "hazardDescription",
      // width: 400,
      key: "hazardDescription",
      editable: true,
      render: (_: any, record: any) => record?.hazardDescription || "N/A",
    },
    {
      title: "Impact",
      dataIndex: "impactText",
      // width: 400,
      key: "impactText",
      editable: true,
      render: (_: any, record: any) => record?.impactText || "N/A",
    },
    {
      title: "Existing Control Measure",
      dataIndex: "existingControl",
      key: "existingControl",
      editable: true,
      render: (_: any, record: any) => (
        <div style={{ whiteSpace: "pre-wrap" }}>
          {" "}
          {!record.type && record.existingControl}{" "}
        </div>
      ),
    },
    {
      title: "P",
      dataIndex: "preProbability",
      key: "preProbability",
      editable: true,
      align: "center",
      render: (_: any, record: any) => !record.type && record.preProbability,
    },
    {
      title: "S",
      dataIndex: "preSeverity",
      key: "preSeverity",
      align: "center",
      editable: true,
      render: (_: any, record: any) => !record.type && record.preSeverity,
    },
    {
      title: "P*S (Base Risk)",
      dataIndex: "preMitigationScore",
      key: "preMitigationScore",
      align: "center",
      editable: false, // This is computed field, not directly editable
      // render: (_: any, record: any) =>
      //   !record.type && (record?.preSeverity * record?.preProbability || "N/A"),
      render: (_: any, record: any) => {
        const score = record?.preSeverity * record?.preProbability || "N/A";
        return !record.type ? (
          <Tooltip title="Click For Risk Heatmap">
            <Typography.Link
              onClick={() => toggleScoreModal(record, "pre")}
              style={{ textDecoration: "underline" }}
            >
              {score}
            </Typography.Link>
          </Tooltip>
        ) : (
          "N/A"
        );
      },
    },

    {
      title: "Additional Control Measure",
      dataIndex: "additionalControlMeasure",
      key: "additionalControlMeasure",
      editable: true,
      render: (_: any, record: any) => (
        <div style={{ whiteSpace: "pre-wrap" }}>
          {" "}
          {!record.type && record.additionalControlMeasure}{" "}
        </div>
      ),
    },
    {
      title: "Responsible Person",
      dataIndex: "responsiblePerson",
      key: "responsiblePerson",
      editable: true,
      render: (_: any, record: any) => (
        <div style={{ whiteSpace: "pre-wrap", verticalAlign: "top" }}>
          {" "}
          {(!record.type && record?.responsiblePersonName) || ""}
        </div>
      ),
    },
    {
      title: "Implementation Status",
      dataIndex: "implementationStatus",
      key: "implementationStatus",
      editable: true,
      render: (_: any, record: any) => (
        <div style={{ whiteSpace: "pre-wrap" }}>
          {" "}
          {!record.type && record.implementationStatus}{" "}
        </div>
      ),
    },
    {
      title: "P",
      dataIndex: "postProbability",
      key: "postProbability",
      editable: true,
      align: "center",
      render: (_: any, record: any) => !record.type && record.postProbability,
    },
    {
      title: "S",
      dataIndex: "postSeverity",
      key: "postSeverity",
      editable: true,
      align: "center",
      render: (_: any, record: any) => !record.type && record.postSeverity,
    },
    {
      title: "P*S (Residual Risk)",
      dataIndex: "postMitigationScore",
      key: "postMitigationScore",
      editable: false, // This is computed field, not directly editable
      align: "center",
      render: (_: any, record: any) => {
        const score = record?.postSeverity * record?.postProbability || "N/A";
        return !record.type ? (
          <Typography.Link
            onClick={() => toggleScoreModal(record, "post")}
            style={{ textDecoration: "underline" }}
          >
            {score}
          </Typography.Link>
        ) : (
          <p>"N/A"</p>
        );
      },
    },
  ];

  const rowClassName = (record: any) => {
    return record.highlight ? "highlighted-row" : "";
  };

  const handleChangePageNew = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize: pageSize }));
    getHiraWithSteps(
      params?.hiraId,
      page,
      pageSize
    );
  };

  let filteredColumns = columns;
  let newJobBasicStepColumn: ColumnsType<any> = [
    {
      title: "Basic Step of Job",
      dataIndex: "jobBasicStep",
      key: "jobBasicStep",
      width: 200,
      render: (text, record: any) => {
        if (record.type) {
          // console.log("checkrisk hira columns recored", record);

          const parent = tableData.find((parentRecord) =>
            parentRecord.children?.some(
              (child: any) => child._id === record._id
            )
          );

          // console.log("checkrisk hira columns parent", parent);

          const color = determineColor(
            record.lastScore,
            existingRiskConfig?.riskIndicatorData
          );
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
                  {record?.jobTitle}
                </span>
                {!!record?.lastScore && (
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: color,
                      marginLeft: "5px",
                    }}
                  />
                )}
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
              // onClick={() => handleEdit(record.id)}
              style={{
                textDecorationLine: "underline",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {text}
            </div>
          </div>
        );
      },

      sorter: (a, b) => a.jobTitle.length - b.jobTitle.length,
      sortDirections: ["descend", "ascend"],
    },
  ];
  filteredColumns = columns.filter(
    (column: any) => column.key !== "jobTitle" && column.key !== "jobBasicStep"
  );
  filteredColumns = [...newJobBasicStepColumn, ...filteredColumns];

  const toggleScoreModal = (record: any, isPreOrPost = "") => {
    if (isPreOrPost === "pre") {
      setSelectedCell([record?.preProbability - 1, record?.preSeverity - 1]);
    } else {
      setSelectedCell([record?.postProbability - 1, record?.postSeverity - 1]);
    }
    console.log("checkrisk record in togle score modal--->", record);

    setRiskScoreModal({
      ...riskScoreModal,
      open: !riskScoreModal.open,
      mode : "view"
    });
  };

  const toggleCommentsDrawer = () => {
    setHiraWorkflowCommentsDrawer({
      ...hiraWorkflowCommentsDrawer,
      open: !hiraWorkflowCommentsDrawer.open,
      data: null,
    });
  };

  const toggleWorkflowHistoryDrawer = () => {
    setHiraWorkflowHistoryDrawer({
      ...hiraWorkflowHistoryDrawer,
      open: !hiraWorkflowHistoryDrawer.open,
      data: null,
    });
  };

  const handleWorkflowPeopleClick = (event: any) => {
    setAnchorEl(event.target);
    // setAnchorElDate(event.target);
  };

  const latestOngoingWorkflow = () => {
    return hiraRegisterData?.workflow?.slice(hiraRegisterData?.workflow?.length -1)[0]
  }

  return (
    <>
      {hiraWithStepsLoading ? (
        <Box
          marginY="auto"
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="40vh"
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Space
            direction="vertical"
            size="small"
            style={{ display: "flex", marginTop: "20px" }}
          >
            <div
              style={{
                display: "flex",
                // justifyContent:
                //   params.riskcategory === "HIRA"
                //     ? "space-between"
                //     : "space-between",
                gap: "15px",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              {params?.hiraId  && (
                  <Tooltip title="View Workflow Comments">
                    <ChatIcon
                      className={classes.commentsIcon}
                      onClick={() =>
                        setHiraWorkflowCommentsDrawer({
                          open: true,
                          data: hiraRegisterData,
                        })
                      }
                    />
                  </Tooltip>
                )}
              {params?.hiraId && (
                  <Tooltip title="Workflow History">
                    <HistoryIcon
                      className={classes.historyIcon}
                      onClick={() =>
                        setHiraWorkflowHistoryDrawer({
                          open: true,
                          data: {
                            workflow: hiraRegisterData?.workflow,
                            cycleToFind: parseInt(params?.cycleNumber || "1"),
                          },
                        })
                      }
                    />
                  </Tooltip>
                )}

              {params?.hiraId && (
                  <Tooltip title="Workflow People">
                    <IconButton
                      style={{
                        backgroundColor: "#F5F5F5",
                        borderRadius: "5px",
                        padding: 5,
                        marginLeft: "5px",
                      }}
                      onClick={(event: any) => handleWorkflowPeopleClick(event)}
                    >
                      <PeopleIcon />
                    </IconButton>
                  </Tooltip>
                )}
              <Popover
                open={openPopover}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
              >
                <div
                  style={{
                    padding: "20px",
                  }}
                >
                  <b>Reviewers :</b>{" "}
                  {getReviewedByDetails()?.reviewedBy}                  
                  <br />
                  <b>Approvers :</b>{" "}
                  {getApprovedByDetails()?.approvedBy}
                </div>
              </Popover>
              <Button
                data-testid="single-form-wrapper-button"
                onClick={() =>
                  navigate(
                    `/risk/riskregister/HIRA`
                  )
                }
                style={{
                  marginLeft: "15px",
                  justifyContent: "center",
                  alignItems: "center",
                  display: "flex",
                }}
              >
                <ChevronLeftIcon fontSize="small" />
                Back
              </Button>
            </div>

            <Row>
              <Col span={24}>
                <div
                  className={classes.tableContainer}
                  id="table1"
                >
                  <Table
                    columns={columns}
                    dataSource={tableData}
                    rowKey={"id"}
                    className={classes.riskTable}
                    rowClassName={rowClassName}
                    onRow={(record) => ({
                      onMouseEnter: () => handleMouseEnter(record),
                      onMouseLeave: handleMouseLeave,
                    })}
                    pagination={false}
                  />
                </div>
                <div className={classes.pagination}>
                  <Pagination
                    size="small"
                    current={pagination?.current}
                    pageSize={pagination?.pageSize}
                    total={pagination?.total}
                    showTotal={showTotal}
                    showSizeChanger
                    showQuickJumper
                    onChange={(page, pageSize) => {
                      handleChangePageNew(page, pageSize);
                    }}
                  />
                </div>
              </Col>
            </Row>
          </Space>

          <div>
            {!!hiraWorkflowCommentsDrawer.open && (
              <HiraWorkflowCommentsDrawer
                commentDrawer={hiraWorkflowCommentsDrawer}
                setCommentDrawer={setHiraWorkflowCommentsDrawer}
                toggleCommentsDrawer={toggleCommentsDrawer}
              />
            )}
          </div>

          <div>
            {!!hiraWorkflowHistoryDrawer.open && (
              <HiraWorkflowHistoryDrawer
                workflowHistoryDrawer={hiraWorkflowHistoryDrawer}
                handleCloseWorkflowHistoryDrawer={toggleWorkflowHistoryDrawer}
              />
            )}
          </div>

          {!!riskScoreModal.open && (
            <>
              <RiskScoreModal
                preMitigationScoreModal={riskScoreModal}
                toggleScoreModal={toggleScoreModal}
                existingRiskConfig={existingRiskConfig}
                preMitigation={[]}
                preScore={riskScore}
                setPreScore={setRiskScore}
                levelColor={levelColor}
                setLevelColor={setLevelColor}
                selectedCell={selectedCell}
                setSelectedCell={setSelectedCell}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default HiraRevisionHistoryPage;
