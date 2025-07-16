//react, reactouter
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
//material-ui
import {
  Box,
  Paper,
  TextareaAutosize,
  IconButton,
  // Typography,
  Avatar,
  makeStyles,
  Theme,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";

//antd
import { Drawer, Space, Table, Tag, Typography } from "antd";

//utils
import getSessionStorage from "utils/getSessionStorage";
import axios from "apis/axios.global";
import { API_LINK } from "config";

//thirdparty libs
import moment from "moment";

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    "& .ant-drawer-header": {
      backgroundColor: "aliceblue",
      textAlign: "center",
      padding: "10px 20px",
      borderBottom: "none",
    },
    "& .ant-drawer-body": {
      overflowY: "hidden",
    },
    // "& .ant-drawer-content": {
    borderBottomRightRadius: "10px",
    borderBottomLeftRadius: "10px",
    // },
  },
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(2),
  },
  comment: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  avatar: {
    marginRight: theme.spacing(2),
  },
  commentText: {
    flexGrow: 1,
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
  },
  inputBox: {
    display: "flex",
    alignItems: "center",
    marginTop: "auto",
    padding: theme.spacing(2),
  },
  input: {
    flexGrow: 1,
    marginRight: theme.spacing(2),
  },
  tableWrapper: {
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      position: "sticky", // Add these two properties
      top: 0, // Add these two properties
      zIndex: 2,
      padding: "8px 16px",
      fontWeight: 600,
      fontSize: "13px",
      background: "#E8F3F9",
    },
    // "& .ant-table-wrapper .ant-table-container": {
    //   maxHeight: "150px", // Adjust the max-height value as needed
    //   overflowY: "auto",
    // },
    // "& .ant-table-body": {
    //   maxHeight: "150px", // Adjust the max-height value as needed
    //   overflowY: "auto",
    //   "&::-webkit-scrollbar": {
    //     width: "8px",
    //     height: "10px", // Adjust the height value as needed
    //     backgroundColor: "#e5e4e2",
    //   },
    //   "&::-webkit-scrollbar-thumb": {
    //     borderRadius: "10px",
    //     backgroundColor: "grey",
    //   },
    // },
  },
}));

type Props = {
  consolidatedWorkflowHistoryDrawer?: any;
  handleConsolidatedCloseWorkflowHistoryDrawer?: any;
};

const HiraConsolidatedWorkflowHistoryDrawer = ({
  consolidatedWorkflowHistoryDrawer,
  handleConsolidatedCloseWorkflowHistoryDrawer,
}: Props) => {
  const classes = useStyles();
  const params = useParams<any>();
  const navigate = useNavigate();
  const userDetails = getSessionStorage();
  const [workflowHistoryTableData, setWorkflowHistoryTableData] = useState<any>(
    []
  );

  useEffect(() => {
    if (
      !!consolidatedWorkflowHistoryDrawer?.open &&
      !!consolidatedWorkflowHistoryDrawer?.data &&
      !!consolidatedWorkflowHistoryDrawer?.data?.workflow?.length
    ) {
      console.log(
        "checkrisk history in hiraworkflowhistorydrawer",
        consolidatedWorkflowHistoryDrawer
      );

      setWorkflowHistoryTableData(
        consolidatedWorkflowHistoryDrawer?.data?.workflow
      );
    }
  }, [consolidatedWorkflowHistoryDrawer?.open]);

  const handleOpenHistoryPage = (record: any) => {
    // console.log("checkrisk record in handleOpenHistoryPage", record);
    navigate(`/risk/riskregister/AspectImpact/revisionHistory`, {
      state: {
        ...record,
        entityId : consolidatedWorkflowHistoryDrawer?.data?.entityId,
        jobTitle: consolidatedWorkflowHistoryDrawer?.data?.jobTitle,
      },
    });
  };

  const columns = [
    {
      title: "Revision Number",
      dataIndex: "cycleNumber",
      key: "cycleNumber",
      render: (text: string, record: any) => (
        <Typography.Link
          onClick={() => handleOpenHistoryPage(record)}
          style={{ textDecoration: "underline" }}
        >
          {record?.cycleNumber ? record?.cycleNumber - 1 : text}
        </Typography.Link>
      ),
    },
    // {
    //   title: "Job Title",
    //   dataIndex: "cycleNumber",
    //   key: "cycleNumber",
    //   render: (text: string) => (
    //     <span>
    //       {consolidatedWorkflowHistoryDrawer?.data?.jobTitle || "N/A"}
    //     </span>
    //   ),
    // },

    {
      title: "Department",
      dataIndex: "entityName",
      key: "entityName",
      render: (text: string) => (
        <span>
          {consolidatedWorkflowHistoryDrawer?.data?.entityName || "N/A"}
        </span>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      // responsive: ["md"],
      render: (_: any, record: any) => {
        if (record.status === "IN_REVIEW") {
          return (
            <Space size={[0, 8]} wrap>
              {" "}
              <Tag color="#50C878">IN REVIEW</Tag>
            </Space>
          );
        } else if (record.status === "IN_APPROVAL") {
          return (
            <Space size={[0, 8]} wrap>
              <Tag color="#7CB9E8">IN APPROVAL</Tag>
            </Space>
          );
        } else if (record.status === "APPROVED") {
          return (
            <Space size={[0, 8]} wrap>
              <Tag color="#6699CC">APPROVED</Tag>
            </Space>
          );
        } else {
          return (
            <Space size={[0, 8]} wrap>
              <Tag color="#CCCCFF">{record.status}</Tag>
            </Space>
          );
        }
      },
    },

    {
      title: "Last Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text: string) => (
        <span>{moment(text).format("DD-MM-YYYY HH:mm")}</span>
      ),
    },
  ];

  return (
    <Drawer
      title={"Aspect Impact Consolidated Workflow History"}
      open={consolidatedWorkflowHistoryDrawer.open}
      closable={true}
      onClose={handleConsolidatedCloseWorkflowHistoryDrawer}
      // height={250}
      className={classes.drawer}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      maskClosable={false}
      // style={{ overflow: "hidden" }}
      width="40%"
      // getContainer={false} // Append this drawer to the first drawer
    >
      <div className={classes.root}>
        <div className={classes.tableWrapper}>
          <Table
            columns={columns}
            dataSource={workflowHistoryTableData}
            // scroll={{ y: 150 }}
            pagination={false}
          />
        </div>
      </div>
    </Drawer>
  );
};

export default HiraConsolidatedWorkflowHistoryDrawer;
