//react, react-router, recoil
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

//material-ui
import { Menu, MenuItem, CircularProgress, Grid } from "@material-ui/core";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import { Theme, makeStyles, Tooltip } from "@material-ui/core";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
//antd
import { Tabs, Layout, Space, Button } from "antd";

//thirdparty libs
import { useSnackbar } from "notistack";

//utils
import checkRoles from "utils/checkRoles";
import {
  hiraConfig,
  HiraConfigSchema,
  riskConfig,
  RiskConfigSchema,
} from "schemas/riskConfigSchema";
import axios from "apis/axios.global";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";

//assets
import { ReactComponent as ShrinkIcon } from "assets/icons/shrink-new.svg";
import { ReactComponent as AllDocIcon } from "assets/documentControl/All-Doc.svg";
//components
import RiskConfigurationStepperForm2 from "components/RiskRegister/RiskConfiguration/RiskConfifurationFormStepper/RiskConfigurationStepperForm2";
import HiraTypesTab from "components/RiskRegister/RiskConfiguration/HiraTypesTab";
import HiraConfigurationTab from "components/Risk/Hira/HiraConfiguration/HiraConfigurationTab";
import HiraHazardTypesTab from "components/Risk/Hira/HiraConfiguration/HiraHazardTypesTab";
import HiraImpactTypesTab from "components/Risk/Hira/HiraConfiguration/HiraImpactTypesTab";
import ModuleNavigation from "components/Navigation/ModuleNavigation";
import getSessionStorage from "utils/getSessionStorage";
import HiraAreaMasterTab from "components/Risk/Hira/HiraConfiguration/HiraAreaMasterTab";

type Props = {};
const { Content, Header } = Layout;
const useStyles = makeStyles((theme: Theme) => ({
  actionHeader: {
    "& .ant-btn-default": {
      backgroundColor: "#e8f3f9",
      borderColor: "#0e497a",
      "& svg": {
        color: "#0e497a",
      },
    },
  },
  tabsWrapper: {
    "& .ant-tabs-tab": {
      backgroundColor: "#e3e8f9 !important",
      color: "black !important",
    },
    "& .ant-tabs-tab-btn": {
      letterSpacing: "0.6px",
    },
    "& .ant-tabs-tab-active": {
      backgroundColor: "#003566 !important",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: "500",
    },
  },
  fullformtabs: {
    margin: "14px 3px 0",
    [theme.breakpoints.up("lg")]: {
      height: "90vh", // Adjust the max-height value as needed for large screens
      overflowY: "auto",
    },
    [theme.breakpoints.up("xl")]: {
      height: "80vh",
      overflowY: "auto",
    },
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    // Additional styles for the backButton class
    "&:hover": {
      color: "#003566 !important",
      borderColor: "#003566 !important",
    },
  },
  docNavIconStyle: {
    width: "21.88px",
    height: "21px",
    paddingRight: "6px",
    cursor: "pointer",
  },
}));

