//react, react router
import { useEffect, useState } from "react";

//antd
import {
  Button,
  Form,
  Input,
  Row,
  Col,
  Avatar,
  Tag,
  Modal,
  Select,
  Spin,
} from "antd";

//material-ui
import PersonIcon from "@material-ui/icons/Person";

//utils
import axios from "apis/axios.global";
import { API_LINK } from "config";
import getAppUrl from "utils/getAppUrl";

//styles
import useStyles from "./style";

//thirdparty libs
import { debounce, set } from "lodash";
import { useSnackbar } from "notistack";
import getSessionStorage from "utils/getSessionStorage";
import AutoComplete from "components/AutoComplete";
import { useNavigate } from "react-router-dom";
import getYearFormat from "utils/getYearFormat";

//antd constants
const { TextArea } = Input;
const { Option } = Select;

type Props = {
  reviewModal: any;
  setReviewModal: any;
  hiraStatus: string;
};

const AspImpWorkflowModal = ({
  reviewModal,
  setReviewModal,
  hiraStatus = "open",
}: Props) => {
  const [searchQuery, setsearchQuery] = useState<string>("");

  const [options, setOptions] = useState<any>([]);
  const [fetching, setFetching] = useState<any>(false);
  const [reviewerOptions, setReviewerOptions] = useState<any>([]);
  const [approverOptions, setApproverOptions] = useState<any>([]);

  //loading state for fetching both reviewers and approvers
  const [isLoading, setIsLoading] = useState(false);
  const [workflowFormData, setWorkflowFormData] = useState<any>({
    reviewers: [],
    approvers: [],
  }); //for storing form data

  const [hideReviewerAndApproverField, setHideReviewerAndApproverField] =
    useState<boolean>(false);

  const classes = useStyles();
  const realmName = getAppUrl();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const userDetails = getSessionStorage();
  const { enqueueSnackbar } = useSnackbar();
  const [currentYear, setCurrentYear] = useState<any>();

  useEffect(() => {
    setIsLoading(true); // Start loading
    console.log(
      "checkrisk in hira workflow modal useEffect[reviewModal?.open]",
      reviewModal
    );

    if (
      !!reviewModal?.open &&
      (hiraStatus === "IN_REVIEW" ||
        hiraStatus === "IN_APPROVAL" ||
        hiraStatus === "REJECTED")
    ) {
      setHideReviewerAndApproverField(true);
      // setWorkflowFormData({
      //     reviewers : reviewModal?.hiraInWorkflow?.reviewers || [],
      //     approvers : reviewModal?.hiraInWorkflow?.approvers|| []
      // })
    } else {
      Promise.all([fetchingReviewerList(), fetchApproverList()])
        .then(([reviewerData, approverData]) => {
          setIsLoading(false); // Stop loading when both promises are resolved

          if (reviewerData?.length === 0 && approverData?.length === 0) {
            enqueueSnackbar("No reviewers and approvers found", {
              variant: "warning",
            });
          } else if (reviewerData?.length === 0) {
            enqueueSnackbar("No reviewers found", { variant: "warning" });
          } else if (approverData?.length === 0) {
            enqueueSnackbar("No approvers found", { variant: "warning" });
          }

          console.log("checkrisk reviewers in .then", reviewerOptions);
          console.log("checkrisk approvers in .then", approverOptions);
        })
        .catch((error) => {
          console.error("checkrisk Error fetching data:", error);
          setIsLoading(false); // Also stop loading in case of error
        });
    }
  }, [reviewModal, hiraStatus]);

  useEffect(() => {
    console.log("checkrisk workflowFormData", workflowFormData);
  }, [workflowFormData]);

  const getyear = async () => {
    const currentyear = await getYearFormat(new Date().getFullYear());
    console.log("checkrisk currentyear", currentyear);

    setCurrentYear(currentyear);
    return currentyear;
  };
  const fetchingReviewerList = async () => {
    try {
      // const encodedValue = encodeURIComponent(value);
      const res = await axios.get(`/api/roles/workFlowDistributionReviewer`);
      // console.log("fetch reviwer list", res);
      const data = res?.data || [];
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
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const fetchApproverList = async () => {
    try {
      // const encodedValue = encodeURIComponent(value);
      const res = await axios.get(`/api/roles/workFlowDistributionApprover`);
      const data = res?.data || [];
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
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const handleSubmitForm = async (values: any) => {
    try {
      console.log("checkrisk values", values);
      if (hiraStatus === "open") {
        let url;
        if (!workflowFormData?.reviewers?.length) {
          enqueueSnackbar("Please Select Atleast One Reviewer!", {
            variant: "warning",
          });
          return;
        }
        if (!workflowFormData?.approvers?.length) {
          enqueueSnackbar("Please Select Atleast One Approver!", {
            variant: "warning",
          });
          return;
        }
        if (process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")) {
          url = `${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/AspectImpact/workflow`;
        } else {
          url = `${realmName}.${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/AspectImpact/workflow`;
        }
        const data = {
          reviewers:
            workflowFormData?.reviewers?.map((item: any) => ({
              id: item.userId,
              fullName: item?.fullname,
              email: item?.email,
            })) || [],

          approvers:
            workflowFormData?.approvers?.map((item: any) => ({
              id: item.userId,
              fullName: item?.fullname,
              email: item?.email,
            })) || [],
          reviewComment: values.comment,
          hiraRegisterIds: reviewModal?.data?.hiraIds,
          reviewStartedBy: userDetails?.id,
          comments: [
            {
              commentText: values.comment,
              commentBy: userDetails?.firstname + " " + userDetails?.lastname,
              userId: userDetails?.id,
            },
          ],
          createdBy: userDetails?.id,
          entityId: reviewModal?.data?.entityId,
          url: url,
          entity : reviewModal?.data?.entity,
          location : reviewModal?.data?.location,
        };
        console.log("checkrisk data in handlesubmitform", data);

        console.log(data, reviewModal?.data?.id);

        const res = await axios.post(
          `/api/aspect-impact/createConsolidateEntry/${reviewModal?.data?.entityId}/${userDetails?.organizationId}`,
          data
        );
        console.log("res", res);
        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar(
            //   `Hira With Job Title ${reviewModal?.data?.jobTitle} Successfully Sent for Review`,
            res?.data?.message ||
              `Hira With Job Title ${reviewModal?.data?.jobTitle} Successfully Sent for Review`,
            {
              variant: "success",
              autoHideDuration: 2500,
            }
          );
        }
        handleCloseModal();
        navigate("/risk/riskregister/AspectImpact");
      } else if (hiraStatus === "IN_REVIEW") {
        let url;
        console.log(
          "checkrisk in handle submit of review modal, in review stage"
        );
        if (process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")) {
          url = `${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/AspectImpact/workflow`;
        } else {
          url = `${realmName}.${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/AspectImpact/workflow`;
        }
        const data = {
          reviewCompleteComment: values.comment,
          hiraRegisterIds: reviewModal?.hiraInWorkflow?.hiraIds,
          updatedBy: userDetails?.id,
          url: url,
          entityId: reviewModal?.data?.entityId,
          status: "IN_APPROVAL",

          approvers: reviewModal?.hiraInWorkflow?.approvers || [],
          comments: [
            {
              commentText: values.comment,
              commentBy: userDetails?.firstname + " " + userDetails?.lastname,
              userId: userDetails?.id,
            },
          ],
          reviewedBy: userDetails?.id,
          entity : reviewModal?.data?.entity,
          location : reviewModal?.data?.location,
        };
        console.log("checkrisk data in handlesubmitform", data);

        console.log(data, reviewModal?.hiraInWorkflow?.id);

        const res = await axios.patch(
          `/api/aspect-impact/updateConsolidatedEntry/${reviewModal?.hiraInWorkflow?._id}`,
          data
        );
        console.log("res", res);
        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar(
            //   `Hira With Job Title ${reviewModal?.data?.jobTitle} Successfully Sent for Review`,
            res?.data?.message ||
              `Hira With Job Title ${reviewModal?.hiraInWorkflow?.jobTitle} Successfully Sent for Approval`,
            {
              variant: "success",
              autoHideDuration: 2500,
            }
          );
        }
        handleCloseModal();
        navigate("/risk/riskregister/AspectImpact");
      } else if (hiraStatus === "IN_APPROVAL") {
        let url;
        console.log(
          "checkrisk in handle submit of approve modal, in approve stage"
        );
        if (process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")) {
          url = `${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/AspectImpact/workflow`;
        } else {
          url = `${realmName}.${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/AspectImpact/workflow`;
        }
        const data = {
          approveComment: values.comment,
          hiraRegisterIds: reviewModal?.hiraInWorkflow?.hiraIds,
          updatedBy: userDetails?.id,
          url: url,
          entityId: reviewModal?.data?.entityId,
          status: "APPROVED",
          year: await getyear(),
          reviewers: reviewModal?.hiraInWorkflow?.reviewers || [],
          approvers: reviewModal?.hiraInWorkflow?.approvers || [],
          comments: [
            {
              commentText: values.comment,
              commentBy: userDetails?.firstname + " " + userDetails?.lastname,
              userId: userDetails?.id,
            },
          ],
          approvedBy: userDetails?.id,
          responsiblePersonIdArray : reviewModal?.data?.responsiblePersonIdArray,
          entity : reviewModal?.data?.entity,
          location : reviewModal?.data?.location,
        };
        console.log("checkrisk data in handlesubmitform", data);

        console.log(data, reviewModal?.hiraInWorkflow?.id);

        const res = await axios.patch(
          `/api/aspect-impact/updateConsolidatedEntry/${reviewModal?.hiraInWorkflow?._id}`,
          data
        );
        console.log("res", res);
        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar(
            //   `Hira With Job Title ${reviewModal?.data?.jobTitle} Successfully Sent for Review`,
            res?.data?.message ||
              `Hira With Job Title ${reviewModal?.hiraInWorkflow?.jobTitle} Successfully Sent for Approval`,
            {
              variant: "success",
              autoHideDuration: 2500,
            }
          );
        }
        handleCloseModal();
        navigate("/risk/riskregister/AspectImpact");
      } else if (hiraStatus === "REJECTED") {
        let url;
        console.log(
          "checkrisk in handle submit of rejected modal, in reject stage"
        );
        if (process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")) {
          url = `${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/AspectImpact/workflow`;
        } else {
          url = `${realmName}.${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/AspectImpact/workflow`;
        }
        const data = {
          // approveComment: values.comment,
          hiraRegisterIds: reviewModal?.hiraInWorkflow?.hiraIds,
          updatedBy: userDetails?.id,
          url: url,
          status: "REJECTED",
          reviewers: reviewModal?.hiraInWorkflow?.reviewers || [],
          approvers: reviewModal?.hiraInWorkflow?.approvers || [],
          rejectedBy: userDetails?.id,
          entityId: userDetails?.entity?.id,
          comments: [
            {
              commentText: values.comment,
              commentBy: userDetails?.firstname + " " + userDetails?.lastname,
              userId: userDetails?.id,
            },
          ],
          entity : reviewModal?.data?.entity,
          location : reviewModal?.data?.location,
          // approvedBy: userDetails?.id,
        };
        console.log("checkrisk data in handlesubmitform", data);

        console.log(data, reviewModal?.hiraInWorkflow?.id);

        const res = await axios.patch(
          `/api/aspect-impact/updateConsolidatedEntry/${reviewModal?.hiraInWorkflow?._id}`,
          data
        );
        console.log("res", res);
        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar(
            //   `Hira With Job Title ${reviewModal?.data?.jobTitle} Successfully Sent for Review`,
            res?.data?.message ||
              `Hira With Job Title ${reviewModal?.hiraInWorkflow?.jobTitle} Successfully Sent Back For Edit`,
            {
              variant: "success",
              autoHideDuration: 2500,
            }
          );
          handleCloseModal();
          navigate("/risk/riskregister/AspectImpact");
        }
      } else if (hiraStatus === "STARTREVIEW") {
        let url;
        console.log(
          "checkrisk in handle submit of rejected modal, in reject stage"
        );

        if (!workflowFormData?.reviewers?.length) {
          enqueueSnackbar("Please Select Atleast One Reviewer!", {
            variant: "warning",
          });
          return;
        }
        if (!workflowFormData?.approvers?.length) {
          enqueueSnackbar("Please Select Atleast One Approver!", {
            variant: "warning",
          });
          return;
        }

        if (process.env.REACT_APP_REDIRECT_URL?.includes("adityabirla.com")) {
          url = `${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/AspectImpact/workflow`;
        } else {
          url = `${realmName}.${process.env.REACT_APP_REDIRECT_URL}/risk/riskregister/AspectImpact/workflow`;
        }
        const data = {
          reviewers:
            workflowFormData?.reviewers?.map((item: any) => ({
              id: item.userId,
              fullName: item?.fullname,
              email: item?.email,
            })) || [],
          approvers:
            workflowFormData?.approvers?.map((item: any) => ({
              id: item.userId,
              fullName: item?.fullname,
              email: item?.email,
            })) || [],
          // approveComment: values.comment,
          hiraRegisterIds: reviewModal?.hiraInWorkflow?.hiraIds,
          updatedBy: userDetails?.id,
          url: url,
          status: "IN_REVIEW",
          entityId: userDetails?.entity?.id,

          // reviewers: reviewModal?.hiraInWorkflow?.reviewers || [],
          // approvers: reviewModal?.hiraInWorkflow?.approvers || [],
          reviewStartedBy: userDetails?.id,
          reviewComment: values.comment,
          comments: [
            {
              commentText: values.comment,
              commentBy: userDetails?.firstname + " " + userDetails?.lastname,
              userId: userDetails?.id,
            },
          ],
          entity : reviewModal?.data?.entity,
          location : reviewModal?.data?.location,
          // approvedBy: userDetails?.id,
        };
        console.log(
          "checkrisk data in handlesubmitform for REJECTED HIRA",
          data,
          reviewModal?.hiraInWorkflow?._id
        );

        // console.log(data, reviewModal?.hiraInWorkflow?._id);

        const res = await axios.patch(
          `/api/aspect-impact/updateAspImpConsolidatedForRejectedAspectImpact/${reviewModal?.hiraInWorkflow?._id}`,
          data
        );
        console.log("res", res);
        if (res.status === 200 || res.status === 201) {
          enqueueSnackbar(
            //   `Hira With Job Title ${reviewModal?.data?.jobTitle} Successfully Sent for Review`,
            res?.data?.message ||
              `Hira With Job Title ${reviewModal?.hiraInWorkflow?.jobTitle} Successfully Sent Back For Edit`,
            {
              variant: "success",
              autoHideDuration: 2500,
            }
          );
          handleCloseModal();
          navigate("/risk/riskregister/AspectImpact");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCloseModal = () => {
    setReviewModal({
      ...reviewModal,
      open: !reviewModal.open,
    });
  };

  return (
    <Modal
      title={`${
        hiraStatus === "open"
          ? "Send for Review"
          : hiraStatus === "IN_REVIEW"
          ? "Finish Review"
          : hiraStatus === "IN_APPROVAL"
          ? "Finish Approval"
          : hiraStatus === "REJECTED"
          ? "Send Back For Edit"
          : hiraStatus === "STARTREVIEW"
          ? "Send For Review"
          : ""
      }`}
      centered
      open={reviewModal.open}
      onCancel={handleCloseModal}
      footer={null}
      width={500}
      className={classes.modal}
    >
      <Form
        form={form}
        layout="vertical"
        className={classes.formBox}
        onFinish={handleSubmitForm}
        onValuesChange={(changedValues, allValues) =>
          setWorkflowFormData({ ...workflowFormData, ...changedValues })
        }
        // style={{marginTop : "15px"}}
      >
        <div style={{ padding: "5px" }}>
          <Row
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              paddingLeft: "20px",
              // paddingRight: "10px",
            }}
          >
            {!hideReviewerAndApproverField && (
              <>
                <Col>
                  <Form.Item
                    label="Select Reviewer: "
                    name="reviewers"
                    // rules={[
                    //   {
                    //     required: true,
                    //     message: "Please Select Reviewer!",
                    //   },
                    // ]}
                  >
                    <AutoComplete
                      suggestionList={reviewerOptions ? reviewerOptions : []}
                      name=""
                      keyName="reviewers"
                      formData={workflowFormData}
                      disabled={false}
                      labelKey="label"
                      setFormData={setWorkflowFormData}
                      multiple={true}
                      getSuggestionList={() => {}}
                      defaultValue={workflowFormData?.reviewers || []}
                      type="RA"
                    />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item
                    label="Select Approver: "
                    name="approvers"
                    // rules={[
                    //   {
                    //     required: true,
                    //     message: "Please Select Approver!",
                    //   },
                    // ]}
                  >
                    <AutoComplete
                      suggestionList={approverOptions ? approverOptions : []}
                      name=""
                      keyName="approvers"
                      formData={workflowFormData}
                      disabled={false}
                      labelKey="label"
                      setFormData={setWorkflowFormData}
                      multiple={true}
                      getSuggestionList={() => {}}
                      defaultValue={workflowFormData?.approvers || []}
                      type="RA"
                    />
                  </Form.Item>
                </Col>
              </>
            )}

            <Col>
              <Form.Item
                label="Comment: "
                name="comment"
                required
                // tooltip={{ title: 'Tooltip with customize icon', icon: <InfoIcon /> }}
              >
                <TextArea
                  rows={3}
                  style={{ width: "422px" }}
                  placeholder="Enter Comment"
                  size="large"
                  // value={value}
                  // onChange={handleInput}
                  // onChange={(e) => setValue(e.target.value)}
                  // onKeyDown={handleKeyDown}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row
            style={{
              // padding: "10px 10px",
              justifyContent: "end",
            }}
          >
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {`${
                  hiraStatus === "open"
                    ? "Send for Review"
                    : hiraStatus === "IN_REVIEW"
                    ? "Send for Approval"
                    : hiraStatus === "IN_APPROVAL"
                    ? "Approve"
                    : hiraStatus === "REJECTED"
                    ? "Send Back For Edit"
                    : hiraStatus === "STARTREVIEW"
                    ? "Send For Review"
                    : ""
                }`}
              </Button>
            </Form.Item>
          </Row>
        </div>
      </Form>
    </Modal>
  );
};

export default AspImpWorkflowModal;
