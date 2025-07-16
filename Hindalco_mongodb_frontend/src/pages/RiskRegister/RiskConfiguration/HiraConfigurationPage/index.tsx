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
import { riskConfig, RiskConfigSchema } from "schemas/riskConfigSchema";
import axios from "apis/axios.global";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";

//assets
import { ReactComponent as ShrinkIcon } from "assets/icons/shrink-new.svg";

//components
import RiskConfigurationStepperForm2 from "components/RiskRegister/RiskConfiguration/RiskConfifurationFormStepper/RiskConfigurationStepperForm2";
import HiraTypesTab from "components/RiskRegister/RiskConfiguration/HiraTypesTab";

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
}));

const HiraConfigurationPage = ({}: Props) => {
  const navigate = useNavigate();
  const classes = useStyles();
  const params = useParams<any>();
  const id = params.id;
  const edit = !!id ? true : false;
  const steps = ["Risk Configuration", "Risk Significance Settings"];
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const haveAccess = isOrgAdmin || isMR;
  const [riskConfigData, setRiskConfigData] =
    useState<RiskConfigSchema>(riskConfig);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTabKey, setActiveTabKey] = useState<any>("1");
  const { enqueueSnackbar } = useSnackbar();
  const goBack = () => {
    navigate("/processdocuments/processdocument", {
      state: { drawerOpenAddMode: true },
    });
  };

  const onTabsChange = (key: string) => {
    setActiveTabKey(key);
  };

  const tabs = [
    {
      label: "HIRA Configuration",
      key: 1,
      children: (
        <RiskConfigurationStepperForm2
          riskConfigData={riskConfigData}
          setRiskConfigData={setRiskConfigData}
          edit={edit}
          id={id}
        />
      ),
    },
    {
      label: "HIRA Types",
      key: 3,
      children: <HiraTypesTab />,
    },
  ];
  return (
    <>
      {/* <Layout style={{ background: "aliceblue" }}> */}
        <Content className={classes.fullformtabs}>
          <div style={{ textAlign: "left" }}>
            <Button
              className={classes.backButton} // Apply custom class
              type="default"
              icon={<KeyboardArrowLeftIcon />}
              // style={{display : "flex"}}
              // onClick={() => enterLoading(1)}
            >
              Back
            </Button>
          </div>
          <div
            style={{
              padding: 24,
              minHeight: 280,
              backgroundColor: "#fff",
            }}
          >
            <div className={classes.tabsWrapper}>
              <Tabs
                defaultActiveKey="1"
                onChange={(key) => {
                  onTabsChange(key);
                }}
                activeKey={activeTabKey}
                type="card"
                items={tabs as any}
                animated={{ inkBar: true, tabPane: true }}
              />
            </div>
          </div>
        </Content>
      {/* </Layout> */}
    </>
  );
};

export default HiraConfigurationPage;
