//react
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FilePdfOutlined } from "@ant-design/icons";
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
  Descriptions,
  Typography,
  Popover as AntdPopover,
  Modal,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { CheckboxValueType } from "antd/es/checkbox/Group";
import type { PaginationProps } from "antd";

//material-ui icons
//<--kebab menu icons -->
import RateReviewIcon from "@material-ui/icons/RateReview";
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";
import HistoryIcon from "@material-ui/icons/History";
//<--table icons
import KeyboardArrowDownRoundedIcon from "@material-ui/icons/KeyboardArrowDownRounded";
import ChevronRightRoundedIcon from "@material-ui/icons/ChevronRightRounded";
import FilterListIcon from "@material-ui/icons/FilterList";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";

//saved icon <-- filter icon -->
import { ReactComponent as FilterLogo } from "assets/icons/filter-solid.svg";
import { ReactComponent as ExpandIcon } from "assets/icons/row-expand.svg";
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import InfoRoundedIcon from "@material-ui/icons/InfoRounded";

//thirdparty libs
import { useSnackbar } from "notistack";

//utils
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";
import { navbarColorAtom } from "recoil/atom";
import { useSetRecoilState } from "recoil";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
//assets
import { ReactComponent as AuditPlanIcon } from "assets/moduleIcons/Audit-plan.svg";

//styles
import useStyles from "./style";
import "./new.css";
import { ReactComponent as AllDocIcon } from "assets/documentControl/All-Doc.svg";
import {
  PlusCircleOutlined,
  MinusCircleOutlined,
  FilterOutlined,
  FilterFilled,
} from "@ant-design/icons";
//components
import CustomMoreMenu from "components/newComponents/CustomMoreMenu";
import ShareWithUsersModal from "components/Risk/AspectImpact/AspectImpactRegister/ShareWithUsersModal";
import ControlMeasureDrawer from "components/Risk/AspectImpact/AspectImpactRegister/ControlMeasureDrawer";
// import RiskDrawer from "components/RiskRegister/RiskDrawer";
import ModuleNavigation from "components/Navigation/ModuleNavigation";
import printJS from "print-js";
import { ReactComponent as OrgSettingsIcon } from "assets/moduleIcons/module-setting.svg";
import HindalcoLogoSvg from "assets/logo/HindalcoLogoSvg.svg";
import AspImpConsolidatedWorkflowHistoryDrawer from "components/Risk/AspectImpact/AspectImpactRegister/AspImpConsolidatedWorkflowHistoryDrawer";
import AspectImpactRegisterDrawer from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactRegisterDrawer";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import AspImpReviewModal from "components/Risk/AspectImpact/AspectImpactRegister/AspImpReviewModal";
import { Box, IconButton, useMediaQuery } from "@material-ui/core";
import RiskScoreModal from "components/Risk/Hira/HiraRegister/RiskScoreModal";
import InfoModal from "components/Risk/AspectImpact/AspectImpactRegister/InfoModal";
import DepartmentSelector from "components/ReusableComponents/DepartmentSelector";

// import AspectImpactDashboardTab from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactDashboardTab";
const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;

const { RangePicker } = DatePicker;

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
      if (rowData?.preMitigationScore >= 9 || rowData?.preProbability >= 3) {
        return true;
      }
    }
  }
};

function validateTableData(tableData: any) {
  // First, filter to get only significant objects based on calculateIfSignificant function
  const significantObjects = tableData.filter(calculateIfSignificant);

  // Then, check if every significant object has at least one entry in the children array
  return significantObjects.every(
    (item: any) => item.mitigations && item.mitigations.length > 0
  );
}

const getHiraStatusForPdf = (
  hiraInTrackChangesParam: any,
  showDraftStatusParam: any,
  hiraInWorkflowParam: any
) => {
  if (showDraftStatusParam) {
    return "DRAFT";
  } else if (
    hiraInTrackChangesParam?.status === "active" &&
    showDraftStatusParam
  ) {
    return "DRAFT";
  } else if (hiraInWorkflowParam?.status === "IN_REVIEW") {
    return "IN REVIEW";
  } else if (hiraInWorkflowParam?.status === "IN_APPROVAL") {
    return "IN APPROVAL";
  } else if (hiraInWorkflowParam?.status === "APPROVED") {
    return "APPROVED";
  } else {
    return "N/A";
  }
};

