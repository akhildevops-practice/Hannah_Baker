import { makeStyles, Theme } from "@material-ui/core/styles";
import { matches } from "lodash";
export interface StyleProps {
  tableColor: string;
  iconColor: string;
  headerBgColor: string;
}

const useStyles = (matches: any) =>
  makeStyles<Theme>((theme: Theme) => ({
    // ".highlighted-row" : {
    //   backgroundColor: "yellow !important"
    // },

    docNavText: {
      fontSize: "16px",
      fontWeight: 600,
      letterSpacing: "0.6px",
      // letterSpacing: "0.3px",
      // lineHeight: "24px",
      // textTransform: "capitalize",
      // marginLeft: "5px",
    },
    modalBox: {
      "& .ant-modal-header": {
        textAlign: "center",
      },
    },

    // For the table container
    tableContainer: {
      "& .ant-table-container": {
        overflowX: "auto",
        overflowY: "hidden",
      },
      "& .ant-table-wrapper .ant-table-thead>tr>th": {
        fontWeight: 600,
        fontSize: "14px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        position: "sticky",
        top: 0,
        zIndex: 2,
        padding: "6px 8px !important",
        lineHeight: "24px",
      },
      "& .ant-table-wrapper .ant-table-thead > tr > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before, .ant-table-wrapper .ant-table-thead > tr > td:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before":
        {
          backgroundColor: "#e9e9e9",
        },
      "& tr.ant-table-row": {
        borderRadius: 5,
        cursor: "pointer",
        transition: "all 0.1s linear",
        "&:hover": {
          backgroundColor: "white !important",
          boxShadow: "0 1px 5px 0px #0003",
          transform: "scale(1.01)",
          "& td.ant-table-cell": {
            backgroundColor: "white !important",
          },
        },
      },
      "& .ant-table-tbody >tr >td": {
        padding: "4px 8px !important",
      },
      "& .ant-table-thead .ant-table-cell": {
        backgroundColor: "#E8F3F9",
        color: "#00224E",
      },
      marginBottom: "20px", // Add margin to the bottom of the table container
    },

    // For the pagination
    pagination: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      padding: theme.spacing(1),
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
      "& .ant-table-expanded-row ant-table-expanded-row-level-1 > ant-table-cell":
        {
          paddding: "0px !important",
        },
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
      height: matches ? "31px" : "25px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      justifyItems: "center",
      fontSize: matches ? "medium" : "12px",
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
    modal2: {
      "&.ant-modal .ant-modal-content": {
        padding: "0px 0px 10px 0px",
      },
    },
  }));

export default useStyles;
