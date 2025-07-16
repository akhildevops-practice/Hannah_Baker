//react, reactrouter
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

//antd
import { Tabs, Drawer, Space, Button, Tooltip } from "antd";

//material-ui
import {
  Menu,
  MenuItem,
  useMediaQuery,
  CircularProgress,
} from "@material-ui/core";
import ChatIcon from "@material-ui/icons/Chat";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";

//utils
import axios from "apis/axios.global";
import { API_LINK } from "config";
import getAppUrl from "utils/getAppUrl";
import checkRoles from "utils/checkRoles";
import getSessionStorage from "utils/getSessionStorage";

//styles
import useStyles from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactRegisterDrawer/styles";
import "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactRegisterDrawer/drawer.css";

//components
import AttachmetsTab from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactRegisterDrawer/AttachmentsTab";
import PreMitigationScoreModal from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactRegisterDrawer/PreMitigationScoreModal";
import CommentsDrawer from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactRegisterDrawer/CommentsDrawer";
import CreateRiskFormTab from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactRegisterDrawer/CreateRiskFormTab";
import InfoTopDrawer from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactRegisterDrawer/InfoTopDrawer";
import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";

//thirdparty libraries
import { useSnackbar } from "notistack";
import moment from "moment";

//assets
import DocInfoIconImageSvg from "assets/documentControl/Info.svg";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import getYearFormat from "utils/getYearFormat";
import { useRecoilState } from "recoil";
import { referencesData } from "recoil/atom";

