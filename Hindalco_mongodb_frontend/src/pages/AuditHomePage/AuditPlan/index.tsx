import { useState, useEffect, useRef } from "react";
import {
  Box,
  Fab,
  Typography,
  Tooltip,
  Grid,
  CircularProgress,
  FormControl,
  TextField,
  IconButton,
  useMediaQuery,
  Paper,
  Button as MuiButton,
  Avatar,
  Icon,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@material-ui/core";
import CustomTable2 from "components/newComponents/CustomTable2";
import ConfirmDialog from "components/ConfirmDialog";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import axios from "apis/axios.global";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import { makeStyles } from "@material-ui/core/styles";
import EmptyTableImg from "assets/EmptyTableImg.svg";
import SearchBar from "components/SearchBar";
import { DoubleRightOutlined, DoubleLeftOutlined } from "@ant-design/icons";
import MultiUserDisplay from "components/MultiUserDisplay";
import AuditPlanForm3 from "components/AuditPlanForm3";
// "UpdateOutlinedIcon": "MdUpdate",
import {
  MdUpdate,
  MdOutlineClose,
  MdOutlineEdit,
  MdListAlt,
  MdOutlineAddBox,
  MdOutlineDelete,
  MdAdd,
  MdFormatListBulleted,
  MdOutlineCancel,
  MdAssessment,
  MdOutlineCalendarToday,
  MdOutlineEventAvailable,
  MdVisibility,
  MdOutlinePermContactCalendar,
  MdOutlineCheckCircle,
  MdPermContactCalendar,
  MdDateRange,
  MdDashboard,
} from "react-icons/md";

import {
  Badge,
  Button,
  Col,
  ConfigProvider,
  DatePicker,
  Divider,
  Input,
  Modal,
  Pagination,
  Row,
  Segmented,
  Select,
  Switch,
  Table,
  Tabs,
  Tag,
} from "antd";
import { ReactComponent as ConfigIcon } from "assets/documentControl/configuration.svg";
import YearComponent from "components/Yearcomponent";
import { auditPlanSchema } from "schemas/auditPlanSchema";
import getYearFormat from "utils/getYearFormat";
import getYearinYYYYformat from "utils/getYearinYYYYformat";
import { Autocomplete } from "@material-ui/lab";
import { getAllLocation } from "apis/locationApi";
import getAppUrl from "utils/getAppUrl";
import {
  currentAuditYear,
  currentLocation,
  auditScheduleFormType,
  currentAuditPlanYear,
  avatarUrl,
  auditSchedule,
} from "recoil/atom";
import { useRecoilState, useResetRecoilState } from "recoil";
import type { PaginationProps } from "antd";
import getSessionStorage from "utils/getSessionStorage";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/DeleteBlackColor.svg";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import type { ColumnsType } from "antd/es/table";

import AuditPeriodModal from "./AuditPeriodModal";
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import AuditScheduleFormStepper from "pages/AuditScheduleFormStepper";
import AliceCarousel from "react-alice-carousel";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { drop, uniqueId, update } from "lodash";
import { AnyObject } from "yup/lib/types";
import dayjs from "dayjs";
import AuditFinalizeModal from "./AuditFinalizeModal";
import TabPane from "antd/es/tabs/TabPane";
import moment from "moment";
import AuditScheduleCalendar from "components/ReusableCalendar/AuditScheduleCalendar";
import { CalendarView } from "kalend";
import ConsolidatedTable from "pages/InformationTable/ConsolidatedTable";
import { theme } from "theme";
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";

// import "react-alice-carousel/lib/alice-carousel.css";

const useStyles = makeStyles((theme) => ({
  fabButton: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    margin: "0 5px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
  taskTag: {
    display: "inline-block",
    backgroundColor: "#E0F7FA", // Light cyan background
    color: "#000", // Black text
    padding: "5px 10px",
    borderRadius: "15px", // Rounded corners for tag-like appearance
    fontSize: "15px",
    fontWeight: 600,
    margin: "5px",
    cursor: "pointer",
    textDecoration: "none", // Ensures no underline
    "&:hover": {
      backgroundColor: "#B2EBF2", // Slightly darker cyan on hover
    },
  },
  taskTitle: {
    fontSize: "15px",
    fontWeight: 600,
    margin: "5px",
    cursor: "pointer",
  },
  segmentedItem: {
    border: "2px solid #0e8aba",
    backgroundColor: "#ffffff",

    "&.ant-segmented .ant-segmented-item-selected": {
      backgroundColor: "#0e8aba !important", // Selected color
      color: "white !important", // Change text color when selected
    },
  },
  rollingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E0F7FA", // Light cyan background for the entire row
    padding: "10px 15px",
    borderRadius: "10px",
    margin: "10px 0",
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
    fontSize: "14px",
  },

  rightEnd: {
    marginLeft: "auto", // Ensures the div is pushed to the right
  },
  imgContainer: {
    display: "flex",
    justifyContent: "center",
  },
  emptyDataText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.palette.primary.main,
  },

  closeButton: {
    marginTop: 20,
    padding: "10px 20px",
    fontSize: 16,
    backgroundColor: "red",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
  pagination: {
    position: "fixed",
    bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
  searchContainer: {
    maxWidth: "100vw",
    height: "30px",
    // marginBottom: "25px",
  },
  docNavInnerFlexBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "6px 4px",
    "& .ant-input": {
      background: "#E8F3F9 !important",
    },
  },
  divderRightSide: {
    top: "0.1em",
    height: "1.5em",
    background: "gainsboro",
  },
  docNavIconStyle: {
    width: "21.88px",
    height: "21px",
    paddingRight: "6px",
    cursor: "pointer",
  },
  tableContainer: {
    // Table Header Styles
    // "& .ant-table-thead > tr > th": {
    //   backgroundColor: "#E8F3F9", // Set the table header background color to yellow
    // },
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      borderBottom: "1px solid #003059",
      padding: "4px 12px",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },
    // Table Body Styles
    "& .ant-table-tbody > tr > td": {
      // border: "0.5px solid #E6E8EA", // Add a border around each table body cell
      padding: "2px 12px", // Adjust the padding as needed
      height: "35px", // Set the height of the table cells
    },
    // "& tr.ant-table-row:nth-child(odd)": {
    //   backgroundColor: "#F5F5F5", // Odd row color
    // },
    // "& tr.ant-table-row:nth-child(even)": {
    //   backgroundColor: "#FFFFFF", // Even row color
    // },
  },
  root: {
    width: "100%",
  },
  iconGroup: {
    // marginLeft: "auto",
    display: "flex",
    justifyContent: "center",
    width: "fit-content",
    height: "fit-content",
    // alignItems: "center",
  },
  datePickersContainer: {
    display: "flex",
    justifyContent: "space-between",
    padding: "5px",
  },
  boardContainer: {
    padding: theme.spacing(2), // Add padding around the Kanban board
    display: "flex",
    overflowX: "auto",
    backgroundColor: "#ffffff",
  },
  // #ffffff
  // #F9F6F7
  column: {
    padding: theme.spacing(1),
    minWidth: "20px",
    // width:"70px",
    backgroundColor: "#f2f2f2",
    borderRadius: "4px",
    marginRight: theme.spacing(1),
  },
  columnName: {
    // marginBottom: theme.spacing(1),
    fontSize: "16px",
    // textAlign: "center",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "bold",
    padding: "0px",
    margin: "0px",
  },
  auditorNew: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#3F51B5",
    // whiteSpace: "nowrap", // Prevent text from wrapping
    overflow: "hidden",
    // textOverflow: "ellipsis", // Show ellipsis if text overflows
    // maxWidth: "120px", // Set a max width to handle varying text length
  },
  auditeeNew: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#FF5722",
    // whiteSpace: "nowrap", // Prevent text from wrapping
    overflow: "hidden",
    // textOverflow: "ellipsis", // Show ellipsis if text overflows
    // maxWidth: "120px", // Set a max width to handle varying text length
  },

  taskContainer: {
    padding: theme.spacing(2),
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
    marginBottom: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    // marginBottom: theme.spacing(1),
  },
  title: {
    marginRight: theme.spacing(1),
    // fontWeight: "bold",
    fontSize: "15px",
    paddingLeft: "4px",
    display: "inline-block",
    // textAlign: "center",
    fontFamily: "'Poppins', sans-serif",
    flexGrow: 0,
  },
  description: {
    marginBottom: theme.spacing(1),
  },
  info: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  avatar: {
    marginRight: theme.spacing(1),
  },
  tableContainerScrollable: {
    marginBottom: "20px", // Adjust the value as needed
    maxHeight: "calc(76vh - 20vh)", // Adjust the max-height value as needed
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
  locSearchBox: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(10),
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: "4px",
    },
    padding: "4px",
  },

  locSearchBoxNew: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.typography.pxToRem(10),
    },
    // "& .MuiOutlinedInput-root": {
    //   borderRadius: "16px",
    // },
  },
  addButton: {
    border: "none",
    // position: "absolute",
    // top: theme.spacing(1),
    // right: theme.spacing(1),
  },
  // Add this to override the styles
  inputRootOverride: {
    border: "1px solid black",
    borderRadius: "5px",
    '& .MuiAutocomplete-inputRoot[class*="MuiOutlinedInput-root"][class*="MuiOutlinedInput-marginDense"]':
      {
        // padding: "3px 0px 1px 3px !important",
      },
  },
  textField: {
    fontSize: "14px",
    fontWeight: 600,
    "& .MuiOutlinedInput-root": {
      backgroundColor: "white",

      // borderRadius: "20px",
      // color: "black",
      fontSize: "14px",
      // fontWeight: 600,
      // border: "1px solid black",
    },
    // "& .MuiOutlinedInput-notchedOutline": {
    //   borderRadius: "20px",
    // },
    "& .MuiSvgIcon-root": {
      color: "black", // Change icon color
    },
  },
  textField2: {
    fontSize: "14px",
    fontWeight: 600,
    "& .MuiOutlinedInput-root": {
      backgroundColor: "white",
      // borderRadius: "20px",
      // color: "black",
      // border: "1px solid  black",
      fontSize: "14px",
      // fontWeight: 600,
    },
    // "& .MuiOutlinedInput-notchedOutline": {
    //   borderRadius: "20px",
    // },
    "& .MuiSvgIcon-root": {
      color: "black", // Change icon color
    },
  },
  tag: {
    display: "inline-block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100px", // Adjust the max-width as needed
  },
  tagContainer: {
    display: "flex",
    flexDirection: "row",
  },
  hiddenTags: {
    display: "none",
  },
  disabledRangePicker: {
    "& .ant-picker-input > input[disabled]": {
      color: "black", // Set text color to black
      fontSize: "12px",
    },
    "& .ant-picker-suffix": {
      color: "black !important", // Ensure icon color is black
    },
    "& .ant-picker-disabled": {
      // borderColor: "black", // Set border color to black
      // borderWidth: "1px",
      // borderStyle: "solid",
      border: "1px solid black",
    },
    "& .ant-picker-disabled .ant-picker-input input": {
      color: "black", // Ensure input text color is black when disabled
    },
    "& .ant-picker-disabled .ant-picker-suffix": {
      color: "black !important", // Ensure icon color is black when disabled
    },
  },
  name: {
    color: "#000",
    fontWeight: 500,
    marginRight: "20px",
  },
  auditor: {
    color: "#000",
    fontWeight: 400,
    marginRight: "20px",
  },
  auditee: {
    color: "#000",
    fontWeight: 400,
    marginRight: "20px",
  },
  time: {
    color: "#000",
    fontWeight: 400,
    marginRight: "20px",
  },
  addIcon: {
    color: "#9C27B0", // Purple color for the add icon
  },
}));

// interface AuditPlanProps {
//   ref2: React.Ref<HTMLDivElement>;
//   ref3: React.Ref<HTMLDivElement>;
// }
type Props = {
  refelemet2?: any;
  refelemet3?: any;
  refelemet4?: any;
  refelemet5?: any;
  refelemet6?: any;
  refelemet7?: any;
  mode?: boolean;
};

const showTotal: PaginationProps["showTotal"] = (total: any) =>
  `Total ${total} items`;