const reportTemplate = (
  aspImpTableData: any,
  status: any,
  createdByDetails: any = null,
  reviewedByDetails: any = null,
  approvedByDetails: any = null,
  logo: any
) => {
  // Function to format date using moment.js or similar
  const formatDate = (date: any) => moment(date).format("DD/MM/YYYY");

  // Metadata for the first row below the image
  const metaData = {
    locationName: aspImpTableData[0]?.location?.locationName, // Replace with actual plant name or data
    Department: aspImpTableData[0].entity?.entityName || "N/A",
    Section: aspImpTableData[0].section || "N/A",
    LastReviewedOn: formatDate(aspImpTableData[0].createdAt),
    prefixSuffix: aspImpTableData[0]?.prefixSuffix || "N/A",
  };

  // Generate HTML report
  return `
    <div class="report">
      <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
        <thead style="border: 1px solid black;">
          <tr style="background-color: #fbe4d5; text-align: center;">
            <th colspan="16">ENVIRONMENTAL ASPECT IMPACT ANALYSIS</th>
          </tr>
        </thead>
        <tbody>
        <tr style="text-align: left; border-bottom: 1px solid black;">
        <td colspan="16" style="border: none;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 100px;">
                <img src="${
                  logo || HindalcoLogoSvg
                }" alt="Company Logo" width="100px" height="100px">
              </td>
              <td>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td>Name of the Corp Func/Unit: ${
                      metaData.locationName || ""
                    }</td>
                  </tr>
                  <tr>
                    <td>Department / Area Name: ${
                      metaData.Department || ""
                    }</td>
                  </tr>
                  <tr>
                    <td>Section: ${metaData.Section || ""}</td>
                  </tr>
                  <tr>
                    <td>Last Reviewed On: ${metaData.LastReviewedOn || ""}</td>
                  </tr>

                </table>
              </td>
              <td>
              <table style="width: 100%; border-collapse: collapse;">
              <tr> <td>AI Number: ${metaData?.prefixSuffix || "N/A"}</td></tr>
              <tr> <td>Status: ${status || ""}</td> </tr>
              </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
          <tr style="border: 1px solid black; background-color: #92d050;">
          <th style="border: 1px solid black; padding: 2px;">SL. No.</th>
<th style="border: 1px solid black; padding: 2px;">LifeCycle Stage</th>
<th style="border: 1px solid black; padding: 2px;">Activity</th>
<th style="border: 1px solid black; padding: 2px;">Aspect</th>
<th style="border: 1px solid black; padding: 2px;">Impact</th>
<th style="border: 1px solid black; padding: 2px;">Condition N/A/E</th>
<th style="border: 1px solid black; padding: 2px;">Legal Impact</th>
<th style="border: 1px solid black; padding: 2px;">Existing Control</th>
<th style="border: 1px solid black; padding: 2px;" colspan="2">Pre mitigation</th>
<th style="border: 1px solid black; padding: 10px;" >Pre Score</th>
<th style="border: 1px solid black; padding: 2px;">Additional Control Measures</th>
<th style="border: 1px solid black; padding: 2px;" colspan="2">Residual Risk</th>
<th style="border: 1px solid black; padding: 10px;" >Residual Score</th>
<th style="border: 1px solid black; padding: 10px;" >S/NS</th>
          </tr>
          <tr style="text-align: center; background-color: #f0f0f0;">
          <th></th> <!-- Placeholder for SN column -->
          <th colspan="7"></th> <!-- Placeholders for columns up to 'Existing Control' -->
          <th style="border: 1px solid black; padding: 10px;">P</th>
          <th style="border: 1px solid black; padding: 10px;">S</th>
          <th></th> <!-- Placeholder for 'Pre Score' column -->
          <th></th> <!-- Placeholder for 'Additional Control Measures' column -->
          <th style="border: 1px solid black; padding: 10px;">P</th>
          <th style="border: 1px solid black; padding: 10px;">S</th>
          <th style="border: 1px solid black;"></th> <!-- Placeholder for 'S/NS' column -->
        </tr>
          ${aspImpTableData
            .map(
              (item: any, index: any) => `
            <tr>
              <td style="border: 1px solid black; padding: 2px;">${
                index + 1
              }</td>
              <td style="border: 1px solid black; padding: 2px;">${
                item.jobTitle || ""
              }</td>
              <td style="border: 1px solid black; padding: 2px;">${
                item.activity || ""
              }</td>
              <td style="border: 1px solid black; padding: 2px;">${
                item?.specificEnvAspect || ""
              }</td>
            
              <td style="border: 1px solid black; padding: 2px;">${
                item?.specificEnvImpact || ""
              }</td>
             
              <td style="border: 1px solid black; padding: 2px;">${
                item.selectedConditions?.name || ""
              }</td>
              <td style="border: 1px solid black; padding: 2px;">${
                item.legalImpact === "Yes" ? "Yes" : "No"
              }</td>
              <td style="border: 1px solid black; padding: 2px;">${
                item.existingControl || ""
              }</td>
              <td style="border: 1px solid black; padding: 10px;">${
                item.preSeverity || ""
              }</td> <!-- TD for P -->
              <td style="border: 1px solid black; padding: 10px;">${
                item.preProbability || ""
              }</td> <!-- TD for S -->
              <td style="border: 1px solid black; padding: 10px;">${
                item?.preMitigationScore || ""
              }</td> <!-- TD for pre -->
              <td style="border: 1px solid black; padding: 10px;">
              ${
                item?.mitigations && item.mitigations.length
                  ? `<ol style="margin: 0; padding-left: 20px;">` +
                    item.mitigations
                      .map(
                        (mitigation: any) => `<li>${mitigation.comments}</li>`
                      )
                      .join("") +
                    `</ol>`
                  : ""
              }
            </td> <!-- TD for acm -->
              <td style="border: 1px solid black; padding: 10px;">${
                item?.mitigations?.length
                  ? item?.postSeverity
                    ? item.postSeverity
                    : ""
                  : ""
              }</td> <!-- TD for P -->
              <td style="border: 1px solid black; padding: 10px;">${
                item?.mitigations?.length
                  ? item?.postProbability
                    ? item.postProbability
                    : ""
                  : ""
              }</td> <!-- TD for S -->
              <td style="border: 1px solid black; padding: 10px;">${
                item?.postMitigationScore || ""
              }</td> <!-- TD for post -->
              <td style="border: 1px solid black; padding: 10px;">${
                calculateIfSignificant(item) ? "S" : "NS"
              }</td> <!-- TD for post -->
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
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

const expandIcon = ({ expanded, onExpand, record }: any) => {
  const icon = expanded ? <MinusCircleOutlined /> : <PlusCircleOutlined />;
  // console.log("record", record);
  if (record?.mitigations?.length > 0) {
    return <a onClick={(e) => onExpand(record, e)}>{icon}</a>;
  }
  return null;
};

const AspectImpactRegisterPage = () => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const userDetails = getSessionStorage();
  const orgId = sessionStorage.getItem("orgId");
  const params = useParams<any>();
  const navigate = useNavigate();

  const isMR = checkRoles(roles.MR);
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;
  // const location = useLocation()

  const [tableData, setTableData] = useState<any[]>([]);
  console.log("tableData", tableData);

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

  const [deleteModal, setDeleteModal] = useState<any>({
    open: false,
    data: "",
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
  const [filterForm] = Form.useForm();
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

  const [isHiraInWorkflow, setIsHiraInWorkflow] = useState<boolean>(false);
  const [hiraInWorkflow, setHiraInWorkflow] = useState<any>({}); //this is for the hira in workflow details

  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);

  const [aspImpReviewModal, setAspImpReviewModal] = useState<any>({
    open: false,
    data: null,
  });
  const [aspImpReviewHistory, setAspImpReviewHistory] = useState<any>(null); //this will be used to control review hira modal
  const [isAspImpReviewHistoryLoaded, setIsAspImpReviewHistoryLoaded] =
    useState<boolean>(false);

  const [isTableDataLoaded, setIsTableDataLoaded] = useState<boolean>(false);

  const [showDraftStatus, setShowDraftStatus] = useState<boolean>(false);
  const [hiraInTrackChanges, setHiraInTrackChanges] = useState<any>(null);
  const [riskScoreModal, setRiskScoreModal] = useState<any>({
    open: false,
    data: {},
  });
  //for risk score modal
  const [selectedPreCell, setSelectedPreCell] = useState<any>(null);
  const [selectedPostCell, setSelectedPostCell] = useState<any>(null);

  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [levelColor, setLevelColor] = useState<any>("yellow");
  const [riskScore, setRiskScore] = useState<any>(0);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [selectedAspImpId, setSelectedAspImpId] = useState<any>(null);
  const [isDeleteAccess, setIsDeleteAccess] = useState<boolean>(false);
  const [aspectImpactStatus, setAspectImpactStatus] = useState<any>("");

  const [selectedDept, setSelectedDept] = useState<any>({});
  const [entityOptionsForDeptHead, setEntityOptionsForDeptHead] = useState<any>([]);
  //tabkey for the dashbaord tab
  // const [activeTabKey, setActiveTabKey] = useState<any>("1");

  const printRef = useRef<any>(null);

  printRef.current = (htmlReport: any) => {
    printJS({
      type: "raw-html",
      printable: htmlReport,
    });
  };
  const [
    consolidatedWorkflowHistoryDrawer,
    setConsolidatedWorkflowHistoryDrawer,
  ] = useState<any>({
    open: false,
    data: hiraInWorkflow,
  });

  const classes = useStyles(matches)();
  const { enqueueSnackbar } = useSnackbar();
  const [logo, setLogo] = useState<any>(null);
  const getLogo = async () => {
    const response = await axios.get(`/api/location/getLogo`);
    setLogo(response.data);
  };

  useEffect(() => {
    getLogo();
    fetchAspImpConfig();
    checkIfUserIsMultiDeptHead();
    // fetchAllJobTitles();
    if (userDetails?.location?.id) {
      setSelectedLocation(userDetails?.location?.id);
      getAllDepartmentsByLocation(userDetails?.location?.id);
    }
    if (userDetails?.entity?.id) {
      fetchInitialDepartment(userDetails?.entity?.id);
      setSelectedEntity(userDetails?.entity?.id);
      
    }
    getAllLocations();
  }, []);

  useEffect(() => {
    if (!!selectedEntity) {
      fetchAllJobTitles(selectedEntity);
    }
  }, [selectedEntity]);

  // useEffect(() => {
  //   if (!!selectedLocation) {
  //     console.log(
  //       "checkrisk selectedLocation in hira register page useEffect[selectedLocation]",
  //       selectedLocation
  //     );
  //     setSelectedEntity(null);
  //     getAllDepartmentsByLocation(selectedLocation);
  //   }
  // }, [selectedLocation]);

  useEffect(() => {
    // console.log("checkrisk location in hira register page useEffect[location]",location);
    // console.log(
    //   "checkrisk params in hira register page useEffect[params]",
    //   params
    // );
    if (params && params?.hiraWorkflowId) {
      fetchHiraInWorkflowDetails(params?.hiraWorkflowId);
    }
    if (params && params?.jobTitle) {
      setSelectedJobTitle(params?.jobTitle);
      fetchInitialDepartment(selectedEntity || userDetails?.entity?.id);
      fetchRisks(
        params?.jobTitle,
        { field: "jobTitle", order: "ascend" },
        pagination?.current || 1,
        pagination?.pageSize || 10,
        selectedEntity || ""
      );
      // fetchRisks(selectedJobTitle);
    }
  }, [params]);

  useEffect(() => {
    // if (params.riskcategory === "HIRA") {
    fetchRisks(
      selectedJobTitle,
      { field: "jobTitle", order: "ascend" },
      pagination?.current || 1,
      pagination?.pageSize || 10,
      selectedEntity || ""
    );
    // } else if (params.riskcategory === "AspImp") {
    //   fetchAspImps();
    // }
  }, [statusFilter, dateFilter, search]);

  useEffect(() => {
    // console.log("checkrisk selectedJobTitle", selectedJobTitle);

    //logic to identify the status of review to identify the stage of selected job title
    // if (!!selectedJobTitle) {
    //   fetchConsolidatedStatus(selectedJobTitle);
    // }

    if (!!selectedJobTitle) {
      if (selectedJobTitle === "All") {
        fetchHiraReviewHistory();
        fetchAspImpDetailsFromChangesTrack();
      }
      fetchRisks(
        selectedJobTitle,
        { field: "jobTitle", order: "ascend" },
        pagination?.current || 1,
        pagination?.pageSize || 10,
        selectedEntity || ""
      );
    }
  }, [selectedJobTitle]);

  useEffect(() => {
    // console.log("checkaspimp selectedEntity", selectedEntity);

    if (!!selectedEntity) {
      fetchConsolidatedStatus(selectedEntity || "");
    }
  }, [selectedEntity]);

  const checkIfUserIsMultiDeptHead = async () => {
    try {
      const res = await axios.get(
        `/api/riskregister/checkIfUserIsMultiDeptHead?orgId=${userDetails?.organizationId}&userId=${userDetails?.id}`
      );

      if (res.status === 200) {
        // console.log(
        //   "checkrisknew res in checkIfUserIsMultiDeptHead ----->",
        //   res
        // );
        if (res.data?.length) {
          setEntityOptionsForDeptHead(
            [
              ...res.data.map((item: any) => ({
                ...item,
                label: item?.entityName,
                value: item?.id,
              })),
              {
                label: userDetails?.entity?.entityName,
                value: userDetails?.entity?.id,
              },
            ].filter(
              (item, index, self) => index === self.findIndex((t) => t.value === item.value)
            )
          );
        } else {
          setEntityOptionsForDeptHead([]);
        }
      } else {
        setEntityOptionsForDeptHead([]);
      }
    } catch (error) {
      // console.log("error in checkIfUserIsMultiDeptHead-->", error);
    }
  };


  const handleAddDeptInChangesTrack = async () => {
    try {
      const body = {
        entityId: userDetails?.entity?.id,
        organizationId: userDetails?.organizationId,
        createdBy: userDetails?.id,
      };
      const res = await axios.post(
        `/api/aspect-impact/addAspImpInChangesTrack`,
        body
      );
      if (res.status === 200 || res.status === 201) {
        setShowDraftStatus(true);
        // enqueueSnackbar("Job added in changes track", {
        //   variant: "success",
        // });
        return;
      }
    } catch (error) {
      console.log("error in handleAddJobInChangesTrack", error);
      return;
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
      enqueueSnackbar("Failed to fetch initial department", {
        variant: "error",
      });
    }
  };

  const fetchAspImpDetailsFromChangesTrack = async () => {
    try {
      const res = await axios.get(
        `/api/aspect-impact/fetchEntryInAspImpHistoryTrack/${userDetails?.entity?.id}/${userDetails?.organizationId}`
      );
      // console.log("checkrisk res in fetchHiraReviewHistory", res);

      if (res.status === 200) {
        // console.log("checkaspimp res data ", res.data)
        if (!!res?.data && !!res?.data?.hiraRegisterIds?.length) {
          setHiraInTrackChanges(res?.data);
          setShowDraftStatus(true);
        }
        // else if(!!res?.data && res?.data?.data === null) {
        //   // console.log("checkaspimp res data in fetchAspImpDetailsFromChangesTrack inside else if", res.data);

        //   setShowDraftStatus(true);

        // }
        else {
          setHiraInTrackChanges(null);
          setShowDraftStatus(false);
        }
      } else {
        setHiraInTrackChanges(null);
        setShowDraftStatus(false);
      }
    } catch (error) {
      console.log("error in fetchAspImpDetailsFromChangesTrack", error);
    }
  };

  const fetchHiraReviewHistory = async () => {
    try {
      // console.log("checkrisk jobTitle in fetchHiraReviewHistory", jobTitle);

      const res = await axios.get(
        `/api/aspect-impact/fetchReviewHistory/${userDetails?.entity?.id}/${userDetails?.organizationId}`
      );
      console.log("checkrisk res in fetchHiraReviewHistory", res);

      if (res.status === 200) {
        setAspImpReviewHistory(res?.data);
        setIsAspImpReviewHistoryLoaded(true);
      } else {
        setIsAspImpReviewHistoryLoaded(false);
      }
    } catch (error) {
      console.log("error in fetchHiraReviewHistory", error);
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

  const fetchHiraInWorkflowDetails = async (hiraWorkflowId: any) => {
    try {
      const res = await axios.get(
        `/api/aspect-impact/getHiraInWorkflow/${hiraWorkflowId}`
      );
      // console.log("checkrisk res in fetchHiraInWorkflowDetails", res);

      if (res.status === 200 || res.status === 201) {
        setHiraInWorkflow(res?.data?.data);
        setSelectedJobTitle(res.data?.data?.jobTitle);
      } else {
        setHiraInWorkflow(null);
        enqueueSnackbar(
          "Something went wrong while fetching details of hira in workflow",
          {
            variant: "error",
          }
        );
      }
    } catch (error) {
      enqueueSnackbar(
        "Something went wrong while fetching details of hira in workflow",
        {
          variant: "error",
        }
      );
      // console.log("errror in fetch config", error);
    }
  };

  const fetchConsolidatedStatus = async (entityId: any = "") => {
    try {
      // console.log("checkaspimp fetchConsolidatedStatus entityId", entityId);

      const res = await axios.get(
        `/api/aspect-impact/checkConsolidatedStatus/${entityId}/${orgId}`
      );
      // console.log("checkrisk res in fetchConsolidatedStatus", res);

      if (res.status === 200 || res.status === 201) {
        setAspectImpactStatus(res?.data?.data?.status);
        if (res.data?.status === "open") {
          setIsHiraInWorkflow(false);
          setShowDraftStatus(true);
          if (userDetails?.entity?.id === entityId) {
            // console.log("checkaspimp isDeleteAccess in fetchConsolidatedStatus",isDeleteAccess);

            setIsDeleteAccess(true);
          }
          setHiraInWorkflow(res.data?.data);
        } else {
          setIsHiraInWorkflow(true);
          setHiraInWorkflow(res.data?.data);
          // console.log("checkrisk 200 res consolidated status", res.data);
        }
      } else {
        setIsHiraInWorkflow(false);
        enqueueSnackbar(
          "Something went wrong while fetch consolidate staus of hira",
          {
            variant: "error",
          }
        );
      }
    } catch (error) {
      enqueueSnackbar(
        "Something went wrong while fetch consolidate staus of hira",
        {
          variant: "error",
        }
      );
      // console.log("errror in fetch config", error);
    }
  };
  const fetchAspImpConfig = async () => {
    try {
      const res = await axios.get(
        `/api/aspect-impact/getAspImpConfig/${orgId}`
      );
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
        } else {
          setExistingRiskConfig(null);
        }
      }
    } catch (error) {
      // console.log("errror in fetch config", error);
    }
  };

  // const handleDeleteRisk = async (record: any) => {
  //   try {
  //     const res = await axios.delete(`/api/riskregister/${record.id}`);
  //     if (res.status === 200 || res.status === 201) {
  //       enqueueSnackbar("Risk Deleted Successfully", {
  //         variant: "success",
  //       });
  //       fetchRisks();
  //     }
  //   } catch (error) {
  //     // console.log("error in handleDeleteRisk ->>", error);
  //   }
  // };

  // const handleCloseRisk = async (record: any) => {
  //   try {
  //     const res = await axios.patch(`/api/riskregister/close/${record.id}`);
  //     if (res.status === 200 || res.status === 201) {
  //       enqueueSnackbar("Risk Closed Successfully", {
  //         variant: "success",
  //       });
  //       fetchRisks();
  //     }
  //   } catch (error) {
  //     // console.log("error in handleCloseRisk ->>", error);
  //   }
  // };

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

  const toggleDeleteModal = (record: any) => {
    setDeleteModal({
      ...deleteModal,
      data: record?.id,
      open: !deleteModal.open,
    });
  };

  const handleDeleteStage = async () => {
    try {
      const res = await axios.delete(
        `/api/aspect-impact/deletestage/${deleteModal?.data}`
      );
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar("Stage Deleted Successfully", {
          variant: "success",
        });
        fetchRisks(
          selectedJobTitle || "All",
          { field: "jobTitle", order: "ascend" },
          pagination?.current || 1,
          pagination?.pageSize || 10,
          selectedEntity || userDetails?.entity?.id
        );
        fetchAllJobTitles(selectedEntity || userDetails?.entity?.id, "");
      } else {
        enqueueSnackbar("Something went wrong while deleting this stage!", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while deleting this stage!", {
        variant: "error",
      });
    }
  };

  const copyStageHandler = (record: any) => {
    // console.log("checkriske aspImpId in copyStageHandler", aspImpId);
    setRiskId("");
    setFormType("create");
    setAddModalOpen(true);
    setSelectedAspImpId(record?.id);
    // setSelectedDept(record?.entityId);
  };

  const actions = (record: any) => [
    {
      label: "Add Additional Control Measure",
      icon: <AddIcon />,
      handler: () => {
        if(aspectImpactStatus === "IN_REVIEW" || aspectImpactStatus === "IN_APPROVAL") {
          enqueueSnackbar(`Can't Add Mitigation in Workflow Mode!`, {
            variant: "warning",
          });
        } else if(userDetails?.entity?.id !== record?.entityId && entityOptionsForDeptHead?.length === 0) {
          enqueueSnackbar(`You don't have permission to add mitigation!`, {
            variant: "warning",
          });
        } 
        else {
          toggleMitigationModal(record);
        }
      },
    },
    {
      label: "Add Additional Aspect/Impact",
      icon: <AddIcon />,
      handler: () => {
        if(aspectImpactStatus === "IN_REVIEW" || aspectImpactStatus === "IN_APPROVAL") {
          enqueueSnackbar(`Can't Add Mitigation in Workflow Mode!`, {
            variant: "warning",
          });
        } else if(userDetails?.entity?.id !== record?.entityId && entityOptionsForDeptHead?.length === 0) {
          enqueueSnackbar(`You don't have permission to add additional aspect/impact!`, {
            variant: "warning",
          });
        } else {
          copyStageHandler(record);
        }
      },
    },
    {
      label: "Delete Stage",
      icon: <DeleteIcon />,
      handler:
        userDetails?.entity?.id === record?.entityId
          ? () => toggleDeleteModal(record)
          : () =>
              enqueueSnackbar("You don't have permission to delete!", {
                variant: "warning",
              }),
      style:
        userDetails?.entity?.id === record?.entityId
          ? {}
          : { color: "gray", cursor: "not-allowed", pointerEvents: "none" },
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

          const parent = tableData.find((parentRecord) =>
            parentRecord?.mitigations?.some(
              (child: any) => child._id === record._id
            )
          );

          // console.log("checkrisk hira columns parent", parent);

          const color = determineColor(
            record?.lastScore,
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
              {/* {hoveredRow === record.id && (
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
              )} */}
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
      title: "Entity",
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
          const preColor =
            record.preMitigationScore > 0
              ? determineColor(
                  record.preMitigationScore,
                  existingRiskConfig?.riskIndicatorData
                )
              : "transparent";

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
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: preColor,
                      marginLeft: "5px",
                      marginRight: "5px",
                    }}
                  />
                  <Tooltip title="Click For Risk Heatmap">
                    <Typography.Link
                      onClick={() => toggleScoreModal(record, "pre")}
                      style={{ textDecoration: "underline" }}
                    >
                      {preScore}
                    </Typography.Link>
                  </Tooltip>
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
          const postColor =
            record.postMitigationScore > 0
              ? determineColor(
                  record.postMitigationScore,
                  existingRiskConfig?.riskIndicatorData
                )
              : "transparent";
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
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: postColor,
                      marginLeft: "5px",
                      marginRight: "5px",
                    }}
                  />
                  <Typography.Link
                    onClick={() => toggleScoreModal(record, "post")}
                    style={{ textDecoration: "underline" }}
                  >
                    {postScore}
                  </Typography.Link>
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
          // console.log("checkrisk s/ns record in significant", record);

          return calculateIfSignificant(record) ? (
            <CheckCircleIcon style={{ fill: "#ED2939" }} />
          ) : (
            ""
          );
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
            options={actions(record).map((obj: any) => {
                return {
                  ...obj,
                  handleClick: () => obj.handler?.(), // Ensure the handler function exists
                }
            })}
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
        const color = determineColor(
          record.lastScore,
          existingRiskConfig?.riskIndicatorData
        );
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
                    onClick={() => handleEditMitigation(record, parent)}
                  >
                    {displayText}
                  </span>
                </Tooltip>
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
            ) : (
              <div>
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
  const rowClassName = (record: any) => {
    return record.highlight ? "highlighted-row" : "";
  };

  const fetchRisks = async (
    jobTitle: any = null,
    sort = { field: "jobTitle", order: "ascend" },
    current = 1,
    pageSize = 10,
    entityId = ""
  ) => {
    try {
      console.log(
        "checkrisk params in fetchRisks",
        jobTitle,
        sort,
        current,
        pageSize,
        entityId
      );

      let stringDateFilter = "",
        stringSortFilter = "",
        entityFilter = "";
      if (!!dateFilter) {
        stringDateFilter = JSON.stringify(dateFilter);
      }
      if (!!sort) {
        stringSortFilter = JSON.stringify(sort);
      }
      if (!!entityId) {
        entityFilter = entityId;
      }
      if ((!!jobTitle || !!selectedJobTitle) && !!entityId) {
        // console.log("checkrisk jobTitle", jobTitle);

        const response = await axios.get(
          `/api/aspect-impact/all/${
            jobTitle || selectedJobTitle
          }?page=${current}&pageSize=${pageSize}&sort=${stringSortFilter}&search=${search}&statusFilter=${statusFilter}&dateFilter=${stringDateFilter}&entityId=${entityFilter}`
        );

        // console.log("checkrisk response -->", response);
        if (response.status === 200) {
          if (response?.data?.list && !!response?.data?.list.length) {
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
              prefixSuffix: obj?.prefixSuffix || "",

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
            setIsTableDataLoaded(true);
            setTableDataForReport(response.data.list);
            setAspImpTableDataForReport(response.data.list);
          } else {
            setTableData([]);
            setTableDataForReport([]);
            setIsTableDataLoaded(true);
            setPagination((prev) => ({ ...prev, total: 0 }));
            setAspImpTableDataForReport([]);
            // enqueueSnackbar("No Aspect Impacts Found for Applied Filters", {
            //   variant: "warning",
            //   autoHideDuration  : 1500,
            // });
          }
        } else {
          setTableData([]);
          setTableDataForReport([]);
          setIsTableDataLoaded(true);
          setPagination((prev) => ({ ...prev, total: 0 }));
          setAspImpTableDataForReport([]);

          enqueueSnackbar("Error in fetching Aspect Impacts", {
            variant: "error",
            autoHideDuration: 1500,
          });
        }
      } else {
        setTableData([]);
        setTableDataForReport([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
        setAspImpTableDataForReport([]);
      }
    } catch (error) {
      // console.log(error);
    }
  };

  const fetchAllJobTitles = async (entityId: any = "", jobTitle: any = "") => {
    try {
      const res = await axios.get(
        `/api/aspect-impact/getAllJobTitles/${orgId}/${entityId}`
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
          if (!!jobTitle) {
            console.log("checkrisk inside jobTitle-->", jobTitle);

            setSelectedJobTitle(jobTitle);
            filterForm?.setFieldsValue({
              jobTitle: jobTitle,
            });
          }
        } else {
          setJobTitleOptions([]);
        }
      } else {
        setJobTitleOptions([]);
        filterForm.setFieldsValue({
          jobTitle: undefined,
        });
        enqueueSnackbar("Error in fetching job titles", {
          variant: "error",
        });
      }
    } catch (error) {
      setJobTitleOptions([]);
      filterForm.setFieldsValue({
        jobTitle: undefined,
      });
      // console.log("checkrisk error in fetching all job title", error);
    }
  };

  const reloadListAfterSubmit = (
    reloadFetchReviewHistory: any = false,
    jobTitle: any = "",
    entityId: any = ""
  ) => {
    console.log(
      "checkrisk reload list ",
      reloadFetchReviewHistory,
      jobTitle,
      entityId
    );

    setSelectedLocation(userDetails?.location?.id);
    setSelectedEntity(entityId || userDetails?.entity?.id);

    reloadFetchReviewHistory && fetchHiraReviewHistory();
    if (!!entityId) {
      filterForm.setFieldsValue({
        entityId: entityId,
      });
    }
    if (!!entityId) {
      fetchAllJobTitles(entityId, jobTitle);
    }
    if (!!jobTitle) {
      setSelectedJobTitle(jobTitle);
      filterForm.setFieldsValue({
        jobTitle: selectedJobTitle,
      });
    }
    fetchRisks(
      jobTitle || "All",
      { field: "jobTitle", order: "ascend" },
      pagination?.current || 1,
      pagination?.pageSize || 10,
      entityId || userDetails?.entity?.id
    );
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
    navigate(`/risk/riskconfiguration/AspectImpact`);
  };

  const clearTableData = () => {
    setTableData([]);
    setTableDataForReport([]);
    setPagination((prev) => ({ ...prev, total: 0 }));
    setAspImpTableDataForReport([]);
  };

  const handleJobTitleOptionChange = (value: any) => {
    setSelectedJobTitle(value);

    fetchRisks(
      value,
      { field: "jobTitle", order: "ascend" },
      pagination?.current || 1,
      pagination?.pageSize || 10,
      selectedEntity || ""
    );
  };

  const handleDepartmentChange = (value: any) => {
    setSelectedEntity(value);
    fetchAllJobTitles(value);
    setTableData([]);
    setTableDataForReport([]);
    setIsTableDataLoaded(false);
    setPagination((prev) => ({ ...prev, total: 0 }));
    setSelectedJobTitle(null);
    setAspImpTableDataForReport([]);
    filterForm.setFieldsValue({
      jobTitle: undefined,
    });
    // fetchRisks(
    //   selectedJobTitle,
    //   { field: "jobTitle", order: "ascend" },
    //   pagination?.current || 1,
    //   pagination?.pageSize || 10,
    //   value
    // );
  };

  const handleLocationChange = (value: any) => {
    setSelectedLocation(value);
    setSelectedEntity("");
    filterForm.setFieldsValue({
      entityId: undefined,
      //  jobTitle: undefined
    });
    clearTableData();
    getAllDepartmentsByLocation(value);
  };

  const handleChangePageNew = (page: number, pageSize: number) => {
    // console.log("checkrisk page", page, pageSize);
    setPagination((prev) => ({ ...prev, current: page, pageSize: pageSize }));
    fetchRisks(
      selectedJobTitle,
      { field: "jobTitle", order: "ascend" },
      page,
      pageSize,
      selectedEntity || ""
    );
  };

  let filteredColumns = columns;
  // if (selectedJobTitle !== "All") {
  //   filteredColumns = columns.filter((column) => column.key !== "jobTitle");
  // }

  const handleExportConsolidated = () => {
    // if (!isMounted.current) return;
    const status = getHiraStatusForPdf(
      hiraInTrackChanges,
      showDraftStatus,
      hiraInWorkflow
    );
    let createdByDetails = null,
      reviewedByDetails = null,
      approvedByDetails = null;

    if (isTableDataLoaded) {
      createdByDetails = {
        fullname:
          aspImpTableDataForReport[0]?.createdByUserDetails?.firstname +
            " " +
            aspImpTableDataForReport[0]?.createdByUserDetails?.lastname ||
          "N/A",
        createdAt: aspImpTableDataForReport[0]?.createdAt
          ? moment(aspImpTableDataForReport[0]?.createdAt).format(
              "DD/MM/YYYY HH:mm"
            )
          : "N/A",
      };
    }

    if (!!hiraInWorkflow?.approvedBy && !!hiraInWorkflow?.approvedOn) {
      approvedByDetails = {
        fullname:
          hiraInWorkflow?.approvedByUserDetails?.firstname +
            " " +
            hiraInWorkflow?.approvedByUserDetails?.lastname || "N/A",
        approvedOn: hiraInWorkflow?.approvedOn
          ? moment(hiraInWorkflow?.approvedOn).format("DD/MM/YYYY HH:mm")
          : "N/A",
      };
      reviewedByDetails = {
        fullname: hiraInWorkflow?.reviewedByUserDetails
          ? hiraInWorkflow?.reviewedByUserDetails?.firstname +
              " " +
              hiraInWorkflow?.reviewedByUserDetails?.lastname || "N/A"
          : "N/A",
        reviewedOn: hiraInWorkflow?.reviewedOn
          ? moment(hiraInWorkflow?.reviewedOn).format("DD/MM/YYYY HH:mm")
          : "N/A",
      };
    }

    const htmlReport = reportTemplate(
      aspImpTableDataForReport,
      status,
      createdByDetails,
      reviewedByDetails,
      approvedByDetails,
      logo
    );

    printRef.current(htmlReport);
  };

  const handleStartReview = () => {
    // console.log("checkrisk handleStart review clicked tbl data->", tableData);
    const isValid = validateTableData(tableData);
    console.log("checkrisk isValid table ", isValid);

    if (!isValid) {
      enqueueSnackbar(
        "Additional Control Measure is required for the Significant Aspect Impacts!",
        {
          variant: "warning",
        }
      );
      return;
    }

    let data = {};
    if (hiraInWorkflow?.status === "REJECTED") {
      data = {
        ...hiraInWorkflow,
      };
    }
    navigate(
      `/risk/riskregister/AspectImpact/review/bydepartment/${selectedEntity}`,
      {
        state: {
          ...data,
        },
      }
    );
  };

  const handleGoToWorkflowPageClick = () => {
    // console.log(
    //   "checkrisk handleGoToWorkflowPageClick hiraInWorkflow",
    //   hiraInWorkflow
    // );

    navigate(
      `/risk/riskregister/AspectImpact/workflow/${hiraInWorkflow?._id}`,
      {
        state: {
          entityId: selectedEntity,
        },
      }
    );
  };

  const getStatusOfInWOrkflowHira = () => {
    if (showDraftStatus) {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#EEDC82">
            DRAFT
          </Tag>
        </Space>
      );
    } else if (hiraInTrackChanges?.status === "active" && showDraftStatus) {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#EEDC82">
            DRAFT
          </Tag>
        </Space>
      );
    } else if (hiraInWorkflow?.status === "IN_REVIEW") {
      return (
        <Space size={[0, 8]} wrap>
          {" "}
          <Tag className={classes.homePageTagStyle} color="#50C878">
            IN REVIEW
          </Tag>
        </Space>
      );
    } else if (hiraInWorkflow?.status === "IN_APPROVAL") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#7CB9E8">
            IN APPROVAL
          </Tag>
        </Space>
      );
    } else if (hiraInWorkflow?.status === "APPROVED") {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#6699CC">
            APPROVED
          </Tag>
        </Space>
      );
    } else {
      return (
        <Space size={[0, 8]} wrap>
          <Tag className={classes.homePageTagStyle} color="#CCCCFF">
            {hiraInWorkflow?.status}
          </Tag>
        </Space>
      );
    }
  };

  const handleConsolidatedCloseWorkflowHistoryDrawer = () => {
    setConsolidatedWorkflowHistoryDrawer({
      ...consolidatedWorkflowHistoryDrawer,
      open: !consolidatedWorkflowHistoryDrawer.open,
      data: null,
    });
  };

  const toggleAspImpReviewModal = () => {
    setAspImpReviewModal({
      ...aspImpReviewModal,
      open: !aspImpReviewModal.open,
    });
  };

  const handleReviewAspImp = () => {
    console.log("checkrisk selected job title", selectedJobTitle);

    toggleAspImpReviewModal();
  };

  // const tabs = [
  //   {
  //     key: "1",
  //     name: "Dashboard",
  //     // path: "/master/unit", //just for information
  //     icon: (
  //       <AllDocIcon
  //         style={{
  //           fill: activeTab === "1" ? "white" : "",
  //         }}
  //         className={classes.docNavIconStyle}
  //       />
  //     ),
  //     children: <AspectImpactDashboardTab />,
  //     moduleHeader: "Dashboard",
  //   },
  // ];

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

  // mobile view filter moda.

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOkModal = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          marginTop: "10px",
          position: "relative",
          display: "flex",
          justifyContent: matches ? "space-between" : "start",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div>
            {isMCOE && matches && (
              <div
                onClick={configHandler}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 10px 4px 10px",
                  cursor: "pointer",
                  borderRadius: "5px",
                  position: "relative",
                }}
              >
                <OrgSettingsIcon />
                <span
                  className={classes.docNavText}
                  style={{
                    color: "black",
                  }}
                >
                  Settings
                </span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="View Aspect/Impact/Act Master List" color="blue">
              <IconButton
                aria-label="help"
                onClick={() => setShowInfoModal(true)}
              >
                <InfoRoundedIcon style={{ fill: "#003566" }} />
              </IconButton>
            </Tooltip>
            {selectedJobTitle === "All" && matches && (
              <Tooltip title={"Export to PDF"}>
                <IconButton
                  onClick={handleExportConsolidated}
                  style={{ padding: "10px", color: "red" }}
                >
                  <FilePdfOutlined width={20} height={20} />
                </IconButton>
              </Tooltip>
            )}
            {selectedJobTitle === "All" && (
              <div
                style={{
                  marginRight: "20px",
                  display: "flex",
                  flexDirection: matches ? "row" : "column",
                  padding: "10px",
                }}
              >
                <span style={{ fontWeight: "bold" }}>AI Number : </span>
                {(isTableDataLoaded && tableData[0]?.prefixSuffix) || "N/A"}
              </div>
            )}

            {selectedJobTitle !== null &&
              isHiraInWorkflow &&
              matches &&
              getStatusOfInWOrkflowHira()}
            {isHiraInWorkflow && hiraInWorkflow?.status !== "APPROVED" ? (
              <></>
            ) : (
              <>
                {selectedEntity === userDetails?.entity?.id &&
                  selectedLocation === userDetails?.location?.id && (
                    <Button
                      onClick={() => {
                        createHandler();
                      }}
                      style={{
                        marginRight: "10px",
                        color: "white",
                        borderRadius: "5px",
                        backgroundColor: "rgb(0, 48, 89)",
                        display: matches ? "flex" : "none",
                      }}
                    >
                      Create
                    </Button>
                  )}
              </>
            )}
          </div>
        </div>
      </Box>

      <Space
        direction="vertical"
        size="small"
        style={{ display: "flex", marginTop: "20px" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {matches ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
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
                  label="Corp Func/Unit"
                  // label="Filter By Unit"
                  name="locationId"
                  style={{ minWidth: "300px", maxWidth: "450px" }}
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
                    style={{
                      width: "100%",
                      border: "1px solid black",
                      borderRadius: "5px",
                    }}
                    value={selectedLocation}
                    options={locationOptions || []}
                    onChange={(value) => handleLocationChange(value)}
                  />
                </Form.Item>
                <Form.Item
                  label="Entity"
                  // label="Filter By Area/Department"
                  name="entityId"
                  style={{ minWidth: "400px", maxWidth: "450px" }}
                >
                  {/* <Select
                    showSearch
                    // placeholder="Filter By Area/Deparment"
                    placeholder="Select Entity"
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
                    value={selectedEntity || undefined}
                    options={departmentOptions || []}
                    onChange={(value) => handleDepartmentChange(value)}
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
                  label="Stage"
                  // label="Filter By Stage"
                  name="jobTitle"
                  style={{ minWidth: "350px", maxWidth: "350px" }}
                >
                  <Select
                    showSearch
                    // placeholder="Filter By Stage"
                    placeholder="Select  Stage"
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
                    value={selectedJobTitle}
                    options={jobTitleOptions || []}
                    onChange={(value) => handleJobTitleOptionChange(value)}
                    listHeight={200}
                  >
                    {jobTitleOptions.map((option: any) => (
                      <Select.Option key={option.value} value={option.value}>
                        <Tooltip title={option.label} placement="right">
                          <div
                            style={{
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              width: "350px",
                              maxWidth: "350px",
                            }}
                          >
                            {option.label}
                          </div>
                        </Tooltip>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </div>
          ) : (
            <div style={{ position: "relative", bottom: "70px", left: "90%" }}>
              <FilterIcon
                style={{ width: "24px", height: "24px" }}
                onClick={showModal}
              />
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              justifyContent: "flex-start",
              marginTop: matches ? "" : "-40px",
            }}
          >
            {/* {selectedJobTitle !== null && selectedJobTitle === "All" && (
              <Button
                onClick={
                  // selectedJobTitle !== "All"
                  // ? handleExport
                  // :
                  handleExportConsolidated
                }
              >
                Export
              </Button>
            )} */}
            {selectedJobTitle !== null &&
              selectedJobTitle === "All" &&
              (hiraInWorkflow?.status === "REJECTED" ||
                (!isHiraInWorkflow && !hiraInWorkflow?.status)) && (
                <Button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#003566",
                    color: "white",
                    width: smallScreen ? "" : "100%",
                    padding: matches ? "" : "0px 5px",
                  }}
                  onClick={handleStartReview}
                >
                  Start Review/Approval
                </Button>
              )}
            {selectedJobTitle !== null &&
              // selectedJobTitle !== "All" &&
              selectedJobTitle === "All" &&
              isHiraInWorkflow &&
              hiraInWorkflow?.status === "APPROVED" && (
                <Button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#003566",
                    color: "white",
                  }}
                  onClick={handleStartReview}
                >
                  Revise Aspect Impact
                </Button>
              )}

            {/* {selectedJobTitle !== null &&
              selectedJobTitle === "All" &&
              (hiraInWorkflow?.status === "REJECTED" ||
                hiraInWorkflow?.status === "APPROVED" ||
                (!isHiraInWorkflow && !hiraInWorkflow?.status)) && (
                <Button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#003566",
                    color: "white",
                  }}
                  onClick={handleReviewAspImp}
                >
                  Review Aspect Impact
                </Button>
              )} */}

            {selectedJobTitle !== null &&
              // selectedJobTitle !== "All" &&
              selectedJobTitle === "All" &&
              isHiraInWorkflow &&
              hiraInWorkflow?.status !== "REJECTED" &&
              hiraInWorkflow?.status !== "APPROVED" && (
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

            {selectedJobTitle !== null &&
              // selectedJobTitle !== "All" &&
              selectedJobTitle === "All" &&
              isHiraInWorkflow && (
                <Tooltip title="View Consolidated Workflow History">
                  <HistoryIcon
                    className={classes.historyIcon}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setConsolidatedWorkflowHistoryDrawer({
                        open: true,
                        data: hiraInWorkflow,
                      })
                    }
                  />
                </Tooltip>
              )}
            <div
              style={{
                marginLeft: "auto",
                width: smallScreen ? "" : "100%",
                padding: matches ? "" : "0px 5px",
              }}
            >
              <Input
                size="middle"
                placeholder="Search Risk"
                onChange={(event: any) => setSearch(event.target.value)}
                prefix={<SearchIcon />}
              />
            </div>
          </div>

          {matches ? (
            ""
          ) : (
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "start",
                marginLeft: "15px",
              }}
            >
              {
                selectedJobTitle !== null &&
                  // selectedJobTitle !== "All" &&

                  isHiraInWorkflow &&
                  getStatusOfInWOrkflowHira()
                // <Space size={[0, 8]} wrap>
                //   {" "}
                //   <Tag color="#87d068">In Workflow</Tag>
                // </Space>
              }
            </div>
          )}

          {(isTableDataLoaded || isAspImpReviewHistoryLoaded) &&
          !!selectedJobTitle &&
          tableData?.length ? (
            <div>
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
                {isTableDataLoaded && (
                  <Descriptions.Item
                    label="Created By :"
                    style={{ textTransform: "capitalize" }}
                  >
                    {tableData[0]?.createdByUserDetails?.firstname +
                      " " +
                      tableData[0]?.createdByUserDetails?.lastname ||
                      "N/A"}{" "}
                  </Descriptions.Item>
                )}

                <Descriptions.Item
                  label="Reviewed By :"
                  style={{ textTransform: "capitalize" }}
                >
                  {!!hiraInWorkflow?.reviewedBy
                    ? hiraInWorkflow?.reviewedByUserDetails?.firstname +
                      " " +
                      hiraInWorkflow?.reviewedByUserDetails?.lastname
                    : "N/A"}
                </Descriptions.Item>

                <Descriptions.Item
                  label="Approved By :"
                  style={{ textTransform: "capitalize" }}
                >
                  {!!hiraInWorkflow?.approvedBy
                    ? hiraInWorkflow?.approvedByUserDetails?.firstname +
                      " " +
                      hiraInWorkflow?.approvedByUserDetails?.lastname
                    : "N/A"}
                </Descriptions.Item>
                {isTableDataLoaded && (
                  <Descriptions.Item label="Created On : ">
                    {tableData[0]?.createdAt
                      ? moment(tableData[0]?.createdAt).format(
                          "DD/MM/YYYY HH:mm"
                        )
                      : "N/A"}
                  </Descriptions.Item>
                )}

                <Descriptions.Item label="Reviewed On : ">
                  {!!hiraInWorkflow?.reviewedOn
                    ? moment(hiraInWorkflow?.reviewedOn).format(
                        "DD/MM/YYYY HH:mm"
                      )
                    : "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Approved On :">
                  {" "}
                  {!!hiraInWorkflow?.approvedOn
                    ? moment(hiraInWorkflow?.approvedOn).format(
                        "DD/MM/YYYY HH:mm"
                      )
                    : "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </div>
          ) : (
            ""
          )}
        </div>

        {/* <Row> */}
        {/* <Col span={24}> */}
        <div
          className={classes.tableContainer}
          id="table1"
          // style={{  height: "300px" }}
        >
          {matches ? (
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
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-evenly",
                marginBottom: "30px",
              }}
            >
              {tableData?.map((data, index) => {
                const preColor =
                  data.preMitigationScore > 0
                    ? determineColor(
                        data.preMitigationScore,
                        existingRiskConfig?.riskIndicatorData
                      )
                    : "transparent";

                const preScore =
                  data?.preSeverity * data?.preProbability || "N/A";

                const postColor =
                  data.postMitigationScore > 0
                    ? determineColor(
                        data.postMitigationScore,
                        existingRiskConfig?.riskIndicatorData
                      )
                    : "transparent";

                const postScore =
                  data?.postSeverity * data?.postProbability || "N/A";

                const parent = tableData.find((parentRecord) =>
                  parentRecord?.mitigations?.some(
                    (child: any) => child._id === data._id
                  )
                );

                return (
                  <div
                    key={index}
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
                      onClick={() => handleEdit(data.id)}
                    >
                      {data?.jobTitle}
                    </p>
                    <p>Activities: {data?.activity}</p>
                    <p>
                      Aspect Type: {data?.selectedAspectType?.name || "N/A"}
                    </p>
                    <p>
                      Impact Type:{" "}
                      {!!data?.selectedImpactType?.name
                        ? data?.selectedImpactType?.name
                        : "N/A"}
                    </p>
                    <p
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      Pre Score:
                      {data.preMitigationScore > 0 ||
                      data.postMitigationScore > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {data.preMitigationScore > 0 && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginRight: "10px",
                              }}
                            >
                              <div
                                style={{
                                  width: "10px",
                                  height: "10px",
                                  backgroundColor: preColor,
                                  marginLeft: "5px",
                                  marginRight: "5px",
                                }}
                              />
                              <Tooltip title="Click For Risk Heatmap">
                                <Typography.Link
                                  onClick={() => toggleScoreModal(data, "pre")}
                                  style={{ textDecoration: "underline" }}
                                >
                                  {preScore}
                                </Typography.Link>
                              </Tooltip>
                            </span>
                          )}
                          {data.preMitigationScore > 0 &&
                            data.postMitigationScore > 0 && (
                              <span
                                style={{
                                  marginRight: "5px",
                                  marginLeft: "5px",
                                }}
                              >
                                |
                              </span>
                            )}
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </p>
                    <p
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      Post Score:
                      {data.preMitigationScore > 0 ||
                      data.postMitigationScore > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {data.postMitigationScore > 0 && (
                            <span
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <div
                                style={{
                                  width: "10px",
                                  height: "10px",
                                  backgroundColor: postColor,
                                  marginLeft: "5px",
                                  marginRight: "5px",
                                }}
                              />
                              <Typography.Link
                                onClick={() => toggleScoreModal(data, "post")}
                                style={{ textDecoration: "underline" }}
                              >
                                {postScore}
                              </Typography.Link>
                            </span>
                          )}
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
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
        {/* </Col> */}
        {/* </Row> */}
      </Space>

      <div>
        {!!aspImpReviewModal.open && (
          <AspImpReviewModal
            reviewModal={aspImpReviewModal}
            setReviewModal={setAspImpReviewModal}
            selectedJobTitle={selectedJobTitle}
            reloadListAfterSubmit={reloadListAfterSubmit}
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
            isAspImp={true}
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
            selectedAspImpId={selectedAspImpId}
            fetchAllJobTitles={fetchAllJobTitles}
            isWorkflowPage={false}
            reloadListAfterSubmit={reloadListAfterSubmit}
            hiraInWorkflow={hiraInWorkflow}
            handleAddDeptInChangesTrack={handleAddDeptInChangesTrack}
            jobTitleOptions={jobTitleOptions}
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
      <div>
        {!!reviewModal.open && (
          <ShareWithUsersModal
            reviewModal={reviewModal}
            setReviewModal={setReviewModal}
          />
        )}
      </div>

      <div>
        {!!deleteModal.open && (
          <Modal
            title="Delete Stage"
            open={deleteModal.open}
            onCancel={() => {
              setDeleteModal({ open: false, id: "" });
            }}
            footer={[
              <Button
                key="cancel"
                onClick={() => {
                  setDeleteModal({ open: false, id: "" });
                }}
              >
                Cancel
              </Button>,
              <Button
                key="yes"
                type="primary"
                onClick={() => {
                  setDeleteModal({ open: false, id: "" });
                  handleDeleteStage();
                }}
              >
                Yes, Proceed
              </Button>,
            ]}
          >
            <p>Are you sure to delete this stage?</p>
          </Modal>
        )}
      </div>

      <div>
        {!!consolidatedWorkflowHistoryDrawer.open && (
          <AspImpConsolidatedWorkflowHistoryDrawer
            consolidatedWorkflowHistoryDrawer={
              consolidatedWorkflowHistoryDrawer
            }
            handleConsolidatedCloseWorkflowHistoryDrawer={
              handleConsolidatedCloseWorkflowHistoryDrawer
            }
          />
        )}
      </div>
      <div>
        {!!showInfoModal && (
          <InfoModal
            showInfoModal={showInfoModal}
            setShowInfoModal={setShowInfoModal}
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
        onOk={handleOkModal}
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
              label="Corp Func/Unit"
              // label="Filter By Unit"
              name="locationId"
              style={{ width: "100%" }}
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
                options={locationOptions || []}
                onChange={(value) => handleLocationChange(value)}
              />
            </Form.Item>
            <Form.Item
              label="Dept/Vertical"
              // label="Filter By Area/Department"
              name="entityId"
              style={{ width: "100%" }}
            >
              <Select
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
                value={selectedEntity || undefined}
                options={departmentOptions || []}
                onChange={(value) => handleDepartmentChange(value)}
              />
            </Form.Item>
            <Form.Item
              label="Stage"
              // label="Filter By Stage"
              name="jobTitle"
              style={{ width: "100%" }}
            >
              <Select
                showSearch
                // placeholder="Filter By Stage"
                placeholder="Select  Stage"
                optionFilterProp="children"
                filterOption={(input: any, option: any) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{ width: "100%" }}
                value={selectedJobTitle}
                options={jobTitleOptions || []}
                onChange={(value) => handleJobTitleOptionChange(value)}
                listHeight={200}
              >
                {jobTitleOptions.map((option: any) => (
                  <Select.Option key={option.value} value={option.value}>
                    <Tooltip title={option.label} placement="right">
                      <div
                        style={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          width: "350px",
                          maxWidth: "350px",
                        }}
                      >
                        {option.label}
                      </div>
                    </Tooltip>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default AspectImpactRegisterPage;
