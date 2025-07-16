import React, { useState } from "react";
import FormStepper from "../../../components/FormStepper";
import CreateOrgForm from "../../../components/CreateOrgForm";
import OrgAdminFormContainer from "../../../containers/OrgAdminFormContainer";
// import BusinessConfigForm from "../../../components/BusinessConfigForm";
import ConnectedApps from "../../ConnectedApps";
import ActiveModulesForm from "../../../components/ActiveModulesForm";
import { useRecoilState, useRecoilValue } from "recoil";
import { orgFormData, orgAdminCount } from "../../../recoil/atom";
import axios from "../../../apis/axios.global";
import { useSnackbar } from "notistack";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../../components/BackButton";
import checkRoles from "../../../utils/checkRoles";
import { orgForm } from "../../../schemas/orgForm";
import BusinessAndFunctions from "../../../components/BusinessAndFunctions";
import MCOEAdminFormContainer from "../../../containers/MCOEAdminFormContainer";
import getAppUrl from "utils/getAppUrl";
import { makeStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";
import FunctionsSetting from "pages/MasterHomePage/FunctionsSetting";
import AppField from "../../../components/AppField";

type Props = {};

const steps = [
  "Organization",
  "Organization Admin",
  // 'Technical Configuration',
  // "MCOE Admin",
  "Business Configuration",
  // "Functions",
  // "System Configuration",

  "Modules",
  "App Fields",
  "Connected Apps",
];

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxHeight: "calc(76vh - 12vh)", // Adjust the max-height value as needed
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "10px", // Adjust the height value as needed
      backgroundColor: "#e5e4e2",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
    paddingTop: theme.typography.pxToRem(20),
  },
  paper: {
    backgroundColor: "#F7F7FF",
    marginLeft: theme.typography.pxToRem(2),
    padding: theme.typography.pxToRem(20),
    marginTop: theme.typography.pxToRem(2),
    borderRadius: theme.typography.pxToRem(10),
    height: "100%",
  },
}));

/**
 *
 * The new organization page is required to create a new organization and edit it.
 */

