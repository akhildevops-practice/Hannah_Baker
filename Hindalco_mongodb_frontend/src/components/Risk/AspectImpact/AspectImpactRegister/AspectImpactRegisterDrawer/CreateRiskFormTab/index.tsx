//react,reactrouter
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

//antd
import { Form, Input, Row, Col, Select, Radio } from "antd";

//components
import AutoComplete from "components/AutoComplete";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";
import { useSnackbar } from "notistack";
import {
  CircularProgress,
  TextareaAutosize,
  useMediaQuery,
} from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { add } from "lodash";
import DepartmentSelector from "components/ReusableComponents/DepartmentSelector";
//antd constants
const { TextArea } = Input;

type Props = {
  addModalOpen?: any;
  setAddModalOpen?: any;
  fetchRisks?: any;
  fetchAspImps?: any;
  riskId?: any;
  formType?: string;
  formData?: any;
  setFormData?: any;
  activityNew?: any;
  setActivityNew?: any;
  setIdentityDateNew?: any;
  referencesNew?: any;
  setReferencesNew?: any;
  handleRiskFormCreated?: any;
  existingRiskConfig?: any;
  riskRegisterData?: any;
  preMitigation?: any;
  setPreMitigation?: any;
  preScore?: any;
  setPreScore?: any;
  locationWiseUsers?: any;

  scoreData?: any;
  setScoreData?: any;
  score?: any;
  setScore?: any;
  isPreOrPost?: any;
  setIsPreOrPost?: any;
  disableJobTitle?: boolean;
  isFormDisabled?: any;

  entityOptionsForDeptHead?: any;
  selectedEntityForDeptHead?: any;
  setSelectedEntityForDeptHead?: any;
  selectedAspImpId?: any;
  selectedDept?: any;
  setSelectedDept?: any;
};

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  labelStyle: {
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the <label> element
    },
  },
  textFields: {
    "&.custom-disabled-textarea .ant-input-disabled": {
      backgroundColor: "red !important ",
      color: "black ",
    },
  },
}));

