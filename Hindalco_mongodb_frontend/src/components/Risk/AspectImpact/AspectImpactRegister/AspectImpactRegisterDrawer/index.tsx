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
  FormControl,
  InputLabel,
  Select,
} from "@material-ui/core";
import ChatIcon from "@material-ui/icons/Chat";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";

//utils
import axios from "apis/axios.global";
import { API_LINK } from "config";
import getAppUrl from "utils/getAppUrl";
import checkRoles from "utils/checkRoles";
import getSessionStorage from "utils/getSessionStorage";
import { isValidForHiraPage } from "utils/validateInput";

//styles
import useStyles from "./styles";
import "./drawer.css";

//components
import AttachmetsTab from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactRegisterDrawer/AttachmentsTab";
import PreMitigationScoreModal from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactRegisterDrawer/PreMitigationScoreModal";
import CommentsDrawer from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactRegisterDrawer/CommentsDrawer";
import CreateRiskFormTab from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactRegisterDrawer/CreateRiskFormTab";
// import WorkflowTab from "components/Risk/Hira/HiraRegister/HiraRegisterDrawer/WorkflowTab";
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
  tableData?: any;
  setTableData?: any;
  existingRiskConfig?: any;
  // selectedJobTitle?: any;
  fetchAspImps?: any;
  fetchAllJobTitles?: any;
  isWorkflowPage?: any;
  reloadListAfterSubmit?: any;
  hiraInWorkflow?: any;
  handleAddDeptInChangesTrack?: any;
  jobTitleOptions?: any;
  selectedAspImpId?: any;
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

