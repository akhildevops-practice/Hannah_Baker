import { makeStyles } from "@material-ui/core/styles";
import { useLocation } from "react-router-dom";

//logo
import HindalcoLogoSvg from "assets/logo/HindalcoLogoSvg.svg";

//icons
import { ReactComponent as CreateIcon } from "../../../assets/documentControl/Create.svg";
import { ReactComponent as FilterIcon } from "../../../assets/documentControl/Filter.svg";
import { ReactComponent as ConfigIcon } from "../../../assets/documentControl/configuration.svg";
import { Divider, Tooltip } from "antd";
import { AnyMessageParams } from "yup/lib/types";
import { ReactComponent as NewFilterIcon } from "assets/documentControl/NewFilterIcon.svg";
import { useMediaQuery } from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import TouchAppIcon from "@material-ui/icons/TouchApp";

type Props = {
  moduleName: string;
  createHandler?: any;
  filterHandler?: any;
  configHandler?: any;
  showSideNav?: boolean;
  setIsHovered?: any;
  isHovered?: boolean;
  handleMouseEnter?: any;
  handleMouseLeave?: any;
  searchValues?: any;
  refElementForAllDocument6?: any;
  filterDisplay?: boolean;
};

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    marginTop: "2px",
  },
  moduleHeader: {
    color: "#000",
    fontSize: "24px",
    textTransform: "capitalize",
    // fontFamily: "Poppins, sans-serif",
    lineHeight: "24px",
    paddingLeft: "6px",
  },
  docNavIconStyle: {
    width: "30px",
    height: "30px",
    paddingRight: "6px",
    cursor: "pointer",
  },
  docNavDivider: {
    top: "0.94em",
    height: "1.6em",
    background: "black",
  },
  docNavText: {
    // fontFamily: "Poppins",
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "24px",
    color: "#959595",
  },
  docNavRightFlexBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  docNavInnerFlexBox: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "6px 4px",
    "& .ant-input": {
      background: "#E8F3F9 !important",
    },
  },
  divderRightSide: {
    top: "0.1em",
    height: "1.5em",
    background: "black",
  },
  docNavTextRightSide: {
    // fontFamily: "Poppins",
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "24px",
    color: "#000000 ",
    paddingLeft: "5px",
  },
}));

const ModuleHeader = ({
  moduleName,
  createHandler,
  filterHandler,
  configHandler,
  showSideNav = false,
  setIsHovered,
  isHovered,
  handleMouseEnter,
  filterDisplay = true,
  handleMouseLeave,
  searchValues,
  refElementForAllDocument6,
}: Props) => {
  const classes = useStyles();
  const location = useLocation();
  // console.log("checkcommon module header filter", filterHandler);

  const isEmptyFunction = (func: any) => {
    const funcStr = func?.toString();
    return (
      funcStr
        ?.slice(funcStr?.indexOf("{") + 1, funcStr?.lastIndexOf("}"))
        ?.trim() === ""
    );
  };

  const matches = useMediaQuery("(min-width:821px)");
  return (
    <>
      <div
        style={{
          marginLeft: "auto",
          // marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}

        // onClick={toggleGraphSection}
      >
        {!!filterHandler && filterDisplay && (
          <div ref={refElementForAllDocument6}>
            <FilterIcon
              style={{
                width: matches ? "28px" : "24px",
                height: matches ? "28px" : "24px",
                padding: "1px",
                marginRight: "5px",
                // position: matches ? "relative" : "absolute",
                // top: matches ? "0px" : "143px",
                // left: matches ? "0px" : "70px",
              }}
              onClick={filterHandler && filterHandler}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              title=" Apply Filter Here"
            />
          </div>
        )}

        {matches ? (
          <>
            {createHandler && (
              <div
                onClick={() => {
                  // console.log("distributed doc clicked");
                  createHandler();
                  // setTabFilter("distributedDoc");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 20px 4px 20px",
                  cursor: "pointer",
                  borderRadius: "5px",
                  position: "relative", // this is needed for the pseudo-element arrow
                  backgroundColor: "rgb(0, 48, 89)", // conditional background color
                }}
              >
                <span
                  style={{
                    color: "white",
                  }}
                >
                  Create
                </span>
              </div>
            )}{" "}
          </>
        ) : (
          <>
            {/* {" "}
            {createHandler && (
              <AddCircleIcon
                onClick={() => {
                  // console.log("distributed doc clicked");
                  createHandler();
                  // setTabFilter("distributedDoc");
                }}
                style={{
                  color: "rgb(0, 48, 89)",
                  paddingTop: "5px",
                  fontSize: "30px",
                }}
              />
            )} */}
          </>
        )}
      </div>
    </>
  );
};

export default ModuleHeader;
