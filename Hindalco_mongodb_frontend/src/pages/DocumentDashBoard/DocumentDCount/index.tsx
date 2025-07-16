import {
  Paper,
  useMediaQuery,
  Typography,
  Grid,
  makeStyles,
} from "@material-ui/core";
import React from "react";
import useStyles from "./style";

type props = {
  setActiveTab?: any;
  activeTab?: any;
  getDataForNoDocs?: any;
  noOfDocs?: any;
  noOfMyDept?: any;
  noOfNewDocs?: any;
  noOfNewMyDept?: any;
  noOfRevisedDocs?: any;
  noOfRevisedMyDept?: any;
  dueRevision?: any;
  dueRevisionMyDept?: any;
  inWorkFlowCountMyLoc?: any;
  inWorkFlowCountMyDept?: any;
  type?: any;
  totalTypeData?: any;
  revisedCurrentYear?: any;
  yearDataPublished?: any;
  revisedOverDue?: any;
  inWorkFlowData?: any;
  totalDocsMyLoc?: any;
  totalDocsMyDept?: any;
  totalDocs?: any;
};

const useCardStyles = makeStyles(() => ({
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
    padding: "16px",
    textAlign: "center",
    height: "100%",
  },
  title: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#4B5563",
    marginBottom: "12px",
  },
  subtitle: {
    fontSize: "0.75rem",
    color: "#9CA3AF",
    marginLeft: "6px",
    fontWeight: "normal",
  },
  numberBlue: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#2563EB",
  },
  numberGreen: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#16A34A",
  },
  label: {
    fontSize: "0.75rem",
    color: "#6B7280",
    marginTop: "4px",
  },
}));

const DocumentDcount = ({
  activeTab,
  setActiveTab,
  getDataForNoDocs,
  noOfDocs,
  noOfMyDept,
  noOfNewDocs,
  noOfNewMyDept,
  noOfRevisedDocs,
  noOfRevisedMyDept,
  dueRevision,
  dueRevisionMyDept,
  inWorkFlowCountMyLoc,
  inWorkFlowCountMyDept,
  type,
  totalTypeData,
  revisedCurrentYear,
  yearDataPublished,
  revisedOverDue,
  inWorkFlowData,
  totalDocsMyLoc,
  totalDocsMyDept,
  totalDocs,
}: props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const classes = useStyles(matches, smallScreen)();
  const card = useCardStyles();

  const handleTabClick = (index: any) => {
    setActiveTab(index);
  };

  const renderDualCard = (
    title: string,
    tabIndex1: number,
    value1: any,
    label1: string,
    tabIndex2: number,
    value2: any,
    label2: string
  ) => {
    const [mainTitle, subtitle] = title.split("(");
    return (
      <Grid item xs={12} sm={6} md={4}>
        <Paper className={card.card}>
          <Typography className={card.title}>
            {mainTitle}
            {subtitle && <span className={card.subtitle}>({subtitle}</span>}
          </Typography>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <div
              className={`${classes.papercontainers} ${
                activeTab === tabIndex1 ? classes.active : ""
              }`}
              onClick={() => handleTabClick(tabIndex1)}
              style={{ cursor: "pointer" }}
            >
              <div
                className={card.numberBlue}
                style={activeTab === tabIndex1 ? { color: "white" } : {}}
              >
                {value1}
              </div>
              <div
                className={card.label}
                style={activeTab === tabIndex1 ? { color: "white" } : {}}
              >
                {label1}
              </div>
            </div>
            <div
              className={`${classes.papercontainers} ${
                activeTab === tabIndex2 ? classes.active : ""
              }`}
              onClick={() => handleTabClick(tabIndex2)}
              style={{ cursor: "pointer" }}
            >
              <div
                className={card.numberGreen}
                style={activeTab === tabIndex2 ? { color: "white" } : {}}
              >
                {value2}
              </div>
              <div
                className={card.label}
                style={activeTab === tabIndex2 ? { color: "white" } : {}}
              >
                {label2}
              </div>
            </div>
          </div>
        </Paper>
      </Grid>
    );
  };

  const renderSingleCard = (title: string, tabIndex: number, value: any) => {
    const [mainTitle, subtitle] = title.split("(");
    return (
      <Grid item xs={12} sm={6} md={4}>
        <Paper className={card.card}>
          <Typography className={card.title}>
            {mainTitle}
            {subtitle && <span className={card.subtitle}>({subtitle}</span>}
          </Typography>
          <div
            className={`${classes.papercontainers} ${
              activeTab === tabIndex ? classes.active : ""
            }`}
            onClick={() => handleTabClick(tabIndex)}
            style={{ cursor: "pointer" }}
          >
            <div
              className={card.numberBlue}
              style={activeTab === tabIndex ? { color: "white" } : {}}
            >
              {value}
            </div>
          </div>
        </Paper>
      </Grid>
    );
  };

  return (
    <Grid
      container
      spacing={2}
      style={{
        marginTop: "10px",
        padding: "0 4px", // Reduced padding to compensate for Grid spacing
        width: "calc(100% - 16px)", // Compensate for Grid spacing
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {type === "activeuser"
        ? renderDualCard(
            "Total Published Till Date",
            0,
            noOfMyDept,
            "My Dept",
            1,
            noOfDocs,
            "My Unit"
          )
        : renderSingleCard("Total Published Till Date", 0, totalTypeData)}

      {type === "activeuser"
        ? renderDualCard(
            "Published (current year)",
            2,
            noOfNewMyDept,
            "My Dept",
            3,
            noOfNewDocs,
            "My Unit"
          )
        : renderSingleCard("Published (current year)", 2, yearDataPublished)}

      {type === "activeuser"
        ? renderDualCard(
            "Amend (Current Year)",
            4,
            noOfRevisedMyDept,
            "My Dept",
            5,
            noOfRevisedDocs,
            "My Unit"
          )
        : renderSingleCard("Revised (current year)", 4, revisedCurrentYear)}

      {type === "activeuser"
        ? renderDualCard(
            "Amend Due <60 Days",
            6,
            dueRevisionMyDept,
            "My Dept",
            7,
            dueRevision,
            "My Unit"
          )
        : renderSingleCard("Due for Amendment", 6, revisedOverDue)}

      {type === "activeuser"
        ? renderDualCard(
            "In Workflow",
            8,
            inWorkFlowCountMyDept,
            "My Dept",
            9,
            inWorkFlowCountMyLoc,
            "My Unit"
          )
        : renderSingleCard("In Workflow", 8, inWorkFlowData)}

      {type === "activeuser"
        ? renderDualCard(
            "All Documents",
            15,
            totalDocsMyDept,
            "My Dept",
            16,
            totalDocsMyLoc,
            "My Unit"
          )
        : renderSingleCard("All Documents", 17, totalDocs)}
    </Grid>
  );
};

export default DocumentDcount;
