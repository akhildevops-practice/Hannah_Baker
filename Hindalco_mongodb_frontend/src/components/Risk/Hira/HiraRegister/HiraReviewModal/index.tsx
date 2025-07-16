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
import { useSnackbar } from "notistack";
import getSessionStorage from "utils/getSessionStorage";
import AutoComplete from "components/AutoComplete";
import { useNavigate } from "react-router-dom";

//antd constants
const { TextArea } = Input;
const { Option } = Select;

type Props = {
  reviewModal: any;
  setReviewModal: any;
  selectedJobTitle?: string;
  reloadListAfterSubmit: any;
};

const HiraReviewModal = ({
  reviewModal,
  setReviewModal,
  selectedJobTitle = "",
  reloadListAfterSubmit,
}: Props) => {
  const classes = useStyles();
  const realmName = getAppUrl();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const userDetails = getSessionStorage();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmitForm = async (values: any) => {
    try {
      // console.log("checkrisk values", values);

      const data = {
        jobTitle: reviewModal?.jobTitle || selectedJobTitle,
        reviewedBy: userDetails?.id,
        comments: [
          {
            commentText: values.comment,
            commentBy: userDetails?.firstname + " " + userDetails?.lastname,
            userId: userDetails?.id,
          },
        ],
        organizationId: userDetails?.organizationId,
        createdBy: userDetails?.id,
      };
      // console.log("checkrisk data in handlesubmitform", data);

      console.log(data, reviewModal?.data?.id);

      const res = await axios.post(
        `/api/riskregister/hira-register/createReviewHistoryEntry`,
        data
      );
      // console.log("res", res);
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar(
          `Hira With Job Title ${reviewModal?.data?.jobTitle} Successfully Reviewed`,
          {
            variant: "success",
            autoHideDuration: 2500,
          }
        );
      }

      console.log(
        "checkrisk jobTitle in handleSubmitform in reviewmodal",
        reviewModal?.jobTitle || selectedJobTitle
      );

      reloadListAfterSubmit(reviewModal?.jobTitle || selectedJobTitle, true);
      handleCloseModal();
    } catch (error: any) {
      console.log(error);
      enqueueSnackbar(error.message || "Failed to Review HIRA", {
        variant: "error",
        autoHideDuration: 2500,
      });
    }
  };

  const handleCloseModal = () => {
    setReviewModal({
      ...reviewModal,
      open: !reviewModal.open,
    });
    // navigate("/risk/riskregister/HIRA");
  };

  return (
    <Modal
      title={`Review HIRA`}
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
            <Col>
              <Form.Item
                label="Review Reason: "
                name="comment"
                required
                // tooltip={{ title: 'Tooltip with customize icon', icon: <InfoIcon /> }}
              >
                <TextArea
                  rows={3}
                  style={{ width: "422px" }}
                  placeholder="Enter Reason For Review"
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
                {`Complete Review`}
              </Button>
            </Form.Item>
          </Row>
        </div>
      </Form>
    </Modal>
  );
};

export default HiraReviewModal;
