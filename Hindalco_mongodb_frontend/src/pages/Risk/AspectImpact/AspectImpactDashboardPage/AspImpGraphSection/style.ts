import { makeStyles, Theme } from "@material-ui/core/styles";
export interface StyleProps {
  tableColor: string;
  iconColor: string;
  headerBgColor: string;
}

const useStyles = makeStyles<Theme>((theme: Theme) => ({

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
      padding: "2px 8px !important",
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
}));

export default useStyles;
