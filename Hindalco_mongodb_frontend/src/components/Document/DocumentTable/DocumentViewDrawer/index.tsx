//react, react-router, recoil
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { processDocFormData } from "recoil/atom";

//material-ui
import {
  Tooltip,
  useMediaQuery,
  CircularProgress,
  Menu,
  MenuItem,
} from "@material-ui/core";
import PeopleIcon from "@material-ui/icons/People";
import HistoryIcon from "@material-ui/icons/History";
import ChatIcon from "@material-ui/icons/Chat";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import VisibilityIcon from "@material-ui/icons/Visibility";
import CompareIcon from "@material-ui/icons/Compare";
import CompareArrowsIcon from "@material-ui/icons/CompareArrows";

//antd
import { Button, Drawer, Modal, Space, Tag } from "antd";

//utils
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";

//components
import HistoryTopDrawer from "components/Document/DocumentTable/DocumentViewDrawer/HistoryTopDrawer";
import CommentsDrawer from "components/Document/DocumentTable/DocumentViewDrawer/CommentsDrawer";
import DocumentViewer from "components/Document/DocumentTable/DocumentViewDrawer/DocumentViewer";
import InfoTopDrawer from "components/Document/DocumentTable/DocumentViewDrawer/InfoTopDrawer";
import DocWorkflowTopDrawer from "components/Document/DocumentTable/DocumentViewDrawer/DocWorkflowTopDrawer";

//assets
import DocInfoIconImageSvg from "assets/documentControl/Info.svg";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import ExpandIconImageSvg from "assets/documentControl/expand1.svg";
import { ReactComponent as StarIcon } from "assets/documentControl/Star.svg";
import { ReactComponent as StarFilledIcon } from "assets/documentControl/Star-Filled.svg";
import GetAppIcon from "@material-ui/icons/GetApp";
import { API_LINK } from "config";
import { roles } from "utils/enums";

//styles
import useStyles from "./style";

//thirdparty libs
import { useSnackbar } from "notistack";
import saveAs from "file-saver";
import TextArea from "antd/es/input/TextArea";
import getSessionStorage from "utils/getSessionStorage";
import checkRoles from "utils/checkRoles";
import checkRole from "utils/checkRoles";
import { color } from "highcharts";
import { ImDownload } from "react-icons/im";

const DocStateIdentifier: any = {
  "Send for Edit": "SEND_FOR_EDIT",
  "Review Complete": "IN_APPROVAL",
  Approve: "PUBLISHED",
  Publish: "PUBLISHED",
  "Send for Review": "IN_REVIEW",
  "Save as Draft": "DRAFT",
  Amend: "AMMEND",
  "Send for Approval": "IN_APPROVAL",
  Save: "Save",
  Retire: "Retire",
  "Review Retire": "Review Complete",
  "Approve Retire": "Approve Complete",
  discard: "discard",
  Revert: "Revert",
};

type Props = {
  docViewDrawer: any;
  setDocViewDrawer: any;
  toggleDocViewDrawer: any;
  handleFetchDocuments: any;
};

