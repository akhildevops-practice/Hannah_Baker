import React, { useState, useEffect } from "react";
import useStyles from "./styles";
import moment from "moment";
import axios from "apis/axios.global";
import DocumentRead from "pages/DocumentControl/DocumentRead";
import SplitPane from "react-split-pane";
// import Document from "assets/candyBox/documents.png";
// import DocItemIcon from "assets/documentControl/docItem.svg";
import { ReactComponent as DocItemIcon } from "assets/documentControl/docItem.svg";
import { Icon, useMediaQuery } from "@material-ui/core";
import getAppUrl from "utils/getAppUrl";
import { ReactComponent as DocControlIcon } from "assets/InboxColoredIcons/Process-Doc_1.svg";
import { ReactComponent as CIPIcon } from "assets/InboxColoredIcons/CIP_1.svg";
import { ReactComponent as CAPAIcon } from "assets/InboxColoredIcons/CAPA_1.svg";

import AllInboxIcon from "@material-ui/icons/AllInbox";
import { ReactComponent as ActionPointIcon } from "../../assets/InboxColoredIcons/Action-items_1.svg";

import { ReactComponent as AspImpIcon } from "assets/appsIcon/ASP-IMP.svg";
import { ReactComponent as ObjTargetIcon } from "assets/appsIcon/Obj & Targets.svg";
import { ReactComponent as AuditPlanIcon } from "assets/InboxColoredIcons/Audit-plan_1.svg";

import { ReactComponent as AuditScheduleIcon } from "assets/InboxColoredIcons/Audit-schedule_1.svg";

import { ReactComponent as NcSummaryIcon } from "assets/InboxColoredIcons/Findings_1.svg";

import { ReactComponent as HIRAIcon } from "assets/InboxColoredIcons/HIRA copy_1.svg";
import {
  List,
  Typography,
  ListItem,
  ListItemText,
  InputLabel,
  Divider,
  MenuItem,
  FormControl,
  Select,
  Grid,
  CircularProgress,
  Avatar,
  ListItemAvatar,
  Paper,
} from "@material-ui/core";
import {
  Button,
  Descriptions,
  Form,
  Input,
  Table,
  Tooltip,
  Pagination,
  PaginationProps,
  Select as AntdSelect,
  Skeleton,
} from "antd";
import { Drawer, IconButton } from "@material-ui/core";
import { Assessment, Menu } from "@material-ui/icons";
import ModuleHeader from "components/Navigation/ModuleHeader";
import checkRole from "utils/checkRoles";
import { checkIsAuditor, checkRatePermissions } from "apis/auditApi";
import getUserId from "utils/getUserId";
import checkRoles from "utils/checkRoles";
import { getSectionClassNames } from "@fullcalendar/react";
import NcSummaryForm from "components/NcSummaryForm";
import NCInfoTable from "./NCInfoTable";
import ActionItemDrawer from "./ActionItemDrawerInbox";
import ActionItemDrawerInbox from "./ActionItemDrawerInbox";
import CaraDetailsDrawer from "components/CaraDrawer/CaraDetailsDrawer";
import CaraDrawer from "components/CaraDrawer";
import { useNavigate } from "react-router-dom";
import getSessionStorage from "utils/getSessionStorage";

//HIRA
import HiraWorkflowModal from "components/Risk/Hira/HiraRegisterReview/HiraWorkflowModal";
import NcSummaryDrawer from "components/NcSummaryForm/NcSummaryDrawer";
import CIPDrawer from "components/CIPManagement/CIPTable/CIPDrawer";
//import NcInboxForm from "components/NcSummaryForm/NcInboxform";

const documentTypes = [
  "All",
  "Process Doc",
  "Audit Plans",
  "Audit Schedules",
  "Findings",
  "Action Items",
  "Capa",
  "HIRA",
  "CIP",
  "Aspect Impact",
];
const getIcon = (type: any) => {
  const iconStyle = {
    width: "24px",
    height: "24px",
  };

  switch (type) {
    case "Process Doc":
      return <DocControlIcon style={iconStyle} />;
    case "Audit Plans":
      return <AuditPlanIcon style={iconStyle} />;
    case "Audit Schedules":
      return <AuditScheduleIcon style={iconStyle} />;
    case "Findings":
      return <NcSummaryIcon style={iconStyle} />;
    case "Action Items":
      return <ActionPointIcon style={iconStyle} />;
    case "Capa":
      return <CAPAIcon style={iconStyle} />;
    case "HIRA":
      return <HIRAIcon style={iconStyle} />;
    case "CIP":
      return <CIPIcon style={iconStyle} />;
    case "Aspect Impact":
      return <AspImpIcon style={{ color: "#0B539B" }} />;
    // case 'Doc Control':
    // return <DocIcon />;
    default:
      return <AllInboxIcon style={{ color: "#0B539B" }} />;
  }
};

const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;

