import React, { useEffect, useState } from "react";
import DocumentDcount from "./DocumentDCount";
import DocumentDashBoardCharts from "./DocumentDashBoardCharts";
import axios from "apis/axios.global";
import { API_LINK, REDIRECT_URL } from "config";
import {
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Tooltip,
  makeStyles,
  Theme,
  useMediaQuery,
} from "@material-ui/core";
import {
  Col,
  Form,
  Modal,
  Row,
  Table,
  Button as AndTdButton,
  Select as AntdSelect,
  TableColumnsType,
  Breadcrumb,
} from "antd";
import { formatDashboardQuery } from "utils/formatDashboardQuery";
import { useAsyncDebounce } from "react-table";
import { FileExcelTwoTone, FilterTwoTone } from "@ant-design/icons";
import { render } from "@testing-library/react";
import ReloadIcon from "../../assets/icons/Reload.svg";
import getAppUrl from "utils/getAppUrl";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { filterEventStoreDefs } from "@fullcalendar/react";
import RotateLeftIcon from "@material-ui/icons/RotateLeft";
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";
import MultiUserDisplay from "components/MultiUserDisplay";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { result } from "lodash";

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    minWidth: "100%",
  },
  container: {
    border: "1px solid #666666",
    borderRadius: "5px",
    "& .ant-picker-suffix .anticon-calendar": {
      color: "#4096FF" /* Change the color of the default icon */,
    },
    "& .ant-select-arrow": {
      color: "#4096FF", // Change the color of the default icon
    },
  },
  tableContainer: {
    width: "100%",
    overflowx: "scroll",
    // fontFamily: "Poppins !important",
    "& .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-container > .ant-table-summary > table > tfoot > tr > td":
      {
        borderInlineEnd: "none",
      },
    // overflowY: "hidden",
    // overflowX: "hidden !important",
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      borderBottom: "1px solid #003059",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    "& span.ant-table-column-sorter-inner": {
      color: "#00224E",
      // color: ({ iconColor }) => iconColor,
    },
    "& span.ant-tag": {
      display: "flex",
      width: "89px",
      padding: "5px 0px",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "10px",
      color: "white",
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      position: "sticky", // Add these two properties
      top: 0, // Add these two properties
      zIndex: 2,
      // padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      padding: "6px 8px !important",
      // fontFamily: "Poppins !important",
      lineHeight: "24px",
    },
    "& .ant-table-tbody >tr >td": {
      // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
      borderBottom: "1px solid #f0f0f0",
      padding: "4px 8px !important",
    },
    // "& .ant-table-wrapper .ant-table-container": {
    //   maxHeight: ({
    //     isGraphSectionVisible,
    //   }: {
    //     isGraphSectionVisible: boolean;
    //   }) => (isGraphSectionVisible ? "160px" : "420px"), // Adjust the max-height value as needed
    //   [theme.breakpoints.up("lg")]: {
    //     maxHeight: ({
    //       isGraphSectionVisible,
    //     }: {
    //       isGraphSectionVisible: boolean;
    //     }) => (isGraphSectionVisible ? "160px" : "420px"), // Adjust the max-height value as needed for large screens
    //   },
    //   [theme.breakpoints.up("xl")]: {
    //     maxHeight: ({
    //       isGraphSectionVisible,
    //     }: {
    //       isGraphSectionVisible: boolean;
    //     }) => (isGraphSectionVisible ? "600px" : "1000px"), // Adjust the max-height value as needed for extra large screens
    //   },
    //   overflowY: "auto",
    //   overflowX: "hidden",
    // },
    "& .ant-table-body": {
      maxHeight: "150px", // Adjust the max-height value as needed
      overflowY: "auto",
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "10px", // Adjust the height value as needed
        backgroundColor: "#e5e4e2",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
    "& tr.ant-table-row": {
      // borderRadius: 5,
      cursor: "pointer",
      transition: "all 0.1s linear",

      "&:hover": {
        backgroundColor: "white !important",
        boxShadow: "0 1px 5px 0px #0003",
        // transform: "scale(1.01)",

        "& td.ant-table-cell": {
          backgroundColor: "white !important",
        },
      },
    },
  },
  documentTable: {
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
    width: "100%", // Adjust the width as needed
    overflowX: "auto", // Add horizontal scroll if needed
    "& .ant-table": {
      minWidth: "100%", // Ensure table fills container width
    },
    "& .ant-table-body": {
      maxWidth: "100%", // Ensure table body fills container width
    },
    // "& .ant-table-pagination": {
    //   display: "none", // Hide default pagination
    // },
  },
  centerAlignedCell: {
    textAlign: "center",
    "&.ant-table-body ": {
      padding: "0px",
    },
    "&.ant-table-wrapper .ant-table-tbody>tr>td": {
      padding: "5px 8px",
    },

    "&.custom-pagination .ant-pagination": {
      fontSize: "12px" /* Adjust the font size as needed */,
    },

    /* Reduce the size of the pagination number */
    " &.custom-pagination .ant-pagination-item ": {
      fontSize: "12px",
    },

    /* Reduce the size of the pagination arrows */
    "& .custom-pagination .ant-pagination-item-link": {
      fontSize: "12px" /* Adjust the font size as needed */,
    },

    /* Reduce the size of the pagination size changer */
    "&.custom-pagination .ant-pagination-options ": {
      fontSize: "12px" /* Adjust the font size as needed */,
    },
  },

  table: {
    // border: "1px solid grey",
    // textAlign: "center",
    borderTopLeftRadius: "0px", // Remove top-left border-radius
    borderTopRightRadius: "0px",

    "& .ant-table-thead > tr > th": {
      backgroundColor: "#ccffff", // Change background color of header
      color: "black", // Change text color of header
      //   borderBottom: "1px solid black", // Add bottom border to header
      borderRadius: "none",
      borderTopLeftRadius: "0px", // Remove top-left border-radius
      borderTopRightRadius: "0px",
      // textAlign: "center",
    },
    "& .ant-table-tbody > tr > td": {
      borderBottom: "1px solid #d9d9d9",
      padding: "8px 10px",
      // textAlign: "center",
    },
    // "& .ant-table-tbody > tr:last-child > td": {
    //   borderBottom: "none",
    // },
  },
}));
const DocumentDashBoard = () => {
  const matches = useMediaQuery("(min-width:820px)");
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");

  const [activeTab, setActiveTab] = useState(0);
  const classes = useStyles();

  const [businessType, setBusinessType] = useState([]);
  const [business, setBusiness] = useState([]);
  const [functionData, setFunctionData] = useState([]);
  const [location, setLocation] = useState<any>([]);
  const [entity, setEntity] = useState<any>([]);
  const [type, setType] = useState("activeuser");
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [filterField, setFilterField] = useState<any>({
    location: userDetail.locationId,
    entity: [userDetail.entityId],
  });

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // header components states
  const [noOfDocs, setNoOfDocs] = useState<any>();
  const [noOfMyDept, setNoOfMyDept] = useState<any>();
  const [noOfNewDocs, setNoOfNewDocs] = useState<any>();
  const [noOfNewMyDept, setNoOfNewMyDept] = useState<any>();
  const [noOfRevisedDocs, setNoOfRevisedDocs] = useState<any>();
  const [noOfRevisedMyDept, setNoOfRevisedMyDept] = useState<any>();
  const [dueRevision, setDueRevision] = useState<any>();
  const [dueRevisionMyDept, setDueRevisionMyDept] = useState<any>();
  const [inWorkFlowCountMyLoc, setInWorkFlowCountMyLoc] = useState<any>();
  const [inWorkFlowCountMyDept, setInWorkFlowCountMyDept] = useState<any>();
  const [totalDocsMyLoc, setTotalDocsMyLoc] = useState<any>();
  const [totalDocsMyDept, setTotalDocsMyDept] = useState<any>();
  const [totalDocs, setTotalDocs] = useState<any>();
  const [totalTypeData, setTotalTypeData] = useState<any>();
  const [revisedCurrentYear, setRevisedCurrentYear] = useState<any>();
  const [yearDataPublished, setYearDataPublished] = useState<any>();
  const [revisedOverDue, setRevisedOverDue] = useState<any>();
  const [inWorkFlowData, setInWorkFlowData] = useState<any>();
  const [statusData, setStatusData] = useState<any>([]);
  const [typeData, setTypeData] = useState<any>([]);
  const [systemData, setSystemData] = useState<any>([]);
  const [departmentTableData, setDepartmentTableData] = useState<any>([]);
  const [documentdata, setDocumentData] = useState<any>([]);
  const [deptData, setDeptData] = useState<any>([]);
  const [secTableData, setSecTableData] = useState<any>([]);
  const [secondModal, setSecondModal] = useState<any>(false);
  const [monthData, setMonthData] = useState<any>([]);
  const [docTypeData, setDocTypeData] = useState<any>([]);
  const [documentTypeData, setDocumentTypeData] = useState<any>([]);
  const [order, setOrder] = useState(false);
  const [filterQuery, setFilterQuery] = useState<any>();
  const realmName = getAppUrl();

  const { Option } = AntdSelect;
  useEffect(() => {
    fetchDataForOptions();
    if (userDetail.userType === "globalRoles") {
      let loc = userDetail?.additionalUnits?.includes("All")
        ? "All"
        : userDetail?.additionalUnits[0]?.id;
      setFilterField({
        location: loc,
        entity: ["All"],
      });
    } else {
      setFilterField({
        location: userDetail.locationId,
        entity: [userDetail.entityId],
      });
    }
  }, []);
  useEffect(() => {
    fetchLocationData();
    // fetchEntityData();
    chartData();
  }, [activeTab]);

  useEffect(() => {
    fetchEntityData();
  }, [filterField.location]);

  useEffect(() => {
    if (filterQuery) {
      setCurrent(1);
      setPageSize(10);
      newData(1, 10);
    }
  }, [filterQuery]);

  const handleSorterClick = () => {
    const newOrder = order ? "descend" : "ascend";
    setOrder(!order);
    newData(1, 10, !order);
    // Call your API with the new sort order

    // Example API call (replace with your actual API logic)
    // fetchSortedData('documentNumbering', newOrder);
  };
  const columns: any = [
    {
      title: "Name",
      dataIndex: "documentName",
      width: "250px",
      key: "documentName",
      render: (_: any, record: any, index: any) => {
        return (
          <div
            style={{
              textDecorationLine: "underline",
              cursor: "pointer",
              width: "250px",
            }}
            onClick={() => {
              const url = `${
                process.env.REACT_APP_SERVER_MODE === "true"
                  ? `https://${REDIRECT_URL}`
                  : `http://${realmName}.${REDIRECT_URL}`
              }/processdocuments/processdocument/viewprocessdocument/${
                record?.id
              }`;

              window.open(url, "_blank");
            }}
          >
            <Tooltip title={record.documentName}>
              <span style={{ width: "100%" }}> {record.documentName}</span>
            </Tooltip>
          </div>
        );
      },
    },
    ...(activeTab !== 9 && activeTab !== 14 && activeTab !== 8
      ? [
          {
            title: "Document Number",
            dataIndex: "documentNumbering",
            width: "200px",
            sortOrder: order ? "ascend" : "descend",
            showSorterTooltip: false,
            onHeaderCell: () => ({
              onClick: handleSorterClick,
            }),
            sorter: true, // This enables the sort icon
            key: "documentNumbering",
          },
        ]
      : []),
    ...(activeTab === 9 || activeTab === 14 || activeTab === 8
      ? [
          {
            title: "Pending with",
            dataIndex: "pendingWith",
            key: "pendingWith",
            render: (_: any, record: any) => {
              return (
                <MultiUserDisplay data={record.pendingWith} name="email" />
              );
            },
          },
        ]
      : []),
    {
      title: "Status",
      dataIndex: "documentState",
      width: "200px",
      key: "documentState",
    },
    {
      title: "Unit Name",
      dataIndex: "creatorLocation",
      width: "200px",
      key: "creatorLocation",
      render: (text: any, record: any, index: any) =>
        record?.creatorLocation?.locationName || "",
    },
    {
      title: "Dept/Vertical Name",
      dataIndex: "creatorEntity",
      width: "200px",
      key: "creatorEntity",
      render: (text: any, record: any, index: any) =>
        record?.creatorEntity?.entityName || "",
    },
  ];

  const [exportDatas, setExportData] = useState<any[]>([]);

  const fetchData = () => {
    chartData();
  };
  const newData = async (page = 1, pageSize = 10, asc = true) => {
    // if (data?.length > 0) {
    let name, type;
    if (activeTab === 0) {
      name = "totalPublished";
      type = "myDept";
    } else if (activeTab === 1) {
      name = "totalPublished";
      type = "myLoc";
    } else if (activeTab === 2) {
      name = "yearPublished";
      type = "myDept";
    } else if (activeTab === 3) {
      name = "yearPublished";
      type = "myLoc";
    } else if (activeTab === 4) {
      name = "revisedCurrentYear";
      type = "myDept";
    } else if (activeTab === 5) {
      name = "revisedCurrentYear";
      type = "myLoc";
    } else if (activeTab === 6) {
      name = "revisedue";
      type = "myDept";
    } else if (activeTab === 7) {
      name = "revisedue";
      type = "myLoc";
    } else if (activeTab === 8) {
      name = "inWorkFlow";
      type = "myDept";
    } else if (activeTab === 9) {
      name = "inWorkFlow";
      type = "myLoc";
    } else if (activeTab === 10) {
      name = "totalPublished";
      type = "";
    } else if (activeTab === 11) {
      name = "yearPublished";
      type = "";
    } else if (activeTab === 12) {
      name = "revisedCurrentYear";
      type = "";
    } else if (activeTab === 13) {
      name = "revisedue";
      type = "";
    } else if (activeTab === 14) {
      name = "inWorkFlow";
      type = "";
    } else if (activeTab === 15) {
      name = "totaldocs";
      type = "myDept";
    } else if (activeTab === 16) {
      name = "totaldocs";
      type = "myLoc";
    } else if (activeTab === 17) {
      name = "totaldocs";
      type = "";
    }
    // const encodedLoc = filterField?.location
    //   ?.map((value: any) => {
    //     return `location[]=${value}`;
    //   })
    //   .join("&");
    const encodedEntity = filterField?.entity
      ?.map((value: any) => {
        return `entity[]=${value}`;
      })
      .join("&");

    const systemData = filterQuery?.system
      ?.map((value: any) => `&system[]=${value}`)
      .join("");
    const tableData: any = await axios.get(
      // `/api/dashboard/displayDocData?${idsData}`
      `api/dashboard/displayDocData?name=${name}&type=${type}&location[]=${filterField?.location}&${encodedEntity}&status=${filterQuery?.status}&entityId=${filterQuery?.entityId}&typeData=${filterQuery?.type}&${systemData}&skip=${page}&limit=${pageSize}&asc=${asc}&sectionId=${filterQuery?.sectionId}&month=${filterQuery?.month}`
    );

    const exportData = await axios.get(
      `/api/dashboard/displayDocumentData?name=${name}&type=${type}&location[]=${filterField?.location}&${encodedEntity}&status=${filterQuery?.status}&entityId=${filterQuery?.entityId}&typeData=${filterQuery?.type}&${systemData}&asc=${asc}`
    );
    if (exportData.status === 200 || exportData.status === 201) {
      setExportData(exportData?.data?.data);
    }

    setSecTableData(tableData?.data?.data);
    setCount(tableData?.data?.count);
    setSecondModal(true);
    // }
  };
  const fetchLocationData = async () => {
    try {
      // functionData, business, businessType

      const url = formatDashboardQuery(
        "/api/audits/getAllLocationForSeletedFunction",
        { ...filterField }
      );
      const res = await axios.get(url);
      setLocation([{ id: "All", locationName: "All" }, ...res.data]);
    } catch (err) {}
  };

  const fetchEntityData = async () => {
    try {
      // functionData, business, businessType
      const encodedEntity = filterField?.entity
        ?.map((value: any) => {
          return `entity[]=${value}`;
        })
        .join("&");
      const url = `/api/audits/getAllEntityForLocation?location[]=${filterField?.location}&${encodedEntity}`;
      const res: any = await axios.get(url);
      setEntity([{ id: "All", entityName: "All" }, ...res.data]);
    } catch (err) {}
  };

  const fetchDataForOptions = async () => {
    try {
      const businessType = await axios.get(`/api/audits/getAllBusinessType`);
      setBusinessType(businessType.data);

      const business = await axios.get(`/api/audits/getAllBusiness`);
      setBusiness(business.data);

      const functiondata = await axios.get(`/api/audits/getAllFunction`);
      setFunctionData(functiondata.data);
    } catch (err) {}
  };

  const chartData = async () => {
    // try {
    let name, type;
    if (activeTab === 0) {
      name = "totalPublished";
      type = "myDept";
    } else if (activeTab === 1) {
      name = "totalPublished";
      type = "myLoc";
    } else if (activeTab === 2) {
      name = "yearPublished";
      type = "myDept";
    } else if (activeTab === 3) {
      name = "yearPublished";
      type = "myLoc";
    } else if (activeTab === 4) {
      name = "revisedCurrentYear";
      type = "myDept";
    } else if (activeTab === 5) {
      name = "revisedCurrentYear";
      type = "myLoc";
    } else if (activeTab === 6) {
      name = "revisedue";
      type = "myDept";
    } else if (activeTab === 7) {
      name = "revisedue";
      type = "myLoc";
    } else if (activeTab === 8) {
      name = "inWorkFlow";
      type = "myDept";
    } else if (activeTab === 9) {
      name = "inWorkFlow";
      type = "myLoc";
    } else if (activeTab === 10) {
      name = "totalPublished";
      type = "";
    } else if (activeTab === 11) {
      name = "yearPublished";
      type = "";
    } else if (activeTab === 12) {
      name = "revisedCurrentYear";
      type = "";
    } else if (activeTab === 13) {
      name = "revisedue";
      type = "";
    } else if (activeTab === 14) {
      name = "inWorkFlow";
      type = "";
    } else if (activeTab === 15) {
      name = "totaldocs";
      type = "myDept";
    } else if (activeTab === 16) {
      name = "totaldocs";
      type = "myLoc";
    } else if (activeTab === 17) {
      name = "totaldocs";
      type = "";
    }

    // const encodedLoc = filterField?.location
    //   ?.map((value: any) => {
    //     return `location[]=${value}`;
    //   })
    //   .join("&");

    let encodedEntity: any;
    if (
      filterField?.entity !== undefined &&
      filterField?.entity !== "undefined" &&
      filterField?.enttity !== ""
    ) {
      encodedEntity = filterField?.entity
        ?.map((value: any) => {
          return `entity[]=${value}`;
        })
        .join("&");
    }

    if (
      // filterField?.entity !== undefined &&
      filterField?.location !== undefined
    ) {
      const res = await axios.get(
        `api/dashboard/dashboardData?name=${name}&type=${type}&${encodedEntity}&location[]=${filterField.location}`
      );
      setDocTypeData(res?.data?.chartData?.docTypeData || []);
      setNoOfMyDept(res?.data?.leaderBoard?.totalPublishedByDept || 0);
      setNoOfDocs(res?.data?.leaderBoard?.totalPublishedByLoc || 0);
      setNoOfNewMyDept(res?.data?.leaderBoard?.yearPublishedByDept || 0);
      setNoOfNewDocs(res?.data?.leaderBoard?.yearPublishedByLoc || 0);
      setNoOfRevisedMyDept(
        res?.data?.leaderBoard?.revisedCurrentYearByDept || 0
      );
      setNoOfRevisedDocs(res?.data?.leaderBoard?.revisedCurrentYearByloc || 0);
      setDueRevisionMyDept(res?.data?.leaderBoard?.revisedOverDueDept || 0);
      setDueRevision(res?.data?.leaderBoard?.revisedOverDueLoc || 0);
      setInWorkFlowCountMyDept(res?.data?.leaderBoard?.inWorkFlowDept || 0);
      setInWorkFlowCountMyLoc(res?.data?.leaderBoard?.inWorkFlowLoc || 0);
      setStatusData(res?.data?.chartData?.type || []);
      setTypeData(res?.data?.chartData?.doctypeData || []);
      setSystemData(res?.data?.chartData?.systemData || []);
      setDepartmentTableData(res?.data?.chartData?.deptStatusData || []);
      setDocumentData(res?.data?.chartData?.tableData || []);
      setType(res?.data?.leaderBoard?.type);
      setTotalTypeData(res?.data?.leaderBoard?.totalPublished || 0);
      setRevisedCurrentYear(res?.data?.leaderBoard?.revisedCurrentYear || 0);
      setYearDataPublished(res?.data?.leaderBoard?.yearPublished || 0);
      setRevisedOverDue(res?.data?.leaderBoard?.revisedOverDue || 0);
      setInWorkFlowData(res?.data?.leaderBoard?.inWorkFlow || 0);
      setTotalDocsMyLoc(res?.data?.leaderBoard?.totalDocByLoc || 0);
      setTotalDocsMyDept(res?.data?.leaderBoard?.totalDocByDept || 0);
      setTotalDocs(res?.data?.leaderBoard?.totalDoc || 0);
      setDeptData(res?.data?.chartData?.deptData || []);
      setMonthData(res?.data?.chartData?.monthData || []);
      setDocumentTypeData(res?.data?.docTypeData || []);
    }
    // } catch (err) {}
  };

  const defaultChartData = async () => {
    try {
      let name, type;
      // if (activeTab === 0) {
      name = "totalPublished";
      type = "myDept";
      // }
      setActiveTab(0);
      // const encodedLoc = filterField?.location
      //   ?.map((value: any) => {
      //     return `location[]=${value}`;
      //   })
      //   .join("&");
      // const encodedEntity = filterField?.entity
      //   ?.map((value: any) => {
      //     return `entity[]=${value}`;
      //   })
      //   .join("&");
      // location: userDetail.locationId,
      // entity: userDetail.entityId,
      if (
        // filterField?.entity !== undefined &&
        filterField?.location !== undefined
      ) {
        const res = await axios.get(
          `api/dashboard/dashboardData?name=${name}&type=${type}&entity[]=${userDetail.entityId}&location[]=${userDetail.locationId}`
        );
        setDocTypeData(res?.data?.chartData?.docTypeData || []);
        setNoOfMyDept(res?.data?.leaderBoard?.totalPublishedByDept || 0);
        setNoOfDocs(res?.data?.leaderBoard?.totalPublishedByLoc || 0);
        setNoOfNewMyDept(res?.data?.leaderBoard?.yearPublishedByDept || 0);
        setNoOfNewDocs(res?.data?.leaderBoard?.yearPublishedByLoc || 0);
        setNoOfRevisedMyDept(
          res?.data?.leaderBoard?.revisedCurrentYearByDept || 0
        );
        setNoOfRevisedDocs(
          res?.data?.leaderBoard?.revisedCurrentYearByloc || 0
        );
        setDueRevisionMyDept(res?.data?.leaderBoard?.revisedOverDueDept || 0);
        setDueRevision(res?.data?.leaderBoard?.revisedOverDueLoc || 0);
        setInWorkFlowCountMyDept(res?.data?.leaderBoard?.inWorkFlowDept || 0);
        setInWorkFlowCountMyLoc(res?.data?.leaderBoard?.inWorkFlowLoc || 0);
        setStatusData(res?.data?.chartData?.type || []);
        setTypeData(res?.data?.chartData?.doctypeData || []);
        setSystemData(res?.data?.chartData?.systemData || []);
        setDepartmentTableData(res?.data?.chartData?.deptStatusData || []);
        setDocumentData(res?.data?.chartData?.tableData || []);
        setType(res?.data?.leaderBoard?.type);
        setTotalTypeData(res?.data?.leaderBoard?.totalPublished || 0);
        setRevisedCurrentYear(res?.data?.leaderBoard?.revisedCurrentYear || 0);
        setYearDataPublished(res?.data?.leaderBoard?.yearPublished || 0);
        setRevisedOverDue(res?.data?.leaderBoard?.revisedOverDue || 0);
        setInWorkFlowData(res?.data?.leaderBoard?.inWorkFlow || 0);
        setTotalDocsMyLoc(res?.data?.leaderBoard?.totalDocByLoc || 0);
        setTotalDocsMyDept(res?.data?.leaderBoard?.totalDocByDept || 0);
        setTotalDocs(res?.data?.leaderBoard?.totalDoc || 0);
        setDeptData(res?.data?.chartData?.deptData || []);
        setMonthData(res?.data?.chartData?.monthData || []);
        setDocumentTypeData(res?.data?.docTypeData || []);
      }
    } catch (err) {}
  };

  // mobile view filter moda.

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const exportToExcel = () => {
    if (!exportDatas || exportDatas.length === 0) {
      return;
    }

    // Convert dataSource into an array format suitable for Excel
    const worksheetData = exportDatas.map((item: any) => ({
      Name: item.documentName || "",
      "Document Number": item.documentNumbering || "",
      "Pending With":
      item.pendingWith?.map((user: any) => user.email).join(", ") || "",
      Status: item.documentState || "",
      "Unit Name": item.creatorLocation?.locationName || "",
      "Dept/Vertical Name": item.creatorEntity?.entityName || "",
    }));

    // Create a new worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Table Data");

    // Convert the workbook to a binary format
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });

    // Function to create a Blob and trigger download
    const s2ab = (s: string) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    };

    // Create Blob and trigger download
    const data = new Blob([s2ab(excelBuffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, "Table_Data.xlsx");
  };

  return (
    <>
      {matches ? (
        <div
          style={{
            // cursor: "pointer",
            // position: "absolute",
            // top: "10px",
            // right: "35px",
            fontSize: "20px",
            color: "black !important",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {/* <FilterTwoTone width={25} height={21} style={{ marginRight: "5px" }} /> */}
          <Breadcrumb separator="  ">
            <Breadcrumb.Item>
              <span style={{ color: "black" }}>Unit:</span>

              <AntdSelect
                showSearch
                allowClear
                placeholder="Select Unit"
                // onClear={() => setSelectedLocation(undefined)}
                value={filterField?.location || ""}
                style={{
                  width: 200,
                  marginLeft: 8,
                  border: "1px solid black",
                  borderRadius: "5px",
                }}
                onChange={(value) => {
                  setFilterField({
                    ...filterField,
                    location: value,
                    entity: [],
                  });
                }}
                optionFilterProp="children"
                filterOption={(input, option: any) => {
                  // Match the input with the locationName instead of id
                  const locationName =
                    location.find((loc: any) => loc.id === option.value)
                      ?.locationName || "";
                  return locationName
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
              >
                {location.map((obj: any) => (
                  <Option key={obj.id} value={obj.id}>
                    {obj.locationName}
                  </Option>
                ))}
              </AntdSelect>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <span>Department:</span>

              <AntdSelect
                showSearch
                allowClear
                disabled={filterField.location === "All" ? true : false}
                mode="multiple"
                // onClear={() => setSelectedEntity(undefined)}
                placeholder="Select Department"
                value={filterField?.entity || []}
                style={{
                  width: 350,
                  marginLeft: 8,
                  border: "1px solid black",
                  borderRadius: "5px",
                }}
                onChange={(value) => {
                  if (value.includes("All")) {
                    setFilterField({ ...filterField, entity: ["All"] });
                  } else {
                    setFilterField({ ...filterField, entity: value });
                  }
                }}
                optionFilterProp="children"
                filterOption={(input, option: any) => {
                  // Match the input with the locationName instead of id
                  const locationName =
                    entity.find((loc: any) => loc.id === option.value)
                      ?.entityName || "";
                  return locationName
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
              >
                {entity.map((obj: any) => (
                  <Option key={obj.id} value={obj.id}>
                    <span
                      style={{ whiteSpace: "normal", wordBreak: "break-word" }}
                    >
                      {obj.entityName}
                    </span>
                  </Option>
                ))}
              </AntdSelect>
            </Breadcrumb.Item>
          </Breadcrumb>
          <AndTdButton
            type="primary"
            onClick={() => {
              fetchData();
            }}
            style={{
              width: "70px",
              backgroundColor: "rgb(0, 48, 89)",
              marginLeft: "5px",
              height: "28px",
              lineHeight: "16px",
            }}
          >
            Apply
          </AndTdButton>
          <AndTdButton
            type="text"
            onClick={() => {
              setFilterField({
                location: userDetail.locationId,
                entity: [userDetail.entityId],
              });
              defaultChartData();
              setOpen(false);
            }}
            style={{
              width: "40px",
              display: "flex",
              justifyContent: "center",
              height: "32px",
            }}
            icon={<RotateLeftIcon />}
          />
        </div>
      ) : null}
      <div style={{ width: "100%", marginTop: "20px" }}>
        {/* <Col span={11}>
                <Form.Item label="Functions">
                  <AntdSelect
                    allowClear
                    mode="multiple"
                    className={classes.container}
                    style={{ width: "100%" }}
                    value={filterField?.functionData || []}
                    onChange={(value) => {
                      setFilterField({
                        ...filterField,
                        functionData: value,
                        location: [],
                      });
                    }}
                    data-testid="function"
                  >
                    {functionData.map((obj: any) => (
                      <Option key={obj.id} value={obj.id}>
                        {obj.name}
                      </Option>
                    ))}
                  </AntdSelect>
                </Form.Item>
              </Col> */}
        {/* <Row
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginBottom: "-15px",
              }}
            >
              <Col span={11}>
                <Form.Item label="Business Type">
                  <AntdSelect
                    allowClear
                    placeholder="Business Type"
                    className={classes.container}
                    mode="multiple"
                    style={{ width: "100%" }}
                    value={filterField?.businessType || []}
                    onChange={(value) => {
                      setFilterField({
                        ...filterField,
                        businessType: value,
                      });
                    }}
                    data-testid="businessType"
                  >
                    {businessType.map((obj: any) => (
                      <Option key={obj.id} value={obj.id}>
                        {obj.name}
                      </Option>
                    ))}
                  </AntdSelect>
                </Form.Item>
              </Col>
              <Col span={11}>
                <Form.Item label="Business">
                  <AntdSelect
                    allowClear
                    mode="multiple"
                    style={{ width: "100%" }}
                    className={classes.container}
                    value={filterField?.business || []}
                    onChange={(value) => {
                      setFilterField({
                        ...filterField,
                        business: value,
                      });
                    }}
                    data-testid="location"
                  >
                    {business.map((obj: any) => (
                      <Option key={obj.id} value={obj.id}>
                        {obj.name}
                      </Option>
                    ))}
                  </AntdSelect>
                </Form.Item>
              </Col>
            </Row> */}
        {/* <FilterTwoTone
        style={{
          cursor: "pointer",
          position: "absolute",
          top: "10px",
          right: "70px",
          fontSize: "20px",
        }}
        onClick={() => {
          setOpen(true);
        }}
      />
      <Modal
        title={"Filter By"}
        open={open}
        onOk={() => {}}
        onCancel={() => {
          setOpen(false);
        }}
        okText=""
        cancelText=""
        footer={null}
      >
        <div
          style={{
            backgroundColor: "#F8F9F9",
            border: "1px solid #89d5cd",
            padding: "10px",
            borderRadius: "10px",
          }}
        >
          <Form layout="vertical">
            <Row
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginBottom: "-15px",
              }}
            >
              <Col span={11}>
                <Form.Item label="Unit">
                  <AntdSelect
                    allowClear
                    // mode="multiple"
                    style={{ width: "100%" }}
                    className={classes.container}
                    value={filterField?.location || ""}
                    onChange={(value) => {
                      setFilterField({
                        ...filterField,
                        location: value,
                        entity: "",
                      });
                    }}
                    data-testid="unit"
                  >
                    {location.map((obj: any) => (
                      <Option key={obj.id} value={obj.id}>
                        {obj.locationName}
                      </Option>
                    ))}
                  </AntdSelect>
                </Form.Item>
              </Col>
              <Col span={11}>
                <Form.Item label="Entity">
                  <AntdSelect
                    allowClear
                    // mode="multiple"
                    style={{ width: "100%" }}
                    className={classes.container}
                    value={filterField?.entity || ""}
                    onChange={(value) => {
                      setFilterField({ ...filterField, entity: value });
                    }}
                    data-testid="entity"
                  >
                    {entity.map((obj: any) => (
                      <Option key={obj.id} value={obj.id}>
                        {obj.entityName}
                      </Option>
                    ))}
                  </AntdSelect>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Form.Item label=" ">
                <>
                  <AndTdButton
                    type="primary"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    Apply
                  </AndTdButton>
                  <Tooltip title="Graph reload">
                    <IconButton
                      onClick={() => {
                        setFilterField({
                          location: userDetail.locationId,
                          entity: userDetail.entityId,
                        });
                        setOpen(false);
                      }}
                    >
                      <img src={ReloadIcon} alt="reload" width={18} />
                    </IconButton>
                  </Tooltip>
                </>
              </Form.Item>
            </Row>
          </Form>
        </div>
      </Modal> */}

        <DocumentDcount
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          getDataForNoDocs={[]}
          noOfDocs={noOfDocs}
          noOfMyDept={noOfMyDept}
          noOfNewDocs={noOfNewDocs}
          noOfNewMyDept={noOfNewMyDept}
          noOfRevisedDocs={noOfRevisedDocs}
          noOfRevisedMyDept={noOfRevisedMyDept}
          dueRevision={dueRevision}
          dueRevisionMyDept={dueRevisionMyDept}
          inWorkFlowCountMyLoc={inWorkFlowCountMyLoc}
          inWorkFlowCountMyDept={inWorkFlowCountMyDept}
          totalTypeData={totalTypeData}
          revisedCurrentYear={revisedCurrentYear}
          yearDataPublished={yearDataPublished}
          revisedOverDue={revisedOverDue}
          inWorkFlowData={inWorkFlowData}
          type={type}
          totalDocsMyLoc={totalDocsMyLoc}
          totalDocsMyDept={totalDocsMyDept}
          totalDocs={totalDocs}
        />
        <DocumentDashBoardCharts
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          statusData={statusData}
          typeData={typeData}
          systemData={systemData}
          departmentTableData={departmentTableData}
          documentdata={documentdata}
          deptData={deptData}
          setSecTableData={setSecTableData}
          secTableData={secTableData}
          setSecondModal={setSecondModal}
          // newData={newData}
          monthData={monthData}
          docTypeData={docTypeData}
          documentTypeData={documentTypeData}
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          entity={entity}
          location={location}
          entityId={filterField?.entity}
          locationId={filterField?.location}
        />

        <Modal
          title=""
          visible={secondModal}
          width={"100%"}
          footer={null}
          zIndex={2000}
          onCancel={() => {
            setSecondModal(false);
          }}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{
                width: "30px",
                height: "38px",
                cursor: "pointer",
              }}
            />
          }
        >
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "end",
                marginRight: "20px",
                marginBottom: "10px",
              }}
            >
              <AndTdButton
                type="primary"
                onClick={exportToExcel}
                icon={<FileExcelTwoTone />}
              >
                Download Excel
              </AndTdButton>
            </div>
            <div className={classes.tableContainer}>
              <Table
                dataSource={secTableData}
                columns={columns}
                pagination={{
                  current: current,
                  pageSize: pageSize,
                  total: count,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} documents`,
                  pageSizeOptions: ["10", "20", "30"],
                  onChange: (page, pageSizeNew) => {
                    setCurrent(page);
                    setPageSize(pageSizeNew);
                    newData(page, pageSizeNew);
                    // Add your logic to handle page change if needed
                  },
                }}
                // style={{width:'900%'}}
                className={classes.documentTable}
              />
            </div>
          </>
        </Modal>
      </div>

      {matches ? (
        ""
      ) : (
        <div
          style={{
            paddingTop: "3px",
            position: "absolute",
            top: 82,
            right: 30,
          }}
        >
          <FilterIcon
            style={{ width: "24px", height: "24px" }}
            onClick={showModal}
          />
        </div>
      )}

      {/* // Mobile view Modal for filters */}
      <Modal
        title={
          <div
            style={{
              backgroundColor: "#E8F3F9",
              padding: "8px",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
            }}
          >
            Filter By
          </div>
        }
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        // className={classes.modal}
        footer={null}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "30px",
              cursor: "pointer",
              padding: "0px",
              margin: "7px 15px 0px 0px",
            }}
          />
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
            // marginTop: "20px",
            // border: "1px solid rgba(19, 171, 155, 0.5)",
            // borderRadius: "12px",
            // padding: "20px",
            // margin: "20px 20px 10px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <span style={{ color: "black" }}>Unit:</span>

            <AntdSelect
              showSearch
              allowClear
              placeholder="Select Unit"
              // onClear={() => setSelectedLocation(undefined)}
              value={filterField?.location || ""}
              style={{
                width: "100%",

                border: "1px solid black",
                borderRadius: "5px",
              }}
              onChange={(value) => {
                setFilterField({
                  ...filterField,
                  location: value,
                  entity: [],
                });
              }}
              optionFilterProp="children"
              filterOption={(input, option: any) => {
                // Match the input with the locationName instead of id
                const locationName =
                  location.find((loc: any) => loc.id === option.value)
                    ?.locationName || "";
                return locationName.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {location.map((obj: any) => (
                <Option key={obj.id} value={obj.id}>
                  {obj.locationName}
                </Option>
              ))}
            </AntdSelect>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <span>Department:</span>

            <AntdSelect
              showSearch
              allowClear
              disabled={filterField.location === "All" ? true : false}
              mode="multiple"
              // onClear={() => setSelectedEntity(undefined)}
              placeholder="Select Department"
              value={filterField?.entity || []}
              style={{
                width: "100%",

                border: "1px solid black",
                borderRadius: "5px",
              }}
              onChange={(value) => {
                if (value.includes("All")) {
                  setFilterField({ ...filterField, entity: ["All"] });
                } else {
                  setFilterField({ ...filterField, entity: value });
                }
              }}
              optionFilterProp="children"
              filterOption={(input, option: any) => {
                // Match the input with the locationName instead of id
                const locationName =
                  entity.find((loc: any) => loc.id === option.value)
                    ?.entityName || "";
                return locationName.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {entity.map((obj: any) => (
                <Option key={obj.id} value={obj.id}>
                  <span
                    style={{
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {obj.entityName}
                  </span>
                </Option>
              ))}
            </AntdSelect>
          </div>

          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <AndTdButton
              type="primary"
              onClick={() => {
                fetchData();
              }}
              style={{
                width: "70px",
                backgroundColor: "rgb(0, 48, 89)",
                marginLeft: "5px",
                height: "28px",
                lineHeight: "16px",
              }}
            >
              Apply
            </AndTdButton>
            <AndTdButton
              type="text"
              onClick={() => {
                setFilterField({
                  location: userDetail.locationId,
                  entity: [userDetail.entityId],
                });
                defaultChartData();
                setOpen(false);
              }}
              style={{
                width: "40px",
                display: "flex",
                justifyContent: "center",
                height: "32px",
              }}
              icon={<RotateLeftIcon />}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DocumentDashBoard;
