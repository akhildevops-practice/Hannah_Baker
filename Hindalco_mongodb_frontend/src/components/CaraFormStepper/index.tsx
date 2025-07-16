import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Step,
  StepLabel,
  Stepper,
  useMediaQuery,
} from "@material-ui/core";
import CrossIcon from "../../assets/icons/BluecrossIcon.svg";
import { FaPeopleArrows } from "react-icons/fa6";
import DocInfoIconImageSvg from "assets/documentControl/Info.svg";
import { FaCommentDots } from "react-icons/fa";
import {
  Button,
  Space,
  Switch,
  Tooltip,
  Typography,
  Upload,
  UploadProps,
} from "antd";
import axios from "apis/axios.global";
import CaraRegistration from "components/CaraRegistration";
import { API_LINK } from "config";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { caraRegistrationForm, referencesData } from "recoil/atom";
import getAppUrl from "utils/getAppUrl";
import { AiFillCaretDown } from "react-icons/ai";
import getYearFormat from "utils/getYearFormat";
import { isValid } from "utils/validateInput";
import RegistrationForm from "./RegistrationForm";
import Analysis from "./Analysis";
import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";
import Outcome from "./Outcome";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CaraDetailsDrawer from "components/CaraDrawer/CaraDetailsDrawer";
import { makeStyles, Theme } from "@material-ui/core/styles";
import CaraOwnerModal from "components/CaraDrawer/caraOwnerModal";
import CommentsDrawer from "components/CIPManagement/CIPTable/CIPDrawer/CommentsDrawer";
import AnalysisAdvanceMainPage from "pages/CARA/AnalysisAdvanceMainPage";