const HiraConfigurationPage = ({}: Props) => {
  const navigate = useNavigate();
  const classes = useStyles();
  const params = useParams<any>();
  const id = params.id;
  // const edit = !!id ? true : false;
  const steps = ["Risk Configuration", "Risk Significance Settings"];
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const userDetails = getSessionStorage();
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;

  const haveAccess = isOrgAdmin || isMR;
  const [riskConfigData, setRiskConfigData] =
    useState<RiskConfigSchema>(riskConfig);

  const [hiraConfigData, setHiraConfigData] =
    useState<HiraConfigSchema>(hiraConfig);

  const [loading, setLoading] = useState<boolean>(false);
  const [isHiraConfigExist, setIsHiraConfigExist] = useState<boolean>(false);
  const [activeTabKey, setActiveTabKey] = useState<any>("1");
  const { enqueueSnackbar } = useSnackbar();
  const goBack = () => {
    navigate("/risk/riskregister/HIRA");
  };

  const onTabsChange = (key: any) => {
    setActiveTabKey(key);
  };

  useEffect(() => {
    console.log("checkrisk useEffect[riskConfigData]", riskConfigData);
  }, [riskConfigData]);

  useEffect(() => {
    getRiskConfigById();
  }, []);

  const getRiskConfigById = async () => {
    try {
      const res = await axios.get(
        `/api/riskconfig/getHiraConfig/${userDetails?.organizationId}`
      );
      // console.log("checkrisk config data", res.data[0]);
      if (res.status === 200) {
        if (res?.data && !!res?.data?.length) {
          setIsHiraConfigExist(true);
          const data = res.data[0];
          setHiraConfigData({
            id: data._id,
            riskCategory: data?.riskCategory,
            riskType: data?.riskType,
            condition: data?.condition,
            hiraMatrixHeader: !!data?.hiraMatrixHeader
              ? data?.hiraMatrixHeader?.map((item: any) => {
                  if (!item) return "";
                  else return item;
                })
              : ["Cirteria Type", "1", "2", "3", "4", "5"],
            hiraMatrixData: data?.hiraMatrixData,
            riskLevelData: data?.riskLevelData,
          });
        } else {
          createInitialRiskConfig();
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const createInitialRiskConfig = async () => {
    try {
      const initialRiskConfigData = {
        ...hiraConfigData,
        riskCategory: "HIRA",
        hiraMatrixHeader: ["Cirteria Type", "1", "2", "3", "4", "5"],
        condition: [
          { name: "Normal" },
          { name: "Abnormal" },
          { name: "Emergency" },
        ],
        riskType: [{ name: "Routine" }, { name: "Non-Routine" }],
        organizationId: userDetails?.organizationId,
        createdBy: userDetails?.id,
      };
      console.log("checkrisk data to be created -->", initialRiskConfigData);
      const res = await axios.post(
        `/api/riskconfig/createHiraConfig`,
        initialRiskConfigData
      );
      if (res.status === 200 || res.status === 201) {
        setIsHiraConfigExist(true);
        const data = res.data;
        setHiraConfigData({
          id: data?._id,
          riskCategory: data?.riskCategory,
          riskType: data?.riskType,
          condition: data?.condition,
          hiraMatrixHeader: data?.hiraMatrixHeader,
          hiraMatrixData: data?.hiraMatrixData,
          riskLevelData: data?.riskLevelData,
        });
      } else {
        enqueueSnackbar("Something went wrong while initialising risk config", {
          variant: "error",
        });
        setIsHiraConfigExist(true);
      }
    } catch (error) {
      console.log("checkrisk error in createInitialRiskConfig", error);
    }
  };

  //tabs for module navigation
  const tabs = [
    {
      key: "1",
      name: "Hira Configuration",
      // path: "/master/unit", //just for information
      icon: (
        <AllDocIcon
          style={{
            fill: activeTabKey === "1" ? "white" : "",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: (
        <HiraConfigurationTab
          hiraConfigData={hiraConfigData}
          setHiraConfigData={setHiraConfigData}
          edit={isHiraConfigExist}
          id={hiraConfigData?.id}
        />
      ),
      moduleHeader: "Hira Configuration Tab",
    },
    {
      key: "2",
      name: "Hazard Types",
      // path: "/master/department",
      icon: (
        <AllDocIcon
          style={{
            fill: activeTabKey === "2" ? "white" : "",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <HiraHazardTypesTab />,
      moduleHeader: "Hazard Types Tab",
    },
    {
      key: "3",
      name: "Area Master",
      // path: "/master/department",
      icon: (
        <AllDocIcon
          style={{
            fill: activeTabKey === "3" ? "white" : "",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <HiraAreaMasterTab />,
      moduleHeader: "Area Master Tab",
    },
  ];

  const tabsForMR = [
    {
      key: "1",
      name: "Area Master",
      // path: "/master/department",
      icon: (
        <AllDocIcon
          style={{
            fill: activeTabKey === "1" ? "white" : "",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <HiraAreaMasterTab />,
      moduleHeader: "Area Master Tab",
    },
  ];

  return (
    <>
      {/* <Content className={classes.fullformtabs}> */}
      {/* <div style={{ textAlign: "left" }}>
          <Button
            className={classes.backButton} // Apply custom class
            type="default"
            icon={<KeyboardArrowLeftIcon />}
            // style={{display : "flex"}}
            onClick={goBack}
          >
            Back
          </Button>
        </div> */}
      <ModuleNavigation
        tabs={isMCOE ? tabs : isMR ? tabsForMR : []}
        activeTab={activeTabKey}
        setActiveTab={setActiveTabKey}
        currentModuleName={`Hira Configuation`}
        createHandler={false}
        configHandler={false}
        filterHandler={false}
        mainModuleName={`Hira Configuation`}
      />
      {/* </Content> */}
    </>
  );
};

export default HiraConfigurationPage;
