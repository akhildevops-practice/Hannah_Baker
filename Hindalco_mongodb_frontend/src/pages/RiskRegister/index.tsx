//react
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { CheckboxValueType } from "antd/es/checkbox/Group";
import type { PaginationProps } from "antd";

//material-ui icons
//<--kebab menu icons -->
import RateReviewIcon from "@material-ui/icons/RateReview";
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";

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
import ShareWithUsersModal from "components/RiskRegister/ShareWithUsersModal";
import ControlMeasureDrawer from "components/RiskRegister/ControlMeasureDrawer";
import RiskDrawer from "components/RiskRegister/RiskDrawer";
import ModuleNavigation from "components/Navigation/ModuleNavigation";
import printJS from "print-js";
import HindalcoLogoSvg from "assets/logo/HindalcoLogoSvg.svg";

const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;

const { RangePicker } = DatePicker;
const RiskRegister = () => {
  const userDetails = getSessionStorage();
  const orgId = sessionStorage.getItem("orgId");
  const params = useParams<any>();
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<any[]>([]);

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

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [logo, setLogo] = useState<any>(null);
  const getLogo = async () => {
    const response = await axios.get(`/api/location/getLogo`);
    setLogo(response.data);
  };

  useEffect(() => {
    getLogo();
    fetchConfigByConfigName();
    if (params.riskcategory === "AspImp") {
      fetchAspImps();
    } else {
      fetchAllJobTitles();
    }
  }, [params]);

  useEffect(() => {
    if (params.riskcategory === "HIRA") {
      fetchRisks(selectedJobTitle);
    } else if (params.riskcategory === "AspImp") {
      fetchAspImps();
    }
  }, [statusFilter, dateFilter, search]);

  const fetchConfigByConfigName = async () => {
    try {
      const res = await axios.get(
        `/api/riskconfig/getconfigbycategory/${orgId}/${params.riskcategory}`
      );
      console.log("check res", res);
      if (res.status === 200 || res.status === 201) {
        if (!!res.data) {
          setExistingRiskConfig({
            ...res.data,
            riskIndicatorData:
              res.data?.riskSignificance.map((item: any) => ({
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

  const handleDeleteRisk = async (record: any) => {
    try {
      const res = await axios.delete(`/api/riskregister/${record.id}`);
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar("Risk Deleted Successfully", {
          variant: "success",
        });
        fetchRisks();
      }
    } catch (error) {
      // console.log("error in handleDeleteRisk ->>", error);
    }
  };

  const handleCloseRisk = async (record: any) => {
    try {
      const res = await axios.patch(`/api/riskregister/close/${record.id}`);
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar("Risk Closed Successfully", {
          variant: "success",
        });
        fetchRisks();
      }
    } catch (error) {
      // console.log("error in handleCloseRisk ->>", error);
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
    {
      label: "Close Risk",
      icon: <CloseIcon />,
      handler: handleCloseRisk,
    },
    {
      label: "Delete Risk",
      icon: <DeleteIcon />,
      handler: handleDeleteRisk,
    },
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
      const childMatch = item.children?.some(
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

  const columns: ColumnsType<any> = [
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
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
                onClick={() => handleEditMitigation(record, parent)}
              >
                <span style={{ textTransform: "capitalize" }}>{text}</span>
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
              {text}
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
      title: "Basic Step of Job",
      dataIndex: "jobBasicStep",
      key: "jobBasicStep",
      width: 250,
      render: (text, record: any) => {
        let displayText = text;
        let isTruncated = false;

        if (text && text.length > 30) {
          displayText = text.substring(0, 30) + "...";
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
      title: "Owner",
      dataIndex: "createdBy",
      key: "createdBy",
      responsive: ["md"],
    },
    {
      title: "Date Opened",
      dataIndex: "dateOfIdentification",
      key: "dateOfIdentification",
      render: (_: any, record: any) => {
        if (!!record.dateOfIdentification) {
          return moment(record.dateOfIdentification).format("DD-MM-YYYY");
        } else {
          return;
        }
      },
      ...getColumnSearchProps("dateOfIdentification"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_: any, record: any) => {
        if (record.status === "OPEN") {
          return (
            <Tag
              style={{ backgroundColor: "#7cbf3f" }}
              key={record.status}
              className={classes.statusTag}
            >
              OPEN
            </Tag>
          );
        } else if (record.status === "IN REVIEW") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.status}
              className={classes.statusTag}
            >
              In Review
            </Tag>
          );
        } else if (record.status === "REVIEW COMPLETE") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.status}
              className={classes.statusTag}
            >
              REVIEWED
            </Tag>
          );
        } else if (record.status === "IN APPROVAL") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.status}
              className={classes.statusTag}
            >
              In Approval
            </Tag>
          );
        } else if (record.status === "APPROVED") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.status}
              className={classes.statusTag}
            >
              Approved
            </Tag>
          );
        } else return record.status;
      },

      filterIcon: (filtered: any) => (
        <FilterListIcon
          style={{ fill: iconColor, width: "0.89em", height: "0.89em" }}
        />
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => {
        return (
          <div style={{ padding: 8, width: "max-content" }}>
            <Checkbox.Group
              style={{ width: "100%" }}
              onChange={(checkedValues) => onChange(checkedValues)}
            >
              <Col>
                <Row>
                  <Checkbox value="OPEN">OPEN</Checkbox>
                </Row>
                <Row>
                  <Checkbox value="CLOSED">CLOSED</Checkbox>
                </Row>
                <Row>
                  <Checkbox value="UNDER MITIGATION">UNDER MITIGATION</Checkbox>
                </Row>
              </Col>
            </Checkbox.Group>
          </div>
        );
      },
    },
    {
      title: "Close Date",
      dataIndex: "closeDate",
      key: "closeDate",
      render: (_: any, record: any) =>
        !record.type &&
        !!record.closeDate &&
        moment(record.closeDate).format("DD-MM-YYYY"),
    },
    {
      title: "Impacted Entity",
      dataIndex: "entity",
      key: "entity",
      responsive: ["md"],
      render: (_: any, record: any) => !record.type && record.entity,
    },
    {
      title: "Risk Significance Score",
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
      title: "Action",
      fixed: "right",
      dataIndex: "action",
      key: "action",
      render: (_: any, record: any) =>
        !record.type && (
          <CustomMoreMenu
            options={actions.map((obj) => ({
              ...obj,
              handleClick: () => obj.handler(record),
            }))}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          />
        ),
    },
  ];

  const aspImpColumns: ColumnsType<any> = [
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
      width: 200,
      render: (text, record: any) => {
        if (record.type) {
          // console.log("checkrisk in aspect imp", record);

          const parent = tableData.find((parentRecord) =>
            parentRecord.children?.some(
              (child: any) => child._id === record._id
            )
          );
          // console.log("checkrisk parent in aspect imp", parent);

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
                <span style={{ textTransform: "capitalize" }}>{text}</span>
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
              {text}
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
      title: "Activity",
      dataIndex: "activity",
      key: "activity",
      width: 250,
      render: (text, record: any) => {
        // console.log("checkrisk record in activity", text);

        let displayText = text;
        let isTruncated = false;

        if (text && text.length > 30) {
          displayText = text.substring(0, 30) + "...";
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
      title: "Owner",
      dataIndex: "createdBy",
      key: "createdBy",
      responsive: ["md"],
    },
    {
      title: "Date Opened",
      dataIndex: "dateOfIdentification",
      key: "dateOfIdentification",
      render: (_: any, record: any) => {
        if (!!record.dateOfIdentification) {
          return moment(record.dateOfIdentification).format("DD-MM-YYYY");
        } else {
          return;
        }
      },
      ...getColumnSearchProps("dateOfIdentification"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_: any, record: any) => {
        if (record.status === "OPEN") {
          return (
            <Tag
              style={{ backgroundColor: "#7cbf3f" }}
              key={record.status}
              className={classes.statusTag}
            >
              OPEN
            </Tag>
          );
        } else if (record.status === "IN REVIEW") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.status}
              className={classes.statusTag}
            >
              In Review
            </Tag>
          );
        } else if (record.status === "REVIEW COMPLETE") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.status}
              className={classes.statusTag}
            >
              REVIEWED
            </Tag>
          );
        } else if (record.status === "IN APPROVAL") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.status}
              className={classes.statusTag}
            >
              In Approval
            </Tag>
          );
        } else if (record.status === "APPROVED") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.status}
              className={classes.statusTag}
            >
              Approved
            </Tag>
          );
        } else return record.status;
      },

      filterIcon: (filtered: any) => (
        <FilterListIcon
          style={{ fill: iconColor, width: "0.89em", height: "0.89em" }}
        />
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => {
        return (
          <div style={{ padding: 8, width: "max-content" }}>
            <Checkbox.Group
              style={{ width: "100%" }}
              onChange={(checkedValues) => onChange(checkedValues)}
            >
              <Col>
                <Row>
                  <Checkbox value="OPEN">OPEN</Checkbox>
                </Row>
                <Row>
                  <Checkbox value="CLOSED">CLOSED</Checkbox>
                </Row>
                <Row>
                  <Checkbox value="UNDER MITIGATION">UNDER MITIGATION</Checkbox>
                </Row>
              </Col>
            </Checkbox.Group>
          </div>
        );
      },
    },
    {
      title: "Close Date",
      dataIndex: "closeDate",
      key: "closeDate",
      render: (_: any, record: any) =>
        !record.type &&
        !!record.closeDate &&
        moment(record.closeDate).format("DD-MM-YYYY"),
    },
    {
      title: "Impacted Entity",
      dataIndex: "entity",
      key: "entity",
      responsive: ["md"],
      render: (_: any, record: any) => !record.type && record.entity,
    },
    {
      title: "Risk Significance Score",
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
      title: "Action",
      fixed: "right",
      dataIndex: "action",
      key: "action",
      render: (_: any, record: any) =>
        !record.type && (
          <CustomMoreMenu
            options={actions.map((obj) => ({
              ...obj,
              handleClick: () => obj.handler(record),
            }))}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          />
        ),
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
    jobTitle = null,
    sort = { field: "jobTitle", order: "ascend" },
    current = 1,
    pageSize = 10
  ) => {
    try {
      // console.log("checkrisk params", jobTitle, sort, current, pageSize);

      let stringDateFilter = "",
        stringSortFilter = "";
      if (!!dateFilter) {
        stringDateFilter = JSON.stringify(dateFilter);
      }
      if (!!sort) {
        stringSortFilter = JSON.stringify(sort);
      }
      if (!!jobTitle || !!selectedJobTitle) {
        // console.log("checkrisk jobTitle", jobTitle);

        const response = await axios.get(
          `/api/riskregister/all/${
            jobTitle || selectedJobTitle
          }?page=${current}&pageSize=${pageSize}&sort=${stringSortFilter}&search=${search}&statusFilter=${statusFilter}&dateFilter=${stringDateFilter}`
        );

        console.log("checkrisk response -->", response);

        const tblData = response.data.list.map((obj: any) => ({
          id: obj._id,
          highlight: false,
          jobTitle: obj.jobTitle || "",
          jobBasicStep: obj.jobBasicStep || "",
          createdBy: obj.createdBy || "",
          dateOfIdentification: obj.dateOfIdentification || "",
          significanceScore: obj.significanceScore || "",
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
        setPagination((prev) => ({ ...prev, total: response.data.total }));
        // console.log("tblData", tblData);

        setTableData(tblData);
        setTableDataForReport(response.data.list);
      } else {
        setTableData([]);
        setTableDataForReport([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
      }
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
      const res = await axios.get(`/api/riskregister/getAllJobTitles/${orgId}`);

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

  const configHandler = () => {
    navigate(`/risk/riskconfiguration/${params.riskcategory}`);
  };

  const handleJobTitleOptionChange = (value: any) => {
    setSelectedJobTitle(value);

    fetchRisks(value);
  };

  const handleChangePageNew = (page: number, pageSize: number) => {
    // console.log("checkrisk page", page, pageSize);
    setPagination((prev) => ({ ...prev, current: page, pageSize: pageSize }));
    fetchRisks(
      selectedJobTitle || "All",
      { field: "jobTitle", order: "ascend" },
      page,
      pageSize
    );
  };

  const handleChangeAspImpPageNew = (page: number, pageSize: number) => {
    // console.log("checkrisk aspimp page", page, pageSize);
    setPagination((prev) => ({ ...prev, current: page, pageSize: pageSize }));
    fetchAspImps({ field: "jobTitle", order: "ascend" }, page, pageSize);
  };

  let filteredColumns = columns;
  // if (selectedJobTitle !== "All") {
  //   filteredColumns = columns.filter((column) => column.key !== "jobTitle");
  // }

  const tabs = [
    {
      key: "1",
      name: "Settings",
      // path: "/master/unit", //just for information
      icon: (
        <AuditPlanIcon
          style={{
            fill: "black",
          }}
          onClick={configHandler}
          className={classes.docNavIconStyle}
        />
      ),
      // children: <AuditPlan />,
      moduleHeader: "Settings",
    },
  ];

  const handleExport = () => {
    const reportTemplate = (tableData: any) => {
      console.log("checkrisk tableData-->", tableData);
      const getUniqueAssessmentTeamNames = () => {
        const namesSet = new Set();
        tableData.forEach((item: any) => {
          item.assesmentTeamData.forEach((member: any) => {
            namesSet.add(`${member.firstname} ${member.lastname}`);
          });
        });
        return Array.from(namesSet).join(", ");
      };

      // Unique assessment team names
      const uniqueAssessmentTeamNames = getUniqueAssessmentTeamNames();
      return `
        <div class="report">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
            <thead style="border: 1px solid black;">
              <tr style="background-color: yellow; text-align: center;">
                <th colspan="7">HAZARD IDENTIFICATION AND RISK ASSESSMENT</th>
              </tr>
            </thead>
            <tbody>
              <tr style="text-align: left; border-bottom: 1px solid black;">
                <td colspan="7" style="border: none;">
                  <img src="${
                    logo || HindalcoLogoSvg
                  }" alt="Hindalco Logo" style="display: block; margin-left: auto; margin-right: auto; width: 100px;">
                </td>
              </tr>
              <tr class="no-border">
                <td colspan="7" style="border: none;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="width: 50%;">Department: ${
                        tableData[0].entity?.entityName
                      }</td>
                      <td>Date: ${moment(tableData[0].createdAt).format(
                        "DD/MM/YYYY"
                      )}</td>
                    </tr>
                    <tr>
                      <td>Job Title: ${tableData[0].jobTitle}</td>
                      <td>Section/Location: ${
                        tableData[0].location?.locationName
                      }</td>
                    </tr>
                    <tr>
                      <td>Date of Review: ${moment(
                        tableData[0].dateOfIdentification
                      ).format("DD/MM/YYYY")}</td>
                      <td>Hira Number: N/A</td>
                    </tr>
                    <tr>
                      <td>Area: ${tableData[0].area}</td>
                      <td>Routine/NonRoutine: ${
                        tableData[0].selectedRiskTypes?.name
                      }</td>
                    </tr>
                    <tr>
                      <td colspan="2">Assessment Team:  ${uniqueAssessmentTeamNames}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr style="border: 1px solid black">
                <th style="border: 1px solid black; padding: 10px;">SN</th>
                <th style="border: 1px solid black; padding: 10px;" colspan="2">Basic Step of the Job</th>
                <th style="border: 1px solid black; padding: 10px;">Hazard(s) associated with the step</th>
                <th style="border: 1px solid black; padding: 10px;">Impact</th>
                <th style="border: 1px solid black; padding: 10px;">Existing control measure to mitigate hazard</th>
                <th style="border: 1px solid black; padding: 10px;">Pre mitigation score</th>
                <th style="border: 1px solid black; padding: 10px;">Residual Risk</th>
              </tr>
              ${tableData
                .map(
                  (item: any, index: any) => `
                <tr>
                  <td style="border: 1px solid black; padding: 10px;">${
                    index + 1
                  }</td>
                  <td style="border: 1px solid black; padding: 10px;" colspan="2">${
                    item.jobBasicStep
                  }</td>
                  <td style="border: 1px solid black; padding: 10px;">${
                    item.selectedCondtions?.name
                  }</td>
                  <td style="border: 1px solid black; padding: 10px;">${
                    item.selectedImpactTypes?.name
                  }</td>
                  <td style="border: 1px solid black; padding: 10px;">${
                    item.existingControl
                  }</td>
                  <td style="border: 1px solid black; padding: 10px;">${
                    item.preMitigationScore
                  }</td>
                  <td style="border: 1px solid black; padding: 10px;">${
                    item.postMitigationScore
                  }</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;
    };

    // Example usage:
    // const formattedTableData = [
    //   // ... your data objects here
    // ] as any;
    // const metaData = {
    //   entityName: "pot room",
    //   createdAt: "2023-11-16T08:43:32.478Z",
    //   location: "clp0wbsfn001stq90igdtghct",
    //   section: "pot roomsdf",
    //   area: "asdf"
    // };
    const htmlReport = reportTemplate(tableDataForReport);

    // When ready to print:
    printJS({
      type: "raw-html",
      printable: htmlReport,
    });
  };

  const handleExportAspImp = () => {
    const reportTemplate = (aspImpTableData: any) => {
      // Function to format date using moment.js or similar
      const formatDate = (date: any) => moment(date).format("DD/MM/YYYY");

      // Metadata for the first row below the image
      const metaData = {
        Plant: aspImpTableData[0]?.jobTitle, // Replace with actual plant name or data
        Department: aspImpTableData[0].entity?.entityName || "N/A",
        Section: aspImpTableData[0].section || "N/A",
        LastReviewedOn: formatDate(aspImpTableData[0].createdAt),
      };

      // Generate HTML report
      return `
        <div class="report">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
            <thead style="border: 1px solid black;">
              <tr style="background-color: #fbe4d5; text-align: center;">
                <th colspan="9">ENVIRONMENTAL ASPECT IMPACT ANALYSIS</th>
              </tr>
            </thead>
            <tbody>
              <tr style="text-align: left; border-bottom: 1px solid black;">
                <td colspan="9" style="border: none;">
                  <img src="${
                    logo || HindalcoLogoSvg
                  }" alt="Company Logo" style="display: block; margin-left: auto; margin-right: auto; width: 100px;">
                </td>
              </tr>
              <tr class="no-border">
                <td colspan="9" style="border: none;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="width: 50%;">Plant: ${metaData.Plant}</td>
                      <td>Department: ${metaData.Department}</td>
                    </tr>
                    <tr>
                      <td>Section: ${metaData.Section}</td>
                      <td>Last Reviewed On: ${metaData.LastReviewedOn}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr style="border: 1px solid black; background-color: #92d050;">
                <th style="border: 1px solid black; padding: 2px;">SL. No.</th>
                <th style="border: 1px solid black; padding: 2px;">Activity</th>
                <th style="border: 1px solid black; padding: 2px;">Aspect Type</th>
                <th style="border: 1px solid black; padding: 2px;">Specific Environmental Aspect</th>
                <th style="border: 1px solid black; padding: 2px;">Environmental Impact Type</th>
                <th style="border: 1px solid black; padding: 2px;">Specific Environment Impact</th>
                <th style="border: 1px solid black; padding: 2px;">Condition N/A/E</th>
                <th style="border: 1px solid black; padding: 2px;">Existing Control</th>
              </tr>
              ${aspImpTableData
                .map(
                  (item: any, index: any) => `
                <tr>
                  <td style="border: 1px solid black; padding: 2px;">${
                    index + 1
                  }</td>
                  <td style="border: 1px solid black; padding: 2px;">${
                    item.activity
                  }</td>
                  <td style="border: 1px solid black; padding: 2px;">${
                    item.selectedRiskTypes?.name
                  }</td>
                  <td style="border: 1px solid black; padding: 2px;">${
                    item.specificEnvAspect
                  }</td>
                  <td style="border: 1px solid black; padding: 2px;">${
                    item.selectedImpactTypes?.name
                  }</td>
                  <td style="border: 1px solid black; padding: 2px;">${
                    item.specificEnvImpact
                  }</td>
                  <td style="border: 1px solid black; padding: 2px;">${
                    item.selectedCondtions?.name
                  }</td>
                  <td style="border: 1px solid black; padding: 2px;">${
                    item.existingControl
                  }</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;
    };

    const htmlReport = reportTemplate(aspImpTableDataForReport);

    // When ready to print:
    printJS({
      type: "raw-html",
      printable: htmlReport,
    });
  };

  return (
    <>
      <ModuleNavigation
        tabs={[]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentModuleName={
          params.riskcategory === "AspImp"
            ? `Aspect Impact Register`
            : `${params.riskcategory} Register`
        }
        createHandler={createHandler}
        configHandler={configHandler}
        filterHandler={false}
        mainModuleName={"Risk Register"}
      />
      {/* <ModuleHeader
        moduleName={
          params.riskcategory === "AspImp"
            ? `Aspect Impact Register`
            : `${params.riskcategory} Register`
        }
        showSideNav={true}
        createHandler={createHandler}
        configHandler={configHandler}
        filterHandler={() => {}}
      /> */}
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
          {params.riskcategory === "HIRA" && (
            <div style={{ display: "flex", gap: "10px", width: "20%" }}>
              <Select
                showSearch
                placeholder="Filter By Job Title"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{ width: "100%" }}
                options={jobTitleOptions || []}
                onChange={(value) => handleJobTitleOptionChange(value)}
              />
              {params.riskcategory === "HIRA" &&
                selectedJobTitle !== null &&
                selectedJobTitle !== "All" && (
                  <Button onClick={handleExport}>Export</Button>
                )}
            </div>
          )}
          {params.riskcategory === "AspImp" && (
            <Button onClick={handleExportAspImp}>Export</Button>
          )}
          <div>
            <Input
              size="middle"
              placeholder="Search Risk"
              onChange={(event: any) => setSearch(event.target.value)}
              prefix={<SearchIcon />}
            />
          </div>
        </div>

        {params.riskcategory === "HIRA" ? (
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
                    expandIcon: ({ expanded, onExpand, record }: any) => {
                      if (record.children && record.children.length > 0) {
                        return expanded ? (
                          <KeyboardArrowDownRoundedIcon
                            className={classes.expandIcon}
                            onClick={(e: any) => onExpand(record, e)}
                          />
                        ) : (
                          <ChevronRightRoundedIcon
                            className={classes.collapseIcon}
                            onClick={(e: any) => onExpand(record, e)}
                          />
                        );
                      }
                      return null;
                    },
                  }}
                  rowKey={"id"}
                  className={classes.riskTable}
                  rowClassName={rowClassName}
                  onRow={(record) => ({
                    onMouseEnter: () => handleMouseEnter(record),
                    onMouseLeave: handleMouseLeave,
                  })}
                  pagination={false}
                  onChange={(pagination: any, filters, sorter: any) => {
                    // const { current, pageSize } = pagination;
                    const sort = {
                      field: sorter.field,
                      order: sorter.order,
                    };
                    // console.log("checkrisk sort", sort, pagination);

                    // setPagination({ current, pageSize, total: pagination.total });
                    fetchRisks(selectedJobTitle, sort);
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
        ) : (
          <Row>
            <Col span={24}>
              <div
                className={classes.tableContainer}
                id="table1"
                // style={{  height: "300px" }}
              >
                <Table
                  columns={aspImpColumns}
                  dataSource={aspImpTableData}
                  expandable={{
                    expandIcon: ({ expanded, onExpand, record }: any) => {
                      if (record.children && record.children.length > 0) {
                        return expanded ? (
                          <KeyboardArrowDownRoundedIcon
                            className={classes.expandIcon}
                            onClick={(e: any) => onExpand(record, e)}
                          />
                        ) : (
                          <ChevronRightRoundedIcon
                            className={classes.collapseIcon}
                            onClick={(e: any) => onExpand(record, e)}
                          />
                        );
                      }
                      return null;
                    },
                  }}
                  rowKey={"id"}
                  className={classes.riskTable}
                  rowClassName={rowClassName}
                  onRow={(record) => ({
                    onMouseEnter: () => handleMouseEnter(record),
                    onMouseLeave: handleMouseLeave,
                  })}
                  pagination={false}
                  onChange={(pagination: any, filters, sorter: any) => {
                    // const { current, pageSize } = pagination;
                    const sort = {
                      field: sorter.field,
                      order: sorter.order,
                    };
                    // console.log("checkrisk sort", sort, pagination);

                    // setPagination({ current, pageSize, total: pagination.total });
                    fetchAspImps(sort);
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
                    handleChangeAspImpPageNew(page, pageSize);
                  }}
                />
              </div>
            </Col>
          </Row>
        )}
      </Space>

      <div className={classes.modalBox}>
        {!!addModalOpen && (
          <RiskDrawer
            addModalOpen={addModalOpen}
            setAddModalOpen={setAddModalOpen}
            fetchRisks={fetchRisks}
            fetchAspImps={fetchAspImps}
            riskId={riskId}
            formType={formType}
            tableData={tableData}
            setTableData={setTableData}
            existingRiskConfig={existingRiskConfig}
            selectedJobTitle={
              selectedJobTitle === null ? "All" : selectedJobTitle
            }
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
    </>
  );
};

export default RiskRegister;