const AspectImpactRegisterDrawer = ({
  addModalOpen,
  setAddModalOpen,
  fetchRisks,
  riskId,
  formType,
  tableData,
  setTableData,
  existingRiskConfig,
  // selectedJobTitle,
  fetchAspImps,
  fetchAllJobTitles,
  isWorkflowPage = false,
  reloadListAfterSubmit,
  hiraInWorkflow = null,
  handleAddDeptInChangesTrack,
  jobTitleOptions = [],
  selectedAspImpId=""
}: Props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
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
  // console.log("check formType in risk drawer", riskId, formType);

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

  const [selectedDept, setSelectedDept] = useState<any>({});
  const [deptHeadChecked, setDeptHeadChecked] = useState<any>(false);

  const handleRiskFormCreated = (form: any) => {
    setRiskForm(form);
  };

  const url = "/api/aspect-impact";


  useEffect(() => {
    // wait for the multi-dept-head check to finish
    checkIfUserIsMultiDeptHead().then(() => {
      setDeptHeadChecked(true);
  
      if (selectedAspImpId) {
        // only now call this
        // console.log("checkr8 selectedAspImpId in if in useEffect asp imp drawer", selectedAspImpId);
        
        fetchRiskByIdAndSetValues(selectedAspImpId);
      } else {
        // console.log("checkr8 in else in useEffect asp imp drawer");
        
        setFormData({
          ...formData,
          jobTitle: "",
          activity: "",
        });
        fetchInitialDepartment(userDetails?.entity?.id);
        setDisableJobTitle(false);
      }
    });
  }, []);
  
  
  useEffect(() => {
    // don't run any of this until the head-check has resolved
    if (!deptHeadChecked) return;
  
    // console.log(
    //   "checkrisk hira in workflow in asp imp drawer--->",
    //   hiraInWorkflow
    // );
  
    fetchUsersByLocation();
    fetchingReviewerList();
    fetchApproverList();
  
    if (riskId) {
      // now safe to call
      fetchRiskById();
      setDisableJobTitle(true);
    } else {
      loadDatainRiskMatrix();
    }
  
    if (
      location?.pathname?.includes("/review") ||
      location?.pathname?.includes("/revisionHistory")
    ) {
      setIsFormDisabled(true);
      setIsAspImpInWorkflow(true);
    }
  }, [riskId, addModalOpen, hiraInWorkflow, deptHeadChecked]);

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
    // console.log("checkrisk8 selectedCell in drawer", selectedCell);
    if (!!selectedCell && selectedCell?.length === 2) {
      // console.log("checkrisk8 selectedCell in drawer in if condition", selectedCell);
      setPreSeverity(selectedCell[1] + 1);
      setPreProbability(selectedCell[0] + 1);
    }
  }, [selectedCell]);

  // useEffect(() => {
  //   console.log("checkrisk8 preSeverity, preProbability in useEffect", preSeverity, preProbability);
  // }, [preSeverity, preProbability]);

  const setFormDataFromJobTitle = (filteredOption: any) => {
    setIsLoading(true);
    SetIsDataLoading(true);
    // console.log("checkriske filteredOption in setFormDataFromJobTitle", filteredOption);
    setRiskRegisterData(filteredOption);
    
    setFormData({
      ...formData,
      interestedParties:
      filteredOption?.interestedParties?.map((item: any) => ({
          ...item,
          value: item._id,
          label: item.name,
        })) || [],
      assesmentTeam:filteredOption.assesmentTeam || [],
      riskReviewers: filteredOption?.reviewers || undefined,
      riskApprovers: filteredOption?.approvers || undefined,
    });
    if (filteredOption.jobTitle) setDisableJobTitle(true);
  
    // Set selected cell for pre-mitigation probability & severity
    if (!!filteredOption?.preProbability && !!filteredOption?.preSeverity) {
      setSelectedCell([
        filteredOption?.preSeverity - 1,
        filteredOption?.preProbability - 1,
      ]);
    }
  
    setIsLoading(false);
    SetIsDataLoading(false);
  };
  

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

  const fetchInitialDepartment = async (id: string) => {
    try {
      // console.log("checkr8 in fetchInitialDepartment in asp imp drawer", id);
      
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

  const fetchRiskById = async () => {
    try {
      // console.log("checkrisk fetchreiskbyid called");

      const res = await axios.get(`/api/aspect-impact/${riskId}`);
      setIsLoading(true);
      SetIsDataLoading(true);
      if (res.status === 200 || res.status === 201) {
        // console.log("checkriske res.data", res.data);
        
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
        // console.log("checkr8 entityOptionsForDeptHead", entityOptionsForDeptHead);
        
        if (res?.data?.entity?.id && entityOptionsForDeptHead?.length === 0) {
          if (
            res?.data?.status === "active" &&
            res?.data?.entity?.id !== userDetails?.entity?.id
          ) {
            setIsFormDisabled(true);
          }
        }

        if (
          res?.data?.status === "inWorkflow" &&
          !hiraInWorkflow?.reviewers?.includes(userDetails?.id) &&
          !hiraInWorkflow?.approvers?.includes(userDetails?.id)
        ) {
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

  const fetchRiskByIdAndSetValues = async (aspImpId : any) => {
    try {
      // console.log("checkriske fetchreiskbyid called aspimpid", aspImpId);

      const res = await axios.get(`/api/aspect-impact/${aspImpId}`);
      setIsLoading(true);
      SetIsDataLoading(true);
      if (res.status === 200 || res.status === 201) {
        // console.log("checkriske res.data", res.data);
        fetchInitialDepartment(res.data?.entity?.id);
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
        if (res?.data?.entity?.id && entityOptionsForDeptHead?.length === 0) {
          if (
            res?.data?.status === "active" &&
            res?.data?.entity?.id !== userDetails?.entity?.id
          ) {
            setIsFormDisabled(true);
          }
        }
        if (
          res?.data?.status === "inWorkflow" &&
          !hiraInWorkflow?.reviewers?.includes(userDetails?.id) &&
          !hiraInWorkflow?.approvers?.includes(userDetails?.id)
        ) {
          setIsFormDisabled(true);
          setIsAspImpInWorkflow(true);
        }

        const data = {
          riskReviewers: res.data?.reviewers || undefined,
          riskApprovers: res.data?.approvers || undefined,
        };
        filterActionItems(res.data.status, data);
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

  const handleSubmit = async (actionItem: any = "open") => {
    // console.log("checkriske handleSubmit formdata", formData);
    // console.log("checkriske preSeverity preProbability", preSeverity, preProbability);
    
    // console.log("checkrisk formType", actionItem);
    if (isSubmitting) return; // Prevent function execution if already submitting
    try {
      let status = "OPEN";

      let allowUser = false;

      let preMitigationMatrixData = {};

      await riskForm.validateFields();
      if (!formData?.assesmentTeam || !formData?.assesmentTeam.length) {
        enqueueSnackbar("Please Select Atleast One Assesment Team Member!", {
          variant: "warning",
        });
        setIsSubmitting(false);
        return;
      }

      // const prefixSuffix = await getPrefixSuffix("HIRA");
      // console.log("checkrisk prefixSuffix in risk drawer", prefixSuffix);

      // console.log("checkrisk8 preSeverity, preProbability in handleSubmit", preSeverity, preProbability);

      if (!preSeverity || !preProbability) {
        enqueueSnackbar("Please Select Score!", {
          variant: "warning",
        });
        setIsSubmitting(false);
        return;
      }

      if (!!formData?.existingControl) {
        preMitigationMatrixData = {
          preMitigation: preMitigation,
          preMitigationScore: preScore,
          preSeverity: preSeverity,
          preProbability: preProbability,
        };
      }

      let formattedReferences: any = [];

      if (refsData && refsData.length > 0) {
        formattedReferences = refsData.map((ref: any) => ({
          refId: ref.refId,
          organizationId: orgId,
          type: ref.type,
          name: ref.name,
          comments: ref.comments,
          createdBy: userDetails.firstName + " " + userDetails.lastName,
          updatedBy: null,
          link: ref?.link || "",
        }));
      }

      let riskData: any = {
        jobTitle: formData?.jobTitle,
        section: formData?.section,
        activity: formData?.activity,
        aspectType: !!formData?.aspectType ? formData.aspectType : undefined, // Aspect Type
        specificEnvAspect: formData?.specificEnvAspect,
        impactType: !!formData?.impactType ? formData.impactType : undefined, //Enviromental Impact Type
        specificEnvImpact: formData?.specificEnvImpact,
        condition: !!formData?.condition ? formData.condition : undefined, //associated hazard
        assesmentTeam:
          !!formData?.assesmentTeam && formData?.assesmentTeam.length > 0
            ? formData?.assesmentTeam.map((item: any) => item.id)
            : [],
        additionalAssessmentTeam: formData?.additionalAssessmentTeam || "",
        interestedParties:
          !!formData?.interestedParties && !!formData?.interestedParties?.length
            ? formData?.interestedParties
            : [],
        act: !!formData?.act ? formData.act : undefined, //associated hazard
        legalImpact: formData?.legalImpact,

        existingControl: formData?.existingControl,

        reviewers: !!formData?.riskReviewers
          ? [formData?.riskReviewers?.id]
          : "",
        approvers: !!formData?.riskApprovers
          ? [formData?.riskApprovers?.id]
          : "",
        // status: status,
        hiraConfigId: existingRiskConfig?._id || "",
        ...preMitigationMatrixData,
        // prefixSuffix: prefixSuffix || "",
        organizationId: userDetails?.organizationId || "",
        createdBy: userDetails?.id || "",
        year: await getYearFormat(new Date().getFullYear()),
        // refsData: formattedReferences,
      };

      // console.log("checkrisk in handleSubmit riskData-->", riskData);
      //

      // if()
      // console.log("checkriske in submit preprobability, preSeverity", preProbability, preSeverity);
      // console.log("checkriske in submit riskData", riskData);
      
      if (formType === "edit" && riskId) {
        putRisk(riskData, formattedReferences);
      } else if (formType === "create") {
        riskData = {
          ...riskData,
          locationId: userDetails?.locationId || "",
          entityId: selectedEntityForDeptHead || userDetails?.entityId,
          // year: await getYearFormat(new Date().getFullYear()),
        };
        // console.log("checkr8 riskData in postRisk", riskData);
        postRisk(riskData, formattedReferences);  
      }
      // console.log("checkrisk final risk Data", riskData);

      // Validation was successful, proceed with form submission...
    } catch (error) {
      // console.log("in risk handleSubmit error", error);
      // Validation failed, error.message will contain the error message.
    }
  };

  const postRisk = async (riskData: any, refsData: any) => {
    try {
      console.log("checkaspimp riskData in postRisk", riskData);
      const validateJobTitle = isValidForHiraPage(riskData?.jobTitle);
      if(!validateJobTitle?.isValid) {
        enqueueSnackbar(`Please Enter Valid Title ${validateJobTitle?.errorMessage}`, {
          variant: "warning",
        });
        return;
      }
      const validateActivity = isValidForHiraPage(riskData?.activity);
      if(!validateActivity?.isValid) {
        enqueueSnackbar(`Please Enter Valid Activity ${validateActivity?.errorMessage}`, {
          variant: "warning",
        });
        return;
      }
      const validateSpecificEnvAspect = isValidForHiraPage(riskData?.specificEnvAspect);
      if(!validateSpecificEnvAspect?.isValid) {
        enqueueSnackbar(`Please Enter Valid Specific Environment Aspect ${validateSpecificEnvAspect?.errorMessage}`, {
          variant: "warning",
        });
        return;
      }
      const validateSpecificEnvImpact = isValidForHiraPage(riskData?.specificEnvImpact);
      if(!validateSpecificEnvImpact?.isValid) {
        enqueueSnackbar(`Please Enter Valid Specific Environment Impact ${validateSpecificEnvImpact?.errorMessage}`, {
          variant: "warning",
        });
        return;
      }
      if(!!riskData?.additionalAssessmentTeam) {
        const validateAdditionalAssessmentTeam = isValidForHiraPage(riskData?.additionalAssessmentTeam);
        if(!validateAdditionalAssessmentTeam?.isValid) {
          enqueueSnackbar(`Please Enter Valid Additional Assessment Team ${validateAdditionalAssessmentTeam?.errorMessage}`, {
            variant: "warning",
          });
          return;
        }
      }
      const validateExistingControl = isValidForHiraPage(riskData?.existingControl);
      if(!validateExistingControl?.isValid) {
        enqueueSnackbar(`Please Enter Valid Existing Control ${validateExistingControl?.errorMessage}`, {
          variant: "warning",
        });
        return;
      }
      if (hiraInWorkflow && hiraInWorkflow?.status === "APPROVED") {
        handleAddDeptInChangesTrack();
      }
      let attachments =
        fileList.length > 0 ? await uploadAttachments(fileList) : [];
      const finalRiskData = {
        ...riskData,
        entityId: entityOptionsForDeptHead?.length > 0 ? selectedDept?.id : userDetails?.entityId,
        attachments,
      };

      // console.log("checkrisk final risk data in post risk", finalRiskData);
      setIsSubmitting(true); // Add this line to disable button after submission
      const response = await axios.post(`${url}`, finalRiskData);
      // console.log("checkrisk response after risk creation", response);
      const newComments = comments.map((comment: any) => ({
        ...comment,
        riskId: response.data._id,
      }));
      // console.log("checkrisk newComments in postRisk", newComments);

      // postCommentsInBulk(newComments);
      if (response.status === 200 || response.status === 201) {
        if (refsData && refsData?.length) {
          let finalRefsData = refsData?.map((item: any) => ({
            ...item,
            refTo: response.data._id,
          }));
          const refs = await axios.post("/api/refs/bulk-insert", finalRefsData);
        }
        clearStates();
        enqueueSnackbar("Risk Registered Successfully", {
          variant: "success",
        });
        reloadListAfterSubmit(
          false,
          riskData?.jobTitle,
          finalRiskData?.entityId
        );
        // fetchRisks("All");
        fetchAllJobTitles(selectedEntityForDeptHead || userDetails?.entityId, "");
      }
    } catch (error) {
      // console.log("error", error);
    } finally {
      setIsSubmitting(false); // Add this line to enable button after submission
    }
  };

  const putRisk = async (riskData: any, refsData: any) => {
    try {
      const validateActivity = isValidForHiraPage(riskData?.activity);
      if(!validateActivity?.isValid) {
        enqueueSnackbar(`Please Enter Valid Activity ${validateActivity?.errorMessage}`, {
          variant: "warning",
        });
        return;
      }
      const validateSpecificEnvAspect = isValidForHiraPage(riskData?.specificEnvAspect);
      if(!validateSpecificEnvAspect?.isValid) {
        enqueueSnackbar(`Please Enter Valid Specific Environment Aspect ${validateSpecificEnvAspect?.errorMessage}`, {
          variant: "warning",
        });
        return;
      }
      const validateSpecificEnvImpact = isValidForHiraPage(riskData?.specificEnvImpact);
      if(!validateSpecificEnvImpact?.isValid) {
        enqueueSnackbar(`Please Enter Valid Specific Environment Impact ${validateSpecificEnvImpact?.errorMessage}`, {
          variant: "warning",
        });
        return;
      }
      if(!!riskData?.additionalAssessmentTeam) {
        const validateAdditionalAssessmentTeam = isValidForHiraPage(riskData?.additionalAssessmentTeam);
        if(!validateAdditionalAssessmentTeam?.isValid) {
          enqueueSnackbar(`Please Enter Valid Additional Assessment Team ${validateAdditionalAssessmentTeam?.errorMessage}`, {
            variant: "warning",
          });
          return;
        }
      }
      const validateExistingControl = isValidForHiraPage(riskData?.existingControl);
      if(!validateExistingControl?.isValid) {
        enqueueSnackbar(`Please Enter Valid Existing Control ${validateExistingControl?.errorMessage}`, {
          variant: "warning",
        });
        return;
      }
      if (hiraInWorkflow && hiraInWorkflow?.status === "APPROVED") {
        handleAddDeptInChangesTrack();
      }
      let attachments =
        fileList.length > 0 ? await uploadAttachments(fileList) : [];
      const finalRiskData = {
        ...riskData,
        attachments,
      };
      setIsSubmitting(true); // Add this line to disable button after submission
      const res = await axios.put(`${url}/${riskId}`, finalRiskData);
      if (res.status === 200 || res.status === 201) {
        let finalRefsData = refsData?.map((item: any) => ({
          ...item,
          refTo: riskId,
        }));
        const refs = await axios.put("/api/refs/bulk-update", {
          refs: finalRefsData,
          id: riskId,
        });
        clearStates();
        enqueueSnackbar("Risk Updated Successfully", {
          variant: "success",
        });
        // if (isWorkflowPage) {
        // fetchRisks(formData?.jobTitle);
        reloadListAfterSubmit(false, riskData?.jobTitle);
        // } else {
        //   // fetchRisks("All");
        //   reloadListAfterSubmit();

          // fetchAllJobTitles();
        // }
      }
    } catch (error) {
      // console.log("error", error);
    } finally {
      setIsSubmitting(false); // Add this line to enable button after submission
    }
  };

  const uploadAttachments = async (files: any) => {
    const locationName = userDetails?.location?.locationName;
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

    const id = "Aspect-Impact";
    let res: any;
    let comdinedData;
    if (newData.length > 0) {
      res = await axios.post(
        `${API_LINK}/api/mrm/objectStore/${id}?realm=${realmName}&locationName=${locationName}`,
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
  const uploadAttachmentsold = async () => {
    try {
      // console.log(
      //   "checkrisk existing files an filesList in uploadAttachments",
      //   existingUploadedFiles,
      //   fileList
      // );

      const newFormData = new FormData();
      const locationName = isOrgAdmin
        ? ""
        : userDetails?.location?.locationName;

      if (!!existingUploadedFiles && existingUploadedFiles.length > 0) {
        const newFiles = fileList.filter((item: any) => !item?.url);
        // console.log(
        //   "checkrisk new files if existing files already exist",
        //   newFiles
        // );

        newFiles.forEach((file: any) => {
          newFormData.append("files", file.originFileObj, file.name);
        });
      } else {
        // console.log("checkrisk fileList in uploadAttachments", fileList);

        fileList.forEach((file: any) => {
          newFormData.append("files", file.originFileObj, file.name);
        });
      }
      let id = "Aspect-Impact";
      const response = await axios.post(
        `${API_LINK}/api/mrm/objectStore/${id}?realm=${realmName}&locationName=${locationName}`,
        newFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: {
            id: "AspectImpact",
          },
        }
      );
      if (response?.status === 200 || response?.status === 201) {
        return {
          isFileUploaded: true,
          attachments: response?.data,
        };
      } else {
        return {
          isFileUploaded: false,
          attachments: [],
        };
      }
    } catch (error) {
      // console.log("error in uploading attachments", error);
    }
  };

  const handleCloseModal = () => {
    const updatedData = tableData.map((item: any) => ({
      ...item,
      highlight: false,
    }));
    setTableData(updatedData);
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

  const toggleScoreModal = (selectCell : any = false) => {

    if(selectCell) {
      // console.log("checkrisk8 selectCell in toggleScoreModal in if", selectCell);
      setSelectedCell([riskRegisterData?.preProbability - 1, riskRegisterData?.preSeverity - 1]);
    }

    // console.log("checkrisk8 record in togle score modal--->", riskRegisterData);

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
          selectedAspImpId={selectedAspImpId}
          selectedDept={selectedDept}
          setSelectedDept={setSelectedDept}
        />
      ),
    },
    // {
    //   label: "Workflow",
    //   key: 2,
    //   children: (
    //     <WorkflowTab
    //       addModalOpen={addModalOpen}
    //       existingRiskConfig={existingRiskConfig}
    //       postMitigation={postMitigation}
    //       setPostMitigation={setPostMitigation}
    //       postScore={postScore}
    //       setPostScore={setPostScore}
    //       reviewerOptions={reviewerOptions}
    //       approverOptions={approverOptions}
    //       formData={formData}
    //       setFormData={setFormData}
    //       // fetchRisks={fetchRisks}
    //       // riskId={riskId}
    //       // formType={formType}
    //       // formData={formData}
    //       // setFormData={setFormData}
    //       // riskImpactNew={riskImpactNew}
    //       // setRiskImpactNew={setRiskImpactNew}
    //     />
    //   ),
    // },
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

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState("Details");
  console.log("selectedValue", selectedValue);
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

  return (
    <>
      <div className={classes.drawer}>
        <Drawer
          title={
            smallScreen ? (
              <span
                key="title"
                style={{
                  fontSize: isSmallScreen ? "13px" : "16px",
                }}
              >
                {formType === "create"
                  ? "Register Aspect Impact"
                  : "Edit Aspect Impact"}
              </span>
            ) : (
              ""
            )
          }
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
          width={matches ? "60%" : "90%"}
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
                {/* <Button onClick={handleCloseModal}>Cancel</Button> */}
                <Button
                  onClick={() => handleSubmit("Save")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#003566",
                    color: "white",
                  }}
                  disabled={
                    isSubmitting ||
                    items?.length === 0 ||
                    isFormDisabled ||
                    isAspImpInWorkflow
                  }
                >
                  <span>{"Submit"}</span>
                </Button>
                {/* <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  {items &&
                    items.length > 0 &&
                    items?.map((item: any, index: any) => (
                      <MenuItem
                        key={index + 1}
                        onClick={() => onMenuClick(item)}
                        disabled={
                          item === "In Approval" || item === "In Review"
                        }
                      >
                        {item}
                      </MenuItem>
                    ))}
                </Menu> */}
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
                onClick={!isFormDisabled ? () => toggleScoreModal(true) : () => {}}
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
              {smallScreen ? (
                <Tabs
                  onChange={onChange}
                  type="card"
                  items={tabs as any}
                  animated={{ inkBar: true, tabPane: true }}
                  // tabBarStyle={{backgroundColor : "green"}}
                />
              ) : (
                <div style={{ marginTop: "15px", width: "100%" }}>
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
                      <MenuItem value={"Details"}>
                        <div
                          style={{
                            backgroundColor:
                              selectedValue === "Details" ? "#3576BA" : "white",
                            textAlign: "center",
                            padding: "5px 10px",
                            borderRadius: "5px",
                            color:
                              selectedValue === "Details" ? "white" : "black",
                          }}
                        >
                          {" "}
                          Aspect Impact Details
                        </div>
                      </MenuItem>
                      <MenuItem value={"Attachments"}>
                        {" "}
                        <div
                          style={{
                            backgroundColor:
                              selectedValue === "Attachments"
                                ? "#3576BA"
                                : "white",
                            textAlign: "center",
                            padding: "5px 10px",
                            borderRadius: "5px",
                            color:
                              selectedValue === "Attachments"
                                ? "white"
                                : "black",
                          }}
                        >
                          Attachments
                        </div>
                      </MenuItem>
                      <MenuItem value={"References"}>
                        {" "}
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
                    </Select>
                  </FormControl>
                </div>
              )}
              {smallScreen ? (
                ""
              ) : (
                <div>
                  {selectedValue === "Details" ? (
                    <div style={{ marginTop: "15px" }}>
                      {" "}
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
                        setSelectedEntityForDeptHead={
                          setSelectedEntityForDeptHead
                        }
                        selectedAspImpId={selectedAspImpId}
                      />
                    </div>
                  ) : (
                    ""
                  )}

                  {selectedValue === "Attachments" ? (
                    <div style={{ marginTop: "15px" }}>
                      {" "}
                      <AttachmetsTab
                        drawer={drawer}
                        fileList={fileList}
                        setFileList={setFileList}
                        existingUploadedFiles={existingUploadedFiles}
                      />
                    </div>
                  ) : (
                    ""
                  )}

                  {selectedValue === "References" ? (
                    <div style={{ marginTop: "15px" }}>
                      {" "}
                      <CommonReferencesTab drawer={drawer} />
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              )}
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

export default AspectImpactRegisterDrawer;
