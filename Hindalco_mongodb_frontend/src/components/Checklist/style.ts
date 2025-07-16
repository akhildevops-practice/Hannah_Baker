import { makeStyles, createStyles } from "@material-ui/core";
import { color } from "highcharts";

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      width: "100%",
      maxHeight: "calc(76vh - 12vh)", // Adjust the max-height value as needed
      overflowY: "auto",
      overflowX: "hidden",
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
    questionContainer: {
      padding: "2rem clamp(1rem, 70px, 2rem)",
      borderRadius: "10px",
      background: "white",
      minWidth: "82%",
      maxWidth: 900,
      position: "relative",
      border: `1px solid ${theme.palette.primary.main}`,
    },
    questionHeader: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingBottom: "2rem",
      gap: "1.5rem",
      minWidth: "82%",
    },
    sectionHeader: {
      padding: "30px clamp(1rem, 70px, 2rem)",
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: "1.5rem",
      borderTop: `10px solid ${theme.palette.primary.light}`,
      borderRadius: "10px",
      background: "white",
      boxShadow: theme.shadows[2],
      maxWidth: 900,
      minWidth: "82%",
    },

    sectionContainer: {
      padding: "clamp(1rem, 70px, 2rem)",
      borderTop: `1px solid ${theme.palette.primary.main}`,
      borderRadius: "10px",
      minWidth: "82%",
    },
    text: {
      fontSize: theme.auditFont.medium,
      color: theme.palette.primary.main,
    },
    attachButton: {
      backgroundColor: theme.palette.primary.light,
      color: theme.textColor.white,
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
      },
    },
    attachButtonRight: {
      backgroundColor: theme.palette.primary.light,
      color: theme.textColor.white,
      "&:hover": {
        backgroundColor: theme.palette.primary.main,
      },
      position: "absolute",
      right: "-70px",
      top: "40%",
      display: "none",
      [theme.breakpoints.up("md")]: {
        display: "block",
      },
    },
    questionBody: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1rem",
    },

    form: {
      padding: theme.typography.pxToRem(20),
      borderRadius: theme.typography.pxToRem(10),
      backgroundColor: "#FFFFFF",
      minHeight: "40vh",
    },
    formTextPadding: {
      padding: theme.typography.pxToRem(10),
      fontSize: theme.typography.pxToRem(13),
    },
    formBox: {
      width: "100%",
      paddingBottom: theme.typography.pxToRem(25),
    },
    discardBtn: {
      fontSize: theme.typography.pxToRem(13),
      color: theme.palette.primary.light,
      marginRight: theme.typography.pxToRem(20),
    },

    formControl: {
      minWidth: "100%",
    },
    addBtnMobileContainer: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "start",
      [theme.breakpoints.up("md")]: {
        display: "none",
      },
    },

    attachBtnContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      [theme.breakpoints.up("md")]: {
        alignItems: "flex-end",
      },
    },
    fileName: {
      fontSize: theme.typography.pxToRem(13),
      color: theme.palette.primary.light,
      textOverflow: "ellipsis",
      overflow: "hidden",
      width: "160px",
      whiteSpace: "nowrap",
      textAlign: "right",
    },
    checklistHeader: {
      backgroundColor: theme.textColor.white,
      padding: "clamp(1rem, 70px, 2rem)",
      marginBottom: theme.spacing(2),
      borderRadius: "10px",
    },
    headerInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      [theme.breakpoints.up("sm")]: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },
      [theme.breakpoints.up("md")]: {
        justifyContent: "flex-end",
      },
    },

    headerChecklist: {
      border: "1px solid red",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    questions: {
      border: `1px solid ${theme.palette.primary.light}`,
      color: theme.palette.primary.light,
      padding:
        theme.typography.pxToRem(10) + " " + theme.typography.pxToRem(20),
      borderRadius: "5px",
      textAlign: "center",
      [theme.breakpoints.between("sm", "md")]: {
        flexGrow: 1,
      },
    },
    score: {
      textAlign: "center",
      border: "1px solid #08AE2D",
      color: theme.textColor.white,
      backgroundColor: "#08AE2D",
      padding:
        theme.typography.pxToRem(10) + " " + theme.typography.pxToRem(20),
      borderRadius: "5px",
      [theme.breakpoints.between("sm", "md")]: {
        flexGrow: 1,
      },
    },
    fabBtn: {
      position: "fixed",
      bottom: 50,
      right: 50,
      backgroundColor: theme.palette.primary.light,
      color: "#fff",
      "&:hover": {
        backgroundColor: theme.palette.primary.light,
      },
    },
    ncTag: {
      fontSize: "0.7em",
      fontWeight: "bold",
      background: "rgba(231,68,50,0.9)",
      color: "white",
      textTransform: "uppercase",
      borderRadius: "4px",
      padding: "6px",
    },
    obsTag: {
      fontSize: "0.7em",
      fontWeight: "bold",
      background: "blue",
      color: "white",
      textTransform: "uppercase",
      borderRadius: "4px",
      padding: "6px",
    },
    ofiTag: {
      fontSize: "0.7em",
      fontWeight: "bold",
      background: "green",
      color: "white",
      textTransform: "uppercase",
      borderRadius: "4px",
      padding: "6px",
    },
  })
);

export default useStyles;