const Audit = ({
  refelemet2,
  refelemet3,
  refelemet4,
  refelemet5,
  refelemet6,
  refelemet7,
  mode,
}: Props) => {
  // const { ref2, ref3, ...otherProps } = props;
  const { Option } = Select;
  const { RangePicker } = DatePicker;
  const userDetails = getSessionStorage();
  const [allAuditPlanDetails, setAllAuditPlanDetails] = useState<any[]>([]);
  const [currentYear, setCurrentYear] = useState<any>();
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [deletePlan, setDeletePlan] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setsearchQuery] = useState<any>({
    searchQuery: "",
  });
  const [openModal, setOpenModel] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<any>("");
  const [auditPlanIds, setAuditPlanIds] = useState([]);
  const resetAuditSchedule = useResetRecoilState(auditSchedule);
  const [disabledButton, setDisabledButton] = useState(false);
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [calendarData, setCalendarData] = useState<any>([]);
  const [openAudit, setOpenAudit] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [create, setCreate] = useState(false);
  const [createSchedule, setCreateSchedule] = useState(false);
  const [currentStateNew, setCurrentStateNew] = useState("Planned"); // Initial state
  const [entityDataNew, setEntityDataNew] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState<any>(false);
  const [scope, setScope] = useState("");
  const allOptionNew: any = { id: "All", value: "All", scope: {} };
  const [selectCalenderview, setCalenderView] = useState(false);
  const [selectedEntityData, setSelectedEntityData] = useState("");
  const [modalMode, setModelMode] = useState("create");
  const [openAuditFinalize, setOpenAuditFinalize] = useState<any>(false);
  const [entityData, setEntityData] = useState<any>({});
  const [editEntityData, setEditEntityData] = useState<any>({});
  const [editEntityModal, setEditEntityModal] = useState(false);
  const [myAuditShow, setMyAuditShow] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [locationNo, setLocationNo] = useState("");
  const isMR = checkRoles(roles.MR);
  const isOrgAdmin = checkRoles(roles.ORGADMIN);
  const isLocationAdmin = checkRoles(roles.LOCATIONADMIN);
  const [auditorData, setAuditorData] = useState([]);
  const [auditeeData, setAuditeedata] = useState<any>([]);
  const [template, setTemplate] = useState<any>([]);
  const [selectTemplate, setSelectTemplate] = useState<any>([]);
  const isAuditor = checkRoles(roles.AUDITOR);
  const classes = useStyles();
  const allOption = { id: "All", locationName: "All" };
  const [selectedLocation, setSelectedLocation] = useState<any>({
    id: userDetails?.location?.id,
    locationName: userDetails?.location?.locationName,
  });
  const [calendarModalInfo, setCalendarModalInfo] = useState<any>({
    open: false,
    data: {},
    mode: "create",
    calendarFor: "AuditSchedule",
  });
  const [errMessage, setErrMessage] = useState("");
  const [errModal, setErrModal] = useState(false);
  const [errEditMessage, setEditErrMessage] = useState("");
  const [errEditModal, setEditErrModal] = useState(false);
  const [auditPlanId, setAuditPlanId] = useState("");
  const [removedList, setRemovedList] = useState<any>([]);
  const [loaderForSchdeuleDrawer, setLoaderForSchdeuleDrawer] = useState(false);

  const [unitDisableData, setUnitDisableData] = useState(false);
  const [planId, setPlanId] = useState<any>("");
  const [dropData, setDropData] = useState<any>([]);
  // const [selectAuditType, setSelectAuditType] = useState<any>();
  const [selectTableAuditType, setSelectTableAuditType] = useState<any>({});
  const [auditTypeOptions, setAuditTypeOptions] = useState<any>([]);
  // const [selectSystem, setSelectSystem] = useState<any>([]);
  const [selectTableSystem, setSelectTableSystem] = useState<any>([]);
  const [systemOptions, setSystemOptions] = useState<any>([]);
  const [optionData, setOptionData] = useState<any>([]);
  const [locationOption, setLocationOption] = useState([]);
  // const [selectLocation, setSelectLocation] = useState<any>();
  const [auditYear, setAuditYear] = useRecoilState<any>(currentAuditYear);
  const [auditPlanYear, setAuditPlanYear] =
    useRecoilState<any>(currentAuditPlanYear);
  const [searchValue, setSearchValue] = useState<any>({
    auditYear: auditYear ?? "",
    location: "",
    auditType: "",
    systemName: "",
    auditor: "",
  });
  const [isOpen, setIsOpen] = useState(false);

  const matches = useMediaQuery("(min-width:786px)");
  const [locationNames, setLocationNames] = useState<Location[]>([]);
  const [auditPlanData, setAuditPlanData] = useState<any>();
  const realmName = getAppUrl();
  const [selectAdd, setSelectAdd] = useState<any>([]);
  const [locationListing, setLocationListing] = useState([]);
  const [readMode, setReadMode] = useState<boolean>(false);
  const [filteredValues, setFilteredValues] = useState([]);
  const [page, setPage] = useState<any>(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [count, setCount] = useState<number>(0);
  const [auditPlanDataNew, setAuditPlanDataNew] = useState(auditPlanSchema);
  const [auditTypes, setAuditTypes] = useState<any[]>([]);
  const handleLinkClick = (record: any) => {
    navigate(`/audit/auditplan/auditplanform/${record.id}/view`);
  };

  const [isSecondVisible, setIsSecondVisible] = useState(false);
  const [selectedAuditType, setSelectedAuditType] = useState<any>({
    id: "",
    auditType: "",
  });
  const [formModeForCalendarDrawer, setFormModeForCalendarDrawer] =
    useState<any>(null);
  const carouselRef = useRef<any>(null);
  const [task, setTask] = useState<any>();
  const [hoveredColumn, setHoveredColumn] = useState(null);
  const [scheduleFormType, setScheduleFormType] = useRecoilState(
    auditScheduleFormType
  );
  const [auditPeriodModal, setAuditPeriodModal] = useState<any>({
    open: false,
    data: null,
  });
  const [auditPlanIdFromPlan, setAuditPlanIdFromPlan] = useState<any>("");

  const [viewerMode, setViewerMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEntityModal, setIsEntityModal] = useState(false);
  const [editScheduleModal, setEditScheduleModal] = useState(false);
  const [finalisedAuditorTourOpen, setFinalisedAuditorTourOpen] =
    useState<any>(false);
  const [calendarDataLoading, setCalendarDataLoading] = useState(false);
  const [auditScheduleIdFromLocation, setAuditScheduleIdFromLocation] =
    useState<any>("");
  //get auditTypes
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (myAuditShow === true) handlePagination(1, 10);
  }, [myAuditShow]);

  useEffect(() => {
    if (selectCalenderview === true) {
      getAuditType();
    }
  }, [selectCalenderview]);

  const getAuditType = async () => {
    try {
      let res = await axios.get(`/api/audit-settings/getAllAuditTypes`);
      setAuditTypes(res.data);
    } catch (err) {
      // console.error(err);
    }
  };

  useEffect(() => {
    getHeaderData();
  }, []);

  console.log("isDeleteModalOpen", isDeleteModalOpen);
  const getHeaderData = () => {
    getYearFormat(new Date().getFullYear()).then((response: any) => {
      setAuditYear(response);
    });
  };
  const getCalendarData = async (searchValue: any, openAuditNew = false) => {
    setCalendarDataLoading(true);
    const { auditYear, location, auditType, systemName, auditor } = searchValue;
    let url;
    setCalendarData([]);
    if (openAuditNew === true) {
      url = `api/auditSchedule/getMyAuditCalendardata?auditYear=${auditYear}&locationId=${location}&systemTypeId=${auditType}&systemMasterId=${systemName}&auditor=${auditor}&auditType=${selectTableAuditType?.id}`;
    } else {
      url = `api/auditSchedule/getAuditScheduleEntityWiseCalendardata?auditYear=${auditYear}&locationId=${location}&systemTypeId=${auditType}&systemMasterId=${systemName}&auditor=${auditor}&auditType=${selectTableAuditType?.id}`;
    }

    await axios.get(url).then((response: any) => {
      //process the result
      // Determine the role of the current user (auditor/auditee)
      setCalendarData([]);
      if (!!response.data) {
        response?.data?.map((item: any) => {
          let color: any;
          if (item.auditor?.includes(userDetails?.id)) {
            color = "skyblue";
          } else if (item.auditee?.includes(userDetails?.id)) {
            color = "#e6ffe6";
          } else color = "yellow";
          setCalendarData((prev: any) => [
            ...prev,
            {
              id: item.id,
              title: item.entityName ?? "-",
              start: item.time ?? "-",
              allDay: false,
              className: "audit-entry-new",
              textColor: "#000000",
              color: color,
              entityName: item?.entityName,
              url: `/audit/auditschedule/auditscheduleform/schedule/${item.id}`,
              auditor: item.auditor,
              auditee: item.auditee,
              locationName: item?.locationName,
              auditType: item?.auditType,
              auditScheduleId: item?.auditScheduleId,
              auditId: item?.auditId,
              auditReportCreated: item?.auditReport,
              responsibility: item?.responsibility,
              auditScheduleDetails: item?.auditScheduleDetails,
              myauditors: item?.myauditors,
              myauditees: item?.myauditees,
              systemMaster: item?.systemMaster,
              dateExcceds: item?.dateExcceds,
            },
          ]);
        });
        setCount(response?.data?.length);
      }
      setCalendarDataLoading(false);
    });
  };
  const columns: ColumnsType<any> = [
    {
      title: "Audit Name",
      dataIndex: "auditName",
      render: (_, record, index) => {
        return (
          <div ref={refelemet4}>
            <div
              style={{ position: "relative", display: "inline-block" }}
              onClick={() => handleLinkClick(record)}
            >
              <span
                style={{
                  textDecorationLine: "underline",
                  cursor: "pointer",
                }}
              >
                {record.auditName}
              </span>
              {record.isDraft &&
                record.isDraft && ( // Only show Draft label for the first row
                  <Tag
                    color="orange"
                    style={{
                      position: "absolute",
                      top: "-20px",
                      right: "-20px",
                      height: "20px",
                      lineHeight: "20px",
                    }}
                  >
                    Draft
                  </Tag>
                )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Audit Type",
      dataIndex: "auditTypeName",
      onFilter: (value: any, record: any) => {
        return record.auditTypeName === value;
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        // Create a set to store unique names
        const uniqueNames = new Set();

        // Iterate through allAuditPlanDetails and add unique names to the set
        allAuditPlanDetails?.forEach((item: any) => {
          const name = item.auditTypeName;
          uniqueNames.add(name);
        });

        // Convert the set back to an array for rendering
        const uniqueNamesArray = Array.from(uniqueNames);

        return (
          <div style={{ padding: 8 }}>
            {uniqueNamesArray.map((name: any) => (
              <div key={name}>
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedKeys([...selectedKeys, value]);
                      } else {
                        setSelectedKeys(
                          selectedKeys.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={name}
                    checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
                  />
                  {name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                onClick={() => {
                  confirm();
                  setFilteredValues(selectedKeys);
                }}
                style={{ marginRight: 8 }}
              >
                Filter
              </Button>
              {/* <Button onClick={() => {}}>Reset</Button>{" "} */}
              {/* Add a reset button */}
            </div>
          </div>
        );
      },
    },
    {
      title: "System Name",
      dataIndex: "systemName",

      onFilter: (value: any, record: any) => {
        const hasMatchingSystem = record?.system?.some(
          (sys: any) => sys.name === value
        );

        return hasMatchingSystem;
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: any) => {
        // Create a set to store unique system names
        const uniqueSystemNames = new Set();

        // Iterate through all records and add unique system names to the set
        allAuditPlanDetails?.forEach((item: any) => {
          item.systemMaster.forEach((sys: any) => {
            const name = sys.name;
            uniqueSystemNames.add(name);
          });
        });

        // Convert the set back to an array for rendering
        const uniqueSystemNamesArray = Array.from(uniqueSystemNames);

        return (
          <div style={{ padding: 8 }}>
            {uniqueSystemNamesArray.map((name: any) => (
              <div key={name}>
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedKeys([...selectedKeys, value]);
                      } else {
                        setSelectedKeys(
                          selectedKeys.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={name}
                    checked={selectedKeys.includes(name)} // Check if the checkbox should be checked
                  />
                  {name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                onClick={() => {
                  confirm();
                  setFilteredValues(selectedKeys);
                }}
                style={{ marginRight: 8 }}
              >
                Filter
              </Button>
              {/* <Button onClick={() => {}}>Reset</Button>{" "} */}
              {/* Add a reset button */}
            </div>
          </div>
        );
      },
    },

    // {
    //   title: "Responsibility",
    //   dataIndex: "roleId",
    // },
    {
      title: "Audit Scope",
      dataIndex: "entityTypeName",
    },
    {
      title: "Corp Func/Unit",
      dataIndex: "locationName",
    },

    // {
    //   title: "Action",
    //   key: "action",
    //   width: 200,
    //   render: (_: any, record: any) => (
    //     <>
    //       <IconButton
    //         onClick={() => {
    //           handleEditPlan(record);
    //         }}
    //         style={{ padding: "10px" }}
    //       >
    //         <CustomEditICon width={20} height={20} />
    //       </IconButton>
    //       <IconButton
    //         onClick={() => {
    //           handleEditSchedule(record);
    //         }}
    //         style={{ padding: "10px" }}
    //       >
    //         <ListAltIcon width={20} height={20} />
    //       </IconButton>
    //       <IconButton
    //         onClick={() => {
    //           handleOpen(record);
    //         }}
    //         style={{ padding: "10px" }}
    //       >
    //         <CustomDeleteICon width={20} height={20} />
    //       </IconButton>
    //     </>
    //   ),
    // },
  ];

  if (true) {
    columns.push({
      title: "Action",
      key: "action",
      width: 200,
      render: (_: any, record: any, index) => {
        if (index === 0) {
          return (
            <>
              {record.editAccess && (
                <Tooltip title={"Edit Audit Plan"}>
                  <IconButton
                    onClick={() => {
                      handleEditPlan(record);
                    }}
                    style={{ padding: "10px" }}
                  >
                    <div ref={refelemet5}>
                      <CustomEditICon width={20} height={20} />
                    </div>
                  </IconButton>
                </Tooltip>
              )}
              {record.whoCanSchedule && (
                <Tooltip title={"Create Audit Schedule"}>
                  <IconButton
                    onClick={() => {
                      handleEditSchedule(record);
                    }}
                    style={{ padding: "10px" }}
                  >
                    <div ref={refelemet6}>
                      <MdListAlt width={20} height={20} />
                    </div>
                  </IconButton>
                </Tooltip>
              )}
              {/* {
                <Tooltip title={"View Finalised Dates"}>
                  <IconButton
                    onClick={() => {
                      setAuditPeriodModal({
                        ...auditPeriodModaFl,
                        open: true,
                        data: record,
                      });
                    }}
                    style={{ padding: "10px" }}
                  >
                    <DateRangeIcon width={20} height={20} />
                  </IconButton>
                </Tooltip>
              } */}
              {record?.auditorCheck && (
                <Tooltip title={"View Finalised Dates"}>
                  <IconButton
                    onClick={() => {
                      setAuditPeriodModal({
                        ...auditPeriodModal,
                        open: true,
                        data: record,
                      });
                    }}
                    style={{ padding: "10px" }}
                  >
                    <MdDateRange width={20} height={20} />
                  </IconButton>
                </Tooltip>
              )}
              {isOrgAdmin && (
                <Tooltip title={"Delete Audit Plan"}>
                  <IconButton
                    onClick={() => {
                      handleOpen(record);
                    }}
                    style={{ padding: "10px" }}
                  >
                    <div ref={refelemet7}>
                      <CustomDeleteICon width={20} height={20} />
                    </div>
                  </IconButton>
                </Tooltip>
              )}
            </>
          );
        }
        return (
          <>
            {record.editAccess && (
              <Tooltip title={"Edit Audit Plan"}>
                <IconButton
                  onClick={() => {
                    handleEditPlan(record);
                  }}
                  style={{ padding: "10px" }}
                >
                  <div>
                    <CustomEditICon width={20} height={20} />
                  </div>
                </IconButton>
              </Tooltip>
            )}
            {record.whoCanSchedule && (
              <Tooltip title={"Create Audit Schedule"}>
                <IconButton
                  onClick={() => {
                    handleEditSchedule(record);
                  }}
                  style={{ padding: "10px" }}
                >
                  <div>
                    <MdListAlt width={20} height={20} />
                  </div>
                </IconButton>
              </Tooltip>
            )}
            {record?.auditorCheck && (
              <Tooltip title={"View Finalised Dates"}>
                <IconButton
                  onClick={() => {
                    setAuditPeriodModal({
                      ...auditPeriodModal,
                      open: true,
                      data: record,
                    });
                  }}
                  style={{ padding: "10px" }}
                >
                  <MdDateRange width={20} height={20} />
                </IconButton>
              </Tooltip>
            )}
            {/* <IconButton
                onClick={() => {
                  handleOpenScheduleCalendarMode(record);
                }}
                style={{ padding: "10px" }}
              >
                <ListAltIcon width={20} height={20} />
              </IconButton> */}
            {isOrgAdmin && (
              <Tooltip title={"Delete Audit Plan"}>
                <IconButton
                  onClick={() => {
                    handleOpen(record);
                  }}
                  style={{ padding: "10px" }}
                >
                  <div>
                    <CustomDeleteICon width={20} height={20} />
                  </div>
                </IconButton>
              </Tooltip>
            )}
          </>
        );
      },
    });
  }

  useEffect(() => {
    // setCurrentYear(currentyear);

    if (!!currentYear) {
      getAllAuditPlanDetails(currentYear);
    }
    fetchAuditType();
    getAllLocations();
    getLocationNames();
    getyear();
    getAuditType();
    // fetchSystem();
  }, []);

  // useEffect(() => {
  //   fetchSystem();
  // }, [selectedLocation, unitDisableData]);

  useEffect(() => {
    fetchSystemNew();
  }, [selectedLocation]);
  useEffect(() => {
    // if (
    //   // selectLocation !== undefined &&
    //   selectTableSystem !== undefined &&
    //   selectTableSystem?.length > 0 &&
    //   selectTableAuditType !== undefined
    // ) {
    if (
      !mode &&
      selectTableAuditType?.id !== undefined &&
      openAuditFinalize === false &&
      !!currentYear
    ) {
      getDataForDrops(currentStateNew);
    }
    canUserCreateAuditSchedule();
    canUserCreateAUditPlan();

    // } else {
    //   setDropData([]);
    //   setOptionData([]);
    // }
  }, [
    selectedLocation,
    selectTableSystem,
    selectTableAuditType,
    currentYear,
    openAudit,
    openAuditFinalize,
    // myAuditShow,
  ]);

  useEffect(() => {
    if (!isOrgAdmin) {
      setSelectedLocation({
        id: userDetails?.location?.id,
        locationName: userDetails?.location?.locationName,
      });
    }
  }, [locationNames]);

  useEffect(() => {
    if (!!currentYear && mode) {
      getAllAuditPlanDetails(currentYear);
      setAuditPlanYear(currentYear);
    }
    getCalendarData(searchValue, openAudit);
  }, [currentYear, selectTableAuditType, selectTableSystem]);

  const handleModalData = () => {
    setIsModalVisible(true);
  };

  const canUserCreateAuditSchedule = async () => {
    const isloggedUserCreate = await axios.get(
      `/api/auditPlan/isLoggedinUsercreateAuditScheduleByAuditTypeId/${selectTableAuditType?.id}`
    );
    setCreateSchedule(isloggedUserCreate?.data);
  };

  const canUserCreateAUditPlan = async () => {
    const isloggedUserCreate = await axios.get(
      `/api/auditPlan/isLoggedinUsercreateAuditPlanByAuditTypeId/${selectTableAuditType?.id}`
    );
    setCreate(isloggedUserCreate?.data);
  };

  const getDataForDrops = async (value = "Planned") => {
    setDropData([]);
    setAuditPlanIds([]);
    const systemParsed: any = selectTableSystem
      .map((value: any) => {
        return `system[]=${value.id}`;
      })
      .join("&");
    const res: any = await axios.get(
      `/api/auditPlan/getDetailsForDragAndDrop?location=${selectedLocation?.id}&${systemParsed}&year=${currentYear}&type=${selectTableAuditType?.id}&myAudit=${openAudit}&status=${value}&scope=${selectTableAuditType?.scope?.id}`
    );
    setDropData(res?.data?.data || []);
    setAuditPlanIds(res?.data?.id || []);
    const resOptionData: any = await axios.get(
      `/api/auditPlan/getOptionsForDragAndDrop/${selectTableAuditType?.id}?loc=${selectedLocation?.id}`
    );
    // let option1Ids = new Set(
    //   res?.data?.map((item: any) => item.entityId)
    // );
    // Filter option2 to remove items with ids that exist in option1
    // let filteredOption2 = resOptionData.data.filter(
    //   (item: any) => !option1Ids.has(item.id)
    // );
    const optionDatafiltered = resOptionData?.data?.filter(
      (value: any) => value.access === true
    );
    setOptionData(optionDatafiltered || []);
  };

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
    setAuditPlanYear(currentyear);
  };

  useEffect(() => {
    const val = allAuditPlanDetails.map((obj) => {
      const systemNames = obj?.systemMaster?.map((system: any) => system.name);
      return {
        id: obj.id,
        systemType: obj.systemTypeName,
        roleId: obj.roleId,
        entityTypeName: obj.entityTypeName,
        auditYear: obj.auditYear,
        auditName: obj.auditName,
        auditTypeName: obj.auditTypeName,
        systemName: <MultiUserDisplay name="name" data={obj?.systemMaster} />,
        locationName: obj.locationName,
        editAccess: obj.editAccess,
        system: obj.systemMaster,
        isDraft: obj?.isDraft,
        whoCanSchedule: obj.whoCanSchedule,
        auditorCheck: obj?.auditorCheck,
      };
    });
    setData(val);
  }, [allAuditPlanDetails]);

  const fetchAuditType = async () => {
    const res: any = await axios.get(`/api/auditPlan/getAllAuditType`);
    const data: any = res?.data?.map((value: any) => {
      return {
        id: value?._id,
        value: value?.auditType,
        scope: JSON.parse(value?.scope),
        planType: value?.planType,
        responsibility: value?.responsibility,
        system: value?.system,
      };
    });
    setSelectTableAuditType({ ...data[0] });
    setAuditTypeOptions([...data]);
  };

  // const fetchSystem = async () => {
  //   const res = await axios.get(
  //     `/api/auditPlan/getAllSystemsData/${
  //       !unitDisableData ? selectedLocation?.id : null
  //     }`
  //   );
  //   setSystemOptions(res?.data);
  // };

  const fetchSystemNew = async () => {
    const res = await axios.get(
      `/api/auditPlan/getAllSystemsData/${selectedLocation?.id}`
    );
    setSystemOptions(res?.data);
  };

  const handlePagination = async (
    pagein: any,
    pageSizein: any = rowsPerPage
  ) => {
    await setPage(pagein);
    await setRowsPerPage(pageSizein);

    const systemData = selectTableSystem
      ?.map((value: any) => {
        return `systemNew[]=${value?.id}`;
      })
      .join("&");
    // getAllAuditPlanDetails(currentYear);
    await axios(
      `/api/auditPlan/getAllAuditPlan/${currentYear}/${selectedLocation?.id}?page=${pagein}&limit=${pageSizein}&search=${searchQuery?.searchQuery}&myAudit=${myAuditShow}&secAuditType=${selectTableAuditType?.id}&${systemData}`
    )
      .then((res) => {
        setAllAuditPlanDetails(res.data.data);
        setCount(res.data.count);
        setIsLoading(false);
      })
      .catch((err) => {
        // console.error(err);
        setIsLoading(false);
      });
  };

  const getAllLocations = () => {
    getAllLocation(realmName).then((response: any) => {
      setLocationListing(parseLocation(response?.data));
    });
  };

  const getLocationNames = async () => {
    setIsLoading(true);
    try {
      setIsLoading(true);
      const res = await axios.get(
        `api/location/getLocationsForOrg/${realmName}`
      );

      setLocationNames(res.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const parseLocation = (data: any) => {
    let systemTypes: any = [];
    data?.map((item: any) => {
      systemTypes.push({
        name: item?.locationName,
        value: item?.id,
      });

      if (item.locationName === currentLocation) {
        setSearchValue((prev: any) => {
          return { ...prev, location: item.id };
        });
      }
    });
    return systemTypes;
  };

  const handleChangePageNew: any = (page: any, pageSize: any = rowsPerPage) => {
    setPage(page);
    setRowsPerPage(pageSize);
  };
  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setsearchQuery({
      ...searchQuery,
      [e.target.name]: e.target.value,
    });
  };
  // getAllAuditPlanDetails API
  const getAllAuditPlanDetails = async (year: any) => {
    setIsLoading(true);

    const systemData = selectTableSystem
      ?.map((value: any) => {
        return `systemNew[]=${value?.id}`;
      })
      .join("&");
    if (selectedLocation?.id) {
      await axios(
        `/api/auditPlan/getAllAuditPlan/${currentYear}/${selectedLocation?.id}?page=${page}&limit=${rowsPerPage}&myAudit=${myAuditShow}&secAuditType=${selectTableAuditType?.id}&${systemData}`
      )
        .then((res) => {
          setAllAuditPlanDetails(res.data.data);
          setCount(res.data.count);
          setIsLoading(false);
        })
        .catch((err) => {
          // console.error(err);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setAllAuditPlanDetails([]);
    }
  };

  const handleTableSearch = async () => {
    setPage(1);
    setRowsPerPage(10);

    const systemData = selectTableSystem
      ?.map((value: any) => {
        return `systemNew[]=${value?.id}`;
      })
      .join("&");
    await axios(
      `/api/auditPlan/getAllAuditPlan/${currentYear}/${
        selectedLocation?.id
      }?page=${1}&limit=${10}&search=${
        searchQuery?.searchQuery
      }&myAudit=${myAuditShow}&secAuditType=${
        selectTableAuditType?.id
      }&${systemData}`
    )
      .then((res) => {
        setAllAuditPlanDetails(res.data.data);
        setIsLoading(false);
      })
      .catch((err) => {
        // console.error(err);
        setIsLoading(false);
      });
  };

  const handleClickDiscard = async () => {
    setIsLoading(true);
    setsearchQuery({ searchQuery: "" });
    getAllAuditPlanDetails(currentYear);
    setIsLoading(false);
  };
  const openNewPlan = () => {
    navigate("/audit/auditplan/auditplanform");
  };

  const handleEditPlan = (data: any) => {
    navigate(`/audit/auditplan/auditplanform/${data.id}`);
  };

  const handleEditSchedule = (data: any) => {
    //set the schedule form type to planSchedule-create and navigate to the schedule form
    setScheduleFormType("planSchedule-create");
    navigate(`/audit/auditschedule/auditscheduleform/plan/${data.id}`);
  };

  const handleOpenScheduleCalendarMode = (data: any) => {
    navigate(`/audit`, {
      state: {
        openCalendar: true,
        auditPlanId: data.id,
        redirectToTab: "AUDIT SCHEDULE",
      },
    });
  };

  const handleDelete = async () => {
    setOpen(false);

    await axios
      .delete(`/api/auditPlan/deleteAuditPlanById/${deletePlan.id}`)
      .then(() =>
        enqueueSnackbar(`Operation Successfull`, { variant: "success" })
      )
      .catch((err) => {
        enqueueSnackbar(`Could not delete record`, {
          variant: "error",
        });
        // console.error(err);
      });
    getAllAuditPlanDetails(currentYear);
  };

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeletePlan(val);
  };

  const handleChangeList = (event: any, values: any) => {
    setPage(1);
    setViewerMode(false);

    setRowsPerPage(10);
    setSelectedLocation(values);
    setSelectedUnit(!!values);
  };

  useEffect(() => {
    getAllAuditPlanDetails(currentYear);
  }, [selectedLocation]);

  // useEffect(() => {
  //   getDataForDrops();
  // }, [currentStateNew]);

  const formatDate = (date: any) => {
    const d = new Date(date);
    let day: any = d.getDate();
    let month: any = d.getMonth() + 1; // Months are zero-indexed
    const year = d.getFullYear();

    // Add leading zero if day or month is less than 10
    if (day < 10) {
      day = "0" + day;
    }
    if (month < 10) {
      month = "0" + month;
    }

    return `${day}-${month}-${year}`;
  };

  const getAllAuditScheduleDetails = async () => {
    setIsLoading(true);
    const encodedLocation = encodeURIComponent(
      JSON.stringify(selectedLocation)
    );
    await axios(
      `api/auditSchedule/getAllAuditschedule/${encodedLocation}/${currentYear}`
    )
      .then((res) => {
        // setAllAuditScheduleDetails(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        // console.error(err);
        setIsLoading(false);
      });
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `/api/auditSchedule/deleteAuditScheduleById/${selectedTaskId}`
      );
      enqueueSnackbar("Successfully deleted audit schedule entity data.", {
        variant: "success",
      });
      setIsDeleteModalOpen(false);
      setSelectedTaskId("");
      getDataForDrops(currentStateNew);
    } catch (error) {
      enqueueSnackbar("Something went wrong.", { variant: "error" });
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedTaskId("");
    }
  };

  const handleFinalizeMode = async (data: any) => {
    const res = await axios.get(
      `/api/auditPlan/getAuditPlanSingle/${data?.auditPlanId}`
    );

    const finalData = {
      rowId: data?.auditPlanEntityWiseId,
      auditPlanId: data?.auditPlanId,
      unitId: data?.unitData === "Unit" ? data.id : selectedLocation.id,
      rowMonths: data?.months,
      unitName:
        data?.unitData === "Unit" ? data.name : selectedLocation?.locationName,
      format: data?.format,
      ...data,
    };
    const dataFor = {
      auditName: res.data.auditName,
      year: res.data.auditYear,
      status: res.data.status,
      isDraft: res.data.isDraft,
      location: {
        id: res.data.locationId,
        locationName: res.data.location,
      },
      checkOn: false,
      locationId: res.data.locationId,
      createdBy: res.data.createdBy,
      auditTypeName: res.data.auditTypeName,
      // createdOn: convertDate(res.data.createdAt),
      auditType: res.data.auditType,
      planType: res.data.planType,
      // lastModified: convertDate(res.data.updatedAt),
      systemType: res.data.systemTypeId,
      systemName:
        res.data.locationId === ""
          ? res.data.systemMaster
          : res.data.systemMaster.map((value: any) => value._id),
      prefixSuffix: res.data.prefixSuffix,
      scope: {
        id: res.data.entityTypeId,
        name: res.data.entityType,
      },
      // scope: res.data,
      // role: res.data,
      auditPlanId: res.data.id,
      role: res.data.roleId,
      auditorCheck: res.data.auditorCheck,
      comments: res.data.comments,
      AuditPlanEntitywise: res.data.auditPlanEntityWise.map((obj: any) => ({
        id: obj.id,
        entityId: obj.entityId,
        name: obj.entityName,
        months: obj.auditSchedule,
        auditors: obj.auditors,
        auditPlanId: obj.auditPlanId,
        deleted: obj.deleted,
      })),
    };
    navigate(`/audit/auditplan/auditplanform/${data?.auditPlanId}`, {
      state: { ...finalData, fromAuditPlanView: true, auditPlanData: dataFor },
    });
  };
  const initialBoard = Array.from({ length: 12 }, (_, index) => {
    // const monthName =new Date(0, monthIndex - 1).toLocaleString("en-US", {
    //   month: "long",
    // });
    const monthName =
      userDetails.organization.fiscalYearQuarters === "April - Mar"
        ? [
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
            "January",
            "February",
            "March",
          ]
        : [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
    const data: any = {
      id: `column-${monthName[index]}`,
      title: monthName[index],
      taskIds: dropData
        ?.map((value: any) => {
          if (value?.auditschedule?.includes(monthName[index])) {
            if (
              (currentStateNew === "Planned" || currentStateNew === "All") &&
              value?.type === "Planned"
            ) {
              const findData = value?.auditUnitReport?.find(
                (item: any) => item?.monthName === monthName[index]
              );
              const entityData = findData?.auditScheduleEntityWiseDataNew?.map(
                (item: any) => {
                  return {
                    id: item?.entityId,
                    editAccess: value?.editAccess,
                    auditPlanId: value?.auditPlanId,
                    auditorCheck: value?.auditorCheck,
                    systems: value?.systems,
                    scheduleAccess: value?.scheduleAccess,
                    unitData: value?.unitData,
                    months: value?.months,
                    auditPlanData: value?.auditPlanData,
                    format: value?.format,
                    unitId: value?.unitId,
                    createdBy: value?.createdBy,
                    isAuditReportCreated: item?.auditReportCreated,
                    type: findData?.type,
                    createdAt: value?.createdAt,
                    auditTypeName: value?.auditTypeName,
                    scheduleId: item?.auditScheduleDataId,
                    auditPlanUnitData: value?.auditPlanUnitData?.filter(
                      (item: any) => item?.auditPeriod == monthName[index]
                    ),
                    // auditReportFind
                    auditorReportId: findData?.auditReportFind,
                    isUserAbleToCreateReport:
                      findData?.isUserAbleToCreateReport,
                    auditeeId: item?.auditee?.map(
                      (auditeeDatas: any) => auditeeDatas?.id
                    ),
                    auditorId: item?.auditor?.map(
                      (auditorDatas: any) => auditorDatas?.id
                    ),
                    auditee: item?.auditee,
                    auditor: item?.auditor,
                    time: formatDate(item?.time) || "",
                    auditPlanEntityWiseId: value?.auditPlanEntityWiseId,
                    createdMonth: value?.createdMonth,
                    isScheduleCreated: true,
                    scheduleEntityId: item?._id || "",
                    name: item?.entityName || "",
                    title: item?.entityName || "", // Placeholder, replace with actual data
                  };
                }
              );
              // value?.unitChecker
              return {
                id: value.entityId,
                editAccess: value?.editAccess,
                auditPlanId: value?.auditPlanId,
                auditorCheck: value?.auditorCheck,
                systems: value?.systems,
                scheduleAccess: value?.scheduleAccess,
                unitData: value?.unitData,
                months: value?.months,
                auditPlanData: value?.auditPlanData,
                format: value?.format,
                unitId: value?.unitId,
                createdBy: value?.createdBy,
                isAuditReportCreated: findData?.auditReportCreated,
                type: findData?.type,
                entityData,
                createdAt: value?.createdAt,
                auditTypeName: value?.auditTypeName,
                scheduleId: findData?.auditScheduleDataId,
                auditTemplates: value?.auditTemplates,

                auditPlanUnitData: value?.auditPlanUnitData?.filter(
                  (item: any) => item?.auditPeriod == monthName[index]
                ),
                // auditReportFind
                auditorReportId: findData?.auditReportFind,
                isUserAbleToCreateReport: findData?.isUserAbleToCreateReport,
                auditeeId: findData?.auditee?.map(
                  (auditeeDatas: any) => auditeeDatas?.id
                ),
                auditorId: findData?.auditor?.map(
                  (auditorDatas: any) => auditorDatas?.id
                ),
                auditee: findData?.auditee
                  ?.map((auditeeData: any) => {
                    return auditeeData?.username;
                  })
                  .join(","),
                auditor: findData?.auditor
                  ?.map((auditorData: any) => {
                    return auditorData?.username;
                  })
                  .join(","),
                time: formatDate(findData?.time) || "",
                auditPlanEntityWiseId: value?.auditPlanEntityWiseId,
                createdMonth: value?.createdMonth,
                auditScheduleEntityId: value?._id,

                isScheduleCreated:
                  value?.createdMonth?.includes(monthName[index]) &&
                  findData?.scheduleCreated,
                name: value?.name || "",
                title: value?.name || "", // Placeholder, replace with actual data
              };
            }
            if (currentStateNew !== "Planned") {
              return {
                id: value.entityId,
                editAccess: false,
                auditPlanId: value?.auditPlanId,
                auditorCheck: value?.auditorCheck,
                systems: value?.systems,
                scheduleAccessEdit: value?.scheduleAccess,
                scheduleAccess: false,
                auditTypeName: value?.auditTypeData?.auditType,
                unitData: value?.unitData,
                months: value?.auditschedule,
                auditPlanData: value?.auditPlanData,
                format: value?.format,
                auditTemplates: value?.auditTemplates,

                auditScheduleEntityId: value?._id,
                unitId: value?.unitId,
                createdBy: value?.createdBy,
                isAuditReportCreated:
                  value?.lable === "Completed" ? true : false,
                type: "dept",
                entityData,
                createdAt: value?.createdAt,
                // auditTypeName: value?.auditTypeName,
                scheduleId: value?.auditScheduleId,

                auditPlanUnitData: value?.auditPlanUnitData?.filter(
                  (item: any) => item?.auditPeriod == monthName[index]
                ),
                // auditReportFind
                auditorReportId: value?.auditReportId,
                isUserAbleToCreateReport: value?.auditor?.includes(
                  userDetails?.id
                ),
                auditeeId: value?.auditee,
                auditorId: value?.auditor,
                auditee: value?.auditeeData,
                auditor: value?.auditorData,
                time: formatDate(value?.time) || "",
                scheduleTime: value?.time,
                auditPlanEntityWiseId: value?.auditPlanEntityWiseId,
                createdMonth: value?.createdMonth,
                isScheduleCreated: true,
                name: value?.name || "",
                title: value?.name || "", // Placeholder, replace with actual data
              };
            }
          }
          return null;
        })
        .filter((item: any) => {
          if (openAudit == false) {
            if (currentStateNew === "Scheduled") {
              if (
                item?.isScheduleCreated === true &&
                item?.isAuditReportCreated === false
              ) {
                return item;
              }
            } else if (currentStateNew === "Completed") {
              if (
                item?.isScheduleCreated === true &&
                item?.isAuditReportCreated === true
              ) {
                return item;
              }
            } else if (currentStateNew === "Planned") {
              if (
                item?.isScheduleCreated === false &&
                item?.isAuditReportCreated === false &&
                currentStateNew === "Planned"
                // && item?.type !=="unit"
              ) {
                return item;
              } else if (currentStateNew !== "Planned") {
                return item;
              }
            } else {
              return item;
            }
          } else {
            if (
              item?.auditeeId?.includes(userDetails?.id) ||
              item?.auditorId?.includes(userDetails?.id)
            ) {
              return item;
            }
          }
        })
        .filter((task: any) => task !== null),
    };
    return data;
  });
  const currentMonth = dayjs().format("MMMM"); // Get the current month as a string (e.g., "September")
  const currentMonthIndex = initialBoard.findIndex(
    (column: any) => column.title === currentMonth
  );

  const [activeIndex, setActiveIndex] = useState(currentMonthIndex);
  const onDragEnd: OnDragEndResponder = (result: any, provided: any) => {
    const { source, destination } = result;

    // Check if the destination is not null
    if (!destination) return;

    // If the task was dropped in the same column
    if (source.droppableId === destination.droppableId) {
      const column = initialBoard.find((col) => col.id === source.droppableId);
      if (!column) return;

      // Create a new array of taskIds for the column
      const newTaskIds = Array.from(column.taskIds);
      // Remove the taskId from its previous position
      const [removed] = newTaskIds.splice(source.index, 1);
      // Insert the taskId into its new position
      newTaskIds.splice(destination.index, 0, removed);

      // Update the column's taskIds with the new array
      column.taskIds = newTaskIds;

      // Return the updated columns
      return { columns: [...initialBoard] };
    }

    // If the task was dropped in a different column
    const sourceColumn = initialBoard.find(
      (col) => col.id === source.droppableId
    );
    const destinationColumn = initialBoard.find(
      (col) => col.id === destination.droppableId
    );

    if (!sourceColumn || !destinationColumn) return;

    // Create new arrays of taskIds for the source and destination columns
    const newSourceTaskIds = Array.from(sourceColumn.taskIds);
    const newDestinationTaskIds = Array.from(destinationColumn.taskIds);

    // Remove the taskId from the source column
    const [removed] = newSourceTaskIds.splice(source.index, 1);
    // Insert the taskId into the destination column
    newDestinationTaskIds.splice(destination.index, 0, removed);

    // Update the taskIds for the source and destination columns
    sourceColumn.taskIds = newSourceTaskIds;
    destinationColumn.taskIds = newDestinationTaskIds;

    // Return the updated columns
    return { columns: [...initialBoard] };
  };

  const onSlideChanged = (e: any) => {
    setActiveIndex(e.item); // Update the current index when the carousel changes
  };
  const handleCreateDropData = async (
    index: any,
    taskData: any,
    status: Boolean
  ) => {
    const monthNames =
      userDetails.organization.fiscalYearQuarters === "April - Mar"
        ? [
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
            "January",
            "February",
            "March",
          ]
        : [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
    if (status === true) {
      const auditPlanId: any = dropData.find(
        (value: any) => value.entityId === selectAdd[0].id
      );
      let data;

      if (auditPlanId?.auditPlanId === undefined) {
        data = {
          index: monthNames[index],
          auditPlanentityId: selectAdd?.map((value: any) => value?.id),
          auditPlanId: auditPlanId?.auditPlanId,
          location: selectedLocation?.id,
          currentYear,
          auditType: selectTableAuditType,
          system: selectTableSystem,
        };
      } else {
        data = {
          index: monthNames[index],
          auditPlanentityId: selectAdd?.map((value: any) => value?.id),
          auditPlanId: auditPlanId.auditPlanId,
        };
      }

      const updateData = await axios.patch(
        `/api/auditPlan/updateDataofDropDown/${
          auditPlanId?.auditPlanId === undefined ? "create" : status
        }`,
        data
      );
    } else {
      const auditPlanId: any = taskData.auditPlanId;
      const data = {
        index: monthNames[index],
        auditPlanentityId: taskData.id,
        auditPlanId: auditPlanId,
      };

      const updateData = await axios.patch(
        `/api/auditPlan/updateDataofDropDown/${status}`,
        data
      );
    }

    getDataForDrops(currentStateNew);
    setSelectAdd([]);
  };
  const addEntityOptions = async (task: any) => {
    // try {
    setSelectedEntityData(task?.name || "");
    // console.log("task data", task);
    const systemData = task?.auditPlanData?.systemMasterId
      .map((value: any) => {
        return `&system[]=${value}`;
      })
      .join("");
    // setAuditTypeSystem(task?.auditPlanData?.systemMasterId);
    if (
      selectTableAuditType?.id !== undefined &&
      selectedLocation?.id !== undefined
    ) {
      const auditorDataNew: any = await axios.get(
        `/api/auditSchedule/getAuditors?auditType=${selectTableAuditType?.id}&location=${selectedLocation?.id}${systemData}&dept=${task.id}`
      );
      const auditeeData: any = await axios.get(
        `/api/auditSchedule/getAuditeeByDepartment/${userDetails?.organizationId}/${task.id}`
      );

      const entityHead: any = auditeeData?.data?.entityHead?.map(
        (value: any) => {
          return { id: value.id, label: value?.email };
        }
      );
      const parsedAuditeeData: any = auditeeData?.data?.users?.map(
        (value: any) => {
          return {
            id: value?.id,
            label: `${value?.firstname} ${value?.lastname}`,
          };
        }
      );
      const parsedAuditorData = auditorDataNew?.data?.map((value: any) => {
        return {
          id: value.id,
          label: `${value?.firstname} ${value?.lastname}`,
          avatarUrl: value.avatar,
        };
      });
      setAuditorData(parsedAuditorData);
      const entityHeadIds = auditeeData?.data?.entityHead?.map(
        (value: any) => value?.id
      );
      const resData: any = await axios(
        `/api/auditSchedule/auditScheduleTemplate`
      ); // templates API here
      // .then((res) => {

      const data1 = resData?.data?.map((obj: any) => ({
        id: obj?._id,
        label: obj?.title,
      }));
      if (data1.length > 0) {
        setTemplate(data1);
      }
      // });
      const data = entityHeadIds?.length > 0 ? entityHeadIds : [];
      const parsedAuditeeeData =
        parsedAuditeeData?.length > 0 ? parsedAuditeeData : [];
      const entityHeads = entityHead?.length > 0 ? entityHead : [];
      setEntityData({ ...entityData, auditee: [...data] });

      let auditeeDataAll = [...parsedAuditeeeData, ...entityHeads];
      let auditorId = auditorData.map((value: any) => value.id);
      auditeeDataAll = auditeeDataAll.filter(
        (item) => !auditorId.includes(item.id)
      );
      setAuditeedata(auditeeDataAll);
    }
    // } catch (err) {}
  };
  //console.log("id planId", planId);
  const handleScheduleData = async (status = false) => {
    try {
      const updateData = {
        entityId: task.id,
        location: selectedLocation?.id,
        year: currentYear,
        system: task?.auditPlanData?.systemMasterId || [],
        auditor: entityData?.auditor || [],
        auditee: entityData?.auditee || [],
        auditPlanId: task?.auditPlanId,
        date: entityData?.time,
        status: status,
        checklist: entityData?.template,
        monthName: task?.monthName,
        auditType: selectTableAuditType?.id,
      };

      if (
        updateData?.date !== undefined &&
        updateData?.auditor.length > 0 &&
        updateData?.auditee.length > 0 &&
        updateData?.location !== undefined
      ) {
        await axios.patch(`/api/auditSchedule/dropAndAuditPlan`, updateData);

        enqueueSnackbar("Audit schedule updated successfully!", {
          variant: "success",
        });

        setIsEntityModal(false);
        setEntityData({});
        getDataForDrops(currentStateNew);
      } else {
        enqueueSnackbar("Please select all required fields before saving.", {
          variant: "warning",
        });
      }
    } catch (err: any) {
      console.log("Error during schedule update:", err);

      let errMsg = "Failed to update audit schedule.";
      if (err?.response?.data?.error) {
        errMsg = err.response.data.error;
      } else if (err?.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err?.message) {
        errMsg = err.message;
      }

      if (errMsg.includes("Auditor/Auditee conflict")) {
        setErrModal(true); // Open the modal
        setErrMessage(errMsg);
      } else {
        enqueueSnackbar(errMsg, { variant: "error" });
      }
    }
  };

  const responsive = {
    0: { items: 1 },
    600: { items: 2 },
    1024: { items: 4 },
  };

  const refreshCalendarData = () => {
    getCalendarData(searchValue);
  };

  const convertDate = (date: string) => {
    const d = new Date(date);

    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const currentDate = moment();
  const initialiseEntities = async () => {
    try {
      let endpoint = "";
      let mapData = (data: any) => [];

      if (selectTableAuditType.useFunctionsForPlanning === true) {
        // Fetch function-based data

        endpoint = `/api/auditPlan/getFunction/${selectTableAuditType.scope.id}`;
        mapData = (data) =>
          data.map((obj: any) => ({
            entityId: obj.id,
            name: obj.name,
            months:
              selectTableAuditType.planType === "Month"
                ? new Array(12).fill(false)
                : [currentDate],
            auditors: [],
          }));
      } else if (
        selectTableAuditType.scope.name === "Unit" ||
        selectTableAuditType.scope.name === "Corporate Function"
      ) {
        // Fetch location-based data for Unit or Corporate Function
        const scopeType =
          selectTableAuditType.scope.name === "Unit" ? "Unit" : "Function";
        endpoint = `/api/auditPlan/getLocationForAuditPlan/${scopeType}`;
        mapData = (data) =>
          data.map((obj: any) => ({
            entityId: obj.id,
            name: obj.locationName,
            months:
              selectTableAuditType.planType === "Month"
                ? new Array(12).fill(false)
                : [currentDate],
            auditors: [],
          }));
      } else {
        // Fetch other entities
        endpoint = `/api/auditPlan/getEntity/${selectedLocation?.id}/${selectTableAuditType.scope.id}`;
        mapData = (data) =>
          data.map((obj: any) => ({
            entityId: obj.id,
            name: obj.entityName,
            months:
              selectTableAuditType.planType === "Month"
                ? new Array(12).fill(false)
                : [],
            auditors: [],
          }));
      }
      // Fetch data and update state
      const response = await axios(endpoint);
      setAuditPlanDataNew((prev) => ({
        ...prev,
        AuditPlanEntitywise: mapData(response.data),
      }));
    } catch (error) {
      // console.error("Error fetching audit plan data:", error);
    }
  };

  const getAuditPlanDetailsById = async () => {
    // console.log("hello world", auditPlanData);
    // const auditPlanId = "66e1165abbf6b29a075c0f5d";
    // const auditPlanIdData = dropData
    //   .map((item: any) => item?.auditPlanId)
    //   .filter((value: any) => value !== undefined);

    const readAccess = optionData
      .map((item: any) => item.access)
      .filter((value: any) => value !== undefined);

    setIsReadOnly(readAccess?.includes(true) ? true : false);

    setAuditPlanId(auditPlanIds[0]);
    if (!auditPlanIds[0]) {
      const isloggedUserCreate = await axios.get(
        `/api/auditPlan/isLoggedinUsercreateAuditPlanByAuditTypeId/${selectTableAuditType?.id}`
      );
      setCreate(isloggedUserCreate?.data);
      if (isloggedUserCreate?.data == false) {
        enqueueSnackbar(`You Cannot create For This Audit Type`, {
          variant: "error",
        });
        return;
      } else {
        initialiseEntities();
      }
    } else {
      setEditMode(true);
      await axios(`/api/auditPlan/getAuditPlanSingle/${auditPlanIds[0]}`)
        .then((res: any) => {
          setScope(res.data.entityType);
          const data = res.data.auditPlanEntityWise
            .filter((obj: any) => obj.deleted)
            .map((obj: any) => ({
              id: obj.id,
              entityId: obj.entityId,
              name: obj.entityName,
              months: obj.auditSchedule,
              deleted: obj.deleted,
            }));
          setRemovedList(data);
          setAuditPlanDataNew({
            auditName: res.data.auditName,
            year: res.data.auditYear,
            status: res.data.status,
            isDraft: res.data.isDraft,
            location: {
              id: res.data.locationId,
              locationName: res.data.location,
            },
            checkOn: false,
            locationId: res.data.locationId,
            createdBy: res.data.createdBy,
            auditTypeName: res.data.auditTypeName,
            createdOn: convertDate(res.data.createdAt),
            auditType: res.data.auditType,
            planType: res.data.planType,
            lastModified: convertDate(res.data.updatedAt),
            systemType: res.data.systemTypeId,
            systemName:
              res.data.locationId === ""
                ? res.data.systemMaster
                : res.data.systemMaster.map((value: any) => value._id),
            prefixSuffix: res.data.prefixSuffix,
            scope: {
              id: res.data.entityTypeId,
              name: res.data.entityType,
            },
            // scope: res.data,
            // role: res.data,
            auditPlanId: res.data.id,
            role: res.data.roleId,
            useFunctionsForPlanning: res?.data?.useFunctionsForPlanning,
            auditorCheck: res.data.auditorCheck,
            comments: res.data.comments,
            AuditPlanEntitywise: res.data.auditPlanEntityWise.map(
              (obj: any) => ({
                id: obj.id,
                entityId: obj.entityId,
                name: obj.entityName,
                months: obj.auditSchedule,
                auditors: obj.auditors,
                auditPlanId: obj.auditPlanId,
                deleted: obj.deleted,
              })
            ),
          });
        })
        .catch((err) => {});
    }
  };

  const handleUpdate = async (status = true) => {
    if (status === false) {
      const test = [];

      for (let value of auditPlanDataNew?.AuditPlanEntitywise) {
        if (value.months.includes(true) === true) {
          test.push(true);
        }
      }

      if (test?.length === 0) {
        enqueueSnackbar(`Select Month`, {
          variant: "error",
        });
        return;
      }
    }
    try {
      setIsLoading(true);

      const systems = auditPlanDataNew?.systemName?.map(
        (item: any) => item.id || item._id
      );
      const temp = {
        auditName: auditPlanDataNew.auditName,
        auditYear: auditPlanDataNew.year,
        status: auditPlanDataNew.status,
        publishedOnDate: auditPlanDataNew.createdOn,
        systemTypeId: auditPlanDataNew.systemType,
        entityTypeId: auditPlanDataNew.scope.id,
        comments: auditPlanDataNew.comments,
        auditType: auditPlanDataNew.auditType,
        isDraft: status,
        location: isOrgAdmin
          ? auditPlanDataNew.locationId
          : auditPlanDataNew.location.id,
        systemMasterId:
          auditPlanDataNew?.location?.id === "" ||
          auditPlanDataNew?.locationId === ""
            ? systems
            : auditPlanDataNew.systemName,
        scope: auditPlanDataNew.scope,
        auditorCheck: auditPlanDataNew.auditorCheck,
        // auditors: auditPlanDataNew.auditors,
        role: auditPlanDataNew.role,
        roleId: auditPlanDataNew.role,
        AuditPlanEntitywise: auditPlanDataNew.AuditPlanEntitywise.map(
          (obj: any) => ({
            id: obj.id,
            entityId: obj.entityId,
            months: obj.months,
            auditors: obj.auditors,
          })
        ),
      };
      setDisabledButton(true);
      const res = await axios.put(
        `/api/auditPlan/updateAuditPlan/${auditPlanId}`,
        temp
      );
      if (status !== true) {
        setDisabledButton(false);

        if (res.status === 201 || res.status === 200) {
          try {
            const mail = await axios.post(
              `/api/auditPlan/sendMailForHead/${auditPlanId}`
            );
          } catch (error) {}
        }
      }
      setDisabledButton(false);
      setIsLoading(false);
      enqueueSnackbar(`successfully updated`, {
        variant: "success",
      });
      getDataForDrops(currentStateNew);
      setViewerMode(!viewerMode);
    } catch (err) {
      setDisabledButton(false);

      setIsLoading(false);
      enqueueSnackbar(`Error Occured while creating audit plan`, {
        variant: "error",
      });
    }
  };

  const handleCreate = async () => {
    try {
      const temp = {
        auditName: `${selectTableAuditType.value}-${auditYear}`,
        auditYear: auditYear,
        status: "active",
        isDraft: true,
        publishedOnDate: new Date(),
        createdBy: userDetails.username,
        updatedBy: userDetails.username,
        entityTypeId: selectTableAuditType.scope.id,
        comments: "",
        // location: data.hasOwnProperty('location') ? data.location : '',
        location: userDetails?.locationId,
        auditType: selectTableAuditType.id,
        organizationId: userDetails.organizationId,
        systemMasterId: selectTableAuditType.system || [],
        roleId: selectTableAuditType?.responsibility,
        // location: isOrgAdmin
        //   ? auditPlanDataNew.location
        //   : auditPlanDataNew.location.id,

        scope: selectTableAuditType.scope,
        // auditorCheck: auditPlanDataNew.auditorCheck,
        AuditPlanEntitywise: auditPlanDataNew.AuditPlanEntitywise.map(
          (obj: any) => ({
            entityId: obj.entityId,
            months: obj.months,
            auditors: obj.auditors,
            deleted: obj.deleted,
            // deleted :true,
          })
        ),
        // Use the transformedValue here
      };
      setDisabledButton(true);

      const res = await axios.post(`/api/auditPlan/createAuditPlan`, temp);
      setIsLoading(false);
      if (res.status === 200 || res.status === 201) {
        setDisabledButton(false);

        enqueueSnackbar(`successfully created`, {
          variant: "success",
        });

        getDataForDrops(currentStateNew);
        setViewerMode(!viewerMode);

        // if (!auditPlanData.auditorCheck) {
        // } else {
        // setFinalisedAuditorTourOpen(true);
        // }
      }
      setDisabledButton(false);
    } catch (err) {
      setDisabledButton(false);
    }
  };
  const closeOverlay = () => {
    setIsOpen(false);
  };
  const validateEntityData = (data: any) => {
    const errors = [];

    if (!data.title || typeof data.title !== "string") {
      errors.push("Invalid or missing 'title'");
    }

    if (
      !Array.isArray(data.auditee) ||
      !data.auditee?.every((id: any) => typeof id === "string")
    ) {
      errors.push("Invalid or missing 'auditee' (should be array of strings)");
    }

    if (
      !Array.isArray(data.auditor) ||
      !data.auditor.every((id: any) => typeof id === "string")
    ) {
      errors.push("Invalid or missing 'auditor' (should be array of strings)");
    }

    if (!data.time || isNaN(Date.parse(data.time))) {
      errors.push("Invalid or missing 'time'");
    }

    if (
      !Array.isArray(data.template) ||
      !data.template.every((id: any) => typeof id === "string")
    ) {
      errors.push("Invalid or missing 'template' (should be array of strings)");
    }

    if (data.auditee.length === 0) {
      errors.push("Auditee cannot be empty");
    }

    if (data.auditor.length === 0) {
      errors.push("Auditor cannot be empty");
    }

    const common = data.auditee.filter((id: any) => data.auditor.includes(id));
    if (common.length > 0) {
      errors.push("Auditee and Auditor cannot have overlapping users.");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };
  const updateEntityData = async (status = false) => {
    const isValid = validateEntityData(editEntityData);

    if (!isValid.valid) {
      enqueueSnackbar(`Validation failed: ${isValid.errors.join(", ")}`, {
        variant: "error",
      });
      return;
    }
    try {
      const res = await axios.put(
        `/api/auditSchedule/updateAuditScheduleEntityData/${editEntityData.id}`,
        {
          auditee: editEntityData.auditee,
          auditor: editEntityData.auditor,
          time: editEntityData.time,
          status,
          auditTemplates: editEntityData?.template,
          comments: editEntityData?.comment,
        }
      );
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar("Successfully Updates", { variant: "success" });
        setEditEntityData({});
        setEditEntityModal(false);
        getDataForDrops(currentStateNew);
      }
    } catch (err: any) {
      let errMsg = "Failed to update audit schedule.";
      if (err?.response?.data?.error) {
        errMsg = err.response.data.error;
      } else if (err?.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err?.message) {
        errMsg = err.message;
      }

      if (errMsg.includes("Auditor/Auditee conflict")) {
        setEditErrMessage(errMsg); // <== set the dynamic error text
        setEditErrModal(true); // open modal
      } else {
        enqueueSnackbar(errMsg, { variant: "error" });
      }
    }
  };
  const items = initialBoard.map((column: any, columnIndex) => (
    <Paper
      elevation={0}
      className={classes.column}
      key={column.id}
      // onMouseEnter={() => setHoveredColumn(column.id)}
      // onMouseLeave={() => setHoveredColumn(null)}
    >
      <div
      //  style={{ position: "fixed" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "fit-content",
            padding: "0px 20px",
          }}
        >
          <div>
            <Typography variant="h4" className={classes.columnName}>
              {column.title}
            </Typography>
          </div>
          <div style={{ display: "flex" }}>
            {/* <div>
              {

                selectTableAuditType !== undefined &&
                  (column?.taskIds
                    .map((item: any) => item.id)
                    .includes(userDetails.locationId) ||
                    isOrgAdmin) &&
                  column?.taskIds.length > 0 && (
                    <Tooltip title="Create Audit Schedule">
                      <IconButton
                        onClick={() => {
                          setPlanId(column?.taskIds[0]?.auditPlanId || "");
                          setScheduleFormType("planSchedule-create");
                          handleModalData();
                        }}
                        style={{
                          color: "black",
                          padding: "0px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          ref={refelemet6}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ListAltIcon width={20} height={20} />
                        </div>
                      </IconButton>
                    </Tooltip>
                  )
              }
            </div> */}
            <div>
              {optionData
                ?.map((value: any) => value?.access)
                .every((item: any) => item === true) &&
                currentStateNew === "Planned" &&
                create && (
                  <Tooltip title="Add to Plan">
                    <IconButton
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "0px",
                      }}
                      onClick={() => setHoveredColumn(column.id)}
                    >
                      <MdOutlineAddBox
                        style={{ cursor: "pointer", color: "black" }}
                      />
                    </IconButton>
                  </Tooltip>
                )}
            </div>
          </div>
        </div>

        <hr
          style={{
            height: "3px",
            backgroundColor: "black",
            margin: "8px 20px 15px 20px",
          }}
        />
      </div>

      <div
        style={{ display: "flex", padding: "0px 5px", alignItems: "center" }}
      >
        {hoveredColumn === column.id && (
          <>
            {
              // column.taskIds
              //   .map((value: any) => value.editAccess)
              //   .every((value: any) => value === true) && (
              <Autocomplete
                limitTags={2}
                id="location-autocomplete"
                className={classes.inputRootOverride}
                multiple={true}
                options={optionData}
                getOptionLabel={(option) => option.name || ""}
                getOptionSelected={(option, value) => option.id === value.id}
                value={selectAdd}
                onChange={(e, value) => setSelectAdd(value)}
                style={{ width: "215px", padding: "10px" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    label="Add"
                    fullWidth
                    style={{ backgroundColor: "white" }}
                  />
                )}
              />
              // )
            }
            {selectAdd?.length > 0 && (
              <IconButton
                onClick={() => {
                  handleCreateDropData(columnIndex, {}, true);
                  setHoveredColumn(null);
                }}
                style={{
                  backgroundColor: "#F2F2F2",
                  padding: "4px", // Decrease padding
                  marginLeft: "5px",
                }}
                size="small" // Make IconButton itself smaller
              >
                <MdOutlineCheckCircle size={20} /> {/* Reduce icon size */}
              </IconButton>
            )}{" "}
            <IconButton
              onClick={() => {
                setHoveredColumn(null);
              }}
              style={{
                padding: "4px", // Decrease padding
                marginLeft: "5px",
              }}
              size="small"
            >
              <MdOutlineCancel
                size={20}
                style={{
                  color: "grey",
                  cursor: "pointer",
                }}
              />
            </IconButton>
          </>
        )}
      </div>

      <Droppable droppableId={column.id}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {column.taskIds.map((task: any, taskIndex: any) => (
              <Draggable draggableId={task.id} index={taskIndex} key={task.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={classes.taskContainer}
                  >
                    <div
                      className={classes.header}
                      style={{
                        backgroundColor: `${
                          task.isAuditReportCreated && task.isScheduleCreated
                            ? "#d98cb3"
                            : task.isScheduleCreated
                            ? "#8cd9b3"
                            : "#9fbfdf"
                        }`,
                        color: "black",
                        padding: "3px 7px",
                        borderRadius: "3px",
                      }}
                    >
                      {/* <Divider type="vertical" />{" "}
                      <Divider
                        type="vertical"
                        style={{
                          height: "60px",
                          width: "3px",
                          backgroundColor: `${
                            task.isScheduleCreated ? "green" : "yellow"
                          }`,
                        }}
                      /> */}
                      <Typography
                        variant="h6"
                        className={classes.title}
                        style={{ fontWeight: 600 }}
                      >
                        {task.isAuditReportCreated && task.isScheduleCreated
                          ? "Completed"
                          : task.isScheduleCreated
                          ? "Scheduled"
                          : "Planned"}
                      </Typography>
                      <div className={classes.rightEnd}>
                        {task?.isUserAbleToCreateReport &&
                        task?.isScheduleCreated === true &&
                        task?.isAuditReportCreated === false ? (
                          <Tooltip title={"Create Audit Report"}>
                            <IconButton
                              onClick={() => {
                                navigate("/audit/auditreport/newaudit", {
                                  state: {
                                    auditScheduleId: task.scheduleId,
                                    entityName: task.title,
                                    disableFields: true,
                                    auditScheduleName: "",
                                  },
                                });
                              }}
                              style={{
                                padding: "10px",
                                border: "2px",
                                // backgroundColor: "#042e54",
                                // color: "white",
                                borderRadius: "20%",
                              }}
                            >
                              <MdOutlineAddBox width={20} height={20} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        {/* {task?.type !== "dept" && ( */}

                        {/* )} */}
                        {task.type === "dept" ? (
                          <p
                            style={{
                              fontSize: "15px",
                              fontWeight: 600,
                              margin: "5px",
                            }}
                          >
                            {task.title}
                          </p>
                        ) : (
                          <Badge count={task?.entityData?.length || 0}>
                            <span
                              className={classes.taskTag}
                              onClick={() => {
                                setEntityDataNew(task?.entityData || []);
                                setIsOpen(true);
                              }}
                            >
                              {task.title}
                            </span>
                          </Badge>
                        )}
                        <div
                          style={{
                            fontSize: "12px",
                            margin: "0px 0px",
                            display: "flex",
                          }}
                        >
                          <p
                            style={{
                              margin: "2px 5px",
                              fontWeight: 600,
                            }}
                          >
                            Audit Type :{" "}
                          </p>
                          <p
                            style={{
                              margin: "2px 5px",
                            }}
                          >
                            {" "}
                            {task?.auditTypeName || ""}
                          </p>
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            margin: "0px 0px",
                            display: "flex",
                          }}
                        >
                          <p
                            style={{
                              margin: "2px 5px",
                              fontWeight: 600,
                            }}
                          >
                            Created By :{" "}
                          </p>
                          <p
                            style={{
                              margin: "2px 5px",
                            }}
                          >
                            {" "}
                            {task?.createdBy}
                          </p>
                        </div>
                        {task?.isScheduleCreated === true &&
                          task?.isAuditReportCreated === false &&
                          task?.type === "dept" && (
                            <div
                              style={{
                                fontSize: "12px",
                                margin: "0px 0px",
                                display: "flex",
                              }}
                            >
                              <p
                                style={{
                                  margin: "2px 5px",
                                  fontWeight: 600,
                                }}
                              >
                                Auditor :{" "}
                              </p>
                              <p
                                style={{
                                  margin: "2px 5px",
                                }}
                              >
                                {" "}
                                {task?.auditor}
                              </p>
                            </div>
                          )}
                        {task?.isScheduleCreated === true &&
                          task?.isAuditReportCreated === false &&
                          task?.type === "dept" && (
                            <div
                              style={{
                                fontSize: "12px",
                                margin: "0px 0px",
                                display: "flex",
                              }}
                            >
                              <p
                                style={{
                                  margin: "2px 5px",
                                  fontWeight: 600,
                                }}
                              >
                                Auditee :{" "}
                              </p>
                              <p
                                style={{
                                  margin: "2px 5px",
                                }}
                              >
                                {" "}
                                {task?.auditee}
                              </p>
                            </div>
                          )}
                        {task?.isScheduleCreated === true &&
                          task?.isAuditReportCreated === false &&
                          task?.type === "dept" && (
                            <div
                              style={{
                                fontSize: "12px",
                                margin: "0px 0px",
                                display: "flex",
                              }}
                            >
                              <p
                                style={{
                                  margin: "2px 5px",
                                  fontWeight: 600,
                                }}
                              >
                                Scheduled Time :{" "}
                              </p>
                              <p
                                style={{
                                  margin: "2px 5px",
                                }}
                              >
                                {" "}
                                {task?.time || ""}
                              </p>
                            </div>
                          )}
                        <div
                          style={{
                            fontSize: "12px",
                            margin: "0px 0px",
                            display: "flex",
                          }}
                        >
                          <p
                            style={{
                              margin: "2px 5px",
                              fontWeight: 600,
                            }}
                          >
                            {task?.isScheduleCreated === false
                              ? "Created On"
                              : task?.isScheduleCreated === true &&
                                task?.isAuditReportCreated
                              ? "Created On"
                              : "Planned On"}
                            :{" "}
                          </p>
                          <p
                            style={{
                              margin: "2px 5px",
                            }}
                          >
                            {" "}
                            {formatDate(task?.createdAt)}
                          </p>
                        </div>

                        {/* <div
                          style={{
                            fontSize: "12px",
                            margin: "0px 0px",
                            display: "flex",
                          }}
                        >
                          <p
                            style={{
                              margin: "2px 5px",
                              fontWeight: 600,
                            }}
                          >
                            System :{" "}
                          </p>
                          <p
                            style={{
                              margin: "2px 5px",
                            }}
                          >
                            {" "}
                            {task?.systems}
                          </p>
                        </div> */}
                      </div>
                      <div
                        className={classes.iconGroup}
                        style={{ margin: "5px 0px 0px 0px" }}
                      >
                        {task?.auditorCheck &&
                        !task?.auditPlanUnitData[0]?.hasOwnProperty(
                          "auditPeriod"
                        ) ? (
                          <Tooltip title="Finalize Dates">
                            <IconButton
                              onClick={() => {
                                // handleFinalizeMode(task);
                                setModelMode("create");
                                setAuditPlanData({
                                  ...task?.auditPlanData,
                                  auditPlanUnitData: task?.auditPlanUnitData,
                                  unitName: task?.name,
                                  auditTypeName: task?.auditTypeName,
                                  unitId: task?.unitId,
                                  auditPlanId: task?.auditPlanId,
                                  rowMonths: task?.months,
                                  format: task?.format,
                                  auditPlanEntityWiseId:
                                    task?.auditPlanEntityWiseId,
                                  systemName:
                                    task?.auditPlanData?.systemMasterId,
                                });
                                setOpenAuditFinalize(true);
                              }}
                              style={{
                                color: "black",
                                padding: "0px",
                              }}
                            >
                              <MdDateRange
                                width={10}
                                height={10}
                                viewBox="0 0 30 30"
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          ""
                        )}

                        {task.scheduleAccess &&
                          !task.isScheduleCreated &&
                          task.unitData !== "Unit" &&
                          task?.unitData !== "corpFunction" && (
                            <Tooltip title="Create Audit Schedule">
                              <IconButton
                                onClick={() => {
                                  setTask({
                                    ...task,
                                    monthName: column?.title,
                                  });
                                  setEntityData({});
                                  addEntityOptions(task);
                                  setIsEntityModal(true);
                                }}
                                style={{
                                  color: "black",
                                  padding: "0px",
                                }}
                              >
                                <div ref={refelemet6}>
                                  <MdListAlt
                                    width={15}
                                    height={15}
                                    viewBox="0 0 30 30"
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  />
                                </div>
                              </IconButton>
                            </Tooltip>
                          )}
                        {!task?.isScheduleCreated &&
                          create &&
                          selectTableAuditType?.scope?.id !== "Unit" && (
                            <IconButton
                              onClick={() =>
                                handleCreateDropData(columnIndex, task, false)
                              }
                              style={{
                                color: "black",
                                padding: "0px 3px 4px 0px",
                              }}
                            >
                              <MdOutlineClose
                                width={18}
                                height={18}
                                style={{
                                  color: "red",
                                  // backgroundColor:"black",
                                  border: "1px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              />
                            </IconButton>
                          )}
                      </div>
                    </div>
                    {task?.auditPlanUnitData ? (
                      <div>
                        {/* !!finalisedDateRange?.fromDate
                            ? dayjs(finalisedDateRange?.fromDate)
                            : null, */}
                        {task?.auditPlanUnitData?.map((item: any) => (
                          <div className={classes.datePickersContainer}>
                            <RangePicker
                              className={classes.disabledRangePicker}
                              // value=[{task?.auditPlanUnitData?.fromDate},]
                              format="DD-MM-YYYY"
                              disabled={true}
                              value={[
                                !!item?.fromDate ? dayjs(item?.fromDate) : null,
                                !!item?.toDate ? dayjs(item?.toDate) : null,
                              ]}
                              style={{
                                border: "1px solid black",
                                width: "220px",
                              }}
                              // toDate={task?.auditPlanUnitData?.fromDate?.toDate}
                            />
                            <IconButton
                              onClick={() => {
                                setModelMode("edit");
                                setAuditPlanData({
                                  ...task?.auditPlanData,
                                  auditPlanUnitData: item,
                                  unitName: task?.name,
                                  auditTypeName: task?.auditTypeName,
                                  unitId: task?.unitId,
                                  auditPlanId: task?.auditPlanId,
                                  rowMonths: task?.months,
                                  format: task?.format,
                                  auditPlanEntityWiseId:
                                    task?.auditPlanEntityWiseId,

                                  systemName:
                                    task?.auditPlanData?.systemMasterId,
                                });
                                setOpenAuditFinalize(true);
                              }}
                              style={{
                                color: "black",
                                padding: "0px",
                              }}
                            >
                              <Tooltip title="View Finalised Dates">
                                <MdVisibility width={15} height={15} />
                              </Tooltip>
                            </IconButton>
                          </div>
                        ))}
                      </div>
                    ) : (
                      ""
                    )}
                    {task.hasOwnProperty("scheduleId") &&
                      task.scheduleId !== "" &&
                      task.isScheduleCreated && (
                        <div
                          style={{
                            fontSize: "12px",
                            margin: "0px 0px",
                            display: "flex",
                          }}
                        >
                          <Tooltip title={`Click to View Audit Schedule`}>
                            <Button
                              // className={classes.actionButton}
                              // type="primary"
                              shape="round"
                              icon={
                                <MdOutlineEventAvailable
                                  style={{ verticalAlign: "middle" }}
                                />
                              } // Align icon to middle
                              size={"middle"}
                              // style={{
                              //   margin: "2px 5px",
                              // }}
                              onClick={() => {
                                if (task.isScheduleCreated) {
                                  window.open(
                                    `/audit/auditschedule/auditscheduleform/schedule/${task?.scheduleId}`,
                                    "_blank"
                                  );
                                }
                              }}
                            ></Button>
                          </Tooltip>

                          {task.isAuditReportCreated && (
                            <Tooltip title={`Click to View Audit Report`}>
                              <Button
                                // className={classes.actionButton}
                                // type="primary"
                                shape="round"
                                icon={
                                  <MdAssessment
                                    style={{ verticalAlign: "middle" }}
                                  />
                                } // Align icon to middle
                                size={"middle"}
                                // style={{
                                //   margin: "2px 5px",
                                // }}
                                onClick={() => {
                                  if (task.isAuditReportCreated) {
                                    window.open(
                                      `/audit/auditreport/newaudit/${task?.auditorReportId}`,
                                      "_blank"
                                    );
                                  }
                                }}
                              ></Button>
                            </Tooltip>
                          )}

                          {task.isAuditReportCreated === false &&
                            createSchedule && (
                              <Tooltip
                                title={`Click to Delete Audit Schedule Entity Wise Data`}
                              >
                                <Button
                                  shape="round"
                                  icon={
                                    <MdOutlineDelete
                                      style={{ verticalAlign: "middle" }}
                                    />
                                  }
                                  size="middle"
                                  onClick={() => {
                                    setSelectedTaskId(
                                      task?.auditScheduleEntityId
                                    );
                                    setIsDeleteModalOpen(true);
                                    //   try {
                                    //     const response = await axios.delete(
                                    //       `/api/auditSchedule/deleteAuditScheduleById/${task?.auditScheduleEntityId}`
                                    //     );
                                    //     enqueueSnackbar(
                                    //       "Successfully deleted audit schedule entity data.",
                                    //       {
                                    //         variant: "success",
                                    //       }
                                    //     );
                                    //     getDataForDrops(currentStateNew);
                                    //     // Optionally, refresh list or give user feedback
                                    //   } catch (error) {
                                    //     enqueueSnackbar("Something Went Wrong", {
                                    //       variant: "error",
                                    //     });

                                    //     // Show error notification if needed
                                    //   }
                                  }}
                                />
                              </Tooltip>
                            )}

                          {task.isAuditReportCreated === false &&
                            createSchedule && (
                              <Tooltip
                                title={`Click to Edit Audit Schedule Entity Wise Data`}
                              >
                                <Button
                                  shape="round"
                                  icon={
                                    <MdOutlineEdit
                                      style={{ verticalAlign: "middle" }}
                                    />
                                  }
                                  size="middle"
                                  onClick={() => {
                                    setEditEntityData({
                                      title: task.title,
                                      auditee: task?.auditeeId || [],
                                      auditor: task?.auditorId || [],
                                      time: task?.scheduleTime,
                                      id: task?.auditScheduleEntityId,
                                      template: task?.auditTemplates || [],
                                    });
                                    addEntityOptions(task);
                                    setEditEntityModal(true);
                                  }}
                                />
                              </Tooltip>
                            )}
                        </div>
                      )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Paper>
  ));

  const [selected, setSelected] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState(false);
  const [currentState, setCurrentState] = useState("off"); // 'on', 'off', 'auto'
  const [selectedCard, setSelectedCard] = useState(false);
  const [selectedUnitCard, setSelectedUnitCard] = useState(false);

  const toggleCalendarModal = (data: any = {}) => {
    setCalendarModalInfo({
      ...calendarModalInfo,
      open: !calendarModalInfo.open,
      data: data,
      dataLoaded: data?.id ? true : false,
    });
  };
  const handleChange = (key: any) => {
    // initialBoard()
    setOpenAudit(false);
    getDataForDrops(key);
    setCurrentStateNew(key);
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

  return (
    <>
      <div className={classes.root}>
        <ConfirmDialog
          open={open}
          handleClose={() => setOpen(false)}
          handleDelete={handleDelete}
        />
        <Grid
          item
          xs={12}
          style={
            {
              // paddingBottom: matches ? "0px" : "30px",
              // paddingTop: matches ? "10px" : "10px",
            }
          }
        >
          <Box
            className={classes.searchContainer}
            style={{ marginTop: matches ? "10px" : "20px" }}
          >
            <div
              style={{
                display: matches ? "flex" : "grid",
                justifyContent: "space-between",
                alignItems: "center",
                gap: matches ? "10px" : "10px",
              }}
            >
              <Grid container alignItems="center">
                {matches ? (
                  <Grid item xs={6} md={3}>
                    <div className={classes.locSearchBox}>
                      <FormControl variant="outlined" size="small" fullWidth>
                        <div style={{ paddingTop: "4px" }} ref={refelemet2}>
                          <Autocomplete
                            // multiple
                            id="location-autocomplete"
                            className={classes.inputRootOverride}
                            options={auditTypeOptions}
                            getOptionLabel={(option: any) => option.value || ""}
                            getOptionSelected={(option: any, value) =>
                              option.id === value.id
                            }
                            value={selectTableAuditType}
                            onChange={(e: any, value: any) => {
                              setViewerMode(false);
                              setSelectTableAuditType(value);
                              setSelected(!!value);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="outlined"
                                size="small"
                                // label="Audit type"
                                placeholder="Audit type"
                                fullWidth
                                className={
                                  selected
                                    ? classes.textField
                                    : classes.textField2
                                }
                              />
                            )}
                          />
                        </div>
                      </FormControl>
                    </div>
                  </Grid>
                ) : (
                  ""
                )}
                {matches ? (
                  <Grid item xs={6} md={3}>
                    <div className={classes.locSearchBox}>
                      <FormControl variant="outlined" size="small" fullWidth>
                        <div style={{ paddingTop: "4px" }} ref={refelemet2}>
                          <Autocomplete
                            // multiple
                            id="location-autocomplete"
                            className={classes.inputRootOverride}
                            options={
                              Array.isArray(locationNames)
                                ? [allOption, ...locationNames]
                                : [allOption]
                            }
                            getOptionLabel={(option) =>
                              option.locationName || ""
                            }
                            getOptionSelected={(option, value) =>
                              option.id === value.id
                            }
                            value={selectedLocation}
                            onChange={handleChangeList}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="outlined"
                                size="small"
                                // label="Corp Func/Unit"
                                placeholder="Corp Func/Unit"
                                fullWidth
                                className={
                                  selectedUnit
                                    ? classes.textField
                                    : classes.textField2
                                }
                              />
                            )}
                          />
                        </div>
                      </FormControl>
                    </div>
                  </Grid>
                ) : (
                  ""
                )}

                {/* <Grid item xs={6} md={3}>
                  <div className={classes.locSearchBox}>
                    <FormControl variant="outlined" size="small" fullWidth>
                      <div style={{ paddingTop: "4px" }} ref={refelemet2}>
                        <Autocomplete
                          multiple
                          limitTags={1}
                          id="location-autocomplete"
                          className={classes.inputRootOverride}
                          options={systemOptions}
                          getOptionLabel={(option: any) => option.name || ""}
                          getOptionSelected={(option: any, value) =>
                            option.id === value.id
                          }
                          value={selectTableSystem || []}
                          onChange={(e, value) => {
                            setSelectTableSystem(value);
                            setSelectedSystem(!!value);
                          }}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <div
                                key={option.id}
                                className={`${classes.tagContainer} ${
                                  index > 0 ? classes.hiddenTags : ""
                                }`}
                              >
                                <div className={classes.tag}>{option.name}</div>
                              </div>
                            ))
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              size="small"
                              // label="System"
                              placeholder={
                                selectTableSystem.length === 0 ? "System" : ""
                              }
                              fullWidth
                              className={
                                selectTableSystem.length === 0
                                  ? classes.textField2
                                  : classes.textField
                              }
                            />
                          )}
                        />
                      </div>
                    </FormControl>
                  </div>
                </Grid> */}

                {matches ? (
                  <div ref={refelemet3}>
                    <YearComponent
                      currentYear={currentYear}
                      setCurrentYear={setCurrentYear}
                    />
                  </div>
                ) : (
                  ""
                )}

                {!viewerMode && selectCalenderview !== true && (
                  <div
                    style={{
                      marginLeft: "auto",
                      paddingRight: matches ? "10px" : "0px",
                    }}
                  >
                    {/* Pushes Segmented to the right */}
                    <Segmented
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: 8,
                        border: "2px solid black",
                        fontSize: matches ? "14px" : "10px",
                        // width: "200px",
                      }} // Add blue border here
                      defaultValue="Scheduled"
                      value={currentStateNew}
                      options={["Planned", "Scheduled", "Completed", "All"]}
                      onChange={handleChange}
                      className={classes.segmentedItem}
                    />
                  </div>
                )}
              </Grid>

              {mode === true && (
                <>
                  <IconButton
                    onClick={() => {
                      setMyAuditShow(!myAuditShow);
                    }}
                  >
                    <Tooltip title={"Created By Me"}>
                      {!myAuditShow ? (
                        <MdOutlinePermContactCalendar
                          style={{
                            color: "#444",
                            height: "31px",
                            width: "30px",
                          }}
                        />
                      ) : (
                        <MdPermContactCalendar
                          style={{
                            color: "rgb(53, 118, 186)",
                            height: "31px",
                            width: "30px",
                          }}
                        />
                      )}
                    </Tooltip>
                  </IconButton>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <SearchBar
                      placeholder="Search"
                      name="searchQuery"
                      values={searchQuery}
                      handleChange={handleSearchChange}
                      handleApply={handleTableSearch}
                      endAdornment={true}
                      handleClickDiscard={handleClickDiscard}
                    />
                  </div>
                </>
              )}
            </div>
          </Box>
        </Grid>
        <div
          style={{
            margin: matches ? "20px 0px 2px 20px" : "20px 0px 2px 0px",
            position: "relative",
            top: viewerMode ? -45 : 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: matches ? "end" : "start", // Space between button and segmented
              alignItems: "center",
              width: "100%", // Ensure it takes full width
              padding: matches ? "10px" : "5px",
            }}
          >
            {/* Button aligned to the left */}
            {selectTableAuditType !== undefined &&
              selectTableAuditType?.id !== "All" &&
              (selectedLocation?.id !== "All" ||
                selectTableAuditType?.scope?.id === "Unit") &&
              currentStateNew === "Planned" && (
                <button
                  style={{
                    borderRadius: "5px",
                    backgroundColor: "#f0f0f0",
                    color: "#444",
                    cursor: "pointer",
                    marginTop: "0px",
                    display: "flex", // Flexbox to align items
                    alignItems: "center", // Vertically align icon and text
                    gap: "8px", // Add space between icon and text
                    padding: "4px 12px", // Add padding for better click area
                    border: `1px solid black`, // Remove default border
                  }}
                  onClick={() => {
                    setViewerMode(!viewerMode);
                    getAuditPlanDetailsById();
                  }}
                >
                  {viewerMode ? (
                    <>
                      <MdDashboard style={{ fontSize: "20px" }} />{" "}
                      {/* Adjust icon size */}
                      <span style={{ fontSize: "14px", fontWeight: "500" }}>
                        Board View
                      </span>
                    </>
                  ) : (
                    <>
                      <MdFormatListBulleted style={{ fontSize: "20px" }} />
                      <span style={{ fontSize: "14px", fontWeight: "500" }}>
                        Yearly Audit Plan
                      </span>
                    </>
                  )}
                </button>
              )}

            {currentStateNew === "Scheduled" && (
              <div
                style={{
                  display: "flex", // Flex container
                  alignItems: "center", // Align items vertically
                  gap: "4px", // Add spacing between buttons
                }}
              >
                {/* Create Ad Hoc Schedule Button */}
                {createSchedule === true && createSchedule === true && (
                  <button
                    style={{
                      borderRadius: "5px",
                      backgroundColor: "#f0f0f0",
                      color: "#444",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                      padding: "4px 6px",
                      border: `1px solid black`,
                    }}
                    onClick={() => {
                      setReportOpen(true);
                      setScheduleFormType("adhoc-create");
                    }}
                  >
                    <MdAdd style={{ fontSize: matches ? "20px" : "16px" }} />
                    <span
                      style={{
                        fontSize: matches ? "14px" : "12px",
                        fontWeight: "500",
                      }}
                    >
                      Adhoc Schedule
                    </span>
                  </button>
                )}

                {/* My Audit Button */}
                <button
                  style={{
                    backgroundColor: openAudit
                      ? "rgb(53, 118, 186)"
                      : "#f0f0f0",
                    color: openAudit ? "white" : "#444",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    padding: "4px 6px",
                    borderRadius: "5px",
                    border: `1px solid black`,
                  }}
                  onClick={() => {
                    setOpenAudit(!openAudit);
                    getCalendarData(searchValue, !openAudit);
                  }}
                >
                  {openAudit ? (
                    <MdPermContactCalendar
                      style={{ fontSize: matches ? "20px" : "16px" }}
                    />
                  ) : (
                    <MdOutlinePermContactCalendar
                      style={{ fontSize: matches ? "20px" : "16px" }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: matches ? "14px" : "12px",
                      fontWeight: "500",
                    }}
                  >
                    My Audit
                  </span>
                </button>

                {/* Calendar or Board View Button */}
                <button
                  style={{
                    backgroundColor: selectCalenderview
                      ? "rgb(53, 118, 186)"
                      : "#f0f0f0",
                    color: selectCalenderview ? "white" : "#444",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    padding: "4px 6px",
                    borderRadius: "5px",
                    border: `1px solid black`,
                  }}
                  onClick={() => {
                    setCalenderView(!selectCalenderview);
                    if (!selectCalenderview) {
                      getCalendarData(searchValue, false);
                    }
                  }}
                >
                  {selectCalenderview ? (
                    <MdDashboard
                      style={{ fontSize: matches ? "20px" : "16px" }}
                    />
                  ) : (
                    <MdOutlineCalendarToday
                      style={{ fontSize: matches ? "20px" : "16px" }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: matches ? "14px" : "12px",
                      fontWeight: "500",
                    }}
                  >
                    {selectCalenderview ? "Board View" : "Calendar"}
                  </span>
                </button>
              </div>
            )}
            {currentStateNew === "Planned" &&
              dropData?.length > 0 &&
              viewerMode === false &&
              createSchedule === true && (
                <div>
                  <button
                    // title="Create Audit Schedule"
                    onClick={() => {
                      setPlanId(dropData[0]?.auditPlanId || "");
                      setScheduleFormType("planSchedule-create");
                      handleModalData();
                      // setIsSecondVisible(true);
                    }}
                    style={{
                      borderRadius: "5px",
                      backgroundColor: "#f0f0f0",
                      color: "#444",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "4px 12px",
                      border: `1px solid black`,
                      marginLeft: "10px",
                    }}
                  >
                    {/* Create Schedule
                     */}

                    <MdAdd style={{ fontSize: "20px" }} />
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>
                      Schedule Audit
                    </span>
                    {/* <AddIcon /> */}
                  </button>
                </div>
              )}
            {/* Tabs centered */}

            {mode === false &&
            viewerMode &&
            // createSchedule === true &&
            (create === true || editMode === true) ? (
              <button
                onClick={() => {
                  if (editMode === true) {
                    handleUpdate();
                  } else {
                    handleCreate();
                  }
                }}
                disabled={disabledButton}
                style={{
                  backgroundColor: disabledButton ? "#d3d3d3" : "#f0f0f0", // Gray when disabled
                  color: disabledButton ? "#888" : "#444", // Adjust text color
                  cursor: disabledButton ? "not-allowed" : "pointer", // Change cursor when disabled
                  marginTop: "0px",
                  marginLeft: "5px",
                  alignItems: "center",
                  gap: "8px",
                  padding: "4px 12px",

                  borderRadius: "5px",
                  display: "flex",
                  // border: "none",
                  border: `1px solid black`,
                }}
              >
                {editMode ? (
                  <>
                    <MdUpdate style={{ fontSize: "20px" }} />
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>
                      Update
                    </span>
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            ) : (
              ""
            )}
          </div>
        </div>
        {matches === false &&
        (currentStateNew === "Completed" || currentStateNew === "All") ? (
          <div style={{ marginTop: "30px" }}></div>
        ) : (
          ""
        )}
        {mode === false ? (
          <>
            {!viewerMode ? (
              <>
                <div style={{ position: "relative" }}>
                  {selectCalenderview !== true && (
                    <>
                      <Button
                        onClick={() => carouselRef.current.slidePrev()}
                        style={
                          matches
                            ? {
                                position: "absolute",
                                top: "7px", // Position at the top
                                left: "0px", // Align to the left
                                zIndex: 1,
                                // backgroundColor: "rgba(255, 255, 255, 0.8)", // Optional for contrast
                                backgroundColor: "rgb(159 156 156)",
                                width: "27px",
                                height: "33px",
                                color: "white",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                // border: "1px solid black",
                              }
                            : {
                                position: "absolute",
                                top: "-38px", // Position at the top
                                right: "45px", // Align to the left
                                zIndex: 1,
                                // backgroundColor: "rgba(255, 255, 255, 0.8)", // Optional for contrast
                                backgroundColor: "rgb(159 156 156)",
                                width: "27px",
                                height: "33px",
                                color: "white",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                // border: "1px solid black",
                              }
                        }
                      >
                        <DoubleLeftOutlined style={{ fontSize: "17px" }} />
                      </Button>
                      <Button
                        onClick={() => carouselRef.current.slideNext()}
                        style={{
                          position: "absolute",
                          top: matches ? "7px" : "-38px", // Position at the top
                          right: "8px", // Align to the right
                          zIndex: 1,
                          // backgroundColor: "rgba(255, 255, 255, 0.8)", // Optional for contrast
                          backgroundColor: "rgb(159 156 156)",
                          width: "27px",
                          height: "33px",
                          color: "white",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <DoubleRightOutlined style={{ fontSize: "17px" }} />
                      </Button>
                    </>
                  )}

                  <div
                    className={classes.boardContainer}
                    style={{
                      position: "relative",
                      padding: matches ? "0px 10px" : "0px 0px",
                      marginRight: matches ? "10px" : "0px",
                      borderRadius: "3px",
                    }}
                  >
                    {selectCalenderview === false ? (
                      <DragDropContext onDragEnd={onDragEnd}>
                        <AliceCarousel
                          mouseTracking
                          items={items}
                          responsive={responsive}
                          controlsStrategy="alternate"
                          autoPlay={false}
                          infinite={false}
                          disableButtonsControls={true}
                          activeIndex={activeIndex}
                          onSlideChanged={onSlideChanged}
                          ref={carouselRef}
                          renderDotsItem={() => null}
                        />
                      </DragDropContext>
                    ) : (
                      <>
                        <div
                          // className={classes.auditReportCalendarWrapper}
                          style={{
                            width: "100%",
                            // height: "600px",
                            // overflow: "auto",
                          }}
                        >
                          <AuditScheduleCalendar
                            events={calendarData}
                            toggleCalendarModal={toggleCalendarModal}
                            calendarModalInfo={calendarModalInfo}
                            calendarFor="AuditSchedule"
                            auditTypes={auditTypes}
                            setAuditTypes={setAuditTypes}
                            locationNames={locationNames}
                            currentYear={currentYear}
                            refreshCalendarData={refreshCalendarData}
                            auditPlanIdFromPlan={auditPlanIdFromPlan}
                            loaderForSchdeuleDrawer={loaderForSchdeuleDrawer}
                            setLoaderForSchdeuleDrawer={
                              setLoaderForSchdeuleDrawer
                            }
                            auditScheduleIdFromLocation={
                              auditScheduleIdFromLocation
                            }
                            formModeForCalendarDrawer={
                              formModeForCalendarDrawer
                            }
                            setFormModeForCalendarDrawer={
                              setFormModeForCalendarDrawer
                            }
                            selectedAuditType={selectTableAuditType}
                            selectedLocation={selectedLocation}
                            createSchedule={createSchedule}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ marginTop: "-40px" }}>
                {/* <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  {create === true || editMode === true ? (
                    <button
                      onClick={() => {
                        if (editMode === true) {
                          handleUpdate();
                        } else {
                          handleCreate();
                        }
                      }}
                      style={{
                        padding: "10px 20px 4px 20px",
                        // cursor: "pointer",
                        borderRadius: "5px",
                        // position: "relative", // this is needed for the pseudo-element arrow
                        backgroundColor: "rgb(0, 48, 89)", // conditional background color
                        color: "white",
                      }}
                    >
                      Submit
                    </button>
                  ) : (
                    ""
                  )}
                </div> */}
                <AuditPlanForm3
                  handleSubmit={handleUpdate}
                  // handleNe={handleNext}
                  auditPlanData={auditPlanDataNew}
                  removedList={removedList}
                  setRemovedList={setRemovedList}
                  setAuditPlanData={setAuditPlanDataNew}
                  getAuditPlanDetailsById={getAuditPlanDetailsById}
                  isEdit={true}
                  disabledForDeletedModal={false}
                  isReadOnly={!isReadOnly}
                  finalisedAuditorTourOpen={finalisedAuditorTourOpen}
                  setFinalisedAuditorTourOpen={setFinalisedAuditorTourOpen}
                  // refForForAuditPlanForm5={refForForAuditPlanForm5}
                  // refForForAuditPlanForm6={refForForAuditPlanForm6}
                  // refForForAuditPlanForm7={refForForAuditPlanForm7}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {isLoading ? (
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
                {auditPeriodModal?.open && (
                  <AuditPeriodModal
                    auditPeriodModal={auditPeriodModal}
                    setAuditPeriodModal={setAuditPeriodModal}
                  />
                )}
                {data && data?.length !== 0 ? (
                  <>
                    <div className={classes.tableContainerScrollable}>
                      <Table
                        dataSource={data}
                        // pagination={{ position: [] }}
                        pagination={false}
                        columns={columns}
                        className={classes.tableContainer}
                      />
                    </div>
                    <div className={classes.pagination}>
                      <Pagination
                        size="small"
                        current={page}
                        pageSize={rowsPerPage}
                        total={count}
                        showTotal={showTotal}
                        showSizeChanger
                        showQuickJumper
                        onChange={(page: any, pageSize: any) => {
                          handlePagination(page, pageSize);
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={classes.imgContainer}>
                      <img src={EmptyTableImg} alt="No Data" width="300px" />
                    </div>
                    <Typography
                      align="center"
                      className={classes.emptyDataText}
                    >
                      Let’s begin by adding a plan
                    </Typography>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
      <Modal
        title="Audit Schedule"
        visible={isModalVisible}
        width={1300}
        footer={null}
        onCancel={() => {
          setScheduleFormType("none");
          resetAuditSchedule();
          setIsModalVisible(false);
          // navigate("/audit", { state: { redirectToTab: "AUDIT PLAN" } });
        }}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
      >
        <AuditScheduleFormStepper
          dataFrom={planId}
          dataId={"plan"}
          modalWindow={true}
          auditType={selectTableAuditType}
          locationId={selectedLocation}
          setIsModalVisible={setIsModalVisible}
          isModalVisible={isModalVisible}
          generator={() => {
            return uniqueId();
          }}
        />
      </Modal>

      <Modal
        title="Audit Schedule"
        visible={isSecondVisible}
        width={1300}
        footer={null}
        onCancel={() => {
          setScheduleFormType("none");
          resetAuditSchedule();
          setIsSecondVisible(false);
        }}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
      >
        <AuditScheduleFormStepper
          dataFrom={undefined}
          dataId={"adhoc-create"}
          modalWindow={true}
          auditType={selectTableAuditType}
          locationId={selectedLocation}
          setIsModalVisible={setIsSecondVisible}
          isModalVisible={isSecondVisible}
          generator={() => {
            return uniqueId();
          }}
        />
      </Modal>

      <Modal
        title={`Schedule Audit for ${selectedEntityData}`}
        visible={isEntityModal}
        onOk={() => {
          handleScheduleData();
        }}
        onCancel={() => {
          getDataForDrops(currentStateNew);
          setIsEntityModal(false);
        }}
        width={600}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
      >
        <Row gutter={16}>
          <Col span={12}>
            {/* <TextField
              fullWidth
              type="datetime-local"
              name="time"
              value={
                entityData?.time
                  ? new Date(entityData?.time).toISOString().slice(0, 16)
                  : ""
              }
              variant="outlined"
              onChange={(e) => {
                const newTime = e.target.value; // Get the datetime-local value
                setEntityData({ ...entityData, time: newTime }); // Store as string (or convert to Date if needed)
              }}
              size="small"
              required
            /> */}
            <DatePicker
              showTime
              value={entityData?.time ? dayjs(entityData.time) : null}
              onChange={(value) => {
                const newTime = value ? value.toDate() : null; // Format as datetime-local string
                setEntityData({ ...entityData, time: newTime });
              }}
              format="DD-MM-YYYY hh:mm A"
              style={{ width: "100%" }}
              placeholder="Select date and time"
            />
          </Col>
          <Col span={12}>
            <Select
              mode="multiple"
              placeholder="Select Auditors"
              onChange={(value) => {
                setEntityData({ ...entityData, auditor: value });
              }}
              value={entityData?.auditor || []}
              style={{ width: "100%" }}
              optionFilterProp="label"
              filterOption={(input: any, option: any) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {auditorData.map((auditor: any) => (
                <Option
                  key={auditor.id}
                  value={auditor.id}
                  label={auditor.label}
                >
                  {auditor.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Select
              mode="multiple"
              placeholder="Select Auditee"
              onChange={(value) => {
                setEntityData({ ...entityData, auditee: value });
              }}
              value={entityData?.auditee || []}
              style={{ width: "100%" }}
              optionFilterProp="label"
              filterOption={(input: any, option: any) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {auditeeData.map((auditee: any) => (
                <Option
                  key={auditee.id}
                  value={auditee.id}
                  label={auditee.label}
                >
                  {auditee.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <Select
              mode="multiple"
              placeholder="Select CheckList"
              onChange={(value) => {
                setEntityData({ ...entityData, template: value });
              }}
              value={entityData?.template || []}
              style={{ width: "100%" }}
            >
              {template.map((templateData: any) => (
                <Option key={templateData.value} value={templateData.id}>
                  {templateData.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Modal>

      {/* Edit Modal for Audit Schedule  */}
      <Modal
        title={`Edit Schedule Audit for ${editEntityData?.title || ""}`}
        visible={editEntityModal}
        onOk={() => {
          updateEntityData();
        }}
        onCancel={() => {
          getDataForDrops(currentStateNew);
          setEditEntityModal(false);
        }}
        width={550}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            {/* <TextField
              fullWidth
              type="datetime-local"
              name="time"
              label="Schedule Time"
              value={
                editEntityData?.time
                  ? new Date(editEntityData?.time).toISOString().slice(0, 16)
                  : ""
              }
              variant="outlined"
              onChange={(e) => {
                const newTime = new Date(e.target.value); // Convert back to Date object
                setEditEntityData({ ...editEntityData, time: newTime });
              }}
              size="small"
              required
            /> */}

            <DatePicker
              showTime
              value={editEntityData?.time ? dayjs(editEntityData.time) : null}
              onChange={(value) => {
                const newTime = value ? value.toDate() : null; // Convert dayjs to JS Date
                setEditEntityData({ ...editEntityData, time: newTime });
              }}
              format="DD-MM-YYYY hh:mm A"
              style={{ width: "100%" }}
              placeholder="Select date and time"
            />
          </Col>
          {/* {JSON.stringify(editEntityData)} */}
          <Col span={12}>
            <Select
              mode="multiple"
              placeholder="Select Auditors"
              onChange={(value) => {
                setEditEntityData({ ...editEntityData, auditor: value });
              }}
              value={editEntityData?.auditor || []}
              style={{ width: "100%" }}
              optionFilterProp="label"
              filterOption={(input, option: any) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {auditorData.map((auditor: any) => (
                <Option
                  key={auditor.id}
                  value={auditor.id}
                  label={auditor.label}
                >
                  {auditor.label}
                </Option>
              ))}
            </Select>
          </Col>

          <Col span={12}>
            <Select
              mode="multiple"
              placeholder="Select Auditee"
              onChange={(value) => {
                setEditEntityData({ ...editEntityData, auditee: value });
              }}
              value={editEntityData?.auditee || []}
              style={{ width: "100%" }}
              optionFilterProp="label"
              filterOption={(input, option: any) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {auditeeData.map((auditee: any) => (
                <Option
                  key={auditee.id}
                  value={auditee.id}
                  label={auditee.label}
                >
                  {auditee.label}
                </Option>
              ))}
            </Select>
          </Col>

          <Col span={12}>
            <Select
              mode="multiple"
              placeholder="Select Checklist"
              onChange={(value) => {
                setEditEntityData({ ...editEntityData, template: value });
              }}
              value={editEntityData?.template || []}
              style={{ width: "100%" }}
            >
              {template.map((templateData: any) => (
                <Option key={templateData.id} value={templateData.id}>
                  {templateData.label}
                </Option>
              ))}
            </Select>
          </Col>

          {/* New Comment Field */}
          <Col span={24}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Comments"
              variant="outlined"
              value={editEntityData?.comment || ""}
              onChange={(e) =>
                setEditEntityData({
                  ...editEntityData,
                  comment: e.target.value,
                })
              }
              size="small"
            />
          </Col>
        </Row>
      </Modal>

      <div>
        {openAuditFinalize && (
          // <AuditFinaliseDateModal
          //   auditPlanData={auditPlanData}

          // ></AuditFinaliseDateModal>
          <AuditFinalizeModal
            auditPlanData={auditPlanData}
            mode={modalMode}
            setOpenAuditFinalize={setOpenAuditFinalize}
            openAuditFinalize={openAuditFinalize}
            isEdit={true}
          ></AuditFinalizeModal>
        )}
        {entityDataNew?.length > 0 && (
          <Modal
            title="Department By Unit Data"
            visible={isOpen}
            onCancel={() => {
              setIsOpen(false);
            }}
            width={750}
            footer={null}
          >
            <div>
              {isOpen === true && entityDataNew?.length > 0 && (
                <div>
                  {entityDataNew?.map((value: any, index: any) => (
                    <div className={classes.rollingRow}>
                      <span
                        style={{
                          backgroundColor: `${
                            value?.isAuditReportCreated ? "#d98cb3" : "#81C784"
                          }`, // Light green for Scheduled label
                          padding: "5px 10px",
                          borderRadius: "5px",
                          fontWeight: 600,
                          color: "#000",
                          marginRight: "15px",
                          textAlign: "center",
                        }}
                      >
                        {value?.isAuditReportCreated
                          ? "Completed"
                          : "Scheduled"}
                      </span>
                      <span className={classes.name}>{value?.name || ""}</span>
                      <span className={classes.auditorNew}>
                        <MultiUserDisplay
                          data={value.auditor}
                          name="username"
                        ></MultiUserDisplay>
                      </span>
                      <span className={classes.auditeeNew}>
                        <MultiUserDisplay
                          data={value.auditee}
                          name="username"
                        ></MultiUserDisplay>
                      </span>
                      <span className={classes.time}>{value?.time}</span>
                      {value?.auditorId.includes(userDetails?.id) &&
                        value?.isAuditReportCreated == false && (
                          <IconButton
                            className={classes.addIcon}
                            onClick={() => {
                              navigate("/audit/auditreport/newaudit", {
                                state: {
                                  auditScheduleId: value.scheduleId,
                                  entityName: value.title,
                                  disableFields: true,
                                  auditScheduleName: "",
                                },
                              });
                            }}
                          >
                            <MdAdd />
                          </IconButton>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Modal>
        )}

        <Dialog
          fullScreen={fullScreen}
          open={reportOpen}
          onClose={() => {
            setReportOpen(false);
          }}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogContent>
            <DialogContentText>
              You are about to create Ad-hoc Schedule without Plan. Do you want
              to continue?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() => {
                setReportOpen(false);
              }}
              color="primary"
            >
              No
            </Button>
            <Button
              // disabled={!isLocAdmin}
              onClick={() => {
                // handleDiscard();
                // handleReportYes();
                setReportOpen(false);
                setIsSecondVisible(true);
              }}
              color="primary"
              autoFocus
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
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
              marginTop: "-12px",
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
            padding: "20px",
            margin: "20px 20px 10px 20px",
          }}
        >
          <div className={classes.locSearchBox}>
            <FormControl variant="outlined" size="small" fullWidth>
              <div style={{ paddingTop: "4px" }} ref={refelemet2}>
                <Autocomplete
                  // multiple
                  id="location-autocomplete"
                  className={classes.inputRootOverride}
                  options={auditTypeOptions}
                  getOptionLabel={(option: any) => option.value || ""}
                  getOptionSelected={(option: any, value) =>
                    option.id === value.id
                  }
                  value={selectTableAuditType}
                  onChange={(e: any, value: any) => {
                    setViewerMode(false);
                    setSelectTableAuditType(value);
                    setSelected(!!value);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      // label="Audit type"
                      placeholder="Audit type"
                      fullWidth
                      className={
                        selected ? classes.textField : classes.textField2
                      }
                    />
                  )}
                />
              </div>
            </FormControl>
          </div>
          <div className={classes.locSearchBox}>
            <FormControl variant="outlined" size="small" fullWidth>
              <div style={{ paddingTop: "4px" }} ref={refelemet2}>
                <Autocomplete
                  // multiple
                  id="location-autocomplete"
                  className={classes.inputRootOverride}
                  options={
                    Array.isArray(locationNames)
                      ? [allOption, ...locationNames]
                      : [allOption]
                  }
                  getOptionLabel={(option) => option.locationName || ""}
                  getOptionSelected={(option, value) => option.id === value.id}
                  value={selectedLocation}
                  onChange={handleChangeList}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      // label="Corp Func/Unit"
                      placeholder="Corp Func/Unit"
                      fullWidth
                      className={
                        selectedUnit ? classes.textField : classes.textField2
                      }
                    />
                  )}
                />
              </div>
            </FormControl>
          </div>
          <div ref={refelemet3}>
            <YearComponent
              currentYear={currentYear}
              setCurrentYear={setCurrentYear}
            />
          </div>
        </div>
      </Modal>

      <Modal
        title="Confirm Deletion"
        open={isDeleteModalOpen}
        onOk={() => {
          confirmDelete();
        }}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedTaskId("");
        }}
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this audit schedule?</p>
      </Modal>
      <Modal
        title="Auditor/Auditee Conflict"
        open={errModal}
        onOk={() => {
          setErrModal(false);
          setErrMessage(""); // clear after close
          // You can add force save logic here if you want
          handleScheduleData(true);
        }}
        onCancel={() => {
          setErrModal(false);
          setErrMessage(""); // clear after close
        }}
        okText="OK"
        cancelText="Cancel"
      >
        <p>{errMessage}</p> {/* dynamically shows the conflict error */}
        <p>Are you sure you want to continue?</p>
      </Modal>

      <Modal
        title="Auditor/Auditee Conflict"
        open={errEditModal}
        onOk={() => {
          setEditErrModal(false);
          setEditErrMessage(""); // clear after close
          // You can add force save logic here if you want
          updateEntityData(true);
        }}
        onCancel={() => {
          setEditErrModal(false);
          setEditErrMessage(""); // clear after close
        }}
        okText="OK"
        cancelText="Cancel"
      >
        <p>{errMessage}</p> {/* dynamically shows the conflict error */}
        <p>Are you sure you want to continue?</p>
      </Modal>
    </>
  );
};

export default Audit;
