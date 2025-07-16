//react, react-router
import { useEffect, useState } from "react";

//antd
import {
  Col,
  DatePicker,
  DatePickerProps,
  Form,
  Input,
  Row,
  Select,
} from "antd";

//styles
import useStyles from "./styles";

//components
import ControlMeasuresEditorField from "components/RiskRegister/ControlMeasureDrawer/ControlMeasureDetailsTab/ControlMeasuresEditorField";
//thirdparty libs
import dayjs from "dayjs";
import moment from "moment";
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";
import { useMediaQuery } from "@material-ui/core";
const { TextArea } = Input;

type Props = {
  mitigationModal?: any;
  setMitigationModal?: any;
  fetchRisks?: any;
  fetchAspImps?: any;
  setStatusNew?: any;
  setTargetDateNew?: any;
  setCommentsNew?: any;
  formData?: any;
  setFormData?: any;
  commentsNew?: any;
  setReferencesNew?: any;
  handleMitigationFormCreated?: any;

  existingRiskConfig?: any;
  postMitigation?: any;
  setPostMitigation?: any;
  postScore?: any;
  setPostScore?: any;
  levelColor?: any;
  setLevelColor?: any;
  isFormDisabled?: any;
};

const ControlMeasureDetailsTab = ({
  mitigationModal,
  setMitigationModal,
  fetchRisks,
  fetchAspImps,
  setCommentsNew,
  setFormData,
  setStatusNew,
  setTargetDateNew,
  formData,
  commentsNew,
  setReferencesNew,
  handleMitigationFormCreated,

  existingRiskConfig,
  postMitigation,
  setPostMitigation,
  postScore,
  setPostScore,
  levelColor,
  setLevelColor,
  isFormDisabled = false,
}: Props) => {
  const matches = useMediaQuery("(min-width:822px)");
  const [mitigationStage, setMitigationStage] = useState<any>();
  const [locationWiseUsers, setLocationWiseUsers] = useState<any>([]);
  const userDetails = getSessionStorage();
  const classes = useStyles();
  const [mitigationForm] = Form.useForm();

  useEffect(() => {
    if (handleMitigationFormCreated) {
      handleMitigationFormCreated(mitigationForm);
    }
  }, [mitigationForm, handleMitigationFormCreated]);

  useEffect(() => {
    fetchUsersByLocation();
    if (mitigationModal.mode === "edit") {
      const targetDateMoment = mitigationModal?.data?.targetDate
        ? moment(mitigationModal?.data?.targetDate, "YYYY/MM/DD")
        : undefined;
      const completionDateMoment = mitigationModal?.data?.completionDate
        ? moment(mitigationModal?.data?.completionDate, "YYYY/MM/DD")
        : undefined;
      mitigationForm.setFieldsValue({
        title: mitigationModal.data.title,
        stage: mitigationModal.data.stage || undefined,
        status: mitigationModal.data.status == "OPEN" ? true : false,
        targetDate: targetDateMoment,
        completionDate: completionDateMoment,
        responsiblePerson: mitigationModal.data.responsiblePerson,
        additionalControlMeasure: mitigationModal.data.comments,
      });
      setMitigationStage(mitigationModal?.data?.stage || undefined);
      setFormData({
        ...formData,
        title: mitigationModal.data.title,
        stage: mitigationModal.data.stage || undefined,
        status: mitigationModal.data.status == "OPEN" ? true : false,
        targetDate: targetDateMoment,
        completionDate: completionDateMoment,
        responsiblePerson: mitigationModal.data.responsiblePerson,
        additionalControlMeasure: mitigationModal.data.comments,
      });
      setTargetDateNew(
        moment.utc(mitigationModal?.data?.targetDate).format("YYYY/MM/DD")
      );
      setCommentsNew(mitigationModal.data.comments || "");
      setReferencesNew(mitigationModal.data.references);
    }
  }, [mitigationModal]);

  const fetchUsersByLocation = async () => {
    const locationId = userDetails.locationId || "";
    try {
      // setIsLoading(true);
      const res = await axios.get(
        `/api/riskregister/users/${userDetails?.organizationId}`
      );
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
            // label : user.firstname + " " + user.lastname,
            // // name : user.firstname + " " + user.lastname,
            // value : user.id,
          }));
          setLocationWiseUsers(userOptions);
          // setIsLoading(false);
        } else {
          setLocationWiseUsers([]);
          // setIsLoading(false);
        }
      } else {
        setLocationWiseUsers([]);
        // setIsLoading(false);
      }
    } catch (error) {
      // setIsLoading(false);
      // console.log("errror in fetching users based on location", error);
    }
  };

  useEffect(() => {
    console.log("checkrisk formdata in cm", formData);
  }, [formData]);

  return (
    <>
      <Form
        layout="vertical"
        className={classes.formBox}
        form={mitigationForm}
        initialValues={{ status: true }}
        onValuesChange={(changedValues, allValues) => setFormData(allValues)}
        rootClassName={classes.labelStyle}
      >
        <Row gutter={[16, 16]}>
          <Col span={matches ? 12 : 24}>
            <Form.Item
              label="Additional Control Measure Stage: "
              name="stage"
              rules={[
                {
                  required: true,
                  message: "Please Select Stage!",
                },
              ]}
            >
              <Select
                aria-label="Select Mitigation Stage"
                placeholder="Select Stage"
                value={mitigationStage}
                onChange={(value: any) => setMitigationStage(value)}
                options={[
                  { value: "Planned", label: "Planned" },
                  { value: "Ongoing", label: "Ongoing" },
                  { value: "Completed", label: "Completed" },
                ]}
                size="large"
                disabled={isFormDisabled}
              />
            </Form.Item>
          </Col>

          {mitigationStage !== "Completed" && (
            <Col span={matches ? 12 : 24}>
              <Form.Item
                label="Target Date: "
                name="targetDate"
                rules={[
                  {
                    required: true,
                    message: "Please Input Target Date!",
                  },
                ]}
              >
                <DatePicker
                  disabled={isFormDisabled}
                  format="DD/MM/YYYY"
                  // onChange={onTargetDateChange}
                  size="large"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          )}
          {mitigationStage === "Completed" && (
            <Col span={12}>
              <Form.Item
                label="Completion Date: "
                name="completionDate"
                rules={[
                  {
                    required: true,
                    message: "Please Input Completion Date!",
                  },
                ]}
              >
                <DatePicker
                  disabled={isFormDisabled}
                  format="DD/MM/YYYY"
                  // Set default value if you have any or handle it appropriately
                  size="large"
                />
              </Form.Item>
            </Col>
          )}
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Responsible Person: "
              name="responsiblePerson"
              tooltip="This is a required field"
              rules={[
                {
                  required: true,
                  message: "Please Input Responsible Person!",
                },
              ]}
            >
              <Select
                showSearch
                size="large"
                placeholder="Select Person"
                options={locationWiseUsers || []}
                // style={{ width: "100%", minWidth: "180px" }}
                // className={classes.hazardSelectStyle}

                filterOption={(input: any, option: any) =>
                  option?.label?.toLowerCase().indexOf(input?.toLowerCase()) >=
                  0
                }
                listHeight={200}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          {/* <Col span={24}>
            <Form.Item label="Additional Control Measures: ">
              <ControlMeasuresEditorField
                comments={commentsNew}
                setComments={setCommentsNew}
                isFormDisabled={isFormDisabled}
              />
            </Form.Item>
          </Col> */}
          <Col span={24}>
            <Form.Item
              label="Additional Control Measure: "
              name="additionalControlMeasure"
              rules={[
                { required: true, message: "Please Enter Additional Control!" },
              ]}
            >
              <TextArea
                disabled={isFormDisabled}
                rows={4}
                placeholder="Enter Additional Control Measures"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default ControlMeasureDetailsTab;
