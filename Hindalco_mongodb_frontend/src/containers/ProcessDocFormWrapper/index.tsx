import { Button, Paper, Menu, MenuItem } from "@material-ui/core";
import { useEffect, useState } from "react";
import useStyles from "./styles";
import { useNavigate } from "react-router-dom";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { useRecoilValue } from "recoil";
import { mobileView } from "../../recoil/atom";
import { IconButton, Tooltip } from "@material-ui/core";
import CustomButtonGroup from "../../components/CustomButtonGroup";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import FavoriteTwoToneIcon from "@material-ui/icons/FavoriteTwoTone";
import { useLocation, useParams } from "react-router-dom";
import { ReactComponent as StarIcon } from "assets/documentControl/Star.svg";
import { ReactComponent as StarFilledIcon } from "assets/documentControl/Star-Filled.svg";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
// import EditIcon from "@material-ui/icons/Edit";
import PeopleIcon from "@material-ui/icons/People";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import PeopleDrawer from "components/Document/CommonDrawerComponents/peopleDrawer";
import { ReactComponent as CustomEditIcon } from "assets/documentControl/Edit.svg";
import { Modal, Button as AntButton, Tag } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useMediaQuery } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import VisibilityIcon from "@material-ui/icons/Visibility";
import checkRoles from "utils/checkRoles";
import checkRole from "utils/checkRoles";
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";
import CompareArrowsIcon from "@material-ui/icons/CompareArrows";
import { API_LINK } from "config";
import { color } from "highcharts";
import { ImDownload } from "react-icons/im";

type Props = {
  parentPageLink: string;
  children: any;
  handleSubmit?: any;
  handleDiscard?: any;
  options?: any;
  docAccessType?: string;
  docState?: string;
  disableBtnFor?: string[];
  favorite: boolean;
  name?: string;
  formData?: any;
  showModel?: boolean;
  handleFavorite: () => void;
  handleEditDocument?: () => void;
  handleCommentSubmit?: any;
  openModalForComment?: any;
  setopenModalForComment?: any;
  handlerButtonStatus?: () => void;
};