import {
  MdKeyboardArrowDown,
  MdOutlineKeyboardArrowLeft,
} from "react-icons/md";
import OutcomeAdvanceMainPage from "pages/CARA/OutcomeAdvanceMainPage";
import TextArea from "antd/es/input/TextArea";
// export interface StyleProps {
//   detailsDrawer: string;
// }
import { IoMdExit } from "react-icons/io";
const useStyles = makeStyles((theme: Theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1em",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#f5f5f5",
    height: "50px",
    // add other styles...
  },

  commentsIcon: {
    fill: "#0E497A",
    cursor: "pointer",
    width: "28px",
    height: "37px",
    // marginRight: "30px",
  },
  drawer: {
    "& .ant-drawer-right>.ant-drawer-content-wrapper": {
      transform: "translateX(-4px) !important",
      // width: "600px !important",
      // transform : ({detailsDrawer}) => detailsDrawer ? "translateX(0px) !important" : "none"
    },
    "& .ant-drawer-wrapper-body": {
      // backgroundColor : "#F0F8FF !important"
    },
    "& .ant-drawer-header": {
      backgroundColor: "#e8f3f9",
      borderBottom: "1px solid rgb(0,0,0,0.20)",
      padding: "10px 7px",
      "& .ant-drawer-header-title .anticon anticon-close": {
        color: "white",
      },
      "& .ant-btn-default": {
        backgroundColor: "#e8f3f9",
        borderColor: "#0e497a",
        "& svg": {
          color: "#0e497a",
        },
      },
    },
  },
  customTooltip: {
    backgroundColor: "white",
    color: " #6e7dab !important",
    border: "1px solid black",
    padding: "8px",
  },
  tabsWrapper: {
    "& .ant-tabs-tab": {
      backgroundColor: "#e3e8f9 !important",
      color: "black !important",
    },
    "& .ant-tabs-tab-btn": {
      letterSpacing: "0.6px",
    },
    "& .ant-tabs-tab-active": {
      backgroundColor: "#003566 !important",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: "500",
    },
  },
  docDetailsDrawer: {
    "& .ant-drawer-header": {
      backgroundColor: "aliceblue",
      textAlign: "center",
      padding: "10px 20px",
      borderBottom: "none",
    },
    // "& .ant-drawer-content": {
    borderBottomRightRadius: "10px",
    borderBottomLeftRadius: "10px",
    // },
  },
  starIcon: {
    color: "#FF0000",
    marginRight: "30px",
    width: "32px",
    height: "35px",
    cursor: "pointer",
  },
  disabledInput: {
    "& .ant-input[disabled], & .ant-input[disabled]:not([type='textarea'])": {
      // border: "none",
      backgroundColor: "white",
      color: "black",
    },
  },

  disabledSelect: {
    "& .ant-select-disabled .ant-select-selector": {
      backgroundColor: "white",
      background: "#F5F5F5 !important",
      color: "black",
      // border: "none",
    },
    "& .ant-select-disabled .ant-select-selection-item": {
      color: "black",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },
  disabledMuiSelect: {
    "& .Mui-disabled": {
      backgroundColor: "#F5F5F5 !important",
      color: "black",
      // border: "none",
      "& .MuiSelect-icon": {
        display: "none",
      },
    },
  },
  disabledTextField: {
    "& .MuiInputBase-root.Mui-disabled": {
      // border: "none",
      backgroundColor: "#F5F5F5 !important",
      color: "black",
    },
  },

  disabledMultiSelect: {
    "& .ant-select-disabled.ant-select-multiple .ant-select-selector": {
      backgroundColor: "#F5F5F5 !important",
      // border: "none",
    },
    "& .ant-select-disabled.ant-select-multiple .ant-select-selection-item": {
      color: "black",
      background: "#F5F5F5 !important",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },
  auditTrailIcon: {
    fill: "#0E497A",
    cursor: "pointer",
    width: "35px",
    height: "35px",
    marginRight: "30px",
  },
  docInfoIcon: {
    // marginRight: "30px",
    width: "30px",
    height: "35px",
    cursor: "pointer",
  },
  submitBtn: {
    backgroundColor: "#003566 !important",
    height: "36px",
  },
  cancelBtn: {
    height: "36px",
    "&.hover": {
      color: "#003566 !important  ",
    },
  },
  filename: {
    fontSize: theme.typography.pxToRem(12),
    color: theme.palette.primary.light,
    textOverflow: "ellipsis",
    overflow: "hidden",
    width: "160px",
    whiteSpace: "nowrap",
  },
  title: {
    fontSize: "20px",
    fontWeight: 500,
  },
  uploadSection: {
    width: "500px", // Adjust the width as needed
    height: "100px", // Adjust the height as needed

    padding: "10px 20px 10px 0px", // Adjust the padding as needed
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    // justifyContent: "center",
    "& .ant-upload-list-item-name": {
      color: "blue !important",
    },
  },
  formBox: {
    marginTop: "15px",
  },
  root: {
    flexGrow: 1,
    maxWidth: 752,
    backgroundColor: "white",
    padding: "10px",
  },
  demo: {
    "& .MuiListItem-giutters": {
      paddinRight: "0px",
    },
    "& .MuiListItem-root": {
      paddingTop: "0px",
    },
  },
  scrollableList: {
    maxHeight: "200px", // Set the height according to your needs
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "10px",
      backgroundColor: "white",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  //   header: {
  //     display: "flex",
  //     flexDirection: "column",
  //   },
  status: {
    display: "flex",
    justifyContent: "end",
  },
  text: {
    fontSize: "16px",
    marginRight: "10px",
    marginTop: "1%",
  },
  switch: {
    marginTop: "2%",
    // backgroundColor: '#003566 !important',
  },
  expandIcon: {
    marginRight: "30px",
    width: "22px",
    height: "36px",
    cursor: "pointer",
  },
  textArea: {
    "&.ant-input-disabled": {
      color: "black !important",
      WebkitTextFillColor: "black !important", // for Safari
    },
  },
}));

const CaraFormStepper = () => {
  const smallScreen = useMediaQuery("(min-width:450px)");
  const { Dragger } = Upload;
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [readMode, setReadMode] = useState<boolean>(false);
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [isOutcomeConfirm, setOutcomeConfirm] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["CAPA Registration", "Analyse", "Outcome", "Reference"];
  const [formdata, setformdata] = useRecoilState(caraRegistrationForm);
  const [deptHead, setDeptHead] = useState<any>([]);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [items, setItems] = useState<any>([]);
  const [clickedMenuItem, setClickedMenuItem] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const realmName = getAppUrl();
  const [isRejectEdit, setRejectEdit] = useState<boolean>(false);
  const [comments, setComments] = useState<any>([]);
  const orgId = sessionStorage.getItem("orgId");
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const { id } = useParams();
  const [openModalForOwner, setOpenModalForOwner] = useState<any>(false);
  const CapaStateIdentifier: any = {
    "Save As Draft": "Draft",
    "Approve Analysis": "Outcome_In_Progress",
    "Submit Capa": "Open",
    "Close Capa": "Closed",
    ACCEPT: "Accepted",
    REJECT: "Rejected",
    "Outcome In Progress": "Outcome_In_Progress",
    "Submit Analysis": "Analysis_In_Progress",
    "Submit Outcome": "Outcome_In_Progress",
  };
  const [ownerFormSubmit, setOwnerFormSubmit] = useState(false);
  const [commentsLoader, setCommentsLoader] = useState(false);
  const [capaOwnerData, setCapaOwnerData] = useState<any>([]);
  const [commnetValue, setCommentValue] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [newStatus, setNewStatusOption] = useState<any>();
  const [openValidationDialog, setOpenValidationDialog] = useState(false);
  const [refsData] = useRecoilState(referencesData);
  const [validationMessage, setValidationMessage] = useState("");
  const [ownerChange, setOwnerChange] = useState(false);
  const [commentDrawer, setCommentDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const classes = useStyles();
  const [detailsDrawer, setDetailsDrawer] = useState<any>(false);
  const matches = useMediaQuery("(min-width:786px)");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentYear, setCurrentYear] = useState<any>();
  const [entity, setEntity] = useState<any>();
  const navigate = useNavigate();
  const [toggleStatus, setToggleStatus] = useState(true);
  const location = useLocation();
  const read = location.state?.readMode;
  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    data: {},
    open: false,
  });

  useEffect(() => {
    getyear();
    if (id !== undefined && !!id) {
      setIsEdit(true);
      getcarabyid();
      //   getDeptHead();
      setDrawer({ mode: "edit", data: { id: id }, open: true });
    } else {
      const defaultButtonOptions = ["Save As Draft", "Submit Capa"];
      const newItems = defaultButtonOptions?.map((item: any, index: any) => ({
        key: (index + 1).toString(),
        label: item,
      }));
      setItems([...defaultButtonOptions]);
      setDrawer({ mode: "Create", data: { id: null }, open: true });
      // Reset the form data for "create" mode
      setformdata({
        title: "",
        kpiId: "",
        type: "",
        startDate: "",
        analysisLevel: "",
        comments: "",
        files: [],
        registerfiles: [],
        endDate: "",
        registeredBy: "",
        caraCoordinator: "",
        coordinator: "",
        status: "",
        referenceComments: "",
        serialNumber: "",
        caraOwner: {},
        entityId: "",
        systemId: [],
        containmentAction: "",
        location: "",
        origin: "",
        locationId: "",
        organizationId: "",
        deptHead: [],
        description: "",
        date: {},
        entity: "",
        systems: [],
        year: "",
        attachments: [],
        correctiveAction: "",
        targetDate: "",
        correctedDate: "",
        kpiReportLink: "",
        rootCauseAnalysis: "",
        actualCorrectiveAction: "",
        referenceAttachments: [],
      });
    }
  }, [isEdit]);
  useEffect(() => {
    if (!!entity) {
      getDeptHead();
    }
  }, [entity]);

  // to filter action items buttons data based on stepper
  const filteredItems = items.filter((item: string) => {
    if (item === "Outcome In Progress") {
      return activeStep === 1;
    }
    if (item === "Close Capa") {
      return activeStep === 2 || activeStep === 3;
    }
    // For all other items, just return true
    return true;
  });

  const handleProceed = async () => {
    // console.log("handleProceed called");

    // Close the dialog
    setOpenDialog(false);

    // Set the outcome confirmation state
    setOutcomeConfirm(true);
    // console.log("New Outcome Confirm State: true");
    await new Promise((resolve) => setTimeout(resolve, 0));
    // Call handleSubmit directly
    await handleSubmit(newStatus, true);
  };
  const toggleCommentsDrawer = (data: any = {}) => {
    setCommentDrawer({
      ...commentDrawer,
      open: !commentDrawer.open,
      data: { ...data },
    });
    getComments();
  };
  const getCapaOwnerDetails = async () => {
    try {
      const result = await axios.get(`/api/cara/getCapaOwnerEntry/${id}`);
      if (result?.data) {
        setCapaOwnerData(result?.data);
      } else {
        setCapaOwnerData([]);
      }
    } catch (error) {
      // console.log("error", error);
    }
  };
  const toggleCapaOwnerModal = (data: any = {}) => {
    setOpenModalForOwner(!openModalForOwner);
    getCapaOwnerDetails();
  };
  const toggleDetailsDrawer = (data: any = {}) => {
    setDetailsDrawer({
      ...detailsDrawer,
      open: !detailsDrawer.open,
      data: { ...data },
    });
  };
  const getStatusColor = (status: any) => {
    switch (status) {
      case "Open":
        return "#b3d9ff";
      case "Accepted":
        return "#ccffe6";
      case "Rejected":
        return "#ffe6e6";
      case "Analysis_In_Progress":
        return "#ffffcc";
      case "Outcome_In_Progress":
        return "#ffffb3";
      case "Draft":
        return "#e6f2ff";

      case "Closed":
        return "#ccccff";
      default:
        return "";
    }
  };
  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };

  const uploadData = async (files: any) => {
    // console.log("files", files);
    let formDataFiles = new FormData();
    let oldData = [];
    let newData = [];

    for (let file of files) {
      if (file?.url) {
        oldData.push(file);
      } else {
        newData.push(file);
      }
    }
    newData.forEach((file: any) => {
      const fileToAdd = file.originFileObj || file;
      // console.log("fileToAdd content:", fileToAdd);
      formDataFiles.append("files", fileToAdd);
    });

    const id = "CAPA";
    let res: any;
    let comdinedData;
    if (newData.length > 0) {
      res = await axios.post(
        `${API_LINK}/api/mrm/objectStore/${id}?realm=${realmName}&locationName=${loggedInUser?.location?.locationName}`,
        formDataFiles,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: {
            id: id,
          },
        }
      );
    }
    if (res?.data?.length > 0) {
      comdinedData = res?.data;
    }

    if (oldData.length > 0) {
      comdinedData = oldData;
    }

    if (oldData?.length > 0 && res?.data?.length > 0) {
      comdinedData = [...res.data, ...oldData];
    }
    return comdinedData;
  };
  const validateAnalysis = () => {
    const { containmentAction, rootCauseAnalysis, correctiveAction } =
      formdata || {};

    // Ensure that formdata has the fields and check if at least one is not empty
    if (
      (containmentAction && containmentAction.trim() !== "") ||
      (rootCauseAnalysis && rootCauseAnalysis.trim() !== "") ||
      (correctiveAction && correctiveAction.trim() !== "")
    ) {
      return true; // At least one field is filled
    }

    return false; // None of the fields are filled
  };
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  // Handle previous step
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    } else {
      navigate("/cara");
    }
  };

  const handleSubmit = async (option: string, submit = false) => {
    try {
      let data;

      const title = isValid(formdata?.title);
      // console.log("option", option);
      if (!title.isValid) {
        enqueueSnackbar(`Please enter valid title ${title.errorMessage} `, {
          variant: "error",
        });
        return;
      }
      // console.log("submit status",submitstatus)

      if (!!formdata?.description) {
        const title = isValid(formdata?.description);
        // console.log("option", option);
        if (!title.isValid) {
          enqueueSnackbar(
            `Please enter valid description ${title.errorMessage}`,
            { variant: "error" }
          );
          return;
        }
      }

      const filesData =
        formdata?.files?.length > 0 ? await uploadData(formdata.files) : [];

      const attachmentData =
        formdata?.attachments?.length > 0
          ? await uploadData(formdata.attachments)
          : [];
      const registerfilesdata =
        formdata?.registerfiles?.length > 0
          ? await uploadData(formdata.registerfiles)
          : [];
      let submitstatus;
      if (option === "Submit") {
        submitstatus = formdata.status;
      } else {
        submitstatus = CapaStateIdentifier[option];
      }
      // ("submitstatus", submitstatus);
      if (
        formdata?.caraCoordinator === undefined ||
        (formdata?.caraCoordinator === null &&
          (submitstatus === "Draft" || "Open"))
      ) {
        enqueueSnackbar(`Please select responsible person`, {
          variant: "error",
        });
        return;
      }
      // console.log("submitstatus", submitstatus);
      if (isEdit) {
        // console.log("formdata in edit", submitstatus);

        if (
          submitstatus === "Rejected" &&
          (!formdata.comments ||
            formdata.comments.trim() === "" ||
            formdata.comments === "") &&
          isRejectEdit === false
        ) {
          // If status is REJECTED, comments must be provided
          enqueueSnackbar("Comments are mandatory for REJECTED status.", {
            variant: "error",
          });
          setOpen(true);
          return;
        } else if (submitstatus === "Rejected" && isRejectEdit === true) {
          if (formdata?.comments === "") {
            enqueueSnackbar("Comments are mandatory for REJECTED status.", {
              variant: "error",
            });
            setOpen(true);

            return;
          }
        }
        if (
          submitstatus === "Outcome_In_Progress" &&
          isOutcomeConfirm === false
        ) {
          if (submit !== true) {
            // Validate the analysis fields
            // if (!validateAnalysis()) {
            //   setValidationMessage(
            //     "Please fill in at least one of the following: Containment Action, Root Cause Analysis, or Corrective Action."
            //   );
            //   setOpenValidationDialog(true); // Open the validation dialog
            //   return; // Stop further processing
            // }

            // Open the confirmation dialog if validation passes
            setOpenDialog(true);
            setNewStatusOption(option);
            return;
          }
        }
        // console.log("submit status", submitstatus);
        if (submitstatus === "Closed") {
          if (!!formdata.actualCorrectiveAction && toggleStatus === false) {
            const ca = isValid(formdata?.actualCorrectiveAction);
            if (!ca.isValid) {
              enqueueSnackbar(
                `Please enter valid corrective action ${ca.errorMessage}`,
                { variant: "error" }
              );
              return;
            }
          } else if (
            (toggleStatus === false &&
              formdata?.actualCorrectiveAction === undefined) ||
            formdata.actualCorrectiveAction === null ||
            formdata.actualCorrectiveAction === ""
          ) {
            enqueueSnackbar(
              `Please enter valid corrective action before submitting`,
              { variant: "error" }
            );
            return;
          }
        }
        let formattedReferences: any = [];

        if (refsData && refsData.length > 0) {
          formattedReferences = refsData.map((ref: any) => ({
            refId: ref.refId,
            organizationId: orgId,
            type: ref.type,
            name: ref.name,
            comments: ref.comments,
            createdBy: userDetail.firstName + " " + userDetail.lastName,
            updatedBy: null,
            link: ref.link,
          }));
        }

        if (submitstatus === "Rejected" || submitstatus === "Accepted") {
          if (!!formdata.comments && formdata.comments !== "") {
            handleCommentSubmit(formdata.comments);
          }
        }
        if (ownerChange === true) {
          // console.log("inside else if accepted", formdata?.caraOwner);

          data = await axios.patch(`/api/cara/updateCara/${id}`, {
            ...formdata,
            attachments: attachmentData,
            files: filesData,
            entityId: formdata?.entity,
            systemId: formdata?.systems,
            registerfiles: registerfilesdata,
            status: "Accepted",
            caraCoordinator: formdata?.coordinator,

            caraOwner: formdata?.caraOwner
              ? formdata?.caraOwner
              : userDetail?.id,
            refsData: formattedReferences,

            correctedDate: formdata?.correctedDate
              ? formdata?.correctedDate
              : dayjs().format("YYYY-MM-DD"),
          });
          if (data.status == 200 || data.status == 201) {
            // handleClose();
            enqueueSnackbar("CAPA owner updated successfully", {
              variant: "success",
            });
            // moduleName === "INBOX" ? getCapaResponse() : getData();
            // setUpload(false);

            setformdata({
              title: "",
              kpiId: "",
              registerfiles: [],
              referenceComments: "",
              analysisLevel: "",
              coordinator: "",
              type: "",
              startDate: "",
              location: "",
              serialNumber: "",
              comments: "",
              files: [],
              endDate: "",
              registeredBy: "",
              status: "",
              caraOwner: {},
              entityId: "",
              systemId: [],
              containmentAction: "",
              entity: "",
              systems: [],
              origin: "",
              locationId: "",
              organizationId: "",
              deptHead: [],
              description: "",
              date: {},
              year: "",
              attachments: [],
              correctiveAction: "",
              targetDate: "",
              correctedDate: "",
              kpiReportLink: "",
              rootCauseAnalysis: "",
              actualCorrectiveAction: "",
              caraCoordinator: "",
              referenceAttachments: [],
            });
            // handleDrawer();
            navigate("/cara");
          }
          //   return;
        } else {
          // console.log("inside else update", submitstatus);
          data = await axios.patch(`/api/cara/updateCara/${id}`, {
            ...formdata,
            attachments: attachmentData,
            files: filesData,
            entityId: formdata?.entity,
            systemId: formdata?.systems,
            registerfiles: registerfilesdata,
            caraCoordinator: formdata?.coordinator,
            caraOwner: formdata?.caraOwner
              ? formdata?.caraOwner
              : userDetail?.id,
            refsData: formattedReferences,
            status: submitstatus,
            correctedDate: formdata?.correctedDate
              ? formdata?.correctedDate
              : dayjs().format("YYYY-MM-DD"),
          });
          // console.log("data", data);
          if (data?.data?.status === 404 || data?.data?.status === 400) {
            enqueueSnackbar(
              "Please ensure Fishbone, Root Cause, or Causes are filled before submitting.",
              {
                variant: "error",
              }
            );
            return;
          } else if (data?.data?.status === 500 || data?.data?.status === 500) {
            enqueueSnackbar(
              data?.data?.message ||
                "Please ensure all corrective actions are closed before submitting.",
              {
                variant: "error",
              }
            );
            return;
          } else if (data.status == 200 || data.status == 201) {
            // handleClose();

            enqueueSnackbar("CAPA updated successfully", {
              variant: "success",
            });
            // if (moduleName === "INBOX") {
            //   getCapaResponse();
            // }
            // {
            //   getData();
            // }
            // moduleName === "INBOX" ? getCapaResponse() : getData();
            // setUpload(false);

            setformdata({
              title: "",
              kpiId: "",
              analysisLevel: "",
              coordinator: "",
              registerfiles: [],
              type: "",
              startDate: "",
              location: "",
              serialNumber: "",
              comments: "",
              referenceComments: "",
              files: [],
              endDate: "",
              registeredBy: "",
              status: "",
              caraOwner: {},
              entityId: "",
              systemId: [],
              containmentAction: "",
              caraCoordinator: "",
              entity: "",
              systems: [],
              origin: "",
              locationId: "",
              organizationId: "",
              deptHead: [],
              description: "",
              date: {},
              year: "",
              attachments: [],
              correctiveAction: "",
              targetDate: "",
              correctedDate: "",
              kpiReportLink: "",
              rootCauseAnalysis: "",
              actualCorrectiveAction: "",
              referenceAttachments: [],
            });
            // handleDrawer();
            navigate("/cara");
          }
          return;
        }
      } else {
        let formattedReferences: any = [];

        if (refsData && refsData.length > 0) {
          formattedReferences = refsData.map((ref: any) => ({
            refId: ref.refId,
            organizationId: orgId,
            type: ref.type,
            name: ref.name,
            comments: ref.comments,
            createdBy: userDetail.firstName + " " + userDetail.lastName,
            updatedBy: null,
            link: ref.link,
          }));
        }
        const payload: any = {
          ...formdata,
          year: currentYear,
          entityId: formdata?.entity,
          locationId: formdata?.locationId
            ? formdata?.locationId
            : userDetail.location?.id,
          systemId: formdata?.systems,
          type: !formdata?.type ? "Manual" : formdata?.type,
          refsData: formattedReferences,
          registerfiles: registerfilesdata,
          status: submitstatus,
        };
        //  console.log("payload in create", payload);
        if (
          payload?.origin &&
          payload?.title &&
          payload?.systemId &&
          payload?.entityId &&
          payload?.locationId
        ) {
          data = await axios.post("/api/cara/createCara", {
            payload,
          });
          if (data.data.status === 409) {
            enqueueSnackbar(`Please add prefix and suffix for CAPA module`, {
              variant: "error",
            });
          } else if (data.data.status === 404) {
            enqueueSnackbar(
              `Department Head for the selected Entity was not found, please add to proceed`,
              {
                variant: "error",
              }
            );
          } else if (data?.status == 200 || data?.status == 201) {
            // handleClose();
            enqueueSnackbar("successfully created", {
              variant: "success",
            });

            // getData();
            // setUpload(false);
            setformdata({
              title: "",
              kpiId: "",
              analysisLevel: "",
              coordinator: "",
              type: "",
              startDate: "",
              registerfiles: [],
              comments: "",
              files: [],
              endDate: "",
              serialNumber: "",
              registeredBy: "",
              status: "",
              containmentAction: "",
              caraOwner: {},
              entityId: "",
              caraCoordinator: "",
              systemId: [],
              origin: "",
              locationId: "",
              organizationId: "",
              deptHead: [],
              entity: "",
              systems: [],
              description: "",
              date: {},
              year: "",
              attachments: [],
              location: "",
              referenceComments: "",
              correctiveAction: "",
              targetDate: "",
              correctedDate: "",
              kpiReportLink: "",
              rootCauseAnalysis: "",
              actualCorrectiveAction: "",
              referenceAttachments: [],
            });
            // handleDrawer();
            navigate("/cara");
          }
        } else {
          enqueueSnackbar("Please fill all required fields", {
            variant: "error",
          });
        }
      }
    } catch (error) {
      enqueueSnackbar("Analysis not found", {
        variant: "error",
      });
    }
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    // handleDrawer();
    // setOpen(true);
  };
  const onMenuClick = (e: any) => {
    setClickedMenuItem(true); // Mark the menu item clicked
    handleSubmit(e); // Call your form submission logic
  };
  const getcarabyid = async () => {
    try {
      // console.log("getcarbyid", editData._id);
      const result = await axios.get(`/api/cara/getCaraById/${id}`);

      const buttonOptionsResponse = await axios.get(
        `/api/cara/getStatusOptionForCapa/${id}`
      );
      const newItems = buttonOptionsResponse?.data?.map(
        (option: any, index: any) => {
          return { key: (index + 1).toString(), label: option };
        }
      );
      const tempNewItems = newItems?.map((item: any) => item.label);

      const NewmenuItems = tempNewItems?.map((item: any, index: any) => (
        <MenuItem key={index + 1} onClick={() => onMenuClick(item)}>
          {item}
        </MenuItem>
      ));
      // console.log("new menu items in check user permissions", NewmenuItems);
      setItems([...tempNewItems]);

      if (result?.data) {
        if (
          !!result?.data?.analysisLevel &&
          result?.data?.analysisLevel === "Advanced"
        ) {
          // console.log("inside if");
          setToggleStatus(true);
        } else {
          // console.log("inside else");
          setToggleStatus(false);
        }
        setformdata({
          ...result?.data,
          analysisLevel: result?.data?.analysisLevel,
          entity: result?.data?.entityId?.id,
          systems: result?.data?.systemId?.map((item: any) => item?._id),

          coordinator: result?.data?.caraCoordinator?.id,
        });
        const status: boolean = await setReadStatus(result?.data);
        setReadMode(read ? read : status);
        setEditData(result?.data);
        setEntity(result.data?.entityId?.id);
      }
    } catch (error) {
      // enqueueSnackbar("Error fetching record for cara", { variant: "error" });
    }
  };
  // console.log("togglestatus", toggleStatus);
  const getDeptHead = async () => {
    try {
      // console.log("callling depthead");
      const result = await axios.get(
        `/api/cara/getDeptHeadForEntity/${entity}`
      );
      //console.log("result", result?.data);
      setDeptHead(result?.data);
    } catch (error) {
      // enqueueSnackbar("Error Fetching Department Head!!", { variant: "error" });
    }
  };
  const getComments = async () => {
    setCommentsLoader(true);
    try {
      let res: any = await axios.get(`/api/cara/getCapaCommentsById/${id}`);
      setComments(res.data);
      setCommentsLoader(false);
    } catch (err) {
      enqueueSnackbar(
        `Could not get Comments, Check your internet connection`,
        { variant: "error" }
      );
      setCommentsLoader(false);
    }
  };
  const handleCommentSubmit = async (value: string) => {
    setCommentsLoader(true);
    if (value && id) {
      try {
        let res = await axios.post("/api/cara/createCapaComments", {
          caraId: id,
          userId: userDetail?.id,
          commentBy: userDetail?.firstname + " " + userDetail?.lastname,
          commentText: value,
        });
        setCommentsLoader(false);
        enqueueSnackbar(`Comment Added Successfully`, { variant: "success" });
        getComments();
      } catch (err: any) {
        enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
          variant: "success",
        });
        setCommentsLoader(false);
      }
      setCommentValue("");
    } else {
      enqueueSnackbar(`Enter a comment`, { variant: "warning" });
    }
  };
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const setReadStatus = async (capa: any) => {
    // If status is undefined or "Draft" and registeredBy matches userDetail
    if (
      (capa.status === undefined || capa.status === "Draft") &&
      userDetail.id === capa.registeredBy.id
    ) {
      return false;
    }

    // If status is "Open" and caraCoordinator matches userDetail
    if (capa.status === "Open" && userDetail.id === capa.caraCoordinator.id) {
      return false;
    }

    // If status is "Accepted" and either caraCoordinator or capaOwner matches userDetail
    if (
      capa.status === "Accepted" &&
      (userDetail.id === capa.caraCoordinator.id ||
        userDetail.id === capa.capaOwner.id)
    ) {
      return false;
    }

    // If status is "Outcome_In_Progress" and either capaOwner or caraCoordinator matches userDetail
    if (
      capa.status === "Outcome_In_Progress" &&
      (userDetail.id === capa.capaOwner.id ||
        userDetail.id === capa.caraCoordinator.id)
    ) {
      return false;
    }

    // For anything else, set to true
    return true;
  };

  //------------------------------Attachemet for reference-----------------------------

  const [referenceData, setReferenceData] = useState<any>({
    comments: "",
    documents: [],
  });

  // console.log("referenceData", referenceData);
  const handleFileChange = async (files: any) => {
    let formDataFiles = new FormData();
    let oldData = [];
    let newData = [];

    for (let file of files) {
      if (file?.url) {
        oldData.push(file);
      } else {
        newData.push(file);
      }
    }
    newData.forEach((file: any) => {
      const fileToAdd = file.originFileObj || file;
      // console.log("fileToAdd content:", fileToAdd);
      formDataFiles.append("files", fileToAdd);
    });

    const id = "CAPA";
    let res: any;
    let comdinedData: any;
    if (newData.length > 0) {
      res = await axios.post(
        `${API_LINK}/api/mrm/objectStore/${id}?realm=${realmName}&locationName=${loggedInUser?.location?.locationName}`,
        formDataFiles,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: {
            id: id,
          },
        }
      );
    }
    if (res?.data?.length > 0) {
      comdinedData = res?.data;
    }

    if (oldData.length > 0) {
      comdinedData = oldData;
    }

    if (oldData?.length > 0 && res?.data?.length > 0) {
      comdinedData = [...res.data, ...oldData];
    }

    // console.log("Final combinedData:", comdinedData);
    setReferenceData((prevData: any) => ({
      ...prevData,
      documents: comdinedData,
    }));
    return comdinedData;
  };

  const [fileList, setFileList] = useState<any[]>([]);

  const uploadFileprops: UploadProps = {
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    multiple: true,
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      setFileList(fileList);
      // setformdata({
      //   ...formdata,
      //   referenceAttachments: fileList,
      // });
      // handleFileChange(fileList)
    },
  };

  const clearFile = async (data: any) => {
    try {
      // console.log("data in clearfile", data);

      if (data && data?.uid) {
        setformdata((prevFormData: any) => {
          const newAttachments = prevFormData?.referenceAttachments?.filter(
            (item: any) => item?.uid !== data?.uid
          );
          // console.log("formData after clearing", newAttachments);

          return {
            ...prevFormData,
            referenceAttachments: newAttachments,
          };
        });

        // Assuming data.uid is a valid identifier for your file
        // let result = await axios.post(`${API_LINK}/api/mrm/attachment/delete`, {
        //   path: data.uid,
        // });
        // return result;
      }
    } catch (error) {
      // console.error("Error in clearFile:", error);
      return error;
    }
  };
  // console.log("formdata", formdata);
  // useEffect(() => {
  //   if (activeStep === 1) {
  //     // checkAdvanceOrBasic();

  //   }
  // }, [activeStep]);
  // console.log("active step", activeStep, toggleStatus);

  // const checkAdvanceOrBasic = async () => {
  //   const result = await axios.get(
  //     `api/cara/getRcaSettingsForLocation/${formdata?.locationId}`
  //   );
  //   if (result.status === 200 || result.status === 201) {
  //     if (result.data === "Advanced") {
  //       setToggleStatus(true);
  //     } else {
  //       setToggleStatus(false);
  //     }
  //   }
  //   // console.log("checkAdvanceOrBasic", result);
  // };

  const [referenceComments, setReferenceComments] = useState("");

  useEffect(() => {
    if (formdata.referenceComments) {
      setReferenceComments(formdata.referenceComments);
    } else {
      setReferenceComments("");
    }
  }, [formdata.referenceComments]);

  useEffect(() => {
    if (formdata.referenceAttachments) {
      setFileList(formdata.referenceAttachments);
    } else {
      setFileList([]);
    }
  }, [formdata.referenceAttachments]);

  const handleReferenceChange = (e: string) => {
    // setformdata((prev: any) => ({
    //   ...prev,
    //   referenceComments: e, // ✅ Correctly updating comments
    // }));
    setReferenceComments(e);
  };

  const submitData = () => {
    const payload = {
      referenceComments: referenceComments,
      referenceAttachments: fileList,
    };

    submitAnalysisEditedData(payload);
  };

  const submitAnalysisEditedData = async (payload: any) => {
    // console.log("refsdata", refsData);
    let formattedReferences: any = [];
    if (refsData && refsData.length > 0) {
      formattedReferences = refsData.map((ref: any) => ({
        refId: ref.refId,
        organizationId: orgId,
        type: ref.type,
        name: ref.name,
        comments: ref.comments,
        createdBy: userDetail.firstName + " " + userDetail.lastName,
        updatedBy: null,
        link: ref.link,
        refTo: id,
      }));
    }
    // console.log("formattedRef", formattedReferences);
    const refs = await axios.put("/api/refs/bulk-update", {
      refs: formattedReferences,
      id: id,
    });
    // console.log("reg", refs);
    const result = await axios.patch(
      `/api/cara/updateCaraForOutcome/${id}`,
      payload
    );

    if (result.status === 200 || result.status === 201) {
      setformdata((prev: any) => ({
        ...prev,
        referenceComments: result?.data?.referenceComments,
        referenceAttachments: result?.data?.referenceAttachments,
      }));

      enqueueSnackbar("Data Saved", {
        variant: "success",
      });
    }
  };

  return (
    <>
      <Box sx={{ width: "100%", padding: "20px 0px" }}>
        {/* Button container for Back, Next, and other buttons */}
        <Box
          sx={{
            width: "100%",
            height: "60px",
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
            alignItems: "center",
            bgcolor: "white",
            borderBottom: "2px solid black",
            // paddingBottom: "10px",
            position: "fixed",
            top: 64,
            zIndex: 1000, // Ensure the header is above other content
          }}
        >
          {/* Left Side: Back and Next Buttons */}

          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* <Button
              onClick={() => {
                navigate("/cara");
                setToggleStatus(true);
              }}
              style={{
                fontSize: smallScreen ? "14px" : "12px",
                padding: smallScreen ? "4px 15px" : "2px 5px",
                marginLeft: "10px",
                backgroundColor: "#003059",
                color: "white",
              }}
              // icon={<MdExitToApp style={{ fontSize: "20px" }} />}
            >
              Exit
            </Button> */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                marginLeft: "15px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#003566",
                }}
              >
                CAPA Number :
              </span>
              {formdata?.serialNumber && (
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    display: "flex",
                    marginRight: "20px",
                    // justifyContent: "flex-end", // Align to the flex-end
                    //paddingBottom: "5px", // Adjust the padding at the top
                  }}
                >
                  {formdata?.serialNumber}
                </span>
              )}
            </div>

            {/* <span
              style={{
                display: "inline-block",
                padding: "5px",
                marginLeft: "20px",
                // marginBottom: "10px",
                backgroundColor: getStatusColor(formdata?.status),
                color: "black",
                borderRadius: "8px",
                width: "100px",
                textAlign: "center",
              }}
            >
              {formdata?.status}
            </span> */}
            {/* <div
             
            >
              <Switch checked={toggleStatus} onChange={handleToggle} />
            </div> */}
          </Box>

          {/* Right Side: Other buttons like Accept/Reject, Actions, CAPA Details */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginRight: activeStep === 1 ? "210px" : "110px",
            }}
          >
            {isEdit &&
              ((Array.isArray(deptHead) &&
                deptHead?.some((user: any) => user.id === userDetail.id)) ||
                formdata.coordinator === userDetail?.id) &&
              !(
                formdata?.status === "Open" ||
                formdata?.status === "Draft" ||
                formdata?.status === "Rejected" ||
                formdata?.status === "Closed"
              ) && (
                <Tooltip title="Change CAPA Owner">
                  <IconButton
                    style={{
                      padding: 0,
                      margin: 0,
                      marginRight: matches ? "30px" : "3px",
                    }}
                  >
                    <FaPeopleArrows
                      className={classes.commentsIcon}
                      onClick={toggleCapaOwnerModal}
                    />
                  </IconButton>
                </Tooltip>
              )}
            {/* {(isEdit || readMode) && (
              <Tooltip title="Add/View Comments">
                <IconButton
                  style={{
                    padding: 0,
                    margin: 0,
                    marginRight: matches ? "30px" : "0px",
                  }}
                >
                  <FaCommentDots
                    className={classes.commentsIcon}
                    onClick={toggleCommentsDrawer}
                  />
                </IconButton>
              </Tooltip>
            )} */}
            {readMode === true ? null : (
              <Space>
                {formdata.status === "Open" &&
                  ((Array.isArray(deptHead) &&
                    deptHead?.length > 0 &&
                    deptHead?.some(
                      (user: any) => user.id === userDetail?.id
                    )) ||
                    formdata?.caraCoordinator === userDetail?.id ||
                    formdata?.coordinator === userDetail?.id) && (
                    <Button
                      onClick={() => {
                        setOpen(true);
                        setSubmitted(true);
                      }}
                      className={classes.cancelBtn}
                      style={{
                        fontSize: smallScreen ? "14px" : "12px",
                        padding: smallScreen ? "4px 15px" : "2px 5px",
                        marginRight: "10px",
                      }}
                    >
                      Accept/Reject
                    </Button>
                  )}
              </Space>
            )}

            {/* CAPA Details Icon commented out as not required*/}
            {/* <Tooltip title="View CAPA Details">
              <img
                src={DocInfoIconImageSvg}
                alt="doc-info"
                onClick={toggleDetailsDrawer}
                className={classes.docInfoIcon}
                style={{
                  marginRight: smallScreen ? "30px" : "0px",
                  // marginLeft: "10px",
                }}
              />
            </Tooltip> */}

            <Space
              style={{
                marginRight:
                  activeStep === 3 || activeStep === 2 ? "110px" : "",
              }}
            >
              {filteredItems.map((item: any) => (
                <Button
                  key={item}
                  onClick={() => onMenuClick(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#003059",
                    margin: "0px 20px 0px 0px",
                    color: "white",
                    fontSize: smallScreen ? "14px" : "12px",
                    padding: smallScreen ? "4px 15px" : "2px 5px",
                  }}
                  disabled={items?.length === 0 || read}
                >
                  {item}
                </Button>
              ))}
            </Space>

            {/* <Button
              onClick={(event: any) => handleClick(event)}
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#003059",
                margin: "0px 20px 0px 0px",
                color: "white",
                fontSize: smallScreen ? "14px" : "12px",
                padding: smallScreen ? "4px 15px" : "2px 5px",
              }}
              disabled={items?.length === 0 || read}
            >
              
              <span
                style={{
                  fontWeight: "bold",
                  padding: "0px 0px",
                  margin: "0pxx 0px",
                }}
              >
                Actions
              </span>
              <MdKeyboardArrowDown
                style={{
                  fill: `${items?.length === 0 ? "white" : "white"}`,
                  fontSize: "24px",
                }}
              />
            </Button> */}
            {/* <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {items &&
                items.length > 0 &&
                items.map((item: any, index: any) => (
                  <MenuItem key={index + 1} onClick={() => onMenuClick(item)}>
                    {item}
                  </MenuItem>
                ))}
            </Menu> */}
          </Box>
        </Box>

        <Tooltip title="Exit">
          <IoMdExit
            onClick={() => {
              navigate("/cara");
              setToggleStatus(true);
              setFileList([]);
              setReferenceComments("");
            }}
            style={{
              fontSize: "28px",
              marginRight: "20px",
              cursor: "pointer",
              position: "absolute",
              top: "80px",
              right: "10px",
              zIndex: 1100,
            }}
          />
        </Tooltip>

        {/* Stepper */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            marginTop: "60px",
          }}
        >
          <div style={{ flex: 3 }}></div>
          <div style={{ flex: 8 }}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              style={{ paddingTop: 0, paddingBottom: 0, width: "100%" }}
            >
              {steps.map((label, index) => (
                <Step key={index}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>

          <div
            style={{
              flex: 3,
              display: "flex",
              justifyContent: "end",
              paddingRight: "20px",
            }}
          >
            {activeStep === 0 ? (
              ""
            ) : (
              <Button
                onClick={handleBack} // Add your back logic here
                style={{
                  fontSize: smallScreen ? "14px" : "12px",
                  padding: smallScreen ? "4px 15px" : "0px",
                  backgroundColor: " #f1f8fd",

                  color: "#0d497a",
                  border: "1px solid white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                icon={
                  <MdOutlineKeyboardArrowLeft style={{ fontSize: "25px" }} />
                }
              >
                Previous
              </Button>
            )}

            {activeStep === 3 ||
            formdata.status === "" ||
            formdata.status === "Draft" ||
            formdata.status === "Open" ? (
              ""
            ) : (
              <Button
                onClick={handleNext} // Add your next logic here
                style={{
                  fontSize: smallScreen ? "14px" : "12px",
                  padding: smallScreen ? "4px 15px" : "2px 5px",
                  marginLeft: "10px", // Adding space between Back and Next
                  backgroundColor: "#0d497a",
                  color: "white",
                }}
                disabled={
                  activeStep === 0
                    ? formdata?.status === "Open" ||
                      formdata?.status === "" ||
                      formdata?.status === "Draft"
                    : activeStep === 1
                    ? formdata?.status === "Accepted"
                    : false
                }
              >
                Next
              </Button>
            )}
          </div>
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "end",
            paddingRight: "20px",
          }}
        >
          <p
            style={{
              backgroundColor: getStatusColor(formdata?.status),
              padding: "5px 10px",
              borderRadius: "5px",
              margin: "0px 0px 10px 0px",
            }}
          >
            {" "}
            {formdata?.status}
          </p>
        </div>

        {/* Step Content */}
        <div style={{ padding: "0px 40px 40px 40px" }}>
          <div>
            {activeStep === 0 && (
              <div
                style={{ border: "1px solid #c0c0c0", borderRadius: "15px" }}
              >
                <RegistrationForm
                  formData={formdata}
                  setFormData={setformdata}
                  isEdit={isEdit}
                  open={open}
                  setOpen={setOpen}
                  submitted={submitted}
                  setSubmitted={setSubmitted}
                  readMode={readMode}
                  setRejectEdit={setRejectEdit}
                />
              </div>
            )}
            {activeStep === 1 &&
              (toggleStatus ? (
                <AnalysisAdvanceMainPage
                  formData={formdata}
                  setformdata={setformdata}
                  readMode={readMode}
                  read={read}
                />
              ) : (
                <div
                  style={{
                    border: "1px solid #c0c0c0",
                    borderRadius: "15px",
                    padding: "27px",
                  }}
                >
                  <Analysis
                    formData={formdata}
                    setFormData={setformdata}
                    readMode={readMode}
                  />
                </div>
              ))}

            {activeStep === 2 &&
              (toggleStatus ? (
                <OutcomeAdvanceMainPage
                  formdata={formdata}
                  setformdata={setformdata}
                  readMode={readMode}
                />
              ) : (
                <div
                  style={{
                    border: "1px solid #c0c0c0",
                    borderRadius: "15px",
                    padding: "27px",
                  }}
                >
                  <Outcome
                    formData={formdata}
                    setFormData={setformdata}
                    readMode={readMode}
                    setOutcome={null}
                  />
                </div>
              ))}

            {activeStep === 3 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0px",
                  padding: "20px 100px",
                }}
              >
                <CommonReferencesTab drawer={drawer} />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#003059",
                    }}
                  >
                    Comments:
                  </label>
                  <TextArea
                    autoSize={{ minRows: 4, maxRows: 10 }}
                    style={{ width: "60%" }}
                    onChange={(e) => handleReferenceChange(e.target.value)}
                    value={referenceComments}
                    className={classes.textArea}
                    disabled={
                      readMode ||
                      formdata?.status === "Open" ||
                      formdata?.status === "Analysis_In_Progress" ||
                      formdata?.status === "Draft" ||
                      formdata?.status === "Closed" ||
                      formdata?.status === "Accepted" ||
                      formdata?.status === "Rejected" ||
                      formdata?.status === ""
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    // gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#003059",
                    }}
                  >
                    Attachments:
                  </label>

                  <Dragger
                    accept=".pdf,.png,.jpeg,.jpg,.docx,.bmp,.tif,.tiff,.webp"
                    name="fileList"
                    {...uploadFileprops}
                    className={`${classes.uploadSection} ant-upload-drag-container`}
                    showUploadList={false}
                    fileList={fileList}
                    multiple
                    disabled={
                      readMode ||
                      formdata?.status === "Open" ||
                      formdata?.status === "Analysis_In_Progress" ||
                      formdata?.status === "Draft" ||
                      formdata?.status === "Closed" ||
                      formdata?.status === "Accepted" ||
                      formdata?.status === "Rejected" ||
                      formdata?.status === ""
                    }
                  >
                    {/* <p className="ant-upload-drag-icon">
                <InboxIcon />
              </p> */}
                    <p className="ant-upload-text">Select files</p>
                  </Dragger>

                  <div>
                    {fileList?.length > 0 &&
                      fileList.map((item: any) => (
                        <div
                          style={{
                            display: "flex",
                            // marginLeft: "10px",
                            alignItems: "center",
                          }}
                          key={item.uid || item.id} // Ensure a unique key
                        >
                          <Typography className={classes.filename}>
                            <a
                              href={item?.url || "#"} // Fallback if URL is missing
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item?.name || "Untitled Document"}{" "}
                              {/* Fallback if name is missing */}
                            </a>
                          </Typography>

                          <IconButton
                            onClick={() => {
                              // console.log("Removing file:", item);
                              clearFile(item); // Ensure this correctly updates state
                            }}
                            disabled={
                              readMode ||
                              formdata?.status === "Open" ||
                              formdata?.status === "Analysis_In_Progress" ||
                              formdata?.status === "Draft" ||
                              formdata?.status === "Closed" ||
                              formdata?.status === "Accepted" ||
                              formdata?.status === "Rejected" ||
                              formdata?.status === ""
                            }
                          >
                            <img src={CrossIcon} alt="Remove" />
                          </IconButton>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Box>

      {activeStep === 3 && (
        <Button
          style={{
            backgroundColor: "#003059",
            fontSize: "14px",
            width: "90px",
            textAlign: "center",
            color: "white",
            position: "absolute",
            top: "77px",
            right: "66px",
            zIndex: 1100,
          }}
          onClick={submitData}
          disabled={readMode}
        >
          Save
        </Button>
      )}

      <div>
        {!!commentDrawer.open && (
          <CommentsDrawer
            commentDrawer={commentDrawer}
            setCommentDrawer={setCommentDrawer}
            toggleCommentsDrawer={toggleCommentsDrawer}
            formData={editData}
            handleCommentSubmit={handleCommentSubmit}
            commentData={comments}
            commentsLoader={commentsLoader}
          />
        )}
      </div>
      <div>
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Confirmation</DialogTitle>
          <DialogContent>
            Are you sure you want to proceed? Once "Outcome In Progress" is
            submitted, you cannot edit Analysis further.
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleProceed} color="primary">
              Proceed
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <div>
        <Dialog
          open={openValidationDialog}
          onClose={() => setOpenValidationDialog(false)}
        >
          <DialogTitle>Validation Required</DialogTitle>
          <DialogContent>
            <DialogContentText>{validationMessage}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenValidationDialog(false)}
              color="primary"
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <div>
        <CaraOwnerModal
          formData={editData}
          capaOwnerData={capaOwnerData}
          setformdata={setformdata}
          openModalForOwner={openModalForOwner}
          setOpenModalForOwner={setOpenModalForOwner}
          readMode={readMode}
          setOwnerFormSubmit={setOwnerFormSubmit}
          handleSubmit={handleSubmit}
          setOwnerChange={setOwnerChange}
        />
      </div>
      <div>
        {!!detailsDrawer && (
          <CaraDetailsDrawer
            detailsDrawer={detailsDrawer}
            setDetailsDrawer={setDetailsDrawer}
            formData={formdata}
            toggleDetailsDrawer={toggleDetailsDrawer}
          />
        )}
      </div>
    </>
  );
};
export default CaraFormStepper;
