//react
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import type { TourProps } from "antd";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import CancelIcon from "@material-ui/icons/Cancel";
import ConfirmDialog from "components/ConfirmDialog";
import HistoryIcon from "@material-ui/icons/History";
import PeopleIcon from "@material-ui/icons/People";
//moment
import InfoIcon from "@material-ui/icons/Info";

import moment from "moment";
import _ from "lodash";
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
  InputNumber,
  Typography,
  Popconfirm,
  Descriptions,
  Modal,
  Upload,
  Divider,
  Tabs,
  Badge,
  Tour,
  Popover,
  Skeleton,
} from "antd";
import { FilePdfOutlined, FileExcelOutlined } from "@ant-design/icons";
import {
  FormControl,
  MenuItem,
  Paper,
  useMediaQuery,
  Select as MuiSelect,
  InputLabel,
} from "@material-ui/core";
import type { ColumnsType } from "antd/es/table";
import type { PaginationProps } from "antd";
import AssignmentIcon from "@material-ui/icons/Assignment";

import SearchIcon from "@material-ui/icons/Search";
import { ReactComponent as OrgSettingsIcon } from "assets/moduleIcons/module-setting.svg";
import { ReactComponent as AllDocIcon } from "assets/documentControl/All-Doc.svg";
import { ReactComponent as SignificantIcon } from "assets/icons/significantIcon.svg";
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";
// import tourGuideIconImage from "assets/icons/tourGuideIcon.png";
//thirdparty libs
import { useSnackbar } from "notistack";

//utils
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";
import { navbarColorAtom, referencesData } from "recoil/atom";
import { useSetRecoilState, useRecoilState } from "recoil";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import { isValid, isValidForHiraPage } from "utils/validateInput";
//assets
import InfoRoundedIcon from "@material-ui/icons/InfoRounded";
//styles
import useStyles from "./style";
import "./new.css";
import printJS from "print-js";
import HindalcoLogoSvg from "assets/logo/HindalcoLogoSvg.svg";
import HiraConsolidatedWorkflowHistoryDrawer from "components/Risk/Hira/HiraRegister/HiraConsolidatedWorkflowHistoryDrawer";
import TextArea from "antd/es/input/TextArea";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { saveAs } from "file-saver";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import TouchAppIcon from "@material-ui/icons/TouchApp";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import RiskScoreModal from "components/Risk/Hira/HiraRegister/RiskScoreModal";
import { Avatar, Box, IconButton, CircularProgress } from "@material-ui/core";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import HiraReferences from "components/Risk/Hira/HiraRegister/HiraReferences";
import SendIcon from "@material-ui/icons/Send";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import HiraHistoryDrawerForAllView from "components/Risk/Hira/HiraRegister/HiraHistoryDrawerForAllView";
import HiraWorkflowCommentsDrawer from "components/Risk/Hira/HiraRegisterReview/HiraWorkflowCommentsDrawer";
import ChangeReviewerApproverModal from "components/Risk/Hira/HiraRegister/ChangeReviewerApproverModal";
import DepartmentSelector from "components/ReusableComponents/DepartmentSelector";
// import RiskScoreHelpTable from "components/Risk/Hira/HiraRegister/RiskScoreHelpTable";

const { Option } = Select;
const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;

const showTotalForAll: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;

const { RangePicker } = DatePicker;
const XLSX = require("xlsx");
const avatarUrl = "https://cdn-icons-png.flaticon.com/512/219/219986.png";

function arrayToQueryString(key: any, array: any) {
  if (array && array.length > 0) {
    return array
      .map((item: any) => `${key}[]=${encodeURIComponent(item)}`)
      .join("&");
  }
  return "";
}

function trimText(text: string) {
  return text?.length ? text?.trim() : "";
}

const getHiraStatusForPdf = (workflowStatus: any) => {
  if (workflowStatus === "DRAFT") {
    return "DRAFT";
  } else if (workflowStatus === "REJECTED") {
    return "REJECTED";
  } else if (workflowStatus === "IN_REVIEW") {
    return "IN REVIEW";
  } else if (workflowStatus === "IN_APPROVAL") {
    return "IN APPROVAL";
  } else if (workflowStatus === "APPROVED") {
    return "APPROVED";
  } else {
    return "N/A";
  }
};

const reportTemplate = (
  tableData: any,
  hiraRegisterData: any,
  status: any = "",
  createdByDetails: any = null,
  reviewedByDetails: any = null,
  approvedByDetails: any = null,
  ongoingWorkflowDetails: any = null,
  existingRiskConfig: any = null,
  logo: any
) => {
  // console.log("checkrisk6 tableDatain handleExport-->", tableData);
  // console.log("checkrisk6 approvedBydata reviewerdcbydata", approvedByDetails, reviewedByDetails);

  // console.log("checkrisk hirainworkflow handleexport", hiraInWorkflow);

  const getUniqueAssessmentTeamNames = () => {
    console.log(
      "hiraRegister data in getUniqueAssessmentTeamNames",
      hiraRegisterData
    );

    const namesSet = new Set();
    hiraRegisterData?.assesmentTeamData.forEach((member: any) => {
      namesSet?.add(`${member?.firstname} ${member?.lastname}`);
    });
    return Array?.from(namesSet)?.join(", ");
  };

  // console.log("checkrisk6 getUniqueAssessmentTeamNames", getUniqueAssessmentTeamNames());

  let revisionReason = null;
  if (!!ongoingWorkflowDetails) {
    revisionReason = ongoingWorkflowDetails?.reason || "";
  }

  let riskTypeName = "",
    conditionName = "";
  if (
    hiraRegisterData?.riskType &&
    hiraRegisterData?.condition &&
    existingRiskConfig
  ) {
    riskTypeName = existingRiskConfig?.riskType?.find(
      (risk: any) => risk?._id === hiraRegisterData?.riskType
    )?.name;
    conditionName = existingRiskConfig?.condition?.find(
      (condition: any) => condition?._id === hiraRegisterData?.condition
    )?.name;
  }

  // console.log("checkrisk revisionReason", revisionReason);

  // Unique assessment team names
  const uniqueAssessmentTeamNames = getUniqueAssessmentTeamNames();
  return `
  <div class="report">
    <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
      <thead style="border: 1px solid black;">
        <tr style="background-color: yellow; text-align: center;">
          <th colspan="19">HAZARD IDENTIFICATION AND RISK ASSESSMENT</th>
        </tr>
      </thead>
      <tbody>
        <tr style="text-align: left; border-bottom: 1px solid black;">
          <td colspan="19" style="border: none;">
            <img src="${
              logo || HindalcoLogoSvg
            }" alt="Hindalco Logo" style="display: block; margin-left: auto; margin-right: auto; width: 100px;">
          </td>
        </tr>
        <tr class="no-border">
          <td colspan="19" style="border: none;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 50%;">Unit: ${
                  hiraRegisterData?.locationDetails?.locationName
                }</td>
                <td style="width: 50%;">Department: ${
                  hiraRegisterData?.entityDetails?.entityName
                }</td>
                <td>Date: ${moment(hiraRegisterData.createdAt).format(
                  "DD/MM/YYYY"
                )}</td>
              </tr>
              <tr>
                <td>Job Title: ${hiraRegisterData.jobTitle}</td>
                <td>Section: ${
                  hiraRegisterData?.sectionDetails?.name
                    ? hiraRegisterData?.sectionDetails?.name
                    : hiraRegisterData?.section
                    ? hiraRegisterData?.section
                    : "N/A"
                }</td>

              </tr>
              <tr>
                <td>Hira Number: ${hiraRegisterData?.prefixSuffix || "N/A"}</td>
              </tr>
              <tr>
                <td>Area: ${
                  hiraRegisterData?.areaDetails?.name
                    ? hiraRegisterData?.areaDetails?.name
                    : hiraRegisterData?.area
                    ? hiraRegisterData?.area
                    : "N/A"
                }</td>
                <td>Routine/NonRoutine: ${riskTypeName}</td>
              </tr>
              <tr>
                <td>Assessment Team: ${uniqueAssessmentTeamNames || "N/A"}</td>
                <td>Normal/Abnormal/Emergency: ${conditionName}</td>
              </tr>
              <tr>
                <td>Status: ${status || "N/A"}</td>
              </tr>
              <tr>
                <td>Created By: ${createdByDetails?.fullname || ""}</td>
                <td>Created On: ${createdByDetails?.createdAt || ""}</td>
              </tr>
              <tr>
                <td>Reviewed By: ${reviewedByDetails?.fullname || ""}</td>
                <td>Reviewed On: ${reviewedByDetails?.reviewedOn || ""}</td>
              </tr>
              <tr>
                <td>Approved By: ${approvedByDetails?.fullname || ""}</td>
                <td>Approved On: ${approvedByDetails?.approvedOn || ""}</td>
              </tr>
              <tr>
                <td>Additional Assessment Team: ${
                  hiraRegisterData.additionalAssesmentTeam
                }</td>
                <td>Reason for Revision: ${revisionReason || ""}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr style="border: 1px solid black">
          <th style="border: 1px solid black; padding: 5px;">SN</th>
          <th style="border: 1px solid black; padding: 5px;" colspan="2">Basic Step of the Job</th>
          <th style="border: 1px solid black; padding: 5px;">Hazard(s) associated with the step</th>
          <th style="border: 1px solid black; padding: 5px;">Hazard Description</th>
          <th style="border: 1px solid black; padding: 5px;">Impact</th>
          <th style="border: 1px solid black; padding: 5px; colspan="4">Existing control measure to mitigate hazard</th>
          <th style="border: 1px solid black; padding: 5px;" colspan="3">Pre Mitigation</th>
          <th style="border: 1px solid black; padding: 5px;">Additional Control Measure</th>
          <th style="border: 1px solid black; padding: 5px;">Responsible Person</th>
          <th style="border: 1px solid black; padding: 5px;">Implementation Status</th>
          <th style="border: 1px solid black; padding: 5px;" colspan="3">Residual Score</th>
        </tr>
        <tr style="text-align: center; background-color: #f0f0f0;">
          <th></th>
          <th colspan="2"></th>
          <th></th>
          <th></th>
          <th></th>
          <th></th>
          <th style="border: 1px solid black; padding: 5px;">P</th>
          <th style="border: 1px solid black; padding: 5px;">S</th>
          <th style="border: 1px solid black; padding: 5px;">Pre Score</th>
          <th></th>
          <th></th>
          <th></th>
          <th style="border: 1px solid black; padding: 5px;">P</th>
          <th style="border: 1px solid black; padding: 5px;">S</th>
          <th style="border: 1px solid black; padding: 5px;">Post Score</th>
        </tr>
        ${tableData
          ?.map(
            (item: any, index: any) => `
          <tr>
            <td style="border: 1px solid black; padding: 5px;">${
              parseFloat(item?.subStepNo) > 1.1 ? "" : item?.sNo
            }</td>
            <td style="border: 1px solid black; padding: 5px;" colspan="2">${
              parseFloat(item?.subStepNo) > 1.1 ? "" : item?.jobBasicStep
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.hazardTypeDetails?.name
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.hazardDescription
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.impactText
            }</td>
            <td style="border: 1px solid black; padding: 5px; colspan="4">
              ${item?.existingControl}
            </td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.preProbability || ""
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.preSeverity || ""
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.preMitigationScore || ""
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.additionalControlMeasure || ""
            }</td>
            <td style="border: 1px solid black; padding: 5px;">
            ${
              item?.responsiblePersonDetails?.firstname
                ? item?.responsiblePersonDetails?.firstname +
                  " " +
                  item?.responsiblePersonDetails?.lastname
                : item?.responsiblePerson
                ? item?.responsiblePerson
                : ""
            }
            </td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.implementationStatus || ""
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.postProbability || ""
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.postSeverity || ""
            }</td>
            <td style="border: 1px solid black; padding: 5px;">${
              item?.postMitigationScore || ""
            }</td>
          </tr>
          `
          )
          .join("")}
      </tbody>
    </table>
    <p>Approved through HIIMS Software, Signature not Required!</p>
    <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
      <tbody>
        <tr style="text-align: center;">
          <td>Created By</td>
          <td>${
            createdByDetails?.fullname + "  |  " + createdByDetails?.createdAt
          }</td>
          <td>Reviewed By</td>
          <td>${
            reviewedByDetails?.fullname
              ? reviewedByDetails?.fullname +
                "  |  " +
                reviewedByDetails?.reviewedOn
              : "N/A"
          }</td>
          <td>Approved By</td>
          <td>${
            approvedByDetails?.fullname
              ? approvedByDetails?.fullname +
                "  |  " +
                approvedByDetails?.approvedOn
              : "N/A"
          }</td>
        </tr>
      </tbody>
    </table>
  </div>
`;
};

const isEmpty = (obj: any) => {
  return Object.keys(obj).length === 0;
};

const statusOptions: any = [
  {
    label: "All",
    value: "All",
  },
  {
    label: "Draft",
    value: "DRAFT",
  },
  {
    label: "In Review",
    value: "IN_REVIEW",
  },
  {
    label: "In Approval",
    value: "IN_APPROVAL",
  },
  {
    label: "Approved",
    value: "APPROVED",
  },
  {
    label: "Rejected",
    value: "REJECTED",
  },
];

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: any;
  record: any;
  index: number;
  hazardTypeOptions: any;
  locationWiseUsers: any;
  handleCopyRow: any;
  nestedRowKey: any;
  value: any;
  setValue: any;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  hazardTypeOptions = [],
  handleCopyRow,
  nestedRowKey,
  locationWiseUsers = [],
  value = null,
  setValue,
  ...restProps
}) => {
  let isNotFirstRow = false;

  if (record?.key?.includes("new_")) {
    const parts = record?.key?.split("_");
    const number = parseInt(parts[1]);
    if (!isNaN(number) && number > 0) {
      // Your condition is true
      isNotFirstRow = true;
    } else {
      // console.log("Condition is false");
      isNotFirstRow = false;
    }
  } else {
    // console.log("Condition is false");
    isNotFirstRow = false;
  }
  const handleMouseEnter = (e: any) => {
    e.target.removeAttribute("title");
  };
  // Fields that should not have the required validation
  const optionalFields = [
    "additionalControlMeasure",
    "postProbability",
    "postSeverity",
    "implementationStatus",
    "responsiblePerson",
  ];
  const hazardSelectStyle = {
    width: "100%",
    minWidth: "180px",
    maxWidth: "250px", // Set a maximum width
    // overflow: "hidden", // Hide overflow
    // textOverflow: "ellipsis", // Show ellipsis for overflow
    // whiteSpace: "nowrap", // No wrapping of text to a new line
  };
  // Input node rendering based on the column configuration
  let inputNode = <Input />;
  if (inputType === "number") {
    // console.log("checkrisk data index in editable cell in number input", dataIndex);

    inputNode = (
      <InputNumber size="large" style={{ minHeight: "50px" }} min={1} />
    );
    if (dataIndex === "sNo" && nestedRowKey === record?.key) {
      // console.log("checkrisk insude first column nested row");

      inputNode = <></>;
    } else {
      if (dataIndex === "sNo") {
        inputNode = (
          <InputNumber size="large" style={{ minHeight: "50px" }} min={1} />
        );
      } else {
        // console.log("checkrisknew value in editable cell", value);

        inputNode = (
          <InputNumber
            size="large"
            style={{ minHeight: "50px" }}
            min={1}
            max={5}
            precision={0}
          />
        );
      }
    }
  } else if (inputType === "select" && dataIndex === "hazardType") {
    inputNode = (
      <Select
        showSearch
        size="large"
        placeholder="Select Hazard"
        style={hazardSelectStyle}
        filterOption={(input: string, option: any) =>
          option?.children?.toLowerCase().includes(input.toLowerCase())
        }
        listHeight={200}
      >
        {hazardTypeOptions.map((option: any) => (
          <Option
            key={option.value}
            value={option.value}
            title={option.label.length > 20 ? option.label : " "}
          >
            {option.label}
          </Option>
        ))}
      </Select>
    );
  } else if (inputType === "select" && dataIndex === "responsiblePerson") {
    inputNode = (
      <Select
        showSearch
        size="large"
        placeholder="Select Person"
        options={locationWiseUsers || []}
        // style={{ width: "100%", minWidth: "180px" }}
        style={hazardSelectStyle}
        // className={classes.hazardSelectStyle}

        filterOption={(input: any, option: any) =>
          option?.label?.toLowerCase().indexOf(input?.toLowerCase()) >= 0
        }
        listHeight={200}
      />
    );
  } else if (
    inputType === "textarea" &&
    dataIndex !== "jobBasicStep" &&
    dataIndex !== "hazardType" &&
    dataIndex !== "responsiblePerson"
  ) {
    inputNode = <TextArea style={{ minWidth: "180px" }} />;
  }
  // else if (inputType === "textarea" && dataIndex === "jobBasicStep" && record?.sNo > 1) {
  //   inputNode = (
  //     <div>
  //       <TextArea style={{ minWidth: "180px" }} />
  //       <FileCopyIcon />
  //     </div>
  //   );
  // }

  return (
    <td {...restProps}>
      {editing ? (
        <div style={{ display: "flex", alignItems: "center" }}>
          {nestedRowKey === record?.key && dataIndex === "jobBasicStep" ? (
            <></>
          ) : (
            <Form.Item
              name={dataIndex}
              style={{ margin: 0, flexGrow: 1 }}
              rules={
                optionalFields.includes(dataIndex)
                  ? []
                  : [
                      {
                        required: true,
                        message: `Please Input ${title}!`,
                      },
                    ]
              }
            >
              {inputNode}
            </Form.Item>
          )}
        </div>
      ) : (
        children
      )}
    </td>
  );
};

