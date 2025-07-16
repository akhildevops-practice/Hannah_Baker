import { Tabs, Drawer, Space, Button, Modal } from "antd";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Tooltip,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import useStyles from "../../pages/MRM/commonDrawerStyles";
import { useMediaQuery, Typography } from "@material-ui/core";
import axios from "../../apis/axios.global";

import DocInfoIconImageSvg from "../../assets/documentControl/Info.svg";

import CloseIconImageSvg from "assets/documentControl/Close.svg";
//notistack
import { useSnackbar } from "notistack";
import TransferWithinAStationTwoToneIcon from "@material-ui/icons/TransferWithinAStationTwoTone";

import checkRoles from "../../utils/checkRoles";
import CaraRegistration from "components/CaraRegistration";

import { caraRegistrationForm, referencesData } from "recoil/atom";

import { useRecoilState } from "recoil";

import CaraDetailsDrawer from "./CaraDetailsDrawer";
import CaraWhy from "components/Carawhy/CaraWhy";

import getYearFormat from "utils/getYearFormat";
import ChatIcon from "@material-ui/icons/Chat";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import CaraOutcome from "components/Carawhy/CaraOutcome";
import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";
import CommentsDrawer from "components/CIPManagement/CIPTable/CIPDrawer/CommentsDrawer";
import dayjs from "dayjs";
import getAppUrl from "utils/getAppUrl";
import { API_LINK } from "config";
import CaraOwnerModal from "./caraOwnerModal";
import { isValid } from "utils/validateInput";

type Props = {
  drawer: any;
  readMode: boolean;
  setActiveTab?: any;
  setDrawer: (drawer: any) => void;
  handleDrawer?: any;
  expandDataValues?: any;
  mrm?: boolean;
  activeTab?: any;
  drawerType?: string;
  isEdit?: boolean;
  editData?: any;
  setIsEdit?: (edit: boolean) => void;
  setUpload?: any;
  isUpload?: boolean;
  getData?: any;
  handleCloseDrawer?: any;
  moduleName?: any;
  getCapaResponse?: any;
};