const Inbox = () => {
  const orgId = sessionStorage.getItem("orgId");
  const userDetails = getSessionStorage();
  const navigate = useNavigate();
  const classes = useStyles();
  const matches = useMediaQuery("(min-width:822px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const [docId, setDocId] = useState<string>("");
  const [ncId, setNcId] = useState<string>("");
  const realm = getAppUrl();
  const [ncName, setNcName] = useState<string>("");
  const [ncData, setNcData] = useState<any>({});
  const [capaId, setCapaId] = useState<string>("");
  const [capaName, setCapaName] = useState<string>("");
  const [auditPlanId, setAuditPlanId] = useState<string>("");
  const [auditPlanName, setAuditPlanName] = useState<string>("");
  const [auditplan, setAuditPlan] = useState<string>("");
  const [actionId, setActionId] = useState<string>("");
  const [actionName, setActionName] = useState<string>("");
  const [docName, setDocName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [array, setArray] = useState<any[]>([]);
  const [reload, setReload] = useState<boolean>(false);
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [selectedNcIndex, setSelectedNcIndex] = useState(0);
  const [sortedArray, setSortedArray] = useState<any[]>([]);
  const [auditArray, setAuditArray] = useState<any[]>([]);
  const [capaArray, setCapaArray] = useState<any[]>([]);
  const [auditPlanArray, setAuditPlanArray] = useState<any[]>([]);
  const [auditScheduleArray, setAuditScheduleArray] = useState<any[]>([]);
  const [cipArray, setcipArray] = useState<any[]>([]);
  const [actionItemArray, setActionItemArray] = useState<any[]>([]);
  const [selectedInboxItem, setSelectedInboxItem] = useState<any>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal2Open, setModal2Open] = useState(false);
  const [modalData, setModalData] = React.useState({
    open: false,
    data: {},
    editMode: false,
    refresh: false,
  });
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [acitveTab, setActiveTab] = useState<any>("1");
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isUpload, setUpload] = useState<boolean>(false);
  const isMR = checkRole("MR");
  const userId = getUserId();
  let isOrgAdmin = checkRoles("ORG-ADMIN");
  const [drawerDataState, setDrawerDataState] = useState<any>({});
  const [drawer, setDrawer] = useState<any>({
    mode: "Edit",
    open: false,
    clearFields: true,
    toggle: false,
    source: "",
    data: {},
  });
  const [cipDrawer, setCipDrawer] = useState<any>({
    open: false,
    mode: "edit",
    toggle: true,
    clearFields: false,
    data: {},
  });
  //HIRA
  const [hiraHeaderForm] = Form.useForm();
  const [hiraId, setHiraId] = useState<string>("");
  const [hiraArray, setHiraArray] = useState<any[]>([]);
  const [areaOptions, setAreaOptions] = useState<any>([]);
  const [sectionOptions, setSectionOptions] = useState<any>([]);
  const [aspId, setAspId] = useState<string>("");
  const [aspImpArray, setAspImpArray] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState<any>(null);
  const [hiraStatus, setHiraStatus] = useState<any>("open");
  const [hiraInWorkflow, setHiraInWorkflow] = useState<any>(null);
  const [hiraWorkflowModal, setHiraWorkflowModal] = useState<any>({
    open: false,
    data: null,
    status: hiraInWorkflow?.status,
  });
  const [hiraRegisterData, setHiraRegisterData] = useState<any>(null);
  const [hiraStepsDataLoading, setHiraStepsDataLoading] =
    useState<boolean>(false);
  const realmName = getAppUrl();
  const rowClassName = (record: any) => {
    return record.highlight ? "highlighted-row" : "";
  };
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const columns: any = [
    {
      title: "S.No",
      dataIndex: "sNo",
      key: "sNo",
      editable: true,
      align: "center",
      width: "50px",
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
      title: "Hazard",
      dataIndex: "hazardTypeId",
      key: "hazardTypeId",
      editable: true,
      render: (_: any, record: any) => record?.hazardName || "N/A",
    },
    {
      title: "Hazard Description",
      dataIndex: "hazardDescription",
      key: "hazardDescription",
      editable: true,
      render: (_: any, record: any) => record?.hazardDescription || "N/A",
    },
    {
      title: "Impact",
      dataIndex: "impactText",
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
      editable: false,
      render: (_: any, record: any) => {
        const score = record?.preSeverity * record?.preProbability || "N/A";
        return !record.type ? (
          <Tooltip>
            <Typography>{score}</Typography>
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
      editable: false,
      align: "center",
      render: (_: any, record: any) => {
        const score = record?.postSeverity * record?.postProbability || "N/A";
        return !record.type ? <Typography>{score}</Typography> : "N/A";
      },
    },
  ];

  useEffect(() => {
    console.log("checkinboxnew [selectedId]--->", selectedId);
  }, [selectedId]);

  const checkIfLoggedInUserCanReview = () => {
    console.log(
      "checkrisk4 hiraheader form data in checkIdLoggedUserCanReview",
      hiraRegisterData
    );
    const ongoingWorkflowDetails = hiraRegisterData?.workflow?.find(
      (workflow: any) =>
        workflow?.cycleNumber === hiraRegisterData?.currentVersion + 1
    );
    console.log(
      "checkrisk4 ongoingWorkflowDetails checkIdLoggedUserCanReview",
      ongoingWorkflowDetails
    );
    const isReviewer = ongoingWorkflowDetails?.reviewers?.some(
      (reviewer: any) => reviewer === userDetails?.id
    );
    return isReviewer;
  };

  const checkIfLoggedInUserCanApprove = () => {
    console.log(
      "checkrisk4 hiraheader form data checkIdLoggedUserCanApprove",
      hiraRegisterData
    );
    const ongoingWorkflowDetails = hiraRegisterData?.workflow?.find(
      (workflow: any) =>
        workflow?.cycleNumber === hiraRegisterData?.currentVersion + 1
    );
    console.log(
      "checkrisk4 ongoingWorkflowDetails checkIdLoggedUserCanApprove",
      ongoingWorkflowDetails
    );
    const isApprover = ongoingWorkflowDetails?.approvers?.some(
      (approver: any) => approver === userDetails?.id
    );
    return isApprover;
  };

  const handleClickWorkflow = () => {
    if (
      hiraRegisterData?.workflowStatus === "DRAFT" ||
      hiraRegisterData?.workflowStatus === "APPROVED" ||
      hiraRegisterData?.workflowStatus === "IN_REVIEW" ||
      hiraRegisterData?.workflowStatus === "IN_APPROVAL" ||
      hiraRegisterData?.workflowStatus === "REJECTED"
    ) {
      const status =
        hiraRegisterData?.workflowStatus === "REJECTED"
          ? "STARTREVIEW"
          : hiraRegisterData?.workflowStatus === "APPROVED"
          ? "DRAFT"
          : hiraRegisterData?.workflowStatus;
      setHiraWorkflowModal({
        ...hiraWorkflowModal,
        open: true,
        status: status,
        data: {
          jobTitle: hiraRegisterData?.jobTitle,
          hiraId: hiraRegisterData?._id,
          entityName: hiraRegisterData?.entityDetails?.entityName,
          entityId: hiraRegisterData?.entityId,
          locationId: hiraRegisterData?.locationId,
          locationName: hiraRegisterData?.locationDetails?.locationName,
          isRevision:
            hiraRegisterData?.prefixSuffix &&
            (hiraRegisterData?.workflowStatus === "DRAFT" ||
              hiraRegisterData?.workflowStatus === "APPROVED")
              ? true
              : false,
        },
      });
    } else {
      // enqueueSnackbar(
      //   "Workflow can be initiated only for DRAFT, IN REVIEW, IN APPROVAL or REJECTED HIRA",
      //   {
      //     variant: "warning",
      //   }
      // );
    }
  };

  const handleRejectHira = () => {
    console.log("checkrisk handlereject hira called");
    setHiraWorkflowModal({
      ...hiraWorkflowModal,
      open: true,
      status: "REJECTED",
      data: {
        jobTitle: hiraRegisterData?.jobTitle,
        hiraId: hiraRegisterData?._id,
        entityName: hiraRegisterData?.entityDetails?.entityName,
        entityId: hiraRegisterData?.entityId,
        locationId: hiraRegisterData?.locationId,
        locationName: hiraRegisterData?.locationDetails?.locationName,
      },
    });
  };

  const getResponse = async () => {
    await axios
      .get("/api/my-inbox/getDocumentsByUser")
      .then((res: any) => {
        const mixedArray = [
          ...res.data.mydocuments,
          ...res.data.documentsinapprovalstate,
          ...res.data.documentsinreviewstate,
        ];

        // Remove duplicates based on the id property
        const uniqueArray = mixedArray.filter(
          (document: any, index: number, self: any[]) =>
            index === self.findIndex((d: any) => d.id === document.id)
        );

        // Sort the unique array based on createdAt property in descending order
        const sortedArray = uniqueArray.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Set the state with the sorted unique array
        setSortedArray(sortedArray);
        setArray(sortedArray);
      })
      .catch((err: any) => {
        setIsLoading(false);
        console.log(err);
      });
  };

  const getAuditResponse = async () => {
    await axios
      .get("/api/my-inbox/getAllAudits")
      .then((res: any) => {
        const mixedArray = [
          ...res.data.auditee,
          ...res.data.auditor,
          ...res?.data?.verifiedData,
        ];

        // Remove duplicates based on the id property
        const uniqueArray = mixedArray.filter(
          (audit: any, index: number, self: any[]) =>
            index === self.findIndex((a: any) => a.id === audit.id)
        );

        // Sort the unique array based on createdAt property
        const sortedArray = uniqueArray.sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Set the state with the sorted unique array
        setAuditArray(sortedArray);
        setArray(sortedArray);
      })
      .catch((err: any) => {
        setIsLoading(false);
        console.log(err);
      });
  };

  const getActionItems = async () => {
    try {
      const res = await axios.get("api/actionitems/getActionItemForOwner");
      //  console.log("resdata:", res);

      const sortedArray = [...res.data].sort(
        (a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setActionItemArray(sortedArray);
      // setArray(sortedArray);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    }
  };
  const getCapaResponse = async () => {
    await axios
      .get("/api/cara/getAllCapaForInbox")
      .then((res: any) => {
        // console.log("id in caparesponse", res.data);
        const mixedArray = [...res.data.dh, ...res.data.caraOwner];

        // Use Set to remove duplicates
        const uniqueArray = Array.from(
          new Set(mixedArray?.map((item) => item._id))
        );

        // Create an array of unique objects based on the unique IDs
        const uniqueObjects = uniqueArray?.map((id) =>
          mixedArray.find((item) => item._id === id)
        );

        // Sort the unique array
        const sortedUniqueArray = uniqueObjects.sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setCapaArray(sortedUniqueArray);
        setArray(sortedArray);
      })
      .catch((err: any) => {
        setIsLoading(false);
        console.log(err);
      });
  };

  const getHiraResponse = async () => {
    const res = await axios.get(`/api/riskregister/getHiraForInbox`);
    const mixedArray = [...res.data.reviewState, ...res.data.approveState];
    const sortedUniqueArray = mixedArray.sort(
      (a: any, b: any) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );
    setHiraArray(sortedUniqueArray);
    setArray(sortedArray);
  };
  //aspet impact
  const getAspImpResponse = async () => {
    const res = await axios.get(`/api/aspect-impact/getAspImpForInbox`);
    const mixedArray = [
      ...res.data.reviewState,
      ...res.data.approveState,
      ...res.data?.creatorState,
    ];
    const sortedUniqueArray = mixedArray.sort(
      (a: any, b: any) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );
    // console.log("aspect impact data", sortedUniqueArray);
    setAspImpArray(sortedUniqueArray);
    setArray(sortedArray);
  };

  const getAuditPlanResponse = async () => {
    const res = await axios.get(`api/auditplan/getFinalizedInfoForInbox`);
    const mixedArray = [...res?.data];
    const sortedUniqueArray = mixedArray.sort(
      (a: any, b: any) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );
    setAuditPlanArray(sortedUniqueArray);
    setArray(sortedArray);
  };

  const getAuditScheduleResponse = async () => {
    const res = await axios.get(
      `api/auditschedule/getAuditScheduleForTLinInbox`
    );
    console.log("response for audit schedule", res);
    const mixedArray = [...res?.data];
    const sortedUniqueArray = mixedArray.sort(
      (a: any, b: any) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );
    setAuditScheduleArray(sortedUniqueArray);
    setArray(sortedArray);
  };
  const getCIPResponse = async () => {
    const res = await axios.get(`api/cip/getCIPInfoForInbox`);
    console.log("response for cip", res);
    const mixedArray = [...res?.data];
    const sortedUniqueArray = mixedArray.sort(
      (a: any, b: any) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );
    setcipArray(sortedUniqueArray);
    setArray(sortedArray);
  };
  const handleCloseDrawer = () => {
    setDrawer({
      data: null,
      open: false,
      source: "",
    });
    getActionItems();
  };
  const handleCapaCloseDrawer = () => {
    setDrawer({
      data: null,
      open: false,
      mode: "create",
    });

    setIsEdit(false);

    // getCapaResponse();
    // setReload(true);
  };

  const handleCipCloseDrawer = () => {
    setCipDrawer({
      data: null,
      open: false,
      mode: "create",
    });
    setReload(true);
  };
  useEffect(() => {
    //console.log(" doc id in inbox-->", docId);

    getResponse();
    setSelectedDocIndex(0);
    setSelectedNcIndex(0);
    setDocId("");
    getAuditResponse();
    getActionItems();
    getCapaResponse();
    getHiraResponse();
    getAuditPlanResponse();
    getAuditScheduleResponse();
    getCIPResponse();
    getAspImpResponse();
    setReload(false);
  }, [reload]);

  const handleClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    id: string,
    name: string
  ) => {
    setDocId(id);
    setDocName(name);
    setSelectedId(`doc_${id}`);
    if (matches === false) {
      setModal2Open(true);
    }
  };
  //console.log("selectedid", selectedId);
  useEffect(() => {
    // When ncId changes, update the NCInfoTable by setting reload to true
    setReload(true);
    setNcId(ncId);
  }, [ncId, selectedInboxItem]);
  useEffect(() => {
    getAuditResponse();
  }, [openDrawer]);

  const handleNCClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    _id: string,
    id: string,
    audit: any
  ) => {
    setNcId(_id);
    setNcName(id);
    setSelectedId(`audit_${_id}`);
    console.log("ncdata", audit);
    const data: any = {
      id: _id,
      ...audit,
    };
    setNcData(data);
    setModalData({ ...modalData, data: ncData, open: true });
    setOpenDrawer(true);
    // if (matches === false) {
    //   setModal2Open(true);
    // }
  };
  const handleCapaClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    _id: string,
    id: string,
    action: any
  ) => {
    setCapaId(_id);
    setCapaName(id);
    setSelectedId(`capa_${_id}`);

    navigate(`/cara/caraForm/${_id}`);

    if (matches === false) {
      setModal2Open(true);
    }
  };
  const handleCipClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    _id: string,
    id: string,
    action: any
  ) => {
    // setCapaId(_id);
    // setCapaName(id);
    //console.log("action data", action);
    setSelectedId(`cip_${_id}`);
    //  const [cipDrawer, setCipDrawer] = useState<any>({
    // open: !drawer.open,
    // mode: "edit",
    // toggle: true,
    // clearFields: false,
    // data: { ...drawer?.data, id: drawerDataState?.id },
    // });
    setCipDrawer({
      mode: "edit",
      data: { ...action, id: _id },
      open: !cipDrawer.open,
      toggle: false,
    });
    // if (matches === false) {
    //   setModal2Open(true);
    // }
  };

  const handleActionClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    _id: string,
    id: string,
    action: any
  ) => {
    // console.log("event in handleActionclick", action);
    setActionId(_id);
    setActionName(id);
    setSelectedId(`action_${_id}`);
    setDrawer({
      data: action,
      source: action.source,
      open: true,
      mode: "edit",
    });
    if (matches === false) {
      setModal2Open(true);
    }
  };
  const handleAuditPlanClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    _id: string,
    id: string,
    action: any
  ) => {
    console.log("action?.url", action?.url);
    setAuditPlanId(_id);
    setAuditPlanName(id);
    console.log("action value in audit olan");
    setSelectedId(`auditplan_${_id}`);

    window.open(action?.url, "_blank");
  };

  const handleAuditScheduleClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    _id: string,

    action: any
  ) => {
    console.log("action value in audit olan");
    setSelectedId(`auditschedule_${_id}`);

    window.open(action?.url, "_blank");
  };
  const handleAspImpClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    _id: string,

    action: any
  ) => {
    console.log("action", action);
    setSelectedId(`aspImp_${_id}`);

    window.open(action?.url, "_blank");
  };

  const getAllAreaMaster = async () => {
    try {
      const res = await axios.get(
        `api/riskconfig/getAllAreaMaster?locationId=${userDetails?.location?.id}&orgId=${userDetails?.organizationId}&master=true`
      );
      // console.log("checkrisk res in getHazardTypeOptions", res);
      if (res.status === 200) {
        if (res?.data && !!res?.data?.data?.length) {
          const areaOptions = res?.data?.data?.map((item: any) => ({
            label: item.name,
            value: item._id,
          }));
          setAreaOptions(areaOptions);
        } else {
          setAreaOptions([]);
        }
      } else {
        setAreaOptions([]);
      }
    } catch (error) {
      // console.log("checkrisk error in getHiraTypesOptions ", error);
    }
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
        }
      } else {
        setSectionOptions([]);
      }
    } catch (error) {
      // console.log("checkrisk error in getHiraTypesOptions ", error);
    }
  };

  const handleHiraClickNew = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    _id: string,
    jobTitle: string
  ) => {
    try {
      setHiraStepsDataLoading(true);
      console.log("checkrisk7 in handleHiraClickNew", _id, jobTitle);
      let riskTypeOptions;
      let conditionOptions;
      let userOptions: any[];

      getAllAreaMaster();
      const getHiraWithStepResult = await axios.get(
        `/api/riskregister/hira/getHiraWithSteps/${_id}?&page=${1}&pageSize=${10}`
      );
      const hiraDetails = getHiraWithStepResult?.data?.hira;
      const hiraSteps = getHiraWithStepResult?.data?.steps;
      getSectionOptions(hiraDetails?.entityId);
      const tblData = hiraSteps?.map((obj: any) => ({
        ...obj,
        id: obj?._id,
        sNo: obj?.sNo || "",
        highlight: false,
        isOldEntry: true,
        selectedHazardType: obj?.hazardTypeDetails || null,
        hazardName: obj?.hazardTypeDetails?.name,
        responsiblePersonName: obj?.responsiblePerson
          ? obj?.responsiblePersonDetails?.firstname +
            " " +
            obj?.responsiblePersonDetails?.lastname
          : "",
      }));
      setHiraId(_id);
      setTableData([...tblData]);
      setSelectedJobTitle(hiraDetails?.jobTitle);
      setSelectedId(`hira_${_id}`);
      setPagination((prev) => ({
        ...prev,
        total: getHiraWithStepResult.data.stepsCount,
      }));
      // GET RISK AND CONDITION NAME
      const getRiskType = await axios.get(
        `/api/riskconfig/getHiraConfig/${orgId}`
      );
      if (getRiskType.status === 200 || getRiskType.status === 201) {
        if (!!getRiskType.data && !!getRiskType.data.length) {
          const data = getRiskType.data[0];
          riskTypeOptions = data?.riskType?.map((riskType: any) => ({
            label: riskType.name,
            value: riskType._id,
          }));
          conditionOptions = data?.condition?.map((riskType: any) => ({
            label: riskType.name,
            value: riskType._id,
          }));
        }
      }
      const riskName = riskTypeOptions.find(
        (item: any) => item.value === hiraDetails?.riskType
      );
      const conditionName = conditionOptions.find(
        (item: any) => item.value === hiraDetails?.condition
      );

      // GET USERS NAMES
      const getUsers = await axios.get(`/api/riskregister/users/${orgId}`);
      if (getUsers.status === 200 || getUsers.status === 201) {
        if (!!getUsers.data && getUsers.data.length > 0) {
          userOptions = getUsers.data.map((user: any) => ({
            userId: user.id,
            email: user.email,
          }));
        }
      }
      const emails = hiraDetails?.assesmentTeam.map((userId: any) => {
        const user = userOptions.find((user: any) => user.userId === userId);
        return user ? user.email : null;
      });
      const joinedEmails = emails.join(", ");

      setHiraRegisterData({
        ...hiraDetails,
        riskTypeName: riskName.label,
        conditionName: conditionName.label,
        sectionName: hiraDetails?.sectionDetails?.name,
        areaName: hiraDetails?.areaDetails?.name,
        assesmentTeamUsers: joinedEmails,
      });
      setHiraStepsDataLoading(false);
      if (matches === false) {
        setModal2Open(true);
      }
    } catch (error) {
      setHiraStepsDataLoading(false);
    }
  };

  const getHiraWithSteps = async (
    hiraId: any,
    page: any = 1,
    pageSize: any = 10
  ) => {
    try {
      let query: any = `/api/riskregister/hira/getHiraWithSteps/${hiraId}?`;
      if (page && pageSize) {
        query += `&page=${page}&pageSize=${pageSize}`;
      }
      const res = await axios.get(query);
      if (res?.status === 200) {
        if (res?.data?.steps && res?.data?.steps?.length) {
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
          setTableData([...stepsData]);
          setPagination((prev) => ({ ...prev, total: res?.data?.stepsCount }));
        }
      } else {
        setTableData([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
      }
    } catch (error: any) {
      setTableData([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
      if (error?.response) {
        if (error.response.status === 404) {
          // enqueueSnackbar("HIRA Not Found!", {
          //   variant: "error",
          // });
          // navigate("/risk/riskregister/HIRA");
        }
      } else {
        // Something else happened while making the request
        console.log("Error message:", error.message);
        // enqueueSnackbar("Something went wrong while fetching HIRA", {
        //   variant: "error",
        // })
        navigate("/risk/riskregister/HIRA");
      }
      console.log("Error config:", error.config);
    }
  };

  const handleChangePageNew = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize: pageSize }));
    getHiraWithSteps(hiraId, page, pageSize);
  };

  // console.log("selectedinboxitem", selectedInboxItem);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getTypeFromSelectedId = () => {
    console.log("selectedId", selectedId);

    if (selectedId && selectedId.startsWith("audit_")) {
      return "Findings";
    } else if (selectedId && selectedId.startsWith("doc_")) {
      return "Process Doc";
    } else if (selectedId && selectedId.startsWith("action_")) {
      return "Action Items";
    } else if (selectedId && selectedId.startsWith("capa_")) {
      return "Capa";
    } else if (selectedId && selectedId.startsWith("hira_")) {
      return "Hira";
    } else if (selectedId && selectedId.startsWith("auditPlan_")) {
      return "Audit Plans";
    } else if (selectedId && selectedId.startsWith("auditschedule_")) {
      return "Audit Schedules";
    } else if (selectedId && selectedId.startsWith("cip_")) {
      return "CIP";
    } else if (selectedId && selectedId.startsWith("aspImp_")) {
      return "Aspect Impact";
    } else return "All";
  };
  const documentCounts: any = {
    "Process Doc": sortedArray.length,
    Findings: auditArray.length,
    "Action Items": actionItemArray.length,
    Capa: capaArray.length,
    HIRA: hiraArray.length,
    "Audit Plans": auditPlanArray?.length,
    "Audit Schedules": auditScheduleArray?.length,
    "Aspect Impact": aspImpArray?.length,
    CIP: cipArray?.length,
    All:
      sortedArray.length +
      auditArray.length +
      actionItemArray.length +
      capaArray.length +
      auditPlanArray?.length +
      auditScheduleArray?.length +
      hiraArray.length +
      cipArray.length +
      aspImpArray?.length,
  };

  //console.log("ncid", ncId);

  return (
    <>
      {isLoading ? (
        <div className={classes.loading}>
          <CircularProgress />
        </div>
      ) : (
        <>
          {/* <ModuleHeader moduleName="Inbox" /> */}
          <Grid container style={{ height: "100vh", marginTop: "10px" }}>
            <Grid item xs={12} sm={2}>
              {/* <div style={{ display: "flex", flexDirection: "row" }}> */}
              <div
                style={{
                  width: matches ? "200px" : "auto",
                  marginRight: "10px",
                }}
              >
                <FormControl
                  variant="outlined"
                  size="small"
                  fullWidth
                  style={{ marginTop: "10px" }}
                >
                  <InputLabel>Inbox</InputLabel>
                  <Select
                    value={selectedInboxItem}
                    label="Inbox"
                    onChange={(e: any) => {
                      console.log(
                        "checkinboxnew onchanged value",
                        e.target.value
                      );

                      setSelectedInboxItem(e.target.value);
                      if (e.target.value === "Process Doc") {
                        setSelectedId(`doc_${sortedArray[0]?.id}`);
                      } else if (e.target.value === "Findings") {
                        setSelectedId(`audit_${auditArray[0]?.id}`);
                      } else if (e.target.value === "Action Items") {
                        setSelectedId(`action_${actionItemArray[0]?.id}`);
                      } else if (e.target.value === "Capa") {
                        setSelectedId(`capa_${capaArray[0]?.id}`);
                      } else if (e.target.value === "HIRA") {
                        setSelectedId(`hira_${hiraArray[0]?._id}`);
                      } else if (e.target.value === "Audit Plans") {
                        setSelectedId(`auditPlan_${auditPlanArray[0]?._id}`);
                      } else if (e.target.value === "Audit Schedules") {
                        setSelectedId(
                          `auditschedule_${auditScheduleArray[0]?._id}`
                        );
                      } else if (e.target.value === "CIP") {
                        setSelectedId(`cip_${cipArray[0]?._id}`);
                      } else if (e.target.value === "Aspect Impact") {
                        setSelectedId(`aspImp_${aspImpArray[0]?._id}`);
                      }
                    }}
                  >
                    {documentTypes.map((type, index) => (
                      <MenuItem
                        key={index}
                        value={type}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        {/* Add an icon before each MenuItem */}
                        <Icon style={{ marginRight: "8px" }}>
                          {getIcon(type)}
                        </Icon>
                        <span style={{ fontSize: "14px" }}>{`${type} (${
                          documentCounts[type] || 0
                        })`}</span>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <div className={classes.container}>
                  <List
                    component="nav"
                    aria-label="main mailbox folders"
                    style={{
                      width: "100%",
                      marginBottom: matches ? "0px" : "60px",
                    }}
                  >
                    {(selectedInboxItem === "All" ||
                      selectedInboxItem === "Process Doc") && (
                      <>
                        <div>
                          {sortedArray.map((doc: any, index: number) => {
                            const identifier = `doc_${doc.id}`;
                            return (
                              <ListItem
                                button
                                selected={selectedId === identifier}
                                key={doc.id}
                                onClick={(event: any) =>
                                  handleClick(event, doc.id, doc.documentName)
                                }
                                style={{
                                  borderBottom: "0.02px #999999 solid",
                                  borderRight: "0.02px #efefef solid",
                                  padding: "2px 10px 2px 10px",
                                }}
                              >
                                <ListItemAvatar style={{ minWidth: "40px" }}>
                                  <DocControlIcon width={28} height={28} />
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="inherit"
                                      noWrap
                                      style={{
                                        maxWidth: "100%",
                                        display: "-webkit-box",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {doc.documentName}
                                    </Typography>
                                  }
                                  secondary={
                                    <div>
                                      <div>
                                        {moment(doc.createdAt)
                                          .utc()
                                          .format("DD-MM-YYYY")}
                                      </div>
                                      <div style={{ fontSize: 10 }}>
                                        {doc.documentState.replace(/_/g, " ")}
                                      </div>
                                    </div>
                                  }
                                />
                              </ListItem>
                            );
                          })}
                        </div>
                      </>
                    )}
                    {(selectedInboxItem === "Findings" ||
                      selectedInboxItem === "All") && (
                      <>
                        {auditArray?.map((audit: any, index: number) => {
                          const identifier = `audit_${audit._id}`;
                          return (
                            <ListItem
                              button
                              selected={selectedId === identifier}
                              key={audit._id}
                              onClick={(event) =>
                                handleNCClick(event, audit._id, audit.id, audit)
                              }
                              style={{
                                borderBottom: "0.02px #999999 solid",
                                borderRight: "0.02px #efefef solid",
                                padding: "2px 10px",
                              }}
                            >
                              <ListItemAvatar style={{ minWidth: "40px" }}>
                                <NcSummaryIcon width={28} height={28} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="inherit"
                                    noWrap
                                    style={{
                                      maxWidth: "100%",
                                      display: "-webkit-box",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {audit.id}
                                  </Typography>
                                }
                                secondary={
                                  <div>
                                    <div>
                                      {moment(audit.createdAt)
                                        .utc()
                                        .format("DD-MM-YYYY")}
                                    </div>
                                    <div style={{ fontSize: 10 }}>
                                      {audit?.status?.replace(/_/g, " ")}
                                    </div>
                                  </div>
                                }
                              />
                            </ListItem>
                          );
                        })}
                      </>
                    )}
                    {(selectedInboxItem === "Action Items" ||
                      selectedInboxItem === "All") && (
                      <>
                        {actionItemArray?.map((action: any, index: number) => {
                          const identifier = `action_${action._id}`;
                          return (
                            <ListItem
                              button
                              selected={selectedId === identifier}
                              key={action._id}
                              onClick={(event) =>
                                handleActionClick(
                                  event,
                                  action._id,
                                  action.title,
                                  action
                                )
                              }
                              style={{
                                borderBottom: "0.02px #999999 solid",
                                borderRight: "0.02px #efefef solid",
                                padding: "2px 10px",
                              }}
                            >
                              <ListItemAvatar style={{ minWidth: "40px" }}>
                                <ActionPointIcon width={28} height={28} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="inherit"
                                    noWrap
                                    style={{
                                      maxWidth: "100%",
                                      display: "-webkit-box",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {action.title}
                                  </Typography>
                                }
                                secondary={
                                  <div>
                                    <div>
                                      {moment(action?.createdAt)
                                        .utc()
                                        .format("DD-MM-YYYY")}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 14,
                                        fontWeight: "bold",
                                        color: "#000066",
                                      }}
                                    >
                                      {action?.source}
                                    </div>
                                  </div>
                                }
                              />
                            </ListItem>
                          );
                        })}
                      </>
                    )}
                    {(selectedInboxItem === "Capa" ||
                      selectedInboxItem === "All") && (
                      <>
                        {capaArray?.map((action: any, index: number) => {
                          const identifier = `capa_${action._id}`;
                          return (
                            <ListItem
                              button
                              selected={selectedId === identifier}
                              key={action._id}
                              onClick={(event) =>
                                handleCapaClick(
                                  event,
                                  action._id,
                                  action.title,
                                  action
                                )
                              }
                              style={{
                                borderBottom: "0.02px #999999 solid",
                                borderRight: "0.02px #efefef solid",
                                padding: "2px 10px",
                              }}
                            >
                              <ListItemAvatar style={{ minWidth: "40px" }}>
                                <CAPAIcon width={28} height={28} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="inherit"
                                    noWrap
                                    style={{
                                      maxWidth: "100%",
                                      display: "-webkit-box",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {action.title}
                                  </Typography>
                                }
                                secondary={
                                  <div>
                                    <div>
                                      {moment(action?.createdAt)
                                        .utc()
                                        .format("DD-MM-YYYY")}
                                    </div>
                                    <div style={{ fontSize: 12 }}>
                                      {action?.status}
                                    </div>
                                  </div>
                                }
                              />
                            </ListItem>
                          );
                        })}
                      </>
                    )}
                    {(selectedInboxItem === "HIRA" ||
                      selectedInboxItem === "All") && (
                      <>
                        {hiraArray.map((hira: any, index: number) => {
                          const identifier = `hira_${hira._id}`;
                          return (
                            <ListItem
                              button
                              selected={selectedId === identifier}
                              key={hira._id}
                              onClick={(event) =>
                                handleHiraClickNew(
                                  event,
                                  hira._id,
                                  hira.jobTitle
                                )
                              }
                              style={{
                                borderBottom: "0.02px #999999 solid",
                                borderRight: "0.02px #efefef solid",
                                padding: "2px 10px",
                              }}
                            >
                              <ListItemAvatar style={{ minWidth: "40px" }}>
                                <HIRAIcon width={28} height={28} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="inherit"
                                    noWrap
                                    style={{
                                      maxWidth: "100%",
                                      display: "-webkit-box",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {hira.jobTitle}
                                  </Typography>
                                }
                                secondary={
                                  <div>
                                    <div>
                                      {moment(hira.updatedAt)
                                        .utc()
                                        .format("DD-MM-YYYY")}
                                    </div>
                                    <div style={{ fontSize: 10 }}>
                                      {hira?.status?.replace(/_/g, " ")}
                                    </div>
                                  </div>
                                }
                              />
                            </ListItem>
                          );
                        })}
                      </>
                    )}
                    {(selectedInboxItem === "Audit Plans" ||
                      selectedInboxItem === "All") && (
                      <>
                        {auditPlanArray?.map((action: any, index: number) => {
                          const identifier = `auditPlan_${action?.au?._id}`;
                          return (
                            <ListItem
                              button
                              selected={selectedId === identifier}
                              key={action?.au?._id}
                              onClick={(event) =>
                                handleAuditPlanClick(
                                  event,
                                  action.au?._id,
                                  action?.auditPlanName,

                                  action
                                )
                              }
                              style={{
                                borderBottom: "0.02px #999999 solid",
                                borderRight: "0.02px #efefef solid",
                                padding: "2px 10px",
                              }}
                            >
                              <ListItemAvatar style={{ minWidth: "40px" }}>
                                <AuditPlanIcon width={28} height={28} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="inherit"
                                    noWrap
                                    style={{
                                      maxWidth: "100%",
                                      display: "-webkit-box",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {action?.auditPlanName}
                                  </Typography>
                                }
                                secondary={
                                  <div>
                                    <div>
                                      {moment(action?.createdAt)
                                        .utc()
                                        .format("DD-MM-YYYY")}
                                    </div>
                                    <div style={{ fontSize: 12 }}>
                                      {action?.source}
                                    </div>
                                  </div>
                                }
                              />
                            </ListItem>
                          );
                        })}
                      </>
                    )}
                    {(selectedInboxItem === "Aspect Impact" ||
                      selectedInboxItem === "All") && (
                      <>
                        {aspImpArray?.map((action: any, index: number) => {
                          const identifier = `aspImp_${action?._id}`;
                          return (
                            <ListItem
                              button
                              selected={selectedId === identifier}
                              key={action?._id}
                              onClick={(event) =>
                                handleAspImpClick(
                                  event,
                                  action._id,

                                  action
                                )
                              }
                              style={{
                                borderBottom: "0.02px #999999 solid",
                                borderRight: "0.02px #efefef solid",
                                padding: "2px 10px",
                              }}
                            >
                              <ListItemAvatar style={{ minWidth: "40px" }}>
                                <AspImpIcon width={28} height={28} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="inherit"
                                    noWrap
                                    style={{
                                      maxWidth: "100%",
                                      display: "-webkit-box",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {"AI -" + action.entity}
                                  </Typography>
                                }
                                secondary={
                                  <div>
                                    <div>
                                      {moment(action?.createdAt)
                                        .utc()
                                        .format("DD-MM-YYYY")}
                                    </div>
                                  </div>
                                }
                              />
                            </ListItem>
                          );
                        })}
                      </>
                    )}
                    {(selectedInboxItem === "Audit Schedules" ||
                      selectedInboxItem === "All") && (
                      <>
                        {auditScheduleArray?.map(
                          (action: any, index: number) => {
                            const identifier = `auditschedule_${action?._id}`;
                            return (
                              <ListItem
                                button
                                selected={selectedId === identifier}
                                key={action?._id}
                                onClick={(event) =>
                                  handleAuditScheduleClick(
                                    event,
                                    action._id,

                                    action
                                  )
                                }
                                style={{
                                  borderBottom: "0.02px #999999 solid",
                                  borderRight: "0.02px #efefef solid",
                                  padding: "2px 10px",
                                }}
                              >
                                <ListItemAvatar style={{ minWidth: "40px" }}>
                                  <AuditScheduleIcon width={28} height={28} />
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="inherit"
                                      noWrap
                                      style={{
                                        maxWidth: "100%",
                                        display: "-webkit-box",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {action?.auditScheduleName}
                                    </Typography>
                                  }
                                  secondary={
                                    <div>
                                      <div>
                                        {moment(action?.createdAt)
                                          .utc()
                                          .format("DD-MM-YYYY")}
                                      </div>
                                      <div style={{ fontSize: 12 }}>
                                        {action?.source}
                                      </div>
                                    </div>
                                  }
                                />
                              </ListItem>
                            );
                          }
                        )}
                      </>
                    )}{" "}
                    {(selectedInboxItem === "CIP" ||
                      selectedInboxItem === "All") && (
                      <>
                        {cipArray?.map((action: any, index: number) => {
                          const identifier = `cip_${action?._id}`;
                          return (
                            <ListItem
                              button
                              selected={selectedId === identifier}
                              key={action?._id}
                              onClick={(event) =>
                                handleCipClick(
                                  event,
                                  action._id,
                                  action.title,
                                  action
                                )
                              }
                              style={{
                                borderBottom: "0.02px #999999 solid",
                                borderRight: "0.02px #efefef solid",
                                padding: "2px 10px",
                              }}
                            >
                              <ListItemAvatar style={{ minWidth: "40px" }}>
                                <CIPIcon width={28} height={28} />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="inherit"
                                    noWrap
                                    style={{
                                      maxWidth: "100%",
                                      display: "-webkit-box",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {action?.title}
                                  </Typography>
                                }
                                secondary={
                                  <div>
                                    <div>
                                      {moment(action?.createdAt)
                                        .utc()
                                        .format("DD-MM-YYYY")}
                                    </div>
                                    <div style={{ fontSize: 12 }}>
                                      {action?.status}
                                    </div>
                                  </div>
                                }
                              />
                            </ListItem>
                          );
                        })}
                      </>
                    )}
                  </List>
                </div>
              </div>
            </Grid>
            {getTypeFromSelectedId() === "Process Doc" ? (
              // Render DocumentRead component
              docId && !reload ? (
                <DocumentRead
                  id={docId}
                  name={docName}
                  reloadList={(reload: boolean) => setReload(reload)}
                  modal2Open={modal2Open}
                  setModal2Open={setModal2Open}
                />
              ) : sortedArray.length > 0 && !reload ? (
                <DocumentRead
                  id={sortedArray[0].id}
                  name={sortedArray[0].documentName}
                  reloadList={(reload: boolean) => setReload(reload)}
                  modal2Open={modal2Open}
                  setModal2Open={setModal2Open}
                />
              ) : (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <h1>No documents to display</h1>
                </div>
              )
            ) : getTypeFromSelectedId() === "Findings" ? (
              // Render Findings component
              ncId && !reload ? (
                <>
                  <Grid item xs={12} sm={6} md={6} style={{ zIndex: 0 }}>
                    <div
                      className={classes.header}
                      style={{ display: "flex", flexDirection: "row" }}
                    >
                      {/* <Paper elevation={0} className={classes.paper}>
                        <NcSummaryForm
                          key={ncId}
                          modalId={ncId}
                          setUpdateModelVisible={(reload) => setReload(reload)}
                          isInbox={true}
                        />
                      </Paper>
                      <NCInfoTable
                        audit={ncId ? ncId : auditArray[0].id}
                      ></NCInfoTable> */}
                      <NcSummaryDrawer
                        key={ncId}
                        id={ncData}
                        openDrawer={modalData}
                        setOpenDrawer={setModalData}
                        isInbox={true}
                        setReload={setReload}
                      />
                    </div>
                  </Grid>
                </>
              ) : auditArray.length > 0 && !reload ? (
                <>
                  <Grid item xs={12} sm={6} md={6} style={{ zIndex: 0 }}>
                    <div
                      className={classes.header}
                      style={{ display: "flex", flexDirection: "row" }}
                    >
                      {/* <Paper elevation={0} className={classes.paper}>
                        <NcSummaryForm
                          key={auditArray[0]._id}
                          modalId={auditArray[0]._id}
                          setUpdateModelVisible={(reload) => setReload(reload)}
                          isInbox={true}
                        />
                      </Paper>
                      <NCInfoTable
                        key={auditArray[0]._id}
                        audit={auditArray[0]._id}
                      ></NCInfoTable> */}
                      <NcSummaryDrawer
                        key={auditArray[0]._id}
                        id={ncData}
                        openDrawer={modalData}
                        setOpenDrawer={setModalData}
                        isInbox={true}
                      />
                    </div>
                  </Grid>
                </>
              ) : (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <h1>No Findings to display</h1>
                </div>
              )
            ) : getTypeFromSelectedId() === "Action Items" ? (
              // Render action items component
              actionId && !reload ? (
                <>
                  <Grid item xs={12} sm={6} md={6} style={{ zIndex: 0 }}>
                    <div
                      className={classes.header}
                      style={{ display: "flex", flexDirection: "row" }}
                    >
                      <Paper elevation={0} className={classes.paper}>
                        <ActionItemDrawerInbox
                          key={actionId}
                          drawer={drawer}
                          handleCloseDrawer={handleCloseDrawer}
                          //setUpdateModelVisible={(reload) => setReload(reload)}
                        />
                      </Paper>
                    </div>
                  </Grid>
                </>
              ) : actionItemArray.length > 0 && !reload ? (
                <>
                  <Grid item xs={12} sm={6} md={6} style={{ zIndex: 0 }}>
                    <div
                      className={classes.header}
                      style={{ display: "flex", flexDirection: "row" }}
                    >
                      <Paper elevation={0} className={classes.paper}>
                        <ActionItemDrawer
                          key={actionId ? actionId : actionItemArray[0]._id}
                          drawer={drawer}
                          handleCloseDrawer={handleCloseDrawer}
                          //setUpdateModelVisible={(reload) => setReload(reload)}
                        />
                      </Paper>
                    </div>
                  </Grid>
                </>
              ) : (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {actionItemArray.length === 0 ? (
                    <h1>No Action Items to display</h1>
                  ) : (
                    <h1>Your inbox is empty</h1>
                  )}
                </div>
              )
            ) : getTypeFromSelectedId() === "Capa" ? (
              // Render action items component
              actionId && !reload ? (
                <>
                  <Grid item xs={12} sm={6} md={6} style={{ zIndex: 0 }}>
                    <div
                      className={classes.header}
                      style={{ display: "flex", flexDirection: "row" }}
                    >
                      <Paper elevation={0} className={classes.paper}>
                        <CaraDrawer
                          key={actionId}
                          handleDrawer={() =>
                            setDrawer({ mode: "edit", data: {}, open: false })
                          }
                          activeTab={"1"}
                          setActiveTab={setActiveTab}
                          drawerType={"create"}
                          drawer={drawer}
                          setDrawer={setDrawer}
                          readMode={false}
                          mrm={true}
                          isEdit={true}
                          setIsEdit={setIsEdit}
                          setUpload={setUpload}
                          editData={drawer.data}
                          moduleName={"INBOX"}
                          //editData={action}

                          //setUpdateModelVisible={(reload) => setReload(reload)}
                        />
                      </Paper>
                    </div>
                  </Grid>
                </>
              ) : capaArray?.length > 0 && !reload ? (
                <>
                  <Grid item xs={12} sm={6} md={6} style={{ zIndex: 0 }}>
                    <div
                      className={classes.header}
                      style={{ display: "flex", flexDirection: "row" }}
                    >
                      <Paper elevation={0} className={classes.paper}>
                        <CaraDrawer
                          key={actionId ? actionId : capaArray[0]._id}
                          drawer={drawer}
                          handleCloseDrawer={handleCapaCloseDrawer}
                          handleDrawer={() =>
                            setDrawer({ mode: "edit", data: {}, open: false })
                          }
                          activeTab={"1"}
                          setActiveTab={setActiveTab}
                          drawerType={"edit"}
                          setDrawer={setDrawer}
                          editData={drawer.data}
                          readMode={false}
                          mrm={true}
                          isEdit={true}
                          setUpload={setUpload}
                          moduleName={"INBOX"}
                          getCapaResponse={getCapaResponse}
                          //setUpdateModelVisible={(reload) => setReload(reload)}
                        />
                      </Paper>
                    </div>
                  </Grid>
                </>
              ) : (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {capaArray.length === 0 ? (
                    <h1>No Capa items to display</h1>
                  ) : (
                    <h1>Your inbox is empty</h1>
                  )}
                </div>
              )
            ) : getTypeFromSelectedId() === "CIP" ? (
              // Render action items component
              actionId && !reload ? (
                <>
                  <Grid item xs={12} sm={6} md={6} style={{ zIndex: 0 }}>
                    <div
                      className={classes.header}
                      style={{ display: "flex", flexDirection: "row" }}
                    >
                      <Paper elevation={0} className={classes.paper}>
                        <CIPDrawer
                          key={actionId ? actionId : cipArray[0]._id}
                          drawer={cipDrawer}
                          handleCloseDrawer={handleCipCloseDrawer}
                          // handleDrawer={() =>
                          //   setDrawer({ mode: "edit", data: {}, open: false })
                          // }
                          source="Inbox"
                          setDrawer={setCipDrawer}
                          getCipResponse={getCIPResponse}

                          // moduleName={"INBOX"}
                          //setUpdateModelVisible={(reload) => setReload(reload)}
                        />
                      </Paper>
                    </div>
                  </Grid>
                </>
              ) : cipArray?.length > 0 && !reload ? (
                <>
                  <Grid item xs={12} sm={6} md={6} style={{ zIndex: 0 }}>
                    <div
                      className={classes.header}
                      style={{ display: "flex", flexDirection: "row" }}
                    >
                      <Paper elevation={0} className={classes.paper}>
                        <CIPDrawer
                          key={actionId ? actionId : cipArray[0]._id}
                          drawer={cipDrawer}
                          handleCloseDrawer={handleCipCloseDrawer}
                          // handleDrawer={() =>
                          //   setDrawer({ mode: "edit", data: {}, open: false })
                          // }
                          source="Inbox"
                          setDrawer={setCipDrawer}
                          getCipResponse={getCIPResponse}

                          // moduleName={"INBOX"}
                          //setUpdateModelVisible={(reload) => setReload(reload)}
                        />
                      </Paper>
                    </div>
                  </Grid>
                </>
              ) : (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {capaArray.length === 0 ? (
                    <h1>No CIP items to display</h1>
                  ) : (
                    <h1>Your inbox is empty</h1>
                  )}
                </div>
              )
            ) : getTypeFromSelectedId() === "Hira" ? (
              hiraId && !reload ? (
                <>
                  {hiraStepsDataLoading ? (
                    <div
                      style={{
                        width: "83%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "15px",
                          marginBottom: "5px",
                          flexDirection: smallScreen ? "row" : "column",
                        }}
                      >
                        <Skeleton active />
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "83%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "15px",
                          marginBottom: "5px",
                          flexDirection: smallScreen ? "row" : "column",
                        }}
                      >
                        {hiraRegisterData?._id &&
                          hiraRegisterData?.workflowStatus === "IN_REVIEW" &&
                          checkIfLoggedInUserCanReview() && (
                            <>
                              <Button
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  backgroundColor: "#003566",
                                  color: "white",
                                }}
                                onClick={handleClickWorkflow}
                              >
                                Complete Review
                              </Button>
                              <Button
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  backgroundColor: "#003566",
                                  color: "white",
                                }}
                                onClick={handleRejectHira}
                              >
                                Send Back For Edit
                              </Button>
                            </>
                          )}

                        {hiraRegisterData?._id &&
                          hiraRegisterData?.workflowStatus === "IN_APPROVAL" &&
                          checkIfLoggedInUserCanApprove() && (
                            <>
                              <Button
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  backgroundColor: "#003566",
                                  color: "white",
                                }}
                                onClick={handleClickWorkflow}
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
                                onClick={handleRejectHira}
                              >
                                Send Back For Edit
                              </Button>
                            </>
                          )}
                        <Button
                          style={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#003566",
                            color: "white",
                          }}
                          onClick={() =>
                            navigate(
                              `/risk/riskregister/HIRA/review/${hiraRegisterData?._id}`
                            )
                          }
                        >
                          Go To HIRA
                        </Button>
                      </div>

                      <div className={classes.descriptionLabelStyle}>
                        <Descriptions
                          bordered
                          size="small"
                          column={{
                            xxl: 3, // or any other number of columns you want for xxl screens
                            xl: 3, // or any other number of columns you want for xl screens
                            lg: 2, // or any other number of columns you want for lg screens
                            md: 2, // or any other number of columns you want for md screens
                            sm: 1, // or any other number of columns you want for sm screens
                            xs: 1, // or any other number of columns you want for xs screens
                          }}
                          className={classes.descriptionItemStyle}
                        >
                          <Descriptions.Item label="Job Title : ">
                            <Typography>
                              {hiraRegisterData?.jobTitle || "N/A"}
                            </Typography>
                          </Descriptions.Item>
                          <Descriptions.Item label="Area : ">
                            <Typography>
                              {hiraRegisterData?.areaName || "N/A"}
                            </Typography>
                          </Descriptions.Item>
                          <Descriptions.Item label="Section : ">
                            <Typography>
                              {hiraRegisterData?.sectionName || "N/A"}
                            </Typography>
                          </Descriptions.Item>
                          <Descriptions.Item label="Routine/Non Routine:">
                            <Typography>
                              {hiraRegisterData?.riskTypeName || "N/A"}
                            </Typography>
                          </Descriptions.Item>
                          <Descriptions.Item label="Condition:">
                            <Typography>
                              {hiraRegisterData?.conditionName || "N/A"}
                            </Typography>
                          </Descriptions.Item>
                          <Descriptions.Item label="Assessment Team: ">
                            <Typography>
                              {hiraRegisterData?.assesmentTeamUsers || "N/A"}
                            </Typography>
                          </Descriptions.Item>
                          <Descriptions.Item label="Corp Func/Unit: ">
                            <Typography>
                              {hiraRegisterData?.locationDetails
                                ?.locationName || "N/A"}
                            </Typography>
                          </Descriptions.Item>
                          <Descriptions.Item label="Dept/Vertical: ">
                            <Typography>
                              {hiraRegisterData?.entityDetails?.entityName ||
                                "N/A"}
                            </Typography>
                          </Descriptions.Item>
                          <Descriptions.Item label="Additional Assessment Team: ">
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography>
                                {hiraRegisterData?.additionalAssesmentTeam ||
                                  "N/A"}
                              </Typography>
                            </div>
                          </Descriptions.Item>
                        </Descriptions>
                      </div>
                      <div>
                        <div className={classes.tableContainer} id="table1">
                          <Table
                            columns={columns}
                            dataSource={tableData}
                            rowKey={"id"}
                            rowClassName={rowClassName}
                            pagination={false}
                            style={{ marginBottom: "25px" }}
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
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {/* <h1>No documents to display</h1> */}
                </div>
              )
            ) : getTypeFromSelectedId() === "All" ? (
              // Render the first document if available, otherwise render Findings or Action Items
              sortedArray.length > 0 && !reload ? (
                <DocumentRead
                  id={sortedArray[0].id}
                  name={sortedArray[0].documentName}
                  reloadList={(reload: boolean) => setReload(reload)}
                  modal2Open={modal2Open}
                  setModal2Open={setModal2Open}
                />
              ) : auditArray.length > 0 && !reload ? (
                <Grid item xs={12} sm={6} md={6} style={{ zIndex: 0 }}>
                  <div
                    className={classes.header}
                    style={{ display: "flex", flexDirection: "row" }}
                  >
                    {/* <Paper elevation={0} className={classes.paper}>
                      <NcSummaryForm
                        key={auditArray[0]._id}
                        modalId={auditArray[0]._id}
                        setUpdateModelVisible={(reload) => setReload(reload)}
                      />
                    </Paper>
                    <NCInfoTable
                      key={auditArray[0]._id}
                      audit={auditArray[0]._id}
                    ></NCInfoTable> */}
                  </div>
                </Grid>
              ) : actionItemArray.length > 0 && !reload ? (
                <Grid item xs={12} sm={6} md={6} style={{ zIndex: 0 }}>
                  <div
                    className={classes.header}
                    style={{ display: "flex", flexDirection: "row" }}
                  >
                    <Paper elevation={0} className={classes.paper}>
                      <ActionItemDrawer
                        key={actionId ? actionId : actionItemArray[0]._id}
                        drawer={drawer}
                        handleCloseDrawer={handleCloseDrawer}
                        handleCapaDrawer={handleCapaCloseDrawer}
                        //setUpdateModelVisible={(reload) => setReload(reload)}
                      />
                    </Paper>
                  </div>
                </Grid>
              ) : capaArray.length > 0 && !reload ? (
                <Grid item xs={12} sm={6} md={6} style={{ zIndex: 0 }}>
                  <div
                    className={classes.header}
                    style={{ display: "flex", flexDirection: "row" }}
                  >
                    <Paper elevation={0} className={classes.paper}>
                      <CaraDrawer
                        key={actionId ? actionId : capaArray[0]._id}
                        drawer={drawer}
                        editData={drawer.data}
                        setActiveTab={setActiveTab}
                        handleCloseDrawer={handleCloseDrawer}
                        handleDrawer={() =>
                          setDrawer({ mode: "edit", data: {}, open: false })
                        }
                        activeTab={"1"}
                        drawerType={"edit"}
                        setDrawer={setDrawer}
                        readMode={false}
                        mrm={true}
                        isEdit={true}
                        //setUpdateModelVisible={(reload) => setReload(reload)}
                      />
                    </Paper>
                  </div>
                </Grid>
              ) : (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {capaArray.length > 0 ? (
                    <h1>No Capa items to display</h1>
                  ) : (
                    <h1>Your inbox is empty</h1>
                  )}
                </div>
              )
            ) : null}
            <div>
              {!!hiraWorkflowModal.open && (
                <HiraWorkflowModal
                  reviewModal={hiraWorkflowModal}
                  setReviewModal={setHiraWorkflowModal}
                  hiraStatus={hiraStatus}
                  selectedJobTitle={selectedJobTitle}
                />
              )}
            </div>
          </Grid>
        </>
      )}
    </>
  );
};

export default Inbox;
