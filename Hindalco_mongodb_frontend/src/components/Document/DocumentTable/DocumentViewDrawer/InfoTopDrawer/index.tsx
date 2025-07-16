//material-ui
import { useMediaQuery } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";

//antd
import { Col, Drawer, Row } from "antd";

//assets
import CloseIconImageSvg from "assets/documentControl/Close.svg";

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
}));

type Props = {
  infoDrawer: any;
  setInfoDrawer: any;
  toggleInfoDrawer: any;
  formData: any;
};

const InfoTopDrawer = ({
  infoDrawer,
  setInfoDrawer,
  toggleInfoDrawer,
  formData,
}: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const classes = useStyles();
  function formatDate(inputDate: any) {
    if (inputDate != null) {
      const date = new Date(inputDate);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      // Months are zero-indexed
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return "";
  }
  const inputDate = formData?.nextRevisionDate;
  const formattedDate = formatDate(inputDate);
  const publishedDateFormatted = formatDate(formData?.approvedDate);

  return (
    <Drawer
      title={"Document Details"}
      placement="top"
      open={infoDrawer.open}
      closable={true}
      onClose={toggleInfoDrawer}
      maskClosable={false}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      height={matches ? 250 : 630}
      className={classes.drawer}
      style={{ overflow: "hidden" }}
      // width="100%"
      getContainer={false} // Append this drawer to the first drawer
    >
      <Row gutter={[16, 16]}>
        <Col span={matches ? 6 : 8}>
          <b>Document Name:</b>{" "}
        </Col>
        <Col span={16}>{(!!formData && formData?.documentName) || "N/A"}</Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={matches ? 6 : 8}>
          <b>Document Number:</b>{" "}
        </Col>
        <Col span={16}>
          {(!!formData && formData?.documentNumbering) || "N/A"}
        </Col>
      </Row>
      <div style={{ marginTop: "20px" }}></div>
      <Row gutter={[16, 16]}>
        <Col span={matches ? 6 : 12}>
          <b>Issue :</b>
        </Col>
        <Col span={matches ? 6 : 12}>{formData?.issueNumber || "001"}</Col>
        <Col span={matches ? 6 : 12}>
          <b>Version :</b>
        </Col>
        <Col span={matches ? 6 : 12}>{formData?.currentVersion || "A"}</Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={matches ? 6 : 12}>
          <b>Unit:</b>
        </Col>
        <Col span={matches ? 6 : 12}>
          {(!!formData && formData?.locationName) || "N/A"}
        </Col>
        <Col span={matches ? 6 : 12}>
          <b>Department:</b>
        </Col>
        <Col span={matches ? 6 : 12}>
          {(!!formData && formData?.entityName) || "N/A"}
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={matches ? 6 : 12}>
          <b>Document Type:</b>
        </Col>
        <Col span={matches ? 6 : 12}>
          {(!!formData && formData?.docType) || "N/A"}
        </Col>
        <Col span={matches ? 6 : 12}>
          <b>Document Tags:</b>{" "}
        </Col>
        <Col span={matches ? 6 : 12}>
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
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <b>Published Date:</b>
        </Col>
        <Col span={matches ? 6 : 12}>
          {!!formData && publishedDateFormatted}
        </Col>
        <Col span={matches ? 6 : 12}>
          <b>Next Revision DueOn:</b>
        </Col>
        <Col span={matches ? 6 : 12}>{!!formData && formattedDate}</Col>
      </Row>
      <div style={{ marginTop: "20px" }}></div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <b>Description:</b>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>{(!!formData && formData?.description) || "N/A"}</Col>
      </Row>
      <div style={{ marginTop: "20px" }}></div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <b>Reason For Creation/Ammendment:</b>{" "}
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          {(!!formData && formData?.reasonOfCreation) || "N/A"}
        </Col>
      </Row>
    </Drawer>
  );
};

export default InfoTopDrawer;
