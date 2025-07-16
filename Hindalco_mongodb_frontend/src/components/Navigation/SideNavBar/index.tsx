import { Col, Menu, Popover, Row, Tooltip } from "antd";
import { makeStyles } from "@material-ui/core/styles";
import { useNavigate } from "react-router-dom";

import { ReactComponent as HorizontalDivider } from "assets/appsIcon/HorizontalDivider.svg";
import { ReactComponent as DocControlIcon } from "assets/appsIcon/Doc Control.svg";
import { ReactComponent as CIPIcon } from "assets/appsIcon/cip.svg";
import { ReactComponent as CAPAIcon } from "assets/appsIcon/Corrective & Preventive action.svg";
import { ReactComponent as AuditsIcon } from "assets/appsIcon/Audit.svg";
import { ReactComponent as MRMIcon } from "assets/appsIcon/MRM.svg";
import { ReactComponent as HIRAIcon } from "assets/appsIcon/Hira.svg";
import { ReactComponent as AspImpIcon } from "assets/appsIcon/ASP-IMP.svg";
import { ReactComponent as ObjTargetIcon } from "assets/appsIcon/Obj & Targets.svg";
import { ReactComponent as CARAIcon } from "assets/appsIcon/CARA.svg";
import { ReactComponent as OpControlIcon } from "assets/appsIcon/Op Control.svg";
import { ReactComponent as KPIIcon } from "assets/appsIcon/KPI.svg";
import ConfirmationNumberOutlinedIcon from "@material-ui/icons/ConfirmationNumberOutlined";
import checkRoles from "utils/checkRoles";

//menu icons

import { ReactComponent as NewDashboardIcon } from "assets/appsIcon/NewDashboardIcon.svg";
import { ReactComponent as DashboardOnHover } from "assets/appsIcon/DashboardOnHover.svg";

import { ReactComponent as NewInboxIcon } from "assets/appsIcon/NewInboxIcon.svg";
import { ReactComponent as InboxOnHover } from "assets/appsIcon/InboxOnHover.svg";

import { ReactComponent as NewMasterIcon } from "assets/appsIcon/NewMasterIcon.svg";
import { ReactComponent as MasterOnHover } from "assets/appsIcon/MasterOnHover.svg";

import { ReactComponent as NewAppsIcon } from "assets/appsIcon/NewAppsIcon.svg";
import { ReactComponent as NewAppsIconOnHover } from "assets/appsIcon/AppsOnHover.svg";

import { useEffect, useState } from "react";
import React from "react";
import avatar from "assets/icons/avatar.svg";
import { avatarUrl, orgFormData } from "recoil/atom";
import { postAvatar } from "apis/appbarApi";
import setAvatar from "utils/setAvatar";
import { API_LINK } from "config";
import { useRecoilState } from "recoil";
import getSessionStorage from "utils/getSessionStorage";
import { getUserInfo } from "apis/socketApi";
import { useSnackbar } from "notistack";
import { GrRisk } from "react-icons/gr";

type Props = {
  activeModules: any;
};

