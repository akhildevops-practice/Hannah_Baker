//react, react-router
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

//antd
import { Col, Form, Input, Row, Typography, Upload } from "antd";
import type { UploadProps } from "antd";

//material-ui
import { IconButton, makeStyles } from "@material-ui/core";
import InboxIcon from "@material-ui/icons/Inbox";
import CrossIcon from "../../../../../../assets/icons/BluecrossIcon.svg";
import axios from "apis/axios.global";
import { API_LINK } from "config";
//antd constants
const { Dragger } = Upload;

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& .MuiAccordionDetails-root": {
      display: "block",
    },
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
  },
  filename: {
    fontSize: theme.typography.pxToRem(12),
    color: theme.palette.primary.light,
    textOverflow: "ellipsis",
    overflow: "hidden",
    width: "160px",
    whiteSpace: "nowrap",
    cursor: "pointer",
    "&:hover": {
      cursor: "pointer", // Change cursor to pointer on hover
    },
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  uploadSection: {
    "& .ant-upload-list-item-name": {
      color: "blue !important",
    },
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
  customBackground: {
    backgroundColor: "white", // Change to your desired color
  },
}));
type Props = {
  drawer?: any;
  fileList?: any;
  setFileList?: any;
  existingUploadedFiles?: any;
};
const AttachmetsTab = ({
  drawer,
  fileList,
  setFileList,
  existingUploadedFiles,
}: Props) => {
  const classes = useStyles();

  // useEffect(() => {
  //   if (existingUploadedFiles && existingUploadedFiles.length > 0) {
  //     const formattedFileList = existingUploadedFiles.map((file:any, index:any) => ({
  //       uid: `-1${index}`, // Unique identifier for each file
  //       name: file.attachmentName, // Name to display in the list
  //       status: 'done', // Mark as already uploaded
  //       url: file.attachmentUrl, // URL to access the file
  //     }));
  //     setFileList(formattedFileList); // Set the fileList state with the formatted list
  //   }
  // }, [existingUploadedFiles, setFileList]);

  const uploadProps: UploadProps = {
    multiple: true, // Set to true to allow multiple file uploads
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setFileList(fileList); // Set the entire file list instead of a single file
      }
    },
    onRemove: (file) => {
      // if (!!existingFiles && existingFiles.length > 0) {
      //   setExistingFiles((prevState: any) =>
      //     prevState.filter((f: any) => f.uid !== file.uid)
      //   ); // Update the existingFiles state to remove the specific fil
      // }
      setFileList((prevState: any) =>
        prevState.filter((f: any) => f.uid !== file.uid)
      ); // Remove the specific file from the list
    },
    // fileList: formData?.file && formData.file.uid ? [formData.file] : [],
  };

  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };
  const handleLinkClick = async (item: any) => {
    const finalLink =
      process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
        ? item?.url
        : await viewObjectStorageDoc(item?.url);
    const anchor = document.createElement("a");
    anchor.href = finalLink || "#";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
    // Your custom logic for link click goes here
    // event.preventDefault();
  };

  const clearFile = async (data: any) => {
    try {
      // console.log("data in clearfile", data);

      const updatedFileList = fileList.filter(
        (item: any) => item.uid !== data.uid
      );
      setFileList(updatedFileList);
    } catch (error) {
      console.error("Error in clearFile:", error);
      return error;
    }
  };
  return (
    <Form
      layout="vertical"
      rootClassName={classes.labelStyle}
      className={`${classes.root} ${classes.customBackground}`}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Form.Item name="uploader" style={{ display: "none" }}>
            <Input />
          </Form.Item>
          <Form.Item name="attachments" label={"Attach File: "}>
            <Dragger
              name="attachments"
              {...uploadProps}
              className={classes.uploadSection}
              multiple
              showUploadList={false}
              fileList={fileList}
              style={{ backgroundColor: "white" }}
            >
              <p
                className="ant-upload-drag-icon"
                style={{ backgroundColor: "white" }}
              >
                <InboxIcon />
              </p>
              <p
                className="ant-upload-text"
                style={{ backgroundColor: "white" }}
              >
                Click or drag file to this area to upload
              </p>
            </Dragger>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        {fileList.length > 0 &&
          fileList.map((item: any) => (
            <div
              style={{
                display: "flex",
                marginLeft: "10px",
                alignItems: "center",
              }}
              key={item.uid}
            >
              <Typography
                className={classes.filename}
                onClick={() => handleLinkClick(item)}
              >
                {item?.name}
              </Typography>

              <IconButton
                // disabled={
                //   readMode ||
                //   formData?.status === "Open" ||
                //   formData?.status === "Analysis_In_Progress" ||
                //   formData?.status === "Draft" ||
                //   formData?.status === "Closed" ||
                //   formData?.status === "Accepted"
                // }
                onClick={() => {
                  // console.log("item click");
                  clearFile(item);
                }}
              >
                <img src={CrossIcon} alt="" />
              </IconButton>
            </div>
          ))}
      </Row>
    </Form>
  );
};

export default AttachmetsTab;
