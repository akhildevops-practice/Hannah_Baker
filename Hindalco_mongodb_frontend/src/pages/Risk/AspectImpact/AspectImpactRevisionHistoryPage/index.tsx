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
  Input,
  Select,
  Tag,
  DatePicker,
  Form,
  Checkbox,
  Pagination,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { CheckboxValueType } from "antd/es/checkbox/Group";
import type { PaginationProps } from "antd";

//material-ui icons
//<--kebab menu icons -->

import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";

//saved icon <-- filter icon -->
import { ReactComponent as FilterLogo } from "assets/icons/filter-solid.svg";
import { ReactComponent as ExpandIcon } from "assets/icons/row-expand.svg";

//thirdparty libs
import { useSnackbar } from "notistack";

//utils
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";
import { navbarColorAtom } from "recoil/atom";
import { useSetRecoilState } from "recoil";

//assets
import { ReactComponent as AuditPlanIcon } from "assets/moduleIcons/Audit-plan.svg";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
//styles
import useStyles from "./style";
import "./new.css";

//components

import ControlMeasureDrawer from "components/Risk/AspectImpact/AspectImpactRegister/ControlMeasureDrawer";

import { Box, CircularProgress, IconButton, Popover } from "@material-ui/core";
import RiskScoreModal from "components/Risk/Hira/HiraRegister/RiskScoreModal";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import {
  PlusCircleOutlined,
  MinusCircleOutlined,
  FilterOutlined,
  FilterFilled,
} from "@ant-design/icons";
import AspectImpactRegisterDrawer from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactRegisterDrawer";
const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;

const { RangePicker } = DatePicker;

const expandIcon = ({ expanded, onExpand, record }: any) => {
  const icon = expanded ? <MinusCircleOutlined /> : <PlusCircleOutlined />;
  // console.log("record", record);
  if (record?.mitigations?.length > 0) {
    return <a onClick={(e) => onExpand(record, e)}>{icon}</a>;
  }
  return null;
};

