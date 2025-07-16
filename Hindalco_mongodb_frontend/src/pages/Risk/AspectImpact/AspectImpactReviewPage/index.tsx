//react
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ReactComponent as SignificantIcon } from "assets/icons/significantIcon.svg";

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
  Popover as AntdPopover,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { CheckboxValueType } from "antd/es/checkbox/Group";
import type { PaginationProps } from "antd";

//material-ui icons
//<--kebab menu icons -->
import RateReviewIcon from "@material-ui/icons/RateReview";
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";
import ChatIcon from "@material-ui/icons/Chat";
import HistoryIcon from "@material-ui/icons/History";
import PeopleIcon from "@material-ui/icons/People";
//<--table icons
import KeyboardArrowDownRoundedIcon from "@material-ui/icons/KeyboardArrowDownRounded";
import ChevronRightRoundedIcon from "@material-ui/icons/ChevronRightRounded";
import FilterListIcon from "@material-ui/icons/FilterList";
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

//styles
import useStyles from "./style";
import "./new.css";

//components
import CustomMoreMenu from "components/newComponents/CustomMoreMenu";
import ShareWithUsersModal from "components/Risk/Hira/HiraRegister/ShareWithUsersModal";
import ControlMeasureDrawer from "components/Risk/AspectImpact/AspectImpactRegister/ControlMeasureDrawer";
import RiskDrawer from "components/RiskRegister/RiskDrawer";
import ModuleNavigation from "components/Navigation/ModuleNavigation";
import printJS from "print-js";
import AspectImpactRegisterDrawer from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactRegisterDrawer";
import AspImpWorkflowModal from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactReview/AspImpWorkflowModal";
import AspImpWorkflowHistoryDrawer from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactReview/AspImpWorkflowHistoryDrawer";
import AspImpWorkflowCommentsDrawer from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactReview/AspImpWorkflowCommentsDrawer";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import {
  Box,
  CircularProgress,
  IconButton,
  Popover,
  useMediaQuery,
} from "@material-ui/core";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import {
  PlusCircleOutlined,
  MinusCircleOutlined,
  FilterOutlined,
  FilterFilled,
} from "@ant-design/icons";
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

