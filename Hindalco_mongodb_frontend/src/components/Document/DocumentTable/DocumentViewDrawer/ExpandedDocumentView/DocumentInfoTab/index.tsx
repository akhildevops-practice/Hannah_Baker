import {
  LocalOfferOutlined as TagIcon,
  LocationOnOutlined as UnitIcon,
  DescriptionOutlined as DocNameIcon,
  HelpOutlineOutlined as ReasonIcon,
  FileCopyOutlined as DocTypeIcon,
  ReportOutlined as IssueIcon,
  ConfirmationNumberOutlined as VersionIcon,
  NotesOutlined as DescriptionIcon,
  BusinessOutlined as DepartmentIcon,
} from "@material-ui/icons";
import { Col, Row } from "antd";

import useStyles from "./style";

const DocumentInfoTab = ({ formData }: { formData: any }) => {
  const classes = useStyles();
  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[24, 24]} className={classes.rowStyle}>
        <Col span={12} className={classes.colWrapper}>
          <div className={classes.labelContainer}>
            <DocNameIcon className={classes.iconStyle} />
            <b className={classes.labelStyle}>Document Name :</b>
          </div>
        </Col>
        <Col span={12}>
          <span>{(!!formData && formData?.documentName) || "N/A"}</span>
        </Col>
      </Row>
      <Row gutter={[24, 24]} className={classes.rowStyle}>
        <Col span={12} className={classes.colWrapper}>
          <ReasonIcon className={classes.iconStyle} />{" "}
          <b className={classes.labelStyle}>Reason For Creation/Ammendment:</b>
        </Col>
        <Col span={10}>
          <span>{(!!formData && formData?.reasonOfCreation) || "N/A"}</span>
        </Col>
      </Row>
      <Row
        gutter={[24, 24]}
        // style={{ color: "gray" }}
        className={classes.rowStyle}
      >
        <Col span={12} className={classes.colWrapper}>
          <IssueIcon className={classes.iconStyle} />{" "}
          <b className={classes.labelStyle}>Issue :</b>
        </Col>
        <Col span={12}>{formData?.issueNumber || "001"}</Col>
      </Row>
      <Row
        gutter={[24, 24]}
        // style={{ color: "gray" }}
        className={classes.rowStyle}
      >
        <Col span={12} className={classes.colWrapper}>
          <VersionIcon className={classes.iconStyle} />{" "}
          <b className={classes.labelStyle}>Version :</b>
        </Col>
        <Col span={12}>{formData?.currentVersion || "A"}</Col>
      </Row>
      <Row gutter={[24, 24]} className={classes.rowStyle}>
        <Col span={12} className={classes.colWrapper}>
          <UnitIcon className={classes.iconStyle} />{" "}
          <b className={classes.labelStyle}>Unit :</b>
        </Col>
        <Col span={12}>{(!!formData && formData?.locationName) || "N/A"}</Col>
      </Row>
      <Row gutter={[24, 24]} className={classes.rowStyle}>
        <Col span={12} className={classes.colWrapper}>
          <DepartmentIcon className={classes.iconStyle} />{" "}
          <b className={classes.labelStyle}>Department :</b>
        </Col>
        <Col span={12}>{(!!formData && formData?.entityName) || "N/A"}</Col>
      </Row>
      <Row gutter={[24, 24]} className={classes.rowStyle}>
        <Col span={12} className={classes.colWrapper}>
          <DocTypeIcon className={classes.iconStyle} />{" "}
          <b className={classes.labelStyle}>Document Type :</b>
        </Col>
        <Col span={12}>{(!!formData && formData?.docType) || "N/A"}</Col>
      </Row>
      <Row gutter={[24, 24]} className={classes.rowStyle}>
        <Col span={12} className={classes.colWrapper}>
          <TagIcon className={classes.iconStyle} />
          <b className={classes.labelStyle}>Document Tags :</b>
        </Col>
        <Col span={12}>
          {(!!formData &&
            formData?.tags.length > 0 &&
            formData?.tags?.map((tag: any, index: any) => (
              <>
                {" "}
                {tag} {index < formData?.tags.length - 1 && ","}
              </>
            ))) ||
            "N/A"}
        </Col>
      </Row>
      <Row gutter={[24, 24]} className={classes.rowStyle}>
        <Col span={12} className={classes.colWrapper}>
          <DescriptionIcon className={classes.iconStyle} />{" "}
          <b className={classes.labelStyle}>Description :</b>
        </Col>
        <Col span={12}>{(!!formData && formData?.description) || "N/A"}</Col>
      </Row>
    </div>
  );
};

export default DocumentInfoTab;
