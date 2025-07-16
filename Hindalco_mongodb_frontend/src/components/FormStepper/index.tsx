import React, { useEffect } from "react";
import {
  Button,
  Paper,
  Step,
  Stepper,
  Typography,
  StepLabel,
  IconButton,
  Tooltip,
  Grid,
  Fab,
  Divider,
  StepButton,
  StepIconProps,
  makeStyles,
} from "@material-ui/core";
import useStyles from "./styles";
import { useRecoilValue } from "recoil";
import { formStepperError, mobileView } from "../../recoil/atom";
import MobileStepper from "@material-ui/core/MobileStepper";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Save,
} from "@material-ui/icons";
import { useTheme } from "@material-ui/core/styles";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import MailOutlineRoundedIcon from "@material-ui/icons/MailOutlineRounded";
import CustomButtonGroup from "../CustomButtonGroup";
import AddIcon from "@material-ui/icons/Add";
import SecurityIcon from "@material-ui/icons/Security";
import AccessAlarmsIcon from "@material-ui/icons/AccessAlarms";
import YoutubeSearchedForIcon from "@material-ui/icons/YoutubeSearchedFor";
import AddAlertIcon from "@material-ui/icons/AddAlert";
import LockIcon from "@material-ui/icons/Lock";
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import clsx from "clsx";
import draftImage from "../../assets/icons/draftIcon.png";

type Props = {
  steps: string[];
  forms: any[];
  backBtn: JSX.Element | null;
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  handleNext: () => void;
  handleBack: () => void;
  handleFinalSubmit?: () => void;
  handleDraftSubmit?: () => void;
  saveBtn?: any;
  moveToStep?: boolean;
  targetStep?: any;
  review?: () => void;
  close?: () => void;
  label?: string;
  withIcon?: boolean;
  nosubmitButton?: boolean;
  showDraftIcon?: boolean;
  refForReportForm12?: any;
  refForReportForm28?: any;
};

function getStepContent(forms: any) {
  if (forms) {
    return forms?.form;
  } else {
    return <h1>Invalid Form</h1>;
  }
}

/**
 * This component takes in an Array of Forms and displays them wrapped around inside a Stepper
 * It renders 2 different steppers for Mobile and Desktop View respectively.
 */