const AspectImpactRevisionHistoryPage = () => {
  const userDetails = getSessionStorage();
  const orgId = sessionStorage.getItem("orgId");
  const params = useParams<any>();
  const navigate = useNavigate();
  const location = useLocation();
  const [tableData, setTableData] = useState<any[]>([]);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);

  const [postMitigation, setPostMitigation] = useState<any>([]);
  const [postScore, setPostScore] = useState<any>(0);

  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [mitigationModal, setMitigationModal] = useState<any>({
    open: false,
    mode: "create",
    data: {},
  });
  const [formType, setFormType] = useState<string>("create");
  const [riskId, setRiskId] = useState<any>("");

  const [reviewModal, setReviewModal] = useState<any>({
    open: false,
    mode: "create",
    data: {},
  });

  const [hoveredRow, setHoveredRow] = useState(null);
  const [statusFilter, setStatusFilter] = useState<any>([]);
  const [dateFilter, setDateFilter] = useState<any>("");
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
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchHiraConfig();
    console.log("checkrisk useEffect[] in hira register review page", params);
  }, []);

  useEffect(() => {
    // if (params.riskcategory === "HIRA") {
    fetchRisks(selectedJobTitle);
    // } else if (params.riskcategory === "AspImp") {
    //   fetchAspImps();
    // }
  }, [statusFilter, dateFilter, search]);

  // useEffect(() => {
  //   // console.log("checkrisk location in hira register page useEffect[location]",location);
  //   console.log(
  //     "checkrisk params in hira register page useEffect[params]",
  //     params
  //   );
  //   if (!!params?.jobTitle && !!params?.workflowCycle) {
  //     setSelectedJobTitle(params?.jobTitle);

  //     fetchRisks(params?.jobTitle, params?.workflowCycle);
  //     // fetchConsolidatedStatus(params?.jobTitle);
  //   }
  //   if (params && params?.hiraWorkflowId) {
  //     setIsPageLoading(true);
  //     fetchHiraInWorkflowDetails(params?.hiraWorkflowId);
  //   }
  // }, [params]);

  useEffect(() => {
    // console.log("checkrisk location in hira register page useEffect[location]",location);
    console.log(
      "checkrisk location in hira revision page useEffect[location]",
      location
    );
    // if (!!location?.state?.jobTitle && !!location?.state?.cycleNumber) {
    //   setSelectedJobTitle(location?.state?.jobTitle);
    //   setSelectedWorkflowCycle(location?.state?.cycleNumber);
    //   fetchRisks(
    //     { field: "jobTitle", order: "ascend" },
    //     pagination?.current || 1,
    //     pagination?.pageSize || 10,
    //     location?.state?.entityId
    //   );
    //   // fetchConsolidatedStatus(params?.jobTitle);
    // }
    if (!!location && !!location?.state && !!location?.state?.entityId) {
      setSelectedEntity(location?.state?.entityId);
      setSelectedWorkflowCycle(location?.state?.cycleNumber);
      fetchRisks(
        { field: "jobTitle", order: "ascend" },
        location?.state?.cycleNumber,
        pagination?.current || 1,
        pagination?.pageSize || 10,
        location?.state?.entityId
      );
    }
    // if (params && params?.hiraWorkflowId) {
    //   setIsPageLoading(true);
    //   fetchHiraInWorkflowDetails(params?.hiraWorkflowId);
    // }
  }, [location]);

  const fetchHiraInWorkflowDetails = async (hiraWorkflowId: any) => {
    try {
      const res = await axios.get(
        `/api/riskregister/hira-register/getHiraInWorkflow/${hiraWorkflowId}`
      );
      console.log("checkrisk res in fetchHiraInWorkflowDetails", res);

      if (res.status === 200 || res.status === 201) {
        setHiraInWorkflow(res?.data?.data);
        setSelectedJobTitle(res.data?.data?.jobTitle);
        setIsPageLoading(false);
      } else {
        setHiraInWorkflow(null);
        enqueueSnackbar(
          "Something went wrong while fetching details of hira in workflow",
          {
            variant: "error",
          }
        );
        setIsPageLoading(false);
      }
    } catch (error) {
      enqueueSnackbar(
        "Something went wrong while fetching details of hira in workflow",
        {
          variant: "error",
        }
      );
      setIsPageLoading(false);

      console.log("errror in fetch config", error);
    }
  };

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

  const handleEditMitigation = (record: any, parentRecord: any) => {
    const updatedData = tableData.map((item) => {
      const childMatch = item?.mitigations?.some(
        (child: any) => child._id === record.id
      );
      if (item.id === record.id || childMatch) {
        return { ...item, highlight: true };
      } else {
        return { ...item, highlight: false };
      }
    });
    setTableData(updatedData);
    // console.log(
    //   "checkrisk record in handleEditMitigation parent Record",
    //   parentRecord
    // );

    setMitigationModal({
      ...mitigationModal,
      data: {
        ...record,
        parentRecord: parentRecord,
      },
      open: !mitigationModal.open,
      mode: "edit",
    });
  };

  const handleEdit = (record: any) => {
    // console.log("checkrisk record of parent row", record);

    const updatedData = tableData.map((item) => {
      const childMatch = item?.mitigations?.some(
        (child: any) => child._id === record
      );
      if (item.id === record || childMatch) {
        // console.log("in if");

        return { ...item, highlight: true };
      } else {
        return { ...item, highlight: false };
      }
    });
    // console.log("updated datea", updatedData);

    setTableData(updatedData);
    setRiskId(record);
    setFormType("edit");
    setAddModalOpen(true);
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

  const reloadListAfterSubmit = (reloadFetchReviewHistory: any = false) => {};

  const handleAddDeptInChangesTrack = async () => {};

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

  const columns: ColumnsType<any> = [
    {
      title: "S.No",
      dataIndex: "sNo",
      key: "sNo",
      width: "50px", // You can adjust the width as needed
      render: (text: any, _record: any, index: number) => text,
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
          // console.log("checkrisk hira columns recored", record);

          const parent = tableData.find((parentRecord) =>
            parentRecord?.mitigations?.some(
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
                onClick={() => handleEditMitigation(record, parent)}
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
              {hoveredRow === record.id && (
                <div
                  style={{
                    paddingRight: "10px",
                    color: "#636363",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                  onClick={() => handleEditMitigation(record, parent)}
                >
                  <ExpandIcon /> <span>Open</span>
                </div>
              )}
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
              onClick={() => handleEdit(record.id)}
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
            {hoveredRow === record.id && (
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
            )}
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
      // ...getColumnSearchProps("createdAt"),
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
      title: "Department",
      dataIndex: "entity",
      key: "entity",
      // responsive: ["md"],
      render: (_: any, record: any) => !record.type && record.entity,
    },
    {
      title: "Score",
      dataIndex: "significanceScore",
      key: "significanceScore",
      render: (_: any, record: any) => {
        if (record.preMitigationScore > 0 || record.postMitigationScore > 0) {
          const preColor =
            record.preMitigationScore > 0
              ? determineColor(
                  record.preMitigationScore,
                  existingRiskConfig?.riskIndicatorData
                )
              : "transparent";
          const postColor =
            record.postMitigationScore > 0
              ? determineColor(
                  record.postMitigationScore,
                  existingRiskConfig?.riskIndicatorData
                )
              : "transparent";

          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
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
                  <span>pre: </span>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: preColor,
                      marginLeft: "5px",
                      marginRight: "5px",
                    }}
                  />
                  <span>{record.preMitigationScore}</span>
                </span>
              )}
              {record.preMitigationScore > 0 &&
                record.postMitigationScore > 0 && (
                  <span style={{ marginRight: "5px", marginLeft: "5px" }}>
                    |
                  </span>
                )}
              {record.postMitigationScore > 0 && (
                <span style={{ display: "flex", alignItems: "center" }}>
                  <span>post: </span>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: postColor,
                      marginLeft: "5px",
                      marginRight: "5px",
                    }}
                  />
                  <span>{record.postMitigationScore}</span>
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
      title: "Significant",
      dataIndex: "significant",
      key: "significant",
      // responsive: ["md"],
      render: (_: any, record: any) => {
        if (!record.type) {
          return calculateIfSignificant(record) ? (
            <CheckCircleIcon style={{ fill: "#ED2939" }} />
          ) : (
            ""
          );
        }
      },
    },
  ];

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
        const parent = tableData.find((parentRecord) =>
          parentRecord?.mitigations?.some(
            (child: any) => child._id === record._id
          )
        );
        return (
          <>
            {isTruncated ? (
              <Tooltip title={text}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    textDecorationLine: "underline",
                    cursor: "pointer",
                  }}
                  onClick={() => handleEditMitigation(record, parent)}
                >
                  {displayText}
                </span>
              </Tooltip>
            ) : (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  textDecorationLine: "underline",
                  cursor: "pointer",
                }}
                onClick={() => handleEditMitigation(record, parent)}
              >
                {displayText}
              </span>
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
  ];

  const rowClassName = (record: any) => {
    return record.highlight ? "highlighted-row" : "";
  };

  const fetchRisks = async (
    // jobTitle: any = null,
    sort = { field: "jobTitle", order: "ascend" },
    workflowCycle: any = null,
    current = 1,
    pageSize = 10,
    entityId = ""
  ) => {
    try {
      // console.log("checkrisk params", jobTitle, sort, current, pageSize);
      let status = "active";
      let stringDateFilter = "",
        stringSortFilter = "";
      if (!!dateFilter) {
        stringDateFilter = JSON.stringify(dateFilter);
      }
      if (!!sort) {
        stringSortFilter = JSON.stringify(sort);
      }

      if (location?.pathname?.includes("/review")) {
        status = "active";
      } else {
        status = "inWorkflow";
      }
      // if (!!jobTitle || !!selectedJobTitle) {
      // console.log("checkrisk jobTitle", jobTitle);
      if (!entityId || !workflowCycle) return;
      const response = await axios.get(
        `/api/aspect-impact/getAllWorkflowAspectImpacts?entityId=${entityId}&workflowCycle=${workflowCycle}&page=${current}&pageSize=${pageSize}&sort=${stringSortFilter}&search=${search}&statusFilter=${statusFilter}&dateFilter=${stringDateFilter}&status=${status}`
      );

      // console.log("checkrisk response -->", response);

      const tblData = response.data.list.map((obj: any) => ({
        id: obj._id,
        sNo: obj.sNo,
        highlight: false,
        jobTitle: obj?.jobTitle || "",
        activity: obj?.activity || "",
        createdBy: obj?.createdBy || "",
        createdAt: obj?.createdAt || "",
        // dateOfIdentification: obj.dateOfIdentification || "",
        entityId: obj?.entityId || "",
        locationId: obj?.locationId || "",
        significanceScore: obj?.significanceScore || "",
        status: obj?.status || "",
        entity: !!obj.entity ? obj.entity.entityName : "",
        closeDate: obj?.closeDate || "",
        preMitigation: obj?.preMitigation || [],
        postMitigation: obj?.postMitigation || [],
        preMitigationScore: obj?.preMitigationScore || 0,
        postMitigationScore: obj?.postMitigationScore || 0,
        selectedAspectType: obj?.selectedAspectTypes || null,
        selectedCondition: obj?.selectedConditions || null,
        selectedImpactType: obj?.selectedImpactTypes || null,
        interestedParties: obj?.interestedParties || [],
        preSeverity: obj?.preSeverity || "",
        preProbability: obj?.preProbability || "",
        createdByUserDetails: obj?.createdByUserDetails || null,
        postSeverity: obj?.postSeverity,
        postProbability: obj?.postProbability,
        legalImpact: obj?.legalImpact || "",
        specificEnvAspect: obj?.specificEnvAspect || "",
        specificEnvImpact: obj?.specificEnvImpact || "",
        mitigations: obj.mitigations?.map((mitigationObj: any) => ({
          ...mitigationObj,
          jobTitle: mitigationObj.title,
          id: mitigationObj._id,
          riskId: obj._id,
          createdBy: obj.createdBy,
          status: mitigationObj.status == "true" ? "OPEN" : "CLOSED",
          type: true,
        })),
        // children: obj.mitigations?.map((mitigationObj: any) => ({
        //   ...mitigationObj,
        //   jobTitle: mitigationObj.title,
        //   id: mitigationObj._id,
        //   riskId: obj._id,
        //   createdBy: obj.createdBy,
        //   status: mitigationObj.status == "true" ? "OPEN" : "CLOSED",
        //   type: true,
        // })),
      }));
      setPagination((prev) => ({ ...prev, total: response.data.total }));
      // console.log("tblData", tblData);

      setTableData(tblData);
      // setTableDataForReport(response.data.list)
      // } else {
      //   setTableData([]);
      //   setTableDataForReport([]);
      //   setPagination((prev) => ({ ...prev, total: 0 }));
      // }
    } catch (error) {
      // console.log(error);
    }
  };

  const handleChangePageNew = (page: number, pageSize: number) => {
    // console.log("checkrisk page", page, pageSize);
    setPagination((prev) => ({ ...prev, current: page, pageSize: pageSize }));
    fetchRisks(
      { field: "jobTitle", order: "ascend" },
      selectedWorkflowCycle,
      page,
      pageSize,
      selectedEntity
    );
  };

  let filteredColumns = columns;
  const toggleScoreModal = (record: any) => {
    setSelectedCell([record?.preProbability - 1, record?.preSeverity - 1]);
    console.log("checkrisk record in togle score modal--->", record);

    setRiskScoreModal({
      ...riskScoreModal,
      open: !riskScoreModal.open,
    });
  };

  return (
    <>
      {isPageLoading ? (
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
                justifyContent:
                  params.riskcategory === "HIRA"
                    ? "space-between"
                    : "space-between",
                marginBottom: "20px",
              }}
            >
              <div>
                <Input
                  size="middle"
                  placeholder="Search Risk"
                  onChange={(event: any) => setSearch(event.target.value)}
                  prefix={<SearchIcon />}
                />
              </div>
              <Button
                data-testid="single-form-wrapper-button"
                onClick={() => navigate(`/risk/riskregister/AspectImpact`)}
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
                  // style={{  height: "300px" }}
                >
                  <Table
                    columns={filteredColumns}
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
                    onRow={(record) => ({
                      onMouseEnter: () => handleMouseEnter(record),
                      onMouseLeave: handleMouseLeave,
                    })}
                    pagination={false}
                    onChange={(tblPagination: any, filters, sorter: any) => {
                      // const { current, pageSize } = pagination;
                      const sort = {
                        field: sorter.field,
                        order: sorter.order,
                      };
                      // console.log("checkrisk sor",, pagination);

                      // setPagination({ current, pageSize, total: pagination.total });
                      fetchRisks(
                        selectedJobTitle,
                        sort,
                        tblPagination?.current,
                        tblPagination?.pageSize,
                        selectedEntity || ""
                      );
                    }}
                    // scroll={{ x: 900 }}
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

          {!!riskScoreModal.open && (
            <>
              <RiskScoreModal
                preMitigationScoreModal={riskScoreModal}
                toggleScoreModal={toggleScoreModal}
                existingRiskConfig={existingRiskConfig}
                preMitigation={[]}
                // setPreMitigation={setPreMitigation}
                preScore={riskScore}
                setPreScore={setRiskScore}
                levelColor={levelColor}
                setLevelColor={setLevelColor}
                // scoreData={scoreData}
                // setScoreData={setScoreData}
                // score={score}
                // setScore={setScore}
                // isPreOrPost={isPreOrPost}
                // setIsPreOrPost={setIsPreOrPost}
                selectedCell={selectedCell}
                setSelectedCell={setSelectedCell}
              />
            </>
          )}

          <div className={classes.modalBox}>
            {!!addModalOpen && (
              <AspectImpactRegisterDrawer
                addModalOpen={addModalOpen}
                setAddModalOpen={setAddModalOpen}
                fetchRisks={fetchRisks}
                // fetchAspImps={fetchAspImps}
                riskId={riskId}
                formType={formType}
                tableData={tableData}
                setTableData={setTableData}
                existingRiskConfig={existingRiskConfig}
                fetchAllJobTitles={() => {}}
                isWorkflowPage={false}
                reloadListAfterSubmit={reloadListAfterSubmit}
                hiraInWorkflow={hiraInWorkflow}
                handleAddDeptInChangesTrack={handleAddDeptInChangesTrack}
                jobTitleOptions={[]}
              />
            )}
          </div>

          <div>
            {!!mitigationModal.open && (
              <ControlMeasureDrawer
                mitigationModal={mitigationModal}
                setMitigationModal={setMitigationModal}
                existingRiskConfig={existingRiskConfig}
                fetchRisks={fetchRisks}
                // fetchAspImps={fetchAspImps}
                tableData={tableData}
                setTableData={setTableData}
                postMitigation={postMitigation}
                setPostMitigation={setPostMitigation}
                postScore={postScore}
                setPostScore={setPostScore}
                isWorkflowPage={false}
                reloadListAfterSubmit={reloadListAfterSubmit}
                hiraInWorkflow={hiraInWorkflow}
                handleAddDeptInChangesTrack={handleAddDeptInChangesTrack}
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default AspectImpactRevisionHistoryPage;