const CaraDrawer = ({
  drawer,
  handleDrawer,
  expandDataValues,
  mrm,
  isEdit,
  editData,
  setIsEdit,
  setDrawer,
  readMode,
  isUpload,
  setUpload,
  getData,
  activeTab,
  setActiveTab,
  handleCloseDrawer,
  moduleName,
  getCapaResponse,
}: Props) => {
  // const [auditeeData, setAuditeeData] = useRecoilState(auditeeSectionData);

  // const [referencesNew, setReferencesNew] = useState<any>([]);
  const [open, setOpen] = useState(false);
  const [detailsDrawer, setDetailsDrawer] = useState<any>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<string>("Open");
  const [deptHead, setDeptHead] = useState<any>([]);
  const [openModalForOwner, setOpenModalForOwner] = useState<any>(false);
  const [caraData, setCaraData] = useState<any>({});

  const [formdata, setformdata] = useRecoilState(caraRegistrationForm);
  const [items, setItems] = useState<any>([]);
  const [clickedMenuItem, setClickedMenuItem] = useState<boolean>(false);
  // const showData = isOrgAdmin || isMR;
  // const navigate = useNavigate();
  const [commnetValue, setCommentValue] = useState("");
  const orgId = sessionStorage.getItem("orgId");
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [refsData] = useRecoilState(referencesData);
  const { enqueueSnackbar } = useSnackbar();
  const [currentYear, setCurrentYear] = useState<any>();
  const classes = useStyles();
  const smallScreen = useMediaQuery("(min-width:450px)");
  // const [initialFileList, setInitialFileList] = useState([]);
  // const [initialAttachmentList, setInitialAttachmentList] = useState([]);
  // const [isOutcomeUpload, setOutcomeUpload] = useState<boolean>(false);
  const [isAnalysis, setAnalysis] = useState<boolean>(false);
  const [isOutcome, setOutcome] = useState<boolean>(false);
  const [isRejectEdit, setRejectEdit] = useState<boolean>(false);

  const [commentsLoader, setCommentsLoader] = useState(false);
  const [capaOwnerData, setCapaOwnerData] = useState<any>([]);
  const [anchorEl, setAnchorEl] = useState(null);
  //console.log("isEdit", isEdit);
  const [comments, setComments] = useState<any>([]);
  const [ownerFormSubmit, setOwnerFormSubmit] = useState(false);
  const [ownerChange, setOwnerChange] = useState(false);
  const [commentDrawer, setCommentDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [selectedItem, setSelectedItem] = useState("");
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const [openValidationDialog, setOpenValidationDialog] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const matches = useMediaQuery("(min-width:786px)");

  const realmName = getAppUrl();
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

  const [openDialog, setOpenDialog] = useState(false);
  const [newStatus, setNewStatusOption] = useState<any>();
  const [isOutcomeConfirm, setOutcomeConfirm] = useState(false);
  useEffect(() => {
    if (!!drawer.open) {
      getyear();

      if (drawer?.mode === "create") {
        // Logic for "create" mode
        const defaultButtonOptions = ["Save As Draft", "Submit Capa"];
        const newItems = defaultButtonOptions?.map((item: any, index: any) => ({
          key: (index + 1).toString(),
          label: item,
        }));
        setItems([...defaultButtonOptions]);

        // Reset the form data for "create" mode
        setformdata({
          title: "",
          kpiId: "",
          type: "",
          startDate: "",
          comments: "",
          files: [],
          registerfiles: [],
          endDate: "",
          registeredBy: "",
          caraCoordinator: "",
          coordinator: "",
          analysisLevel: "",
          referenceComments: "",
          status: "",
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
      } else if (isEdit && editData?._id) {
        // Logic for "edit" mode
        getcarabyid();
        getDeptHead();

        setformdata({
          ...formdata,
          serialNumber: formdata?.serialNumber,
          status: formdata?.status,
          comments: formdata?.comments,
          caraOwner: formdata?.caraOwner,
        });
      }
    }
  }, [drawer?.open, isEdit]);
  // console.log("drawer.opn", drawer);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    handleDrawer();
    // setOpen(true);
  };

  // const handleProceed = async () => {
  //   // Handle the logic for proceeding here
  //   console.log("handleProcced called");
  //   setOpenDialog(false);
  //   setOutcomeConfirm(true);
  //   console.log("option", option, isOutcomeConfirm);
  //   await handleSubmit(option, true);
  // };

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

  // useEffect(() => {
  //   getyear();

  //   if (drawer?.mode === "create") {
  //     // console.log("checkdoc drawer opened in create mode", drawer);
  //     const defaultButtonOptions = ["Save As Draft", "Submit Capa"];
  //     const newItems = defaultButtonOptions?.map((item: any, index: any) => ({
  //       key: (index + 1).toString(),
  //       label: item,
  //     }));
  //     setItems([...defaultButtonOptions]);
  //     setformdata({
  //       title: "",
  //       kpiId: "",
  //       type: "",
  //       startDate: "",
  //       comments: "",
  //       files: [],
  //       registerfiles: [],
  //       endDate: "",
  //       registeredBy: "",
  //       caraCoordinator: "",
  //       coordinator: "",
  //       status: "",
  //       serialNumber: "",
  //       caraOwner: {},
  //       entityId: "",
  //       systemId: [],
  //       containmentAction: "",
  //       location: "",
  //       origin: "",
  //       locationId: "",
  //       organizationId: "",
  //       deptHead: [],
  //       description: "",
  //       date: {},
  //       entity: "",
  //       systems: [],
  //       year: "",
  //       attachments: [],
  //       correctiveAction: "",
  //       targetDate: "",
  //       correctedDate: "",
  //       kpiReportLink: "",
  //       rootCauseAnalysis: "",
  //       actualCorrectiveAction: "",
  //     });
  //   } else if (isEdit && editData?._id) {
  //     getcarabyid();
  //     getDeptHead();
  //   }
  // }, [drawer?.open]);
  // // console.log("drawer", drawer, isEdit, formdata);
  // useEffect(() => {
  //   if (isEdit) {
  //     if (editData?._id) {
  //       getcarabyid();
  //       getDeptHead();
  //     }

  //     setformdata({
  //       ...formdata,
  //       serialNumber: formdata?.serialNumber,
  //       status: formdata?.status,
  //       comments: formdata?.comments,
  //       caraOwner: formdata?.caraOwner,
  //     });
  //     // getDeptHead();
  //   }
  // }, [isEdit]);

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    setCurrentYear(currentyear);
  };
  const toggleCommentsDrawer = (data: any = {}) => {
    setCommentDrawer({
      ...commentDrawer,
      open: !commentDrawer.open,
      data: { ...data },
    });
    getComments();
  };
  const toggleCapaOwnerModal = (data: any = {}) => {
    setOpenModalForOwner(!openModalForOwner);
    getCapaOwnerDetails();
  };
  const getCapaOwnerDetails = async () => {
    try {
      const result = await axios.get(
        `/api/cara/getCapaOwnerEntry/${editData._id}`
      );
      if (result?.data) {
        setCapaOwnerData(result?.data);
      } else {
        setCapaOwnerData([]);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const handleCommentSubmit = async (value: string) => {
    setCommentsLoader(true);
    if (value && editData?._id) {
      try {
        let res = await axios.post("/api/cara/createCapaComments", {
          caraId: editData?._id,
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
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
    setClickedMenuItem(false); // Reset flag when opening the menu
  };

  // Handle closing the menu
  const handleClose = () => {
    // Only reset form data if the menu item has been clicked
    if (clickedMenuItem) {
      setAnchorEl(null);
      setClickedMenuItem(false); // Reset the clicked flag
      // Reset form data here (as per your original implementation)
      setformdata({
        title: "",
        kpiId: "",
        analysisLevel: "",
        type: "",
        startDate: "",
        comments: "",
        files: [],
        registerfiles: [],
        endDate: "",
        registeredBy: "",
        caraCoordinator: "",
        coordinator: "",
        status: "",
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
        referenceComments: "",
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
    } else {
      // Only close the menu without resetting if no item has been clicked
      setAnchorEl(null);
    }
  };

  // Handle menu item click and submission
  const onMenuClick = (e: any) => {
    setClickedMenuItem(true); // Mark the menu item clicked
    handleSubmit(e); // Call your form submission logic
  };

  const getComments = async () => {
    setCommentsLoader(true);
    try {
      let res: any = await axios.get(
        `/api/cara/getCapaCommentsById/${editData._id}`
      );
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
  const tabs = [
    {
      label: "CAPA Registration",
      key: "1",
      children: (
        <CaraRegistration
          drawer={drawer}
          formData={formdata}
          setFormData={setformdata}
          isEdit={isEdit}
          caraData={caraData}
          open={open}
          setOpen={setOpen}
          submitted={submitted}
          setSubmitted={setSubmitted}
          setFormStatus={setFormStatus}
          readMode={readMode}
          setRejectEdit={setRejectEdit}
        />
      ),
      // disabled: formdata?.status != "OPEN",
    },
    {
      label: "Analyse",
      key: "2",
      children: (
        <>
          <CaraWhy
            formData={formdata}
            setFormData={setformdata}
            readMode={readMode}
            isUpload={isUpload}
            setUpload={setUpload}
            isAnalysis={isAnalysis}
            setAnalysis={setAnalysis}
            // setOutcomeUpload={setOutcomeUpload}
            drawer={drawer}
          />
        </>
      ),
      disabled: formdata?.status === "" || formdata?.status === undefined,
    },
    {
      label: "Outcome",
      key: "3",
      children: (
        <>
          <CaraOutcome
            formData={formdata}
            setFormData={setformdata}
            readMode={readMode}
            // setOutcomeUpload={setOutcomeUpload}
            setUpload={setUpload}
            setAnalysis={setAnalysis}
            setOutcome={setOutcome}
            drawer={drawer}
          />
        </>
      ),
      disabled: formdata?.status === "" || formdata?.status === undefined,
    },
    {
      label: "Reference",
      key: 4,
      children: (
        <div>
          <CommonReferencesTab drawer={drawer} />
        </div>
      ),
      // disabled: formdata?.status !== "ACCEPTED",
    },
  ];
  const toggleDetailsDrawer = (data: any = {}) => {
    setDetailsDrawer({
      ...detailsDrawer,
      open: !detailsDrawer.open,
      data: { ...data },
    });
  };
  const getDeptHead = async () => {
    try {
      // console.log("callling depthead");
      const entityid = editData?.entityId?.id || editData?.entityId;
      const result = await axios.get(
        `/api/cara/getDeptHeadForEntity/${entityid}`
      );
      //console.log("result", result?.data);
      setDeptHead(result?.data);
    } catch (error) {
      // enqueueSnackbar("Error Fetching Department Head!!", { variant: "error" });
    }
  };
  const getcarabyid = async () => {
    try {
      // console.log("getcarbyid", editData._id);
      const result = await axios.get(`/api/cara/getCaraById/${editData?._id}`);
      const buttonOptionsResponse = await axios.get(
        `/api/cara/getStatusOptionForCapa/${editData?._id}`
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
        setformdata({
          ...result?.data,
          entity: result?.data?.entityId?.id,
          systems: result?.data?.systemId?.map((item: any) => item?._id),

          coordinator: result?.data?.caraCoordinator?.id,
        });

        // setInitialFileList(result?.data?.files);
        if (result.data?.attachments) {
          // setInitialAttachmentList(result?.data?.attachments);
        }
      }
    } catch (error) {
      // enqueueSnackbar("Error fetching record for cara", { variant: "error" });
    }
  };
  // console.log("setupload value in drawer", isUpload);
  const uploadData = async (files: any) => {
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
  const handleTitleValidation = async (value: any) => {
    let sanitizedValue = value.trim();
    const regex = /^[a-zA-Z0-9\-\&\_\,\%\(\)\/ ]+$/;

    if (regex.test(sanitizedValue)) {
      setformdata((prevData: any) => ({
        ...prevData,
        title: sanitizedValue,
      }));
      return true;
    } else {
      console.log("Invalid characters detected.");
      return false;
    }
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
      // console.log("submitstatus", submitstatus);
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
            if (!validateAnalysis()) {
              setValidationMessage(
                "Please fill in at least one of the following: Containment Action, Root Cause Analysis, or Corrective Action."
              );
              setOpenValidationDialog(true); // Open the validation dialog
              return; // Stop further processing
            }

            // Open the confirmation dialog if validation passes
            setOpenDialog(true);
            setNewStatusOption(option);
            return;
          }
        }
        // console.log("submit status", submitstatus);
        if (submitstatus === "Closed") {
          if (!!formdata.actualCorrectiveAction) {
            const ca = isValid(formdata?.actualCorrectiveAction);
            if (!ca.isValid) {
              enqueueSnackbar(
                `Please enter valid corrective action ${ca.errorMessage}`,
                { variant: "error" }
              );
              return;
            }
          } else if (
            formdata?.actualCorrectiveAction === undefined ||
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
        //   console.log("isupload in drawer", isOutcome);

        // if (isAnalysis === true && isOutcome === false) {
        //   if (
        //     isUpload === false &&
        //     (submitstatus === "Analysis_In_Progress" ||
        //       submitstatus === "Accepted")
        //   ) {
        //     enqueueSnackbar("Please click on Upload Files to Submit", {
        //       variant: "error",
        //     });
        //     return;
        //   }
        // } else if (isOutcome === true) {
        //   if (
        //     isOutcomeUpload === false &&
        //     formdata?.status === "Analysis_In_Progress"
        //   ) {

        //     enqueueSnackbar("Please click on Upload Files to Submit", {
        //       variant: "error",
        //     });
        //     return;
        //   }
        // }
        //if comments are entered for accepted or rejected status add it to the same comments collection
        if (submitstatus === "Rejected" || submitstatus === "Accepted") {
          if (!!formdata.comments && formdata.comments !== "") {
            handleCommentSubmit(formdata.comments);
          }
        }
        if (ownerChange === true) {
          // console.log("inside else if accepted", formdata?.caraOwner);

          data = await axios.patch(`/api/cara/updateCara/${editData?._id}`, {
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
            handleClose();
            enqueueSnackbar("CAPA owner updated successfully", {
              variant: "success",
            });
            moduleName === "INBOX" ? getCapaResponse() : getData();
            // setUpload(false);

            setformdata({
              title: "",
              kpiId: "",
              registerfiles: [],
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
              referenceComments: "",
              targetDate: "",
              correctedDate: "",
              kpiReportLink: "",
              rootCauseAnalysis: "",
              actualCorrectiveAction: "",
              caraCoordinator: "",
              referenceAttachments: [],
            });
            handleDrawer();
          }
          return;
        } else {
          // console.log("inside else update", submitstatus);
          data = await axios.patch(`/api/cara/updateCara/${editData?._id}`, {
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

          if (data.status == 200 || data.status == 201) {
            handleClose();

            enqueueSnackbar("CAPA updated successfully", {
              variant: "success",
            });
            // if (moduleName === "INBOX") {
            //   getCapaResponse();
            // }
            // {
            //   getData();
            // }
            moduleName === "INBOX" ? getCapaResponse() : getData();
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
              referenceComments: "",
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
            handleDrawer();
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
            handleClose();
            enqueueSnackbar("successfully created", {
              variant: "success",
            });

            getData();
            setUpload(false);
            setformdata({
              title: "",
              kpiId: "",
              coordinator: "",
              analysisLevel: "",
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
              referenceComments: "",
              date: {},
              year: "",
              attachments: [],
              location: "",
              correctiveAction: "",
              targetDate: "",
              correctedDate: "",
              kpiReportLink: "",
              rootCauseAnalysis: "",
              actualCorrectiveAction: "",
              referenceAttachments: [],
            });
            handleDrawer();
          }
        } else {
          enqueueSnackbar("Please fill all required fields", {
            variant: "error",
          });
        }
      }
    } catch (error) {
      enqueueSnackbar(error, {
        variant: "error",
      });
    }
  };

  //console.log("formdata in caradrawer", formdata, editData);
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

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState("Registration");
  // console.log("selectedValue", selectedValue);
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

  return (
    <Drawer
      title={matches ? <span key="title">CAPA Management</span> : ""}
      placement="right"
      open={drawer?.open}
      closable={true}
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      onClose={() => {
        //setformdata({});
        //  console.log(formdata);
        // handleClose();

        if (setIsEdit) {
          setIsEdit(false);
          setformdata({
            title: "",
            referenceComments: "",
            kpiId: "",
            type: "",
            analysisLevel: "",
            startDate: "",
            comments: "",
            files: [],
            registerfiles: [],
            endDate: "",
            registeredBy: "",
            caraCoordinator: "",
            coordinator: "",
            status: "",
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

        setDrawer({ mode: "create", data: {}, open: false });

        // console.log("closing....");
      }}
      className={classes.drawer}
      width={matches ? "55%" : "90%"}
      extra={
        <>
          {isEdit &&
            ((Array.isArray(deptHead) &&
              deptHead?.some((user: any) => user.id === userDetail.id)) ||
              formdata.coordinator === userDetail?.id) &&
            !(
              formdata.status === "Open" ||
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
                  disabled={drawer?.mode === "create"}
                >
                  <TransferWithinAStationTwoToneIcon
                    className={classes.commentsIcon}
                    onClick={toggleCapaOwnerModal}
                  />
                </IconButton>
              </Tooltip>
            )}

          {(isEdit || readMode) && (
            <Tooltip title="Add/View Comments">
              <IconButton
                style={{
                  padding: 0,
                  margin: 0,
                  marginRight: matches ? "30px" : "3px",
                }}
                disabled={drawer?.mode === "create"}
              >
                <ChatIcon
                  className={classes.commentsIcon}
                  onClick={toggleCommentsDrawer}
                />
              </IconButton>
            </Tooltip>
          )}
          {readMode === true ? (
            <></>
          ) : (
            <Space>
              {formdata.status === "Open" &&
                ((Array.isArray(deptHead) &&
                  deptHead?.length > 0 &&
                  deptHead?.some((user: any) => user.id === userDetail?.id)) ||
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
                    }}
                  >
                    Accept/Reject
                  </Button>
                )}
              {/* {formdata.deptHead &&
                formdata.status === "ACCEPTED" &&
                formdata.deptHead.some(
                  (user: any) =>
                    user.id === userDetail.id &&
                    formdata.correctiveAction &&
                    formdata.targetDate &&
                    formdata.rootCauseAnalysis
                ) && (
                  <Button
                    type="primary"
                    onClick={handleApprove}
                    className={classes.cancelBtn}
                  >
                    Approve
                  </Button>
                )}
              {formdata.deptHead &&
                formdata.status === "CA PENDING" &&
                formdata.deptHead.some(
                  (user: any) =>
                    user.id === userDetail.id &&
                    formdata.actualCorrectiveAction &&
                    formdata.correctedDate &&
                    formdata.rootCauseAnalysis
                ) && (
                  <Button
                    type="primary"
                    onClick={handleClosureApprove}
                    className={classes.cancelBtn}
                  >
                    Approve
                  </Button>
                )} */}
              {matches ? (
                <Button onClick={handleDrawer} className={classes.cancelBtn}>
                  Cancel
                </Button>
              ) : (
                ""
              )}

              <Button
                onClick={handleClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: smallScreen ? "14px" : "12px",
                  padding: smallScreen ? "4px 15px" : "2px 5px",
                }}
                disabled={items?.length === 0}
              >
                <span
                  style={{
                    fontWeight: "bold",
                  }}
                >
                  {selectedItem || "Actions"}
                </span>
                <ExpandMoreOutlinedIcon
                  style={{
                    fill: `${items?.length === 0 ? "gray" : "#0e497a"}`,
                  }}
                />
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {items &&
                  items.length > 0 &&
                  items?.map((item: any, index: any) => (
                    <MenuItem key={index + 1} onClick={() => onMenuClick(item)}>
                      {item}
                    </MenuItem>
                  ))}
              </Menu>
              <Tooltip title="View CAPA Details">
                <img
                  src={DocInfoIconImageSvg}
                  alt="doc-info"
                  onClick={toggleDetailsDrawer}
                  className={classes.docInfoIcon}
                  style={{ marginRight: smallScreen ? "30px" : "0px" }}
                />
              </Tooltip>
            </Space>
          )}
          {/* <Tooltip title="Expand Form">
            <Button
              // style={{ marginLeft: "8px" }}
              className={classes.expandIcon}
              onClick={() =>
                navigate("/cara/fullformview", {
                  state: { formdata: formdata, mrm: mrm },
                })
              }
            >
              <ExpandIcon />
            </Button>
          </Tooltip> */}
        </>
      }
    >
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
      <div>
        {formdata?.serialNumber && (
          <span
            style={{
              fontSize: "15px",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "flex-end", // Align to the flex-end
              //paddingBottom: "5px", // Adjust the padding at the top
            }}
          >
            {formdata?.serialNumber}
          </span>
        )}
      </div>
      <div className={classes.tabsWrapper} style={{ position: "relative" }}>
        {matches ? (
          <Tabs
            type="card"
            items={tabs as any}
            defaultActiveKey={"1"}
            onChange={(key: string) => setActiveTab(key)}
            // activeKey={activeTab?.toString()}
            animated={{ inkBar: true, tabPane: true }}

            // tabBarStyle={{backgroundColor : "green"}}
          />
        ) : (
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
            <Select
              label="Menu List"
              value={selectedValue}
              onChange={handleDataChange}
            >
              <MenuItem value={"Registration"}>
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Registration" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "Registration" ? "white" : "black",
                  }}
                >
                  {" "}
                  CAPA Registration
                </div>
              </MenuItem>
              <MenuItem value={"Analyse"}>
                {" "}
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Analyse" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "Analyse" ? "white" : "black",
                  }}
                >
                  Analyse
                </div>
              </MenuItem>
              <MenuItem value={"Outcome"}>
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Outcome" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "Outcome" ? "white" : "black",
                  }}
                >
                  Outcome
                </div>
              </MenuItem>
              <MenuItem value={"Reference"}>
                <div
                  style={{
                    backgroundColor:
                      selectedValue === "Reference" ? "#3576BA" : "white",
                    textAlign: "center",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    color: selectedValue === "Reference" ? "white" : "black",
                  }}
                >
                  Reference
                </div>
              </MenuItem>
            </Select>
          </FormControl>
        )}

        {matches ? (
          ""
        ) : (
          <div>
            {selectedValue === "Registration" ? (
              <div>
                {" "}
                <CaraRegistration
                  drawer={drawer}
                  formData={formdata}
                  setFormData={setformdata}
                  isEdit={isEdit}
                  caraData={caraData}
                  open={open}
                  setOpen={setOpen}
                  submitted={submitted}
                  setSubmitted={setSubmitted}
                  setFormStatus={setFormStatus}
                  readMode={readMode}
                  setRejectEdit={setRejectEdit}
                />
              </div>
            ) : (
              ""
            )}

            {selectedValue === "Analyse" ? (
              <div style={{ marginTop: "10px" }}>
                <CaraWhy
                  formData={formdata}
                  setFormData={setformdata}
                  readMode={readMode}
                  isUpload={isUpload}
                  setUpload={setUpload}
                  isAnalysis={isAnalysis}
                  setAnalysis={setAnalysis}
                  // setOutcomeUpload={setOutcomeUpload}
                  drawer={drawer}
                />
              </div>
            ) : (
              ""
            )}

            {selectedValue === "Outcome" ? (
              <div>
                {" "}
                <CaraOutcome
                  formData={formdata}
                  setFormData={setformdata}
                  readMode={readMode}
                  // setOutcomeUpload={setOutcomeUpload}
                  setUpload={setUpload}
                  setAnalysis={setAnalysis}
                  setOutcome={setOutcome}
                  drawer={drawer}
                />
              </div>
            ) : (
              ""
            )}

            {selectedValue === "Reference" ? (
              <div style={{ marginTop: "10px" }}>
                {" "}
                <CommonReferencesTab drawer={drawer} />
              </div>
            ) : (
              ""
            )}
          </div>
        )}

        {matches ? (
          <>
            {" "}
            {tabs.length > 3 && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  display: "flex",
                  alignItems: "center",
                  fontSize: "12px",
                  color: "black",
                  //backgroundColor: "#003566",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "5px",
                    marginBottom: "10px",
                    backgroundColor: getStatusColor(formdata?.status),
                    color: "black",
                    borderRadius: "8px",
                    width: "100px",
                    textAlign: "center",
                  }}
                >
                  {formdata?.status}
                </span>
              </div>
            )}{" "}
          </>
        ) : (
          ""
        )}
      </div>
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
    </Drawer>
  );
};

export default CaraDrawer;