const useStyles = makeStyles((theme) => ({
  sideBarWrapper: {
    overflow: "hidden",
    height: "100%",
    "& .ant-menu-item": {
      display: "flex",
      flexDirection: "column",
      height: "auto",
      color: "#000",
      fontSize: "12px",
      // fontFamily: "Poppins !important",
      fontStyle: "normal",
      fontWeight: 600,
      letterSpacing: "0.4px",
      textTransform: "capitalize",
      // marginTop: "20px",
    },
    "& .ant-menu-light:not(.ant-menu-horizontal) .ant-menu-item:not(.ant-menu-item-selected):hover":
      {
        backgroundColor: "transparent",
      },
    "& .ant-menu-light .ant-menu-item-selected": {
      backgroundColor: "transparent",
    },
    ".ant-popover": {
      top: "50px !important",
    },
    "& .ant-popover-placement-rightBottom .ant-popover-arrow": {
      bottom: "150px !important",
    },
    "& .ant-menu .ant-menu-item .ant-menu-item-icon +span": {
      marginInlineStart: "0px",
    },
  },
  popoverContentItem: {
    display: "flex",
    width: "180px",
    padding: "10px 12px",
    alignItems: "center",
    gap: "12px",
  },

  rowStyle: {
    fontFamily: "poppinsregular",
    paddingTop: "18px",
    cursor: "pointer",
    "&:hover": {
      // "& $iconStyle, & span": {
      //   stroke: "#006ead !important",
      //   color: "#006ead !important",
      // },
    },
  },
  colWrapper: {
    display: "flex",
    alignItems: "center",
  },
  iconWrapper: {
    padding: "2px",
    // fill: "gray",
    width: "0.85em",
    height: "0.85em",
  },
  iconStyle: {
    // padding: "0px !important",
    // "&:hover": {
    //   fill: "#13AB9B !important",
    //   color: "#13AB9B !important",
    // },
  },
  selectedItem: {
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: "50%",
      left: 0,
      transform: "translateY(-50%)",
      width: "4px",
      height: "24px", // adjust height as per requirement
      backgroundColor: "#13AB9B", // color of the indicator
    },
  },
  labelContainer: {
    display: "flex",
    alignItems: "center",
    // marginRight: "16px",
  },
  labelStyle: {
    // paddingRight: "60px",
    width: "110px",
    whiteSpace: "normal",
    paddingLeft: "8px",
    // color: "gray",
  },
  itemWrapper: {
    "&:hover": {
      "& $iconStyle, & span": {
        // fill: "#13AB9B !important",
        // color: "#13AB9B !important",
      },
    },
  },
  appContentWrapper: {
    top: "200px !important",
    left: "96px !important",
    "& .ant-popover-arrow": {
      top: "140px !important",
    },
  },
  avatar: {
    display: "flex",
    alignItems: "center",
    // marginLeft: theme.spacing(2),
    flexShrink: 0,
  },
  avatarText: {
    marginLeft: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    letterSpacing: "1px",
    // textTransform: "capitalize",
    // fontWeight: 600,
    // textAlign: "center",
    color: "white",
  },
  popoverContent: {
    padding: theme.spacing(2),
    minWidth: "200px",
  },
}));

