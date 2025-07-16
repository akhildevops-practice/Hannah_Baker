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
  AspectImpactConfigSchema,
  aspectImpactConfig,
} from "schemas/riskConfigSchema";
import axios from "apis/axios.global";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";

//assets
import { ReactComponent as ShrinkIcon } from "assets/icons/shrink-new.svg";
import { ReactComponent as AllDocIcon } from "assets/documentControl/All-Doc.svg";
//components

import ModuleNavigation from "components/Navigation/ModuleNavigation";
import getSessionStorage from "utils/getSessionStorage";
import AspectImpactConfiguratioTab from "components/Risk/AspectImpact/AspectImpactConfiguration/AspectImpactConfigurationTab";
import AspectTypesTab from "components/Risk/AspectImpact/AspectImpactConfiguration/AspectTypesTab";
import ImpactTypesTab from "components/Risk/AspectImpact/AspectImpactConfiguration/ImpactTypesTab";
import ActMasterTab from "components/Risk/AspectImpact/AspectImpactConfiguration/ActMasterTab";

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

const AspectImpactConfigurationPage = ({}: Props) => {
  const navigate = useNavigate();
  const classes = useStyles();
  const params = useParams<any>();
  const id = params.id;
  // const edit = !!id ? true : false;
  const steps = ["Risk Configuration", "Risk Significance Settings"];
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const userDetails = getSessionStorage();
  const haveAccess = isOrgAdmin || isMR;
  const [riskConfigData, setRiskConfigData] =
    useState<RiskConfigSchema>(riskConfig);

  const [hiraConfigData, setHiraConfigData] =
    useState<AspectImpactConfigSchema>(aspectImpactConfig);

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
        `/api/aspect-impact/getAspImpConfig/${userDetails?.organizationId}`
      );
      // console.log("checkrisk config data", res.data[0]);
      if (res.status === 200) {
        if (res?.data && !!res?.data?.length) {
          setIsHiraConfigExist(true);
          const data = res.data[0];
          setHiraConfigData({
            id: data._id,
            riskCategory: data?.riskCategory,
            riskType: data?.riskType || [],
            condition: data?.condition || [],
            interestedParties: data?.interestedParties || [],

            hiraMatrixHeader: !!data?.hiraMatrixHeader
              ? data.hiraMatrixHeader?.map((item: any) => {
                  if (!item) return "";
                  else return item;
                })
              : ["Cirteria Type", "1", "2", "3", "4", "5"],
            hiraMatrixData: data.hiraMatrixData,
            riskLevelData: data.riskLevelData,
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
        riskCategory: "Aspect Impact",
        hiraMatrixHeader: ["Cirteria Type", "1", "2", "3", "4", "5"],
        condition: [
          { name: "Routine" },
          { name: "Non-Routine" },
          { name: "Emergency" },
        ],
        interestedParties: [
          { name: "NGOs" },
          { name: " Env. groups" },
          { name: "International Guidelines" },
          { name: "Media" },
          { name: "Local Community" },
          { name: "Suppliers" },
          { name: "Investors" },
          { name: "Neighbors" },

        ],
        organizationId: userDetails?.organizationId,
        createdBy: userDetails?.id,
      };
      console.log("checkrisk data to be created -->", initialRiskConfigData);
      const res = await axios.post(
        `/api/aspect-impact/createAspImpConfig`,
        initialRiskConfigData
      );
      if (res.status === 200 || res.status === 201) {
        setIsHiraConfigExist(true);
        const data = res.data;
        setHiraConfigData({
          id: data._id,
          riskCategory: data.riskCategory,
          riskType: data.riskType,
          condition: data?.condition || [],
          interestedParties: data?.interestedParties || [],

          hiraMatrixHeader: data.hiraMatrixHeader,
          hiraMatrixData: data.hiraMatrixData,
          riskLevelData: data.riskLevelData,
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
      name: "Aspect Impact Configuration",
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
        <AspectImpactConfiguratioTab
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
      name: "Aspect Types",
      // path: "/master/department",
      icon: (
        <AllDocIcon
          style={{
            fill: activeTabKey === "2" ? "white" : "",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <AspectTypesTab />,
      moduleHeader: "Hazard Types Tab",
    },
    {
      key: "3",
      name: "Impact Types",
      // path: "/master/department",
      icon: (
        <AllDocIcon
          style={{
            fill: activeTabKey === "3" ? "white" : "",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <ImpactTypesTab />,
      moduleHeader: "Impact Types Tab",
    },
    {
      key: "4",
      name: "Corresponding Act Master",
      // path: "/master/department",
      icon: (
        <AllDocIcon
          style={{
            fill: activeTabKey === "5" ? "white" : "",
          }}
          className={classes.docNavIconStyle}
        />
      ),
      children: <ActMasterTab />,
      moduleHeader: "Act Master Tab",
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
        tabs={tabs}
        activeTab={activeTabKey}
        setActiveTab={setActiveTabKey}
        currentModuleName={`Hira Configuation`}
        createHandler={false}
        configHandler={false}
        filterHandler={false}
        mainModuleName={`Aspect Configuration`}
      />
      {/* </Content> */}
    </>
  );
};

export default AspectImpactConfigurationPage;