function ProcessDocFormWrapper({
  children,
  parentPageLink,
  handleSubmit,
  handleDiscard,
  options,
  docAccessType,
  docState,
  disableBtnFor = [],
  favorite,
  formData,
  openModalForComment,
  setopenModalForComment,
  handleFavorite,
  handleCommentSubmit,
  name,
  handleEditDocument,
  handlerButtonStatus,
}: Props) {
  const classes = useStyles();
  const navigate = useNavigate();
  const mobView = useRecoilValue(mobileView);
  const [renderedFrom, setRenderedFrom] = useState<string>("");
  const params = useParams();
  const [commnetValue, setCommentValue] = useState("");
  const [downloadAccess, setDownloadAccess] = useState<boolean>(false);

  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState("");
  const [peopleDrawer, setPeopleDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const togglePeopleDrawer = (data: any = {}) => {
    setPeopleDrawer({
      ...peopleDrawer,
      open: !peopleDrawer.open,
      data: { ...data },
    });
  };

  const matches = useMediaQuery("(min-width:786px)");
  const currentUser = getSessionStorage();

  useEffect(() => {
    documentDownloadAccess();
  }, [formData]);
  useEffect(() => {
    if (location.pathname.toLowerCase().includes("/inbox")) {
      setRenderedFrom("inbox");
    } else if (
      location.pathname
        .toLowerCase()
        .includes("/processdocuments/processdocument/viewprocessdocument")
    ) {
      setRenderedFrom("process");
    }
  }, [location, params]);

  const handleActionClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onMenuClick = (e: any) => {
    handleSubmit(e);
  };

  const handleClick = () => {
    // URL to open in the new tab
    const url = "http://localhost:9003/Index.html";

    // Open the URL in a new tab
    window.open(url, "_blank");
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
  const renderTag = (status: any) => {
    const statusInfo = statusMap[status];

    if (statusInfo) {
      return (
        <Tag
          style={{ backgroundColor: statusInfo.backgroundColor }}
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
  const openAceoffix = async (formData: any) => {
    let requiredDetails = {};
    let downloadAccess = true;
    const isOrgAdmin = checkRoles("ORG-ADMIN");
    const isMr =
      checkRole("MR") && currentUser.locationId === formData.locationId;
    const isCreator = formData.creators.some(
      (item: any) => item.id === currentUser.id
    );
    const isReviewer = formData.reviewers.some(
      (item: any) => item.id === currentUser.id
    );
    const isApprover = formData.approvers.some(
      (item: any) => item.id === currentUser.id
    );
    let response = { data: formData.documentLinkNew };
    if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
      response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
        documentLink: formData.documentLinkNew,
      });
    }

    if (isOrgAdmin || isMr || isCreator || isReviewer || isApprover) {
      downloadAccess = true;
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
  const openAceoffixNew = async (formData: any) => {
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

  const compareInterAceoffix = async (formData: any) => {
    let requiredDetails = {};
    let responsePrev: any = "";
    let responseCurr: any = "";
    if (formData.documentState === "IN_APPROVAL") {
      responsePrev = await axios.post(`/api/documents/viewerOBJ`, {
        documentLink: formData.versionInfo.find(
          (item: any) => item.type === "CREATOR"
        ).documentLink,
      });
      responseCurr = await axios.post(`/api/documents/viewerOBJ`, {
        documentLink: formData.versionInfo.find(
          (item: any) => item.type === "REVIEWER"
        ).documentLink,
      });
    }
    if (formData.documentState === "PUBLISHED") {
      responsePrev = await axios.post(`/api/documents/viewerOBJ`, {
        documentLink: formData.versionInfo.find(
          (item: any) => item.type === "REVIEWER"
        ).documentLink,
      });
      responseCurr = await axios.post(`/api/documents/viewerOBJ`, {
        documentLink: formData.versionInfo.find(
          (item: any) => item.type === "APPROVER"
        ).documentLink,
      });
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

  if (mobView) {
    return (
      <Paper elevation={0} className={classes.paper}>
        <div className={classes.headerMobile}>
          {renderedFrom === "inbox" ? (
            <div style={{ marginTop: 15 }}>{name}</div>
          ) : (
            <Button
              data-testid="single-form-wrapper-button"
              onClick={() => {
                navigate(parentPageLink);
              }}
              className={classes.btn}
            >
              <ChevronLeftIcon fontSize="small" />
              Back
            </Button>
          )}
          <IconButton onClick={handleEditDocument}>
            <Tooltip title="Edit Document">
              <CustomEditIcon
                // onClick={handleFavorite}
                className={classes.starIcon}
                style={{ marginRight: matches ? "30px" : "0px" }}
              />
            </Tooltip>
          </IconButton>

          <Tooltip title="View Creator,Reviewer(S) and Approver(S)">
            <PeopleIcon
              onClick={togglePeopleDrawer}
              className={classes.commentsIcon}
              style={{ marginRight: matches ? "30px" : "0px" }}
            ></PeopleIcon>
          </Tooltip>

          <IconButton onClick={handleFavorite}>
            {favorite ? (
              <Tooltip title="Remove favorite">
                <StarFilledIcon
                  // onClick={handleFavorite}
                  className={classes.starIcon}
                  style={{ marginRight: matches ? "30px" : "0px" }}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Add favorite">
                <StarIcon
                  // onClick={handleFavorite}
                  className={classes.starIcon}
                  style={{ marginRight: matches ? "30px" : "0px" }}
                />
              </Tooltip>
            )}
          </IconButton>
          {process.env.REACT_APP_IS_ACEOFFIX === "true" && (
            <IconButton
              // onClick={handleFavorite}
              // style={{
              //   paddingLeft: matches ? "12px" : "6px",
              //   paddingRight: matches ? "12px" : "6px",
              // }}
            >
              {formData?.documentLink &&
                (formData?.documentLink.toLowerCase().endsWith(".docx") ||
                  formData?.documentLink.toLowerCase().endsWith(".xlsx") ||
                  formData?.documentLink.toLowerCase().endsWith(".xls") ||
                  formData?.documentLink.toLowerCase().endsWith(".ppt") ||
                  formData?.documentLink.toLowerCase().endsWith(".pptx") ||
                  formData?.documentLink.toLowerCase().endsWith(".doc")) && (
                  <Tooltip title="Download Controlled Copy">
                    <span>
                      <ImDownload
                        onClick={() => openAceoffixNew(formData)}
                        className={classes.imIcon}
                        style={{ marginRight: matches ? "30px" : "0px" }}
                      />
                    </span>
                  </Tooltip>
                )}
            </IconButton>
          )}
          {docState && (
            // <div className={classes.formInfoSectionMobile}>
            //   {`Document State : ${docState}`}
            // </div>
            <div className={classes.formInfoSectionMobile}>
              {renderTag(formData.documentState)}
            </div>
          )}
          {docAccessType && (
            <div className={classes.formInfoSectionMobile}>
              {`Document Access : ${docAccessType}`}
            </div>
          )}
        </div>
        <div className={classes.formContainer}>{children}</div>
        <div className={classes.mobViewBtnSection}>
          <CustomButtonGroup
            options={options}
            handleSubmit={handleSubmit}
            disableBtnFor={disableBtnFor}
          />
        </div>
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={0} className={classes.paper}>
        <div className={classes.header}>
          {renderedFrom === "inbox" ? (
            <>
              {matches ? (
                <div
                  style={{
                    marginTop: 15,
                    paddingLeft: matches ? "10px" : "0px",
                  }}
                >
                  <strong>{name}</strong>
                </div>
              ) : (
                ""
              )}
            </>
          ) : (
            <Button
              data-testid="single-form-wrapper-button"
              onClick={() => {
                navigate(parentPageLink);
              }}
              className={classes.btn}
            >
              <ChevronLeftIcon fontSize="small" />
              Back
            </Button>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginRight: "10px",
              gap: matches ? "0px" : "3px",
            }}
          >
            {matches ? (
              <>
                <IconButton onClick={handleEditDocument}>
                  <Tooltip title="Edit Document">
                    <CustomEditIcon
                      onClick={handleEditDocument}
                      // className={classes.starIcon}
                    />
                  </Tooltip>
                </IconButton>
              </>
            ) : (
              <></>
            )}
            <IconButton
              style={{
                paddingLeft: matches ? "12px" : "6px",
                paddingRight: matches ? "12px" : "6px",
              }}
            >
              <Tooltip title="View Creator,Reviewer(S) and Approver(S)">
                <PeopleIcon
                  onClick={togglePeopleDrawer}
                  className={classes.commentsIcon}
                  style={{ marginRight: matches ? "30px" : "0px" }}
                ></PeopleIcon>
              </Tooltip>
            </IconButton>
            {process.env.REACT_APP_IS_ACEOFFIX === "true" &&
              (formData?.documentLink.toLowerCase().endsWith(".docx") ||
                formData?.documentLink.toLowerCase().endsWith(".xlsx") ||
                formData?.documentLink.toLowerCase().endsWith(".xls") ||
                formData?.documentLink.toLowerCase().endsWith(".ppt") ||
                formData?.documentLink.toLowerCase().endsWith(".pptx") ||
                formData?.documentLink.toLowerCase().endsWith(".doc")) && (
                <Tooltip title="VIEW DOCUMENT">
                  <VisibilityIcon
                    onClick={() => openAceoffix(formData)}
                    className={classes.visibilityIcon}
                    style={{
                      fontSize: "30px",
                      color: "#0E497A",
                    }}
                  />
                </Tooltip>
              )}
            {/* {(process.env.REACT_APP_IS_ACEOFFIX === "true") && (formData?.documentLink.endsWith(".docx")) && (
              (() => {
                const status = formData?.documentState;
                const creatorDocCode = formData?.versionInfo?.find((item: any) => item.type === "CREATOR")?.docCode;
                const reviewerDocCode = formData?.versionInfo?.find((item: any) => item.type === "REVIEWER")?.docCode;
                const approverDocCode = formData?.versionInfo?.find((item: any) => item.type === "APPROVER")?.docCode;
                if ((status === "IN_APPROVAL" && reviewerDocCode !== creatorDocCode) ||
                  (status === "PUBLISHED" && approverDocCode !== reviewerDocCode)) {
                  return (
                    <Tooltip title="COMPARE">
                      <CompareArrowsIcon
                        onClick={() => compareInterAceoffix(formData)}
                        className={classes.compareIcon}
                        style={{
                          fontSize: "30px",
                          color: "#0E497A",
                          marginLeft: "10px"
                        }}
                      />
                    </Tooltip>
                  )
                }
              }
              )())} */}
            <IconButton
              onClick={handleFavorite}
              style={{
                paddingLeft: matches ? "12px" : "6px",
                paddingRight: matches ? "12px" : "6px",
              }}
            >
              {favorite ? (
                <Tooltip title="Remove favorite">
                  <StarFilledIcon
                    // onClick={handleFavorite}
                    className={classes.starIcon}
                    style={{ marginRight: matches ? "30px" : "0px" }}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Add favorite">
                  <StarBorderIcon
                    style={{
                      marginRight: matches ? "30px" : "0px",
                      width: "32px",
                      height: "35px",
                      cursor: "pointer",
                    }}
                  />
                </Tooltip>
              )}
            </IconButton>

            {process.env.REACT_APP_IS_ACEOFFIX === "true" && (
              <IconButton
                // onClick={handleFavorite}
                style={{
                  paddingLeft: matches ? "12px" : "6px",
                  paddingRight: matches ? "12px" : "6px",
                }}
              >
                {formData?.documentLink &&
                  (formData?.documentLink.toLowerCase().endsWith(".docx") ||
                    formData?.documentLink.toLowerCase().endsWith(".xlsx") ||
                    formData?.documentLink.toLowerCase().endsWith(".xls") ||
                    formData?.documentLink.toLowerCase().endsWith(".ppt") ||
                    formData?.documentLink.toLowerCase().endsWith(".pptx") ||
                    formData?.documentLink.toLowerCase().endsWith(".doc")) && (
                    <Tooltip title="Download Controlled Copy">
                      <span>
                        <ImDownload
                          onClick={() => openAceoffixNew(formData)}
                          className={classes.imIcon}
                          style={{ marginRight: matches ? "30px" : "0px" }}
                        />
                      </span>
                    </Tooltip>
                  )}
              </IconButton>
            )}

            {matches ? (
              <></>
            ) : (
              <>
                <IconButton onClick={handlerButtonStatus}>
                  <InfoIcon />
                </IconButton>
              </>
            )}
            {docState && (
              <div
                className={classes.formInfoSection}
                style={{
                  color: statusMap[docState].color,
                  backgroundColor: statusMap[docState].backgroundColor,
                }}
              >
                {" "}
                {statusMap[docState].text}
              </div>
            )}
            {docAccessType && (
              <div className={classes.formInfoSection}>
                {`Document Access : ${docAccessType}`}
              </div>
            )}
            <Button
              onClick={handleActionClick}
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #0E497A",
              }}
              disabled={options?.length === 0}
            >
              <span>{selectedItem || "Actions"}</span>
              <ExpandMoreOutlinedIcon
                style={{
                  fill: `${options?.length === 0 ? "gray" : "#0e497a"}`,
                }}
              />
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              // transformOrigin={{
              //   vertical: "bottom",
              //   horizontal: "center",
              // }}
            >
              {options &&
                options.length &&
                options
                  ?.filter(
                    (item: any) =>
                      item !== "Inline Edit" && item !== "Save as Draft"
                  )
                  .map((item: any, index: any) => (
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
            {/* <CustomButtonGroup
            options={options}
            handleSubmit={handleSubmit}
            disableBtnFor={disableBtnFor}
          /> */}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ width: "50%", position: "absolute", top: 0, right: 0 }}>
            {!!peopleDrawer.open && (
              <PeopleDrawer
                peopleDrawer={peopleDrawer}
                setPeopleDrawer={setPeopleDrawer}
                togglePeopleDrawer={togglePeopleDrawer}
                formData={!!formData && formData}
              />
            )}
          </div>
        </div>
        <div className={classes.formContainer}>{children}</div>
      </Paper>
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
                Enter Reason for Send for Edit ?
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
          onOk={() => setopenModalForComment(false)}
          onCancel={() => {
            // setOpenModal(false);
            setopenModalForComment(false);
          }}
          footer={[
            <AntButton
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={() => {
                setopenModalForComment(false);
              }}
            >
              Cancel
            </AntButton>,
            <AntButton
              key="submit"
              type="primary"
              style={{ backgroundColor: "#003059" }}
              onClick={async () => {
                await handleCommentSubmit(commnetValue);
                await handleSubmit("Send for Edit", true);
                // setEditTrue(false);
              }}
            >
              Submit
            </AntButton>,
          ]}
          // okText="Yes"
          okType="danger"
          // cancelText="No"
        />
      </div>
    </>
  );
}

export default ProcessDocFormWrapper;