type Props = {
  addModalOpen?: any;
  setAddModalOpen?: any;
  fetchRisks?: any;
  riskId?: any;
  formType?: string;
  fetchAspImps?: any;
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

const AspectImpactDrawer = ({
  addModalOpen,
  setAddModalOpen,
  fetchRisks,
  riskId,
  formType,
  fetchAspImps,
 
}: Props) => {
  let isLocAdmin = checkRoles("LOCATION-ADMIN");
  let isOrgAdmin = checkRoles("ORG-ADMIN");
  let isAuditor = checkRoles("AUDITOR");
  let isMR = checkRoles("MR");
  const orgId = sessionStorage.getItem("orgId");
  const params = useParams();
  const userDetails = getSessionStorage();
  const realmName = getAppUrl();
  const [formData, setFormData] = useState<any>({

    // assesmentTeam: [],
  });
  const [existingRiskConfig, setExistingRiskConfig] = useState<any>(null);
  const [activityNew, setActivityNew] = useState("");
  const [riskImpactNew, setRiskImpactNew] = useState("");
  const [identityDateNew, setIdentityDateNew] = useState<any>("");
  const [referencesNew, setReferencesNew] = useState<any>([]);
  const [riskForm, setRiskForm] = useState<any>();
  const [riskRegisterData, setRiskRegisterData] = useState<any>([]);

  const avatarUrl = userDetails.avatar
    ? `${API_LINK}/${userDetails.avatar}`
    : "";

  const [isLoading, setIsLoading] = useState<any>(false);

  const [commentsLoader, setCommentsLoader] = useState(false);
  const [comments, setComments] = useState<any>([]);
  const [commentText, setCommentText] = useState<any>("");

  const [preMitigation, setPreMitigation] = useState<any>([]);
  const [preScore, setPreScore] = useState<any>(0);
  const [postMitigation, setPostMitigation] = useState<any>([]);
  const [postScore, setPostScore] = useState<any>(0);

  const [scoreData, setScoreData] = useState<any>([]);
  const [isPreOrPost, setIsPreOrPost] = useState<any>("");
  const [score, setScore] = useState<any>(0);

  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  const [items, setItems] = useState<any>(["Save", "Send For Review"]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedActionItem, setSelectedActionItem] = useState<any>(null);

  //to store severity and probablity, it will be like [3,5] first index is severity and probablity
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [preSeverity, setPreSeverity] = useState<any>(0);
  const [preProbability, setPreProbability] = useState<any>(0);
  const [selectedEntityForDeptHead, setSelectedEntityForDeptHead] =
    useState<any>("");
  const [entityOptionsForDeptHead, setEntityOptionsForDeptHead] = useState<any>(
    []
  );

  const [commentDrawer, setCommentDrawer] = useState<any>({
    open: false,
    mode: formType,
    data: {
      riskId: riskId,
    },
  });

  const [drawer, setDrawer] = useState<any>({
    mode: !!riskId ? "edit" : "create",
    open: addModalOpen,
    data: {
      id: riskId,
    },
  });

  const [infoDrawer, setInfoDrawer] = useState<any>({
    open: false,
    data: existingRiskConfig || {},
  });

  const [reviewerOptions, setReviewerOptions] = useState<any>([]);
  const [approverOptions, setApproverOptions] = useState<any>([]);
  const [locationWiseUsers, setLocationWiseUsers] = useState<any>([]);
  const [fileList, setFileList] = useState<any>([]);
  const [existingUploadedFiles, setExistingUploadedFiles] = useState<any>([]);
  const [isDataLoading, SetIsDataLoading] = useState<any>(true);
  const [preMitigationScoreModal, setPreMitigationScoreModal] = useState<any>({
    open: false,
    mode: formType,
    data: {},
  });
  const [levelColor, setLevelColor] = useState<any>("yellow");
  const [disableJobTitle, setDisableJobTitle] = useState<any>(false); //should be set to true if selected job title is there or its an edit form

  //disable whole form if logged in user is not from the same department
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [isAspImpInWorkflow, setIsAspImpInWorkflow] = useState<any>(false);
  const [isSubmitting, setIsSubmitting] = useState<any>(false); // Add this line to manage submission state
  // const [disableJobTitle, setDisableJobTitle] = useState<any>(false); //should be set to true if selected job title is there or its an edit form
  const location = useLocation();

  const [refsData] = useRecoilState(referencesData);

  const handleRiskFormCreated = (form: any) => {
    setRiskForm(form);
  };

  const url = "/api/aspect-impact";


  // useEffect(() => {
  //   console.log("checkriske riskregisterdata", riskRegisterData);
  // }, [riskRegisterData]);
  // console.log("checkrisk riskregisterdata", riskRegisterData);

  useEffect(() => {

    fetchAspImpConfig();

    fetchUsersByLocation();
    fetchingReviewerList();
    fetchApproverList();
    // console.log("checkrisk existingRiskConfig", existingRiskConfig, infoDrawer);
    if (!!riskId) {
      // console.log("checkrisk riskId in drawer", riskId);

      fetchRiskById();
      setDisableJobTitle(true);
    } else {
      loadDatainRiskMatrix();
      // setDisableJobTitle(false);
    }

    if (!!location) {
      if (
        location?.pathname?.includes("/review") ||
        location?.pathname?.includes("/revisionHistory") 
      ) {
        setIsFormDisabled(true);
        setIsAspImpInWorkflow(true);
      } else if(location?.pathname?.includes("/dashboard")){
        setIsFormDisabled(true);
        setIsAspImpInWorkflow(false);
      }
    }
  }, [riskId, addModalOpen]);

  useEffect(() => {
    if (
      !!reviewerOptions?.length &&
      !!approverOptions?.length &&
      !!locationWiseUsers?.length
    ) {
      SetIsDataLoading(false);
    }
  }, [reviewerOptions, approverOptions, locationWiseUsers]);

  useEffect(() => {
    console.log("checkrisk selectedCell in drawer", selectedCell);
    if (!!selectedCell && selectedCell?.length === 2) {
      setPreSeverity(selectedCell[0] + 1);
      setPreProbability(selectedCell[1] + 1);
    }
  }, [selectedCell]);

  useEffect(() => {
    console.log(
      "checkrisk preSeverity, preProbability in drawer",
      preSeverity,
      preProbability
    );
    console.log("checkrisk CHECK PRESCORE", preScore);
  }, [preSeverity, preProbability]);

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
            res.data.map((item: any) => ({
              ...item,
              label: item?.entityName,
              value: item?.id,
            }))
          );
        } else {
          setEntityOptionsForDeptHead([]);
        }
      } else {
        setEntityOptionsForDeptHead([]);
      }
    } catch (error) {
      console.log("error in checkIfUserIsMultiDeptHead-->", error);
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
  const handleCommentSubmit = async (commentText: any) => {
    try {
      if (!commentText) return; // if comment text is empty, do nothing

      if (commentDrawer?.mode === "edit") {
        const newComment = {
          name: userDetails.firstname + " " + userDetails.lastname,
          comment: commentText,
          userId: userDetails.id,
          riskId: commentDrawer?.data?.riskId,
        };
        // console.log("checkrisk in drawer edit mode ->>", newComment);

        postComment(newComment);
        // add the new comment to the comments array
        setComments((prevComments: any) => [
          ...prevComments,
          { ...newComment, avatarUrl: avatarUrl },
        ]);
      } else {
        const newComment = {
          name: userDetails.firstname + " " + userDetails.lastname,
          comment: commentText,
          userId: userDetails.id,
          riskId: "",
        };

        // console.log("checkrisk in drawer create mode ->>", newComment);
        // postComment(newComment);
        // add the new comment to the comments array
        setComments((prevComments: any) => [
          ...prevComments,
          { ...newComment, avatarUrl: avatarUrl },
        ]);
      }

      setCommentText(""); // clear the input field
    } catch (error) {
      // console.log("error in adding comment");
    }
  };

  const postComment = async (newComment: any) => {
    try {
      const res = await axios.post(`${url}/addcomment`, newComment);
      // console.log(res);
    } catch (error) {
      // console.log(error);
    }
  };

  const postCommentsInBulk = async (comments: any) => {
    try {
      // console.log("checkrisk comments in postcommentsInBulk --->", comments);

      const res = await axios.post(`${url}/addcommentsbulk`, comments);
    } catch (error) {
      // console.log("errror in posting comments in bulk", error);
    }
  };

  const loadDatainRiskMatrix = () => {
    const hiraMatrixData = existingRiskConfig?.hiraMatrixData;
    let newPreMitigation = [...preMitigation],
      newPostMitigation = [...postMitigation];

    if (!!hiraMatrixData && !!hiraMatrixData.length) {
      newPreMitigation = [...newPreMitigation, ...hiraMatrixData];
      newPostMitigation = [...newPostMitigation, ...hiraMatrixData];
      setPreMitigation(newPreMitigation);
      setPostMitigation(newPostMitigation);
    }
  };

  const filterActionItems = (status: any, data: any) => {
    // console.log("checkrisk status in filterActionItems", status);

    if (status === "OPEN") {
      setItems(["Save", "Send For Review"]);
    } else if (status === "IN REVIEW") {
      // console.log(
      //   "checkrisk in review status userDetails?.id ",
      //   userDetails?.id,
      //   data?.riskReviewers?.id
      // );

      if (userDetails?.id === data?.riskReviewers?.id) {
        setItems(["Send For Edit", "Review Complete"]);
      } else setItems([]);
    } else if (status === "REVIEW COMPLETE") {
      setItems(["Send For Edit", "Send For Approval"]);
    } else if (status === "IN APPROVAL") {
      // console.log(
      //   "checkrisk in approver status userDetails?.id ",
      //   userDetails?.id,
      //   data?.riskApprovers?.id
      // );
      if (userDetails?.id === data?.riskApprovers?.id) {
        setItems(["Send For Edit", "Approve"]);
      } else setItems([]);
    } else if (status === "APPROVED") {
      setItems(["Send For Edit"]);
    }
  };

  const fetchRiskById = async () => {
    try {
      // console.log("checkrisk fetchreiskbyid called");

      const res = await axios.get(`/api/aspect-impact/${riskId}`);
      setIsLoading(true);
      SetIsDataLoading(true);
      if (res.status === 200 || res.status === 201) {
        setRiskRegisterData(res.data);

        setFormData({
          ...formData,
          interestedParties:
            res.data?.interestedParties?.map((item: any) => ({
              ...item,
              value: item._id,
              label: item.name,
            })) || [],
          assesmentTeam: res.data.assesmentTeam || [],
          riskReviewers: res.data?.reviewers || undefined,
          riskApprovers: res.data?.approvers || undefined,
        });
        if (res.data?.attachments?.length > 0) {
          setExistingUploadedFiles(res?.data?.attachments);
          setFileList(res?.data?.attachments);
        }

        if (res?.data?.entity?.id) {
          if (res?.data?.entity?.id !== userDetails?.entity?.id) {
            setIsFormDisabled(true);
          }
        }

        if (res?.data?.status === "inWorkflow") {
          setIsFormDisabled(true);
          setIsAspImpInWorkflow(true);
        }

        const data = {
          riskReviewers: res.data?.reviewers || undefined,
          riskApprovers: res.data?.approvers || undefined,
        };

        filterActionItems(res.data.status, data);

        //add preMitigation array if premitigation exists otherwise add hiraMatrixData data in premitigation
        if (!!res.data.preMitigation && !!res.data.preMitigation.length) {
          setPreMitigation([...res.data.preMitigation]);
          setPreScore(res.data.preMitigationScore);
          // console.log("checkrisk pre score", res.data.preMitigationScore);
        } else {
          const hiraMatrixData = res.data.riskConfigData?.hiraMatrixData;
          let newPreMitigation = [...preMitigation];
          if (!!hiraMatrixData && !!hiraMatrixData.length) {
            newPreMitigation = [...newPreMitigation, ...hiraMatrixData];
          }
          setPreMitigation(newPreMitigation);
        }
        //add postmitigation array if postmitigation exists otherwise add cumulative data in postmitigation

        // if (!!res.data.postMitigation && !!res.data.postMitigation.length) {
        //   setPostMitigation([...res.data.postMitigation]);

        //   setPostScore(res.data.postMitigationScore);
        // } else {
        //   const cumulativeData = res.data.riskConfigData?.riskCumulative;
        //   let newPostMitigation = [...postMitigation];
        //   if (!!cumulativeData && !!cumulativeData.length) {
        //     newPostMitigation = [...newPostMitigation, ...cumulativeData];
        //   }
        //   setPostMitigation(newPostMitigation);
        // }
        if (
          !!res.data &&
          !!res.data?.preProbability &&
          !!res.data?.preSeverity
        ) {
          setSelectedCell([
            res.data?.preSeverity - 1,
            res.data?.preProbability - 1,
          ]);
        }
        //  if (
        //   !!res.data &&
        //   !!res.data?.postProbability &&
        //   !!res.data?.postSeverity
        // ) {
        //   setSelectedCell([
        //     res.data?.postSeverity - 1,
        //     res.data?.postProbability - 1,
        //   ]);
        // }
        setIsLoading(false);
        SetIsDataLoading(false);
      } else {
        setIsLoading(false);
        SetIsDataLoading(false);
        enqueueSnackbar("Error in fetching registered risk data", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("error", error);
    }
  };

  const fetchingReviewerList = async () => {
    try {
      // const encodedValue = encodeURIComponent(value);
      const res = await axios.get(`/api/roles/workFlowDistributionReviewer`);
      // console.log("fetch reviwer list", res);

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
        }));
        setReviewerOptions(userOptions);
        return userOptions;
      } else {
        setReviewerOptions([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchApproverList = async () => {
    try {
      // const encodedValue = encodeURIComponent(value);
      const res = await axios.get(`/api/roles/workFlowDistributionApprover`);

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
        }));
        setApproverOptions(userOptions);
        return userOptions;
      } else {
        setApproverOptions([]);
      }
    } catch (error) {
      // console.log(error);
    }
  };

  const fetchUsersByLocation = async () => {
    const locationId = userDetails.locationId || "";
    try {
      setIsLoading(true);
      const res = await axios.get(`${url}/users/${locationId}`);
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
          }));
          setLocationWiseUsers(userOptions);
          setIsLoading(false);
        } else {
          setLocationWiseUsers([]);
          setIsLoading(false);
        }
      } else {
        setLocationWiseUsers([]);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      // console.log("errror in fetching users based on location", error);
    }
  };

  const getPrefixSuffix = async (moduleType: any) => {
    try {
      const response = await axios.get(
        `/api/serial-number/generateSerialNumber?moduleType=${moduleType}&location=${
          isOrgAdmin ? "" : userDetails.location.id
        }&createdBy=${userDetails?.id}&organizationId=${orgId}`
      );

      const generatedValue = response.data;
      // console.log("generatedValue", generatedValue);
      // Get the current month and year
      const currentDate = new Date();
      const currentMonth = (currentDate.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      const currentYear = currentDate.getFullYear().toString().slice(-2);
      const LocationId = userDetails?.location?.locationId;
      const EntityId = userDetails?.entity?.entityId;
      // Replace all instances of "MM" with currentMonth
      const transformedValue = generatedValue
        .split("MM")
        .join(currentMonth)
        .split("YY")
        .join(currentYear)
        .split("LocationId")
        .join(isOrgAdmin ? "N/A" : LocationId)
        .split("DepartmentId")
        .join(isOrgAdmin ? "MCOE Department" : EntityId);

      // console.log("checkrisk prefixsuffix", transformedValue);

      return transformedValue;
    } catch (error) {}
  };

  const onChange = (key: string) => {
    // console.log(key);
  };

  const clearStates = () => {
    setAddModalOpen(false);
    setActivityNew("");
    setRiskImpactNew("");
    setIdentityDateNew("");
  };



  const handleCloseModal = () => {

    setAddModalOpen(false);
  };

  const toggleInfoDrawer = (data: any = {}) => {
    console.log("checkrisk data in toggleinfor drawer--->", riskRegisterData);

    setInfoDrawer({
      ...infoDrawer,
      open: !infoDrawer.open,
      data: { ...data },
    });
  };

  const toggleCommentsDrawer = (data: any = {}) => {
    // console.log("checkrisk in toggleCommentsDrawer", data);

    setCommentDrawer({
      ...commentDrawer,
      open: !commentDrawer.open,
      data: { ...data },
    });
  };

  const toggleScoreModal = () => {
    setPreMitigationScoreModal({
      ...preMitigationScoreModal,
      open: !preMitigationScoreModal.open,
    });
  };

  const tabs = [
    {
      label: "Aspect Impact Details",
      key: 1,
      children: (
        <CreateRiskFormTab
          addModalOpen={addModalOpen}
          setAddModalOpen={setAddModalOpen}
          fetchRisks={fetchRisks}
          fetchAspImps={fetchAspImps}
          riskId={riskId}
          formType={formType}
          formData={formData}
          setFormData={setFormData}
          activityNew={activityNew}
          setActivityNew={setActivityNew}
          setIdentityDateNew={setIdentityDateNew}
          referencesNew={referencesNew}
          setReferencesNew={setReferencesNew}
          handleRiskFormCreated={handleRiskFormCreated}
          existingRiskConfig={existingRiskConfig}
          riskRegisterData={riskRegisterData}
          preMitigation={preMitigation}
          setPreMitigation={setPreMitigation}
          preScore={preScore}
          setPreScore={setPreScore}
          locationWiseUsers={locationWiseUsers}
          scoreData={scoreData}
          setScoreData={setScoreData}
          score={score}
          setScore={setScore}
          isPreOrPost={isPreOrPost}
          setIsPreOrPost={setIsPreOrPost}
          disableJobTitle={disableJobTitle}
          isFormDisabled={isFormDisabled}
          entityOptionsForDeptHead={entityOptionsForDeptHead}
          selectedEntityForDeptHead={selectedEntityForDeptHead}
          setSelectedEntityForDeptHead={setSelectedEntityForDeptHead}
        />
      ),
    },
   
    {
      label: "Attachments",
      key: 2,
      children: (
        <AttachmetsTab
          drawer={drawer}
          fileList={fileList}
          setFileList={setFileList}
          existingUploadedFiles={existingUploadedFiles}
        />
        // <ReferencesTab
        //   referencesNew={referencesNew}
        //   setReferencesNew={setReferencesNew}
        //   formData={formData}
        //   setFormData={setFormData}
        // />
      ),
    },
    {
      label: "References",
      key: 3,
      children: (
        <CommonReferencesTab drawer={drawer} />
        // <ReferencesTab
        //   referencesNew={referencesNew}
        //   setReferencesNew={setReferencesNew}
        //   formData={formData}
        //   setFormData={setFormData}
        // />
      ),
    },
  ];

  return (
    <>
      <div className={classes.drawer}>
        <Drawer
          title={[
            <span
              key="title"
              style={
                isSmallScreen ? { fontSize: "13px" } : { fontSize: "16px" }
              }
            >
              {`View Aspect Impact`}
            </span>,
          ]}
          placement="right"
          open={addModalOpen}
          closable={true}
          maskClosable={false}
          onClose={handleCloseModal}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{ width: "36px", height: "38px", cursor: "pointer" }}
            />
          }
          className={classes.drawer}
          width={isSmallScreen ? "85%" : "60%"}
          extra={
            <>
              <Space>
                <Tooltip title="View Aspect Impact Information">
                  <img
                    src={DocInfoIconImageSvg}
                    alt="doc-info"
                    onClick={toggleInfoDrawer}
                    className={classes.docInfoIcon}
                  />
                </Tooltip>
                <Tooltip title="Add/View Comments">
                  <ChatIcon
                    className={classes.commentsIcon}
                    onClick={() => toggleCommentsDrawer({ riskId: riskId })}
                  />
                </Tooltip>
              </Space>
            </>
          }
        >
          {isLoading || isDataLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </div>
          ) : (
            <div className={classes.tabsWrapper}>
              <div
                onClick={!isFormDisabled ? toggleScoreModal : () => {}}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  cursor: `${isFormDisabled ? "not-allowed" : "pointer"}`,
                }}
              >
                <div
                  style={{
                    backgroundColor: "efefef",
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bolder",
                      fontSize: "18px",
                      marginRight: "10px",
                    }}
                  >
                    Score : {!!preScore && preScore > 0 && preScore}
                  </div>
                  {!!preScore && preScore > 0 && (
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: determineColor(
                          preScore,
                          existingRiskConfig?.riskIndicatorData
                        ),
                      }}
                    ></div>
                  )}
                </div>
              </div>
              {isAspImpInWorkflow && (
                <p style={{ color: "red" }}>Can't Edit Stage In Workflow!</p>
              )}
              <Tabs
                onChange={onChange}
                type="card"
                items={tabs as any}
                animated={{ inkBar: true, tabPane: true }}
                // tabBarStyle={{backgroundColor : "green"}}
              />
            </div>
          )}

          {!!preMitigationScoreModal.open && (
            <>
              <PreMitigationScoreModal
                preMitigationScoreModal={preMitigationScoreModal}
                toggleScoreModal={toggleScoreModal}
                existingRiskConfig={existingRiskConfig}
                preMitigation={preMitigation}
                setPreMitigation={setPreMitigation}
                preScore={preScore}
                setPreScore={setPreScore}
                levelColor={levelColor}
                setLevelColor={setLevelColor}
                scoreData={scoreData}
                setScoreData={setScoreData}
                score={score}
                setScore={setScore}
                isPreOrPost={isPreOrPost}
                setIsPreOrPost={setIsPreOrPost}
                selectedCell={selectedCell}
                setSelectedCell={setSelectedCell}
              />
            </>
          )}

          {!!infoDrawer.open && (
            <InfoTopDrawer
              infoDrawer={infoDrawer}
              setInfoDrawer={setInfoDrawer}
              toggleInfoDrawer={toggleInfoDrawer}
              riskRegisterData={
                !!riskId
                  ? {
                      dateCreated: moment(riskRegisterData?.createdAt).format(
                        "DD/MM/YYYY"
                      ),
                    }
                  : null
              }
            />
          )}

          {!!commentDrawer.open && (
            <CommentsDrawer
              commentDrawer={commentDrawer}
              setCommentDrawer={setCommentDrawer}
              toggleCommentsDrawer={toggleCommentsDrawer}
              fetchRisks={fetchRisks}
              comments={comments}
              setComments={setComments}
              commentText={commentText}
              setCommentText={setCommentText}
              handleCommentSubmit={handleCommentSubmit}
            />
          )}
        </Drawer>
      </div>
    </>
  );
};

export default AspectImpactDrawer;
