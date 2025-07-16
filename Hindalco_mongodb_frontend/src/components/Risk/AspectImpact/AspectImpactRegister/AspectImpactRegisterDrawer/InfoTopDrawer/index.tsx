//antd
import { Col, Drawer, Row } from "antd";

//material-ui
import { makeStyles, useMediaQuery } from "@material-ui/core";

//utils
import getSessionStorage from "utils/getSessionStorage";

//assets
import CloseIconImageSvg from "assets/documentControl/Close.svg";

//thirdpartylibs
const moment = require("moment");

const useStyles = makeStyles((theme) => ({
  infoDrawer: {
    "& .ant-drawer-header": {
      backgroundColor: "aliceblue",
      textAlign: "center",
      padding: "10px 20px",
      borderBottom: "none",
    },
    borderBottomRightRadius: "10px",
    borderBottomLeftRadius: "10px",
  },
  infoContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "20px",
    backgroundColor: "#f5f5f5",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    margin: "10px 0",
  },
  infoRow: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #e0e0e0",
  },
  infoLabel: {
    fontWeight: "bold",
    fontSize: "1rem",
  },
}));

type Props = {
  infoDrawer: any;
  setInfoDrawer: any;
  //   formData: any;
  toggleInfoDrawer: any;
  riskRegisterData: any;
};

const InfoTopDrawer = ({
  infoDrawer,
  setInfoDrawer,
  //   formData,
  toggleInfoDrawer,
  riskRegisterData,
}: Props) => {
  const matches = useMediaQuery("(min-width:820px)");
  const classes = useStyles();
  const userDetails = getSessionStorage();
  //   useEffect(() => {
  //     console.log("in details drawer--->", formData);
  //   }, []);
  return (
    <Drawer
      title={"Aspect Impact's Information"}
      placement="top"
      open={infoDrawer.open}
      closable={true}
      onClose={toggleInfoDrawer}
      height={250}
      className={classes.infoDrawer}
      maskClosable={false}
      style={{ overflow: "hidden" }}
      closeIcon={
        <img
          src={CloseIconImageSvg}
          alt="close-drawer"
          style={{ width: "36px", height: "38px", cursor: "pointer" }}
        />
      }
      // width="100%"
      getContainer={false} // Append this drawer to the first drawer
    >
      <div className={classes.infoContent}>
        <Row className={classes.infoRow}>
          {/* <Col span={12}>
            <div className={classes.infoLabel}>Department:</div> {userDetails?.entity?.entityName || "N/A"}
          </Col> */}
          <Col span={matches ? 12 : 24}>
            <div className={classes.infoLabel}>
              Date Created:{" "}
              {riskRegisterData?.dateCreated || moment().format("DD/MM/YYYY")}
            </div>
          </Col>
          <Col span={matches ? 12 : 24}>
            <div className={classes.infoLabel}>
              AI No. : {riskRegisterData?.prefixSuffix || " "}
            </div>
          </Col>
        </Row>
        {/* <Row className={classes.infoRow}>
          <Col span={12}>
            <div className={classes.infoLabel}>Unit:</div> {userDetails?.location?.locationName || "N/A"}
          </Col>
        
        </Row> */}
      </div>
    </Drawer>
  );
};

export default InfoTopDrawer;
