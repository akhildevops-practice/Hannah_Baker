import { makeStyles, Theme } from "@material-ui/core/styles";
export interface StyleProps {
  tableColor: string;
  iconColor: string;
  headerBgColor: string;
}

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  // ".highlighted-row" : {
  //   backgroundColor: "yellow !important"
  // },
  pagination: {
    position: "fixed",
    bottom: "3px",
    right: "0",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "inherit",
    padding: theme.spacing(1),
  },
  modalBox: {
    "& .ant-modal-header": {
      textAlign: "center",
    },
  },
  container: {
    border: "1px solid #666666",
    borderRadius: "5px",
    "& .ant-picker-suffix .anticon-calendar": {
      color: "#4096FF" /* Change the color of the default icon */,
    },
    "& .ant-select-arrow": {
      color: "#4096FF", // Change the color of the default icon
    },
  },
  tableContainer: {
    "& .ant-table-container": {
      overflowX: "auto",
      overflowY: "hidden",
      [theme.breakpoints.down("xs")]: {
        "& .ant-table-container": {
          overflowX: "scroll", // Ensure scrolling is available on small screens
          // Add any additional styles needed for small screens
        },
      },
      "& span.ant-table-column-sorter-inner": {
        color: "#380036",
        // color: ({ iconColor }) => iconColor,
      },
      // "&::-webkit-scrollbar": {
      //   width: "5px",
      //   height: "10px", // Adjust the height value as needed
      //   backgroundColor: "white",
      // },
      // "&::-webkit-scrollbar-thumb": {
      //   borderRadius: "10px",
      //   backgroundColor: "grey",
      // },
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      // position: "sticky", // Add these two properties
      // top: 0, // Add these two properties
      // zIndex: 2,
      // padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      // padding: "6px 8px !important",
      // fontFamily: "Poppins !important",
      // lineHeight: "24px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      position: "sticky",
      top: 0,
      zIndex: 2,
      padding: "6px 8px !important",
      lineHeight: "24px",
    },

    // ... other existing styles ...

    [theme.breakpoints.down("xs")]: {
      "& .ant-table-thead > tr > th": {
        fontSize: "12px", // Smaller font size for headers on small screens
        // Adjust other styles as needed for responsive design
      },
    },
    "& .ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before, .ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before":
      {
        // backgroundColor: ({ tableColor }) => tableColor,
        backgroundColor: "#e9e9e9",
      },

    // "& tr.ant-table-row": {
    //   borderRadius: 5,
    //   cursor: "pointer",
    //   transition: "all 0.1s linear",

    //   "&:hover": {
    //     backgroundColor: "white !important",
    //     boxShadow: "0 1px 5px 0px #0003",
    //     transform: "scale(1.01)",

    //     "& td.ant-table-cell": {
    //       backgroundColor: "white !important",
    //     },
    //   },
    // },
    "& .ant-table-tbody >tr >td": {
      borderBottom: "black",
      // borderBottom: ({ tableColor }) => `1px solid ${tableColor}`, // Customize the border-bottom color here
    },
    "& .ant-table-row.ant-table-row-level-1": {
      backgroundColor: "rgba(169,169,169, 0.1)",
    },
    "& .ant-table-thead .ant-table-cell": {
      // backgroundColor: ({ headerBgColor }) => headerBgColor,
      // color: ({ tableColor }) => tableColor,
      backgroundColor: "#E8F3F9",
      // fontFamily: "Poppins !important",
      color: "#00224E",
    },

    [theme.breakpoints.down("xs")]: {
      "& .ant-table-row:first-child": {
        width: "100%",
      },
    },
  },

  subTableContainer: {
    "& .ant-table-container": {
      backgroundColor: "white !important",
      // overflowX: "auto",

      // overflow: 'hidden',
      overflowY: "auto",

      "& span.ant-table-column-sorter-inner": {
        color: "#380036",
        backgroundColor: "white !important",
      },
    },
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      padding: "12px 16px",
      fontWeight: 600,
      fontSize: "14px",
      // backgroundColor: 'black !important',
    },
    "& .ant-table-cell": {
      // backgroundColor : '#f7f7ff'
    },
    "& .ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before, .ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before":
      {
        backgroundColor: "black",
      },

    "& tr.ant-table-row": {
      borderRadius: 5,
      cursor: "pointer",
      transition: "all 0.1s linear",
    },
    "& .ant-table-tbody >tr >td": {
      borderBottom: `1px solid black`,
      // Customize the border-bottom color here
      backgroundColor: "white !important",
    },
    "& .ant-table-expanded-row ant-table-expanded-row-level-1 > ant-table-cell" : {
      paddding : "0px !important"

    }
    // "& .ant-table-row.ant-table-row-level-1": {
    //   backgroundColor: "rgba(169,169,169, 0.1)",
    // },
    // "& .ant-table-thead .ant-table-cell": {
    //   backgroundColor: "rgb(239, 239, 239) !important",
    //   color: "black",
    // },
  },
  riskTable: {
    maxHeight: "60vh", // Adjust the max-height value as needed
    overflowY: "auto",
    // overflowX: "auto",
    // "&::-webkit-scrollbar": {
    //   width: "5px",
    //   height: "10px", // Adjust the height value as needed
    //   backgroundColor: "white",
    // },
    // "&::-webkit-scrollbar-thumb": {
    //   borderRadius: "10px",
    //   backgroundColor: "grey",
    // },
    // "& .ant-table-tbody": {
    //   maxHeight: "150px", // Adjust the max-height value as needed
    //   overflowY: "auto",
    // },
  },
  expandIcon: {
    float: "left",
  },
  collapseIcon: {
    float: "left",
  },
  visibilityModal: {
    "& .ant-modal .ant-modal-content": {
      padding: "7px 20px",
    },
  },
  //below for exported report
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableCell: {
    border: "1px solid black",
    padding: "10px",
    textAlign: "left",
    wordWrap: "break-word",
  },
  headerRow: {
    backgroundColor: "yellow",
    color: "black",
    textAlign: "center",
    fontWeight: "bold",
  },
  noBorder: {
    border: "none",
  },
  flexContainer: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
  flexItem: {
    flex: 1,
    textAlign: "center", // If you want to center the text
  },
  companyLogo: {
    display: "block",
    margin: "0 auto 10px", // Centers the image and adds space below
    width: "100px", // Adjust the width as necessary
  },
  homePageTagStyle: {
    width: "108px",
    height: "31px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    justifyItems: "center",
    fontSize: "medium",
    cursor: "default",
  },
  historyIcon: {
    fill: "#0E497A",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    // marginRight: "27px",
  },

  labelStyle: {
    "& .ant-input-lg": {
      border: "1px solid #dadada",
    },
    "& .ant-form-item .ant-form-item-label > label": {
      color: "#003566",
      fontWeight: "bold",
      letterSpacing: "0.8px",
      // Add any other styles you want to apply to the <label> element
    },
  },
}));

export default useStyles;
