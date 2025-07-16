import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import {
  processDocFormData,
  drawerData,
  moduleNamesAtom,
  globalSearchClausesResult,
  globalSearchDocumentsResult,
  ncsForm,
} from "recoil/atom";
import InboxIcon from "@material-ui/icons/Inbox";

//antd
import {
  Col,
  Form,
  Input,
  Row,
  Select,
  Upload,
  Modal,
  DatePicker,
  Avatar,
  Typography,
} from "antd";
import type { UploadProps } from "antd";
import { TextField, makeStyles, useMediaQuery } from "@material-ui/core";
import Dragger from "antd/es/upload/Dragger";
import TextArea from "antd/es/input/TextArea";
import moment from "moment";
import dayjs from "dayjs";
import AutoComplete from "components/AutoComplete";

type Props = {
  ncDisplayData: any;
};
const useStyles = makeStyles((theme: any) => ({
  root: {
    width: "100%",
    "& .MuiAccordionDetails-root": {
      display: "block",
    },
  },
  docProof: {
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.primary.light,
    textOverflow: "ellipsis",
    overflow: "hidden",
    width: "200px",
    whiteSpace: "nowrap",
    textDecoration: "underline",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
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
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
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
  dateInput: {
    border: "1px solid #bbb",
    // paddingLeft: "10px",
    // paddingRight: "10px",
    borderRadius: "5px",
    "& .MuiInput-underline:before": {
      borderBottom: "none", // Remove the bottom border
    },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottom: "none", // Remove the hover border
    },
    "& .MuiInput-underline:after": {
      borderBottom: "none", // Remove the focus border
    },
    "&.MuiInputBase-input": {
      // padding: "6px 0 7px 10px",
    },
  },
}));

const ListOfFindingsDrawer = ({ ncDisplayData }: Props) => {
  const matches = useMediaQuery("(min-width:822px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const classes = useStyles();
  const { Option } = Select;
  const [auditeeForm] = Form.useForm();
  const [formData, setFormData] = useRecoilState(ncsForm);
  return (
    <Form
      form={auditeeForm}
      layout="vertical"
      disabled={true}
      rootClassName={classes.labelStyle}
      // initialValues={{
      //   auditName: ncDisplayData.auditName,
      //   auditDateTime: ncDisplayData.auditDateTime,
      //   // formData.auditName
      // }}
    >
      <Row gutter={[16, 16]}>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Audit Name:">
            <Input
              name="auditName"
              value={ncDisplayData?.auditName}
              disabled={true}
            ></Input>
          </Form.Item>
        </Col>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Audit Date & Time:">
            {/* <DatePicker
              value={dayjs(ncDisplayData.auditDateTime)||""} // Assuming ncDisplayData.auditDateTime is a valid date string
              // locale={localeObject} 
            ></DatePicker> */}

            <TextField
              // variant="outlined"
              fullWidth
              size="small"
              value={ncDisplayData.auditDateTime}
              disabled
              className={classes.dateInput}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Findings Date:" style={{ width: "100%" }}>
            <TextField
              disabled={true}
              name="date"
              value={formData.ncDate}
              className={classes.dateInput}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Audit Type:">
            <Input value={ncDisplayData.auditType} disabled={true}></Input>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Auditor(s):">
            <AutoComplete
              suggestionList={[
                {
                  firstname: "Mridul",
                },
              ]}
              name="Auditors"
              keyName="auditor"
              disabled={true}
              labelKey="email"
              formData={ncDisplayData}
              setFormData={setFormData}
              getSuggestionList={() => console.log("get suggestions")}
              defaultValue={ncDisplayData.auditor}
            />
          </Form.Item>
        </Col>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Auditee(s):">
            <AutoComplete
              suggestionList={[
                {
                  firstname: "Mridul",
                },
              ]}
              name="Auditee"
              keyName="auditee"
              disabled={true}
              labelKey="email"
              formData={ncDisplayData}
              setFormData={setFormData}
              getSuggestionList={() => console.log("get suggestions")}
              defaultValue={ncDisplayData.auditee}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Audit No:">
            <Input value={ncDisplayData.auditNumber}></Input>
          </Form.Item>
        </Col>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Clause Affected:">
            <Input
              value={ncDisplayData.clauseAffected || ""}
              disabled={true}
            ></Input>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Entity:">
            <Input value={ncDisplayData.entity}></Input>
          </Form.Item>
        </Col>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Location:">
            <Input value={ncDisplayData.location}></Input>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Document/Proof:">
            {ncDisplayData?.documentProof !== "" ? (
              <Typography className={classes.docProof}>
                {ncDisplayData?.documentProof}
              </Typography>
            ) : (
              <Typography color="textSecondary">
                No Document/Proof found!
              </Typography>
            )}
          </Form.Item>
        </Col>
        <Col span={matches ? 12 : 24}>
          <Form.Item label="Findings Details:">
            <Input value={ncDisplayData.ncDetails}></Input>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default ListOfFindingsDrawer;