const HiraRegisterPagev2 = () => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const userDetails = getSessionStorage();
  const orgId = sessionStorage.getItem("orgId");
  const params = useParams<any>();
  const navigate = useNavigate();
  // const isMounted = useRef(true);
  const printRef = useRef<any>(null);

  printRef.current = (htmlReport: any) => {
    printJS({
      type: "raw-html",
      printable: htmlReport,
    });
  };

  const isMR = checkRoles(roles.MR);
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;
  const location = useLocation();

  // console.log("checkrisk ismr iMcoe", isMR || isMCOE ? "true1" : "false0");

  const [tableData, setTableData] = useState<any[]>([]);

  // Inside your component
  const [newRowRef, setNewRowRef] = useState<any>(null);

  const [statusFilter, setStatusFilter] = useState<any>([]);
  const [dateFilter, setDateFilter] = useState<any>("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [existingRiskConfig, setExistingRiskConfig] = useState<any>(null);

  const [search, setSearch] = useState<any>("");

  const [selectedJobTitle, setSelectedJobTitle] = useState<any>(null);

  const [selectedHiraId, setSelectedHiraId] = useState<any>("");

  const [tableDataForReport, setTableDataForReport] = useState<any[]>([]);
  const [hiraInWorkflow, setHiraInWorkflow] = useState<any>({}); //this is for the hira in workflow details

  const [
    consolidatedWorkflowHistoryDrawer,
    setConsolidatedWorkflowHistoryDrawer,
  ] = useState<any>({
    open: false,
    data: hiraInWorkflow,
  });

  const [filterForm] = Form.useForm();
  const [hiraHeaderForm] = Form.useForm();
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  //below states for editable table
  const [hiraForm] = Form.useForm();
  const [hazardTypeOptions, setHazardTypeOptions] = useState<any>([]);
  const [hiraTableData, setHiraTableData] = useState<any>([]); // Initialize with your data
  const [editingKey, setEditingKey] = useState("");
  const [value, setValue] = useState<any>(null);
  // const isEditing = (record: any) => record?.key === editingKey;
  const isEditing = (record: any) =>
    record?.key === editingKey || record?.id === editingKey;

  const [riskTypeOptions, setRiskTypeOptions] = useState<any>([]);
  const [conditionOptions, setConditionOptions] = useState<any>([]);
  const [locationWiseUsers, setLocationWiseUsers] = useState<any>([]);

  const [isNewJob, setIsNewJob] = useState<boolean>(false);
  const [hiraRegisterData, setHiraRegisterData] = useState<any>(null); //this will be first element of array of table data when job title is selected
  const [hiraHeaderFormData, setHiraHeaderFormData] = useState<any>(null); //this will be used to save form details of hira header
  const [isHiraHeaderExist, setIsHiraHeaderExist] = useState<any>(false); //this will be used to save form details of hira header

  const [riskScoreModal, setRiskScoreModal] = useState<any>({
    open: false,
    data: {},
  });

  const [levelColor, setLevelColor] = useState<any>("yellow");
  const [riskScore, setRiskScore] = useState<any>(0);
  const [selectedCell, setSelectedCell] = useState<any>(null);

  const [hiraReviewModal, setHiraReviewModal] = useState<any>({
    open: false,
    data: null,
  }); //this will be used to control review hira modal

  const [hiraReviewHistory, setHiraReviewHistory] = useState<any>(null); //this will be used to control review hira modal
  const [isTableDataLoaded, setIsTableDataLoaded] = useState<boolean>(false);
  const [isHiraReviewHistoryLoaded, setIsHiraReviewHistoryLoaded] =
    useState<boolean>(false);
  const [allowToAddStep, setAllowToAddStep] = useState<boolean>(false);
  // const [isUserFromSameDept, setIsUserFromSameDept] = useState<boolean>(false);
  const [disableStepBtnForDiffDept, setDisableStepBtnForDiffDept] =
    useState<boolean>(false);

  const [showDraftStatus, setShowDraftStatus] = useState<boolean>(false);

  //this object will contain the details of the hira if the hira gets changed after it is approved
  const [hiraInTrackChanges, setHiraInTrackChanges] = useState<any>(null);

  const [allHiraTableData, setAllHiraTableData] = useState<any>([]);
  const [allHiraTableLoading, setAllHiraTableLoading] =
    useState<boolean>(false);
  const [hideHeaderInAllMode, setHideHeaderInAllMode] =
    useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<any>(false); // Add this line to manage submission state
  const [showUpdateButton, setShowUpdateButton] = useState<boolean>(false);
  const [referencesDrawer, setReferencesDrawer] = useState<any>({
    open: false,
    mode: "edit",
    data: {
      id: null,
    },
  });
  //key for references tab
  const [activeKey, setActiveKey] = useState<any>("1");
  const [contentVisible, setContentVisible] = useState<any>(false);
  const [refData, setRefData] = useRecoilState(referencesData);

  //for risk score modal
  const [selectedPreCell, setSelectedPreCell] = useState<any>(null);
  const [selectedPostCell, setSelectedPostCell] = useState<any>(null);

  //for validation help text
  const [showRequireStepMessage, setShowRequireStepMessage] =
    useState<boolean>(false);

  const [locationForSelectedJob, setLocationForSelectedJob] =
    useState<any>(null);
  const [entityForSelectedJob, setEntityForSelectedJob] = useState<any>(null);

  const ref1 = useRef<any>(null);
  const ref2 = useRef<any>(null);
  const ref3 = useRef<any>(null);
  const ref4 = useRef<any>(null);
  const ref5 = useRef<any>(null);

  const ref1ForViewJob = useRef<any>(null);
  const ref2ForViewJob = useRef<any>(null);
  const ref3ForViewJob = useRef<any>(null);
  const ref4ForViewJob = useRef<any>(null);
  const ref5ForViewJob = useRef<any>(null);
  const ref6ForViewJob = useRef<any>(null);
  const ref7ForViewJob = useRef<any>(null);

  const refStartWorkflowButton = useRef<any>(null);
  const refReviseButton = useRef<any>(null);

  const [tourOpen, setTourOpen] = useState<boolean>(false);
  const [isNewJobClicked, setIsNewJobClicked] = useState<boolean>(false);
  const [tourPopoverVisible, setTourPopoverVisible] = useState<boolean>(false);
  const [isSaveClickedForNewJob, setIsSaveClickedForNewJob] =
    useState<boolean>(false);
  const [isAddStepClicked, setIsAddStepClicked] = useState<any>(false);
  const [currentStep, setCurrentStep] = useState<any>(0);

  const [tourOpenForViewJob, setTourOpenForViewJob] = useState<boolean>(false);
  const [isJobSelectedOnTour, setIsJobSelectedOnTour] =
    useState<boolean>(false);

  const [currentStepForViewJobTour, setCurrentStepForViewJobTour] =
    useState<any>(0);

  const [tourOpenForWorkflow, setTourOpenForWorkflow] =
    useState<boolean>(false);
  const [isStartButtonClickedOnTour, setIsStartButtonClickedOnTour] =
    useState<boolean>(false);

  const [currentStepForWorkflow, setCurrentStepForWorkflow] = useState<any>(0);

  const [hazardTypeTableModal, setHazardTypeTableModal] = useState<any>(false);

  const [hazardTypeTableData, setHazardTypeTableData] = useState<any>([]);
  const [entityOptionsForDeptHead, setEntityOptionsFoDeptHead] = useState<any>(
    []
  );
  const [selectedEntityForDeptHead, setSelectedEntityForDeptHead] =
    useState<any>("");

  const [selectedSectionForHeader, setSelectionForHeader] = useState<any>("");

  const [isLoggedInUserDeptHead, setIsLoggedInUserDeptHead] =
    useState<any>(false);

  const [paginationForAll, setPaginationForAll] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [hiraWorkflowCommentsDrawer, setHiraWorkflowCommentsDrawer] =
    useState<any>({
      open: false,
      data: hiraInWorkflow,
    });

  const [isLoading, setIsLoading] = useState<any>(false);
  const [areaOptions, setAreaOptions] = useState<any>([]);
  const [sectionOptions, setSectionOptions] = useState<any>([]);
  const [selectedArea, setSelectedArea] = useState<any>(undefined);
  const [selectedSection, setSelectedSection] = useState<any>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<any>("All");
  const [nestedRowKey, setNestedRowKey] = useState<any>("");

  const [hiraInWorkflowLoading, setHiraInWorkflowLoading] =
    useState<any>(false);

  const [hiraWithStepsLoading, setHiraWithStepsLoading] = useState<any>(false);
  const [hideFilters, setHideFilters] = useState<any>(false);

  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] =
    useState<any>(false);
  const [jobToBeDeleted, setJobToBeDeleted] = useState<any>(null);

  const [changeWorkflowPeopleModal, setChangeWorkflowPeopleModal] =
    useState<any>(false);
  const [selectedHiraData, setSelectedHiraData] = useState<any>(null);
  const [showExportLoader, setShowExportLoader] = useState<any>(false);
  const [logo, setLogo] = useState<any>(null);

  const [selectedDept, setSelectedDept] = useState<any>(null);

  const getLogo = async () => {
    const response = await axios.get(`/api/location/getLogo`);
    setLogo(response.data);
  };

  const steps: TourProps["steps"] = [
    {
      title: "Add New Job",
      description: "Click To Add New Job",
      target: () => (ref1.current ? ref1.current : null),
      onNext: () => {
        // setIsNewJobClicked(true); // Assuming this is needed to display the next button
        setCurrentStep(currentStep + 1); // Move to the next step
      },
      nextButtonProps: {
        style: { display: isNewJobClicked ? "inline" : "none" },
      },
      onPrev: () => {
        setCurrentStep(currentStep - 1); // Move to the previous step
      },
    },
    {
      title: "Header Information",
      description: "Fill All the Required Header Details For HIRA.",
      target: () => (ref2.current ? ref2.current : null),
      onNext: async () => {
        // console.log("checkrisk next button of header info clicked");
        try {
          const res = await hiraHeaderForm.validateFields();
          if (!!res?.jobTitle) {
            // Form is validated, tour can move to the next step

            setCurrentStep(currentStep + 1); // Move to the next step
          }
        } catch (error) {
          // Form is not validated, stay on the same step
          return false; // Return false to prevent the tour from moving to the next step
        }
      },
      onPrev: () => {
        setCurrentStep(currentStep - 1); // Move to the previous step
      },
    },
    {
      title: "Add Step",
      description: "Please Click On Add Step to Add Atleast One Step",
      target: () => (ref3.current ? ref3.current : null),
      onNext: () => {
        // setIsNewJobClicked(true); // Assuming this is needed to display the next button
        setCurrentStep(currentStep + 1); // Move to the next step
      },
      nextButtonProps: {
        style: { display: isAddStepClicked ? "inline" : "none" },
      },
      onPrev: () => {
        setCurrentStep(currentStep - 1); // Move to the previous step
      },
    },
    {
      title: "Step Details",
      description: "Fill All the Required Step Details For HIRA.",
      target: () => (ref4.current ? ref4.current : null),
      onNext: async () => {
        // console.log("checkrisk next button of header info clicked");
        try {
          const res = (await hiraForm.validateFields()) as any;
          if (!!res?.sNo) {
            // Form is validated, tour can move to the next step

            setCurrentStep(currentStep + 1); // Move to the next step
          }
        } catch (error) {
          // Form is not validated, stay on the same step
          return false; // Return false to prevent the tour from moving to the next step
        }
      },
      onPrev: () => {
        setCurrentStep(currentStep - 1); // Move to the previous step
      },
    },
    {
      title: "Submit HIRA",
      description: "Please Click on save icon to Submit HIRA",
      target: () => (ref5.current ? ref5.current : null),
      nextButtonProps: {
        style: { display: isSaveClickedForNewJob ? "inline" : "none" },
      },
      onPrev: () => {
        setCurrentStep(currentStep - 1); // Move to the previous step
      },
    },
  ];

  const stepsForViewJobTour: TourProps["steps"] = [
    {
      title: "Select Job",
      description: "Please Select Any Job from this dropdown",
      target: () => (ref1ForViewJob.current ? ref1ForViewJob.current : null),
      onNext: () => {
        // setIsNewJobClicked(true); // Assuming this is needed to display the next button
        setCurrentStepForViewJobTour(currentStepForViewJobTour + 1); // Move to the next step
      },
      nextButtonProps: {
        style: { display: isJobSelectedOnTour ? "inline" : "none" },
      },
      onPrev: () => {
        setCurrentStepForViewJobTour(currentStepForViewJobTour - 1); // Move to the previous step
      },
    },
    {
      title: "Current Status",
      description:
        "This is Current Status of HIRA, you cannnot add or edit any step while the HIRA is in review or in approval",
      target: () => (ref2ForViewJob.current ? ref2ForViewJob.current : null),
      onNext: async () => {
        setCurrentStepForViewJobTour(currentStepForViewJobTour + 1); // Move to the next step
      },
      onPrev: () => {
        setCurrentStepForViewJobTour(currentStepForViewJobTour - 1); // Move to the previous step
      },
    },
    {
      title: "Header Details",
      description:
        "This is the header information of the HIRA, It will also be disabled while the HIRA is in workflow",
      target: () => (ref2.current ? ref2.current : null),
      onNext: () => {
        setCurrentStepForViewJobTour(currentStepForViewJobTour + 1); // Move to the next step
      },
      onPrev: () => {
        setCurrentStepForViewJobTour(currentStepForViewJobTour - 1); // Move to the previous step
      },
    },
    {
      title: "Step Details",
      description: "This are all the steps of the HIRA",
      target: () => (ref4.current ? ref4.current : null),
      onNext: () => {
        setCurrentStepForViewJobTour(currentStepForViewJobTour + 1); // Move to the next step
        setActiveKey("2");
      },
      onPrev: () => {
        setCurrentStepForViewJobTour(currentStepForViewJobTour - 1); // Move to the previous step
      },
    },
    {
      title: "HIRA Info",
      description:
        "This Info Tabs lists details of creator, reviewer, approver for the HIRA",
      target: () => (ref5ForViewJob.current ? ref5ForViewJob.current : null),
      onNext: () => {
        setCurrentStepForViewJobTour(currentStepForViewJobTour + 1); // Move to the next step
        setActiveKey("3");
      },
      onPrev: () => {
        setCurrentStepForViewJobTour(currentStepForViewJobTour - 1); // Move to the previous step
      },
    },
    {
      title: "HIRA References",
      description:
        "This References Tab Allows You to link HIRA with SOP, clause, etc!",
      target: () => (ref6ForViewJob.current ? ref6ForViewJob.current : null),
      onNext: () => {
        setCurrentStepForViewJobTour(currentStepForViewJobTour + 1); // Move to the next step
        setActiveKey("4");
      },
      onPrev: () => {
        setCurrentStepForViewJobTour(currentStepForViewJobTour - 1); // Move to the previous step
      },
    },
    {
      title: "HIRA Revision History",
      description: "This Revision Tab lists all the revisions of the HIRA",
      target: () => (ref7ForViewJob.current ? ref7ForViewJob.current : null),
      onNext: () => {
        setCurrentStepForViewJobTour(currentStepForViewJobTour + 1); // Move to the next step
      },
      onPrev: () => {
        setCurrentStepForViewJobTour(currentStepForViewJobTour - 1); // Move to the previous step
      },
    },
  ];

  const stepsForWorkflowTour: TourProps["steps"] = [
    {
      title: "Select Job",
      description: "Please Select Any Job from this dropdown",
      target: () => (ref1ForViewJob.current ? ref1ForViewJob.current : null),
      onNext: () => {
        // setIsNewJobClicked(true); // Assuming this is needed to display the next button
        setCurrentStepForWorkflow(currentStepForWorkflow + 1); // Move to the next step
      },
      nextButtonProps: {
        style: { display: isJobSelectedOnTour ? "inline" : "none" },
      },
      onPrev: () => {
        setCurrentStepForWorkflow(currentStepForWorkflow - 1); // Move to the previous step
      },
    },
    {
      title: "Start Workflow",
      description:
        "Click this Button to Send the HIRA for workflow (Review/Approval)",
      target: () =>
        refStartWorkflowButton.current
          ? refStartWorkflowButton.current
          : refReviseButton?.current
          ? refReviseButton?.current
          : null,
      nextButtonProps: {
        style: { display: "none" },
      },
      onNext: async () => {
        setCurrentStepForWorkflow(currentStepForWorkflow + 1); // Move to the next step
      },
      onPrev: () => {
        setCurrentStepForWorkflow(currentStepForWorkflow - 1); // Move to the previous step
      },
    },
  ];
  const [riskScores, setRiskScores] = useState<any>({});

  // Debounced state update
  const updateRiskScores = React.useCallback(
    _.debounce((key, field, value) => {
      setRiskScores((prevScores: any) => {
        const updatedScores = { ...prevScores };
        if (!updatedScores[key]) {
          updatedScores[key] = {};
        }
        updatedScores[key][field] = value;

        // Calculate preMitigationScore
        if (
          updatedScores[key].preProbability &&
          updatedScores[key].preSeverity
        ) {
          updatedScores[key].preMitigationScore =
            updatedScores[key].preProbability * updatedScores[key].preSeverity;
        } else {
          updatedScores[key].preMitigationScore = "";
        }

        // Calculate postMitigationScore
        if (
          updatedScores[key].postProbability &&
          updatedScores[key].postSeverity
        ) {
          updatedScores[key].postMitigationScore =
            updatedScores[key].postProbability *
            updatedScores[key].postSeverity;
        } else {
          updatedScores[key].postMitigationScore = "";
        }

        return updatedScores;
      });
    }, 200),
    []
  );

  useEffect(() => {
    if (!isLoggedInUserDeptHead) {
      getSectionOptions(userDetails?.entity?.id);
    }
  }, [isLoggedInUserDeptHead]);

  // Effect to scroll to the new row when newRowRef changes and is not null
  useEffect(() => {
    if (newRowRef && newRowRef?.current) {
      newRowRef?.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [newRowRef]);

  useEffect(() => {
    getLogo();
    const newRowElement = document?.querySelector(".new-row");
    if (newRowElement) {
      newRowElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [hiraTableData]);

  useEffect(() => {
    if (!!hiraHeaderFormData && !isNewJob) {
      setShowUpdateButton(true);
    }
  }, [hiraHeaderFormData]);

  // useEffect(() => {
  //   if(!params?.entityId
  //   ){
  //     getHiraList(
  //       1,
  //       10,
  //       userDetails?.location?.id,
  //       userDetails?.entity?.id,
  //       "",
  //       "",
  //       "All",
  //       true,
  //     );
  //     getAllLocations();
  //     getAllDepartmentsByLocation(userDetails?.location?.id);

  //   hideHeaderInAllMode && setSelectedJobTitle("All");
  //     checkIfUserIsMultiDeptHead();
  //   }
  //   if (userDetails?.location?.id) {
  //     setSelectedLocation(userDetails?.location?.id);
  //     getAllAreaMaster(userDetails?.location?.id);
  //   }
  //   if (userDetails?.entity?.id && !location.pathname.includes("HIRA/")) {
  //     setSelectedEntity(userDetails?.entity?.id);
  //   }
  //   getHazardTypeOptions();
  //   fetchHiraConfig();
  //   fetchUsersByLocation();
  // }, []);

  useEffect(() => {
    // console.log("checkrisk selectedPostCell riskScoreModal", riskScoreModal);
    if (riskScoreModal?.riskId && selectedPostCell?.length === 2) {
      const updatedTableData = hiraTableData?.map((row: any) => {
        if (row.id === riskScoreModal?.riskId) {
          return {
            ...row,
            postSeverity: selectedPostCell[0] + 1,
            postProbability: selectedPostCell[1] + 1,
          };
        }
        return row;
      });
      setHiraTableData(updatedTableData);
      let currentRow = updatedTableData?.find(
        (row: any) => row.id === riskScoreModal?.riskId
      );
      edit(currentRow);
    }
  }, [selectedPostCell]);

  useEffect(() => {
    if (riskScoreModal?.riskId && selectedPreCell?.length === 2) {
      const updatedTableData = hiraTableData?.map((row: any) => {
        if (row.id === riskScoreModal?.riskId) {
          return {
            ...row,
            preSeverity: selectedPreCell[0] + 1,
            preProbability: selectedPreCell[1] + 1,
          };
        }
        return row;
      });
      setHiraTableData(updatedTableData);
      let currentRow = updatedTableData?.find(
        (row: any) => row.id === riskScoreModal?.riskId
      );
      edit(currentRow);
      // Update the state or do whatever is needed with the updatedTableData
      console.log("Updated Table Data:", updatedTableData);
    }
  }, [selectedPreCell]);

  useEffect(() => {
    if (hiraTableData?.length === 0 && !!isNewJob) {
      if (
        !!hiraHeaderFormData?.jobTitle &&
        !!hiraHeaderFormData?.area &&
        // !!hiraHeaderFormData?.entity &&
        !!hiraHeaderFormData?.riskType &&
        !!hiraHeaderFormData?.condition &&
        !!hiraHeaderFormData?.assesmentTeam
      ) {
        setShowRequireStepMessage(true);
        setAllowToAddStep(true);
      }
    }
  }, [hiraHeaderFormData]);

  useEffect(() => {
    const fetchInitialDepartmentData = async () => {
      await fetchInitialDepartment(userDetails?.entity?.id);
    }
    if (params && params?.hiraId) {
      setHiraWithStepsLoading(true);
      switchToHiraWithStepsView(params?.hiraId);
    } else {
      fetchInitialDepartmentData();
      if (location?.state?.filters) {
        switchToJobPageWithAppliedFilters(location?.state?.filters);
      } else {
        switchToJobPage();
      }
    }
  }, [params]);

  const switchToHiraWithStepsView = (hiraId: string) => {
    getHazardTypeOptions();
    fetchHiraConfig();
    fetchUsersByLocation();
    setHideFilters(true);
    setSelectedHiraId(hiraId);
    setShowRequireStepMessage(false);
    setEditingKey("");
    //clear all hira table data
    setAllHiraTableData([]);
    setPaginationForAll((prev) => ({ ...prev, total: 0 }));
    setHideHeaderInAllMode(false);
    setShowUpdateButton(true);
    setSearch("");
    getHiraWithSteps(hiraId, 1, 10);
  };

  const checkIfUserIsMultiDeptHead = async () => {
    try {
      const res = await axios.get(
        `/api/riskregister/checkIfUserIsMultiDeptHead?orgId=${userDetails?.organizationId}&userId=${userDetails?.id}`
      );

      if (res.status === 200) {
        console.log(
          "checkrisknew res in checkIfUserIsMultiDeptHead ----->",
          res
        );
        if (res.data?.length) {
          setEntityOptionsFoDeptHead(
            res.data.map((item: any) => ({
              ...item,
              label: item?.entityName,
              value: item?.id,
            }))
          );
          setIsLoggedInUserDeptHead(true);
        } else {
          setEntityOptionsFoDeptHead([]);
          setIsLoggedInUserDeptHead(false);
          // getSectionOptions(userDetails?.entity?.id);
        }
      } else {
        setEntityOptionsFoDeptHead([]);
        setIsLoggedInUserDeptHead(false);
        // getSectionOptions(userDetails?.entity?.id);
      }
    } catch (error) {
      setEntityOptionsFoDeptHead([]);
      setIsLoggedInUserDeptHead(false);
      console.log("error in checkIfUserIsMultiDeptHead-->", error);
    }
  };
  const handleChangePageNewForAll = (page: number, pageSize: number) => {
    console.log(
      "checkrisknew in handleChangepagenew for all page",
      page,
      pageSize
    );
    setPaginationForAll((prev) => ({
      // ...prev,
      current: page,
      pageSize: pageSize,
      total: prev.total,
    }));
    getHiraList(
      page,
      pageSize,
      selectedLocation,
      selectedEntity,
      selectedArea,
      selectedSection,
      selectedStatus,
      true
    );
  };

  const getHiraList = async (
    page: any = 1,
    pageSize: any = 10,
    locationId = "",
    entityId = "",
    area = "",
    section = "",
    workflowStatus = "All",
    pagination = true
  ) => {
    console.log("checkrisknew page pageSize in getHiraList", page, pageSize);

    try {
      setAllHiraTableLoading(true);
      let query = `/api/riskregister/hira/getHiraList/${orgId}?`;
      if (pagination) {
        query += `page=${page}&pageSize=${pageSize}`;
      }
      if (entityId) {
        query += `&entityId=${entityId}`;
      }
      if (locationId) {
        query += `&locationId=${locationId}`;
      }
      if (area) {
        query += `&area=${area}`;
      }
      if (section) {
        query += `&section=${section}`;
      }
      if (!!workflowStatus && workflowStatus !== "All") {
        query += `&workflowStatus=${workflowStatus}`;
      }
      if (search) {
        query += `&search=${search}`;
      }

      const res = await axios.get(query);
      // console.log("checkrisk3 res in getHiraList", res);

      if (res.status === 200 || res.status === 201) {
        if (!!res.data && !!res.data?.list?.length) {
          setAllHiraTableData(res.data?.list);
          console.log(
            "checkrisknew paginationforall in gethiralist",
            paginationForAll
          );

          setPaginationForAll((prev) => ({
            ...prev,
            total: res.data.total,
          }));
          setHideHeaderInAllMode(true);
          setAllHiraTableLoading(false);
        } else {
          setAllHiraTableData([]);
          setPaginationForAll((prev) => ({ ...prev, total: 0 }));
          setHideHeaderInAllMode(true);
          setAllHiraTableLoading(false);
        }
      } else {
        setAllHiraTableData([]);
        setPaginationForAll((prev) => ({ ...prev, total: 0 }));
        setHideHeaderInAllMode(true);
        enqueueSnackbar("Error in fetching HIRA list", {
          variant: "error",
        });
        setAllHiraTableLoading(false);
      }
    } catch (error) {
      console.log("checkrisk3 error in getHiraList-->", error);
      setAllHiraTableLoading(false);
    }
  };

  const fetchHiraReviewHistory = async (jobTitle: any) => {
    try {
      //console.log("checkrisknew jobTitle in fetchHiraReviewHistory", jobTitle);

      const res = await axios.get(
        `/api/riskregister/hira-register/fetchReviewHistory/${jobTitle}/${userDetails?.organizationId}`
      );
      // console.log("checkrisk res in fetchHiraReviewHistory", res);

      if (res.status === 200) {
        setHiraReviewHistory(res?.data);
        setIsHiraReviewHistoryLoaded(true);
      } else {
        setIsHiraReviewHistoryLoaded(false);
      }
    } catch (error) {
      console.log("error in fetchHiraReviewHistory", error);
    }
  };

  const getHazardTypeOptions = async () => {
    try {
      const res = await axios.get(
        `api/riskconfig/getHiraTypes?locationId=${userDetails?.location?.id}&type=hazard&orgId=${userDetails?.organizationId}&master=true`
      );
      // console.log("checkrisk res in getHazardTypeOptions", res);
      if (res.status === 200) {
        if (res?.data && !!res?.data?.data?.length) {
          const hazardTypeOptions = res?.data?.data?.map((hazard: any) => ({
            label: hazard.name,
            value: hazard._id,
          }));
          setHazardTypeOptions(hazardTypeOptions);
          setHazardTypeTableData(res?.data?.data);
        } else {
          setHazardTypeOptions([]);
          setHazardTypeTableData([]);

          enqueueSnackbar("No Hazard Types found for HIRA config", {
            variant: "warning",
          });
        }
      } else {
        setHazardTypeOptions([]);
        setHazardTypeTableData([]);

        enqueueSnackbar("Something went wrong while fetching hazard types", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while fetching hazard types", {
        variant: "error",
      });
      // console.log("checkrisk error in getHiraTypesOptions ", error);
    }
  };

  const getAllAreaMaster = async (locationId: any) => {
    try {
      const res = await axios.get(
        `api/riskconfig/getAllAreaMaster?locationId=${locationId}&orgId=${userDetails?.organizationId}&master=true`
      );
      // console.log("checkrisk res in getHazardTypeOptions", res);
      if (res.status === 200) {
        if (res?.data && !!res?.data?.data?.length) {
          const hazardTypeOptions = res?.data?.data?.map((hazard: any) => ({
            label: hazard.name,
            value: hazard._id,
          }));
          setAreaOptions(hazardTypeOptions);
        } else {
          setAreaOptions([]);

          enqueueSnackbar("No Area Master found for HIRA config", {
            variant: "warning",
          });
        }
      } else {
        setAreaOptions([]);

        enqueueSnackbar("Something went wrong while fetching Area Master", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while fetching Area Master", {
        variant: "error",
      });
      // console.log("checkrisk error in getHiraTypesOptions ", error);
    }
  };

  const fetchInitialDepartment = async (id: string) => {
    try {
      const res = await axios.get(`/api/entity/getSelectedEntity/${id}`);
      const entity = res.data;

      setSelectedDept({
        id: entity.id,
        name: entity.entityName,
        type: entity?.entityType?.name,
      });
    } catch (error) {
      // console.error("Failed to fetch initial department:", error);
    }
  };

  const fetchUsersByLocation = async () => {
    const locationId = userDetails.locationId || "";
    try {
      // setIsLoading(true);
      const res = await axios.get(
        `/api/riskregister/users/${userDetails?.organizationId}`
      );
      // console.log("checkrisk res", res);
      if (res.status === 200 || res.status === 201) {
        if (!!res.data && res.data.length > 0) {
          const userOptions = res.data.map((user: any) => ({
            userId: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            value: user.id,
            label: user.email,
            email: user.email,
            id: user.id,
            fullname: user.firstname + " " + user.lastname,
            // label : user.firstname + " " + user.lastname,
            // // name : user.firstname + " " + user.lastname,
            // value : user.id,
          }));
          setLocationWiseUsers(userOptions);
          // setIsLoading(false);
        } else {
          setLocationWiseUsers([]);
          // setIsLoading(false);
        }
      } else {
        setLocationWiseUsers([]);
        // setIsLoading(false);
      }
    } catch (error) {
      // setIsLoading(false);
      // console.log("errror in fetching users based on location", error);
    }
  };

  const editForNewStep = (record: any) => {
    // console.log("checkrisk3 edit for new step gets called -->");

    hiraForm.setFieldsValue({
      sNo: record?.sNo,
      // subStepNo : "1.1",
      jobBasicStep: record?.jobBasicStep,
      hazardType: "",
      impactText: "",
      hazardDescription: "",
      existingControl: "",
      preProbability: "",
      preSeverity: "",
      preMitigationScore: "",
      additionalControlMeasure: "",
      responsiblePerson: "",
      implementationStatus: "",
      postProbability: "",
      postSeverity: "",
      postMitigationScore: "",
      // ...record,
    });
    setEditingKey(record?.key);
  };

  const edit = (record: any) => {
    console.log("checkrisk record in edit", record);
    // console.log("checkrisk hiraInWokflow", hiraInWorkflow);

    hiraForm.setFieldsValue({
      sNo: record?.sNo,
      subStepNo: record?.subStepNo,
      jobBasicStep: record?.jobBasicStep,
      hazardType: record?.hazardTypeDetails?._id,
      impactText: record?.impactText,
      hazardDescription: record?.hazardDescription,
      existingControl: record?.existingControl,
      preProbability: record?.preProbability,
      preSeverity: record?.preSeverity,
      preMitigationScore: record?.preMitigationScore,
      additionalControlMeasure: record?.additionalControlMeasure,
      responsiblePerson: record?.responsiblePerson,
      implementationStatus: record?.implementationStatus,
      postProbability: record?.postProbability,
      postSeverity: record?.postSeverity,
      postMitigationScore: record?.postMitigationScore,
      // ...record,
    });
    setEditingKey(record?.key);
  };

  const save = async (key: any) => {
    console.log("checkrisknew in save row-->", await hiraForm.validateFields());

    if (isSubmitting) return; // Prevent function execution if already submitting

    // setIsSubmitting(true); // Disable further submissions
    try {
      // console.log("checkrisk hiraForm in save key", key);
      await hiraHeaderForm.validateFields();
      const row = (await hiraForm.validateFields()) as any;
      setTourOpen(false);
      setTourPopoverVisible(false);
      // console.log("checkrisk row in save", row);
      setShowRequireStepMessage(false);
      if (
        row?.preProbability * row?.preSeverity >= 8 &&
        (!row?.additionalControlMeasure ||
          !row?.responsiblePerson ||
          !row?.implementationStatus ||
          !row?.postProbability ||
          !row?.postSeverity)
      ) {
        enqueueSnackbar(
          "HIRA is significant, please Add Additional Control Measure",
          {
            variant: "warning",
          }
        );
        // return;

        let errors = [];

        if (row?.preProbability * row?.preSeverity >= 3) {
          if (!row?.additionalControlMeasure) {
            errors.push({
              name: "additionalControlMeasure",
              errors: ["Please Input Measure"],
            });
          }
          // Repeat for other fields
          if (!row?.responsiblePerson) {
            errors.push({
              name: "responsiblePerson",
              errors: ["Please Input Person"],
            });
          }

          if (!row?.implementationStatus) {
            errors.push({
              name: "implementationStatus",
              errors: ["Please Input Status"],
            });
          }

          if (!row?.postProbability) {
            errors.push({
              name: "postProbability",
              errors: ["Please Input P"],
            });
          }

          if (!row?.postSeverity) {
            errors.push({
              name: "postSeverity",
              errors: ["Please Input S"],
            });
          }
          // Add similar checks for postProbability, postSeverity, and implementationStatus

          if (errors.length > 0) {
            hiraForm.setFields(errors);
            setIsSubmitting(false); // Re-enable submission for future attempts
            return; // Stop the save function if there are errors
          }
        }
      }
      const newData: any = [...hiraTableData];

      const index = newData.findIndex((item: any) => key === item.key);
      // console.log("checkrisk3 row in save", row);

      if (index > -1) {
        // console.log("checkrisk save called");

        const item: any = newData[index];
        // console.log("checkrisk3 item in save", item);

        const previousRow = index > 0 ? newData[index - 1] : null;
        const jobBasicStepValue = previousRow ? previousRow.jobBasicStep : ""; // Use the jobBasicStep from the previous row
        const subStepNo = item?.subStepNo || "1.1";
        // Find the label for the selected hazard type
        const selectedHazardOption = hazardTypeOptions.find(
          (option: any) => option.value === row.hazardType
        );
        const hazardName = selectedHazardOption
          ? selectedHazardOption.label
          : "N/A";

        newData.splice(index, 1, {
          ...item,
          ...row,
          hazardName, // Save the label as hazardName
          preMitigationScore: row.preProbability * row.preSeverity, // Computed field
          postMitigationScore:
            row?.postProbability && row?.postSeverity
              ? row.postProbability * row.postSeverity
              : "",
        });

        if (hiraTableData?.length > 1) {
          // console.log("checkrisk3 call just create step api", hiraTableData)
          if (!!nestedRowKey && nestedRowKey === key) {
            // console.log("checkrisk3 call just create hira api", hiraTableData)
            handlePostNewStep({
              ...row,
              jobBasicStep: jobBasicStepValue,
              subStepNo: subStepNo,
            });
          } else {
            handlePostNewStep({ ...row, subStepNo: subStepNo });
          }
        } else {
          if (!!nestedRowKey && nestedRowKey === key) {
            // console.log("checkrisk3 call just create hira api", hiraTableData)
            handlePostBasicStepNew({
              ...row,
              jobBasicStep: jobBasicStepValue,
              subStepNo: subStepNo,
            });
          } else {
            handlePostBasicStepNew({ ...row, subStepNo: subStepNo });
          }
        }
      } else {
        newData.push(row);
        setHiraTableData(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    } finally {
      setIsSubmitting(false); // Re-enable submissions regardless of outcome
    }
  };

  const saveForOldEntry = async (key: any) => {
    try {
      const row = (await hiraForm.validateFields()) as any;
      if (
        row?.preProbability * row?.preSeverity >= 8 &&
        (!row?.additionalControlMeasure ||
          !row?.responsiblePerson ||
          !row?.implementationStatus ||
          !row?.postProbability ||
          !row?.postSeverity)
      ) {
        enqueueSnackbar(
          "HIRA is significant, please Add Additional Control Measure",
          {
            variant: "warning",
          }
        );
        // return;

        let errors = [];

        if (row?.preProbability * row?.preSeverity >= 3) {
          if (!row?.additionalControlMeasure) {
            errors.push({
              name: "additionalControlMeasure",
              errors: ["Please Input Measure"],
            });
          }
          // Repeat for other fields
          if (!row?.responsiblePerson) {
            errors.push({
              name: "responsiblePerson",
              errors: ["Please Input Person"],
            });
          }

          if (!row?.implementationStatus) {
            errors.push({
              name: "implementationStatus",
              errors: ["Please Input Status"],
            });
          }

          if (!row?.postProbability) {
            errors.push({
              name: "postProbability",
              errors: ["Please Input P"],
            });
          }

          if (!row?.postSeverity) {
            errors.push({
              name: "postSeverity",
              errors: ["Please Input S"],
            });
          }
          // Add similar checks for postProbability, postSeverity, and implementationStatus

          if (errors.length > 0) {
            hiraForm.setFields(errors);
            setIsSubmitting(false); // Re-enable submission for future attempts
            return; // Stop the save function if there are errors
          }
        }
      }
      const newData: any = [...hiraTableData];
      const index = newData.findIndex((item: any) => key === item.key);
      const currentRow = newData[index];
      if (index > -1) {
        const item: any = newData[index];
        const rowData = hiraTableData[index];
        // console.log("checkrisk row data in save", row);

        // Find the label for the selected hazard type
        const selectedHazardOption = hazardTypeOptions.find(
          (option: any) => option.value === row.hazardType
        );
        const hazardName = selectedHazardOption
          ? selectedHazardOption.label
          : "N/A";

        newData.splice(index, 1, {
          ...item,
          ...row,
          hazardName, // Save the label as hazardName
          preMitigationScore: row.preProbability * row.preSeverity, // Computed field
          postMitigationScore:
            row?.postProbability && row?.postSeverity
              ? row.postProbability * row.postSeverity
              : "",
        });
        handleUpdateStepDetails(
          { ...row, subStepNo: currentRow?.subStepNo },
          key
        );
        setHiraTableData(newData);
        setEditingKey("");
      } else {
        newData.push(row);
        setHiraTableData(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const getHiraWithSteps = async (
    hiraId: any,
    page: any = 1,
    pageSize: any = 10,
    searchParam = ""
  ) => {
    try {
      setHiraWithStepsLoading(true);
      let query: any = `/api/riskregister/hira/getHiraWithSteps/${hiraId}?`;
      if (page && pageSize) {
        query += `&page=${page}&pageSize=${pageSize}`;
      }
      if (searchParam) {
        query += `&search=${searchParam}`;
      }
      // console.log("checkriske query in getHiraWithSteps", query);

      const res = await axios.get(query);

      // console.log("checkrisk3 res in getHiraWithSteps", res);
      if (res?.status === 200) {
        if (res?.data?.steps && res?.data?.steps?.length) {
          let hiraDetails = res?.data?.hira;
          await fetchInitialDepartment(hiraDetails?.entityId);
          getSectionOptions(hiraDetails?.entityId);
          getAllAreaMaster(hiraDetails?.locationId);
          hiraHeaderForm?.setFieldsValue({
            jobTitle: hiraDetails?.jobTitle,
            area: hiraDetails?.area,
            section: hiraDetails?.section,
            riskType: hiraDetails?.riskType,
            condition: hiraDetails?.condition,
            assesmentTeam: hiraDetails?.assesmentTeam,
            additionalAssesmentTeam: hiraDetails?.additionalAssesmentTeam,
          });
          setHiraHeaderFormData({
            jobTitle: hiraDetails?.jobTitle,
            area: hiraDetails?.area,
            section: hiraDetails?.section,
            entity: hiraDetails?.entityId,
            riskType: hiraDetails?.riskType,
            condition: hiraDetails?.condition,
            assesmentTeam: hiraDetails?.assesmentTeam,
            additionalAssesmentTeam: hiraDetails?.additionalAssesmentTeam,
          });
          setHiraRegisterData(res?.data?.hira);

          if (hiraDetails?.workflowStatus === "DRAFT") {
            setShowDraftStatus(true);
          }

          setLocationForSelectedJob(hiraDetails?.locationDetails);
          setEntityForSelectedJob(hiraDetails?.entityDetails?.id);
          const stepsData = res?.data?.steps?.map((obj: any) => ({
            ...obj,
            id: obj?._id,
            key: obj?._id,
            sNo: obj?.sNo,
            subStepNo: obj?.subStepNo,
            isOldEntry: true,
            highlight: false,
            hazardName: obj?.hazardTypeDetails?.name,
            responsiblePersonName: obj?.responsiblePerson
              ? obj?.responsiblePersonDetails?.firstname +
                " " +
                obj?.responsiblePersonDetails?.lastname
              : "",
          }));
          setHiraTableData([...stepsData]);
          setIsTableDataLoaded(true);
          setHideHeaderInAllMode(false);
          setPagination((prev) => ({
            ...prev,
            total: res?.data?.stepsCount, // Ensure backend sends correct updated count
            current: page, // Maintain current page correctly
            pageSize: pageSize, // Maintain page size correctly
          }));

          //set Risk Scores to automatically calculate the risk scores when user is changing the score
          // Initialize risk scores
          let initialRiskScores: any = {};
          stepsData.forEach((step: any) => {
            initialRiskScores[step.key] = {
              preProbability: step.preProbability || "",
              preSeverity: step.preSeverity || "",
              preMitigationScore:
                step.preProbability && step.preSeverity
                  ? step.preProbability * step.preSeverity
                  : "",
              postProbability: step.postProbability || "",
              postSeverity: step.postSeverity || "",
              postMitigationScore:
                step.postProbability && step.postSeverity
                  ? step.postProbability * step.postSeverity
                  : "",
            };
          });
          setRiskScores(initialRiskScores);

          setHiraWithStepsLoading(false);
        }
      }
    } catch (error: any) {
      setHiraWithStepsLoading(false);
      if (error?.response) {
        // Request was made, server responded with a status code out of the range of 2xx
        // console.log("Error response data:", error.response.data);
        // console.log("Error response status:", error.response.status);
        // console.log("Error response headers:", error.response.headers);
        if (error.response.status === 404) {
          enqueueSnackbar("HIRA Not Found!", {
            variant: "error",
          });
          navigate("/risk/riskregister/HIRA");
          switchToJobPage();
        }
      } else {
        // Something else happened while making the request
        console.log("Error message:", error.message);
        enqueueSnackbar("Something went wrong while fetching HIRA", {
          variant: "error",
        });
        navigate("/risk/riskregister/HIRA");
      }
      console.log("Error config:", error.config);
    }
  };

  const getAllHiraWithStepsForExport = async (
    hiraId: any,
    page: any = 1,
    pageSize: any = 300,
    searchParam = ""
  ) => {
    try {
      setShowExportLoader(true);
      let query: any = `/api/riskregister/hira/getHiraWithSteps/${hiraId}?`;
      if (page && pageSize) {
        query += `&page=${page}&pageSize=${pageSize}`;
      }
      if (searchParam) {
        query += `&search=${searchParam}`;
      }
      const res = await axios.get(query);

      // console.log("checkrisk3 res in getHiraWithSteps", res);
      if (res?.status === 200) {
        if (res?.data?.steps && res?.data?.steps?.length) {
          let hiraDetails = res?.data?.hira;

          const stepsData = res?.data?.steps?.map((obj: any) => ({
            ...obj,
            id: obj?._id,
            key: obj?._id,
            sNo: obj?.sNo,
            subStepNo: obj?.subStepNo,
            isOldEntry: true,
            highlight: false,
            hazardName: obj?.hazardTypeDetails?.name,
            responsiblePersonName: obj?.responsiblePerson
              ? obj?.responsiblePersonDetails?.firstname +
                " " +
                obj?.responsiblePersonDetails?.lastname
              : "",
          }));
          setShowExportLoader(false);

          return {
            hira: hiraDetails,
            steps: stepsData,
          };
        }
      }
    } catch (error: any) {
      setHiraWithStepsLoading(false);
      setShowExportLoader(false);

      if (error?.response) {
        // Request was made, server responded with a status code out of the range of 2xx
        // console.log("Error response data:", error.response.data);
        // console.log("Error response status:", error.response.status);
        // console.log("Error response headers:", error.response.headers);
        if (error.response.status === 404) {
          enqueueSnackbar("HIRA Not Found!", {
            variant: "error",
          });

          navigate("/risk/riskregister/HIRA");
          switchToJobPage();
        }
      } else {
        // Something else happened while making the request
        console.log("Error message:", error.message);
        enqueueSnackbar("Something went wrong while fetching HIRA", {
          variant: "error",
        });
        navigate("/risk/riskregister/HIRA");
      }
      setShowExportLoader(false);
      console.log("Error config:", error.config);
    }
  };

  const handleUpdateStepDetails = async (newData: any, stepId: any) => {
    try {
      const validateBasicStep = isValid(trimText(newData?.jobBasicStep));
      if (!validateBasicStep?.isValid) {
        enqueueSnackbar(
          `Please Enter Valid Basic Step ${validateBasicStep?.errorMessage}`,
          {
            variant: "warning",
          }
        );
        return;
      }

      const validateHazardDescription = isValidForHiraPage(
        trimText(newData?.hazardDescription)
      );
      if (!validateHazardDescription?.isValid) {
        enqueueSnackbar(
          `Please Enter Valid Hazard Description ${validateHazardDescription?.errorMessage}`,
          {
            variant: "warning",
          }
        );
        return;
      }

      if (!!newData?.impactText) {
        const validateImpactText = isValidForHiraPage(
          trimText(newData?.impactText)
        );
        if (!validateImpactText?.isValid) {
          enqueueSnackbar(
            `Please Enter Valid Impact Text ${validateImpactText?.errorMessage}`,
            {
              variant: "warning",
            }
          );
          return;
        }
      }

      if (!!newData?.existingControl) {
        const validateExistingControl = isValidForHiraPage(
          trimText(newData?.existingControl)
        );
        if (!validateExistingControl?.isValid) {
          enqueueSnackbar(
            `Please Enter Valid Existing Control ${validateExistingControl?.errorMessage}`,
            {
              variant: "warning",
            }
          );
          return;
        }
      }

      if (!!newData?.additionalControlMeasure) {
        const validateAdditionalControlMeasure = isValidForHiraPage(
          trimText(newData?.additionalControlMeasure)
        );
        if (!validateAdditionalControlMeasure?.isValid) {
          enqueueSnackbar(
            `Please Enter Valid Additional Control Measure ${validateAdditionalControlMeasure?.errorMessage}`,
            {
              variant: "warning",
            }
          );
          return;
        }
      }
      let stepsData: any = {
        sNo: newData?.sNo,
        subStepNo: newData?.subStepNo,
        jobBasicStep: trimText(newData?.jobBasicStep) || "",
        hazardType: newData?.hazardType,
        hazardDescription: trimText(newData?.hazardDescription),
        impactText: trimText(newData?.impactText) || "",
        existingControl: trimText(newData?.existingControl),
        preSeverity: newData?.preSeverity,
        preProbability: newData?.preProbability,
        preMitigationScore: newData?.preProbability * newData?.preSeverity,
        additionalControlMeasure: trimText(newData?.additionalControlMeasure),
        responsiblePerson: newData?.responsiblePerson,
        implementationStatus: trimText(newData?.implementationStatus),
        postMitigationScore: newData?.postProbability * newData?.postSeverity,
        postSeverity: newData?.postSeverity,
        postProbability: newData?.postProbability,
      };

      if (hiraRegisterData?.workflowStatus === "APPROVED") {
        stepsData = {
          ...stepsData,
          workflowStatus: "DRAFT",
          hiraId: hiraRegisterData?._id,
        };
      }

      const response = await axios.put(
        `/api/riskregister/hira/updateHiraStep/${stepId}`,
        stepsData
      );
      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar("Step Updated Successfully", {
          variant: "success",
        });
        getHiraWithSteps(
          selectedHiraId,
          pagination?.current,
          pagination?.pageSize
        );
        setIsHiraHeaderExist(true);
        setEditingKey("");
      } else {
        setIsHiraHeaderExist(false);
      }
    } catch (error) {
      console.log("checkrisk3 error in handleUpdateStepDetails", error);
    }
  };

  const handlePostBasicStepNew = async (newData: any) => {
    try {
      const validateJobTitle = isValid(trimText(hiraHeaderFormData?.jobTitle));
      if (!validateJobTitle?.isValid) {
        enqueueSnackbar(
          `Please Enter Valid Title ${validateJobTitle?.errorMessage}`,
          {
            variant: "warning",
          }
        );
        return;
      }

      const validateBasicStep = isValid(trimText(newData?.jobBasicStep));
      if (!validateBasicStep?.isValid) {
        enqueueSnackbar(
          `Please Enter Valid Basic Step ${validateBasicStep?.errorMessage}`,
          {
            variant: "warning",
          }
        );
        return;
      }

      if (!!hiraHeaderFormData?.additionalAssesmentTeam) {
        const validateAdditionalAssesmentTeam = isValid(
          trimText(hiraHeaderFormData?.additionalAssesmentTeam)
        );
        if (!validateAdditionalAssesmentTeam?.isValid) {
          enqueueSnackbar(
            `Please Enter Valid Additional Assesment Team ${validateAdditionalAssesmentTeam?.errorMessage}`,
            {
              variant: "warning",
            }
          );
          return;
        }
      }

      const validateHazardDescription = isValidForHiraPage(
        trimText(newData?.hazardDescription)
      );
      if (!validateHazardDescription?.isValid) {
        enqueueSnackbar(
          `Please Enter Valid Hazard Description ${validateHazardDescription?.errorMessage}`,
          {
            variant: "warning",
          }
        );
        return;
      }

      if (!!newData?.impactText) {
        const validateImpactText = isValidForHiraPage(
          trimText(newData?.impactText)
        );
        if (!validateImpactText?.isValid) {
          enqueueSnackbar(
            `Please Enter Valid Impact Text ${validateImpactText?.errorMessage}`,
            {
              variant: "warning",
            }
          );
          return;
        }
      }

      if (!!newData?.existingControl) {
        const validateExistingControl = isValidForHiraPage(
          newData?.existingControl
        );
        if (!validateExistingControl?.isValid) {
          enqueueSnackbar(
            `Please Enter Valid Existing Control ${validateExistingControl?.errorMessage}`,
            {
              variant: "warning",
            }
          );
          return;
        }
      }

      if (!!newData?.additionalControlMeasure) {
        const validateAdditionalControlMeasure = isValidForHiraPage(
          newData?.additionalControlMeasure
        );
        if (!validateAdditionalControlMeasure?.isValid) {
          enqueueSnackbar(
            `Please Enter Valid Additional Control Measure ${validateAdditionalControlMeasure?.errorMessage}`,
            {
              variant: "warning",
            }
          );
          return;
        }
      }

      const hiraStepData = {
        sNo: newData?.sNo,
        subStepNo: newData?.subStepNo,
        jobBasicStep: trimText(newData?.jobBasicStep) || "",
        hazardType: newData?.hazardType,
        hazardDescription: trimText(newData?.hazardDescription),
        impactText: trimText(newData?.impactText) || "",
        existingControl: trimText(newData?.existingControl),
        preMitigationScore: newData?.preProbability * newData?.preSeverity,
        preSeverity: newData?.preSeverity,
        preProbability: newData?.preProbability,
        additionalControlMeasure: trimText(newData?.additionalControlMeasure),
        responsiblePerson: newData?.responsiblePerson,
        implementationStatus: trimText(newData?.implementationStatus),
        postMitigationScore: newData?.postProbability * newData?.postSeverity,
        postSeverity: newData?.postSeverity,
        postProbability: newData?.postProbability,
        createdBy: userDetails?.id || "",
        locationId: userDetails?.locationId || "",
        entityId: hiraHeaderFormData?.entity || "",
      };
      const hiraData = {
        jobTitle: trimText(hiraHeaderFormData?.jobTitle) || "",
        organizationId: userDetails?.organizationId || "",
        locationId: userDetails?.locationId || "",
        entityId: hiraHeaderFormData?.entity,
        section: hiraHeaderFormData?.section || "",
        area: hiraHeaderFormData?.area || "",
        riskType: hiraHeaderFormData?.riskType || "",
        condition: hiraHeaderFormData?.condition || "",
        assesmentTeam: hiraHeaderFormData?.assesmentTeam || [],
        createdBy: userDetails?.id || "",
        additionalAssesmentTeam:
          trimText(hiraHeaderFormData?.additionalAssesmentTeam) || "",
      };
      // console.log("checkrisk3 hiraData ", hiraData);
      // console.log("checkrisk3 stepdata", hiraStepData);
      setIsSubmitting(true);
      const response = await axios.post(
        `/api/riskregister/hira/createHiraWithStep`,
        {
          hira: hiraData,
          step: hiraStepData,
        }
      );
      // console.log("checkrisk3 response in handlePostBasicStepNew", response);
      if (response.status === 200 || response.status === 201) {
        setIsSubmitting(false);
        enqueueSnackbar("Job Created and Step Added Successfully", {
          variant: "success",
        });
        setSelectedHiraId(response?.data[0]?._id || "");
        setShowDraftStatus(true);
        getHiraWithSteps(response?.data[0]?._id || "", 1, 10);
      }
      setIsNewJob(false);
      setEditingKey("");
    } catch (error: any) {
      setIsSubmitting(false);
      if (error?.response) {
        const errorMessage =
          error?.response.data.message || "An unknown error occurred";
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    }
  };

  const handlePostNewStep = async (newData: any) => {
    try {
      const validateBasicStep = isValid(trimText(newData?.jobBasicStep));
      if (!validateBasicStep?.isValid) {
        enqueueSnackbar(
          `Please Enter Valid Basic Step ${validateBasicStep?.errorMessage}`,
          {
            variant: "warning",
          }
        );
        return;
      }

      const validateHazardDescription = isValidForHiraPage(
        trimText(newData?.hazardDescription)
      );
      if (!validateHazardDescription?.isValid) {
        enqueueSnackbar(
          `Please Enter Valid Hazard Description ${validateHazardDescription?.errorMessage}`,
          {
            variant: "warning",
          }
        );
        return;
      }

      if (!!newData?.impactText) {
        const validateImpactText = isValidForHiraPage(
          trimText(newData?.impactText)
        );
        if (!validateImpactText?.isValid) {
          enqueueSnackbar(
            `Please Enter Valid Impact Text ${validateImpactText?.errorMessage}`,
            {
              variant: "warning",
            }
          );
          return;
        }
      }

      if (!!newData?.existingControl) {
        const validateExistingControl = isValidForHiraPage(
          trimText(newData?.existingControl)
        );
        if (!validateExistingControl?.isValid) {
          enqueueSnackbar(
            `Please Enter Valid Existing Control ${validateExistingControl?.errorMessage}`,
            {
              variant: "warning",
            }
          );
          return;
        }
      }

      if (!!newData?.additionalControlMeasure) {
        const validateAdditionalControlMeasure = isValidForHiraPage(
          trimText(newData?.additionalControlMeasure)
        );
        if (!validateAdditionalControlMeasure?.isValid) {
          enqueueSnackbar(
            `Please Enter Valid Additional Control Measure ${validateAdditionalControlMeasure?.errorMessage}`,
            {
              variant: "warning",
            }
          );
          return;
        }
      }

      let hiraStepData: any = {
        sNo: newData?.sNo,
        subStepNo: newData?.subStepNo,
        jobBasicStep: trimText(newData?.jobBasicStep) || "",
        hazardType: newData?.hazardType,
        hazardDescription: trimText(newData?.hazardDescription),
        impactText: trimText(newData?.impactText) || "",
        existingControl: trimText(newData?.existingControl),
        preMitigationScore: newData?.preProbability * newData?.preSeverity,
        preSeverity: newData?.preSeverity,
        preProbability: newData?.preProbability,
        additionalControlMeasure: trimText(newData?.additionalControlMeasure),
        responsiblePerson: newData?.responsiblePerson,
        implementationStatus: newData?.implementationStatus,
        postMitigationScore: newData?.postProbability * newData?.postSeverity,
        postSeverity: newData?.postSeverity,
        postProbability: newData?.postProbability,
        createdBy: userDetails?.id || "",
        locationId: hiraRegisterData?.locationId || "",
        entityId: hiraRegisterData?.entityId || "",
      };
      setIsSubmitting(true);
      const hiraId = hiraRegisterData?._id;
      if (hiraRegisterData?.workflowStatus === "APPROVED") {
        hiraStepData = {
          ...hiraStepData,
          workflowStatus: "DRAFT",
        };
      }
      const response = await axios.post(
        `/api/riskregister/hira/addHiraStepToHira/${hiraId}`,
        {
          ...hiraStepData,
        }
      );
      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar("Step Added Successfully", {
          variant: "success",
        });
      }

      getHiraWithSteps(hiraId, pagination?.current, pagination?.pageSize);
      setSelectedEntity(
        hiraHeaderFormData?.entity
          ? hiraHeaderFormData?.entity
          : userDetails?.entity?.id
      );
      setIsNewJob(false);
      setEditingKey("");
      setIsSubmitting(false);
      setNestedRowKey("");
      setEditingKey("");
    } catch (error: any) {
      if (error?.response) {
        const errorMessage =
          error?.response.data.message || "An unknown error occurred";
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    }
  };

  const getAllDepartmentsByLocation = async (locationId: any = "") => {
    try {
      const res = await axios.get(
        `/api/aspect-impact/getAllDepartmentsByLocation/${locationId}`
      );

      if (res.status === 200 || res.status === 201) {
        console.log("checkrisk res in getAllDepartments", res);
        if (res?.data?.data && !!res.data.data.length) {
          setDepartmentOptions(
            res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.entityName,
            }))
          );
        } else {
          setDepartmentOptions([]);
          enqueueSnackbar("No Departments Found", {
            variant: "warning",
          });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getAllDepartments", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };

  const getAllLocations = async () => {
    try {
      const res = await axios.get(
        `/api/aspect-impact/getAllLocation/${userDetails?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        console.log("checkrisk res in getAllDepartments", res);
        if (res?.data?.data && !!res.data.data.length) {
          setLocationOptions(
            res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.locationName,
            }))
          );
        } else {
          setLocationOptions([]);
          enqueueSnackbar("No Departments Found", {
            variant: "warning",
          });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getAllDepartments", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };

  const fetchHiraConfig = async () => {
    try {
      const res = await axios.get(`/api/riskconfig/getHiraConfig/${orgId}`);
      // console.log("check res", res);
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
          const riskTypeOptions = data?.riskType?.map((riskType: any) => ({
            label: riskType.name,
            value: riskType._id,
          }));
          const conditionOptions = data?.condition?.map((riskType: any) => ({
            label: riskType.name,
            value: riskType._id,
          }));
          setConditionOptions(conditionOptions);
          setRiskTypeOptions(riskTypeOptions);
        } else {
          setExistingRiskConfig(null);
        }
      }
    } catch (error) {
      // console.log("errror in fetch config", error);
    }
  };

  const clearTableData = () => {
    setTableData([]);
    setTableDataForReport([]);
    setPagination((prev) => ({ ...prev, total: 0 }));
  };

  const getSectionOptions = async (entityId: any) => {
    try {
      const res = await axios.get(
        `api/business/getAllSectionsForEntity/${entityId}`
      );

      // console.log("checkrisk res in getHazardTypeOptions", res);
      if (res.status === 200) {
        if (res?.data && !!res?.data?.length) {
          const sectionOptions = res?.data?.map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
          setSectionOptions(sectionOptions);
        } else {
          setSectionOptions([]);

          // enqueueSnackbar("No Sections found for selected Dept/Vertical", {
          //   variant: "warning",
          // });
        }
      } else {
        setSectionOptions([]);

        enqueueSnackbar("Something went wrong while fetching Sections", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while fetching Sections", {
        variant: "error",
      });
      // console.log("checkrisk error in getHiraTypesOptions ", error);
    }
  };

  const handleDepartmentChange = (value: any) => {
    console.log("checkrisknew value in handleDepartmentChange", value);

    setSelectedEntity(value);
    // fetchAllJobTitles(value);
    // setSelectedJobTitle("All");
    setHiraTableData([]);
    setShowRequireStepMessage(false);
    setTableDataForReport([]);
    setPagination((prev) => ({ ...prev, total: 0 }));
    filterForm.setFieldsValue({
      jobTitle: undefined,
    });
    hiraHeaderForm?.setFieldsValue({
      jobTitle: "",
      area: undefined,
      section: undefined,
      riskType: undefined,
      condition: undefined,

      entity: undefined,
      assesmentTeam: [],
      additionalAssesmentTeam: "",
    });
    getSectionOptions(value);
    //to hide the Description block for revision history
    setHiraHeaderFormData({});
    setIsTableDataLoaded(false);
    setIsHiraReviewHistoryLoaded(false);

    //to hide the Add Step button
    setAllowToAddStep(false);
    setIsHiraHeaderExist(false);
    //clear all hira table data
    setAllHiraTableData([]);
    setPaginationForAll((prev) => ({ ...prev, total: 0 }));
    setHideHeaderInAllMode(true);
  };

  const handleAreaChange = (value: any) => {
    console.log("checkrisknew value in handleAreaChange", value);

    setSelectedArea(value);
    //clear all hira table data
    setAllHiraTableData([]);
    setPaginationForAll((prev) => ({ ...prev, total: 0 }));
    setHideHeaderInAllMode(true);
  };

  const handleSectionChange = (value: any) => {
    console.log("checkrisknew value in handleSectionChange", value);

    setSelectedSection(value);
    //clear all hira table data
    setAllHiraTableData([]);
    setPaginationForAll((prev) => ({ ...prev, total: 0 }));
    setHideHeaderInAllMode(true);
  };

  const handleStatusChange = (value: any) => {
    console.log("checkrisknew value in handleStatusChange", value);

    setSelectedStatus(value);
    //clear all hira table data
    setAllHiraTableData([]);
    setPaginationForAll((prev) => ({ ...prev, total: 0 }));
    setHideHeaderInAllMode(true);
  };

  const handleLocationChange = (value: any) => {
    console.log("checkrisknew value in handleLocationChange", value);

    setSelectedLocation(value);
    setSelectedEntity("");
    setSelectedArea(undefined);
    filterForm.setFieldsValue({
      entityId: undefined,
      area: undefined,
      //  jobTitle: undefined
    });
    getAllAreaMaster(value);
    clearTableData();
    getAllDepartmentsByLocation(value);

    //clear all hira table data
    setAllHiraTableData([]);
    setPaginationForAll((prev) => ({ ...prev, total: 0 }));
    setHideHeaderInAllMode(true);
  };

  const handleDeleteStep = async (record: any) => {
    try {
      console.log(
        "checkrisknew record in handleDeleteStep",
        record,
        hiraRegisterData
      );
      if (hiraTableData?.length === 1) {
        enqueueSnackbar("Cannot Delete the Single Step", {
          variant: "warning",
        });
        return;
      }
      const res = await axios.delete(
        `/api/riskregister/hira/hiraStep/${hiraRegisterData?._id}/${record.id}`
      );
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar("Step Deleted Successfully", {
          variant: "success",
        });
        getHiraWithSteps(
          selectedHiraId,
          pagination?.current,
          pagination?.pageSize
        );
      }
    } catch (error) {
      console.log("error in handleDeleteStep", error);
    }
  };

  const handleDeleteJob = async () => {
    try {
      console.log("checkrisk record in handleDeleteJob", jobToBeDeleted);
      const hiraId = jobToBeDeleted?._id;
      const query: any = {
        workflowStatus: jobToBeDeleted?.workflowStatus,
        currentVersion: jobToBeDeleted?.currentVersion,
        jobTitle: jobToBeDeleted?.jobTitle,
        entityId: jobToBeDeleted?.entityId,
      };

      // Use arrayToQueryString to format stepIds
      const stepIdsQueryString = arrayToQueryString(
        "stepIds",
        jobToBeDeleted?.stepIds
      );

      // Convert query object to query string
      const queryString = Object.keys(query)
        .map((key) => `${key}=${encodeURIComponent(query[key])}`)
        .join("&");

      const finalQueryString = `${queryString}&${stepIdsQueryString}`;

      const res = await axios.delete(
        `/api/riskregister/hira/deleteHira/${hiraId}?${finalQueryString}`
      );

      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar("Job Deleted Successfully", {
          variant: "success",
        });
        getHiraList(
          1,
          10,
          selectedLocation,
          selectedEntity || "",
          selectedArea,
          selectedSection,
          selectedStatus,
          true
        );
        setDeleteConfirmDialogOpen(false);
      }
      setDeleteConfirmDialogOpen(false);
    } catch (error) {
      setDeleteConfirmDialogOpen(false);
      console.log("error in handleDeleteStep", error);
    }
  };

  const handleCloseDeleteConfirmDialog = () => {
    setDeleteConfirmDialogOpen(false);
  };

  const reloadAllHiraTableData = () => {
    getHiraList(
      1,
      10,
      selectedLocation,
      selectedEntity || "",
      selectedArea,
      selectedSection,
      selectedStatus,
      true
    );
  };

  // Add a new row
  const handleAddStep = () => {
    console.log("checkrisk hiratable data in handleAdd step", hiraTableData);
    setIsAddStepClicked(true);
    setShowRequireStepMessage(false);
    setNestedRowKey("");
    if (editingKey !== "") {
      enqueueSnackbar("Please save the edited row before adding a new row", {
        variant: "warning",
      });
      return;
    }

    const newData = {
      key: `new_${hiraTableData.length}`, // Ensure unique key
      sNo: "",
      jobBasicStep: "",
      hazardType: "", // Initialize hazardType
      hazardName: "", // Initialize hazardName
      hazardDescription: "",
      impactText: "",
      existingControl: "",
      preProbability: "",
      preSeverity: "",
      preMitigationScore: "",
      additionalControlMeasure: "",
      responsiblePerson: "",
      implementationStatus: "",
      postProbability: "",
      postSeverity: "",
      postMitigationScore: "",
    };

    setHiraTableData([...hiraTableData, newData]);
    const newRef = React.createRef();
    setNewRowRef(newRef);
    editForNewStep(newData);
    setActiveKey("1");
  };
  const handleAddSubStep = async (record: any) => {
    setIsAddStepClicked(true);
    setShowRequireStepMessage(false);
    setEditingKey("");
    // console.log("checkrisknew pagination total--->", pagination);

    const totalHiraCount = pagination?.total;
    const baseIndex = hiraTableData.findIndex(
      (item: any) => item.key === record.key
    ); // Find the index of the current row

    // console.log("checkrisknew base index --->", baseIndex);

    // Find the last nested index related to the base index
    let lastIndex = baseIndex;
    let lastSubStepNo = 1.1; // Starting point for substeps (1.2 is the first substep)
    while (
      lastIndex + 1 < hiraTableData.length &&
      hiraTableData[lastIndex + 1].sNo === record.sNo
    ) {
      lastIndex++;
      if (hiraTableData[lastIndex]?.subStepNo) {
        lastSubStepNo = parseFloat(hiraTableData[lastIndex].subStepNo); // Update to the last substep number
      }
    }
    // Increment the subStepNo by 0.1
    const newSubStepNo = (lastSubStepNo + 0.1).toFixed(1);
    const newData = {
      key: `new_${totalHiraCount}`, // Ensure unique key
      sNo: record?.sNo,
      subStepNo: newSubStepNo, // Incremented s
      jobBasicStep: record?.jobBasicStep,
      hazardType: "", // Initialize hazardType
      hazardName: "", // Initialize hazardName
      hazardDescription: "",
      impactText: "",
      existingControl: "",
      preProbability: "",
      preSeverity: "",
      preMitigationScore: "",
      additionalControlMeasure: "",
      responsiblePerson: "",
      implementationStatus: "",
      postProbability: "",
      postSeverity: "",
      postMitigationScore: "",
    };

    console.log("checkrisknew newdata-->", newData);

    setNestedRowKey(`new_${totalHiraCount}`);
    // Insert the new row after the last nested row of the same main row
    hiraTableData.splice(lastIndex + 1, 0, newData);
    setHiraTableData([...hiraTableData]); // Update state to reflect the new row

    const newRef = React.createRef();
    setNewRowRef(newRef);
    editForNewStep(newData);
    setActiveKey("1");
  };

  const cancelEdit = (key: any) => {
    if (key.includes("new")) {
      // Function to check if the row is new
      // Remove the row from your data source
      const newData = hiraTableData.filter((item: any) => item.key !== key);
      setHiraTableData(newData);
      setEditingKey("");
    } else {
      setEditingKey("");
      hiraForm.resetFields();
    }

    // Clear substep state to ensure the next addition is treated correctly
    setNestedRowKey("");
    setIsAddStepClicked(false); // Resetting the flag
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
                    <Tooltip title={"Click to Add Sub Step"}>
                      <Button
                        type="text"
                        onClick={() => handleAddSubStep(record)}
                        disabled={
                          checkIfUserCanAddSubStep(record) ||
                          !showEditStepAndDeleteStepButton()
                        }
                      >
                        <AddCircleOutlineIcon style={{ marginLeft: "5px" }} />
                      </Button>
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
                    <Tooltip title={"Click to Add Sub Step"}>
                      <Button
                        type="text"
                        onClick={() => handleAddSubStep(record)}
                        disabled={
                          checkIfUserCanAddSubStep(record) ||
                          !showEditStepAndDeleteStepButton()
                        }
                      >
                        <AddCircleOutlineIcon style={{ marginLeft: "5px" }} />
                      </Button>
                    </Tooltip>
                  </>
                )}
              </>
            )}
          </div>
        );
      },
    },
    {
      title: "Hazard Type",
      dataIndex: "hazardType",
      key: "hazardType",
      // width: 300,
      editable: true,
      render: (_: any, record: any) => (
        <div
          style={{
            verticalAlign: "top", // Align text to the top
            // display: "block", // Make the content behave like a block element
          }}
        >
          {record?.hazardName || "N/A"}
        </div>
      ),
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
          {/* Significant */}
          {/* <Tooltip title="Significant Criteria!" color="blue"> */}
          <Popover
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
          </Popover>
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
      title: "Hazard Description",
      dataIndex: "hazardDescription",
      // width: 400,
      key: "hazardDescription",
      editable: true,
      render: (_: any, record: any) => (
        <div
          style={{
            verticalAlign: "top", // Align text to the top
            // display: "block", // Make the content behave like a block element
          }}
        >
          {record?.hazardDescription || "N/A"}
        </div>
      ),
    },
    {
      title: "Impact",
      dataIndex: "impactText",
      // width: 400,
      key: "impactText",
      editable: true,
      render: (_: any, record: any) => (
        <div
          style={{
            verticalAlign: "top", // Align text to the top
            // display: "block", // Make the content behave like a block element
          }}
        >
          {record?.impactText || "N/A"}
        </div>
      ),
    },
    {
      title: "Existing Control Measure",
      dataIndex: "existingControl",
      key: "existingControl",
      editable: true,
      render: (_: any, record: any) => (
        <div style={{ whiteSpace: "pre-wrap", verticalAlign: "top" }}>
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
      // title: (
      //   <div
      //     style={{
      //       display: "flex",
      //       alignItems: "center",
      //       justifyContent: "center",
      //     }}
      //   >
      //     P*S (Base Risk)
      //     <Popover
      //       placement="right"
      //       title="P*S (Base Risk) Explanation"
      //       content={
      //        <>
      //         <RiskScoreHelpTable criteriaData={existingRiskConfig} />
      //        </>
      //       }
      //       trigger="click"
      //     >
      //       <InfoIcon style={{ marginLeft: 8, cursor: "pointer" }} />
      //     </Popover>
      //   </div>
      // ),
      title: "P*S (Base Risk)",
      dataIndex: "preMitigationScore",
      key: "preMitigationScore",
      align: "center",
      editable: false, // This is a computed field
      render: (_: any, record: any) => {
        const score = riskScores[record.key]?.preMitigationScore
          ? riskScores?.[record.key]?.preMitigationScore
          : record?.preSeverity * record?.preProbability;
        const scoreObj = riskScores?.[record.key]
          ? riskScores?.[record.key]
          : record?.preProbability && record?.preSeverity
          ? record
          : {};
        console.log("checkrisknew scoreObj in preMitigationScore", scoreObj);

        return !record.type && score !== "N/A" ? (
          <Tooltip title="Click For Risk Heatmap">
            <Typography.Link
              onClick={() => toggleScoreModal(scoreObj, "pre")}
              style={{ textDecoration: "underline" }}
            >
              {score || "N/A"}
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
        <div style={{ whiteSpace: "pre-wrap", verticalAlign: "top" }}>
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
        <div style={{ whiteSpace: "pre-wrap", verticalAlign: "top" }}>
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
      align: "center",
      editable: false, // This is a computed field
      render: (_: any, record: any) => {
        const score = riskScores[record.key]?.postMitigationScore
          ? riskScores?.[record.key]?.postMitigationScore
          : record?.postSeverity * record?.postProbability;
        const scoreObj = riskScores?.[record.key]
          ? riskScores?.[record.key]
          : record?.postProbability && record?.postSeverity
          ? record
          : {};
        return !record.type && score !== "N/A" ? (
          <Typography.Link
            onClick={() => toggleScoreModal(scoreObj, "post")}
            style={{ textDecoration: "underline" }}
          >
            {score}
          </Typography.Link>
        ) : (
          "N/A"
        );
      },
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        console.log("checkrisk editable --->", editable);

        return editable ? (
          <div
            style={{
              verticalAlign: "top",
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "baseline",
            }}
            ref={ref5}
          >
            <Tooltip
              title="Click to Submit Step"
              color="blue"
              placement="bottom"
            >
              <Typography.Link
                onClick={() => {
                  if (record?.id) {
                    saveForOldEntry(record?.id);
                  } else {
                    if (isNewJob) {
                      setIsSaveClickedForNewJob(true);
                    }
                    save(record?.key);
                  }
                }}
                disabled={isSubmitting}
                // style={{ marginRight: 8 }}
              >
                <CheckCircleIcon width={18} height={18} />
              </Typography.Link>
            </Tooltip>
            <Tooltip title="Cancel">
              <IconButton
                onClick={() => cancelEdit(record.key)} // Assumes 'cancelEdit' is a function to cancel editing
                style={{ padding: 0 }}
              >
                <CancelIcon style={{ fill: "red" }} />
              </IconButton>
            </Tooltip>
          </div>
        ) : (
          <>
            {showEditStepAndDeleteStepButton() && (
              <>
                <Tooltip
                  title={
                    showEditStepAndDeleteStepButton()
                      ? "Edit Step"
                      : "Can't Edit Step"
                  }
                >
                  <IconButton
                    style={{ padding: 0 }}
                    onClick={() => edit(record)}
                    disabled={!showEditStepAndDeleteStepButton()}
                  >
                    <CustomEditICon width={18} height={18} />
                  </IconButton>
                </Tooltip>
                <Divider type="vertical" className={classes.NavDivider} />
                <Tooltip
                  title={
                    showEditStepAndDeleteStepButton()
                      ? "Delete Step"
                      : "Can't Delete Step"
                  }
                >
                  <IconButton
                    style={{ padding: 0 }}
                    onClick={() => handleDeleteStep(record)}
                    disabled={!showEditStepAndDeleteStepButton()}
                  >
                    <CustomDeleteICon width={18} height={18} />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </>
        );
      },
    },
  ].map((col, index: any) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        inputType:
          col.dataIndex === "hazardType" ||
          col.dataIndex === "responsiblePerson"
            ? "select"
            : col.dataIndex === "existingControl"
            ? "textarea"
            : col.dataIndex === "preProbability" ||
              col.dataIndex === "preSeverity" ||
              col.dataIndex === "postSeverity" ||
              col.dataIndex === "postProbability" ||
              col.dataIndex === "sNo"
            ? "number"
            : "textarea",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        hazardTypeOptions, // Passed for the 'select' input type
      }),
    };
  });

  const handleJobClickFromTable = (record: any) => {
    // console.log("checkrisk3 inside handleJobClickFromTable", record);
    navigate(`/risk/riskregister/HIRA/${record?._id}`, {
      state: {
        hiraEntityId: record?.entityId,
      },
    });
  };

  const handleUpdateHeader = async () => {
    try {
      await hiraHeaderForm.validateFields();

      const validateJobTitle = isValid(trimText(hiraHeaderFormData?.jobTitle));
      if (!validateJobTitle?.isValid) {
        enqueueSnackbar(
          `Please Enter Valid Title ${validateJobTitle?.errorMessage}`,
          {
            variant: "warning",
          }
        );
        return;
      }

      if (!!hiraHeaderFormData?.additionalAssesmentTeam) {
        const validateAdditionalAssesmentTeam = isValid(
          trimText(hiraHeaderFormData?.additionalAssesmentTeam)
        );
        if (!validateAdditionalAssesmentTeam?.isValid) {
          enqueueSnackbar(
            `Please Enter Valid Additional Assesment Team ${validateAdditionalAssesmentTeam?.errorMessage}`,
            {
              variant: "warning",
            }
          );
          return;
        }
      }

      console.log(
        "checkrisk3 hiraHeaderFormData in handleUpdateHeader",
        hiraHeaderFormData
      );
      let headerDataToBeUpdated: any = {
        jobTitle: trimText(hiraHeaderFormData?.jobTitle) || "",
        area: hiraHeaderFormData?.area || "",
        section: hiraHeaderFormData?.section || "",
        entity: hiraHeaderFormData?.entity || "",
        riskType: hiraHeaderFormData?.riskType || "",
        condition: hiraHeaderFormData?.condition || "",
        assesmentTeam: hiraHeaderFormData?.assesmentTeam || [],
        additionalAssesmentTeam:
          trimText(hiraHeaderFormData?.additionalAssesmentTeam) || "",
      };
      if (hiraRegisterData?.workflowStatus === "APPROVED") {
        headerDataToBeUpdated = {
          ...headerDataToBeUpdated,
          workflowStatus: "DRAFT",
        };
      }
      const response = await axios.put(
        `/api/riskregister/hira/updateHira/${selectedHiraId}`,
        headerDataToBeUpdated
      );
      if (response?.status === 200) {
        enqueueSnackbar("HIRA Updated Successfully", {
          variant: "success",
        });
        getHiraWithSteps(
          selectedHiraId,
          pagination?.current,
          pagination?.pageSize
        );
        setIsHiraHeaderExist(true);
      } else {
        enqueueSnackbar("Something went wrong while updating HIRA", {
          variant: "error",
        });
        setIsHiraHeaderExist(false);
      }
    } catch (error) {
      console.log("checkrisk3 error in handleUpdateHeader", error);
      setIsHiraHeaderExist(false);
    }
  };

  const switchToJobPage = () => {
    getAllLocations();
    getAllDepartmentsByLocation(userDetails?.location?.id);
    // if (userDetails?.location?.id && userDetails?.entity?.id) {
    setSelectedLocation(selectedLocation || userDetails?.location?.id);
    getAllAreaMaster(selectedLocation || userDetails?.location?.id);
    setSelectedEntity(selectedEntity || userDetails?.entity?.id);
    // }
    setSelectedArea(selectedArea || undefined);
    setSelectedSection(selectedSection || undefined);
    setSelectedStatus(selectedStatus || "All");
    console.log(
      "checkrisknew pagintion in swithcTojobpage --->",
      paginationForAll
    );

    setPaginationForAll((prev) => ({
      ...prev,
      current: paginationForAll?.current || 1,
      pageSize: paginationForAll?.pageSize || 10,
    }));
    filterForm?.setFieldsValue({
      locationId: selectedLocation || userDetails?.location?.id,
      entityId: selectedEntity || userDetails?.entity?.id,
      area: selectedArea || undefined,
      section: selectedSection || undefined,
      status: selectedStatus || "All",
    });

    setSelectedHiraId("");
    setHiraRegisterData({});
    setHideFilters(false);
    setSearch("");
    setHideHeaderInAllMode(true);
    setShowRequireStepMessage(false);
    setIsNewJob(false);
    setEditingKey("");
    getHiraList(
      paginationForAll?.current || 1,
      paginationForAll?.pageSize || 10,
      selectedLocation || userDetails?.location?.id,
      selectedEntity || userDetails?.entity?.id,
      selectedArea || "",
      selectedSection || "",
      selectedStatus || "All",
      true
    );
  };

  const switchToJobPageWithAppliedFilters = (appliedFilters: any) => {
    getAllLocations();
    getAllDepartmentsByLocation(appliedFilters?.selectedLocation);
    if (appliedFilters?.selectedLocation && appliedFilters?.selectedEntity) {
      setSelectedLocation(appliedFilters?.selectedLocation);
      getAllAreaMaster(appliedFilters?.selectedLocation);
      setSelectedEntity(appliedFilters?.selectedEntity);
    }
    setSelectedArea(appliedFilters?.selectedArea || undefined);
    setSelectedSection(appliedFilters?.selectedSection || undefined);
    filterForm?.setFieldsValue({
      locationId: appliedFilters?.selectedLocation || undefined,
      entityId: appliedFilters?.selectedEntity || undefined,
      area: appliedFilters?.selectedArea || undefined,
      section: appliedFilters?.selectedSection || undefined,
      status: appliedFilters?.selectedStatus || "All",
    });
    setSelectedHiraId("");
    setHiraRegisterData({});
    setHideFilters(false);
    setSearch("");
    setHideHeaderInAllMode(true);
    setShowRequireStepMessage(false);
    setIsNewJob(false);
    setEditingKey("");
    getHiraList(
      pagination?.current || 1,
      pagination?.pageSize || 10,
      appliedFilters?.selectedLocation || userDetails?.location?.id,
      appliedFilters?.selectedEntity || userDetails?.entity?.id,
      appliedFilters?.selectedArea || "",
      appliedFilters?.selectedSection || "",
      appliedFilters?.selectedStatus || "All",
      true
    );
  };

  const allHiraTableColumns: ColumnsType<any> = [
    {
      title: "Hira No.",
      dataIndex: "prefixSuffix",
      width: 180,
      key: "prefixSuffix",
      render: (text: any, record: any) =>
        record?.prefixSuffix ? record?.prefixSuffix : "N/A",
    },
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
      width: 250, // Increased column width
      render: (text: any, record: any) => (
        <Tooltip title={text} placement="top">
          <div
            style={{
              verticalAlign: "top",
              textDecorationLine: "underline",
              cursor: "pointer",
              wordWrap: "break-word", // Allow long text to wrap within the width
              wordBreak: "break-word", // Ensure proper wrapping for long strings
              whiteSpace: "normal", // Prevent text from sticking to one line
            }}
            onClick={() => handleJobClickFromTable(record)}
          >
            <span style={{ textTransform: "capitalize" }}>{text}</span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Routine/Non Routine",
      dataIndex: "riskTypeDetails",
      key: "riskTypeDetails",
      width:100,
      // editable: true,
      render: (_: any, record: any) => (
        <div
          style={{
            verticalAlign: "top", // Align text to the top
            // display: "block", // Make the content behave like a block element
          }}
        >
          {record?.riskTypeDetails?.name || "N/A"}
        </div>
      ),
    },
    {
      title: "Condition",
      dataIndex: "conditionDetails",
      key: "conditionDetails",
      width:100,
      // editable: true,
      render: (_: any, record: any) => (
        <div
          style={{
            verticalAlign: "top", // Align text to the top
            // display: "block", // Make the content behave like a block element
          }}
        >
          {record?.conditionDetails?.name || "N/A"}
        </div>
      ),
    },
    {
      title: "Entity",
      dataIndex: "entityDetails",
      width: 180,
      key: "entityDetails",
      render: (text: any, record: any) =>
        record?.entityDetails ? record?.entityDetails?.entityName : "",
    },
    {
      title: "Area",
      dataIndex: "area",
      // width: 400,
      key: "area",
      render: (text: any, record: any) =>
        record?.areaDetails
          ? record?.areaDetails?.name
          : record?.area
          ? record?.area
          : "",
    },
    {
      title: "Section",
      dataIndex: "section",
      // width: 400,
      key: "section",
      render: (text: any, record: any) =>
        record?.sectionDetails
          ? record?.sectionDetails?.name
          : record?.section
          ? record?.section
          : "",
    },
    {
      title: "Version",
      dataIndex: "currentVersion",
      key: "currentVersion",
      align: "center",
      render: (text: any, record: any) =>
        record?.currentVersion ? record?.currentVersion : 0,
    },
    {
      title: "Status",
      dataIndex: "workflowStatus",
      key: "workflowStatus",
      render: (text: any, record: any) => renderStatusTag(record),
    },
    {
      title: "Creator",
      dataIndex: "createdByDetails",
      key: "createdByDetails",
      render: (text: any, record: any) => (
        <div style={{ textTransform: "capitalize" }}>
          {record?.createdBy
            ? record?.createdByDetails?.firstname +
              " " +
              record?.createdByDetails?.lastname
            : "N/A"}
        </div>
      ),
    },
    {
      title: "Reviewers",
      dataIndex: "reviewersDetails",
      key: "reviewersDetails",
      render: (text: any, record: any) => (
        <div style={{ textTransform: "capitalize" }}>
          {record?.reviewersDetails
            ?.map((item: any) => item?.firstname + " " + item?.lastname)
            .join(", ") || ""}
        </div>
      ),
    },
    {
      title: "Approvers",
      dataIndex: "approversDetails",
      key: "approversDetails",
      render: (text: any, record: any) => (
        <div style={{ textTransform: "capitalize" }}>
          {record?.approversDetails
            ?.map((item: any) => item?.firstname + " " + item?.lastname)
            .join(", ") || ""}
        </div>
      ),
    },
    {
      title: "History",
      dataIndex: "action",
      fixed: "right",
      render: (_: any, record: any) => {
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignContent: "center",
            }}
          >
            <Tooltip title="Workflow History">
              <HistoryIcon
                className={classes.historyIcon}
                style={{
                  // fill: "#0E497A",
                  cursor: "pointer",
                  width: "23px",
                  height: "22px",
                  marginRight: "5px",
                }}
                onClick={() => {
                  console.log("checkrisknew record in history", record);

                  setConsolidatedWorkflowHistoryDrawer({
                    open: true,
                    data: {
                      jobTitle: record?.jobTitle,
                      workflow: record?.workflow,
                      hiraId: record?._id,
                    },
                  });
                }}
              />
            </Tooltip>
            <Tooltip title="View Workflow Comments">
              <ChatBubbleOutlineIcon
                style={{
                  // fill: "#0E497A",
                  cursor: "pointer",
                  width: "19px",
                  height: "22px",
                  marginRight: "5px",
                }}
                onClick={() => {
                  const latestOngoingWorkflow = record?.workflow?.slice(
                    record?.workflow?.length - 1
                  )[0];
                  // console.log(
                  //   "checkrisk7 latestOngoingWorkflow in view workflow comments onclick--->",
                  //   latestOngoingWorkflow
                  // );

                  setHiraWorkflowCommentsDrawer({
                    open: true,
                    data: latestOngoingWorkflow,
                  });
                }}
              />
            </Tooltip>
            {((isMR && userDetails?.locationId === record?.locationId) ||
              isMCOE) && (
              <Tooltip title={"Delete Job"}>
                <DeleteOutlineIcon
                  style={{
                    // fill: "#0E497A",
                    cursor: "pointer",
                    width: "23px",
                    height: "22px",
                    marginRight: "5px",
                  }}
                  onClick={() => {
                    setDeleteConfirmDialogOpen(true);
                    setJobToBeDeleted(record);
                  }}
                />
              </Tooltip>
            )}
            {((isMR && userDetails?.locationId === record?.locationId) ||
              isMCOE) &&
              (record?.workflowStatus === "IN_REVIEW" ||
                record?.workflowStatus === "IN_APPROVAL") && (
                <Tooltip title={"Change Reviewer And Approver"}>
                  <PeopleIcon
                    style={{
                      cursor: "pointer",
                      width: "23px",
                      height: "22px",
                      marginRight: "5px",
                    }}
                    onClick={() => {
                      setChangeWorkflowPeopleModal(true);
                      setSelectedHiraData(record);
                      console.log("checkrisknew in column record-->", record);
                    }}
                  />
                </Tooltip>
              )}
          </div>
        );
      },
    },
  ];

  const configHandler = () => {
    navigate(`/risk/riskconfiguration/HIRA`);
  };
  const handleClickFetch = () => {
    getHiraList(
      1,
      10,
      selectedLocation,
      selectedEntity || "",
      selectedArea,
      selectedSection,
      selectedStatus,
      true
    );
  };
  const handleChangePageNew = (page: number, pageSize: number) => {
    // console.log("checkriske page", page, pageSize);
    setPagination((prev) => ({ ...prev, current: page, pageSize: pageSize }));
    getHiraWithSteps(selectedHiraId, page, pageSize);
  };

  const handleExport = async () => {
    // if (!isMounted.current) return;
    // await new  Promise(resolve => setTimeout(resolve, 1000))
    const status = getHiraStatusForPdf(hiraRegisterData?.workflowStatus);

    let createdByDetails = null,
      reviewedByDetails = null,
      approvedByDetails = null;

    if (!hiraWithStepsLoading) {
      createdByDetails = {
        fullname:
          hiraRegisterData?.createdByUserDetails?.firstname +
            " " +
            hiraRegisterData?.createdByUserDetails?.lastname || "N/A",
        createdAt: hiraRegisterData?.hiraCreatedAt
          ? moment(hiraRegisterData?.hiraCreatedAt).format("DD/MM/YYYY HH:mm")
          : "N/A",
      };
    }
    // console.log("checkrisk6 hiraregisterdata workflow[]", hiraRegisterData?.workflow);

    // const targetCycleNumber = hiraRegisterData?.currentVersion + 1;
    const ongoingWorkflowDetails = hiraRegisterData?.workflow?.slice(
      hiraRegisterData?.workflow?.length - 1
    )[0];
    // console.log("checkrisk6 ongoingworkflowdetails---> ", ongoingWorkflowDetails);

    if (
      !!ongoingWorkflowDetails?.approvedBy &&
      !!ongoingWorkflowDetails?.approvedOn
    ) {
      // console.log("checkrisk6 approvedBy found", ongoingWorkflowDetails?.approvedBy);

      approvedByDetails = {
        fullname:
          ongoingWorkflowDetails?.approvedByUserDetails?.firstname +
            " " +
            ongoingWorkflowDetails?.approvedByUserDetails?.lastname || "N/A",
        approvedOn: ongoingWorkflowDetails?.approvedOn
          ? moment(ongoingWorkflowDetails?.approvedOn).format(
              "DD/MM/YYYY HH:mm"
            )
          : "N/A",
      };
    }
    if (
      !!ongoingWorkflowDetails?.reviewedBy &&
      !!ongoingWorkflowDetails?.reviewedOn
    ) {
      // console.log("checkrisk6 reviewedBy found", ongoingWorkflowDetails?.reviewedBy);

      reviewedByDetails = {
        fullname: ongoingWorkflowDetails?.reviewedByUserDetails
          ? ongoingWorkflowDetails?.reviewedByUserDetails?.firstname +
              " " +
              ongoingWorkflowDetails?.reviewedByUserDetails?.lastname || "N/A"
          : "N/A",
        reviewedOn: ongoingWorkflowDetails?.reviewedOn
          ? moment(ongoingWorkflowDetails?.reviewedOn).format(
              "DD/MM/YYYY HH:mm"
            )
          : "N/A",
      };
    }

    // console.log("checkrisk6 approvedBy reviewedBy", approvedByDetails, reviewedByDetails);

    const allHiraData = await getAllHiraWithStepsForExport(
      selectedHiraId,
      1,
      300,
      ""
    );

    // Calculate postMitigationScore based on the condition
    if (allHiraData?.steps && allHiraData?.steps?.length > 0) {
      allHiraData.steps = allHiraData.steps.map((step: any) => {
        return {
          ...step,
          preMitigationScore:
          step.preProbability > 0 ? step.preProbability * step.preSeverity : 0,
          postMitigationScore:
            step.postProbability > 0
              ? step.postProbability * step.postSeverity
              : 0,
        };
      });
    }

    console.log("checkrisk6 allHiraData in export--->", allHiraData);
    setShowExportLoader(false);

    const htmlReport = reportTemplate(
      allHiraData?.steps,
      hiraRegisterData,
      status,
      createdByDetails,
      reviewedByDetails,
      approvedByDetails,
      ongoingWorkflowDetails,
      existingRiskConfig,
      logo
    );

    printRef.current(htmlReport);
  };

  const handleExportToExcel = async () => {
    const ExcelJS = require("exceljs");

    const response = await axios.get(
      `/api/riskregister/hira/getHiraWithSteps/${selectedHiraId}?page=${1}&pageSize=${100}`
    );

    const tableData = response.data.steps;

    // Calculate postMitigationScore based on the condition
    const processedTableData = tableData.map((row: any) => {
      return {
        ...row,
        preMitigationScore:
          row.preProbability > 0 ? row.preProbability * row.preSeverity : 0,
        postMitigationScore:
          row.postProbability > 0 ? row.postProbability * row.postSeverity : 0,
      };
    });

    const status = getHiraStatusForPdf(hiraRegisterData?.workflowStatus);

    let createdByDetails = null,
      reviewedByDetails = null,
      approvedByDetails = null;

    if (!hiraWithStepsLoading) {
      createdByDetails = {
        fullname:
          hiraRegisterData?.createdByUserDetails?.firstname +
            " " +
            hiraRegisterData?.createdByUserDetails?.lastname || "N/A",
          createdAt: hiraRegisterData?.hiraCreatedAt
            ? moment(hiraRegisterData?.hiraCreatedAt).format("DD/MM/YYYY HH:mm")
            : "N/A",
      };
    }

    const ongoingWorkflowDetails = hiraRegisterData?.workflow?.slice(
      hiraRegisterData?.workflow?.length - 1
    )[0];
    // console.log("checkrisk6 ongoingworkflowdetails in export to excel---> ", ongoingWorkflowDetails);

    if (
      !!ongoingWorkflowDetails?.approvedBy &&
      !!ongoingWorkflowDetails?.approvedOn
    ) {
      // console.log("checkrisk6 approvedBy found in export to excel", ongoingWorkflowDetails?.approvedBy);

      approvedByDetails = {
        fullname:
          ongoingWorkflowDetails?.approvedByUserDetails?.firstname +
            " " +
            ongoingWorkflowDetails?.approvedByUserDetails?.lastname || "N/A",
        approvedOn: ongoingWorkflowDetails?.approvedOn
          ? moment(ongoingWorkflowDetails?.approvedOn).format(
              "DD/MM/YYYY HH:mm"
            )
          : "N/A",
      };
    }
    if (
      !!ongoingWorkflowDetails?.reviewedBy &&
      !!ongoingWorkflowDetails?.reviewedOn
    ) {
      // console.log("checkrisk6 reviewedBy found in export to excel", ongoingWorkflowDetails?.reviewedBy);

      reviewedByDetails = {
        fullname: ongoingWorkflowDetails?.reviewedByUserDetails
          ? ongoingWorkflowDetails?.reviewedByUserDetails?.firstname +
              " " +
              ongoingWorkflowDetails?.reviewedByUserDetails?.lastname || "N/A"
          : "N/A",
        reviewedOn: ongoingWorkflowDetails?.reviewedOn
          ? moment(ongoingWorkflowDetails?.reviewedOn).format(
              "DD/MM/YYYY HH:mm"
            )
          : "N/A",
      };
    }

    const getUniqueAssessmentTeamNames = () => {
      const namesSet = new Set();
      hiraRegisterData?.assesmentTeamData.forEach((member: any) => {
        namesSet?.add(`${member?.firstname} ${member?.lastname}`);
      });
      return Array.from(namesSet).join(", ");
    };

    let revisionReason = null;
    if (!!ongoingWorkflowDetails) {
      revisionReason = ongoingWorkflowDetails?.reason || "";
    }

    let riskTypeName = "",
      conditionName = "";
    if (
      hiraRegisterData?.riskType &&
      hiraRegisterData?.condition &&
      existingRiskConfig
    ) {
      riskTypeName = existingRiskConfig?.riskType?.find(
        (risk: any) => risk?._id === hiraRegisterData?.riskType
      )?.name;
      conditionName = existingRiskConfig?.condition?.find(
        (condition: any) => condition?._id === hiraRegisterData?.condition
      )?.name;
    }

    // Unique assessment team names
    const uniqueAssessmentTeamNames = getUniqueAssessmentTeamNames();
    const excelData = {
      tableDataForReport,
      hiraReviewHistory,
      status,
      createdByDetails,
      reviewedByDetails,
      approvedByDetails,
      hiraInWorkflow,
    };

    try {
      const workbook = new ExcelJS.Workbook();
      const response = await fetch(
        // "https://aceoffix.prodlelabs.com/Formats/HIRA_Format1.xlsx"
        process.env.REACT_APP_API_URL + "/Formats/HIRA_Format1.xlsx"
      );

      // Fetch Excel file from URL
      const buffer = await response.arrayBuffer();

      // Load the buffer into the workbook
      await workbook.xlsx.load(buffer);

      // Get the first worksheet
      const worksheet = workbook.getWorksheet("HIRA-Format");

      const cellD2 = worksheet.getCell("D2"); // Location
      cellD2.value =
        "HINDALCO, " + hiraRegisterData?.locationDetails?.locationName;

      const cellL2 = worksheet.getCell("L2"); //Ref No
      const cellL3 = worksheet.getCell("L3"); //Rev No
      cellL3.value = hiraRegisterData?.prefixSuffix;
      const cellL4 = worksheet.getCell("L4"); //Rev Date
      cellL4.value = approvedByDetails?.approvedOn;

      const cellD5 = worksheet.getCell("D5"); //Department
      cellD5.value = hiraRegisterData?.entityDetails?.entityName;

      const cellE5 = worksheet.getCell("E5"); //HIRA No
      cellE5.value += hiraRegisterData?.prefixSuffix || "N/A";

      const cellK5 = worksheet.getCell("K5"); //Date
      cellK5.value = approvedByDetails?.approvedOn
        ? approvedByDetails?.approvedOn
        : "N/A";

      const cellE6 = worksheet.getCell("E6"); //Job Title
      cellE6.value = hiraRegisterData.jobTitle;

      const cellK6 = worksheet.getCell("K6"); //Section / Location
      cellK6.value = hiraRegisterData?.sectionDetails?.name
        ? hiraRegisterData?.sectionDetails.name
        : hiraRegisterData?.section
        ? hiraRegisterData?.section
        : "N/A";

      //const cellK7 = worksheet.getCell("K7"); //Reference OCP (SOP/SMP) No.

      const cellE8 = worksheet.getCell("E8"); //Area
      cellE8.value = hiraRegisterData?.areaDetails?.name
        ? hiraRegisterData?.areaDetails?.name
        : hiraRegisterData?.area
        ? hiraRegisterData?.area
        : "N/A";

      const cellK7 = worksheet.getCell("K7"); //Additional assesment team.
      cellK7.value = hiraRegisterData?.additionalAssesmentTeam || "N/A";

      const cellK8 = worksheet.getCell("K8"); //Routine /NonRoutine
      cellK8.value = riskTypeName;

      const cellE9 = worksheet.getCell("E9"); //Risk assessment team members
      cellE9.value = uniqueAssessmentTeamNames || "N/A";

      const cellK9 = worksheet.getCell("K9"); //Routine /NonRoutine
      cellK9.value = conditionName;

      processedTableData.forEach((row: any, index: number) => {
        if (index !== 0) {
          const rowIndex = index + 13; // Row 13
          worksheet.spliceRows(rowIndex, 0, [{}]);
        }
        worksheet.getCell(`A${index + 13}`).value = "";
        worksheet.getCell(`B${index + 13}`).value =
          parseFloat(row?.subStepNo) > 1.1 ? "" : row.sNo;
        worksheet.getCell(`C${index + 13}`).value =
          parseFloat(row?.subStepNo) > 1.1 ? "" : row.jobBasicStep;
        worksheet.getCell(`D${index + 13}`).value = row.hazardDescription;
        worksheet.getCell(`E${index + 13}`).value = row.impactText;
        worksheet.getCell(`F${index + 13}`).value = row.existingControl;
        worksheet.getCell(`G${index + 13}`).value = row.preProbability;
        worksheet.getCell(`H${index + 13}`).value = row.preSeverity;
        worksheet.getCell(`I${index + 13}`).value = row.preMitigationScore;
        worksheet.getCell(`J${index + 13}`).value =
          row.additionalControlMeasure;
        worksheet.getCell(`K${index + 13}`).value = row
          ?.responsiblePersonDetails?.firstname
          ? row?.responsiblePersonDetails?.firstname +
            " " +
            row?.responsiblePersonDetails?.lastname
          : row?.responsiblePerson
          ? row?.responsiblePerson
          : "";
        worksheet.getCell(`L${index + 13}`).value = row.implementationStatus;
        worksheet.getCell(`M${index + 13}`).value = row.postProbability;
        worksheet.getCell(`N${index + 13}`).value = row.postSeverity;
        worksheet.getCell(`O${index + 13}`).value = row.postMitigationScore;
      });

      worksheet.getCell(`D${processedTableData.length + 14}`).value =
        createdByDetails?.fullname + "   |   " + createdByDetails?.createdAt;
      worksheet.getCell(`F${processedTableData.length + 14}`).value =
        "Reviewed by: " +
        (reviewedByDetails?.fullname ? reviewedByDetails?.fullname : "") +
        "   |   " +
        (reviewedByDetails?.reviewedOn ? reviewedByDetails?.reviewedOn : "");
      worksheet.getCell(`L${processedTableData.length + 14}`).value =
        (approvedByDetails?.fullname ? approvedByDetails?.fullname : "") +
        "   |   " +
        (approvedByDetails?.approvedOn ? approvedByDetails?.approvedOn : "");

      // Convert the workbook to a buffer
      const updatedBuffer = await workbook.xlsx.writeBuffer();

      // Convert the buffer to a Blob
      const blob = new Blob([updatedBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Trigger download
      saveAs(blob, hiraRegisterData?.jobTitle + ".xlsx");
    } catch (error) {
      console.error("Error reading Excel file:", error);
    }
  };

  function s2ab(s: string) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  const handleStartReview = (type: any = "new") => {
    setIsStartButtonClickedOnTour(true);

    let data = {};
    if (hiraInWorkflow?.status === "REJECTED") {
      data = {
        ...hiraInWorkflow,
      };
    }
    if (type === "revision") {
      data = {
        ...data,
        isRevision: true,
      };
    }

    if (!!tourOpenForWorkflow) {
      data = {
        ...data,
        isOnTour: true,
      };
    }
    // console.log("checkrisk handleStart review clicked data", selectedJobTitle);

    const encodedJobTitle = encodeURIComponent(selectedJobTitle);
    // console.log("checkrisk encodedJobTitle", encodedJobTitle);

    navigate(`/risk/riskregister/HIRA/review/${encodedJobTitle}`, {
      state: {
        ...data,
        entityId: hiraRegisterData?.entityId,
      },
    });
  };

  const handleStartReviewNew = () => {
    const hiraId = selectedHiraId || hiraRegisterData?._id;
    navigate(`/risk/riskregister/HIRA/review/${hiraId}`, {
      state: {
        hiraLocationId: hiraRegisterData?.locationId,
        hiraEntityId: hiraRegisterData?.entityId,
        filters: {
          selectedLocation: selectedLocation,
          selectedEntity: selectedEntity,
          selectedArea: selectedArea,
          selectedSection: selectedSection,
          selectedStatus: selectedStatus,
        },
      },
    });
  };

  const handleGoToWorkflowPageClick = () => {
    const hiraId = selectedHiraId || hiraRegisterData?._id;
    navigate(`/risk/riskregister/HIRA/review/${hiraId}`, {
      state: {
        hiraLocationId: hiraRegisterData?.locationId,
        hiraEntityId: hiraRegisterData?.entityId,
        filters: {
          selectedLocation: selectedLocation,
          selectedEntity: selectedEntity,
          selectedArea: selectedArea,
          selectedSection: selectedSection,
          selectedStatus: selectedStatus,
        },
      },
    });
  };

  const getStatusOfInWOrkflowHira = () => {
    // console.log(
    //   "checkrisklatest get status callled hiraInWorkflow ",
    //   hiraInWorkflow?.status
    // );
    // console.log(
    //   "checkrisklatest get status callled showdraftstats ",
    //   showDraftStatus
    // );
    // console.log(
    //   "checkrisklatest get status callled hiraInTrackChanges ",
    //   hiraInTrackChanges
    // );

    if (showDraftStatus) {
      console.log("checkrisk in first if");

      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#EEDC82">
            DRAFT
          </Tag>
        </Space>
      );
    } else if (hiraInWorkflow?.status === "open") {
      console.log("checkrisk in second if");
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#EEDC82">
            DRAFT
          </Tag>
        </Space>
      );
    } else if (hiraInTrackChanges?.status === "active") {
      console.log("checkrisk in second if");
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#EEDC82">
            DRAFT
          </Tag>
        </Space>
      );
    } else if (hiraInWorkflow?.status === "IN_REVIEW") {
      console.log("checkrisk in third if");

      return (
        <Space size={[0, 8]} wrap>
          {" "}
          <Tag className={classes.homePageTagStyle} color="#50C878">
            IN REVIEW
          </Tag>
        </Space>
      );
    } else if (hiraInWorkflow?.status === "IN_APPROVAL") {
      console.log("checkrisk in fourth if");

      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#7CB9E8">
            IN APPROVAL
          </Tag>
        </Space>
      );
    } else if (hiraInWorkflow?.status === "APPROVED") {
      console.log("checkrisk in fifth if");

      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#00AB66">
            APPROVED
          </Tag>
        </Space>
      );
    } else if (hiraInWorkflow?.status === "REJECTED") {
      console.log("checkrisk in sixth rejected if");

      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#EE4B2B">
            REJECTED
          </Tag>
        </Space>
      );
    } else {
      return <></>;
    }
  };

  const renderHiraStatusTag = () => {
    if (hiraRegisterData?.workflowStatus === "DRAFT") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#EEDC82">
            DRAFT
          </Tag>
        </Space>
      );
    } else if (hiraRegisterData?.workflowStatus === "IN_REVIEW") {
      return (
        <Space size={[0, 8]} wrap>
          {" "}
          <Tag className={classes.homePageTagStyle} color="#FFAC1C">
            IN REVIEW
          </Tag>
        </Space>
      );
    } else if (hiraRegisterData?.workflowStatus === "IN_APPROVAL") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#7CB9E8">
            IN APPROVAL
          </Tag>
        </Space>
      );
    } else if (hiraRegisterData?.workflowStatus === "APPROVED") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#00AB66">
            APPROVED
          </Tag>
        </Space>
      );
    } else if (hiraRegisterData?.workflowStatus === "REJECTED") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#EE4B2B">
            REJECTED
          </Tag>
        </Space>
      );
    } else {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="crimson">
            N/A
          </Tag>
        </Space>
      );
    }
  };

  const renderStatusTag = (record: any = "") => {
    // console.log("checkrisk get status callled");
    let status = !!record?.workflowStatus
      ? record?.workflowStatus
      : record?.status;
    if (status === "DRAFT") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag
            className={matches ? classes.homePageTagStyle : ""}
            color={matches ? "#EEDC82" : ""}
          >
            DRAFT
          </Tag>
        </Space>
      );
    } else if (status === "IN_REVIEW") {
      return (
        <Space size={[0, 8]} wrap>
          {" "}
          <Tag
            className={matches ? classes.homePageTagStyle : ""}
            color={matches ? "#FFAC1C" : ""}
          >
            IN REVIEW
          </Tag>
        </Space>
      );
    } else if (status === "IN_APPROVAL") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag
            className={matches ? classes.homePageTagStyle : ""}
            color={matches ? "#7CB9E8" : ""}
          >
            IN APPROVAL
          </Tag>
        </Space>
      );
    } else if (status === "APPROVED") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag
            className={matches ? classes.homePageTagStyle : ""}
            color={matches ? "#00AB66" : ""}
          >
            APPROVED
          </Tag>
        </Space>
      );
    } else if (status === "REJECTED") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag
            className={matches ? classes.homePageTagStyle : ""}
            color={matches ? "#EE4B2B" : ""}
          >
            REJECTED
          </Tag>
        </Space>
      );
    } else {
      return <></>;
    }
  };

  const checkIfUserCanAddSubStep = (record: any) => {
    if (!!editingKey || !!nestedRowKey) {
      console.log("checkrisk4 editing key", editingKey);
      return true;
    }
    // if (record?.status === "inWorkflow") {
    //   if (userDetails?.entity?.id !== record?.entityId) {
    //     if (
    //       checkIfLoggedInUserCanReview() ||
    //       checkIfLoggedInUserCanApprove() ||
    //       isLoggedInUserDeptHead
    //     ) {
    //       return false;
    //     } else {
    //       return true;
    //     }
    //   } else {
    //     if (
    //       checkIfLoggedInUserCanReview() ||
    //       checkIfLoggedInUserCanApprove() ||
    //       isLoggedInUserDeptHead
    //     ) {
    //       return false;
    //     } else {
    //       return true;
    //     }
    //   }
    // } else if (record?.status === "active") {
    //   if (
    //     userDetails?.entity?.id === record?.entityId ||
    //     isLoggedInUserDeptHead
    //   ) {
    //     if(hiraInWorkflow?.status === "REJECTED") {
    //       if(userDetails?.id === record?.createdBy){
    //         return false;
    //       } else return true
    //     }
    //   } else {
    //     return true;
    //   }
    // }
  };

  const showStartReviewButton = () => {
    if (selectedHiraId || hiraRegisterData?._id) {
      if (
        ((hiraRegisterData?.workflowStatus === "DRAFT" &&
          !hiraRegisterData?.prefixSuffix) ||
          hiraRegisterData?.workflowStatus === "REJECTED") &&
        hiraRegisterData?.entityId === userDetails?.entity?.id
      ) {
        return true;
      } else return false;
    }
    return false;
  };

  const showReviseHiraButton = () => {
    if (selectedHiraId || hiraRegisterData?._id) {
      if (
        ((hiraRegisterData?.workflowStatus === "DRAFT" &&
          !!hiraRegisterData?.prefixSuffix) ||
          hiraRegisterData?.workflowStatus === "APPROVED") &&
        hiraRegisterData?.entityId === userDetails?.entity?.id
      ) {
        return true;
      } else return false;
    }
    return false;
  };

  const showGoToWorkflowPageButton = () => {
    if (hiraRegisterData?.workflowStatus === "IN_REVIEW") {
      return true;
    } else if (hiraRegisterData?.workflowStatus === "IN_APPROVAL") {
      return true;
    } else return false;
  };

  const disableAddStepNew = () => {
    if (!!nestedRowKey || !!editingKey) {
      return true;
    }
  };

  const disableAddStep = () => {
    // console.log(
    //   "checkrisk disable add step",
    //   isHiraHeaderExist,
    //   allowToAddStep,
    //   hiraInWorkflow?.status,
    //   editingKey,
    //   userDetails?.entity?.id,
    //   hiraHeaderFormData?.entity,
    //   isLoggedInUserDeptHead
    // );

    if (editingKey !== "") {
      return true;
    }
    if (!!isHiraHeaderExist && allowToAddStep) {
      return false;
    }
    if (
      hiraInWorkflow?.status === "IN_REVIEW" ||
      hiraInWorkflow?.status === "IN_APPROVAL"
    ) {
      if (
        checkIfLoggedInUserCanReview() ||
        checkIfLoggedInUserCanApprove() ||
        isLoggedInUserDeptHead
      ) {
        return false;
      } else {
        return true;
      }
    } else if (hiraInWorkflow?.status === "APPROVED") {
      if (
        userDetails?.entity?.id === hiraHeaderFormData?.entity ||
        isLoggedInUserDeptHead
      ) {
        // console.log("checkrisk inside approved disable add step true", );

        return false;
      } else {
        // console.log("checkrisk inside approved disable add step false", );
        return true;
      }
    } else if (hiraInWorkflow?.status === "REJECTED") {
      if (
        userDetails?.entity?.id === hiraHeaderFormData?.entity ||
        isLoggedInUserDeptHead
      ) {
        return false;
      } else {
        return true;
      }
    } else if (hiraInWorkflow?.status === "open" || !hiraInWorkflow) {
      if (
        userDetails?.entity?.id === hiraHeaderFormData?.entity ||
        isLoggedInUserDeptHead
      ) {
        return false;
      } else {
        return true;
      }
    }
  };

  const checkIfUserCanAddReference = () => {
    // console.log(
    //   "checkrisk2 inside checkIfUserCanAddReference hiraHeaderFormData",
    //   hiraHeaderFormData
    // );

    if (
      !checkIfLoggedInUserCanReview() ||
      !checkIfLoggedInUserCanApprove() ||
      userDetails?.entity?.id !== hiraHeaderFormData?.entity
    ) {
      if (isLoggedInUserDeptHead) {
        return true;
      } else {
        return false;
      }
    } else if (
      checkIfLoggedInUserCanReview() ||
      checkIfLoggedInUserCanApprove() ||
      userDetails?.entity?.id === hiraHeaderFormData?.entity ||
      isLoggedInUserDeptHead
    ) {
      // console.log("checkrisk2 inside inworkflow false");

      return true;
    }
  };

  const checkIfUserCanAddReferenceNew = () => {
    if (!!isNewJob) {
      return false;
    } else if (showEditStepAndDeleteStepButton()) {
      return true;
    } else return false;
  };

  const handleConsolidatedCloseWorkflowHistoryDrawer = () => {
    setConsolidatedWorkflowHistoryDrawer({
      ...consolidatedWorkflowHistoryDrawer,
      open: !consolidatedWorkflowHistoryDrawer.open,
      data: null,
    });
  };

  const handleSubmitHeaderDetails = async () => {
    try {
      await hiraHeaderForm.validateFields();

      if (!!hiraHeaderFormData?.additionalAssesmentTeam) {
        const validateAdditionalAssesmentTeam = isValid(
          hiraHeaderFormData?.additionalAssesmentTeam
        );
        if (!validateAdditionalAssesmentTeam?.isValid) {
          enqueueSnackbar(
            `Please Enter Valid Additional Assesment Team ${validateAdditionalAssesmentTeam?.errorMessage}`,
            {
              variant: "warning",
            }
          );
          return;
        }
      }

      const response: any = await axios.put(
        `/api/riskregister/hira-register/updateHiraHeader/${selectedJobTitle}`,
        hiraHeaderFormData
      );
      console.log("checkrisk response in handleSubmitHeaderDetails", response);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar(
          `${
            response?.data?.message || "Hira Header Info Updated Successfull"
          }`,
          {
            variant: "success",
          }
        );
        setIsHiraHeaderExist(true);
      } else {
        setIsHiraHeaderExist(false);
      }
    } catch (error) {
      setIsHiraHeaderExist(false);
      console.log("checkrisk error in handleSubmitHeaderDetails", error);
    }
  };

  const handleViewClick = () => {
    setSelectedLocation(userDetails?.location?.id);
    setSelectedEntity(userDetails?.entity?.id);
    setSelectedHiraId("");
    setSelectedArea(undefined);
    getAllLocations();
    getAllDepartmentsByLocation(userDetails?.location?.id);
    navigate(`/risk/riskregister/HIRA`);
    filterForm?.setFieldsValue({
      locationId: userDetails?.location?.id,
      entityId: userDetails?.entity?.id,
      area: undefined,
    });
    setHideFilters(false);
    setSearch("");
    setHideHeaderInAllMode(true);
    setShowRequireStepMessage(false);
    setIsNewJob(false);
    setEditingKey("");
    setNestedRowKey("");
    setHiraRegisterData({});
    getHiraList(
      1,
      10,
      userDetails?.location?.id,
      userDetails?.entity?.id,
      "",
      "",
      "All",
      true
    );
  };

  const handleCreateHandler = async () => {
    // setIsCreateMode(true);
    await fetchInitialDepartment(userDetails?.entity?.id);
    getHazardTypeOptions();
    fetchHiraConfig();
    fetchUsersByLocation();
    getSectionOptions(userDetails?.entity?.id);
    setHideFilters(true);
    setHideHeaderInAllMode(false);
    setIsNewJob(true);
    setEditingKey("");
    setAllowToAddStep(false);
    setSelectedJobTitle(null);
    setSelectedHiraId(null);
    setDisableStepBtnForDiffDept(false);
    !!isNewJob && setShowUpdateButton(false);
    setTableData([]);
    setHiraInWorkflow(null);
    setHiraTableData([]);
    setIsHiraHeaderExist(false);
    setTableDataForReport([]);
    setSelectedEntityForDeptHead(null);
    setPagination((prev) => ({ ...prev, total: 0 }));
    setAllHiraTableData([]);
    setPaginationForAll((prev) => ({ ...prev, total: 0 }));
    filterForm.setFieldsValue({
      jobTitle: "",
    });
    hiraHeaderForm?.setFieldsValue({
      jobTitle: "",
      area: undefined,
      section: undefined,
      riskType: undefined,
      condition: undefined,
      assesmentTeam: [],
      entity: userDetails?.entity?.id,
      additionalAssesmentTeam: "",
    });
    setHiraHeaderFormData({
      entity: userDetails?.entity?.id,
    });
    // Set the state to indicate that the button has been clicked
    setIsNewJobClicked(true);
  };

  const handleBackClick = () => {
    console.log(
      "checkrisknew paginationforall in handlebackclick",
      paginationForAll
    );

    navigate("/risk/riskregister/HIRA");
    switchToJobPage();
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
    console.log("checkrisk hiraDetails", hiraDetails);

    if (!!hiraDetails) {
      //check if userDetails?.id is in hiraDetails?.reviewers
      const isApprover = hiraDetails?.approvers?.some(
        (approver: any) => approver === userDetails?.id
      );
      console.log("checkrisk isApprover", isApprover);

      return isApprover;
    }
  };

  const showEditStepAndDeleteStepButton = () => {
    if (
      hiraRegisterData?.workflowStatus === "DRAFT" &&
      hiraRegisterData?.entityId === userDetails?.entity?.id
    ) {
      return true;
    } else if (
      hiraRegisterData?.workflowStatus === "APPROVED" &&
      hiraRegisterData?.entityId === userDetails?.entity?.id
    ) {
      return true;
    } else if (!!isNewJob) return true;
    else {
      const targetCycleNumber = hiraRegisterData?.currentVersion + 1;
      const ongoingWorkflowDetails = hiraRegisterData?.workflow?.find(
        (item: any) => item?.cycleNumber === targetCycleNumber
      );
      console.log("checkrisk5 ongoingWorkflowDetails", ongoingWorkflowDetails);
      if (!!ongoingWorkflowDetails) {
        //check for reviewer
        if (
          hiraRegisterData?.workflowStatus === "IN_REVIEW" &&
          ongoingWorkflowDetails?.reviewers?.includes(userDetails?.id)
        ) {
          return true;
        }
        //check for approver
        else if (
          hiraRegisterData?.workflowStatus === "IN_APPROVAL" &&
          ongoingWorkflowDetails?.approvers?.includes(userDetails?.id)
        ) {
          return true;
        }
        //check for creator in rejected state
        else if (
          hiraRegisterData?.workflowStatus === "REJECTED" &&
          hiraRegisterData?.entityId === userDetails?.entity?.id
        ) {
          return true;
        } else if (
          hiraRegisterData?.workflowStatus === "APPROVED" &&
          hiraRegisterData?.entityId === userDetails?.entity?.id
        ) {
          return true;
        } else return false;
      }
    }
  };

  const showAddStep = () => {
    if (!!isHiraHeaderExist && allowToAddStep) {
      return true;
    } else if (!!isNewJob) {
      return true;
    } else if (showEditStepAndDeleteStepButton()) {
      return true;
    } else return false;
  };
  // console.log("checkrisk5 showEditStepButton", showEditStepButton({}));

  const disableEditStep = (record: any) => {
    if (editingKey !== "") {
      return true;
    }
    if (
      record?.status === "inWorkflow" &&
      !checkIfLoggedInUserCanReview() &&
      !checkIfLoggedInUserCanApprove()
    ) {
      return true;
    } else if (
      record?.status !== "inWorkflow" &&
      record?.entityId !== userDetails?.entity?.id &&
      !isLoggedInUserDeptHead
    ) {
      return true;
    }
  };

  const canHeaderBeUpdated = () => {
    if (!!selectedHiraId || !!hiraRegisterData?._id) {
      if (
        hiraRegisterData?.workflowStatus === "DRAFT" &&
        hiraRegisterData?.entityId === userDetails?.entity?.id
      ) {
        return true;
      } else if (
        hiraRegisterData?.workflowStatus === "APPROVED" &&
        hiraRegisterData?.entityId === userDetails?.entity?.id
      ) {
        return true;
      } else {
        const targetCycleNumber = hiraRegisterData?.currentVersion + 1;
        const ongoingWorkflowDetails = hiraRegisterData?.workflow?.find(
          (item: any) => item?.cycleNumber === targetCycleNumber
        );
        console.log(
          "checkrisk5 ongoingWorkflowDetails",
          ongoingWorkflowDetails
        );
        if (!!ongoingWorkflowDetails) {
          //check for reviewer
          if (
            hiraRegisterData?.workflowStatus === "IN_REVIEW" &&
            ongoingWorkflowDetails?.reviewers?.includes(userDetails?.id)
          ) {
            return true;
          }
          //check for approver
          else if (
            hiraRegisterData?.workflowStatus === "IN_APPROVAL" &&
            ongoingWorkflowDetails?.approvers?.includes(userDetails?.id)
          ) {
            return true;
          }
          //check for creator in rejected state
          else if (
            hiraRegisterData?.workflowStatus === "REJECTED" &&
            hiraRegisterData?.entityId === userDetails?.entity?.id
          ) {
            return true;
          } else if (
            hiraRegisterData?.workflowStatus === "APPROVED" &&
            userDetails?.entity?.id === hiraRegisterData?.entityId
          ) {
            return true;
          } else return false;
        }
      }
    } else return false;
  };

  const disableHeaderFields = () => {
    if (!!selectedHiraId || !!hiraRegisterData?._id) {
      // console.log("checkrisk6 inside disableHeaderFields id is found");

      if (
        hiraRegisterData?.workflowStatus === "DRAFT" &&
        hiraRegisterData?.entityId === userDetails?.entity?.id
      ) {
        // console.log("checkrisk6 in disableHeaderFields DRAFT HIRA and logged in user is creator");
        return false;
      } else if (
        hiraRegisterData?.workflowStatus === "APPROVED" &&
        hiraRegisterData?.entityId === userDetails?.entity?.id
      ) {
        return false;
      } else {
        // console.log("checkrisk6 in disableHeaderFields DRAFT HIRA and logged in user is not creator");

        const targetCycleNumber = hiraRegisterData?.currentVersion + 1;
        const ongoingWorkflowDetails = hiraRegisterData?.workflow?.find(
          (item: any) => item?.cycleNumber === targetCycleNumber
        );
        // console.log(
        //   "checkrisk6 ongoingWorkflowDetails in disableheaderfields",
        //   ongoingWorkflowDetails
        // );
        if (!!ongoingWorkflowDetails) {
          // console.log("checkrisk6 in disableHeaderFields ongoingWorkflowDetails is found");

          //check for reviewer
          if (
            hiraRegisterData?.workflowStatus === "IN_REVIEW" &&
            ongoingWorkflowDetails?.reviewers?.includes(userDetails?.id)
          ) {
            // console.log("checkrisk6 in disableHeaderFields IN_REVIEW HIRA and logged in user is reviewer");
            return false;
          }
          //check for approver
          else if (
            hiraRegisterData?.workflowStatus === "IN_APPROVAL" &&
            ongoingWorkflowDetails?.approvers?.includes(userDetails?.id)
          ) {
            // console.log("checkrisk6 in disableHeaderFields IN_APPROVAL HIRA and logged in user is approver");
            return false;
          }
          //check for creator in rejected state
          else if (
            hiraRegisterData?.workflowStatus === "REJECTED" &&
            hiraRegisterData?.entityId === userDetails?.entity?.id
          ) {
            // console.log("checkrisk6 in disableHeaderFields REJECTED HIRA and logged in user is creator");
            return false;
          } else {
            return true;
          }
        }
      }
    } else if (!!isNewJob) {
      // console.log("checkrisk6 in disableHeaderFields NEW JOB HIRA and logged in user is creator");
      return false;
    } else return true;
  };

  // console.log("checkrisk6 canHeaderBeUpdated disableHeaderFields", canHeaderBeUpdated(), disableHeaderFields());

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
      mode: isPreOrPost,
      riskId: record?.id,
    });
  };
  const handleSaveScore = (isPreOrPost: any = "", cell: any = []) => {
    if (isPreOrPost === "pre") {
      setSelectedPreCell(cell);
    } else if (isPreOrPost === "post") {
      setSelectedPostCell(cell);
    }
  };

  const handleOk = (selectedCellParam: any, isPreOrPost = "") => {
    setRiskScoreModal({
      ...riskScoreModal,
      open: !riskScoreModal.open,
    });
  };

  const toggleHiraReviewModal = () => {
    setHiraReviewModal({
      ...hiraReviewModal,
      open: !hiraReviewModal.open,
    });
  };

  const handleReviewHira = () => {
    console.log("checkrisk selected job title", selectedJobTitle);

    toggleHiraReviewModal();
  };

  const onChange = (key: any) => {
    setActiveKey(key);
    setContentVisible(true);
  };

  const getReviewedByDetails = () => {
    const latestOngoingWorkflow = hiraRegisterData?.workflow?.slice(
      hiraRegisterData?.workflow?.length - 1
    )[0];
    if (latestOngoingWorkflow?.reviewedBy) {
      return {
        reviewedBy:
          latestOngoingWorkflow?.reviewedByUserDetails?.firstname +
          " " +
          latestOngoingWorkflow?.reviewedByUserDetails?.lastname,
        reviewedOn: moment(latestOngoingWorkflow?.reviewedOn).format(
          "DD/MM/YYYY HH:mm"
        ),
      };
    } else return { reviewedBy: "N/A", reviewedOn: "N/A" };
  };

  const getApprovedByDetails = () => {
    const latestOngoingWorkflow = hiraRegisterData?.workflow?.slice(
      hiraRegisterData?.workflow?.length - 1
    )[0];
    if (latestOngoingWorkflow?.approvedBy) {
      return {
        approvedBy:
          latestOngoingWorkflow?.approvedByUserDetails?.firstname +
          " " +
          latestOngoingWorkflow?.approvedByUserDetails?.lastname,
        approvedOn: moment(latestOngoingWorkflow?.approvedOn).format(
          "DD/MM/YYYY HH:mm"
        ),
      };
    } else return { approvedBy: "N/A", approvedOn: "N/A" };
  };

  const latestOngoingWorkflow = () => {
    return hiraRegisterData?.workflow?.slice(
      hiraRegisterData?.workflow?.length - 1
    )[0];
  };

  const tabs = [
    {
      label: "Steps",
      key: "1",
      children: (
        <>
          {/* { */}
          {/* isNewJob && ( */}
          <Form
            form={hiraForm}
            component={false}
            onValuesChange={(changedValues, allValues) => {
              const key = editingKey; // Use the editing row's key to identify it

              if ("preProbability" in changedValues) {
                updateRiskScores(
                  key,
                  "preProbability",
                  changedValues.preProbability
                );
              }
              if ("preSeverity" in changedValues) {
                updateRiskScores(key, "preSeverity", changedValues.preSeverity);
              }
              if ("postProbability" in changedValues) {
                updateRiskScores(
                  key,
                  "postProbability",
                  changedValues.postProbability
                );
              }
              if ("postSeverity" in changedValues) {
                updateRiskScores(
                  key,
                  "postSeverity",
                  changedValues.postSeverity
                );
              }
            }}
          >
            <div className={classes.tableContainer} id="table1" ref={ref4}>
              <Table
                components={{
                  body: {
                    cell: (props: any) => (
                      <EditableCell
                        {...props}
                        hazardTypeOptions={hazardTypeOptions}
                        handleCopyRow={handleCopyRow}
                        nestedRowKey={nestedRowKey}
                        locationWiseUsers={locationWiseUsers}
                        value={value}
                        setValue={setValue}
                      />
                    ),
                  },
                }}
                bordered
                dataSource={hiraTableData}
                size="small"
                columns={columns}
                rowClassName={(record, index) => {
                  return record.key === `new_${hiraTableData.length - 1}`
                    ? "new-row"
                    : "";
                }}
                pagination={false}
                // onChange={(tblPagination: any, filters, sorter: any) => {
                //   const sort = {
                //     field: sorter.field,
                //     order: sorter.order,
                //   };
                //   fetchRisks(
                //     selectedJobTitle,
                //     sort,
                //     tblPagination?.current,
                //     tblPagination?.pageSize,
                //     selectedEntity || ""
                //   );
                // }}
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
          </Form>
          {/* )}   */}
        </>
      ),
    },

    {
      label: "Info",
      key: "2",
      children: (
        <>
          {isTableDataLoaded &&
            selectedHiraId &&
            !isNewJob &&
            !hideHeaderInAllMode && (
              <div ref={ref5ForViewJob}>
                <Descriptions
                  bordered
                  size="small"
                  className={classes.descriptionItemStyle}
                  column={{
                    xxl: 3,
                    xl: 3,
                    lg: 2,
                    md: 2,
                    sm: 1,
                    xs: 1,
                  }}
                >
                  {!hiraWithStepsLoading && (
                    <Descriptions.Item
                      label="Created By:"
                      style={{ textTransform: "capitalize" }}
                    >
                      {hiraRegisterData?.createdByUserDetails?.firstname +
                        " " +
                        hiraRegisterData?.createdByUserDetails?.lastname ||
                        "N/A"}{" "}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item
                    label="Reviewed By:"
                    style={{ textTransform: "capitalize" }}
                  >
                    {getReviewedByDetails()?.reviewedBy || "N/A"}
                  </Descriptions.Item>

                  <Descriptions.Item
                    label="Approved By :"
                    style={{ textTransform: "capitalize" }}
                  >
                    {getApprovedByDetails()?.approvedBy || "N/A"}
                  </Descriptions.Item>
                  {!hiraWithStepsLoading && (
                    <Descriptions.Item label="Created On : ">
                      {hiraRegisterData?.hiraCreatedAt
                        ? moment(hiraRegisterData?.hiraCreatedAt).format(
                            "DD/MM/YYYY HH:mm"
                          )
                        : "N/A"}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Reviewed On : ">
                    {getReviewedByDetails()?.reviewedOn || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Approved On :">
                    {getApprovedByDetails()?.approvedOn || "N/A"}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
        </>
      ),
    },
    {
      label: "References",
      key: "3",
      children: contentVisible ? (
        <div ref={ref6ForViewJob}>
          <HiraReferences
            drawer={referencesDrawer}
            workflowStatus={hiraRegisterData?.workflowStatus}
            checkIfUserCanAddReference={checkIfUserCanAddReferenceNew}
            hiraId={hiraRegisterData?._id}
          />
        </div>
      ) : null,
    },
    {
      label: "Revision History",
      key: "4",
      children: (
        <>
          <div ref={ref7ForViewJob}>
            <HiraConsolidatedWorkflowHistoryDrawer
              consolidatedWorkflowHistoryDrawer={{
                open: true,
                data: hiraRegisterData,
              }}
              handleConsolidatedCloseWorkflowHistoryDrawer={
                handleConsolidatedCloseWorkflowHistoryDrawer
              }
            />
          </div>
        </>
      ),
    },
  ];

  const handleUpdateRefs = async () => {
    console.log("checkrisk refs in handleUpdateRefs", refData);
  };

  const handleCopyRow = (record: any, dataIndex: any) => {
    console.log("checkrisk record in handleCopyRow", record);
    console.log("checkrisk hiraTableData in handleCopyRow", hiraTableData);

    // Find the index of the record object in hiraTableData
    const recordIndex = hiraTableData.findIndex(
      (item: any) => item.key === record.key
    );

    // Check if there is a previous object
    if (recordIndex > 0) {
      const previousObject = hiraTableData[recordIndex - 1];
      console.log("checkrisk Previous object:", previousObject);

      // Update the jobBasicStep of the record object in hiraTableData
      if (dataIndex === "jobBasicStep") {
        const updatedHiraTableData = hiraTableData.map((item: any) => {
          if (item.id === record.id) {
            return {
              ...item,
              jobBasicStep: previousObject?.jobBasicStep,
            };
          }
          return item;
        });

        console.log(
          "checkrisk Updated hiraTableData for jobBasicStep:",
          updatedHiraTableData
        );

        hiraForm.setFieldsValue({
          jobBasicStep: previousObject?.jobBasicStep,
        });
        // Update the state with the modified hiraTableData
        setHiraTableData([...updatedHiraTableData]);
      } else if (dataIndex === "hazardType") {
        const updatedHiraTableData = hiraTableData.map((item: any) => {
          if (item.id === record.id) {
            return {
              ...item,
              hazardType: previousObject?.selectedHazardType?._id,
              hazardName: previousObject?.selectedHazardType?.name,
            };
          }
          return item;
        });

        console.log(
          "checkrisk Updated hiraTableData for HazardType:",
          updatedHiraTableData
        );

        hiraForm.setFieldsValue({
          hazardType: previousObject?.selectedHazardType?._id,
          hazardName: previousObject?.selectedHazardType?.name,
        });
        // Update the state with the modified hiraTableData
        setHiraTableData([...updatedHiraTableData]);
      }
    } else {
      console.log(
        "checkrisk This is the first object. There is no previous object."
      );
    }
  };

  const handleTourClose = () => {
    setTourOpen(false);
    setIsNewJobClicked(false); // Reset the state when the tour is closed
  };

  const hazardTypesColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: any) => {
        let displayText = text;
        let isTruncated = false;

        if (text && text.length > 40) {
          displayText = text.substring(0, 40) + "...";
          isTruncated = true;
        }
        return isTruncated ? (
          <Tooltip title={text}>
            <div
              style={{
                verticalAlign: "top", // Align text to the top
                // display: "block", // Make the content behave like a block element
              }}
            >
              {displayText}
            </div>
          </Tooltip>
        ) : (
          <div
            style={{
              verticalAlign: "top", // Align text to the top
              // display: "block", // Make the content behave like a block element
            }}
          >
            {displayText}
          </div>
        );
      },
    },
    {
      title: "Hazard Description",
      dataIndex: "description",
      // width: 400,
      key: "description",
      render: (text: any) => {
        let displayText = text;
        let isTruncated = false;

        if (text && text.length > 40) {
          displayText = text.substring(0, 40) + "...";
          isTruncated = true;
        }
        // return
        //  isTruncated ? (
        //   <Tooltip title={text}>
        //     <div
        //       style={{
        //         verticalAlign: "top", // Align text to the top
        //         // display: "block", // Make the content behave like a block element
        //       }}
        //     >
        //       {displayText}
        //     </div>
        //   </Tooltip>
        // ) :
        return (
          <div
            style={{
              verticalAlign: "top", // Align text to the top
              // display: "block", // Make the content behave like a block element
            }}
          >
            {text}
          </div>
        );
      },
    },
  ];

  const handleSearch = async () => {
    getHiraWithSteps(
      selectedHiraId,
      pagination?.current,
      pagination?.pageSize,
      search
    );
  };

  const handleClearSearchForSteps = async () => {
    getHiraWithSteps(selectedHiraId, pagination?.current, pagination?.pageSize);
  };

  const handleClearSearchForAllJobs = async (
    page: any = 1,
    pageSize: any = 10,
    locationId = "",
    entityId = "",
    area = "",
    section = "",
    workflowStatus = "All",
    pagination: any = true
  ) => {
    try {
      setAllHiraTableLoading(true);
      let query = `/api/riskregister/hira/getHiraList/${orgId}?`;
      if (pagination) {
        query += `page=${page}&pageSize=${pageSize}`;
      }
      if (entityId) {
        query += `&entityId=${entityId}`;
      }
      if (locationId) {
        query += `&locationId=${locationId}`;
      }
      if (area) {
        query += `&area=${area}`;
      }
      if (section) {
        query += `&section=${section}`;
      }
      if (!!workflowStatus && workflowStatus !== "All") {
        query += `&workflowStatus=${workflowStatus}`;
      }
      const res = await axios.get(query);
      // console.log("checkrisk3 res in getHiraList", res);

      if (res.status === 200 || res.status === 201) {
        if (!!res.data && !!res.data?.list?.length) {
          setAllHiraTableData(res.data?.list);
          setPaginationForAll((prev) => ({
            ...prev,
            total: res.data.total,
          }));
          setHideHeaderInAllMode(true);
          setAllHiraTableLoading(false);
        } else {
          setAllHiraTableData([]);
          setPaginationForAll((prev) => ({ ...prev, total: 0 }));
          setHideHeaderInAllMode(true);
          setAllHiraTableLoading(false);
        }
      } else {
        setAllHiraTableData([]);
        setPaginationForAll((prev) => ({ ...prev, total: 0 }));
        setHideHeaderInAllMode(true);
        enqueueSnackbar("Error in fetching HIRA list", {
          variant: "error",
        });
        setAllHiraTableLoading(false);
      }
    } catch (error) {
      console.log("checkrisk3 error in getHiraList-->", error);
      setAllHiraTableLoading(false);
    }
  };

  const toggleCommentsDrawer = () => {
    setHiraWorkflowCommentsDrawer({
      ...hiraWorkflowCommentsDrawer,
      open: !hiraWorkflowCommentsDrawer.open,
      data: null,
    });
  };

  // mobile view filter moda.

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOkModal2 = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState("Steps");
  console.log("selectedValue", selectedValue);
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

  return (
    <>
      <Box
        sx={{
          bgcolor: "background.paper",
          marginTop: "10px",
          alignItems: "center",
          display: "flex",
        }}
      >
        {(isMCOE || isMR) && matches && (
          <div
            onClick={configHandler}
            style={{
              display: "flex",
              alignItems: "center",
              // justifyContent: "center",
              padding: "4px 10px 4px 10px",
              cursor: "pointer",
              borderRadius: "5px",
              position: "relative",
            }}
          >
            <OrgSettingsIcon className={classes.docNavIconStyle} />
            <span
              className={`${classes.docNavText}`}
              style={{
                color: "black",
              }}
            >
              Settings
            </span>
          </div>
        )}
        <div
          onClick={handleViewClick}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "4px 10px 4px 10px",
            cursor: "pointer",
            borderRadius: "5px",
            position: "relative", // this is needed for the pseudo-element arrow
            backgroundColor: hideFilters ? "" : "#3576BA", // conditional background color
          }}
        >
          <AllDocIcon
            style={{
              fill: hideFilters ? "black" : "white",
              width: "22px",
              height: "20px",
              marginRight: "4px",
            }}
          />
          <span
            className={`${classes.docNavText}`}
            style={{
              color: hideFilters ? "black" : "white",
            }}
          >
            View
          </span>
        </div>
        {hideFilters && (
          <Button
            onClick={() => handleBackClick()}
            style={{
              marginLeft: "10px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronLeftIcon fontSize="small" />
            Back
          </Button>
        )}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            marginRight: "15px",
          }}
        >
          {(selectedHiraId || hiraRegisterData?._id) && matches && (
            <>
              <Tooltip title={"Export to PDF"}>
                <IconButton
                  onClick={handleExport}
                  style={{ padding: "10px", color: "red" }}
                >
                  <FilePdfOutlined width={20} height={20} />
                </IconButton>
              </Tooltip>
              <Tooltip title={"Export to Excel"}>
                <IconButton
                  onClick={handleExportToExcel}
                  style={{ padding: "10px", color: "green" }}
                >
                  <FileExcelOutlined width={20} height={20} />
                </IconButton>
              </Tooltip>
            </>
          )}
          {!hideFilters && matches && (
            <Button
              type="default"
              onClick={handleCreateHandler}
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#003566",
                color: "white",
                marginRight: "5px",
              }}
            >
              Create
            </Button>
          )}
          {!hideFilters && matches && (
            <Button
              type="default"
              onClick={() => navigate("/risk/riskregister/HIRA/import")}
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#003566",
                color: "white",
                marginRight: "5px",
              }}
            >
              Import
            </Button>
          )}

          <div style={{ marginRight: "10px" }}>
            <Tooltip title="Hazard Types Info!" color="blue">
              <IconButton
                aria-label="help"
                onClick={() => setHazardTypeTableModal(true)}
              >
                <InfoRoundedIcon style={{ fill: "#003566" }} />
              </IconButton>
            </Tooltip>
          </div>
          {matches ? (
            ""
          ) : (
            <div style={{}}>
              {!selectedHiraId && (
                <FilterIcon
                  style={{ width: "24px", height: "24px", marginTop: "3px" }}
                  onClick={showModal}
                />
              )}
            </div>
          )}
          {matches ? (
            <div style={{ marginRight: "20px" }}>
              <Tooltip title="Help Tours!" color="blue">
                <Popover
                  content={
                    <div>
                      <p
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          border: "1px solid #efefef",
                          padding: "4px",
                        }}
                        onClick={() => {
                          setTourOpen(true);
                          setTourPopoverVisible(false); // Close the popover
                        }}
                      >
                        <AssignmentIcon style={{ marginRight: "8px" }} /> How to
                        Add New Job
                      </p>
                      <p
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          border: "1px solid #efefef",
                          padding: "4px",
                        }}
                        onClick={() => {
                          setTourOpenForViewJob(true);
                          setTourPopoverVisible(false); // Close the popover
                        }}
                      >
                        <AssignmentIcon style={{ marginRight: "8px" }} /> How to
                        see Info on HIRA
                      </p>
                      <p
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          border: "1px solid #efefef",
                          padding: "4px",
                        }}
                        onClick={() => {
                          setTourOpenForWorkflow(true);
                          setTourPopoverVisible(false); // Close the popover
                        }}
                      >
                        <AssignmentIcon style={{ marginRight: "8px" }} /> How to
                        send HIRA for Workflow
                      </p>
                    </div>
                  }
                  trigger="click"
                  open={tourPopoverVisible}
                  onOpenChange={(visible) => setTourPopoverVisible(visible)}
                >
                  <div style={{ marginRight: "20px" }}>
                    <IconButton aria-label="help">
                      <TouchAppIcon style={{ fill: "black" }} />
                    </IconButton>
                  </div>
                </Popover>
              </Tooltip>
            </div>
          ) : (
            ""
          )}

          {selectedHiraId && matches ? (
            <>
              <div style={{ marginRight: "20px" }}>
                <span style={{ fontWeight: "bold" }}>HIRA Number: </span>
                {hiraRegisterData?.prefixSuffix || "N/A"}
              </div>
              <div ref={ref2ForViewJob}>
                {selectedHiraId && renderHiraStatusTag()}
              </div>
            </>
          ) : (
            ""
          )}
        </div>
      </Box>
      {matches ? (
        ""
      ) : (
        <div style={{ width: "100%", marginTop: "5px" }}>
          <span style={{ fontWeight: "bold" }}>HIRA Number: </span>
          {hiraRegisterData?.prefixSuffix || "N/A"}
        </div>
      )}
      {isLoading ? (
        <Box
          width={350}
          height={150}
          display="flex"
          justifyContent="center"
          alignItems="center"
          style={{ margin: "auto" }}
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
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {!hideFilters && matches && (
                <Form
                  layout={"inline"}
                  form={filterForm}
                  rootClassName={classes.labelStyle}
                  initialValues={{
                    locationId: userDetails?.location?.id,
                    entityId: userDetails?.entity?.id,
                  }}
                >
                  <Form.Item
                    label="Unit"
                    name="locationId"
                    style={{ minWidth: "190px", maxWidth: "450px" }}
                  >
                    <Select
                      showSearch
                      placeholder="Select Unit"
                      optionFilterProp="children"
                      filterOption={(input: any, option: any) =>
                        (option?.children ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      style={{
                        width: "100%",
                        border: "1px solid black",
                        borderRadius: "5px",
                      }}
                      value={selectedLocation}
                      onChange={(value) => handleLocationChange(value)}
                      listHeight={200}
                      // dropdownRender={(menu) => (
                      //   <Paper style={{ padding: "1px" }}>{menu}</Paper>
                      // )}
                    >
                      {locationOptions.map((option: any) => (
                        <Select.Option key={option.value} value={option.value}>
                          {option.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="Entity"
                    name="entityId"
                    style={{ minWidth: "200px", maxWidth: "450px" }}
                  >
                    {/* <Select
                      showSearch
                      allowClear
                      placeholder="Select Area/Deparment"
                      optionFilterProp="children"
                      filterOption={(input: any, option: any) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      style={{
                        width: "100%",
                        border: "1px solid black",
                        borderRadius: "5px",
                      }}
                      value={() => {
                        if (location.pathname.includes("HIRA/")) {
                          return undefined;
                        } else {
                          return selectedEntity || undefined;
                        }
                      }}
                      options={departmentOptions || []}
                      onChange={(value) => handleDepartmentChange(value)}
                      listHeight={200}
                    /> */}
                    <DepartmentSelector
                      locationId={selectedLocation}
                      selectedDepartment={selectedDept}
                      onSelect={(dept, type) => {
                        setSelectedDept({ ...dept, type });
                        handleDepartmentChange(dept?.id);
                        filterForm.setFieldsValue({
                          entityId: dept?.id,
                        });
                      }}
                      onClear={() => {
                        filterForm.setFieldsValue({
                          entityId: undefined,
                        });
                        setSelectedDept(null);
                        setSelectedEntity(undefined);
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Area"
                    name="area"
                    style={{ minWidth: "200px", maxWidth: "450px" }}
                  >
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select Area"
                      optionFilterProp="children"
                      filterOption={(input: any, option: any) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      style={{
                        width: "100%",
                        border: "1px solid black",
                        borderRadius: "5px",
                      }}
                      value={selectedArea || undefined}
                      options={areaOptions || []}
                      onChange={(value) => handleAreaChange(value)}
                      listHeight={200}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Section"
                    name="section"
                    style={{ minWidth: "200px", maxWidth: "450px" }}
                  >
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select Section"
                      optionFilterProp="children"
                      filterOption={(input: any, option: any) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      style={{
                        width: "100%",
                        border: "1px solid black",
                        borderRadius: "5px",
                      }}
                      value={selectedSection || undefined}
                      options={sectionOptions || []}
                      onChange={(value) => handleSectionChange(value)}
                      listHeight={200}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Status"
                    name="workflowStatus"
                    style={{ minWidth: "200px", maxWidth: "450px" }}
                  >
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select Status"
                      optionFilterProp="children"
                      filterOption={(input: any, option: any) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      style={{
                        width: "100%",
                        border: "1px solid black",
                        borderRadius: "5px",
                      }}
                      value={selectedStatus || "All"}
                      options={statusOptions || []}
                      onChange={(value) => handleStatusChange(value)}
                      listHeight={200}
                    />
                  </Form.Item>

                  <Button
                    type="default"
                    onClick={handleClickFetch}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#003566",
                      color: "white",
                      marginRight: "5px",
                    }}
                  >
                    Fetch
                  </Button>
                </Form>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {hiraInWorkflowLoading ? (
                  <>
                    <CircularProgress />
                  </>
                ) : (
                  <>
                    {showStartReviewButton() && (
                      <Button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "#003566",
                          color: "white",
                        }}
                        onClick={handleStartReviewNew}
                        ref={refStartWorkflowButton}
                      >
                        Start Review/Approval
                      </Button>
                    )}

                    {showReviseHiraButton() && (
                      <Button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "#003566",
                          color: "white",
                        }}
                        onClick={handleStartReviewNew}
                        ref={refReviseButton}
                      >
                        Revise HIRA
                      </Button>
                    )}

                    {showGoToWorkflowPageButton() && (
                      <Button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "#003566",
                          color: "white",
                        }}
                        onClick={handleGoToWorkflowPageClick}
                      >
                        Go To Workflow Page
                      </Button>
                    )}
                  </>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  justifyContent: "flex-start",
                }}
              >
                {!hideFilters && (
                  <div
                    style={{
                      marginLeft: "auto",
                      display: "flex",
                      marginBottom: "10px",
                    }}
                  >
                    <Input
                      size="small"
                      style={{ marginRight: "20px" }}
                      allowClear
                      placeholder="Search Job"
                      onChange={(event) => {
                        // Check if the input has been cleared
                        if (event.target.value === "") {
                          handleClearSearchForAllJobs(
                            1,
                            10,
                            selectedLocation,
                            selectedEntity,
                            selectedArea,
                            selectedSection,
                            selectedStatus,
                            true
                          ); // Call the handleClear function when the input is cleared
                        }
                        setSearch(event.target.value);
                      }}
                      prefix={<SearchIcon />}
                      suffix={
                        <Button
                          type="text"
                          className={classes.searchIcon}
                          icon={<SendIcon />}
                          onClick={() =>
                            getHiraList(
                              1,
                              10,
                              selectedLocation,
                              selectedEntity,
                              selectedArea,
                              selectedSection,
                              "All",
                              false
                            )
                          }
                        />
                      }
                    />
                  </div>
                )}
              </div>
            </div>
            <>
              {hiraWithStepsLoading ? (
                <Skeleton active />
              ) : (
                <>
                  {(selectedHiraId || isNewJob) && (
                    <div
                      style={{ marginBottom: "15px" }}
                      className={classes.descriptionLabelStyle}
                      ref={ref2}
                    >
                      <Form
                        form={hiraHeaderForm}
                        layout="vertical"
                        onValuesChange={(changedValues, allValues) => {
                          setHiraHeaderFormData({
                            ...hiraHeaderFormData,
                            ...changedValues,
                          });
                        }}
                      >
                        <Descriptions
                          bordered
                          size="small"
                          column={{
                            xxl: 3, // or any other number of columns you want for xxl screens
                            xl: 3, // or any other number of columns you want for xl screens
                            lg: 2, // or any other number of columns you want for lg screens
                            md: matches ? 2 : 1, // or any other number of columns you want for md screens
                            sm: 1, // or any other number of columns you want for sm screens
                            xs: 1, // or any other number of columns you want for xs screens
                          }}
                          layout={matches ? "horizontal" : "vertical"}
                        >
                          <Descriptions.Item label="Job Title* : ">
                            <Form.Item
                              name="jobTitle"
                              rules={[
                                {
                                  required: true,
                                  message: "Please input your job title!",
                                },
                              ]}
                              className={classes.disabledInput}
                              style={{ marginBottom: 0 }}
                            >
                              <Input
                                placeholder="Enter Job Title"
                                size="large"
                                disabled={disableHeaderFields()}
                              />
                            </Form.Item>
                          </Descriptions.Item>
                          <Descriptions.Item label="Area* : ">
                            <Form.Item
                              name="area"
                              rules={[
                                {
                                  required: true,
                                  message: "Please Input Your Area!",
                                },
                              ]}
                              className={classes.disabledInput}
                              style={{ marginBottom: 0 }}
                            >
                              <Select
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input: any, option: any) =>
                                  (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                                placeholder="Select Area"
                                allowClear
                                style={{ width: "100%" }}
                                options={areaOptions}
                                disabled={disableHeaderFields()}
                                size="large"
                                listHeight={200}
                              />
                            </Form.Item>
                          </Descriptions.Item>
                          <Descriptions.Item label="Section : ">
                            <Form.Item
                              name="section"
                              className={classes.disabledInput}
                              style={{ marginBottom: 0 }}
                            >
                              <Select
                                placeholder="Select Section"
                                allowClear
                                style={{ width: "100%" }}
                                options={sectionOptions}
                                size="large"
                                disabled={disableHeaderFields()}
                                listHeight={200}
                              />
                            </Form.Item>
                          </Descriptions.Item>
                          <Descriptions.Item label="Routine/Non Routine*:">
                            <Form.Item
                              name="riskType"
                              style={{ marginBottom: 0 }}
                              rules={[
                                {
                                  required: true,
                                  message: "Please Select Risk Type!",
                                },
                              ]}
                              className={classes.disabledSelect}
                            >
                              <Select
                                placeholder="Select Routine/Non Routine"
                                allowClear
                                style={{ width: "100%" }}
                                options={riskTypeOptions}
                                disabled={disableHeaderFields()}
                                size="large"
                                listHeight={200}
                              />
                            </Form.Item>
                          </Descriptions.Item>
                          <Descriptions.Item label="Condition*:">
                            <Form.Item
                              name="condition"
                              style={{ marginBottom: 0 }}
                              rules={[
                                {
                                  required: true,
                                  message: "Please Select Condition!",
                                },
                              ]}
                              className={classes.disabledSelect}
                            >
                              <Select
                                placeholder="Select Condition"
                                allowClear
                                style={{
                                  width: "100%",
                                }}
                                options={conditionOptions}
                                size="large"
                                disabled={disableHeaderFields()}
                                listHeight={200}
                              />
                            </Form.Item>
                          </Descriptions.Item>
                          <Descriptions.Item label="Assessment Team*: ">
                            <Form.Item
                              // label="Assesment Team: "
                              className={classes.disabledMultiSelect}
                              name="assesmentTeam"
                              style={{ marginBottom: 0 }}
                              rules={[
                                {
                                  required: true,
                                  message: "Please Select Team!",
                                },
                              ]}
                            >
                              <Select
                                showSearch
                                placeholder="Select Team"
                                allowClear
                                style={{
                                  width: "100%",
                                }}
                                mode="multiple"
                                options={locationWiseUsers || []}
                                size="large"
                                filterOption={(input, option: any) =>
                                  option?.label
                                    ?.toLowerCase()
                                    .indexOf(input?.toLowerCase()) >= 0
                                }
                                disabled={disableHeaderFields()}
                                listHeight={200}
                              />
                            </Form.Item>
                          </Descriptions.Item>
                          <Descriptions.Item label="Corp Func/Unit: ">
                            <Form.Item
                              className={classes.disabledInput}
                              style={{ marginBottom: 0 }}
                              // name="unit"
                            >
                              <Input
                                // placeholder="Enter Area"
                                value={
                                  !!isNewJob
                                    ? userDetails?.location?.locationName
                                    : locationForSelectedJob?.locationName
                                }
                                size="large"
                                disabled={true}
                              />
                            </Form.Item>
                          </Descriptions.Item>
                          <Descriptions.Item label="Entity: ">
                            {entityOptionsForDeptHead?.length && isNewJob ? (
                              <Form.Item
                                className={classes.disabledInput}
                                style={{ marginBottom: 0 }}
                                name="entity"
                                rules={[
                                  {
                                    required: true,
                                    message: "Please Select Entity!",
                                  },
                                ]}
                              >
                                {/* <Select
                                  showSearch
                                  // placeholder="Filter By Area/Deparment"
                                  placeholder="Select Dept/Vertical"
                                  optionFilterProp="children"
                                  filterOption={(input: any, option: any) =>
                                    (option?.label ?? "")
                                      .toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                  style={{ width: "100%" }}
                                  value={selectedEntityForDeptHead}
                                  options={entityOptionsForDeptHead || []}
                                  onChange={(value) => {
                                    setSelectedEntityForDeptHead(value);

                                    hiraHeaderForm.setFieldsValue({
                                      section: undefined,
                                    });
                                    getSectionOptions(value);
                                  }}
                                  size="large"
                                  listHeight={200}
                                /> */}
                                <DepartmentSelector
                                  locationId={
                                    !!isNewJob
                                      ? userDetails?.location?.id
                                      : locationForSelectedJob?.id
                                  }
                                  selectedDepartment={selectedEntityForDeptHead}
                                  onSelect={(dept, type) => {
                                    setSelectedEntityForDeptHead({
                                      ...dept,
                                      type,
                                    });
                                    hiraHeaderForm.setFieldsValue({
                                      section: undefined,
                                    });
                                    getSectionOptions(dept?.id);
                                  }}
                                  onClear={() =>
                                    setSelectedEntityForDeptHead(null)
                                  }
                                  disabled={entityOptionsForDeptHead?.length === 0}
                                />
                              </Form.Item>
                            ) : (
                              <Form.Item
                                className={classes.disabledInput}
                                style={{ marginBottom: 0 }}
                              >
                                <DepartmentSelector
                                  locationId={
                                    !!isNewJob
                                      ? userDetails?.location?.id
                                      : locationForSelectedJob?.id
                                  }
                                  selectedDepartment={selectedDept}
                                  onSelect={(dept, type) => {}}
                                  onClear={() => {}}
                                  disabled={true}
                                />
                              </Form.Item>
                            )}
                          </Descriptions.Item>
                          <Descriptions.Item label="Additional Assessment Team: ">
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Form.Item
                                style={{ marginBottom: 0, flex: 1 }}
                                name="additionalAssesmentTeam"
                                className={classes.disabledInput}
                              >
                                <Input
                                  placeholder="Enter Additional Team Members"
                                  size="large"
                                  width={"100%"}
                                  disabled={disableHeaderFields()}
                                />
                              </Form.Item>
                              {canHeaderBeUpdated() && (
                                <Button
                                  style={{
                                    backgroundColor: "#003566",
                                    color: "white",
                                    marginLeft: "20px", // Add some space between the input and the button
                                  }}
                                  type="primary"
                                  onClick={handleUpdateHeader}
                                >
                                  Update Header
                                </Button>
                              )}
                            </div>
                          </Descriptions.Item>
                        </Descriptions>
                      </Form>
                    </div>
                  )}
                  {!!showRequireStepMessage && (
                    <div
                      style={{
                        color: "red",
                        display: "flex",
                        marginRight: "10px",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      <>
                        Please Add Atleast One Step and Click On
                        <CheckCircleIcon
                          width={18}
                          height={18}
                          style={{
                            fill: "blue",
                            marginLeft: "4px",
                            marginRight: "4px",
                          }}
                        />
                        To Submit the Job!
                      </>
                    </div>
                  )}
                  {(selectedHiraId || isNewJob) && (
                    <div
                      className={classes.tabsWrapper}
                      style={{
                        marginBottom: "10px",
                        position: "relative",
                        marginTop: matches ? "0px" : "30px",
                      }}
                    >
                      {matches ? (
                        <Tabs
                          onChange={onChange}
                          type="card"
                          items={tabs}
                          activeKey={activeKey}
                          onTabClick={() => {
                            setContentVisible((prev: any) => !prev);
                          }}
                          animated={{ inkBar: true, tabPane: true }}
                        />
                      ) : (
                        <div>
                          <FormControl
                            variant="outlined"
                            size="small"
                            fullWidth
                            //  className={classes.formControl}
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              width: "100%",
                            }}
                          >
                            <InputLabel>Menu List</InputLabel>
                            <MuiSelect
                              label="Menu List"
                              value={selectedValue}
                              onChange={handleDataChange}
                            >
                              <MenuItem value={"Steps"}>
                                <div
                                  style={{
                                    backgroundColor:
                                      selectedValue === "Steps"
                                        ? "#3576BA"
                                        : "white",
                                    textAlign: "center",
                                    padding: "5px 10px",
                                    borderRadius: "5px",
                                    color:
                                      selectedValue === "Steps"
                                        ? "white"
                                        : "black",
                                  }}
                                >
                                  {" "}
                                  Steps
                                </div>
                              </MenuItem>
                              <MenuItem value={"Info"}>
                                {" "}
                                <div
                                  style={{
                                    backgroundColor:
                                      selectedValue === "Info"
                                        ? "#3576BA"
                                        : "white",
                                    textAlign: "center",
                                    padding: "5px 10px",
                                    borderRadius: "5px",
                                    color:
                                      selectedValue === "Info"
                                        ? "white"
                                        : "black",
                                  }}
                                >
                                  Info
                                </div>
                              </MenuItem>
                              <MenuItem value={"References"}>
                                <div
                                  style={{
                                    backgroundColor:
                                      selectedValue === "References"
                                        ? "#3576BA"
                                        : "white",
                                    textAlign: "center",
                                    padding: "5px 10px",
                                    borderRadius: "5px",
                                    color:
                                      selectedValue === "References"
                                        ? "white"
                                        : "black",
                                  }}
                                >
                                  References
                                </div>
                              </MenuItem>
                              <MenuItem value={"History"}>
                                <div
                                  style={{
                                    backgroundColor:
                                      selectedValue === "History"
                                        ? "#3576BA"
                                        : "white",
                                    textAlign: "center",
                                    padding: "5px 10px",
                                    borderRadius: "5px",
                                    color:
                                      selectedValue === "History"
                                        ? "white"
                                        : "black",
                                  }}
                                >
                                  Revision History
                                </div>
                              </MenuItem>
                            </MuiSelect>
                          </FormControl>
                        </div>
                      )}
                      {matches ? (
                        " "
                      ) : (
                        <div style={{ marginTop: "15px" }}>
                          {selectedValue === "Steps" ? (
                            <div>
                              <>
                                {/* { */}
                                {/* isNewJob && ( */}
                                <Form form={hiraForm} component={false}>
                                  <div
                                    className={classes.tableContainer}
                                    id="table1"
                                    ref={ref4}
                                  ></div>

                                  <div
                                    style={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      justifyContent: "space-evenly",
                                      width: "100%",
                                      // height: "100vh",
                                      overflowY: "scroll",
                                      marginBottom: "40px",
                                    }}
                                  >
                                    {hiraTableData?.map((record: any) => (
                                      <div
                                        style={{
                                          border: "1px solid black",
                                          borderRadius: "5px",
                                          padding: "5px",
                                          margin: "10px",
                                          width: smallScreen ? "45%" : "100%",
                                        }}
                                      >
                                        <p
                                          // onClick={() => }
                                          style={{
                                            padding: "3px 10px",
                                            backgroundColor: "#9FBFDF",
                                            borderRadius: "2px",
                                            cursor: "pointer",
                                          }}
                                        >
                                          {record?.jobBasicStep}
                                        </p>

                                        <p>
                                          Hazard Type :{" "}
                                          {record?.hazardName || "N/A"}
                                        </p>
                                        <p>
                                          Hazard Description :{" "}
                                          {record?.hazardDescription || "N/A"}
                                        </p>
                                        <p>
                                          P*S (Base Risk) :{" "}
                                          <span
                                            onClick={() =>
                                              toggleScoreModal(record, "pre")
                                            }
                                          >
                                            {record?.preSeverity *
                                              record?.preProbability || "N/A"}
                                          </span>{" "}
                                        </p>
                                        <p>
                                          Responsible Person :{" "}
                                          {(!record.type &&
                                            record?.responsiblePersonName) ||
                                            ""}{" "}
                                        </p>
                                        <p>
                                          P*S (Residual Risk) :{" "}
                                          <span
                                            onClick={() =>
                                              toggleScoreModal(record, "post")
                                            }
                                          >
                                            {record?.postSeverity *
                                              record?.postProbability || "N/A"}
                                          </span>{" "}
                                        </p>
                                      </div>
                                    ))}
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
                                </Form>
                                {/* )}   */}
                              </>
                            </div>
                          ) : (
                            ""
                          )}
                          {selectedValue === "Info" ? (
                            <div>
                              <>
                                {isTableDataLoaded &&
                                  selectedHiraId &&
                                  !isNewJob &&
                                  !hideHeaderInAllMode && (
                                    <div ref={ref5ForViewJob}>
                                      <Descriptions
                                        bordered
                                        size="small"
                                        className={classes.descriptionItemStyle}
                                        column={{
                                          xxl: 3,
                                          xl: 3,
                                          lg: 2,
                                          md: 2,
                                          sm: 1,
                                          xs: 1,
                                        }}
                                      >
                                        {!hiraWithStepsLoading && (
                                          <Descriptions.Item
                                            label="Created By:"
                                            style={{
                                              textTransform: "capitalize",
                                            }}
                                          >
                                            {hiraRegisterData
                                              ?.createdByUserDetails
                                              ?.firstname +
                                              " " +
                                              hiraRegisterData
                                                ?.createdByUserDetails
                                                ?.lastname || "N/A"}{" "}
                                          </Descriptions.Item>
                                        )}
                                        <Descriptions.Item
                                          label="Reviewed By:"
                                          style={{
                                            textTransform: "capitalize",
                                          }}
                                        >
                                          {getReviewedByDetails()?.reviewedBy ||
                                            "N/A"}
                                        </Descriptions.Item>

                                        <Descriptions.Item
                                          label="Approved By :"
                                          style={{
                                            textTransform: "capitalize",
                                          }}
                                        >
                                          {getApprovedByDetails()?.approvedBy ||
                                            "N/A"}
                                        </Descriptions.Item>
                                        {!hiraWithStepsLoading && (
                                          <Descriptions.Item label="Created On : ">
                                            {hiraRegisterData?.createdAt
                                              ? moment(
                                                  hiraRegisterData?.createdAt
                                                ).format("DD/MM/YYYY HH:mm")
                                              : "N/A"}
                                          </Descriptions.Item>
                                        )}
                                        <Descriptions.Item label="Reviewed On : ">
                                          {getReviewedByDetails()?.reviewedOn ||
                                            "N/A"}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Approved On :">
                                          {getApprovedByDetails()?.approvedOn ||
                                            "N/A"}
                                        </Descriptions.Item>
                                      </Descriptions>
                                    </div>
                                  )}
                              </>
                            </div>
                          ) : (
                            ""
                          )}
                          {selectedValue === "References" ? (
                            <div>
                              <HiraReferences
                                drawer={referencesDrawer}
                                workflowStatus={
                                  hiraRegisterData?.workflowStatus
                                }
                                checkIfUserCanAddReference={
                                  checkIfUserCanAddReferenceNew
                                }
                                hiraId={hiraRegisterData?._id}
                              />
                            </div>
                          ) : (
                            ""
                          )}
                          {selectedValue === "History" ? (
                            <div>
                              <HiraConsolidatedWorkflowHistoryDrawer
                                consolidatedWorkflowHistoryDrawer={{
                                  open: true,
                                  data: hiraRegisterData,
                                }}
                                handleConsolidatedCloseWorkflowHistoryDrawer={
                                  handleConsolidatedCloseWorkflowHistoryDrawer
                                }
                              />
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      )}
                      <div
                        style={
                          matches
                            ? {
                                position: "absolute",
                                top: "-4px",
                                right: "10px",
                              }
                            : {
                                position: "absolute",
                                top: "-50px",
                                left: "10px",
                              }
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                          }}
                        >
                          <Input
                            size="small"
                            style={{ marginRight: "10px" }}
                            value={search}
                            allowClear
                            placeholder="Search Step"
                            onChange={(event) => {
                              // Check if the input has been cleared
                              if (event.target.value === "") {
                                handleClearSearchForSteps(); // Call the handleClear function when the input is cleared
                              }
                              setSearch(event.target.value);
                            }}
                            prefix={<SearchIcon />}
                            suffix={
                              <Button
                                type="text"
                                className={classes.searchIcon}
                                icon={<SendIcon />}
                                onClick={() => handleSearch()}
                              />
                            }
                          />
                          {showAddStep() && (
                            <Button
                              onClick={handleAddStep}
                              ref={ref3}
                              type="default"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: "#003566",
                                color: "white",
                              }}
                              disabled={
                                disableAddStepNew() ||
                                !showEditStepAndDeleteStepButton()
                              }
                            >
                              Add Step
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          </Space>
          {showExportLoader && (
            <Box
              width={350}
              height={150}
              display="flex"
              justifyContent="center"
              alignItems="center"
              style={{ margin: "auto" }}
            >
              <CircularProgress />
            </Box>
          )}
          {hideHeaderInAllMode && !params?.entityId && !selectedHiraId && (
            <>
              {matches ? (
                <div
                  className={classes.allHiraTableContainer}
                  id="table1"

                  // style={{  height: "300px" }}
                >
                  <Table
                    columns={allHiraTableColumns}
                    dataSource={allHiraTableData}
                    rowKey={"id"}
                    // className={classes.riskTable}
                    pagination={false}
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-evenly",
                    marginBottom: "30px",
                  }}
                >
                  {allHiraTableData?.map((record: any) => {
                    return (
                      <div
                        style={{
                          border: "1px solid black",
                          borderRadius: "5px",
                          padding: "5px",
                          margin: "10px",
                          width: smallScreen ? "45%" : "100%",
                        }}
                      >
                        <p
                          style={{
                            padding: "3px 10px",
                            backgroundColor: "#9FBFDF",
                            borderRadius: "2px",
                            cursor: "pointer",
                          }}
                          onClick={() => handleJobClickFromTable(record)}
                        >
                          {record?.jobTitle}
                        </p>
                        <p>
                          Condition: {record?.conditionDetails?.name || "N/A"}
                        </p>
                        <p>
                          Area:{" "}
                          {record?.areaDetails
                            ? record?.areaDetails?.name
                            : record?.area
                            ? record?.area
                            : ""}
                        </p>
                        <p style={{ display: "flex", alignItems: "center" }}>
                          Status: {renderStatusTag(record)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
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
          )}

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
                handleOk={handleOk}
                handleSaveScore={handleSaveScore}
                riskScoreModal={riskScoreModal}
              />
            </>
          )}

          <ConfirmDialog
            open={deleteConfirmDialogOpen}
            handleClose={handleCloseDeleteConfirmDialog}
            handleDelete={handleDeleteJob}
            text={
              jobToBeDeleted?.currentVersion > 0
                ? "Previous Version will become active and this version will be deleted"
                : null
            }
          />

          <Modal
            title="Hazard Types Info"
            centered
            open={hazardTypeTableModal}
            onCancel={() => {
              setHazardTypeTableModal(false);
            }}
            width={800}
            closeIcon={
              <img
                src={CloseIconImageSvg}
                alt="close-drawer"
                style={{ width: "36px", height: "38px", cursor: "pointer" }}
              />
            }
            footer={null}
          >
            <div style={{ height: "40vh", overflowY: "auto" }}>
              <div className={classes.tableContainer}>
                <Table
                  columns={hazardTypesColumns}
                  dataSource={hazardTypeTableData}
                  pagination={false}
                  size="small"
                  rowKey={"id"}
                />
              </div>
            </div>
          </Modal>

          <Tour
            open={tourOpen}
            onClose={handleTourClose}
            steps={steps}
            current={currentStep}
            indicatorsRender={(current, total) => (
              <span>
                {current + 1} / {total}
              </span>
            )}
          />
          {!!tourOpenForViewJob && (
            <Tour
              open={tourOpenForViewJob}
              onClose={() => setTourOpenForViewJob(false)}
              steps={stepsForViewJobTour}
              current={currentStepForViewJobTour}
              indicatorsRender={(current, total) => (
                <span>
                  {current + 1} / {total}
                </span>
              )}
            />
          )}
          {!!tourOpenForWorkflow && (
            <Tour
              open={tourOpenForWorkflow}
              onClose={() => setTourOpenForWorkflow(false)}
              steps={stepsForWorkflowTour}
              current={currentStepForWorkflow}
              indicatorsRender={(current, total) => (
                <span>
                  {current + 1} / {total}
                </span>
              )}
            />
          )}
        </>
      )}
      {consolidatedWorkflowHistoryDrawer?.open && (
        <HiraHistoryDrawerForAllView
          consolidatedWorkflowHistoryDrawer={consolidatedWorkflowHistoryDrawer}
          handleConsolidatedCloseWorkflowHistoryDrawer={
            handleConsolidatedCloseWorkflowHistoryDrawer
          }
        />
      )}
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
        {!!changeWorkflowPeopleModal && (
          <ChangeReviewerApproverModal
            changeWorkflowPeopleModal={changeWorkflowPeopleModal}
            setChangeWorkflowPeopleModal={setChangeWorkflowPeopleModal}
            hiraData={selectedHiraData}
            reloadAllHiraTableData={reloadAllHiraTableData}
          />
        )}
      </div>
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
        onOk={handleOkModal2}
        onCancel={handleCancel}
        className={classes.modal2}
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
            border: "1px solid rgba(19, 171, 155, 0.5)",
            borderRadius: "12px",
            padding: "20px",
            margin: "20px 20px 10px 20px",
          }}
          // className={classes.SearchBox}
        >
          <Form
            layout={"inline"}
            form={filterForm}
            rootClassName={classes.labelStyle}
            initialValues={{
              locationId: userDetails?.location?.id,
              entityId: userDetails?.entity?.id,
            }}
          >
            <Form.Item
              label="Unit"
              // label="Filter By Unit"
              name="locationId"
              style={{ width: "100%" }}
              // className={classes.formItem}
            >
              <Select
                showSearch
                // placeholder="Filter By Unit"
                placeholder="Select Unit"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{ width: "100%" }}
                value={selectedLocation}
                // options={locationOptions || []}
                onChange={(value) => handleLocationChange(value)}
                listHeight={200}
                dropdownRender={(menu) => (
                  <Paper style={{ padding: "1px" }}>{menu}</Paper>
                )}
                // className={classes.ellipsisSelect}
              >
                {locationOptions.map((option: any) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Entity"
              // label="Filter By Area/Department"
              name="entityId"
              style={{ width: "100%" }}
              // className={classes.formItem}
            >
              {/* <Select
                showSearch
                allowClear
                // placeholder="Filter By Area/Deparment"
                placeholder="Select Area/Deparment"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{ width: "100%" }}
                value={() => {
                  if (location.pathname.includes("HIRA/")) {
                    return undefined;
                  } else {
                    return selectedEntity || undefined;
                  }
                }}
                options={departmentOptions || []}
                onChange={(value) => handleDepartmentChange(value)}
                listHeight={200}
                // className={classes.ellipsisSelect}
              /> */}
              <DepartmentSelector
                locationId={selectedLocation}
                selectedDepartment={selectedDept}
                onSelect={(dept, type) => {
                  setSelectedDept({ ...dept, type });
                  handleDepartmentChange(dept?.id);
                  filterForm.setFieldsValue({
                    entityId: dept?.id,
                  });
                }}
                onClear={() => {
                  filterForm.setFieldsValue({
                    entityId: undefined,
                  });
                  setSelectedDept(null);
                  setSelectedEntity(undefined);
                }}
              />
            </Form.Item>

            <Form.Item
              label="Area"
              // label="Filter By Area/Department"
              name="area"
              style={{ width: "100%" }}
              // className={classes.formItem}
            >
              <Select
                showSearch
                allowClear
                // placeholder="Filter By Area/Deparment"
                placeholder="Select Area"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{ width: "100%" }}
                value={selectedArea || undefined}
                options={areaOptions || []}
                onChange={(value) => handleAreaChange(value)}
                listHeight={200}
                // className={classes.ellipsisSelect}
              />
            </Form.Item>

            <Form.Item
              label="Section"
              // label="Filter By Area/Department"
              name="section"
              style={{ width: "100%" }}
              // className={classes.formItem}
            >
              <Select
                showSearch
                allowClear
                // placeholder="Filter By Area/Deparment"
                placeholder="Select Section"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{ width: "100%" }}
                value={selectedSection || undefined}
                options={sectionOptions || []}
                onChange={(value) => handleSectionChange(value)}
                listHeight={200}
                // className={classes.ellipsisSelect}
              />
            </Form.Item>

            <Form.Item
              label="Status"
              // label="Filter By Area/Department"
              name="workflowStatus"
              style={{ width: "100%" }}
              // className={classes.formItem}
            >
              <Select
                showSearch
                allowClear
                // placeholder="Filter By Area/Deparment"
                placeholder="Select Status"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{ width: "100%" }}
                value={selectedStatus || "All"}
                options={statusOptions || []}
                onChange={(value) => handleStatusChange(value)}
                listHeight={200}
                // className={classes.ellipsisSelect}
              />
            </Form.Item>

            <Button
              type="default"
              onClick={handleClickFetch}
              // ref={ref1}
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#003566",
                color: "white",
                marginTop: "10px",
              }}
            >
              Fetch
            </Button>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default HiraRegisterPagev2;

/**
 * bug fix commit
 */