const CreateRiskFormTab = ({
  addModalOpen,
  setAddModalOpen,
  fetchRisks,
  fetchAspImps,
  riskId,
  formType,
  formData,
  setFormData,
  activityNew,
  setActivityNew,
  setIdentityDateNew,
  referencesNew,
  setReferencesNew,
  handleRiskFormCreated,
  existingRiskConfig,
  riskRegisterData,
  preMitigation,
  setPreMitigation,
  preScore,
  setPreScore,
  locationWiseUsers,

  scoreData,
  setScoreData,
  score,
  setScore,
  isPreOrPost,
  setIsPreOrPost,
  disableJobTitle = false,
  isFormDisabled = false,
  entityOptionsForDeptHead = [],
  selectedEntityForDeptHead,
  setSelectedEntityForDeptHead,
  selectedAspImpId="",
  selectedDept,
  setSelectedDept,
}: Props) => {
  const matches = useMediaQuery("(min-width:822px)");
  const params = useParams<any>();
  const [riskTypeOptions, setRiskTypeOptions] = useState<any>([]);

  const [aspectTypeOptions, setAspectTypeOptions] = useState<any>([]);
  const [impactTypeOptions, setImpactTypeOptions] = useState<any>([]);
  const [actOptions, setActOptions] = useState<any>([]);
  const [conditionOptions, setConditionOptions] = useState<any>([]);
  const [interestedPartiesOptions, setInterestedPartiesOptions] = useState<any>(
    []
  );

  const [loadingFormValues, setLoadingFormValues] = useState<boolean>(false);

  const userDetails = getSessionStorage();
  const [firstForm] = Form.useForm();
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  // const [loading, setLoading] = useState(false);
  // const [page, setPage] = useState(1);
  // const pageSize = 20; // Number of items to load per page
  // const [totalOptionsCount, setTotalOptionsCount] = useState(0);
  // const [searchText, setSearchText] = useState("");

  // useEffect(() => {
  //   console.log("checkr8 selectedDept in create risk form", selectedDept);
  //   console.log("checkr8 formType in create risk form", formType);
  //   console.log("checkr8 selectedAspImpId in create risk form", selectedAspImpId);
    
  // }, [selectedDept]);


  useEffect(() => {
    // console.log("checkr8 isFormDisabled--->", isFormDisabled);
    
    const conditionOptions = existingRiskConfig?.condition?.map(
      (config: any) => ({
        label: config.name,
        value: config._id,
      })
    );
    const interestedPartiesOptions = existingRiskConfig?.interestedParties?.map(
      (config: any) => ({
        label: config.name,
        value: config._id,
      })
    );
    setConditionOptions(conditionOptions);
    setInterestedPartiesOptions(interestedPartiesOptions);
    //function to get hazard types and impact types for hira register
    getAspectTypeOptions();
    getImpactTypeOptions();
    getActOptions();

    if ((!!riskId && formType === "edit")) {
      // console.log("checkrisk condition matched for HIRA");
      setLoadingFormValues(true);
      setValuesInAspImpForm();
      }
      // console.log("checkrisk formType in create risk form", formType);
      
    if(formType === "create" && selectedAspImpId) {
      // console.log("checkriske in fomrmtype create", selectedAspImpId);
      
      setLoadingFormValues(true);
      setValuesInAspImpForm();
    }
    // }
  }, [addModalOpen, formType]);

  // useEffect(() => {
  //   console.log(
  //     "checkrisk existingRiskConfig in create risk form",
  //     existingRiskConfig
  //   );
  // }, [existingRiskConfig]);

  useEffect(() => {
    if (handleRiskFormCreated) {
      handleRiskFormCreated(firstForm);
    }
  }, [firstForm, handleRiskFormCreated]);



  // useEffect(() => {
  //   console.log("checkrisk tab 1 form data in tab 1", formData);
  // }, [formData]);

  // useEffect(() => {
  //   console.log(
  //     "checkrisk interestedPartiesOptions in create risk form",
  //     interestedPartiesOptions
  //   );
  // }, [interestedPartiesOptions]);

  // useEffect(() => {
  //   console.log(
  //     "checkrisk locationWiseUsers in create risk form",
  //     locationWiseUsers
  //   );
  // }, [locationWiseUsers]);

  const setValuesInAspImpForm = async () => {
    try {
      // console.log("checkriske registerdata in setValuesInAspImpForm", riskRegisterData);
      // console.log("checkriske selectedAspImpId in setValuesInAspImpForm", selectedAspImpId);
      
      firstForm.setFieldsValue({
        jobTitle: riskRegisterData?.jobTitle,
        activity: riskRegisterData?.activity,
        ...(!!riskId ? { aspectType: !!riskRegisterData?.aspectType
          ? riskRegisterData.aspectType?._id
          : undefined,
        specificEnvAspect: riskRegisterData?.specificEnvAspect,
        impactType: !!riskRegisterData?.impactType
          ? riskRegisterData.impactType._id
          : undefined,
        specificEnvImpact: riskRegisterData?.specificEnvImpact} : {}),
        entity: riskRegisterData?.entity?.id,
        assesmentTeam: riskRegisterData?.assesmentTeam,
        act: !!riskRegisterData?.act ? riskRegisterData.act?._id : undefined, //associated hazard
        legalImpact: riskRegisterData?.legalImpact,
        condition: riskRegisterData?.condition?._id, 
        interestedParties: riskRegisterData?.interestedParties?.map(
          (item: any) => item?._id
        ),
        existingControl: riskRegisterData?.existingControl,
        additionalAssessmentTeam: riskRegisterData?.additionalAssessmentTeam,
      });
      setFormData({
        ...formData,
        jobTitle: riskRegisterData?.jobTitle,
        activity: riskRegisterData?.activity,
        ...(!!riskId
          ? {
              aspectType: !!riskRegisterData?.aspectType
                ? riskRegisterData.aspectType?._id
                : undefined,
              specificEnvAspect: riskRegisterData?.specificEnvAspect,
              impactType: !!riskRegisterData?.impactType
                ? riskRegisterData.impactType._id
                : undefined,
              specificEnvImpact: riskRegisterData?.specificEnvImpact,
            }
          : {}),
        assesmentTeam: riskRegisterData?.assesmentTeam?.map((item: any) => ({
          ...item,
          label: item?.username,
        })),
        additionalAssessmentTeam: riskRegisterData?.additionalAssessmentTeam,
        condition: riskRegisterData?.condition?._id,
        interestedParties: riskRegisterData?.interestedParties,
        act: !!riskRegisterData?.act ? riskRegisterData.act?._id : undefined,
        legalImpact: riskRegisterData?.legalImpact,
        existingControl: riskRegisterData?.existingControl,
        ...(!!selectedAspImpId
          ? {
              preProbability: null,
              preSeverity: null,
              postProbability: null,
              postSeverity: null,
              preMitigation: null,
              postMitigation: null,
              preMitigationScore: null,
              postMitigationScore: null,
            }
          : {}),
      });
      setLoadingFormValues(false);
    } catch (error) {
      console.log("error", error);
    }
  };
  const getAspectTypeOptions = async () => {
    try {
      const res = await axios.get(
        `/api/aspect-impact/getAspectTypes?master=true&locationId=${userDetails?.location?.id}&orgId=${userDetails?.organizationId}`
      );
      // console.log("checkrisk res in getHazardTypeOptions", res);
      if (res.status === 200) {
        if (res?.data && !!res?.data?.data?.length) {
          const aspectTypeOptions = res?.data?.data?.map((hazard: any) => ({
            label: hazard.name,
            value: hazard._id,
          }));
          setAspectTypeOptions(aspectTypeOptions);
        } else {
          setAspectTypeOptions([]);
          enqueueSnackbar("No Aspect Types found for Aspect Impact config", {
            variant: "warning",
          });
        }
      } else {
        setAspectTypeOptions([]);
        enqueueSnackbar("Something went wrong while fetching Aspect Types", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while fetching Aspect Types", {
        variant: "error",
      });
      // console.log("checkrisk error in getHiraTypesOptions ", error);
    }
  };

  const getImpactTypeOptions = async () => {
    try {
      const res = await axios.get(
        `/api/aspect-impact/getImpactTypes?master=true&locationId=${userDetails?.location?.id}&orgId=${userDetails?.organizationId}`
      );
      // console.log("checkrisk res in getImpactTypeOptions", res);
      if (res.status === 200) {
        if (res?.data && !!res?.data?.data?.length) {
          const impactTypeOptions = res?.data?.data?.map((impact: any) => ({
            label: impact.name,
            value: impact._id,
          }));
          setImpactTypeOptions(impactTypeOptions);
        } else {
          setImpactTypeOptions([]);
          enqueueSnackbar("No Impact Types found for Aspect Type Config", {
            variant: "warning",
          });
        }
      } else {
        setImpactTypeOptions([]);
        enqueueSnackbar("Something went wrong while fetching impact types", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while fetching impact types", {
        variant: "error",
      });
      // console.log("checkrisk error in getHiraTypesOptions ", error);
    }
  };

  const getActOptions = async () => {
    try {
      const res = await axios.get(
        `/api/aspect-impact/getActs?orgId=${userDetails?.organizationId}`
      );
      // console.log("checkrisk res in getImpactTypeOptions", res);
      if (res.status === 200) {
        if (res?.data && !!res?.data?.data?.length) {
          // console.log("checkrisk8 res in getActOptions", res?.data?.data);
          
          // const impactTypeOptions = res?.data?.data?.map((impact: any) => ({
          //   label: impact.name,
          //   value: impact._id,
          // }));
          // console.log("checkrisk8 impactTypeOptions in getActOptions", impactTypeOptions);
          const newActOptions = res?.data?.data?.map((item: any) => ({
            label: item.name,
            value: item._id,
          }));
          // console.log("checkrisk8 newActOptions in getActOptions", newActOptions);
          
          setActOptions([...newActOptions]);
        } else {
          setActOptions([]);
          enqueueSnackbar("No Acts found for Aspect Type Config", {
            variant: "warning",
          });
        }
      } else {
        setActOptions([]);
        enqueueSnackbar("Something went wrong while fetching Acts", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while fetching Acts", {
        variant: "error",
      });
      // console.log("checkrisk error in getHiraTypesOptions ", error);
    }
  };

  return (
    <>
      {loadingFormValues ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      ) : (
        <Form
          form={firstForm}
          layout="vertical"
          initialValues={{
            jobTitle: formData?.jobTitle || "",
            activity: formData?.activity || "",
            entity: selectedDept?.id
          }}
          onValuesChange={(changedValues, allValues) => {
            // console.log("checkrisk changed values", changedValues);
            // console.log("checkrisk all values", allValues);
            setFormData({ ...formData, ...changedValues });
          }}
          rootClassName={classes.labelStyle}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Life Cycle Stage: "
                name="jobTitle"
                rules={[
                  {
                    required: true,
                    message: "Please Input Your Life Cycle Stage!",
                  },
                ]}
              >
                <Input
                  // value={formData?.jobTitle || ""}
                  placeholder="Enter Life Cycle Stage"
                  size="large"
                  disabled={isFormDisabled}
                />
              </Form.Item>
            </Col>
            {/* <Col span={12}>
              <Form.Item label="Section: " name="section">
                <Input placeholder="Enter Section" size="large" />
              </Form.Item>
            </Col> */}
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={matches ? 12 : 24}>
              <Form.Item
                label="Corp Func/Unit: "
                // name=""
              >
                <Input
                  // placeholder="Enter Activity"
                  size="large"
                  value={
                    formType === "edit"
                      ? riskRegisterData?.location?.locationName
                      : userDetails?.location?.locationName
                  }
                  disabled={true}
                  className={classes.textFields}
                  style={{ backgroundColor: "white", color: "black" }}
                />
              </Form.Item>
            </Col>
            <Col span={matches ? 12 : 24}>
              {entityOptionsForDeptHead?.length ? (
                <Form.Item
                  label="Select Dept/Vertical: "
                  // className={classes.disabledInput}
                  // style={{ marginBottom: 0 }}
                  name="entity"
                  rules={[
                    {
                      required: true,
                      message: "Please Select Entity!",
                    },
                  ]}
                >
                  {/* <Select
                    showSearch
                    // placeholder="Filter By Area/Deparment"
                    size="large"
                    placeholder="Select Dept/Vertical"
                    optionFilterProp="children"
                    filterOption={(input: any, option: any) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={{
                      width: "100%",
                      backgroundColor: "white",
                      color: "black",
                    }}
                    value={selectedEntityForDeptHead}
                    options={entityOptionsForDeptHead || []}
                    onChange={(value) => setSelectedEntityForDeptHead(value)}
                    listHeight={200}
                    disabled={isFormDisabled}
                  /> */}
                  <DepartmentSelector
                    locationId={userDetails?.location?.id}
                    selectedDepartment={selectedDept}
                    onSelect={(dept, type) => {
                      setSelectedDept({ ...dept, type });
                      firstForm.setFieldsValue({
                        entity: dept?.id,
                      });
                    }}
                    onClear={() => {
                      firstForm.setFieldsValue({
                        entity: undefined,
                      });
                      setSelectedDept(null);
                    }}
                    disabled={true}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  className={classes.disabledInput}
                  label="Dept/Vertical:"
                  // style={{ marginBottom: 0 }}
                  // name="unit"
                >
                  {/* <Input
                    // placeholder="Enter Area"
                    value={
                      formType === "edit"
                        ? riskRegisterData?.entity?.entityName
                        : userDetails?.entity?.entityName
                    }
                    size="large"
                    disabled={true}
                    style={{ backgroundColor: "white", color: "black" }}
                  /> */}

                  <DepartmentSelector
                    locationId={userDetails?.location?.id}
                    selectedDepartment={selectedDept}
                    onSelect={(dept, type) => {}}
                    onClear={() => {}}
                    disabled={true}
                  />
                </Form.Item>
              )}
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Activity: "
                name="activity"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Activity!",
                  },
                ]}
              >
                <Input
                  placeholder="Enter Activity"
                  size="large"
                  disabled={isFormDisabled}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Select Aspect Type: "
                name="aspectType"
                rules={[
                  {
                    required: true,
                    message: "Please Select Aspect Type!",
                  },
                ]}
              >
                <Select
                  placeholder="Select Aspect Type"
                  disabled={isFormDisabled}
                  options={aspectTypeOptions}
                  size="large"
                  showSearch
                  filterOption={(input: any, option: any) =>
                    option?.label
                      ?.toLowerCase()
                      .indexOf(input?.toLowerCase()) >= 0
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Specific Environmental Aspect: "
                name="specificEnvAspect"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Aspect Description!",
                  },
                ]}
              >
                {/* <Input
                  placeholder="Enter Specific Environmental Aspect"
                  size="large"
                  disabled={isFormDisabled}
                /> */}
                <TextArea
                  disabled={isFormDisabled}
                  rows={3}
                  placeholder="Enter Specific Environmental Aspect"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Select Environmental Impact Type: "
                name="impactType"
                rules={[
                  {
                    required: true,
                    message: "Please Select Impact Type!",
                  },
                ]}
              >
                <Select
                  placeholder="Select Environmental Impact Type"
                  options={impactTypeOptions}
                  disabled={isFormDisabled}
                  size="large"
                  showSearch
                  filterOption={(input: any, option: any) =>
                    option?.label
                      ?.toLowerCase()
                      .indexOf(input?.toLowerCase()) >= 0
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Specific Environmental Impact: "
                name="specificEnvImpact"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Impact Description!",
                  },
                ]}
              >
                {/* <Input
                  placeholder="Enter Specific Environmental Impact"
                  size="large"
                  disabled={isFormDisabled}
                /> */}
                <TextArea
                  disabled={isFormDisabled}
                  rows={3}
                  placeholder="Enter Specific Environmental Impact"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={matches ? 12 : 24}>
              <Form.Item
                label="Select Condition: "
                name="condition"
                rules={[
                  {
                    required: true,
                    message: "Please Select Condition!",
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Select condition"
                  options={conditionOptions}
                  size="large"
                  disabled={isFormDisabled}
                  filterOption={(input: any, option: any) =>
                    option?.label
                      ?.toLowerCase()
                      .indexOf(input?.toLowerCase()) >= 0
                  }
                />
              </Form.Item>
            </Col>
            <Col span={matches ? 12 : 24}>
              <Form.Item
                label="Select Assesment Team: "
                name="assesmentTeam"
                required
              >
                <AutoComplete
                  suggestionList={locationWiseUsers ? locationWiseUsers : []}
                  name=""
                  keyName="assesmentTeam"
                  formData={formData}
                  // disabled={false}
                  labelKey="label"
                  setFormData={setFormData}
                  disabled={isFormDisabled}
                  multiple={true}
                  getSuggestionList={() => {}}
                  defaultValue={
                    formData?.assesmentTeam?.length
                      ? formData.assesmentTeam
                      : []
                  }
                  type="RA"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Additional Assessment Team: "
                name="additionalAssessmentTeam"
                // rules={[
                //   {
                //     required: true,
                //     message: "Please Enter Team!",
                //   },
                // ]}
              >
                {/* <Input
                  placeholder="Enter Specific Environmental Impact"
                  size="large"
                  disabled={isFormDisabled}
                /> */}
                <TextArea
                  disabled={isFormDisabled}
                  rows={3}
                  placeholder="Enter Team"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Select Interested Parties: "
                name="interestedParties"
                // rules={[
                //   {
                //     required: true,
                //     message: "Please Select Interested Parties!",
                //   },
                // ]}
              >
                <Select
                  disabled={isFormDisabled}
                  showSearch
                  placeholder="Select Interested Parties"
                  mode="multiple"
                  options={interestedPartiesOptions}
                  size="large"
                  filterOption={(input: any, option: any) =>
                    option?.label
                      ?.toLowerCase()
                      .indexOf(input?.toLowerCase()) >= 0
                  }
                />
                {/* <AutoComplete
                  suggestionList={
                    interestedPartiesOptions ? interestedPartiesOptions : []
                  }
                  name=""
                  keyName="interestedParties"
                  formData={formData}
                  disabled={false}
                  labelKey="label"
                  setFormData={setFormData}
                  multiple={true}
                  getSuggestionList={() => {}}
                  defaultValue={
                    formData?.interestedParties?.length
                      ? formData.interestedParties
                      : []
                  }
                  type="RA"
                /> */}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Select Corresponding Act: "
                name="act"
                rules={[
                  {
                    required: true,
                    message: "Please Select Corresponding Act!",
                  },
                ]}
              >
                <Select
                  placeholder="Select Corresponding Act"
                  options={actOptions}
                  disabled={isFormDisabled}
                  size="large"
                  showSearch
                  filterOption={(input: any, option: any) =>
                    option?.label
                      ?.toLowerCase()
                      .indexOf(input?.toLowerCase()) >= 0
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Legal Impact: "
                name="legalImpact"
                rules={[
                  { required: true, message: "Please Select Legal Impact!" },
                ]}
              >
                <Radio.Group disabled={isFormDisabled}>
                  <Radio value={"Yes"}>Yes</Radio>
                  <Radio value={"No"}>No</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item
                label="Exisitng Control: "
                name="existingControl"
                rules={[
                  { required: true, message: "Please Enter Existing Control!" },
                ]}
              >
                <TextArea
                  disabled={isFormDisabled}
                  rows={4}
                  placeholder="Enter Exisitng Control"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </>
  );
};

export default CreateRiskFormTab;
