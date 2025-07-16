//react, react-router
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

//antd
import { Tabs, Drawer, Space, Button } from "antd";

//material-ui
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useMediaQuery,
} from "@material-ui/core";

//utils
import axios from "apis/axios.global";

//components
import ControlMeasureDetailsTab from "components/Risk/AspectImpact/AspectImpactRegister/ControlMeasureDrawer/ControlMeasureDetailsTab";
// import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";
import PostMitigationScoreModal from "components/Risk/AspectImpact/AspectImpactRegister/ControlMeasureDrawer/PostMitigationScoreModal";

import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";

//styles
import useStyles from "./styles";

//thirdparty libs
import { useSnackbar } from "notistack";
import moment from "moment";
import getSessionStorage from "utils/getSessionStorage";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
type Props = {
  mitigationModal?: any;
  setMitigationModal?: any;
  existingRiskConfig?: any;
  fetchRisks?: any;
  fetchAspImps?: any;
  tableData?: any;
  setTableData?: any;
  postMitigation?: any;
  setPostMitigation?: any;
  postScore?: any;
  setPostScore?: any;
  isWorkflowPage?: any;
  reloadListAfterSubmit?: any;
  hiraInWorkflow?: any;
  handleAddDeptInChangesTrack?: any;
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

const ControlMeasureDrawer = ({
  mitigationModal,
  setMitigationModal,
  existingRiskConfig,
  fetchRisks,
  tableData,
  setTableData,
  fetchAspImps,
  postMitigation,
  setPostMitigation,
  postScore,
  setPostScore,
  isWorkflowPage = false,
  reloadListAfterSubmit,
  hiraInWorkflow = null,
  handleAddDeptInChangesTrack,
}: Props) => {
  const matches = useMediaQuery("(min-width:822px)");
  const params = useParams();
  const [statusNew, setStatusNew] = useState<boolean>(true);
  const [targetDateNew, setTargetDateNew] = useState<any>();
  const [commentsNew, setCommentsNew] = useState<string>("");
  const [formData, setFormData] = useState<any>();
  const [referencesNew, setReferencesNew] = useState<any>([]);
  const [mitigationForm, setMitigationForm] = useState<any>([]);
  const [levelColor, setLevelColor] = useState<any>("yellow");

  const [postMitigationScoreModal, setPostMitigationScoreModal] = useState<any>(
    {
      open: false,
      mode: mitigationModal.mode,
      data: {},
    }
  );

  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: false,
  });
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [postProbability, setPostProbability] = useState<any>(0);
  const [postSeverity, setPostSeverity] = useState<any>(0);
  //to store severity and probablity, it will be like [3,5] first index is severity and probablity
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const { enqueueSnackbar } = useSnackbar();
  const isSmallScreen = useMediaQuery("(max-width:820px)");
  const classes = useStyles();
  const userDetails = getSessionStorage();
  const location = useLocation();
  const url = "/api/aspect-impact";

  // useEffect(() => {
  //   console.log("form data in mitigation drawer", referencesNew);
  // }, [referencesNew]);

  useEffect(() => {
    if (!!location) {
      if (
        location?.pathname?.includes("/review") ||
        location?.pathname?.includes("/revisionHistory")
      ) {
        setIsFormDisabled(true);
      }
    }
  }, [mitigationModal?.open]);

  useEffect(() => {
    // console.log("checkrisk selectedCell in drawer", selectedCell);
    if (!!selectedCell && selectedCell?.length === 2) {
      setPostSeverity(selectedCell[1] + 1);
      setPostProbability(selectedCell[0] + 1);
    }
  }, [selectedCell]);

  const handleMitigationFormCreated = (form: any) => {
    setMitigationForm(form);
  };

  const loadDatainRiskMatrix = () => {
    // console.log("checkrisk postmitigation not exist", postMitigation);
    const hiraMatrixData = existingRiskConfig?.hiraMatrixData;

    if (!!hiraMatrixData && !!hiraMatrixData.length) {
      const newPostMitigation = [...hiraMatrixData];
      setPostMitigation(newPostMitigation);
      setPostScore(0);
    }
  };

  // useEffect(()=>{
  //   console.log("checkrisk hiraInWorkflow in acm");

  // },[])

  useEffect(() => {
    console.log("checkrisk mitigationModal hiraInWorkflow", hiraInWorkflow);
    if (mitigationModal?.mode === "edit") {
      if (
        !!mitigationModal?.data &&
        !!mitigationModal?.data?.parentRecord?.postProbability &&
        !!mitigationModal?.data?.parentRecord?.postSeverity
      ) {
        setSelectedCell([
          mitigationModal?.data?.parentRecord?.postSeverity - 1,
          mitigationModal?.data?.parentRecord?.postProbability - 1,
        ]);
        setPostProbability(
          mitigationModal?.data?.parentRecord?.postProbability
        );
        setPostSeverity(mitigationModal?.data?.parentRecord?.postSeverity);
      }
      if (!!mitigationModal?.data?.parentRecord?.entityId) {
        console.log("checkrisk mitigationModal", mitigationModal);

        if (
          mitigationModal?.data?.parentRecord?.entityId !==
          userDetails?.entity?.id
        ) {
          setIsFormDisabled(true);
        }

        if (mitigationModal?.data?.mitigationStatus === "inWorkflow") {
          setIsFormDisabled(true);
        }
      }

      if (
        !!mitigationModal?.data?.parentRecord?.postMitigation &&
        !!mitigationModal?.data?.parentRecord?.postMitigation.length
      ) {
        // console.log("checkrisk postmitigation exists", postMitigation);

        setPostMitigation(mitigationModal?.data?.parentRecord.postMitigation);

        setPostScore(mitigationModal?.data?.parentRecord.postMitigationScore);
      } else {
        loadDatainRiskMatrix();
      }
    } else {
      loadDatainRiskMatrix();
    }
  }, [mitigationModal, hiraInWorkflow]);

  // useEffect(() => {
  //   console.log("checkrisk selectedCell in drawer", selectedCell);
  //   if (!!selectedCell && selectedCell?.length === 2) {
  //     setPostSeverity(selectedCell[0] + 1);
  //     setPostProbability(selectedCell[1] + 1);
  //   }
  // }, [selectedCell]);

  // useEffect(() => {
  //   console.log(
  //     "checkrisk postSeverity, postProbability in drawer",
  //     postSeverity,
  //     postProbability
  //   );
  //   console.log("checkrisk CHECK PRESCORE", postScore);
  // }, [postSeverity, postProbability]);

  const tabs = [
    {
      label: "Mitigation",
      key: 1,
      children: (
        <ControlMeasureDetailsTab
          mitigationModal={mitigationModal}
          setMitigationModal={setMitigationModal}
          fetchRisks={fetchRisks}
          // fetchAspImps={fetchAspImps}
          setStatusNew={setStatusNew}
          setTargetDateNew={setTargetDateNew}
          commentsNew={commentsNew}
          setCommentsNew={setCommentsNew}
          formData={formData}
          setFormData={setFormData}
          setReferencesNew={setReferencesNew}
          handleMitigationFormCreated={handleMitigationFormCreated}
          existingRiskConfig={existingRiskConfig}
          postMitigation={postMitigation}
          setPostMitigation={setPostMitigation}
          postScore={postScore}
          setPostScore={setPostScore}
          levelColor={levelColor}
          setLevelColor={setLevelColor}
          isFormDisabled={isFormDisabled}
        />
      ),
    },
    {
      label: "References",
      key: 2,
      children: (
        <CommonReferencesTab drawer={drawer} />
        // <CommonReferencesTab
        //   drawer={drawer}
        // />
      ),
    },
  ];

  const onChange = (key: string) => {
    console.log(key);
  };

  const handleCloseModal = () => {
    const updatedData = tableData.map((item: any) => ({
      ...item,
      highlight: false,
    }));
    setTableData(updatedData);
    setMitigationModal({
      ...mitigationModal,
      data: {},
      open: !mitigationModal.open,
    });
  };

  const onStatusChange = (checked: boolean) => {
    setStatusNew(checked);
  };

  const handleSubmit = async () => {
    try {
      await mitigationForm.validateFields();
      const isValidDate = (date: any) => {
        return !isNaN(Date.parse(date));
      };
      let mitigationData: any = {
        // title: formData.title || "",
        stage: formData.stage || "",
        status: statusNew || "",
        // targetDate: isValidDate(targetDateNew) ? targetDateNew : "",
        targetDate:
          formData?.targetDate && formData?.targetDate?.format("DD/MM/YYYY"),
        comments: formData?.additionalControlMeasure || "",
        completionDate:
          formData?.completionDate &&
          formData?.completionDate?.format("DD/MM/YYYY"),
        responsiblePerson: formData?.responsiblePerson || "",
        references: referencesNew || "",
        postSeverity: selectedCell?.length ? selectedCell[0] + 1 : null,
        postProbability: selectedCell?.length ? selectedCell[1] + 1 : null,
      };
      let data: any = {
        riskId: mitigationModal?.data?.riskId,
        mitigationData,
      };

      if (!postSeverity || !postProbability) {
        enqueueSnackbar("Please Select Score!", {
          variant: "warning",
        });
        return;
      }

      // console.log(mitigationModal, mitigationData);
      if (hiraInWorkflow && hiraInWorkflow?.status === "APPROVED") {
        console.log(
          "checkrisk hiraInWorkflow in acm in call handleDeptChangesTrack",
          hiraInWorkflow
        );

        // setShowDraftStatus(true);
        handleAddDeptInChangesTrack();
      }
      if (!!postMitigation && postScore > 0) {
        const timestamp = moment().toISOString();

        mitigationData = {
          ...mitigationData,
          lastScoreUpdatedAt: timestamp,
          lastScore: postScore,
        };
      }

      // if(postScore > 0) {
      //   data = {
      //     ...data,

      //   }
      // }

      console.log("checkrisk postMitigation data", data);

      if (mitigationModal.mode === "create") {
        await handleSubmitPostMitigation({
          postMitigation: postMitigation,
          postMitigationScore: postScore,
          postSeverity: postSeverity,
          postProbability: postProbability,
        });
        postMitigationData(data);
      } else {
        console.log("mitigationData in updated", mitigationData);
        await handleSubmitPostMitigation({
          postMitigation: postMitigation,
          postMitigationScore: postScore,
          postSeverity: postSeverity,
          postProbability: postProbability,
        });
        putMitigation(mitigationData, mitigationModal);
      }
    } catch (error) {
      //log form errror if needed
      console.log("in mitigation handleSubmit", error);
    }
  };

  const postMitigationData = async (data: any) => {
    try {
      const res = await axios.post(`${url}/addmitigation`, data);
      console.log("res", res);
      if (res.status === 200 || res.status === 201) {
        setMitigationModal({
          ...mitigationModal,
          data: {},
          open: !mitigationModal.open,
        });
        enqueueSnackbar("Risk Mitigation Added Successfully", {
          variant: "success",
        });
        if (isWorkflowPage) {
          // fetchRisks(formData?.jobTitle);
          reloadListAfterSubmit();
        } else {
          // fetchRisks("All");
          reloadListAfterSubmit();
        }
      }
    } catch (error) {
      console.log("error in post mitigation", error);
    }
  };

  const putMitigation = async (data: any, mitigationModal: any) => {
    try {
      const res = await axios.put(
        `${url}/updatemitigation/${mitigationModal.data.id}`,
        data
      );
      console.log("res", res);
      if (res.status === 200 || res.status === 201) {
        setMitigationModal({
          ...mitigationModal,
          data: {},
          open: !mitigationModal.open,
        });
        enqueueSnackbar("Risk Mitigation Updated Successfully", {
          variant: "success",
        });
        if (isWorkflowPage) {
          // fetchRisks(formData?.jobTitle);
          reloadListAfterSubmit();
        } else {
          // fetchRisks("All");
          reloadListAfterSubmit();
        }
      }
    } catch (error) {
      console.log("error in post mitigation", error);
    }
  };

  const handleSubmitPostMitigation = async (data: any) => {
    try {
      const res = await axios.put(
        `${url}/${mitigationModal?.data?.riskId}`,
        data
      );
      console.log("res", res);
      if (res.status === 200 || res.status === 201) {
        if (isWorkflowPage) {
          // fetchRisks(formData?.jobTitle);
          reloadListAfterSubmit();
        } else {
          // fetchRisks("All");
          reloadListAfterSubmit();
        }
        return;
      }
    } catch (error) {}
  };

  const toggleScoreModal = () => {
    setPostMitigationScoreModal({
      ...postMitigationScoreModal,
      open: !postMitigationScoreModal.open,
    });
  };

  // for mobile tab select design

  const [selectedValue, setSelectedValue] = useState("Mitigation");
  console.log("selectedValue", selectedValue);
  const handleDataChange = (e: any) => {
    setSelectedValue(e.target.value);
  };

  return (
    <>
      <Drawer
        title={[
          <span
            key="title"
            style={isSmallScreen ? { fontSize: "13px" } : { fontSize: "16px" }}
          >
            {mitigationModal.mode === "create"
              ? "Add Additional Control Measure"
              : "Edit Additional Control Measure"}
          </span>,
        ]}
        placement="right"
        open={mitigationModal.open}
        closable={true}
        onClose={handleCloseModal}
        className={classes.drawerHeader}
        width={matches ? "50%" : "90%"}
        maskClosable={false}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
        extra={
          <>
            <Space>
              {/* <Switch
                style={
                  isSmallScreen
                    ? { minWidth: "32px" }
                    : { paddingRight: "5px", marginRight: "15px" }
                }
                checked={statusNew}
                onChange={onStatusChange}
              /> */}
              <Button
                style={isSmallScreen ? { padding: "3px 5px" } : {}}
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button
                style={isSmallScreen ? { padding: "3px 5px" } : {}}
                onClick={handleSubmit}
                type="primary"
                disabled={isFormDisabled}
              >
                Submit
              </Button>
            </Space>
          </>
        }
      >
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
                Score : {!!postScore && postScore > 0 && postScore}
              </div>
              {!!postScore && postScore > 0 && (
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: determineColor(
                      postScore,
                      existingRiskConfig?.riskIndicatorData
                    ),
                  }}
                ></div>
              )}
            </div>
          </div>
          {!!postMitigationScoreModal.open && (
            <PostMitigationScoreModal
              postMitigationScoreModal={postMitigationScoreModal}
              toggleScoreModal={toggleScoreModal}
              existingRiskConfig={existingRiskConfig}
              // setConfigData={setConfigData}
              postMitigation={postMitigation}
              setPostMitigation={setPostMitigation}
              postScore={postScore}
              setPostScore={setPostScore}
              levelColor={levelColor}
              setLevelColor={setLevelColor}
              selectedCell={selectedCell}
              setSelectedCell={setSelectedCell}
            />
          )}
          {matches ? (
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
                  <MenuItem value={"Mitigation"}>
                    <div
                      style={{
                        backgroundColor:
                          selectedValue === "Mitigation" ? "#3576BA" : "white",
                        textAlign: "center",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        color:
                          selectedValue === "Mitigation" ? "white" : "black",
                      }}
                    >
                      {" "}
                      Mitigation
                    </div>
                  </MenuItem>
                  <MenuItem value={"References"}>
                    {" "}
                    <div
                      style={{
                        backgroundColor:
                          selectedValue === "References" ? "#3576BA" : "white",
                        textAlign: "center",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        color:
                          selectedValue === "References" ? "white" : "black",
                      }}
                    >
                      References
                    </div>
                  </MenuItem>
                </Select>
              </FormControl>
            </div>
          )}
          {matches ? (
            ""
          ) : (
            <div style={{ marginTop: "15px" }}>
              {selectedValue === "Mitigation" ? (
                <div>
                  {" "}
                  <ControlMeasureDetailsTab
                    mitigationModal={mitigationModal}
                    setMitigationModal={setMitigationModal}
                    fetchRisks={fetchRisks}
                    // fetchAspImps={fetchAspImps}
                    setStatusNew={setStatusNew}
                    setTargetDateNew={setTargetDateNew}
                    commentsNew={commentsNew}
                    setCommentsNew={setCommentsNew}
                    formData={formData}
                    setFormData={setFormData}
                    setReferencesNew={setReferencesNew}
                    handleMitigationFormCreated={handleMitigationFormCreated}
                    existingRiskConfig={existingRiskConfig}
                    postMitigation={postMitigation}
                    setPostMitigation={setPostMitigation}
                    postScore={postScore}
                    setPostScore={setPostScore}
                    levelColor={levelColor}
                    setLevelColor={setLevelColor}
                    isFormDisabled={isFormDisabled}
                  />
                </div>
              ) : (
                ""
              )}
              {selectedValue === "References" ? (
                <div>
                  {" "}
                  <CommonReferencesTab drawer={drawer} />
                </div>
              ) : (
                ""
              )}
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default ControlMeasureDrawer;