const DocumentViewDrawer = ({
  docViewDrawer,
  setDocViewDrawer,
  toggleDocViewDrawer,
  handleFetchDocuments,
}: Props) => {
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const realmName = getAppUrl();
  const classes = useStyles();
  // const { socket } = React.useContext<any>(SocketContext);
  const location = useLocation();
  const [formData, setFormData] = useRecoilState(processDocFormData);
  const [peopleDrawer, setPeopleDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [editTrue, setEditTrue] = useState(true);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [infoDrawer, setInfoDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [openModalForComment, setopenModalForComment] = useState(false);
  const matches = useMediaQuery("(min-width:786px)");
  const [historyDrawer, setHistoryDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [commentDrawer, setCommentDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [commnetValue, setCommentValue] = useState("");

  const [buttonOptions, setButtonOptions] = useState<any>([]);
  const [renderedFrom, setRenderedFrom] = useState<string>("");
  const [commentsLoader, setCommentsLoader] = useState(false);
  const [comments, setComments] = React.useState<any>([]);
  const [favorite, setFavorite] = useState<boolean>(false);
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const [anchorEl, setAnchorEl] = useState(null);
  const [downloadAccess, setDownloadAccess] = useState<boolean>(false);
  const currentUser = getSessionStorage();
  const supportedfiles = ["docx", "doc", "xlsx", "xls", "ppt", "pptx"];

  useEffect(() => {}, [favorite]);

  useEffect(() => {
    getDocData();
    !docViewDrawer?.data?.isVersion && getUserOptions();
    getComments();
    getFavorite();
    if (location.pathname.toLowerCase().includes("/processdocuments/viewdoc")) {
      setRenderedFrom("process");
    }
  }, [docViewDrawer?.data?.id]);

  // useEffect(() => {
  //   documentDownloadAccess();
  // }, [formData]);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const statusMap: any = {
    Approved: { backgroundColor: "#7cbf3f", text: "Approved", color: "white" },
    IN_REVIEW: {
      backgroundColor: "#F2BB00",
      color: "white",
      text: "In Review",
    },
    "Review Complete": {
      backgroundColor: "#F2BB00",
      text: "Review Complete",
      color: "white",
    },
    IN_APPROVAL: {
      backgroundColor: "#FB8500",
      color: "white",
      text: "In Approval",
    },
    AMMEND: { backgroundColor: "#D62DB1", text: "Amend", color: "yellow" },
    PUBLISHED: {
      backgroundColor: "#7CBF3F",
      color: "white",
      text: "Published",
    },
    DRAFT: { backgroundColor: "#0075A4", color: "white", text: "Draft" },
    SEND_FOR_EDIT: {
      backgroundColor: "#0075A4",
      text: "Sent For Edit",
      color: "white",
    },
    "Retire - In Review": { color: "#0075A4", text: "Retire Review" },
    "Retire - In Approval": { color: "#FB8500", text: "Retire Approval" },
    OBSOLETE: { color: "white", text: "Obsolete", backgroundColor: "darkblue" },
  };

  const togglePeopleDrawer = (data: any = {}) => {
    setPeopleDrawer({
      ...peopleDrawer,
      open: !peopleDrawer.open,
      data: { ...data },
    });
  };
  const getDocData = async () => {
    try {
      setIsLoading(true);
      let res: any;
      if (docViewDrawer.data.isVersion) {
        res = await axios.get(
          `/api/documents/getSingleDocument/${docViewDrawer?.data?.id}?versionId=${docViewDrawer.data.version}&version=true`
        );
      } else {
        res = await axios.get(
          `/api/documents/getSingleDocument/${docViewDrawer?.data?.id}?versionId=${docViewDrawer.data.version}`
        );
      }
      // const res = await axios.get(
      //   `/api/documents/getSingleDocument/${docViewDrawer?.data?.id}?versionId=${docViewDrawer.data.version}`
      // );
      setFormData({
        ...res.data,
        locationName: res?.data?.creatorLocation?.locationName,
        entityName: res?.data?.creatorEntity?.entityName,
        docType: res?.data?.doctype?.documentTypeName,
        cuurentVersion: res?.data?.currentVersion,
        issueNumber: res?.data?.issueNumber,
        approvers: res?.data?.approvers,
        reviewers: res?.data?.reviewers,
        isVersion: res?.data?.isVersion,
        status: res?.data?.documentState,
        sectionName: res?.data?.sectionName,
        systemNames: res?.data?.doctype?.applicable_systems?.filter(
          (item: any) => res?.data?.system.includes(item?.id)
        ),

        attachmentHistory: res.data?.attachmentHistory?.map((item: any) => ({
          updatedBy: item?.updatedBy,
          attachment: item?.attachment,
          updatedAt: item?.updatedAt,
        })),

        DocumentWorkFlowHistory: res?.data?.DocumentWorkFlowHistory?.map(
          (item: any) => ({
            ...item,
            actionName:
              item.actionName === "IN_REVIEW"
                ? "For Review"
                : item.actionName === "IN_APPROVAL"
                ? "For Approval"
                : item.actionName === "AMMEND"
                ? "Amend"
                : item.actionName === "DRAFT"
                ? "Draft"
                : item.actionName === "APPROVED"
                ? "Approved"
                : item.actionName === "PUBLISHED"
                ? "Published"
                : item.actionName === "REVIEW_COMPLETE"
                ? "Review Complete"
                : item.actionName === "SEND_FOR_EDIT"
                ? "Send For Edit"
                : item.actionName === "RETIRE_INREVIEW"
                ? "Retire In Review"
                : item.actionName === "RETIRE_INAPPROVE"
                ? "Retire In Approve"
                : item.actionName === "RETIRE"
                ? "Retire"
                : "N/A",
            createdAt: new Date(item?.createdAt).toDateString(),
          })
        ),
        DocumentVersions: res?.data?.DocumentVersions.map((item: any) => ({
          ...item,
          issueNumber: item?.issueNumber,
          versionName: item?.versionName,
          approvedDate: new Date(item?.updatedAt).toDateString(),
          versionLink: (
            <div
              onClick={() => {
                openVersionDoc(item.id);
              }}
              style={{ textDecoration: "underline", cursor: "pointer" }}
            >
              Link
            </div>
          ),
        })),
        ReferenceDocuments: res?.data?.ReferenceDocuments?.map((item: any) => ({
          ...item,
          documentLink: (
            <a
              href={`http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/processdocuments/processdocument/viewprocessdocument/${item.documentId}`}
              target="_blank"
              rel="noreferrer"
            >
              Link
            </a>
          ),
        })),
      });
      setDownloadAccess(res?.data?.downloadAccess)
      if (res.status === 200 || res.status === 201) {
        setIsLoading(false);
      }
    } catch (err) {
      console.log("err inside 2", err);
      enqueueSnackbar(`Could not get Data, Check your internet connection`, {
        variant: "error",
      });
      setIsLoading(false);
    }
  };

  const isItemInDisableBtnFor = (disableBtnFor: any, item: any) => {
    return disableBtnFor.includes(item);
  };
  function isUserInApprovers(loggedInUser: any, approvers: any) {
    return approvers.some(
      (approver: any) => approver.email === loggedInUser.email
    );
  }

  const getUserOptions = async () => {
    try {
      setIsLoading(true);
      let res = await axios.get(
        `/api/documents/checkUserPermissions/${docViewDrawer?.data?.id}`
      );

      const disableBtnFor = ["In Review", "In Approval", "AMMEND"];
      const newItems = res?.data?.map((option: any, index: any) => {
        const disabled =
          isItemInDisableBtnFor(disableBtnFor, option) ||
          isUserInApprovers(loggedInUser, formData?.approvers);
        return { key: (index + 1).toString(), label: option, disabled };
      });
      setButtonOptions(
        newItems
          .filter(
            (item: any) =>
              item.label !== "Inline Edit" && item.label !== "Save as Draft"
          )
          .map((item: any) => item.label)
      );
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const getFavorite = async () => {
    await axios(
      `api/favorites/checkFavorite/${loggedInUser.id}/${docViewDrawer?.data?.id}`
    )
      .then((res) => setFavorite(res.data))
      .catch((err) => console.error(err));
  };

  const handleFavorite = async () => {
    await axios
      .put(`api/favorites/updateFavorite/${loggedInUser.id}`, {
        targetObjectId: docViewDrawer?.data?.id,
      })
      .then((res) => {
        console.log(res);
        getFavorite();
      })
      .catch((err) => console.error(err));
  };

  const handleCommentSubmit = async (value: string) => {
    setCommentsLoader(true);
    if (value) {
      try {
        let res = await axios.post("/api/documents/createComment", {
          documentId: docViewDrawer?.data.id,
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

  const getComments = async () => {
    setCommentsLoader(true);
    try {
      let res: any = await axios.get(
        `/api/documents/getCommentsForDocument/${docViewDrawer?.data.id}`
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

  const openVersionDoc = (id: any) => {
    navigate(
      `/processdocuments/processdocument/viewprocessdocument/${id}?version=true`
    );
  };

  const handleSubmit = async (option: string, submit = false) => {
    try {
      if (
        (DocStateIdentifier[option] === "IN_REVIEW" &&
          formData.reviewers.length === 0) ||
        !formData?.documentLinkNew
      ) {
        enqueueSnackbar("please edit this document and fill reqired field");
        return;
      }

      if (DocStateIdentifier[option] === "SEND_FOR_EDIT" && !submit) {
        setopenModalForComment(true);
        return;
      }
      setIsLoading(true);
      let res = await axios.post(
        `/api/documents/setStatus/${docViewDrawer?.data?.id}?status=${DocStateIdentifier[option]}`
      );

      //this sends mail and notification -- bug fix future
      // socket?.emit("documentUpdated", {
      //   data: { id: docViewDrawer?.data?.id },
      //   currentUser: `${loggedInUser.id}`,
      // });

      //Reload Inbox list if request is from path /inbox else navigate to /processdocument
      if (renderedFrom === "inbox") {
        // reloadList(true);
      } else {
        navigate("/processdocuments/processdocument");
      }
      if (res.status === 200 || res.status === 201) {
        toggleDocViewDrawer();
        handleFetchDocuments();
        setIsLoading(false);
        enqueueSnackbar(`${option} Successful`, { variant: "success" });
      }
    } catch (err: any) {
      enqueueSnackbar(`Request Failed ${err.response.status}`, {
        variant: "error",
      });
    }
  };

  const toggleInfoDrawer = (data: any = {}) => {
    setInfoDrawer({
      ...infoDrawer,
      open: !infoDrawer.open,
      data: { ...data },
    });
  };

  const toggleHistoryDrawer = (data: any = {}) => {
    setHistoryDrawer({
      ...historyDrawer,
      open: !historyDrawer.open,
      data: { ...data },
    });
  };
  const toggleCommentsDrawer = (data: any = {}) => {
    setCommentDrawer({
      ...commentDrawer,
      open: !commentDrawer.open,
      data: { ...data },
    });
  };

  const onMenuClick = (item: any) => {
    handleSubmit(item);
  };

  // const downloadDocument = () => {
  //   const url =
  //     `${process.env.REACT_APP_API_URL}/proxy/pdf?url=` +
  //     encodeURIComponent(formData.documentLinkNew);
  //   fetch(url)
  //     .then((response) => response.blob())
  //     .then((blob) => {
  //       saveAs(blob, formData.documentName + "." + formData.documentLinkNew.split(".").pop());
  //     })
  //     .catch((error) => console.error("Error fetching document:", error));
  // };

  const downloadDocument = async () => {
    if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
      const documentLink = formData.documentLinkNew;
      const response = await axios.post(
        `${API_LINK}/api/documents/documentOBJ`,
        { documentLink }
      );
      const buffer = response.data;
      const uint8Array = new Uint8Array(buffer.data);
      const blob = new Blob([uint8Array], { type: "application/octet-stream" });
      saveAs(blob, formData.documentName + "." + documentLink.split(".").pop());
    } else {
      const url =
        `${process.env.REACT_APP_API_URL}/proxy/pdf?url=` +
        encodeURIComponent(formData.documentLinkNew);
      fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          saveAs(
            blob,
            formData.documentName +
              "." +
              formData.documentLinkNew.split(".").pop()
          );
        })
        .catch((error) => console.error("Error fetching document:", error));
    }
  };

  const documentDownloadAccess = async () => {
    try {
      const isOrgAdmin = checkRoles("ORG-ADMIN");
      const isMr =
        checkRole("MR") && currentUser.locationId === formData.locationId;
      const isCreator = formData?.creators?.some(
        (item: any) => item.id === currentUser?.id
      );
      const isReviewer = formData?.reviewers?.some(
        (item: any) => item.id === currentUser?.id
      );
      const isApprover = formData?.approvers?.some(
        (item: any) => item.id === currentUser?.id
      );
      const deptHead = await axios.get(
        `${API_LINK}/api/entity/getEntityHead/byEntityId/${formData?.entityId}`
      );
      const isDeptHead = Array.isArray(deptHead?.data)
        ? deptHead?.data.some((item: any) => item.id === currentUser?.id)
        : false;

      const functionSpoc = await axios.get(
        `${API_LINK}/api/entity/getFunctionByLocation/${formData?.locationId}`
      );
      const isFunctionSpoc = Array.isArray(functionSpoc?.data)
        ? functionSpoc?.data?.some((item: any) =>
            item.functionSpoc.includes(currentUser?.id)
          )
        : false;

      if (
        isOrgAdmin ||
        isMr ||
        isCreator ||
        isReviewer ||
        isApprover ||
        isDeptHead ||
        isFunctionSpoc
      ) {
        setDownloadAccess(true);
      } else {
        setDownloadAccess(false);
      }
    } catch {
      setDownloadAccess(false);
    }
  };

  const openAceoffix = async (formData: any) => {
    let requiredDetails = {};
    let response = { data: formData.documentLinkNew };
    if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
      response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
        documentLink: formData.documentLinkNew,
      });
    }

    if (
      formData?.documentState === "DRAFT" ||
      formData?.documentState === "IN_REVIEW"
    ) {
      requiredDetails = {
        documentLink: response.data,
        title: formData.documentName,
        location: formData.locationName,
        system: formData.systemNames.map((item: any) => item.name).join(", "),
        issueNo: formData.issueNumber,
        revisionNo: formData.currentVersion,
        createdBy:
          formData.creators[0].firstname + " " + formData.creators[0].lastname,
        createdAt: await formatDate(formData.createdAt),
        status: formData.documentState,
        downloadAccess: downloadAccess,
      };
    }
    if (formData?.documentState === "IN_APPROVAL") {
      requiredDetails = {
        documentLink: response.data,
        title: formData.documentName,
        documentNo: formData.documentNumbering,
        location: formData.locationName,
        system: formData.systemNames.map((item: any) => item.name).join(", "),
        issueNo: formData.issueNumber,
        revisionNo: formData.currentVersion,
        createdBy:
          formData.creators[0].firstname + " " + formData.creators[0].lastname,
        createdAt: await formatDate(formData.createdAt),
        reviewedBy:
          formData.reviewers[0].firstname +
          " " +
          formData.reviewers[0].lastname,
        reviewedAt: await formatDate(formData.reviewers[0].updatedAt),
        status: formData.documentState,
        downloadAccess: downloadAccess,
      };
    }
    if (
      formData?.documentState === "PUBLISHED" ||
      formData?.documentState === "OBSOLETE"
    ) {
      requiredDetails = {
        documentLink: response.data,
        title: formData.documentName,
        documentNo: formData.documentNumbering,
        //documentNo: "BCD-REF1&2-UK-001",
        location: formData.locationName,
        system: formData.systemNames.map((item: any) => item.name).join(", "),
        issueNo: formData.issueNumber,
        revisionNo: formData.currentVersion,
        effectiveDate: await formatDate(formData.approvedDate),
        createdBy:
          formData.creators[0].firstname + " " + formData.creators[0].lastname,
        createdAt: await formatDate(formData.createdAt),
        reviewedBy:
          formData.reviewers[0].firstname +
          " " +
          formData.reviewers[0].lastname,
        reviewedAt: await formatDate(formData.reviewers[0].updatedAt),
        approvedBy:
          formData.approvers[0].firstname +
          " " +
          formData.approvers[0].lastname,
        approvedAt: await formatDate(formData.approvedDate),
        status: formData.documentState,
        downloadAccess: downloadAccess,
      };
    }
    const formDataJSON = JSON.stringify(requiredDetails);
    const encodedFormData = encodeURIComponent(formDataJSON);
    window.AceBrowser.openWindowModeless(
      process.env.REACT_APP_API_URL +
        "/aceoffix/view?formData=" +
        encodedFormData,
      "width=1200px;height=800px;"
    );
    // window.AceBrowser.openWindowModeless(
    //   "http://localhost:8082/view?formData=" + encodedFormData,
    //   "width=1200px;height=800px;"
    // );
  };

  const openAceoffixWithoutHeaderAndFooter = async (formData: any) => {
    let response = { data: formData.documentLinkNew };
    if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
      response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
        documentLink: formData.documentLinkNew,
      });
    }

    let requiredDetails = {
      documentLink: response.data,
      headerAndFooter: false,
      downloadAccess: downloadAccess,
      status: formData.documentState,
      title: formData.documentName,
    };

    const formDataJSON = JSON.stringify(requiredDetails);
    const encodedFormData = encodeURIComponent(formDataJSON);
    window.AceBrowser.openWindowModeless(
      process.env.REACT_APP_API_URL +
        "/aceoffix/view?formData=" +
        encodedFormData,
      "width=1200px;height=800px;"
    );
    // window.AceBrowser.openWindowModeless(
    //   "http://localhost:8082/view?formData=" + encodedFormData,
    //   "width=1200px;height=800px;"
    // );
  };

  const compareAceoffix = async (formData: any) => {
    let requiredDetails = {};
    let responsePrev: any = "";
    let responseCurr: any = "";

    if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
      responsePrev = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
        documentLink:
          formData.DocumentVersions[formData.DocumentVersions.length - 1]
            .documentLink,
      });
      responseCurr = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
        documentLink: formData.documentLinkNew,
      });
    } else {
      responsePrev = {
        data: formData.DocumentVersions[formData.DocumentVersions.length - 1]
          .documentLink,
      };
      responseCurr = { data: formData.documentLinkNew };
    }

    requiredDetails = {
      previousDocument: responsePrev.data,
      currentDocument: responseCurr.data,
    };
    const formDataJSON = JSON.stringify(requiredDetails);
    const encodedFormData = encodeURIComponent(formDataJSON);
    window.AceBrowser.openWindowModeless(
      process.env.REACT_APP_API_URL +
        "/aceoffix/compare?formData=" +
        encodedFormData,
      "width=1200px;height=800px;"
    );
  };

  const compareInterAceoffix = async (formData: any) => {
    let requiredDetails = {};
    let responsePrev: any = "";
    let responseCurr: any = "";
    if (formData.documentState === "IN_APPROVAL") {
      if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
        responsePrev = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
          documentLink: formData.versionInfo.find(
            (item: any) => item.type === "CREATOR"
          ).documentLink,
        });
        responseCurr = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
          documentLink: formData.versionInfo.find(
            (item: any) => item.type === "REVIEWER"
          ).documentLink,
        });
      } else {
        responsePrev = {
          data: formData.versionInfo.find(
            (item: any) => item.type === "CREATOR"
          ).documentLink,
        };
        responseCurr = {
          data: formData.versionInfo.find(
            (item: any) => item.type === "REVIEWER"
          ).documentLink,
        };
      }
    }
    if (formData.documentState === "PUBLISHED") {
      if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
        responsePrev = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
          documentLink: formData.versionInfo.find(
            (item: any) => item.type === "REVIEWER"
          ).documentLink,
        });
        responseCurr = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
          documentLink: formData.versionInfo.find(
            (item: any) => item.type === "APPROVER"
          ).documentLink,
        });
      } else {
        responsePrev = {
          data: formData.versionInfo.find(
            (item: any) => item.type === "REVIEWER"
          ).documentLink,
        };
        responseCurr = {
          data: formData.versionInfo.find(
            (item: any) => item.type === "APPROVER"
          ).documentLink,
        };
      }
    }
    requiredDetails = {
      previousDocument: responsePrev.data,
      currentDocument: responseCurr.data,
    };
    const formDataJSON = JSON.stringify(requiredDetails);
    const encodedFormData = encodeURIComponent(formDataJSON);
    window.AceBrowser.openWindowModeless(
      process.env.REACT_APP_API_URL +
        "/aceoffix/compare?formData=" +
        encodedFormData,
      "width=1200px;height=800px;"
    );
  };

  const formatDate = async (isoString: string) => {
    const date = new Date(isoString);

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // getUTCMonth() is zero-based
    const year = date.getUTCFullYear();

    return `${day}-${month}-${year}`;
  };

  const renderTag = (status: any) => {
    const statusInfo = statusMap[status];

    if (statusInfo) {
      return (
        <Tag
          style={{
            backgroundColor: statusInfo.backgroundColor,
            height: "30px",
            alignContent: "center",
          }}
          color={statusInfo.color}
          key={status}
          // className={classes?.statusTag}
        >
          {statusInfo.text}
        </Tag>
      );
    }

    return status;
  };
  return (
    <div>
      <div>
        <Drawer
          // title={!!docViewDrawer && docViewDrawer?.data?.documentName}
          placement="right"
          open={docViewDrawer.open}
          closable={true}
          onClose={toggleDocViewDrawer}
          className={classes.drawer}
          maskClosable={false}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{
                width: "36px",
                height: "38px",
                cursor: "pointer",
                margin: matches ? "12px" : "0px",
                padding: matches ? "0px" : "0px",
              }}
            />
          }
          width={isSmallScreen ? "85%" : "50%"}
          extra={
            <div style={{ display: "flex" }}>
              {/* {formData?.approvedDate !== null &&
                formData?.documentLink.endsWith(".docx") && (
                  <Tooltip title="Download">
                    <GetAppIcon
                      onClick={handleFavorite}
                      className={classes.downloadIcon}
                    />
                  </Tooltip>
                )} */}
              {downloadAccess && matches && (
                <Tooltip title="Download Document">
                  <GetAppIcon
                    onClick={downloadDocument}
                    className={classes.downloadIcon}
                    style={{
                      position: "relative",
                      top: "0px",
                      right: "-5px",
                      fontSize: "30px",
                      color: "#0E497A",
                      marginRight: matches ? "30px" : "5px",
                    }}
                  />
                </Tooltip>
              )}
              {process.env.REACT_APP_IS_ACEOFFIX === "true" &&
                (formData?.documentLink.toLowerCase().endsWith(".docx") ||
                  formData?.documentLink.toLowerCase().endsWith(".xlsx") ||
                  formData?.documentLink.toLowerCase().endsWith(".xls") ||
                  formData?.documentLink.toLowerCase().endsWith(".ppt") ||
                  formData?.documentLink.toLowerCase().endsWith(".pptx") ||
                  formData?.documentLink.toLowerCase().endsWith(".doc")) && (
                  <Tooltip title="Download Controlled Copy">
                    <span>
                      <ImDownload
                        onClick={() => openAceoffix(formData)}
                        className={classes.visibilityIcon}
                        style={{
                          padding: "4px 25px 0 0",
                          fontSize: "30px",
                          color: "#0E497A",
                        }}
                      />
                    </span>
                  </Tooltip>
                )}
              {process.env.REACT_APP_IS_ACEOFFIX === "true" &&
                (formData?.documentLink.toLowerCase().endsWith(".docx") ||
                  formData?.documentLink.toLowerCase().endsWith(".xlsx") ||
                  formData?.documentLink.toLowerCase().endsWith(".xls") ||
                  formData?.documentLink.toLowerCase().endsWith(".ppt") ||
                  formData?.documentLink.toLowerCase().endsWith(".pptx") ||
                  formData?.documentLink.toLowerCase().endsWith(".doc")) && (
                  <Tooltip title="View Document">
                    <VisibilityIcon
                      onClick={() =>
                        openAceoffixWithoutHeaderAndFooter(formData)
                      }
                      className={classes.visibilityIcon}
                      style={{
                        padding: "4px 25px 0 0",
                        fontSize: "30px",
                        color: "#0E497A",
                      }}
                    />
                  </Tooltip>
                )}
              {process.env.REACT_APP_IS_ACEOFFIX === "true" &&
                formData?.approvedDate !== null &&
                formData?.documentLink.endsWith(".docx") &&
                formData?.DocumentVersions.length !== 0 && (
                  <Tooltip title="COMPARE VERSIONS">
                    <CompareIcon
                      onClick={() => compareAceoffix(formData)}
                      className={classes.compareIcon}
                      style={{
                        padding: "4px 25px 0 0",
                        fontSize: "30px",
                        color: "#0E497A",
                      }}
                    />
                  </Tooltip>
                )}
              {process.env.REACT_APP_IS_ACEOFFIX === "true" &&
                formData?.documentLink.endsWith(".docx") &&
                (() => {
                  const status = formData?.documentState;
                  const creatorDocCode = formData?.versionInfo?.find(
                    (item: any) => item.type === "CREATOR"
                  )?.docCode;
                  const reviewerDocCode = formData?.versionInfo?.find(
                    (item: any) => item.type === "REVIEWER"
                  )?.docCode;
                  const approverDocCode = formData?.versionInfo?.find(
                    (item: any) => item.type === "APPROVER"
                  )?.docCode;
                  if (
                    (status === "IN_APPROVAL" &&
                      reviewerDocCode &&
                      creatorDocCode &&
                      reviewerDocCode !== undefined &&
                      reviewerDocCode !== "undefined" &&
                      creatorDocCode !== undefined &&
                      creatorDocCode !== "undefined" &&
                      reviewerDocCode !== creatorDocCode) ||
                    (status === "PUBLISHED" &&
                      approverDocCode &&
                      reviewerDocCode &&
                      approverDocCode !== undefined &&
                      approverDocCode !== "undefined" &&
                      reviewerDocCode !== undefined &&
                      reviewerDocCode !== "undefined" &&
                      approverDocCode !== reviewerDocCode)
                  ) {
                    return (
                      <Tooltip title="COMPARE FLOW">
                        <CompareArrowsIcon
                          onClick={() => compareInterAceoffix(formData)}
                          className={classes.compareIcon}
                          style={{
                            padding: "4px 25px 0 0",
                            fontSize: "30px",
                            color: "#0E497A",
                          }}
                        />
                      </Tooltip>
                    );
                  }
                })()}
              {favorite ? (
                <Tooltip title="Remove favorite">
                  <StarFilledIcon
                    onClick={handleFavorite}
                    className={classes.starIcon}
                    style={{ marginRight: matches ? "30px" : "5px" }}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Add favorite">
                  <StarIcon
                    onClick={handleFavorite}
                    className={classes.starIcon}
                    style={{ marginRight: matches ? "30px" : "5px" }}
                  />
                </Tooltip>
              )}
              <Tooltip title="View Creator,Reviewer(S) and Approver(S)">
                {/* <AuditTrailIcon
                    style={{ marginRight: "8px", cursor: "pointer" }}
                    onClick={toggleAuditTrailDrawer}
                  /> */}
                {/* <img
                    src={AuditTrailImageSvg}
                    alt="audit-trail"
                    onClick={togglePeopleDrawer}
                    className={classes.auditTrailIcon}
                  /> */}
                <PeopleIcon
                  onClick={togglePeopleDrawer}
                  className={classes.commentsIcon}
                  style={{ marginRight: matches ? "30px" : "5px" }}
                ></PeopleIcon>
              </Tooltip>
              <Tooltip title="Add/View Comments">
                <ChatIcon
                  className={classes.commentsIcon}
                  onClick={toggleCommentsDrawer}
                  style={{ marginRight: matches ? "30px" : "5px" }}
                />
              </Tooltip>
              <Tooltip title="View History">
                <HistoryIcon
                  className={classes.historyIcon}
                  onClick={toggleHistoryDrawer}
                  style={{ marginRight: matches ? "30px" : "5px" }}
                />
              </Tooltip>
              <Tooltip title="View Doc Details">
                <img
                  src={DocInfoIconImageSvg}
                  alt="doc-info"
                  onClick={toggleInfoDrawer}
                  className={classes.docInfoIcon}
                  style={{ marginRight: matches ? "30px" : "5px" }}
                />
              </Tooltip>
              {matches ? (
                <>
                  <Tooltip title="Expand View">
                    <img
                      src={ExpandIconImageSvg}
                      className={classes.expandIcon}
                      alt="expand=form"
                      onClick={() => {
                        if (docViewDrawer.data.isVersion) {
                          navigate(
                            `/processdocuments/viewdoc/${docViewDrawer?.data?.id}?versionId=${docViewDrawer.data.version}&version=true`
                          );
                        } else {
                          navigate(
                            `/processdocuments/viewdoc/${docViewDrawer?.data?.id}?versionId=${docViewDrawer.data.version}`
                          );
                        }
                      }}
                    />
                  </Tooltip>
                </>
              ) : (
                <></>
              )}

              {!docViewDrawer?.data?.isVersion && (
                <Space>
                  {/* <Dropdown
                    menu={{ items: buttonOptions, onClick: onMenuClick }}
                  >
                    <Button style={{ display: "flex", alignItems: "center" }}>
                      <span>Actions</span>
                      <ExpandMoreOutlinedIcon />
                    </Button>
                  </Dropdown> */}
                  <Button
                    onClick={handleClick}
                    style={{
                      display: matches ? "flex" : "none",
                      alignItems: "center",
                      padding: matches
                        ? "4px 12px 4px 12px"
                        : "0px 0px 0px 0px",
                    }}
                    disabled={buttonOptions?.length === 0}
                  >
                    <span>{"Actions"}</span>
                    <ExpandMoreOutlinedIcon
                      style={{
                        fill: `${
                          buttonOptions?.length === 0 ? "gray" : "#0e497a"
                        }`,
                      }}
                    />
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    {buttonOptions &&
                      buttonOptions.length > 0 &&
                      buttonOptions?.map((item: any, index: any) => (
                        <MenuItem
                          key={index + 1}
                          onClick={() => onMenuClick(item)}
                          disabled={
                            item === "In Approval" ||
                            item === "In Review" ||
                            item === "Amend" ||
                            item === "Retire" ||
                            item === "Review Retire" ||
                            item === "discard" ||
                            item === "Approve Retire"
                          }
                        >
                          {item}
                        </MenuItem>
                      ))}
                  </Menu>
                </Space>
              )}
            </div>
          }
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ whiteSpace: "pre-line" }}>
              {!!docViewDrawer && docViewDrawer?.data?.documentName}
            </p>
            <div>{renderTag(formData.documentState)}</div>
          </div>
          <>
            {isLoading ? (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </div>
            ) : (
              <div>
                <DocumentViewer
                  fileLink={!!formData && formData?.documentLinkNew}
                />
              </div>
            )}
          </>
          <div>
            {!!infoDrawer.open && (
              <InfoTopDrawer
                infoDrawer={infoDrawer}
                setInfoDrawer={setInfoDrawer}
                toggleInfoDrawer={toggleInfoDrawer}
                formData={!!formData && formData}
              />
            )}
          </div>
          <div>
            {!!historyDrawer.open && (
              <HistoryTopDrawer
                historyDrawer={historyDrawer}
                setHistoryDrawer={setHistoryDrawer}
                toggleHistoryDrawer={toggleHistoryDrawer}
                formData={formData}
              />
            )}
          </div>
          <div>
            {!!commentDrawer.open && (
              <CommentsDrawer
                commentDrawer={commentDrawer}
                setCommentDrawer={setCommentDrawer}
                toggleCommentsDrawer={toggleCommentsDrawer}
                formData={formData}
                handleCommentSubmit={handleCommentSubmit}
                commentData={comments}
                commentsLoader={commentsLoader}
                matches={matches}
              />
            )}
          </div>
          <div>
            {!!peopleDrawer.open && (
              <DocWorkflowTopDrawer
                peopleDrawer={peopleDrawer}
                setPeopleDrawer={setPeopleDrawer}
                togglePeopleDrawer={togglePeopleDrawer}
                formData={!!formData && formData}
              />
            )}
          </div>
        </Drawer>
      </div>
      <div>
        <Modal
          title={
            <>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "2px",
                }}
              >
                Enter Reason to Send for Edit ?
              </div>
              <div style={{ paddingTop: "10px" }}>
                <TextArea
                  rows={4}
                  onChange={(e) => {
                    setCommentValue(e.target.value);
                  }}
                  value={commnetValue}
                ></TextArea>
              </div>
            </>
          }
          // icon={<ErrorIcon />}
          open={openModalForComment}
          onOk={() => {}}
          onCancel={() => {
            // setOpenModal(false);
            setopenModalForComment(false);
          }}
          footer={[
            <Button
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={() => {
                setopenModalForComment(false);
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={async () => {
                await handleCommentSubmit(commnetValue);
                await handleSubmit("Send for Edit", true);
              }}
            >
              Submit
            </Button>,
          ]}
          // okText="Yes"
          okType="danger"
          // cancelText="No"
        />
      </div>
    </div>
  );
};

export default DocumentViewDrawer;