const AspectImpactReviewPage = () => {
  const matches = useMediaQuery("(min-width:822px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const userDetails = getSessionStorage();
  const orgId = sessionStorage.getItem("orgId");
  const params = useParams<any>();
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<any[]>([]);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);

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

  const [jobTitleOptions, setJobTitleOptions] = useState<any>([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState<any>(null);

  const [postMitigation, setPostMitigation] = useState<any>([]);
  const [postScore, setPostScore] = useState<any>(0);

  const [aspImpTableData, setAspImpTableData] = useState<any[]>([]);
  const [aspImpTableDataForReport, setAspImpTableDataForReport] = useState<any>(
    []
  );
  const [activeTab, setActiveTab] = useState<any>("1");
  const [tableDataForReport, setTableDataForReport] = useState<any[]>([]);

  // const [hiraConsolidatedStatus, setHiraConsolidatedStatus] =
  //   useState<any>("open");
  const [hiraInWorkflow, setHiraInWorkflow] = useState<any>(null);
  const [hiraInWorkflowIds, setHiraInWorkflowIds] = useState<any>([]);

  const [hiraWorkflowModal, setHiraWorkflowModal] = useState<any>({
    open: false,
    data: null,
    status: hiraInWorkflow?.status,
  });

  const [hiraStatus, setHiraStatus] = useState<any>("open");
  const [isHiraRejected, setIsHiraRejected] = useState<boolean>(false);
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
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const location = useLocation();
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchHiraConfig();
    console.log("checkrisk useEffect[] in hira register review page", params);
  }, []);

  useEffect(() => {
    console.log(
      "checkrisk location in hira register review page useEffect[location]",
      location
    );
    if (!!location && !!location?.state && !!location?.state?.entityId) {
      setSelectedEntity(location?.state?.entityId);
      fetchRisks(
        { field: "jobTitle", order: "ascend" },
        pagination?.current || 1,
        pagination?.pageSize || 10,
        location?.state?.entityId
      );
    }
  }, [location]);

  useEffect(() => {
    // if (params.riskcategory === "HIRA") {
    fetchRisks(
      { field: "jobTitle", order: "ascend" },
      pagination?.current || 1,
      pagination?.pageSize || 10,
      selectedEntity
    );
    // } else if (params.riskcategory === "AspImp") {
    //   fetchAspImps();
    // }
  }, [statusFilter, dateFilter, search]);

  // useEffect(() => {
  //   console.log("checkrisk selectedJobTitle", selectedJobTitle);
  //   if (!!selectedJobTitle) {
  //     fetchRisks(selectedJobTitle);
  //   }
  //   //logic to identify the status of review to identify the stage of selected job title
  // }, [selectedJobTitle]);

  useEffect(() => {
    // console.log("checkrisk location in hira register page useEffect[location]",location);
    console.log(
      "checkrisk params in hira register page useEffect[params]",
      params
    );
    if (!!params?.entityId) {
      setSelectedEntity(params?.entityId);

      fetchRisks(
        { field: "jobTitle", order: "ascend" },
        pagination?.current || 1,
        pagination?.pageSize || 10,
        params?.entityId
      );
      // fetchConsolidatedStatus(params?.jobTitle);
    }
    if (params && params?.hiraWorkflowId) {
      setIsPageLoading(true);
      fetchHiraInWorkflowDetails(params?.hiraWorkflowId);
    } else if (location?.pathname?.includes("/review")) {
      if (location?.state?.status === "REJECTED") {
        setIsHiraRejected(true);
        fetchHiraInWorkflowDetails(location?.state?._id);
      }
    }
  }, [params, location]);

  useEffect(() => {
    if (!params?.entityId && !!hiraInWorkflow && !!hiraInWorkflow?.entityId) {
      // console.log(
      //   "checkrisk hiraInWorkflow in useEffect params not found",
      //   hiraInWorkflow
      // );
      fetchRisks(
        { field: "jobTitle", order: "ascend" },
        pagination?.current || 1,
        pagination?.pageSize || 10,
        hiraInWorkflow?.entityId
      );
    }
  }, [hiraInWorkflow]);

  const fetchHiraInWorkflowDetails = async (hiraWorkflowId: any) => {
    try {
      const res = await axios.get(
        `/api/aspect-impact/getHiraInWorkflow/${hiraWorkflowId}`
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
      const res = await axios.get(
        `/api/aspect-impact/getAspImpConfig/${orgId}`
      );
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

  const toggleMitigationModal = (record: any) => {
    // console.log("checkrisk toggleMitigationModal in riskregister", record);

    const updatedData = tableData.map((item) =>
      item.id === record.id
        ? { ...item, highlight: true }
        : { ...item, highlight: false }
    );
    setTableData(updatedData);

    //setting default cumulative data in post mitigation
    // loadDatainRiskMatrix();
    setMitigationModal({
      ...mitigationModal,
      data: {
        ...mitigationModal.data,
        riskId: record.id,
        parentRecord: record,
      },
      mode: "create",
      open: !mitigationModal.open,
    });
  };

  //below is for the modal which opens on the click of share with users (kebab menu in hira register table)
  const toggleReviewModal = (record: any) => {
    setReviewModal({
      ...reviewModal,
      data: { ...record },
      open: !reviewModal.open,
    });
  };

  const actions = [
    {
      label: "Add Control Measure",
      icon: <AddIcon />,
      handler: toggleMitigationModal,
    },
    {
      label: "Share with Users",
      icon: <RateReviewIcon />,
      handler: toggleReviewModal,
    },
    // {
    //   label: "Close Risk",
    //   icon: <CloseIcon />,
    //   handler: handleCloseRisk,
    // },
    // {
    //   label: "Delete Risk",
    //   icon: <DeleteIcon />,
    //   handler: handleDeleteRisk,
    // },
  ];

  const handleDateFilter = async (dates: any, confirm: () => void) => {
    if (dates) {
      const [start, end] = dates;
      const startDate = start.format("YYYY-MM-DD");
      const endDate = end.format("YYYY-MM-DD");
      setDateFilter({
        startDate: startDate,
        endDate: endDate,
      });
    }
    confirm();
  };

  const handleClearDateFilter = (confirm: any, clearFilters: any) => {
    setDateFilter("");
    dateForm.resetFields();
    confirm();
    clearFilters();
  };

  const getColumnSearchProps = (dataIndex: any) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }: any) => (
      //
      <div style={{ padding: "10px" }}>
        <Form form={dateForm}>
          <Form.Item name="range-picker" label="RangePicker">
            <RangePicker onChange={(dates) => setSelectedKeys(dates)} />
          </Form.Item>
          <Row gutter={8} justify="space-between">
            <Col span={12}>
              <Button
                type="primary"
                onClick={() => handleDateFilter(selectedKeys, confirm)}
                size="small"
                style={{ width: "100%" }}
              >
                Apply
              </Button>
            </Col>
            <Col span={12}>
              <Button
                onClick={() => handleClearDateFilter(confirm, clearFilters)}
                size="small"
                style={{ width: "100%" }}
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    ),
    filterIcon: (filtered: any) => (
      <FilterLogo width={14} height={25} style={{ fill: iconColor }} />
    ),
  });

  const onChange = (checkedValues: CheckboxValueType[]) => {
    setStatusFilter(checkedValues);
  };

  const handleEditMitigation = (record: any, parentRecord: any) => {
    const updatedData = tableData.map((item) => {
      const childMatch = item.mitigations?.some(
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

  const calculateIfSignificant = (rowData: any) => {
    if (rowData?.legalImpact === "Yes") {
      return true;
    } else if (rowData?.interestedParties?.length) {
      return true;
    } else {
      if (rowData?.mitigations && rowData?.mitigations?.length) {
        if (rowData?.postMitigationScore >= 9 || rowData?.postProbability >= 3) {
          return true;
        }
      } else {
        if (rowData?.preMitigationScore >= 9 || rowData?.preProbaility >= 3) {
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
      width: "100px", // You can adjust the width as needed
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
          console.log("checkrisk inside record.type", record?.comments);

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
      ...getColumnSearchProps("createdAt"),
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
                <p style={{ padding: "1px" }}>
                  {
                    "Product of severity and probability >= 9, the aspect will be considered significant."
                  }
                </p>
                <p style={{ padding: "1px" }}>
                  Severity score is higher than 3, the aspect will be considered
                  significant.
                </p>
                <p style={{ padding: "1px" }}>
                  Any legal requirement and interested party concerns will be
                  considered significant.
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
    // {
    //   title: "Action",
    //   fixed: "right",
    //   dataIndex: "action",
    //   key: "action",
    //   render: (_: any, record: any) =>
    //     !record.type && (
    //       <CustomMoreMenu
    //         options={actions.map((obj) => ({
    //           ...obj,
    //           handleClick: () => obj.handler(record),
    //         }))}
    //         anchorOrigin={{
    //           vertical: "bottom",
    //           horizontal: "right",
    //         }}
    //         transformOrigin={{
    //           vertical: "top",
    //           horizontal: "right",
    //         }}
    //       />
    //     ),
    // },
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

  const handleEdit = (record: any) => {
    // console.log("checkrisk record of parent row", record);

    const updatedData = tableData.map((item) => {
      const childMatch = item.children?.some(
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
  const rowClassName = (record: any) => {
    return record.highlight ? "highlighted-row" : "";
  };

  const fetchRisks = async (
    // jobTitle: any = null,
    sort = { field: "jobTitle", order: "ascend" },
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

      console.log(
        "checkrisk location pathname in fetchRisks",
        location?.pathname
      );

      if (location?.pathname?.includes("/review")) {
        status = "active";
      } else {
        status = "inWorkflow";
      }
      // if (!!jobTitle || !!selectedJobTitle) {
      // console.log("checkrisk jobTitle", jobTitle);
      if (!entityId) return;
      const response = await axios.get(
        `/api/aspect-impact/allByDepartment/${entityId}?page=${current}&pageSize=${pageSize}&sort=${stringSortFilter}&search=${search}&statusFilter=${statusFilter}&dateFilter=${stringDateFilter}&status=${status}`
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
      setTableDataForReport(response.data.list);
      // } else {
      //   setTableData([]);
      //   setTableDataForReport([]);
      //   setPagination((prev) => ({ ...prev, total: 0 }));
      // }
    } catch (error) {
      // console.log(error);
    }
  };

  const fetchAspImps = async (
    sort = { field: "jobTitle", order: "ascend" },
    current = 1,
    pageSize = 10
  ) => {
    try {
      // console.log("checkrisk params", sort, current, pageSize);

      let stringDateFilter = "",
        stringSortFilter = "";
      if (!!dateFilter) {
        stringDateFilter = JSON.stringify(dateFilter);
      }
      if (!!sort) {
        stringSortFilter = JSON.stringify(sort);
      }

      const response = await axios.get(
        `/api/aspect-impact/all?page=${current}&pageSize=${pageSize}&sort=${stringSortFilter}&search=${search}&statusFilter=${statusFilter}&dateFilter=${stringDateFilter}`
      );
      const tblData = response.data.list.map((obj: any) => ({
        id: obj._id,
        highlight: false,
        jobTitle: obj.jobTitle || "",
        createdBy: obj.createdBy || "",
        activity: obj.activity || "",

        dateOfIdentification: obj.dateOfIdentification || "",
        status: obj.status || "",
        entity: !!obj.entity ? obj.entity.entityName : "",
        closeDate: obj.closeDate || "",
        preMitigation: obj?.preMitigation || [],
        postMitigation: obj?.postMitigation || [],
        preMitigationScore: obj?.preMitigationScore || 0,
        postMitigationScore: obj?.postMitigationScore || 0,
        children: obj.mitigations?.map((mitigationObj: any) => ({
          ...mitigationObj,
          jobTitle: mitigationObj.title,
          id: mitigationObj._id,
          riskId: obj._id,
          createdBy: obj.createdBy,
          status: mitigationObj.status == "true" ? "OPEN" : "CLOSED",
          type: true,
        })),
      }));

      // console.log("checkrisk asp imp table data", tblData);

      setPagination((prev) => ({ ...prev, total: response.data.total }));
      // console.log("tblData", tblData);

      setAspImpTableData(tblData);
      setAspImpTableDataForReport(response.data.list);
    } catch (error) {
      // console.log(error);
    }
  };

  const fetchAllJobTitles = async () => {
    try {
      const res = await axios.get(
        `/api/aspect-impact/getAllJobTitles/${orgId}`
      );

      if (res.status === 200 || res.status === 201) {
        if (!!res.data && !!res.data.length) {
          let AllOption = {
            value: "All",
            label: "All",
          };
          setJobTitleOptions([
            ...res.data.map((item: any) => ({
              ...item,
              value: item.jobTitle,
              label: item.jobTitle,
            })),
            AllOption,
          ]);
        } else {
          setJobTitleOptions([]);
        }
      } else {
        setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching job titles", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };

  const createHandler = () => {
    if (!existingRiskConfig) {
      enqueueSnackbar("Please Add Configuration to Create Risk", {
        variant: "warning",
      });
      return;
    } else {
      setRiskId("");
      setFormType("create");
      setAddModalOpen(true);
    }
  };

  // const configHandler = () => {
  //   navigate(`/risk/riskconfiguration/HIRA`);
  // };

  // const handleJobTitleOptionChange = (value: any) => {
  //   setSelectedJobTitle(value);

  //   fetchRisks(value);
  // };

  const handleChangePageNew = (page: number, pageSize: number) => {
    // console.log("checkrisk page", page, pageSize);
    setPagination((prev) => ({ ...prev, current: page, pageSize: pageSize }));
    fetchRisks(
      { field: "jobTitle", order: "ascend" },
      page,
      pageSize,
      selectedEntity
    );
  };

  let filteredColumns = columns;
  // if (selectedJobTitle !== "All") {
  //   filteredColumns = columns.filter((column) => column.key !== "jobTitle");
  // }

  const handleSendForReview = () => {
    //handle logic to send all the risk belonging to selectedJoBTitle and send that for review
    const allHiraIds = tableData?.map((hira: any) => hira?.id);
    // console.log("checkrisk all hira ids", allHiraIds);
    setHiraInWorkflowIds(allHiraIds);
    setHiraStatus("open");
    setHiraWorkflowModal({
      ...hiraWorkflowModal,
      open: true,
      status: "open",
      data: {
        hiraIds: allHiraIds,
        jobTitle: selectedJobTitle,
        entityId: selectedEntity,
        entity: userDetails?.entity?.entityName,
        location: userDetails?.location?.locationName,
      },
    });
  };

  const handleSendForReviewForRejectedHira = () => {
    console.log(
      "checkrisk handleSendForReviewForRejectedHira called hiraInworkflow",
      hiraInWorkflow
    );

    //handle logic to send all the risk belonging to selectedJoBTitle and send that for review
    const allHiraIds = tableData?.map((hira: any) => hira?.id);
    // console.log("checkrisk all hira ids", allHiraIds);
    setHiraInWorkflowIds(allHiraIds);
    setHiraStatus("STARTREVIEW");
    setHiraWorkflowModal({
      ...hiraWorkflowModal,
      open: true,
      status: "STARTREVIEW",
      data: {
        hiraIds: allHiraIds,
        jobTitle: selectedJobTitle,
        ...hiraInWorkflow,
        entity: userDetails?.entity?.entityName,
        location: userDetails?.location?.locationName,
      },
      hiraInWorkflow: hiraInWorkflow,
    });
  };

  const handleFinishReview = () => {
    //handle logic to send all the risk belonging to selectedJoBTitle and send that for review
    const allHiraIds = tableData?.map((hira: any) => hira?.id);
    // console.log("checkrisk all hira ids", allHiraIds);
    setHiraInWorkflowIds(allHiraIds);
    setHiraStatus("IN_REVIEW");
    setHiraWorkflowModal({
      ...hiraWorkflowModal,
      open: true,
      status: "IN_REVIEW",
      data: {
        hiraIds: allHiraIds,
        jobTitle: selectedJobTitle,
        entityId: selectedEntity,
        entity: userDetails?.entity?.entityName,
        location: userDetails?.location?.locationName,
      },
      hiraInWorkflow: hiraInWorkflow,
    });
  };

  const handleFinishApproval = () => {
    //handle logic to send all the risk belonging to selectedJoBTitle and send that for review
    const allHiraIds = tableData?.map((hira: any) => hira?.id);
    const responsiblePersonIdArray = tableData
      ?.map((item: any) =>
        item?.mitigations?.length
          ? item?.mitigations?.map((item: any) => item?.responsiblePerson)
          : ""
      )
      ?.filter((item: any) => !!item)
      .flat();

    console.log(
      "checkrisknew responsiblePersonIdArray",
      responsiblePersonIdArray
    );
    setHiraInWorkflowIds(allHiraIds);
    setHiraStatus("IN_APPROVAL");
    setHiraWorkflowModal({
      ...hiraWorkflowModal,
      open: true,
      status: "IN_APPROVAL",
      data: {
        hiraIds: allHiraIds,
        jobTitle: selectedJobTitle,
        entityId: selectedEntity,
        responsiblePersonIdArray: responsiblePersonIdArray,
        entity: userDetails?.entity?.entityName,
        location: userDetails?.location?.locationName,
      },
      hiraInWorkflow: hiraInWorkflow,
    });
  };

  const handleRejectHira = () => {
    console.log("checck risk handlereject hira called");

    //handle logic to send all the risk belonging to selectedJoBTitle and send that for review
    const allHiraIds = tableData?.map((hira: any) => hira?.id);
    // // console.log("checkrisk all hira ids", allHiraIds);
    // setHiraInWorkflowIds(allHiraIds);
    setHiraStatus("REJECTED");
    setHiraWorkflowModal({
      ...hiraWorkflowModal,
      open: true,
      status: "REJECTED",
      data: {
        hiraIds: allHiraIds,
        jobTitle: selectedJobTitle,
        entity: userDetails?.entity?.entityName,
        location: userDetails?.location?.locationName,
      },
      hiraInWorkflow: hiraInWorkflow,
    });
  };

  const checkIfLoggedInUserCanReview = () => {
    const hiraDetails = hiraInWorkflow;
    if (!!hiraDetails) {
      //check if userDetails?.id is in hiraDetails?.reviewers
      const isReviewer = hiraDetails?.reviewers?.some(
        (reviewer: any) => reviewer === userDetails?.id
      );
      // console.log("checkrisk isReviewer", isReviewer);

      return isReviewer;
    }
  };

  const checkIfLoggedInUserCanApprove = () => {
    const hiraDetails = hiraInWorkflow;
    if (!!hiraDetails) {
      //check if userDetails?.id is in hiraDetails?.reviewers
      const isApprover = hiraDetails?.approvers?.some(
        (approver: any) => approver === userDetails?.id
      );
      // console.log("checkrisk isApprover", isApprover);

      return isApprover;
    }
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
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  flexDirection: smallScreen ? "row" : "column",
                }}
              >
                {
                  // selectedJobTitle !== null &&
                  // selectedJobTitle !== "All" &&
                  !hiraInWorkflow && (
                    <Button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#003566",
                        color: "white",
                      }}
                      onClick={handleSendForReview}
                    >
                      Send For Review
                    </Button>
                  )
                }

                {/* below send for review button is to handle start review after hira is rejected */}
                {
                  // selectedJobTitle !== null &&
                  // selectedJobTitle !== "All" &&
                  isHiraRejected && (
                    <Button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#003566",
                        color: "white",
                      }}
                      onClick={handleSendForReviewForRejectedHira}
                    >
                      Send For Review
                    </Button>
                  )
                }
                {
                  // selectedJobTitle !== null &&
                  // selectedJobTitle !== "All" &&
                  hiraInWorkflow?.status === "IN_REVIEW" &&
                    checkIfLoggedInUserCanReview() && (
                      <div style={{ display: "flex" }}>
                        <Button
                          style={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#003566",
                            color: "white",
                            fontSize: smallScreen ? "14px" : "12px",
                          }}
                          onClick={handleFinishReview}
                        >
                          Complete Review
                        </Button>
                        <Button
                          style={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#003566",
                            color: "white",
                            fontSize: smallScreen ? "14px" : "12px",
                          }}
                          onClick={() => {
                            console.log("checkrisk handlereject hira called");
                            handleRejectHira();
                          }}
                        >
                          Send Back For Edit
                        </Button>
                      </div>
                    )
                }

                {
                  // selectedJobTitle !== null &&
                  // selectedJobTitle !== "All" &&
                  hiraInWorkflow?.status === "IN_APPROVAL" &&
                    checkIfLoggedInUserCanApprove() && (
                      <>
                        <Button
                          style={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#003566",
                            color: "white",
                          }}
                          onClick={handleFinishApproval}
                        >
                          Approve
                        </Button>
                        <Button
                          style={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#003566",
                            color: "white",
                          }}
                          onClick={() => {
                            console.log("checkrisk handlereject hira called");
                            handleRejectHira();
                          }}
                        >
                          Send Back For Edit
                        </Button>
                      </>
                    )
                }

                <div style={{ display: "flex" }}>
                  {
                    // selectedJobTitle !== null &&
                    // selectedJobTitle !== "All" &&
                    !!hiraInWorkflow && hiraInWorkflow?.status !== "open" && (
                      <Tooltip title="Workflow Comments History">
                        <ChatIcon
                          className={classes.commentsIcon}
                          onClick={() =>
                            setHiraWorkflowCommentsDrawer({
                              open: true,
                              data: hiraInWorkflow,
                            })
                          }
                        />
                      </Tooltip>
                    )
                  }
                  {
                    // selectedJobTitle !== null &&
                    // selectedJobTitle !== "All" &&
                    !!hiraInWorkflow && hiraInWorkflow?.status !== "open" && (
                      <Tooltip title="Workflow History">
                        <HistoryIcon
                          className={classes.historyIcon}
                          onClick={() =>
                            setHiraWorkflowHistoryDrawer({
                              open: true,
                              data: hiraInWorkflow,
                            })
                          }
                        />
                      </Tooltip>
                    )
                  }

                  {
                    // selectedJobTitle !== null &&
                    // selectedJobTitle !== "All" &&
                    !!hiraInWorkflow && hiraInWorkflow?.status !== "open" && (
                      <Tooltip title="Workflow People">
                        <IconButton
                          style={{
                            backgroundColor: "#F5F5F5",
                            borderRadius: "5px",
                            padding: 5,
                            marginLeft: "5px",
                          }}
                          onClick={(event: any) =>
                            handleWorkflowPeopleClick(event)
                          }
                        >
                          <PeopleIcon />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                </div>

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
                  // style={{
                  //   top: "112px",
                  //   left: "158px",
                  // }}
                >
                  <div
                    style={{
                      padding: "20px",
                    }}
                  >
                    <b>Reviewers :</b>{" "}
                    {!!hiraInWorkflow &&
                      hiraInWorkflow?.reviewersDetails.length > 0 &&
                      hiraInWorkflow?.reviewersDetails
                        .map(
                          (reviewer: any) =>
                            `${reviewer.firstname} ${reviewer.lastname}`
                        )
                        .join(", ")}{" "}
                    <br />
                    <b>Approvers :</b>{" "}
                    {!!hiraInWorkflow &&
                      hiraInWorkflow?.approversDetails.length > 0 &&
                      hiraInWorkflow?.approversDetails
                        .map(
                          (approver: any) =>
                            `${approver.firstname} ${approver.lastname}`
                        )
                        .join(", ")}
                  </div>
                </Popover>
                {matches ? (
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
                ) : (
                  ""
                )}
              </div>

              <div
                style={
                  smallScreen
                    ? {}
                    : {
                        position: "absolute",
                        top: "125px",
                        right: "20px",
                        width: "50%",
                        // marginLeft: "2%",
                      }
                }
              >
                <Input
                  size="middle"
                  placeholder="Search Risk"
                  onChange={(event: any) => setSearch(event.target.value)}
                  prefix={<SearchIcon />}
                />
              </div>
            </div>

            <Row>
              <Col span={24}>
                <div className={classes.tableContainer} id="table1">
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
                        // selectedJobTitle,
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

          <div className={classes.modalBox}>
            {!!addModalOpen && (
              <AspectImpactRegisterDrawer
                addModalOpen={addModalOpen}
                setAddModalOpen={setAddModalOpen}
                fetchRisks={fetchRisks}
                fetchAspImps={fetchAspImps}
                riskId={riskId}
                formType={formType}
                tableData={tableData}
                setTableData={setTableData}
                existingRiskConfig={existingRiskConfig}
                fetchAllJobTitles={fetchAllJobTitles}
                isWorkflowPage={true}
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
                fetchAspImps={fetchAspImps}
                tableData={tableData}
                setTableData={setTableData}
                postMitigation={postMitigation}
                setPostMitigation={setPostMitigation}
                postScore={postScore}
                setPostScore={setPostScore}
                isWorkflowPage={true}
              />
            )}
          </div>
          <div>
            {!!reviewModal.open && (
              <ShareWithUsersModal
                reviewModal={reviewModal}
                setReviewModal={setReviewModal}
              />
            )}
          </div>

          <div>
            {!!hiraWorkflowModal.open && (
              <AspImpWorkflowModal
                reviewModal={hiraWorkflowModal}
                setReviewModal={setHiraWorkflowModal}
                hiraStatus={hiraStatus}
              />
            )}
          </div>

          <div>
            {!!hiraWorkflowCommentsDrawer.open && (
              <AspImpWorkflowCommentsDrawer
                commentDrawer={hiraWorkflowCommentsDrawer}
                setCommentDrawer={setHiraWorkflowCommentsDrawer}
                toggleCommentsDrawer={toggleCommentsDrawer}
              />
            )}
          </div>

          <div>
            {!!hiraWorkflowHistoryDrawer.open && (
              <AspImpWorkflowHistoryDrawer
                workflowHistoryDrawer={hiraWorkflowHistoryDrawer}
                handleCloseWorkflowHistoryDrawer={toggleWorkflowHistoryDrawer}
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default AspectImpactReviewPage;
