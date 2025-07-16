import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    "& .ant-drawer-right>.ant-drawer-content-wrapper": {
      transform: "translateX(-4px) !important",
      width: "400px !important",
      // transform : ({detailsDrawer}) => detailsDrawer ? "translateX(0px) !important" : "none"
    },
    "& .ant-drawer-wrapper-body": {
      // backgroundColor : "#F0F8FF !important"
    },
    "& .ant-drawer-header": {
      backgroundColor: "aliceblue",
      padding: "10px 7px",
      borderBottom: "none",
      "& .ant-btn-default": {
        backgroundColor: "#e8f3f9",
        borderColor: "#0e497a",
        "& svg": {
          color: "#0e497a",
        },
      },
    },
  },

  docDetailsDrawer: {
    "& .ant-drawer-header": {
      backgroundColor: "aliceblue",
      textAlign: "center",
      padding: "10px 20px",
      borderBottom: "none",
    },
    // "& .ant-drawer-content": {
    borderBottomRightRadius: "10px",
    borderBottomLeftRadius: "10px",
    // },
  },
  starIcon: {
    color: "#FF0000",
    // marginRight: "30px",
    width: "32px",
    height: "35px",
    cursor: "pointer",
  },
  commentsIcon: {
    fill: "#0E497A",
    cursor: "pointer",
    width: "28px",
    height: "37px",
    marginRight: "30px",
  },
  downloadIcon: {
    fill: "#0E497A",
    cursor: "pointer",
    width: "32px",
    height: "40px",
    marginRight: "30px",
  },
  historyIcon: {
    fill: "#0E497A",
    width: "30px",
    height: "35px",
    cursor: "pointer",
    marginRight: "27px",
  },
  docInfoIcon: {
    marginRight: "30px",
    width: "30px",
    height: "35px",
    cursor: "pointer",
  },
  expandIcon: {
    marginRight: "30px",
    width: "22px",
    height: "36px",
    cursor: "pointer",
  },
  visibilityIcon: {
    cursor: "pointer"
  },
  compareIcon: {
    cursor: "pointer"
  },
}));

export default useStyles;