const SideNavBar = ({ activeModules }: Props) => {
  const [selectedTab, setSelectedTab] = useState<any>("Dashboard");
  const [selectedSubTab, setSelectedSubTab] = useState<any>(null);
  const [activeModulesState, setActiveModulesState] = useState<any>([]);
  const [activeApps, setActiveApps] = useState<any>([]);
  const [activeItems, setActiveItems] = useState<any>([]);
  const [open, setOpen] = useState(false);
  let isOrgAdmin = checkRoles("ORG-ADMIN");
  let isMR = checkRoles("MR");

  const hide = () => {
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    setSelectedTab("Apps");
  };

  const classes = useStyles();
  const navigate = useNavigate();

  const subMenuItems = [
    {
      label: "Doc Control",
      name: "ProcessDocuments",
      icon: <DocControlIcon className={classes.iconStyle} />,
      path: "/processdocuments/processdocument",
    },
    {
      label: "Audits",
      name: "Audit",
      icon: <AuditsIcon className={classes.iconStyle} />,
      path: "/audit",
    },
    {
      label: "MRM",
      name: "MRM",
      icon: <MRMIcon className={classes.iconStyle} />,
      path: "/mrm",
    },
    {
      label: "HIRA",
      name: "Risk",
      icon: <HIRAIcon className={classes.iconStyle} />,
      path: "/risk/riskregister/HIRA",
    },
    {
      label: "Asp Imp",
      name: "Risk",
      icon: <AspImpIcon className={classes.iconStyle} />,
      path: "/risk/riskregister/AspectImpact",
    },
    // {
    //   label: "Obj & KPIs",
    //   name: "Objectives",
    //   icon: <ObjTargetIcon className={classes.iconStyle} />,
    //   path: "/objective",
    // },
    {
      label: "CIP",
      name: "CIP",
      icon: <CIPIcon className={classes.iconStyle} />,
      path: "/cip/management",
    },
    {
      label: "CAPA",
      name: "CAPA",
      icon: <CAPAIcon />,
      path: "/cara",
    },
    {
      label: "Op Control",
      name: "OpControl",
      icon: <OpControlIcon className={classes.iconStyle} />,
      path: "/unset",
    },
    {
      label: "Objectives & KPI",
      name: "Objectives & KPI",
      icon: <KPIIcon className={classes.iconStyle} />,
      path: "/kpi",
    },
  ];
  function splitLabel(label: any) {
    const words = label.split(" ");
    const halfIndex = Math.ceil(words.length / 2);
    const firstHalf = words.slice(0, halfIndex).join(" ");
    const secondHalf = words.slice(halfIndex).join(" ");
    return `${firstHalf}\n${secondHalf}`;
  }

  useEffect(() => {
    setActiveApps([
      ...subMenuItems.filter((item) => activeModules.includes(item.name)),
      // {
      //   label: "CARA",
      //   name: "Cara",
      //   icon: <CARAIcon className={classes.iconStyle} />,
      //   path: "/cara",
      // },
    ]);
  }, [activeModules]);

  const content = (
    <div>
      <Menu style={{ borderInlineEnd: "none", top: "330px" }}>
        <div
          style={{
            paddingRight: "15px",
            paddingLeft: "8px",
          }}
        >
          {activeApps &&
            activeApps.length > 0 &&
            activeApps.map((item: any, index: number) => {
              // console.log("item--->", item);

              return (
                <Row
                  key={(index + 1).toString()}
                  gutter={[24, 24]}
                  className={classes.rowStyle}
                  onClick={() => {
                    console.log("checkrisk path-->", item.path);

                    navigate(item.path);
                    setSelectedSubTab(item.label);
                    hide();
                  }}
                >
                  <Col
                    span={12}
                    className={classes.colWrapper}
                    style={{
                      paddingLeft: item.label === "Audits" ? "8px" : "12px",
                    }}
                  >
                    <div className={classes.labelContainer}>
                      {React.cloneElement(item.icon, {
                        className: classes.iconStyle,
                        style: {
                          paddingRight: "8px",
                          stroke:
                            selectedSubTab === item.label ? "#13ab9b" : "",
                        },
                      })}
                      <p
                        className={classes.labelStyle}
                        style={{
                          color:
                            selectedSubTab === item.label ? "#13ab9b" : "#000",
                        }}
                      >
                        {item.label}
                      </p>
                    </div>
                  </Col>
                </Row>
              );
            })}
        </div>
      </Menu>
    </div>
  );
  // const list = [
  //   {
  //     label: "Dashboard",
  //     icon: (
  //       <NewDashboardIcon
  //         fill="white"
  //         style={{
  //           width: "26px",
  //           height: "26px",
  //         }}
  //       />
  //     ),

  //     onClick: () => {
  //       setSelectedTab("Dashboard");
  //     },
  //   },
  //   {
  //     label: "Inbox",
  //     icon: (
  //       <NewInboxIcon
  //         fill="white"
  //         style={{
  //           width: "26px",
  //           height: "26px",
  //         }}
  //       />
  //     ),
  //     onClick: () => {
  //       setSelectedTab("Inbox");
  //       navigate("/Inbox");
  //     },
  //   },
  //   {
  //     label: "Master",
  //     icon: <MasterOnHover />,
  //     onClick: () => {
  //       setSelectedTab("Master");
  //       navigate("/master");
  //     },
  //   },
  //   {
  //     icon: (
  //       <Popover
  //         placement="rightBottom"
  //         onOpenChange={handleOpenChange}
  //         open={open}
  //         popupVisible
  //         content={content}
  //         trigger="click"
  //         overlayClassName={classes.appContentWrapper}
  //         overlayStyle={{
  //           top: "50px",
  //           left: "88px",
  //         }}
  //         rootClassName={classes.appContentWrapper}
  //       >
  //         <div
  //           style={{
  //             display: "flex",
  //             flexDirection: "column",
  //             alignItems: "center",
  //             cursor: "pointer",
  //           }}
  //         >
  //           <NewAppsIconOnHover />
  //         </div>
  //       </Popover>
  //     ),
  //   },
  // ];
  const list = [
    {
      label: "Dashboard",
      defaultIcon: (
        <Tooltip title="Dashboard" placement="right">
          <NewDashboardIcon
            fill="white"
            style={{ width: "24px", height: "23px" }}
          />
        </Tooltip>
      ),
      activeIcon: (
        <Tooltip title="Dashboard" placement="right">
          <NewDashboardIcon
            fill="white"
            style={{ width: "24px", height: "23px" }}
            // fill="white"
            // style={{ width: "26px", height: "26px" }}
          />
        </Tooltip>
      ),
      onClick: () => {
        navigate("/dashboard");
        // setSelectedTab("Dashboard");
      },
    },
    {
      label: "Inbox",
      defaultIcon: (
        <Tooltip title="Inbox" placement="right">
          <NewInboxIcon
            fill="white"
            style={{ width: "24px", height: "24px" }}
          />
        </Tooltip>
      ),
      activeIcon: (
        <Tooltip title="Inbox" placement="right">
          <InboxOnHover />
        </Tooltip>
      ),
      onClick: () => {
        setSelectedTab("Inbox");
        navigate("/Inbox");
      },
    },
    {
      label: "Master",
      defaultIcon: (
        <Tooltip title="Master" placement="right">
          <NewMasterIcon
            fill="white"
            style={{ width: "24px", height: "24px" }}
          />
        </Tooltip>
      ),
      activeIcon: (
        <Tooltip title="Master" placement="right">
          <MasterOnHover />
        </Tooltip>
      ),
      onClick: () => {
        setSelectedTab("Master");
        navigate("/master");
      },
    },
    {
      label: "Apps",
      defaultIcon: (
        <Tooltip title="Apps" placement="right">
          <Popover
            placement="rightBottom"
            onOpenChange={handleOpenChange}
            open={open}
            //popupVisible={true}

            content={content}
            trigger="click"
            overlayClassName={classes.appContentWrapper}
            overlayStyle={{
              top: "50px",
              left: "88px",
            }}
            rootClassName={classes.appContentWrapper}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <NewAppsIcon
                fill="white"
                style={{
                  width: "24px",
                  height: "24px",
                }}
              />
            </div>
          </Popover>
        </Tooltip>
      ),
      activeIcon: (
        <Tooltip title="Apps" placement="right">
          <Popover
            placement="rightBottom"
            onOpenChange={handleOpenChange}
            open={open}
            // popupVisible
            content={content}
            trigger="click"
            overlayClassName={classes.appContentWrapper}
            overlayStyle={{
              top: "50px",
              left: "88px",
            }}
            rootClassName={classes.appContentWrapper}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <NewAppsIconOnHover />
            </div>
          </Popover>
        </Tooltip>
      ),
      onClick: () => {
        setSelectedTab("Apps");
        // navigate("/master");
      },
    },
    {
      label: "ERM",
      defaultIcon: (
        <Tooltip title="ERM" placement="right">
          <a
            href="https://hindalcoerm.adityabirla.com/cura/nextgen/portallogin.aspx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GrRisk
              fill="white"
              style={{
                width: "24px",
                height: "24px",
                color: "white",
              }}
            />
          </a>
        </Tooltip>
      ),
      activeIcon: (
        <Tooltip title="ERM" placement="right">
          <a
            href="https://hindalcoerm.adityabirla.com/cura/nextgen/portallogin.aspx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GrRisk
              fill="white"
              style={{
                width: "24px",
                height: "24px",
                color: "white",
              }}
            />
          </a>
        </Tooltip>
      ),
    },
    {
      label: "Ticket",
      defaultIcon: (
        <Tooltip title="Ticket" placement="right">
          <ConfirmationNumberOutlinedIcon
            style={{ width: 24, height: 24, color: "white" }}
          />
        </Tooltip>
      ),
      activeIcon: (
        <Tooltip title="Ticket" placement="right">
          <ConfirmationNumberOutlinedIcon
            style={{ width: 24, height: 24, color: "#2196f3" }} // primary color on active
          />
        </Tooltip>
      ),
      onClick: () => {
        setSelectedTab("Ticket");
        navigate("/ticket");
      },
    },
  ];

  const sublist = [
    {
      label: "Dashboard",
      defaultIcon: (
        <Tooltip title="Dashboard" placement="right">
          <NewDashboardIcon
            fill="white"
            style={{ width: "24px", height: "23px" }}
          />
        </Tooltip>
      ),
      activeIcon: (
        <Tooltip title="Dashboard" placement="right">
          <NewDashboardIcon
            fill="white"
            style={{ width: "24px", height: "23px" }}
            // fill="white"
            // style={{ width: "26px", height: "26px" }}
          />
        </Tooltip>
      ),
      onClick: () => {
        navigate("/dashboard");
        // setSelectedTab("Dashboard");
      },
    },
    {
      label: "Inbox",
      defaultIcon: (
        <Tooltip title="Inbox" placement="right">
          <NewInboxIcon
            fill="white"
            style={{ width: "24px", height: "24px" }}
          />
        </Tooltip>
      ),
      activeIcon: (
        <Tooltip title="Inbox" placement="right">
          <InboxOnHover />
        </Tooltip>
      ),
      onClick: () => {
        setSelectedTab("Inbox");
        navigate("/Inbox");
      },
    },

    {
      label: "Apps",
      defaultIcon: (
        <Tooltip title="Apps" placement="right">
          <Popover
            placement="rightBottom"
            onOpenChange={handleOpenChange}
            open={open}
            //popupVisible={true}

            content={content}
            trigger="click"
            overlayClassName={classes.appContentWrapper}
            overlayStyle={{
              top: "50px",
              left: "88px",
            }}
            rootClassName={classes.appContentWrapper}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <NewAppsIcon
                fill="white"
                style={{
                  width: "24px",
                  height: "24px",
                }}
              />
            </div>
          </Popover>
        </Tooltip>
      ),
      activeIcon: (
        <Tooltip title="Apps" placement="right">
          <Popover
            placement="rightBottom"
            onOpenChange={handleOpenChange}
            open={open}
            // popupVisible
            content={content}
            trigger="click"
            overlayClassName={classes.appContentWrapper}
            overlayStyle={{
              top: "50px",
              left: "88px",
            }}
            rootClassName={classes.appContentWrapper}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <NewAppsIconOnHover />
            </div>
          </Popover>
        </Tooltip>
      ),
      onClick: () => {
        setSelectedTab("Apps");
        // navigate("/master");
      },
    },
  ];
  const topMenuItems = (isOrgAdmin || isMR ? list : sublist).filter(
    (item) => item.label !== "Ticket"
  );
  const ticketItem = (isOrgAdmin || isMR ? list : sublist).find(
    (item) => item.label === "Ticket"
  );
  return (
    <div className={classes.sideBarWrapper}>
      <Menu
        mode="inline"
        style={{
          height: "100%",
          borderRight: "1px solid #bdbbbb",
          background: "#003059",
          display: "flex",
          flexDirection: "column",
          justifyContent: "start", // ⬅️ Important
          paddingTop: "66px",
          paddingBottom: "10px",
        }}
      >
        {/* Top Items */}
        <div>
          {topMenuItems.map((item, index) => (
            <Menu.Item
              key={index.toString()}
              className={item.label === selectedTab ? "selectedItem" : ""}
              style={{
                paddingLeft: "0px !important",
                paddingRight: "0px !important",
              }}
            >
              <div
                onClick={item.onClick}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {item.label === selectedTab
                  ? item.activeIcon
                  : item.defaultIcon}
              </div>
              <HorizontalDivider />
            </Menu.Item>
          ))}
        </div>

        {/* Ticket at Bottom */}
        {ticketItem && (
          <Menu.Item
            key="ticket"
            className={ticketItem.label === selectedTab ? "selectedItem" : ""}
            style={{
              paddingLeft: "0px !important",
              paddingRight: "0px !important",
              position: "absolute",
              bottom: 100,
            }}
          >
            <div
              onClick={ticketItem.onClick}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {ticketItem.label === selectedTab
                ? ticketItem.activeIcon
                : ticketItem.defaultIcon}
            </div>
            {/* <HorizontalDivider /> */}
          </Menu.Item>
        )}
      </Menu>
    </div>
  );
};

export default SideNavBar;
