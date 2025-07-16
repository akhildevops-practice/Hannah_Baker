//react
import { useEffect, useState } from "react";

//material-ui
import { makeStyles, Theme } from "@material-ui/core/styles";

//antd
import { Drawer, Table, Tabs } from "antd";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { useMediaQuery } from "@material-ui/core";

const useStyles = (matches: any) =>
  makeStyles((theme: Theme) => ({
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
    tabsWrapper: {
      "& .ant-tabs-tab": {
        padding: "14px 9px",
        backgroundColor: "#F3F6F8",
        color: "#0E497A",
        fontSize: matches ? "14px" : "10px",
        fontWeight: 600,
        letterSpacing: "0.8px",
      },
      "& .ant-tabs .ant-tabs-tab": {
        padding: "14px 9px",
        backgroundColor: "#F3F6F8",
        color: "#0E497A",
        fontSize: matches ? "14px" : "10px",
        fontWeight: 600,
        letterSpacing: "0.8px",
      },
      "& .ant-tabs-tab-active": {
        padding: "14px 9px",
        backgroundColor: "#006EAD !important",
        color: "#fff !important",
        fontSize: matches ? "14px" : "10px",
        fontWeight: 600,
        letterSpacing: "0.8px",
      },
      "& .ant-tabs-tab-active div": {
        color: "white !important",
        fontWeight: 600,
        fontSize: matches ? "14px" : "10px",
        letterSpacing: "0.8px",
      },
      "& .ant-tabs .ant-tabs-tab+.ant-tabs-tab": {
        margin: "0 0 0 25px",
      },
    },
    tableWrapper: {
      "& .ant-table-wrapper .ant-table-thead>tr>th": {
        position: "sticky", // Add these two properties
        top: 0, // Add these two properties
        zIndex: 2,
        padding: "8px 16px",
        fontWeight: 600,
        fontSize: matches ? "13px" : "11px",

        background: "#E8F3F9",
      },
      "& .ant-table-wrapper .ant-table-tbody>tr>td": {
        fontSize: matches ? "13px" : "10px",
      },
      "& .ant-table-wrapper .ant-table-container": {
        maxHeight: matches ? "150px" : "300px", // Adjust the max-height value as needed
        overflowY: "auto",
      },
      "& .ant-table-body": {
        maxHeight: matches ? "150px" : "300px", // Adjust the max-height value as needed
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "10px", // Adjust the height value as needed
          backgroundColor: "#e5e4e2",
        },
        "&::-webkit-scrollbar-thumb": {
          borderRadius: "10px",
          backgroundColor: "grey",
        },
      },
    },
  }));

type Props = {
  historyDrawer: any;
  setHistoryDrawer: any;
  toggleHistoryDrawer: any;
  formData: any;
};

const HistoryTopDrawer = ({
  historyDrawer,
  setHistoryDrawer,
  toggleHistoryDrawer,
  formData,
}: Props) => {
  useEffect(() => {
    console.log("in history top drawer--->", formData);
  }, []);
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles(matches)();
  const tabs = [
    {
      label: "Version History",
      key: 1,
      children: <VersionHistory formData={formData} />,
    },
    {
      label: "Workflow History",
      key: 2,
      children: <WorkflowHistory formData={formData} />,
    },
    {
      label: "Attachment History",
      key: 3,
      children: <AttachmentHistory formData={formData} />,
    },
  ];
  return (
    <Drawer
      title={"Document History"}
      placement="top"
      open={historyDrawer.open}
      closable={true}
      onClose={toggleHistoryDrawer}
      height={matches ? 350 : 550}
      className={classes.drawer}
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      style={{ overflow: "hidden", overflowY: "hidden" }}
      // width="100%"
      getContainer={false} // Append this drawer to the first drawer
    >
      <Tabs
        defaultActiveKey="1"
        type="card"
        items={tabs as any}
        animated={{ inkBar: true, tabPane: true }}
        rootClassName={classes.tabsWrapper}
      />
    </Drawer>
  );
};

const VersionHistory = ({ formData }: { formData: any }) => {
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles(matches)();
  const [tableData, setTableData] = useState<any>(formData.DocumentVersions);
  const columns = [
    {
      title: "Issue - Version",
      dataIndex: "versionName",
      key: "versionName",
      render: (_: any, record: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          {record.issueNumber} - {record.currentVersion}
        </div>
      ),
    },
    {
      title: "By",
      dataIndex: "by",
      key: "by",
    },
    {
      title: "Approved Date",
      dataIndex: "approvedDate",
      key: "approvedDate",
    },
    {
      title: "Link",
      dataIndex: "versionLink",
      key: "versionLink",
    },
  ];
  return (
    <div className={classes.tableWrapper}>
      <Table columns={columns} dataSource={tableData} pagination={false} />
    </div>
  );
};

const WorkflowHistory = ({ formData }: { formData: any }) => {
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles(matches)();
  const [tableData, setTableData] = useState<any>(
    formData.DocumentWorkFlowHistory
  );
  const columns = [
    {
      title: "Action",
      dataIndex: "actionName",
      key: "actionName",
    },
    {
      title: "By",
      dataIndex: "actionBy",
      key: "actionBy",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
    },
  ];
  return (
    <div className={classes.tableWrapper}>
      <Table
        columns={columns}
        dataSource={tableData}
        // scroll={{ y: 150 }}
        pagination={false}
      />
    </div>
  );
};

const AttachmentHistory = ({ formData }: { formData: any }) => {
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles(matches)();
  const [tableData, setTableData] = useState<any>(formData?.attachmentHistory);
  const tabledata = formData?.attachmentHistory.map((item: any) => {
    const updatedAtDate = new Date(item.updatedAt);
    const formattedDate = updatedAtDate.toLocaleDateString("en-GB");
    const urlParts = item.attachment.split("/");

    // Get the last part of the URL, which is the document name with extension
    const documentNameWithExtension = urlParts[urlParts.length - 1];
    return {
      ...item,
      updatedAt: formattedDate,
      attachment: documentNameWithExtension,
    };
  });
  console.log("formdata in attachment", formData?.attachmentHistory);
  const columns = [
    {
      title: "Uploaded By",
      dataIndex: "updatedBy",
      key: "updatedBy",
    },
    {
      title: "Attachment Name",
      dataIndex: "attachment",
      key: "attachment",
    },
    {
      title: "Date",
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
  ];
  return (
    <div className={classes.tableWrapper}>
      <Table
        columns={columns}
        dataSource={tabledata}
        // scroll={{ y: 150 }}
        pagination={false}
      />
    </div>
  );
};

export default HistoryTopDrawer;