function NewOrganization({}: Props) {
  const [formValues, setFormValues] = useRecoilState(orgFormData);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const realmName = getAppUrl();
  const orgAdmins = useRecoilValue(orgAdminCount);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const classes = useStyles();

  let isOrgAdmin = checkRoles("ORG-ADMIN");

  let params = useParams();
  let paramArg = params.name;
  let edit = paramArg ? true : false;

  if (realmName !== "master") {
    edit = true;
  } else {
    edit = paramArg ? true : false;
  }

  const getActiveModules = async (realm: string) => {
    await axios(`/api/organization/getAllActiveModules/${realm}`)
      .then((res) => {
        setActiveModules([...res.data.activeModules]);
      })
      .catch((err) => console.error(err));
  };

  const handleSubmit = async () => {
    if (edit) {
      if (
        Boolean(formValues.entityType[0].name === "") ||
        Boolean(formValues.systemType[0].name === "") ||
        !Boolean(formValues.fiscalYearQuarters) ||
        !Boolean(formValues.auditYear)
      ) {
        enqueueSnackbar(
          `Add at least one Entity Type, Section, Fiscal Year Quarter and Audit Year`,
          { variant: "warning" }
        );
      } else {
        setIsLoading(true);
        let finalVal = {
          businessUnit: formValues.businessUnit,
          entityType: formValues.entityType,
          section: formValues.section,
          systemType: formValues.systemType,
          fiscalYearQuarters: formValues.fiscalYearQuarters,
          auditYear: formValues.auditYear,
          fiscalYearFormat: formValues.fiscalYearFormat,
        };
        await axios
          .put(`/api/organization/${formValues.id}`, finalVal)
          .then(async () => {
            const encodedModules = activeModules.map((module) =>
              encodeURIComponent(module)
            );
            console.log("activeModules", activeModules);
            console.log("encodedmodules", encodedModules);
            await axios
              .post(
                `/api/organization/addActiveModules/${
                  formValues.realmName
                }?data=${JSON.stringify(encodedModules)}`
              )
              .then(() => {
                setFormValues(orgForm);
                setIsLoading(false);
                navigate("/settings");
                enqueueSnackbar(`Organization Successfully Saved`, {
                  variant: "success",
                });
              });
          })
          .catch((err) => {
            setIsLoading(false);
            enqueueSnackbar(`${err?.response?.data?.message}`, {
              variant: "error",
            });
          });
      }
    } else if (!edit) {
      if (formValues.organizationName === "") {
        enqueueSnackbar(`Add Organization to Continue`, {
          variant: "error",
        });
      }
      if (orgAdmins === 0) {
        enqueueSnackbar(`Add at least one Org Admin`, {
          variant: "error",
        });
      }
      if (
        Boolean(formValues.entityType[0].name === "") ||
        Boolean(formValues.systemType[0].name === "") ||
        !Boolean(formValues.fiscalYearQuarters) ||
        !Boolean(formValues.auditYear)
      ) {
        enqueueSnackbar(
          `Add at least one Entity Type, Section and Fiscal Year Quarter`,
          { variant: "warning" }
        );
      }
      if (activeModules.length === 0) {
        enqueueSnackbar(`Select at least one module`, { variant: "warning" });
      } else {
        setIsLoading(true);
        let businessConfig = {
          businessUnit: formValues.businessUnit?.filter(
            (item: any) => item.name !== ""
          ),
          entityType: formValues.entityType.filter(
            (item: any) =>
              item.name !== "" &&
              item.name !== "Department" &&
              item.name !== "department"
          ),
          section: formValues.section.filter((item: any) => item.name !== ""),
          systemType: formValues.systemType.filter(
            (item: any) => item.name !== ""
          ),
          fiscalYearQuarters: formValues.fiscalYearQuarters,
          fiscalYearFormat: formValues.fiscalYearFormat,
          auditYear: formValues.auditYear,
        };
        await axios
          .post(
            `/api/organization/business/createBusinessConfig/${formValues.id}`,
            businessConfig
          )
          .then(async () => {
            console.log(
              "active modules",
              activeModules,
              JSON.stringify(activeModules)
            );
            const encodedModules = activeModules.map((module) =>
              encodeURIComponent(module)
            );
            await axios
              .post(
                `/api/organization/addActiveModules/${
                  formValues.realmName
                }?data=${JSON.stringify(encodedModules)}`
              )
              .then(() => {
                setIsLoading(false);
                navigate("/settings");
                enqueueSnackbar(`Organization Successfully created`, {
                  variant: "success",
                });
              });
          })
          .catch((err) => {
            setIsLoading(false);
            enqueueSnackbar(`${err.response.data.message}`, {
              variant: "error",
            });
          });
      }
    }
  };

  React.useEffect(() => {
    if (edit) {
      try {
        setIsLoading(true);

        axios
          .get(`/api/organization/${paramArg ? paramArg : realmName}`)
          .then((data) => {
            let finalData = {
              ...data.data,
              businessUnit: data?.data?.businessUnit?.length
                ? data.data.businessUnit
                : [""],
              entityType: data?.data?.entityType?.length
                ? data.data.entityType
                : [""],
              systemType: data?.data?.systemType?.length
                ? data?.data?.systemType
                : [""],
              section: data?.data?.section?.length ? data?.data?.section : [""],
            };
            setFormValues(finalData);
            setIsLoading(false);
            getActiveModules(finalData.realmName);
          });
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    }
  }, []);

  const forms = [
    { form: <CreateOrgForm isEdit={edit} /> },
    { form: <OrgAdminFormContainer /> },
    // { form: <TechnicalConfigForm /> },
    // { form: <MCOEAdminFormContainer /> },
    { form: <BusinessAndFunctions isEdit={edit} /> },
    // { form: <FunctionsSetting /> },
    // { form: <BusinessConfigForm isEdit={edit} /> },

    {
      form: (
        <ActiveModulesForm
          activeModules={activeModules}
          setActiveModules={setActiveModules}
        />
      ),
    },
    { form: <AppField /> },
    { form: <ConnectedApps /> },
  ];

  return (
    <div className={classes.root}>
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10%",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <Paper elevation={0} className={classes.paper}>
          <FormStepper
            steps={steps}
            forms={forms}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            handleNext={() =>
              setActiveStep((prevActiveStep) => prevActiveStep + 1)
            }
            handleBack={() => {
              if (activeStep === 0) {
                return;
              } else {
                setActiveStep((prevActiveStep) => prevActiveStep - 1);
              }
            }}
            handleFinalSubmit={handleSubmit}
            backBtn={
              !isOrgAdmin ? <BackButton parentPageLink="/master" /> : null
            }
          />
        </Paper>
      )}
    </div>
  );
}

export default NewOrganization;
