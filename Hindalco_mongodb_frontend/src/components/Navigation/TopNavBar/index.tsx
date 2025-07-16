import React, { useEffect, useState } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import { alpha, makeStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import { ReactComponent as ProdleLogo } from "assets/logo/ProcessridgeLogoWhite.svg";
import {
  Button,
  Avatar,
  Checkbox,
  Divider,
  FormControlLabel,
  Menu,
  MenuItem,
  Popover,
  Tooltip,
  withStyles,
} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import InfoIcon from "@material-ui/icons/Info";
// import { Button as AntdButton, Tooltip } from "antd";
import avatar from "assets/icons/avatar.svg";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import LogoutIcon from "assets/sidebarIcons/LogoutWhite.svg";
// import ManualIcon from "assets/icons/manual6.svg";
import { useRecoilValue } from "recoil";
import { avatarUrl, orgFormData } from "recoil/atom";
import { currentOrg } from "recoil/atom";
import { notificationData } from "recoil/atom";
import { useRecoilState } from "recoil";
import CameraIcon from "assets/icons/camera.svg";
import getToken from "utils/getToken";
import parseToken from "utils/parseToken";
import locationAdmin from "utils/locationAdmin";
import getAvatar from "utils/getAvatar";
import { postAvatar } from "apis/appbarApi";
import setAvatar from "utils/setAvatar";
import { getUserInfo } from "apis/socketApi";
import { useSnackbar } from "notistack";
import { API_LINK } from "config";
import SendIcon from "@material-ui/icons/Send";
import getSessionStorage from "utils/getSessionStorage";
import { useLocation, useNavigate } from "react-router-dom";
// import HindalcoLogoSvg from "assets/logo/HindalcoLogoSvg.svg";
import NewHindalcoLogo from "assets/logo/NewHindalcoLogo.png";
import NewLogo from "assets/logo/newlogo.jpeg";
import { useMediaQuery } from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import Help from "pages/Help";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import ReportProblemIcon from "@material-ui/icons/ReportProblem";
import ReportProblemOutlinedIcon from "@material-ui/icons/ReportProblemOutlined";
import ContactMailOutlinedIcon from "@material-ui/icons/ContactMailOutlined";
// import { logoFormData } from "recoil/atom";
import { logoFormData } from "recoil/atom";
import axios from "apis/axios.global";
import FreshdeskWidget from "components/Freshdeskwidget";
// import { useRecoilValue } from 'recoil'

type Props = {
  handleLogout: any;
  image?: File;
};

const useStyles = makeStyles((theme) => ({
  root: {
    background: "white !important",
    flexGrow: 1,
    "& .ant-layout-header": {
      height: "auto !important",
      lineHeight: "auto !important",
      background: "white !important",
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    // flexGrow: 1,
    // display: "none",
    // [theme.breakpoints.up("sm")]: {
    //   display: "block",
    // },
    // color: "#1E1E1E",
    // fontFamily: "HelveticaBold !important",
    // fontFamily: "HelveticaNeuel !important",
    fontFamily: "Oswald !important",

    fontWeight: "normal",
    // fontSize: "26px",
    // fontSize: "16px",
    // fontStyle: "normal",
    // fontWeight: 400,
    // lineHeight: "24px", // or "150%" depending on your preference
  },
  // searchWrapper: {
  //   "& .MuiInput-underline:before": {
  //     borderBottom: "1px solid white",
  //   },
  //   "& .MuiInput-underline:after": {
  //     borderBottom: "2px solid white",
  //   },
  //   "& .MuiInputBase-input::placeholder": {
  //     color: "white",
  //   },
  // },
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

  toolbar: {
    paddingLeft: 61, // start content after 74px
    display: "flex",
    justifyContent: "space-between", // space out the main elements
    borderBottom: "1px solid black",
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
  },
  middleSection: {
    flexGrow: 1,
    display: "flex",
    justifyContent: "end",
    // marginRight: "25px",
    alignItems: "center",
    gap: "20px",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
  },
  verticalBar: {
    height: "36px", // or any height you want
    width: "1px",
    backgroundColor: "black", // or any color you prefer
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  moduleHeaderStyle: {
    color: "#1E1E1E",
    fontFamily: "Akshar",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "24px", // or "150%" depending on your preference
  },
  //BELOW OLD STYLES FOR POPOVER OF AVATAR
  logout: {
    backgroundColor: theme.textColor.white,
    padding: "1rem",
    position: "relative",
    marginTop: theme.typography.pxToRem(10),
    "&::before": {
      backgroundColor: "white",
      content: '""',
      display: "block",
      position: "absolute",
      width: 12,
      height: 12,
      top: -6,
      transform: "rotate(45deg)",
      left: "calc(90%)",
    },
  },
  logout_header: {
    minWidth: "250px",
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    paddingBottom: "1rem",
  },
  logout_button: {
    backgroundColor: "#006EAD",
  },
  logout_input: {
    display: "none",
  },
  logout_divider: {
    marginTop: "-1rem",
    marginBottom: "0.5rem",
  },
  logout_upload: {
    position: "relative",
  },

  camera_img_container: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "white",
    height: "20px",
    width: "20px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(0, 0, 0, 0.15)",
  },
  camera_icon: {
    padding: 2,
    borderRadius: "100%",
    width: "15px",
  },
  searchWrapper: {
    "& .MuiInput-underline:before": {
      borderBottom: "1px solid black",
    },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottom: "2px solid black",
    },
  },
  inputPlaceholder: {
    color: "black",
  },
}));

const TopNavBar = ({ handleLogout, image }: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const location = useLocation();
  const classes = useStyles();
  const useDetails = getSessionStorage();
  const navigate = useNavigate();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [notifications, setNotifications] =
    useRecoilState<any>(notificationData);
  const [badgeStatus, setBadgeStatus] = useState<any>(0);
  const orgName = useRecoilValue(currentOrg);
  const [name, setName] = useState<string>("");
  const [initial, setInitial] = useState<string>("");
  const [locAdmin, setLocAdmin] = useState<string>();
  const [imgUrl, setImgUrl] = useRecoilState<any>(avatarUrl);
  const [searchValue, setSearchValue] = useState("");
  const avatarImage = imgUrl === null ? avatar : `${API_LINK}/${imgUrl}`;
  const [anchorElMenu, setAnchorElMenu] = useState(null);
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const [checkedState, setCheckedState] = useState<any>({
    all: true,
    documents: false,
    nc: false,
    kpi: false,
    objectives: false,
  });
  const [currentName, setCurrentName] = useState<any>("");
  const pathToNameMapping = {
    "/processdocuments/processdocument": "Document Control",
    "/processdocuments/documenttype": "Document Type",
    "/processdocuments/fullformview": "Document",
    "/Inbox": "Inbox",
    "/globalsearch": "Global Search",
    "/mrm": "MRM",
    "/master": "Master",
    "/master/unit/newlocation": "Unit Master ",
    "/master/department/newdepartment": "Department Master ",
    "/master/user/newuser": "User Master ",
    "/master/system/create": "System & Clause",
    "/master/uom/newunit": "uOM Master",
    "/audit": "Audit",
    "/audit/auditplan/auditplanform": "Audit Plan",
    "/audit/auditschedule/auditscheduleform": "Audit Schedule ",
    "/audit/auditreport/newaudit": "Audit Report ",
    "/kpi": "Objectives & KPI",
    "/cara": "CAPA",
    "/objective": "Objectives & Target",
    HIRA: "HIRA",
    AspectImpact: "Aspect Impact",
    "/cip": "CIP",
    "/dashboard": "Dashboard",
  } as any;

  //state variable for globalsearch
  const [isFocused, setIsFocused] = useState<any>(false);
  const [logo, setLogo] = useState<any>(null);
  const getLogo = async () => {
    const response = await axios.get(`/api/location/getLogo`);
    setLogo(response.data);
  };

  const handleClickMenu = (event: any) => {
    setAnchorElMenu(event.currentTarget);
  };

  useEffect(() => {
    // 3. Write a function that will update the state based on the current `location.pathname`.
    const updateCurrentName = () => {
      const foundKey = Object.keys(pathToNameMapping).find((key) =>
        location.pathname.includes(key)
      );
      if (foundKey) {
        setCurrentName(pathToNameMapping[foundKey]);
      } else {
        setCurrentName(""); // Default name or leave empty if pathname not found in mapping
      }
    };

    updateCurrentName();
  }, [location.pathname]);

  // useEffect(() => {
  //   // 3. Write a function that will update the state based on the current `location.pathname`.
  //   const updateCurrentName = () => {
  //     if (pathToNameMapping[location.pathname]) {
  //       setCurrentName(pathToNameMapping[location.pathname]);
  //     } else {
  //       setCurrentName(""); // Default name or leave empty if pathname not found in mapping
  //     }
  //   };

  //   updateCurrentName();
  // }, [location.pathname]);

  const handleCloseMenu = () => {
    setAnchorElMenu(null);
  };

  const handleCheckboxChange = (event: any) => {
    setCheckedState({
      ...checkedState,
      [event.target.name]: event.target.checked,
    });
  };

  const checkboxNames = ["All", "Documents", "NC", "KPI", "Objectives", "CAPA"];

  const handleClose = () => {
    setAnchorElMenu(null);
  };

  const shouldAddBadge = (count: number) => {
    count ? setBadgeStatus(count) : setBadgeStatus(0);
  };

  const getName = (): string => {
    return parseToken(getToken()).name;
  };

  const getInitials = (name: string) => {
    const initials = name
      ?.split(" ")
      ?.map((name) => name[0]?.toUpperCase())
      ?.slice(0, 2)
      ?.join("");
    return initials;
  };

  useEffect(() => {
    getLogo();
    const name = getName();
    setName(name);

    const initial = getInitials(name);
    setInitial(initial);
    // console.log("inside topnavbar");
    const locAdminName = locationAdmin();
    setLocAdmin(locAdminName);

    getAvatarImage();

    const onScroll = () => handleClose();
    window.removeEventListener("scroll", onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

  const getAvatarImage = async () => {
    let imageName: any;
    // getUserInfo().then((response: any) => {
    //   imageName = response?.data?.avatar;
    //   setImgUrl(imageName);
    // });
    const userDetails = getSessionStorage();
    if (userDetails.userType === "globalRoles") {
      // console.log("inside if");
      const roles = userDetails.roleInfo
        ?.map((item: any) => item.roleName)
        .join(",");

      setLocAdmin(roles);
    }
    imageName = userDetails?.avatar || "";
    const url =
      process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
        ? `${API_LINK}/${userDetails?.avatar}`
        : await viewObjectStorageDoc(userDetails?.avatar);
    setImgUrl(url);
    // setImgUrl(imageName);
  };

  useEffect(() => {
    shouldAddBadge(notifications?.unreadCount);
  }, [notifications]);

  const handleAvatarClick = (event: any) => {
    setAnchorEl(event.currentTarget);
    setPopoverOpen(true);
  };

  const handlePopoverClose = () => {
    setPopoverOpen(false);
  };

  const handlePressEnter = (event: any) => {
    if (event.key === "Enter") {
      // console.log("press enter", searchValue);
      redirectToGlobalSearch();
    }
  };

  const handleClickSearch = () => {
    // console.log("click search", searchValue);
    redirectToGlobalSearch();
  };

  const redirectToGlobalSearch = () => {
    navigate("/globalsearch", {
      state: {
        searchValue: searchValue,
      },
    });
  };

  /**
   * @description handles image upload
   * @param e
   */
  const handleUpload = async (e: any): Promise<void> => {
    let formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await postAvatar(formData);
      if (res?.status === 201) {
        getUserInfo()
          ?.then(async (response) => {
            console.log(
              "process.env.REACT_APP_IS_OBJECT_STORAGE",
              process.env.REACT_APP_IS_OBJECT_STORAGE === "false",
              typeof process.env.REACT_APP_IS_OBJECT_STORAGE
            );
            let url;
            if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
              console.log("inside true");
              url = await viewObjectStorageDoc(response?.data.avatar);
            } else {
              console.log("inside false");

              url = `${API_LINK}/${response?.data.avatar}`;
            }

            setImgUrl(url);
            setAvatar(url);
            // setImgUrl(response?.data.avatar);
            const data = JSON.parse(
              sessionStorage.getItem("userDetails") || "{}"
            );
            data.avatar = response?.data.avatar;
            sessionStorage.setItem("userDetails", JSON.stringify(data));
          })
          .catch((error: any) => console.log({ error }));
      }
    } catch (error) {
      enqueueSnackbar(`Error Occured while uploading image`, {
        variant: "error",
      });
    }
  };

  const StyledTooltip = withStyles((theme) => ({
    tooltip: {
      fontSize: "13px", // Adjust the font size here
    },
  }))(Tooltip);

  // const [uploadedImage, setUploadedImage] = useRecoilState <any> (logoFormData);

  // useEffect(()=>{
  // console.log("image::::::",uploadedImage)
  // },[])

  const uploadedImage = useRecoilValue<File | null>(logoFormData);

  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
        style={{
          background: "white",
          color: "black",
          height: "58px",
          padding: "0px",
          boxShadow: "none",
        }}
      >
        <Toolbar className={classes.toolbar}>
          {/* Left Section */}
          <div className={classes.leftSection}>
            <img
              src={logo || NewLogo}
              style={{
                // marginRight: "15px",
                width: matches ? "62px" : "50px",
                height: matches ? "62px" : "50px",
              }}
            />

            {/* {uploadedImage && (
              <img
                src={URL.createObjectURL(uploadedImage)}
                alt="Uploaded"
                style={{
                  width: "55px",
                  height: "55px",
                }}
              />
            )} */}

            <div className={classes.verticalBar}></div>

            {/* <Typography
              className={classes.title}

              variant="h6"
              noWrap
              style={{ position: "relative", top: "2px", fontFamily : "HelveticaCustom !important" }}
            > */}
            <span
              className={classes.title}
              style={{ fontSize: matches ? "26px" : "18px" }}
            >
              {currentName}
            </span>
            {/* </Typography> */}
          </div>

          {/* Middle Section */}
          {/* <Button
            onClick={() => {
              navigate("/advanceAnalysis");
            }}
            style={{ marginLeft: "300px" }}
          >
            {" "}
            Advance Analysis
          </Button> */}

          <div className={classes.middleSection}>
            <div>
              <Tooltip title="Ticket">
                <FreshdeskWidget user={userDetail} />
              </Tooltip>
            </div>
            {/* {matches ? (
              <div
                onClick={() => {
                  navigate("/ReportIssue");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "end",
                  cursor: "pointer",
                }}
              >
                <StyledTooltip title="Raise a Support Ticket">
                  <ReportProblemOutlinedIcon
                    style={{ color: "#003059", fontSize: "33px" }}
                  />
                </StyledTooltip>
              </div>
            ) : (
              ""
            )} */}

            <div
              style={{ display: "flex", gap: "40px" }}
              //  className={classes.middleSection}
            >
              {matches ? (
                <div
                  onClick={() => {
                    navigate("/Help");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {/* <img
                  src={ManualIcon}
                    style={{ width: "30px", height: "30px" }}
                  /> */}
                  <InfoIcon
                    style={{
                      fontSize: "30px",
                      fill: "rgb(0, 48, 89) !important",
                    }}
                  />
                </div>
              ) : (
                ""
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {matches ? (
                  <>
                    {" "}
                    <TextField
                      style={{ width: "245px" }}
                      id="standard-basic"
                      placeholder="Global Search"
                      className={classes.searchWrapper}
                      value={
                        isFocused || location.pathname.includes("globalsearch")
                          ? searchValue
                          : ""
                      }
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyDown={handlePressEnter}
                      onFocus={() => {
                        setSearchValue("");
                        setIsFocused(true);
                      }} // When the user clicks on the field
                      onBlur={() => setIsFocused(false)} // When the user clicks away from the field
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon style={{ fill: "black" }} />
                          </InputAdornment>
                        ),
                        endAdornment: searchValue && (
                          <InputAdornment position="end">
                            <SendIcon
                              style={{ fill: "black", cursor: "pointer" }}
                              onClick={() => handleClickSearch()}
                            />
                          </InputAdornment>
                        ),
                        inputProps: {
                          style: { color: "black" },
                          className: classes.inputPlaceholder,
                        },
                      }}
                      InputLabelProps={{
                        shrink: true,
                        className: classes.inputPlaceholder,
                      }}
                    />
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}

          <div className={classes.rightSection}>
            {/* <div
            style={{
              
              fontWeight: "600",
              
              display: "flex",
              justifyContent: "end",
              cursor: "pointer",
            }}
            onClick={() => {
              navigate("/Help");
            }}
          >
            <HelpOutlineOutlinedIcon style={{color:"#003059",fontSize: "30px",}}/>
        
          </div> */}
            {/* <Typography
              className={classes.title}
              variant="h6"
              noWrap
              style={{ position: "relative", top: "2px" }}
            >
              {currentName}
            </Typography> */}
            {/* <div className={classes.verticalBar}></div> */}

            <div
              className={classes.avatar}
              // onClick={handleLogout}
              style={{ cursor: "pointer" }}
            >
              {/* <ExitToAppIcon /> */}
              {/* <Avatar
                alt="Avatar"
                src={avatarImage}
                onClick={handleAvatarClick}
                // onMouseEnter={handleAvatarClick}
                // onMouseLeave={handlePopoverClose}
                style={{
                  cursor: "pointer",
                  backgroundColor: "#003059",
                  padding: "1px",
                  borderRadius: "25px",
                }}
              /> */}
              <Avatar
                src={imgUrl}
                alt="profile"
                onClick={handleAvatarClick}
                // onMouseEnter={handleAvatarClick}
                // onMouseLeave={handlePopoverClose}
                style={{
                  cursor: "pointer",
                  backgroundColor: "#003059",
                  padding: "1px",
                  borderRadius: "25px",
                  width: "45px",
                  height: "43px",
                }}
              >
                <div style={{ padding: "2px", textTransform: "capitalize" }}>
                  {initial}
                </div>
              </Avatar>
            </div>
          </div>
        </Toolbar>
        <Popover
          id="avatar-popover"
          open={popoverOpen}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <div className={classes.popoverContent}>
            <div className={classes.logout}>
              <div className={classes.logout_header}>
                <input
                  accept="image/*"
                  id="icon-button-file"
                  className={classes.logout_input}
                  type="file"
                  data-testid="file-input"
                  onChange={handleUpload}
                />
                <label htmlFor="icon-button-file">
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    className={classes.logout_upload}
                  >
                    <Avatar src={imgUrl} alt="profile">
                      {initial}
                    </Avatar>
                    <span className={classes.camera_img_container}>
                      <img
                        src={CameraIcon}
                        alt="camera"
                        className={classes.camera_icon}
                      />
                    </span>
                  </IconButton>
                </label>
                <div>
                  <Typography color="primary" variant="body1">
                    {name}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
                    {locAdmin}
                  </Typography>
                  {userDetail.entity && userDetail.location && (
                    <Typography color="textSecondary" variant="caption">
                      {userDetail?.entity ? userDetail?.entity?.entityName : ""}
                      ,{" "}
                      {userDetail?.location
                        ? userDetail?.location?.locationName
                        : ""}
                    </Typography>
                  )}
                </div>
              </div>
              <Divider className={classes.logout_divider} />
              <Button
                onClick={handleLogout}
                fullWidth
                color="primary"
                variant="contained"
                className={classes.logout_button}
                startIcon={<img src={LogoutIcon} alt="logout" />}
              >
                Logout
              </Button>
            </div>
          </div>
        </Popover>
      </AppBar>
    </div>
  );
};

export default TopNavBar;