function FormStepper({
  steps,
  forms,
  backBtn,
  activeStep,
  setActiveStep,
  handleNext,
  handleBack,
  handleFinalSubmit,
  handleDraftSubmit,
  saveBtn,
  moveToStep,
  targetStep,
  label,
  review,
  close,
  withIcon,
  nosubmitButton,
  showDraftIcon = false,
  refForReportForm12,
  refForReportForm28,
}: Props) {
  const classes = useStyles();
  const view = useRecoilValue(mobileView);
  const theme = useTheme();
  const formStepperErrorValue = useRecoilValue<boolean>(formStepperError);

  console.log("formStepperErrorValue", formStepperErrorValue);
  const useColorlibStepIconStyles = makeStyles({
    root: {
      backgroundColor: "#ccc",
      zIndex: 1,
      color: "#fff",
      width: 35,
      height: 35,
      display: "flex",
      borderRadius: "50%",
      justifyContent: "center",
      alignItems: "center",
    },
    active: {
      backgroundImage:
        "linear-gradient( 136deg, rgb(33,133,242) 0%, rgb(64,87,233) 50%, rgb(35,135,138) 100%)",
      boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
    },
    completed: {
      backgroundImage:
        "linear-gradient( 136deg, rgb(33,133,242) 0%, rgb(64,87,233) 50%, rgb(35,135,138) 100%)",
    },
  });

  function ColorlibStepIcon(props: StepIconProps) {
    const classes = useColorlibStepIconStyles();
    const { active, completed } = props;

    const icons: { [index: string]: React.ReactElement } = {
      1: <SecurityIcon />,
      2: <YoutubeSearchedForIcon />,
      3: <AssignmentTurnedInIcon />,
      4: <LockIcon />,
    };

    return (
      <div
        className={clsx(classes.root, {
          [classes.active]: active,
          [classes.completed]: completed,
        })}
      >
        {icons[String(props.icon)]}
      </div>
    );
  }

  useEffect(() => {
    if (moveToStep) setActiveStep(targetStep);
  }, []);

  if (view) {
    const maxSteps = forms.length;
    return (
      <div data-testid="mobile-view-stepper-node" className={classes.root}>
        {backBtn}
        <Paper square elevation={0} className={classes.header}>
          <Typography variant="h5">{steps[activeStep]}</Typography>
        </Paper>
        <Paper elevation={0} className={classes.paper}>
          {getStepContent(forms[activeStep])}
        </Paper>
        <MobileStepper
          steps={maxSteps}
          position="static"
          variant="text"
          activeStep={activeStep}
          nextButton={
            activeStep === steps.length - 1 ? (
              <Button
                size="small"
                data-testid="submit-button"
                onClick={handleFinalSubmit}
                disabled={activeStep === maxSteps}
              >
                Submit
              </Button>
            ) : (
              <Button
                size="small"
                onClick={handleNext}
                disabled={activeStep === maxSteps - 1 || formStepperErrorValue}
              >
                Next
                {theme.direction === "rtl" ? (
                  <KeyboardArrowLeft />
                ) : (
                  <KeyboardArrowRight />
                )}
              </Button>
            )
          }
          backButton={
            <Button
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              {theme.direction === "rtl" ? (
                <KeyboardArrowRight />
              ) : (
                <KeyboardArrowLeft />
              )}
              Back
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      {activeStep === steps.length - 1 ? (
        <>
          <div className={classes.reveiwAndCloseButtonSection}>
            {review && (
              <Tooltip title="Send for review">
                <IconButton
                  onClick={handleDraftSubmit}
                  size="small"
                  style={{
                    marginRight: "5px",
                    // backgroundColor: "#ffffff",
                    padding: "5px",
                    border: "1px solid #6e7dab",
                  }}
                >
                  <MailOutlineRoundedIcon
                    style={{ fontSize: "20px", color: "#6e7dab" }}
                  />
                </IconButton>
              </Tooltip>
            )}
            {close && (
              // <div style={{ marginRight: "5px" }}>
              <CustomButtonGroup
                options={[
                  "Close-Objective",
                  "Defered-Close",
                  "Complete-Close",
                  "Incomplete-Close",
                ]}
                handleSubmit={handleDraftSubmit}
                disableBtnFor={["Close-Objective"]}
              />
            )}
          </div>
          <div className={classes.buttonSection}>
            {saveBtn && (
              // <Tooltip title="Save as Draft">
              //   <IconButton
              //     onClick={handleDraftSubmit}
              //     size="small"
              //     style={{
              //       marginRight: "15px",
              //       backgroundColor: "#6e7dab",
              //       padding: "5px",
              //       [theme.breakpoints.down("sm")]: {
              //         marginRight: "8px !important",
              //       },
              //     }}
              //   >
              //     <Save style={{ fontSize: "20px", color: "#ffffff" }} />
              //   </IconButton>
              // </Tooltip>
              <Button
                onClick={handleDraftSubmit}
                size="small"
                style={{
                  marginRight: "15px",
                  backgroundColor: "#0e497a",
                  color: "#e1f4ed",
                  padding: "5px",
                  [theme.breakpoints.down("sm")]: {
                    marginRight: "8px !important",
                  },
                }}
              >
                Save As Draft
              </Button>
            )}
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              className={classes.stepperNavBackButton}
              size="small"
            >
              <ChevronLeftIcon fontSize="small" />
              Previous
            </Button>
            <Button
              disabled={activeStep === steps.length}
              onClick={handleFinalSubmit}
              className={classes.stepperNavNextButton}
              data-testid="submit-button"
              size="small"
              ref={refForReportForm28}
            >
              {nosubmitButton ? "Close" : "Submit"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className={classes.reveiwAndCloseButtonSection}>
            {review && (
              <Tooltip title="Send for review">
                <IconButton
                  onClick={review}
                  size="small"
                  style={{
                    marginRight: "5px",
                    // backgroundColor: "#ffffff",
                    padding: "5px",
                    // border: "5px",
                    // borderColor: "#6e7dab",
                    border: "1px solid #6e7dab",
                  }}
                >
                  <MailOutlineRoundedIcon
                    style={{ fontSize: "20px", color: "#6e7dab" }}
                  />
                </IconButton>
              </Tooltip>
            )}
            {close && (
              // <div style={{ marginRight: "5px" }}>
              <CustomButtonGroup
                options={[
                  "Close-Objective",
                  "Defered-Close",
                  "Complete-Close",
                  "Incomplete-Close",
                ]}
                handleSubmit={handleDraftSubmit}
                disableBtnFor={["Close-Objective"]}
              />
            )}
          </div>
          <div className={classes.buttonSection}>
            {saveBtn && (
              // <Tooltip title="Save as Draft">
              //   <IconButton
              //     onClick={handleDraftSubmit}
              //     size="small"
              //     style={{
              //       marginRight: "15px",
              //       backgroundColor: "#6e7dab",
              //       padding: "5px",
              //     }}
              //   >
              //     <Save style={{ fontSize: "20px", color: "#ffffff" }} />
              //   </IconButton>
              // </Tooltip>
              <Button
                onClick={handleDraftSubmit}
                size="small"
                style={{
                  marginRight: "15px",
                  backgroundColor: "#0e497a",
                  padding: "5px",
                  color: "#e1f4ed",
                  [theme.breakpoints.down("sm")]: {
                    marginRight: "8px !important",
                  },
                }}
              >
                Save As Draft
              </Button>
            )}
            <Button
              disabled={activeStep === 0}
              data-testid="form-stepper-back-button"
              onClick={handleBack}
              className={classes.stepperNavBackButton}
              size="small"
            >
              <ChevronLeftIcon fontSize="small" />
              Previous
            </Button>
            <Button
              disabled={activeStep === steps.length || formStepperErrorValue}
              data-testid="form-stepper-next-button"
              onClick={handleNext}
              className={classes.stepperNavNextButton}
              variant="contained"
              size="small"
              ref={refForReportForm12}
            >
              Next
              <ChevronRightIcon fontSize="small" />
            </Button>
          </div>
        </>
      )}
      {backBtn}
      <div className={classes.stepperContainer}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          // nonLinear
          // connector={<ColorLib/>}
          className={classes.stepper}
        >
          {steps.map((label, index) => (
            <Step
              data-testid={`step-button-${index}`}
              key={label}
              completed={index < activeStep ? true : false}
              className={view ? classes.hideStepper : undefined}
            >
              {withIcon ? (
                <StepLabel StepIconComponent={ColorlibStepIcon}>
                  <Typography
                    className={classes.stepperFont}
                    style={{ color: "#003566" }}
                  >
                    {label}
                  </Typography>
                </StepLabel>
              ) : (
                <StepLabel>
                  <Typography className={classes.stepperFont}>
                    {label}
                  </Typography>
                </StepLabel>
              )}
            </Step>
          ))}
        </Stepper>
      </div>
      <Typography
        variant="h5"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 0,
        }}
      >
        {label}
      </Typography>
      {showDraftIcon && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div>
              <img
                src={draftImage}
                style={{ width: "100px", height: "42px", marginRight: "5px" }}
                alt="Draft"
              />
            </div>
          </div>
        </div>
      )}
      <Divider style={{ margin: "5px 0 0 20px" }} />

      {/* <div style={{ marginTop: "-20px" }}>
        {review && (
          <Tooltip title="Send for review">
            <IconButton
              onClick={review}
              size="small"
              style={{
                marginRight: "5px",
                backgroundColor: "#6e7dab",
                padding: "5px",
              }}
            >
              <MailOutlineRoundedIcon
                style={{ fontSize: "20px", color: "#ffffff" }}
              />
            </IconButton>
          </Tooltip>
        )}
        {close && (
          // <div style={{ marginRight: "5px" }}>
          <CustomButtonGroup
            options={[
              "Close-Objective",
              "Defered-Close",
              "Complete-Close",
              "Incomplete-Close",
            ]}
            handleSubmit={handleDraftSubmit}
            disableBtnFor={["Close-Objective"]}
            style={{ marginLeft: "1240px" }}
          />
          // </div>
        )}
      </div> */}

      <div>
        <div>
          {/* <Paper elevation={0} className={classes.paper}> */}
          {getStepContent(forms[activeStep])}
          {/* </Paper> */}
        </div>
      </div>
    </div>
  );
}

export default FormStepper;
