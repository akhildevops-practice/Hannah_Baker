import {
  Divider,
  Paper,
  useMediaQuery,
  Typography,
  Grid,
  makeStyles,
} from "@material-ui/core";
import React from "react";

type Props = {
  allChartData?: any;
};

const useStyles = makeStyles(() => ({
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
    padding: "16px 24px",
    height: "100%",
  },
  title: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#4B5563",
    marginBottom: "12px",
    textAlign: "center",
  },
  number: {
    fontSize: "1.875rem",
    fontWeight: 700,
    color: "#2563EB",
    marginBottom: "8px",
  },
  label: {
    fontSize: "0.75rem",
    color: "#6B7280",
    marginBottom: "4px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sideColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingLeft: "16px",
    flex: 1,
  },
  divider: {
    margin: "0 12px",
  },
}));

const AuditDButtons = ({ allChartData }: Props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const classes = useStyles();

  return (
    <Grid container spacing={2} style={{ padding: "0 12px", marginTop: "10px" }}>
      {/* Audits Conducted */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper className={classes.card}>
          <Typography className={classes.title}>Audits Conducted</Typography>
          <div className={classes.row}>
            <div style={{ paddingRight: "16px" }}>
              <Typography className={classes.number}>
                {allChartData?.auditConducted?.auditPlan}
              </Typography>
            </div>
            <Divider orientation="vertical" flexItem className={classes.divider} />
            <div className={classes.sideColumn}>
              <Typography className={classes.label}>
                AdHoc: {allChartData?.auditConducted?.adHoc}
              </Typography>
              <Typography className={classes.label}>
                Audit Report: {allChartData?.auditConducted?.auditReport}
              </Typography>
              <Typography className={classes.label}>
                Audit Schedule: {allChartData?.auditConducted?.auditSchedule}
              </Typography>
            </div>
          </div>
        </Paper>
      </Grid>

      {/* Findings Raised */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper className={classes.card}>
          <Typography className={classes.title}>Findings Raised</Typography>
          <div className={classes.row}>
          <div style={{ paddingRight: "16px" }}>
              <Typography className={classes.number}>
                {allChartData?.findingsConducted?.count?.totalfindings}
              </Typography>
            </div>
            <Divider orientation="vertical" flexItem className={classes.divider} />
            <div className={classes.sideColumn}>
              <Typography className={classes.label}>
                Open: {allChartData?.findingsConducted?.count?.open}
              </Typography>
              <Typography className={classes.label}>
                Verified: {allChartData?.findingsConducted?.count?.verfied}
              </Typography>
              <Typography className={classes.label}>
                Clause: {allChartData?.findingsConducted?.count?.clause}
              </Typography>
            </div>
          </div>
        </Paper>
      </Grid>

      {/* Auditors */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper className={classes.card}>
          <Typography className={classes.title}>Auditors</Typography>
          <div className={classes.row}>
          <div style={{ paddingRight: "16px" }}>
              <Typography className={classes.number}>
                {allChartData?.auditorData?.auditors}
              </Typography>
            </div>
            <Divider orientation="vertical" flexItem className={classes.divider} />
            <div className={classes.sideColumn}>
              <Typography className={classes.label}>
                Auditor Used: {allChartData?.auditorData?.auditorUsed}
              </Typography>
            </div>
          </div>
        </Paper>
      </Grid>

      {/* Audit Coverage */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper className={classes.card}>
          <Typography className={classes.title}>Audit Coverage</Typography>
          <div className={classes.sideColumn} style={{ paddingLeft: 0 }}>
            <Typography className={classes.label}>
              Audited Documents: {allChartData?.auditCoverage?.auditedDocuments}
            </Typography>
            <Typography className={classes.label}>
              System: {allChartData?.auditCoverage?.system}
            </Typography>
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AuditDButtons;
