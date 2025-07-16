import {
  CircularProgress,
  Paper,
  Typography,
  Grid,
  makeStyles,
  useMediaQuery,
  Divider,
} from "@material-ui/core";
import useStyles from "./styles";

const useLocalStyles = makeStyles(() => ({
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
    padding: "24px",
    textAlign: "center",
    height: "100%",
  },
  title: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#4B5563",
    marginBottom: "16px",
  },
  subtitle: {
    fontSize: "0.75rem",
    color: "#9CA3AF",
    marginLeft: "6px",
  },
  numberBlue: {
    fontSize: "1.875rem",
    fontWeight: 700,
    color: "#2563EB",
  },
  numberGreen: {
    fontSize: "1.875rem",
    fontWeight: 700,
    color: "#16A34A",
  },
  label: {
    fontSize: "0.75rem",
    color: "#6B7280",
  },
}));

type Props = {
  countObject?: any;
  isLoading?: any;
  activeTab?: any;
  setActiveTab?: any;
  isDefaultFilter?: boolean;
};

const AspImpCountSection = ({
  countObject,
  isLoading,
  activeTab = null,
  setActiveTab,
  isDefaultFilter,
}: Props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const classes = useStyles(matches)();
  const local = useLocalStyles();

  const defaultSections = [
    {
      title: "Life Cycle Stages",
      subtitle: "Till Date",
      dept: countObject?.totalEntityWise,
      unit: countObject?.totalLocationWise,
    },
    {
      title: "InWorkflow Stages",
      subtitle: "Till Date",
      dept: countObject?.inWorkflowEntityWise,
      unit: countObject?.inWorkflowLocationWise,
    },
    {
      title: "Current Year Stages",
      subtitle: "",
      dept: countObject?.currentYearEntityWise,
      unit: countObject?.currentYearLocationWise,
    },
  ];

  const filteredSections = [
    {
      title: "Life Cycle Stages",
      subtitle: "Till Date",
      count: countObject?.totalAspImp,
    },
    {
      title: "InWorkflow Stages",
      subtitle: "Till Date",
      count: countObject?.inWorkflowAspImp,
    },
    {
      title: "Current Year Stages",
      subtitle: "",
      count: countObject?.currentYearAspImp,
    },
  ];

  return isLoading ? (
    <CircularProgress />
  ) : isDefaultFilter ? (
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
      {defaultSections.map((section, idx) => (
        <Grid item xs={12} sm={6} lg={4} key={idx}>
          <Paper className={local.card}>
            <Typography className={local.title}>
              {section.title}
              {section.subtitle && <span className={local.subtitle}>{section.subtitle}</span>}
            </Typography>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <div>
                <div className={local.numberBlue}>{section.dept}</div>
                <div className={local.label}>My Dept</div>
              </div>
              <div>
                <div className={local.numberGreen}>{section.unit}</div>
                <div className={local.label}>My Unit</div>
              </div>
            </div>
          </Paper>
        </Grid>
      ))}
    </Grid>
  ) : (
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
      {filteredSections.map((section, idx) => (
        <Grid item xs={12} sm={6} lg={4} key={idx}>
          <Paper className={local.card}>
            <Typography className={local.title}>
              {section.title}
              {section.subtitle && <span className={local.subtitle}>{section.subtitle}</span>}
            </Typography>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div>
                <div className={local.numberBlue}>{section.count}</div>
              </div>
            </div>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default AspImpCountSection;
