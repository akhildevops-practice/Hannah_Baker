//react, react-router
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

//antd
import { Tabs, Drawer, Space, Button } from "antd";

//material-ui
import { useMediaQuery } from "@material-ui/core";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
//utils
import axios from "apis/axios.global";

//components
import ControlMeasureDetailsTab from "components/Risk/Hira/HiraRegister/ControlMeasureDrawer/ControlMeasureDetailsTab";
// import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";
import PostMitigationScoreModal from "components/Risk/Hira/HiraRegister/ControlMeasureDrawer/PostMitigationScoreModal";

import CommonReferencesTab from "components/CommonReferencesComponents/CommonReferencesTab";


//styles
import useStyles from "./styles";

//thirdparty libs
import { useSnackbar } from "notistack";
import moment from "moment";
import getSessionStorage from "utils/getSessionStorage";

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
}: Props) => {
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
  const [postProbability, setPostProbability] = useState<any>(0);
  const [postSeverity, setPostSeverity] = useState<any>(0);
  //to store severity and probablity, it will be like [3,5] first index is severity and probablity
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const { enqueueSnackbar } = useSnackbar();
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const classes = useStyles();
  //disable whole form if logged in user is not from the same department
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const userDetails = getSessionStorage()
  const url = "/api/riskregister/hira-register";

  // useEffect(() => {
  //   console.log("form data in mitigation drawer", referencesNew);
  // }, [referencesNew]);

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

  useEffect(() => {
    console.log("checkrisk selectedCell in drawer", selectedCell);
    if (!!selectedCell && selectedCell?.length === 2) {
      setPostSeverity(selectedCell[0] + 1);
      setPostProbability(selectedCell[1] + 1);
    }
  }, [selectedCell]);

  // useEffect(() => {
  //   console.log(
  //     "checkrisk postSeverity, postProbability in drawer",
  //     postSeverity,
  //     postProbability
  //   );
  //   console.log("checkrisk CHECK PRESCORE", postScore);
  // }, [postSeverity, postProbability]);

  useEffect(() => {
    console.log("checkrisk mitigationModal", mitigationModal);

    if (mitigationModal?.mode === "edit") {
      // console.log("checkrisk mitigationModal", mitigationModal);
        if(!!mitigationModal?.data?.parentRecord?.entityId) {
          console.log("checkrisk mitigationModal", mitigationModal);
          
          if(mitigationModal?.data?.parentRecord?.entityId !== userDetails?.entity?.id) {
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
  }, [mitigationModal]);

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

      if(!commentsNew) {
        enqueueSnackbar("Please Enter Additional Control Measures", {
          variant: "warning",
        });
        return;
      }

      const isValidDate = (date: any) => {
        return !isNaN(Date.parse(date));
      };
      let mitigationData: any = {
        title: formData.title || "",
        stage: formData.stage || "",
        status: statusNew || "",
        targetDate: isValidDate(targetDateNew) ? targetDateNew : "",
        comments: commentsNew || "",
        references: referencesNew || "",
      };
      const data = {
        riskId: mitigationModal?.data?.riskId,
        mitigationData,
      };

      // console.log(mitigationModal, mitigationData);

      if (!!postMitigation && postScore > 0) {
        const timestamp = moment().toISOString();
        mitigationData = {
          ...mitigationData,
          lastScoreUpdatedAt: timestamp,
          lastScore: postScore,
        };
        await handleSubmitPostMitigation({
          postMitigation: postMitigation,
          postMitigationScore: postScore,
          postSeverity: postSeverity,
          postProbability: postProbability,
        });
      }

      // console.log("checkrisk postMitigation data", postMitigation, postScore);

      if (mitigationModal.mode === "create") {
        postMitigationData(data);
      } else {
        console.log("mitigationData in updated", mitigationData);

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
        maskClosable={false}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
        width={isSmallScreen ? "85%" : "40%"}
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
              >
                Submit
              </Button>
            </Space>
          </>
        }
      >
        <div className={classes.tabsWrapper}>
          <div
            onClick={toggleScoreModal}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              cursor: "pointer",
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
                    backgroundColor: "yellow",
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
          <Tabs
            onChange={onChange}
            type="card"
            items={tabs as any}
            animated={{ inkBar: true, tabPane: true }}
            // tabBarStyle={{backgroundColor : "green"}}
          />
        </div>
      </Drawer>
    </>
  );
};

export default ControlMeasureDrawer;
