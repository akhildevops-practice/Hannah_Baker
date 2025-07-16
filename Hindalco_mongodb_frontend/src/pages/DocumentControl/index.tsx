//react
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { graphData, processDocFormData } from "recoil/atom";
//material-ui

import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
//antd

//utils
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import checkActionsAllowed from "utils/checkActionsAllowed";
import { formatDashboardQuery } from "utils/formatDashboardQuery";
import { useMediaQuery } from "@material-ui/core";
//styles
import useStyles from "./style";

//assets
import { ReactComponent as AllDocIcon } from "assets/documentControl/All-Doc.svg";
import { ReactComponent as DistrubtedIcon } from "assets/documentControl/Distributed.svg";
import { ReactComponent as MyDocIcon } from "assets/documentControl/My-Doc.svg";
import { ReactComponent as MyFavIcon } from "assets/documentControl/My-Fav.svg";
import { ReactComponent as MyFavIconFilled } from "assets/documentControl/My-Fav-Filled.svg";
import { ReactComponent as ExpandIcon } from "assets/documentControl/Minimize.svg";
import { ReactComponent as SelectedTabArrow } from "assets/icons/SelectedTabArrow.svg";

//components
import DocumentTypeGraph from "components/Document/Graphs/DocumentTypeGraph";
import DocumentStatusGraph from "components/Document/Graphs/DocumentStatusGraph";
import DocumentSystemWiseGraph from "components/Document/Graphs/DocumentSystemWiseGraph";
import ModuleHeader from "components/Navigation/ModuleHeader";
import DocumentTable from "components/Document/DocumentTable";
import checkRole from "utils/checkRoles";

import AssignmentLateIcon from "@material-ui/icons/AssignmentLate";
import ReferenceDocument from "./Reference/ReferenceDocument";
import { Button, Drawer, Popover, Tooltip, Tour, TourProps } from "antd";
import ManageReferenceDocument from "pages/ManageReference/ManageReferenceDocument";
import { API_LINK } from "config";
import MultiUserDisplay from "components/MultiUserDisplay";

import TouchAppIcon from "@material-ui/icons/TouchApp";

const ROWS_PER_PAGE = 10;

const DocumentControl = () => {
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const isMr = checkRole("MR");
  const matches = useMediaQuery("(min-width:786px)");
  const orgId = sessionStorage.getItem("orgId");
  const classes = useStyles(matches)();
  const navigate = useNavigate();
  const realmName = getAppUrl();
  const [value, setValue] = useState(0);
  const [isGraphSectionVisible, setIsGraphSectionVisible] = useState(false);
  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: false,
    clearFields: true,
    toggle: false,
    data: {},
  });
  const [filter, setFilter] = useState<string>("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [tabFilter, setTabFilter] = useState<string>("allDoc");
  const [formData, setFormData] = useRecoilState(processDocFormData);

  const [count, setCount] = useState<number>(0);
  const [dataLength, setDataLength] = useState<any>(0);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState<any>(1);
  const [filterList, setFilterList] = useState<any>([]);
  const [isTableDataLoading, setIsTableDataLoading] = useState<any>(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isChartDataLoading, setIsChartDataLoading] = useState<any>(false);
  const defaultGraphUrl = `api/dashboard/chart/${orgId}?allDoc=true`;
  const userDetailsforFilter = JSON.parse(
    sessionStorage.getItem("userDetails") || "{}"
  );
  const [searchValues, setSearch] = useState<any>({
    searchQuery: "",
    locationName: {
      locationName: userDetailsforFilter?.location?.locationName,
      id: userDetailsforFilter?.locationId,
    },
    department: {
      entityName: userDetailsforFilter?.entity?.entityName,
      id: userDetailsforFilter?.entityId,
    },
  });
  const [isHovered, setIsHovered] = useState(false);

  const defaultDocumentUrl =
    tabFilter === "inWorkflow"
      ? formatDashboardQuery(`/api/dashboard/workFlowDocuments`, {
          ...searchValues,
          page: page,
          limit: rowsPerPage,
        })
      : tabFilter === "myDoc"
      ? formatDashboardQuery(`/api/dashboard/mydocuments/`, {
          ...searchValues,
          page: page,
          limit: rowsPerPage,
          // documentStatus: statusFilterValues,
        })
      : tabFilter === "myFavDocs"
      ? formatDashboardQuery(`/api/dashboard/favorite/`, {
          ...searchValues,
          page: page,
          limit: rowsPerPage,
        })
      : //   : tabFilter === "reference"
        // ? formatDashboardQuery(`/api/dashboard/reference/`, {
        //     ...searchValues,
        //     page: page,
        //     limit: rowsPerPage,
        //   })
        formatDashboardQuery(`/api/dashboard/`, {
          ...searchValues,
          locationId:
            userDetailsforFilter.location !== null
              ? userDetailsforFilter?.location?.id
              : "",
          department:
            userDetailsforFilter.entity !== null
              ? userDetailsforFilter?.entity?.id
              : "",
          page: page,
          limit: ROWS_PER_PAGE,
        });
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  // console.log("defaultDocumentUrl", defaultDocumentUrl);
  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  const [graphDataState, setGraphDataState] = useRecoilState(graphData);

  useEffect(() => {
    fetchDocuments();
    fetchFilterList();
    if (!!isGraphSectionVisible) {
      fetchChartData();
    }
  }, []);
  const handleChartDataClick = (data: any) => {
    if (data.chartType === "docStatus") {
      const docUrl = formatDashboardQuery(`/api/dashboard/`, {
        ...searchValues,
        page: page,
        limit: ROWS_PER_PAGE,
        documentStatus: [data.label],
      });
      //converting array to a string and passing it as a parameter in the query string
      const queryString = encodeURIComponent(JSON.stringify([data.label]));
      const chartUrl = `api/dashboard/chart/${orgId}?${tabFilter}=true&documentStatus=${queryString}&filter="true"`;
      fetchDocuments(docUrl);
      fetchChartData(chartUrl);
    } else if (data.chartType === "docType") {
      const docUrl = formatDashboardQuery(`/api/dashboard/`, {
        ...searchValues,
        page: page,
        limit: ROWS_PER_PAGE,
        documentType: data.label,
      });

      const chartUrl = `api/dashboard/chart/${orgId}?${tabFilter}=true&documentType=${data.label}&filter="true"`;
      fetchDocuments(docUrl);
      fetchChartData(chartUrl);
    } else if (data.chartType === "system") {
      const labelArray = data.label.split(",");
      const docUrl = formatDashboardQuery(`/api/dashboard/`, {
        ...searchValues,
        page: page,
        limit: ROWS_PER_PAGE,
        system: labelArray,
      });
      //converting array to a string and passing it as a parameter in the query string
      const queryString = encodeURIComponent(JSON.stringify(labelArray));
      const chartUrl = `api/dashboard/chart/${orgId}?${tabFilter}=true&system=${queryString}&filter="true"`;
      fetchDocuments(docUrl);
      fetchChartData(chartUrl);
    }
  };

  const fetchChartData = async (graphUrl: any = defaultGraphUrl) => {
    try {
      const response = await axios.get(graphUrl);

      if (response?.data) {
        setGraphDataState((prevGraphDataState: any) => ({
          ...prevGraphDataState,
          docType: {
            labels: response?.data?.docTypeChartData?.labels,
            datasets: response?.data?.docTypeChartData?.count,
          },
          docStatus: {
            labels: response?.data?.docStateChartData?.labels,
            datasets: response?.data?.docStateChartData?.count,
          },
          system: {
            labels: response?.data?.systemWiseChartData?.labels,
            datasets: response?.data?.systemWiseChartData?.count,
          },
        }));
      }
    } catch (error) {}
  };

  const fetchFilterList = async () => {
    try {
      const response = await axios.get(
        `/api/dashboard/documentFilterList/${tabFilter}?location=${searchValues?.locationName?.id}`
      );
      setFilterList(response.data);
    } catch (error) {}
  };
  const fetchDocuments = async (url: any = defaultDocumentUrl) => {
    function formatDate(inputDate: any) {
      if (inputDate != null) {
        const date = new Date(inputDate);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return "";
    }

    try {
      setIsTableDataLoading(true);
      setData([]);
      const result = await axios.get(url);
      fetchFilterList();
      if (result?.data?.data && result?.data?.data.length > 0) {
        setCount(result.data.total);
        setDataLength(result.data.data_length);
        let arr: any[] = [];
        result.data.data.map((item: any, key: any) => {
          arr.push({
            id: item.id,
            docNumber: item.documentNumbering,
            docName: (
              <a
                href={`http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/processdocuments/processdocument/viewprocessdocument/${item.id}?versionId=${item.version}`}
                target="_blank"
                rel="noreferrer"
                className={classes.clickableField}
              >
                {item.documentName}
              </a>
            ),
            documentName: item.documentName,
            issueNumber: item.issueNumber,
            system: item.system,
            docType: item.documentType,
            docTypeId: item.documentTypeId,
            version: item.version,
            isVersion: item.isVersion,
            Creator: item.isCreator,
            sectionName: item.sectionName,
            type: item?.type || [],
            docStatus:
              item.status === "IN_REVIEW"
                ? "For Review"
                : item.status === "REVIEW_COMPLETE"
                ? "Review Complete"
                : item.status === "IN_APPROVAL"
                ? "For Approval"
                : item.status === "AMMEND"
                ? "Amend"
                : item.status === "DRAFT"
                ? "Draft"
                : item.status === "PUBLISHED"
                ? "Published"
                : item.status === "APPROVED"
                ? "Approved"
                : item.status === "SEND_FOR_EDIT"
                ? "Send For Edit"
                : item.status === "RETIRE_INREVIEW"
                ? "Retire - In Review"
                : item.status === "RETIRE_INAPPROVE"
                ? "Retire - In Approval"
                : item.status === "RETIRE"
                ? "Retire"
                : "Obsolete",
            department: item.department,
            approvedDate: formatDate(item.approvedDate),
            location: item.location,
            pendingWith: item?.pendingWith,
            action: item.access,
            writeAction: item.isCreator,
            deleteAccess: item.deleteAccess,
            editAcess: item.editAcess,
            readAccess: item.readAccess,
            documentVersions: item?.documentVersions,
            nextRevisionDate:
              item?.reviewFrequency === 0|| item?.reviewFrequency===null||item?.reviewFrequency===undefined
                ? "-"
                : formatDate(item?.nextRevisionDate),
            isAction: checkActionsAllowed(
              item?.access,
              ["View Document"],
              true
            ).concat(
              checkActionsAllowed(item?.isCreator, ["Edit", "Delete"], true)
            ),
          });
        });
        setData(arr);
        setIsTableDataLoading(false);
      } else {
        setData([]);
        setCount(result.data.total);
        setDataLength(result.data.data_length);
        setIsTableDataLoading(false);
      }
    } catch (err) {
      setIsTableDataLoading(false);
    }
  };

  const resetChartDataAndDocumentTableData = () => {
    fetchDocuments();
    fetchChartData();
  };

  // New state variable
  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };
  const toggleGraphSection = () => {
    // New function to toggle graph section
    setIsGraphSectionVisible(!isGraphSectionVisible);
  };

  const toggleDrawer = (record: any = {}) => {
    setDrawer({
      ...drawer,
      clearFields: !!record ? false : true,
      toggle: !!record ? false : true,
      open: !drawer.open,
      data: {
        ...record,
      },
    });
  };

  const createHandler = () => {
    setFormData({ ...formData, status: "new", currentVersion: "A" });
    setDrawer({
      mode: "create",
      clearFields: true,
      toggle: false,
      open: !drawer.open,
      data: {},
    });
  };
  const configHandler = () => {
    navigate("/processdocuments/documenttype");
  };

  const filterHandler = () => {
    // navigate("/processdocuments/documenttype");
    setFilterOpen(true);
  };

  //--------------------------

  const [open, setOpen] = useState(false);
  const [refDrawer, setRefDrawer] = useState<any>({
    open: false,
    mode: "create",
  });
  const [datas, setDatas] = useState<any>({});
  // console.log("mode", refDrawer.mode);
  const showDrawer = () => {
    setOpen(true);
    setRefDrawer({
      ...refDrawer,
      open: true,
      mode: "create",
    });
  };

  const onClose = () => {
    setOpen(false);
    setRefDrawer({
      ...refDrawer,
      open: false,
      mode: "create",
    });
  };

  const handleEdit = async (data: any) => {
    // console.log("data222", data);

    setOpen(true);
    setRefDrawer({
      ...refDrawer,
      open: true,
      mode: "edit",
      id: data.id,
    });
  };

  const getData = async () => {
    try {
      setPage(1);
      const response = await axios.get(
        API_LINK +
          `/api/referenceDocuments/getAllReferenceDocuments?page=${1}&limit=${10}`
      );

      const val = response?.data?.data?.map((item: any) => {
        const createdAtDate = new Date(item.createdAt);
        // Extract the date part (YYYY-MM-DD) from the parsed date
        const formattedCreatedAt = createdAtDate.toISOString().split("T")[0];

        return {
          ...item,
          id: item._id,
          topic: item.topic,
          creator: item.creator,
          organizationId: item.organizationId,
          createdAt: formattedCreatedAt,
        };
      });
      const finalData = {
        data: val,
        count: response.data?.count,
        allLocations: response.data?.allLocations,
      };
      setDatas(finalData);
    } catch (error) {
    }
  };

  // help tour

  // const [tourPopoverVisible, setTourPopoverVisible] = useState<boolean>(false);
  // const [openTourForAllDocuments, setOpenTourForAllDocuments] =
  //   useState<boolean>(false);

  //   const refForAllDocuments1 = useRef(null);
  //   const refForAllDocuments2 = useRef(null);
  //   const refForAllDocuments3 = useRef(null);
  //   const refForAllDocuments4 = useRef(null);
  //   const refForAllDocuments5 = useRef(null);
  //   const refForAllDocuments6 = useRef(null);
  //   const refForAllDocuments7 = useRef(null);

  //   const steps: TourProps["steps"] = [
  //     {
  //       title: "Audit Plan",
  //       description:
  //         "Create and View Audit Plan by clicking on this link. Plans can be made for Units , Departments , Corporate Functions and Verticals . MCOE team can define who can create these plans",
  //       // cover: (
  //       //   <img
  //       //     alt="tour.png"
  //       //     src="https://user-images.githubusercontent.com/5378891/197385811-55df8480-7ff4-44bd-9d43-a7dade598d70.png"
  //       //   />
  //       // ),
  //       target: () => (refForAllDocuments1.current ? refForAllDocuments1.current : null),
  //     },
  //     {
  //       title: "Location",
  //       description:
  //         "Plans are filtered by Units and displayed in the view below , By Default , your units plan are seen, You can change to see plans across ‘All’ units or specific unit ",
  //       target: () => refForAllDocuments2.current,
  //     },
  //     {
  //       title: "Year",
  //       description:
  //         " By default , this view will show the audit plans created the current year . Click on this link < to see prior year plans . Use > to move back to the current year",
  //       target: () => refForAllDocuments3.current,
  //     },
  //     {
  //       title: "Hyper Link",
  //       description: " click on this hyperlink to view created Audit Plan",
  //       target: () => refForAllDocuments4.current,
  //     },
  //     ...(isOrgAdmin
  //       ? [
  //         {
  //           title: "Delete",
  //           description: "Click on this link to edit Audit Plan ",
  //           target: () => refForAllDocuments7.current,
  //         },
  //       ]
  //       : []),
  //       ...(isOrgAdmin
  //         ? []:[
  //     {
  //       title: "Edit",
  //       description: "Click on this link to edit Audit Plan ",
  //       target: () => refForAllDocuments5.current,
  //     },
  //     {
  //       title: "Create Audit Schedule",
  //       description:
  //         "Create  Audit Schedule by clicking  on this link . These links are seen by those who can create Audit Schedule as specified in settings by MCOE",
  //       target: () => refForAllDocuments6.current,
  //     },
  //   ]),

  //   ];

  // Help tour
  const [openTourForAllDocuments, setOpenTourForAllDocuments] =
    useState<boolean>(false);

  const refForAllDocuments1 = useRef(null);
  const refForAllDocuments2 = useRef(null);
  const refForAllDocuments3 = useRef(null);
  const refForAllDocuments4 = useRef(null);
  const refForAllDocuments5 = useRef(null);
  const refForAllDocuments6 = useRef(null);
  const refForAllDocuments7 = useRef(null);
  const refForAllDocuments8 = useRef(null);
  const refForAllDocuments9 = useRef(null);
  const refForAllDocuments10 = useRef(null);
  const refForAllDocuments11 = useRef(null);
  const refForAllDocuments12 = useRef(null);

  const steps: TourProps["steps"] = [
    {
      title: "All Documents",
      description:
        "All the published documents for your department & location by default can be viewed here",

      target: () =>
        refForAllDocuments1.current ? refForAllDocuments1.current : null,
    },
    ...(tabFilter === "allDoc"
      ? [
          {
            title: "Doc Number",
            description:
              "Document no. is generated only if the document is published. Format based on the document type settings.",
            target: () => refForAllDocuments2.current,
          },
          {
            title: "Title",
            description: "Click on the hyperlink to view document information",
            target: () => refForAllDocuments3.current,
          },
          {
            title: "Status",
            description: "The status of the document is shown here.",
            target: () => refForAllDocuments4.current,
          },

          {
            title: "Edit",
            description:
              "Click on edit icon to edit the document created by you",
            target: () => refForAllDocuments5.current,
          },
          {
            title: "Filter",
            description:
              "Click on filter icon to search a document based on applied filter. By default your department’s documents are displayed. ",
            target: () => refForAllDocuments6.current,
          },
        ]
      : []),
    {
      title: "My Documents",
      description: "All the documents created by you can be viewed here",
      target: () => refForAllDocuments7.current,
    },
    {
      title: "My Favorites",
      description:
        "All the documents that you marked as favorite can be viewed here ",
      target: () => refForAllDocuments8.current,
    },
    {
      title: "Distributed",
      description:
        "All the documents that are published and distributed for your access can be viewed here",

      target: () =>
        refForAllDocuments9.current ? refForAllDocuments9.current : null,
    },
    {
      title: "In Workflow",
      description:
        "All the documents (yet to publish) under workflow can be viewed here ",
      target: () => refForAllDocuments10.current,
    },
    {
      title: "Reference Document",
      description:
        "All the documents for reference can be viewed here. (Can be created only MCOE)",
      target: () => refForAllDocuments11.current,
    },
    ...(isMr || isOrgAdmin
      ? [
          {
            title: "Settings",
            description:
              "Document type settings can be done by clicking on this tab. Access given  only for MCOE.",
            target: () => refForAllDocuments12.current,
          },
        ]
      : []),
  ];
  const handleDataChange = (e: any) => {
    setTabFilter(e.target.value);
  };
  return (
    <>
      <div className={classes.root} style={{ overflow: "hidden" }}>
        <Box
          sx={{ width: "100%", bgcolor: "background.paper", marginTop: "10px" }}
        >
          <div className={classes.tabWrapper}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0px 10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px",
                }}
              >
                {matches ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px 10px 4px 10px",
                      cursor: "pointer",
                      borderRadius: "5px",
                      position: "relative", // this is needed for the pseudo-element arrow
                      backgroundColor: tabFilter === "allDoc" ? "#3576BA" : "", // conditional background color
                    }}
                    onClick={() => {
                      setTabFilter("allDoc");
                    }}
                    ref={refForAllDocuments1}
                  >
                    <AllDocIcon
                      className={classes.docNavIconStyle}
                      fill={tabFilter === "allDoc" ? "white" : "black"}
                    />
                    <span
                      className={`${classes.docNavText}`}
                      style={{
                        color: tabFilter === "allDoc" ? "white" : "black",
                        fontWeight: tabFilter === "allDoc" ? "100" : "600", // conditional background color
                      }}
                    >
                      All Docs
                    </span>
                    {tabFilter === "allDoc" && (
                      <SelectedTabArrow
                        style={{
                          position: "absolute",
                          bottom: -13, // Adjusting the position to account for the arrow size
                          left: "53%",
                          transform: "translateX(-50%)",
                          width: 13,
                          height: 11,
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <></>
                )}

                {matches ? (
                  ""
                ) : (
                  <>
                    <FormControl
                      variant="outlined"
                      size="small"
                      fullWidth
                      className={classes.formControl}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      <InputLabel>Menu List</InputLabel>
                      <Select
                        label="Menu List"
                        value={tabFilter}
                        onChange={handleDataChange}
                      >
                        <MenuItem value={"allDoc"}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "4px 10px 4px 10px",
                              cursor: "pointer",
                              borderRadius: "5px",
                              position: "relative", // this is needed for the pseudo-element arrow
                              backgroundColor:
                                tabFilter === "allDoc" ? "#3576BA" : "", // conditional background color
                            }}
                            onClick={() => {
                              setTabFilter("allDoc");
                            }}
                            ref={refForAllDocuments1}
                          >
                            <AllDocIcon
                              className={classes.docNavIconStyle}
                              fill={tabFilter === "allDoc" ? "white" : "black"}
                            />
                            <span
                              className={`${classes.docNavText}`}
                              style={{
                                color:
                                  tabFilter === "allDoc" ? "white" : "black",
                                fontWeight:
                                  tabFilter === "allDoc" ? "100" : "600", // conditional background color
                              }}
                            >
                              All Docs
                            </span>
                            {tabFilter === "allDoc" && (
                              <SelectedTabArrow
                                style={{
                                  position: "absolute",
                                  bottom: -13, // Adjusting the position to account for the arrow size
                                  left: "53%",
                                  transform: "translateX(-50%)",
                                  width: 13,
                                  height: 11,
                                }}
                              />
                            )}
                          </div>
                        </MenuItem>
                        <MenuItem value={"myDoc"}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "4px 10px 4px 10px",
                              cursor: "pointer",
                              borderRadius: "5px",
                              position: "relative", // this is needed for the pseudo-element arrow
                              backgroundColor:
                                tabFilter === "myDoc" ? "#3576BA" : "", // conditional background color
                            }}
                            onClick={() => {
                              setTabFilter("myDoc");
                            }}
                            ref={refForAllDocuments7}
                          >
                            <MyDocIcon
                              fill={tabFilter === "myDoc" ? "white" : "black"}
                              className={classes.docNavIconStyle}
                            />
                            <span
                              className={`${classes.docNavText}`}
                              style={{
                                color:
                                  tabFilter === "myDoc" ? "white" : "black",
                                fontWeight:
                                  tabFilter === "myDoc" ? "100" : "600", // conditional background color
                              }}
                            >
                              My Docs
                            </span>
                            {tabFilter === "myDoc" && (
                              <SelectedTabArrow
                                style={{
                                  position: "absolute",
                                  bottom: -13, // Adjusting the position to account for the arrow size
                                  left: "53%",
                                  transform: "translateX(-50%)",
                                  width: 13,
                                  height: 11,
                                }}
                              />
                            )}
                          </div>
                        </MenuItem>
                        <MenuItem value={"myFavDocs"}>
                          <div
                            onClick={() => {
                              setTabFilter("myFavDocs");
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "4px 10px 4px 10px",
                              cursor: "pointer",
                              borderRadius: "5px",
                              position: "relative", // this is needed for the pseudo-element arrow
                              backgroundColor:
                                tabFilter === "myFavDocs" ? "#3576BA" : "", // conditional background color
                            }}
                            ref={refForAllDocuments8}
                          >
                            {tabFilter === "myFavDocs" ? (
                              <MyFavIconFilled
                                className={classes.docNavIconStyle}
                                fill="white"
                              />
                            ) : (
                              <MyFavIcon
                                className={classes.docNavIconStyle}
                                fill="black"
                              />
                            )}

                            <span
                              className={`${classes.docNavText}`}
                              style={{
                                color:
                                  tabFilter === "myFavDocs" ? "white" : "black",
                                fontWeight:
                                  tabFilter === "myFavDocs" ? "100" : "600", // conditional background color
                              }}
                            >
                              My Fav
                            </span>
                            {tabFilter === "myFavDocs" && (
                              <SelectedTabArrow
                                style={{
                                  position: "absolute",
                                  bottom: -13, // Adjusting the position to account for the arrow size
                                  left: "53%",
                                  transform: "translateX(-50%)",
                                  width: 13,
                                  height: 11,
                                }}
                              />
                            )}
                          </div>
                        </MenuItem>
                        <MenuItem value={"distributedDoc"}>
                          {" "}
                          <div
                            onClick={() => {
                              setTabFilter("distributedDoc");
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "4px 10px 4px 10px",
                              cursor: "pointer",
                              borderRadius: "5px",
                              position: "relative", // this is needed for the pseudo-element arrow
                              backgroundColor:
                                tabFilter === "distributedDoc" ? "#3576BA" : "", // conditional background color
                            }}
                            ref={refForAllDocuments9}
                          >
                            <DistrubtedIcon
                              fill={
                                tabFilter === "distributedDoc"
                                  ? "white"
                                  : "black"
                              }
                              className={classes.docNavIconStyle}
                            />
                            {/* <span
                className={`${classes.docNavText} ${
                  value === 6 ? classes.selectedTab : ""
                }`}
              >
                DISTRIBUTED
              </span> */}
                            <span
                              className={`${classes.docNavText}`}
                              style={{
                                color:
                                  tabFilter === "distributedDoc"
                                    ? "white"
                                    : "black",
                                fontWeight:
                                  tabFilter === "distributedDoc"
                                    ? "100"
                                    : "600", // conditional background color
                              }}
                            >
                              Distributed
                            </span>
                            {tabFilter === "distributedDoc" && (
                              <SelectedTabArrow
                                style={{
                                  position: "absolute",
                                  bottom: -13, // Adjusting the position to account for the arrow size
                                  left: "53%",
                                  transform: "translateX(-50%)",
                                  width: 13,
                                  height: 11,
                                }}
                              />
                            )}
                          </div>
                        </MenuItem>
                        <MenuItem value={"inWorkflow"}>
                          <div
                            onClick={() => {
                              setTabFilter("inWorkflow");
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "4px 10px 4px 10px",
                              cursor: "pointer",
                              borderRadius: "5px",
                              position: "relative", // this is needed for the pseudo-element arrow
                              backgroundColor:
                                tabFilter === "inWorkflow" ? "#3576BA" : "", // conditional background color
                            }}
                            ref={refForAllDocuments10}
                          >
                            <DistrubtedIcon
                              fill={
                                tabFilter === "inWorkflow" ? "white" : "black"
                              }
                              className={classes.docNavIconStyle}
                            />
                            <span
                              className={`${classes.docNavText}`}
                              style={{
                                color:
                                  tabFilter === "inWorkflow"
                                    ? "white"
                                    : "black",
                                fontWeight:
                                  tabFilter === "inWorkflow" ? "100" : "600", // conditional background color
                              }}
                            >
                              In Workflow
                            </span>
                            {tabFilter === "inWorkflow" && (
                              <SelectedTabArrow
                                style={{
                                  position: "absolute",
                                  bottom: -13, // Adjusting the position to account for the arrow size
                                  left: "53%",
                                  transform: "translateX(-50%)",
                                  width: 13,
                                  height: 11,
                                }}
                              />
                            )}
                          </div>
                        </MenuItem>
                        {/* <MenuItem value={"refDoc"}>
                          <div
                            style={{
                              display: "flex",

                              alignItems: "center",
                              justifyContent: "center",
                              padding: "4px 10px 4px 10px",
                              cursor: "pointer",
                              borderRadius: "5px",
                              position: "relative", // this is needed for the pseudo-element arrow
                              backgroundColor:
                                tabFilter === "refDoc" ? "#3576BA" : "", // conditional background color
                            }}
                            onClick={() => {
                              setTabFilter("refDoc");
                            }}
                            ref={refForAllDocuments11}
                          >
                            <AllDocIcon
                              className={classes.docNavIconStyle}
                              fill={tabFilter === "refDoc" ? "white" : "black"}
                            />
                            <span
                              className={`${classes.docNavText}`}
                              style={{
                                color:
                                  tabFilter === "refDoc" ? "white" : "black",
                                fontWeight:
                                  tabFilter === "refDoc" ? "100" : "600", // conditional background color
                              }}
                            >
                              Reference Documents
                            </span>
                            {tabFilter === "refDoc" && (
                              <SelectedTabArrow
                                style={{
                                  position: "absolute",
                                  bottom: -13, // Adjusting the position to account for the arrow size
                                  left: "53%",
                                  transform: "translateX(-50%)",
                                  width: 13,
                                  height: 11,
                                }}
                              />
                            )}
                          </div>
                        </MenuItem> */}
                      </Select>
                    </FormControl>
                  </>
                )}
                {matches ? (
                  <>
                    {" "}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px 10px 4px 10px",
                        cursor: "pointer",
                        borderRadius: "5px",
                        position: "relative", // this is needed for the pseudo-element arrow
                        backgroundColor: tabFilter === "myDoc" ? "#3576BA" : "", // conditional background color
                      }}
                      onClick={() => {
                        setTabFilter("myDoc");
                      }}
                      ref={refForAllDocuments7}
                    >
                      <MyDocIcon
                        fill={tabFilter === "myDoc" ? "white" : "black"}
                        className={classes.docNavIconStyle}
                      />
                      <span
                        className={`${classes.docNavText}`}
                        style={{
                          color: tabFilter === "myDoc" ? "white" : "black",
                          fontWeight: tabFilter === "myDoc" ? "100" : "600", // conditional background color
                        }}
                      >
                        My Docs
                      </span>
                      {tabFilter === "myDoc" && (
                        <SelectedTabArrow
                          style={{
                            position: "absolute",
                            bottom: -13, // Adjusting the position to account for the arrow size
                            left: "53%",
                            transform: "translateX(-50%)",
                            width: 13,
                            height: 11,
                          }}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <></>
                )}
                {matches ? (
                  <>
                    {" "}
                    <div
                      onClick={() => {
                        setTabFilter("myFavDocs");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px 10px 4px 10px",
                        cursor: "pointer",
                        borderRadius: "5px",
                        position: "relative", // this is needed for the pseudo-element arrow
                        backgroundColor:
                          tabFilter === "myFavDocs" ? "#3576BA" : "", // conditional background color
                      }}
                      ref={refForAllDocuments8}
                    >
                      {tabFilter === "myFavDocs" ? (
                        <MyFavIconFilled
                          className={classes.docNavIconStyle}
                          fill="white"
                        />
                      ) : (
                        <MyFavIcon
                          className={classes.docNavIconStyle}
                          fill="black"
                        />
                      )}

                      <span
                        className={`${classes.docNavText}`}
                        style={{
                          color: tabFilter === "myFavDocs" ? "white" : "black",
                          fontWeight: tabFilter === "myFavDocs" ? "100" : "600", // conditional background color
                        }}
                      >
                        My Fav
                      </span>
                      {tabFilter === "myFavDocs" && (
                        <SelectedTabArrow
                          style={{
                            position: "absolute",
                            bottom: -13, // Adjusting the position to account for the arrow size
                            left: "53%",
                            transform: "translateX(-50%)",
                            width: 13,
                            height: 11,
                          }}
                        />
                      )}
                    </div>
                    <div
                      onClick={() => {
                        setTabFilter("distributedDoc");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px 10px 4px 10px",
                        cursor: "pointer",
                        borderRadius: "5px",
                        position: "relative", // this is needed for the pseudo-element arrow
                        backgroundColor:
                          tabFilter === "distributedDoc" ? "#3576BA" : "", // conditional background color
                      }}
                      ref={refForAllDocuments9}
                    >
                      <DistrubtedIcon
                        fill={
                          tabFilter === "distributedDoc" ? "white" : "black"
                        }
                        className={classes.docNavIconStyle}
                      />
                      {/* <span
                className={`${classes.docNavText} ${
                  value === 6 ? classes.selectedTab : ""
                }`}
              >
                DISTRIBUTED
              </span> */}
                      <span
                        className={`${classes.docNavText}`}
                        style={{
                          color:
                            tabFilter === "distributedDoc" ? "white" : "black",
                          fontWeight:
                            tabFilter === "distributedDoc" ? "100" : "600", // conditional background color
                        }}
                      >
                        Distributed
                      </span>
                      {tabFilter === "distributedDoc" && (
                        <SelectedTabArrow
                          style={{
                            position: "absolute",
                            bottom: -13, // Adjusting the position to account for the arrow size
                            left: "53%",
                            transform: "translateX(-50%)",
                            width: 13,
                            height: 11,
                          }}
                        />
                      )}
                    </div>
                    <div
                      onClick={() => {
                        setTabFilter("inWorkflow");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px 10px 4px 10px",
                        cursor: "pointer",
                        borderRadius: "5px",
                        position: "relative", // this is needed for the pseudo-element arrow
                        backgroundColor:
                          tabFilter === "inWorkflow" ? "#3576BA" : "", // conditional background color
                      }}
                      ref={refForAllDocuments10}
                    >
                      <DistrubtedIcon
                        fill={tabFilter === "inWorkflow" ? "white" : "black"}
                        className={classes.docNavIconStyle}
                      />
                      <span
                        className={`${classes.docNavText}`}
                        style={{
                          color: tabFilter === "inWorkflow" ? "white" : "black",
                          fontWeight:
                            tabFilter === "inWorkflow" ? "100" : "600", // conditional background color
                        }}
                      >
                        In Workflow
                      </span>
                      {tabFilter === "inWorkflow" && (
                        <SelectedTabArrow
                          style={{
                            position: "absolute",
                            bottom: -13, // Adjusting the position to account for the arrow size
                            left: "53%",
                            transform: "translateX(-50%)",
                            width: 13,
                            height: 11,
                          }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",

                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px 10px 4px 10px",
                        cursor: "pointer",
                        borderRadius: "5px",
                        position: "relative", // this is needed for the pseudo-element arrow
                        backgroundColor:
                          tabFilter === "refDoc" ? "#3576BA" : "", // conditional background color
                      }}
                      onClick={() => {
                        setTabFilter("refDoc");
                      }}
                      ref={refForAllDocuments11}
                    >
                      <AllDocIcon
                        className={classes.docNavIconStyle}
                        fill={tabFilter === "refDoc" ? "white" : "black"}
                      />
                      <span
                        className={`${classes.docNavText}`}
                        style={{
                          color: tabFilter === "refDoc" ? "white" : "black",
                          fontWeight: tabFilter === "refDoc" ? "100" : "600", // conditional background color
                        }}
                      >
                        Ref Docs
                      </span>
                      {tabFilter === "refDoc" && (
                        <SelectedTabArrow
                          style={{
                            position: "absolute",
                            bottom: -13, // Adjusting the position to account for the arrow size
                            left: "53%",
                            transform: "translateX(-50%)",
                            width: 13,
                            height: 11,
                          }}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <></>
                )}

                {matches ? (
                  <>
                    {" "}
                    {(isMr || isOrgAdmin) && (
                      <div
                        onClick={configHandler}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "4px 10px 4px 10px",
                          cursor: "pointer",
                          borderRadius: "5px",
                          position: "relative", // this is needed for the pseudo-element arrow
                          // backgroundColor: tabFilter === "inWorkflow" ? "#3576BA" : "", // conditional background color
                        }}
                        ref={refForAllDocuments12}
                      >
                        <SettingsOutlinedIcon
                        // fill={tabFilter === "inWorkflow" ? "white" : "black"}
                        // className={classes.docNavIconStyle}
                        />
                        <span
                          className={`${classes.docNavText}`}
                          style={{
                            color: "black",
                            fontWeight: "600", // conditional background color
                          }}
                        >
                          Settings
                        </span>
                      </div>
                    )}
                    {tabFilter !== "myFavDocs" &&
                      tabFilter !== "distributedDoc" &&
                      tabFilter !== "inWorkflow" &&
                      tabFilter !== "refDoc" && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginLeft: "auto",
                            cursor: "pointer",
                          }}
                          onClick={toggleGraphSection}
                        >
                          {/* <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px 20px 4px 20px",
                        cursor: "pointer",
                        borderRadius: "5px",
                        position: "relative",
                        order: 1, 
                      }}
                    >
                      <ExpandIcon
                        className={classes.docNavIconStyle}
                        style={{
                          width: "21px",
                          height: "21px",
                          marginRight: "8px",
                        }}
                      />
                      <span
                        className={`${classes.docNavText}`}
                        style={{
                          color: "black",
                          fontWeight: "600",
                        }}
                      >
                       
                      </span>
                    </div> */}
                          {/* {isGraphSectionVisible ? "Hide Charts" : "Show Charts"} */}
                        </div>
                      )}
                  </>
                ) : (
                  ""
                )}
              </div>
              {matches ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      // marginRight: "20px",
                      // marginLeft:
                      //   tabFilter === "myFavDocs" ||
                      //   tabFilter === "distributedDoc" ||
                      //   tabFilter === "inWorkflow"
                      //     ? "200px"
                      //     : "0px",
                      // paddingLeft: tabFilter === "refDoc" ? "30px" : "0px",
                    }}
                  >
                    <div>
                      <Tooltip title="Help Tours!" color="blue">
                        <TouchAppIcon
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setOpenTourForAllDocuments(true);
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>

                  {(isMr || isOrgAdmin) && tabFilter === "refDoc" ? (
                    <div
                    //  style={{ position: "relative", right: "-150px" }}
                    >
                      <Button
                        type="primary"
                        onClick={showDrawer}
                        style={{ backgroundColor: "#003059", color: "white" }}
                      >
                        Create
                      </Button>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              ) : (
                ""
              )}
              <div className={classes.drawer}>
                <Drawer
                  title="Manage Reference"
                  onClose={onClose}
                  open={refDrawer.open}
                  width={"45%"}
                  className={classes.drawer}
                  closeIcon={
                    <img
                      src={CloseIconImageSvg}
                      alt="close-drawer"
                      style={{
                        width: "36px",
                        height: "38px",
                        cursor: "pointer",
                      }}
                    />
                  }
                >
                  <ManageReferenceDocument
                    refDrawer={refDrawer}
                    setRefDrawer={setRefDrawer}
                    getData={getData}
                  />
                </Drawer>
              </div>
              {/* {matches ? (
                <> */}
              {(tabFilter === "allDoc" ||
                tabFilter === "myDoc" ||
                tabFilter === "myFavDocs" ||
                tabFilter === "distributedDoc" ||
                tabFilter === "inWorkflow") && (
                <ModuleHeader
                  moduleName="Document Control"
                  createHandler={createHandler}
                  filterHandler={filterHandler}
                  configHandler={configHandler}
                  showSideNav={true}
                  filterDisplay={tabFilter === "allDoc" ? true : false}
                  isHovered={isHovered}
                  setIsHovered={setIsHovered}
                  handleMouseEnter={handleMouseEnter}
                  handleMouseLeave={handleMouseLeave}
                  searchValues={searchValues}
                  refElementForAllDocument6={refForAllDocuments6}
                />
              )}
              {/* </>
              ) : (
                ""
              )} */}

              {isHovered && (
                <div
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    position: "fixed",
                    // Adjust this to position the div vertically as you like
                    right: 0,
                    top: "120px",
                    backgroundColor: "rgba(255, 255, 255, 0.95)", // White with 95% opacity
                    padding: "1rem", // Optional, for some spacing
                    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)", // Optional, for a subtle shadow effect
                    zIndex: 1000, // Ensures the div stays above other content
                  }}
                >
                  {searchValues.locationName ? (
                    <>
                      <span style={{ fontWeight: "bold", color: "black" }}>
                        Applied Filters
                      </span>

                      <li>
                        Location : {"         "}
                        {searchValues?.locationName?.locationName || "None"}
                      </li>

                      <li>
                        Entity : {"        "}
                        {searchValues?.department?.entityName || "None"}
                      </li>
                    </>
                  ) : (
                    <>
                      <span style={{ fontWeight: "bold", color: "black" }}>
                        Default Filters
                      </span>

                      <li>
                        Location : {"         "}
                        {userDetailsforFilter?.location?.locationName || "None"}
                      </li>

                      <li>
                        Entity : {"        "}
                        {userDetailsforFilter?.entity?.entityName || "None"}
                      </li>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </Box>

        {isGraphSectionVisible &&
          tabFilter !== "myFavDocs" &&
          tabFilter !== "distributedDoc" &&
          tabFilter !== "inWorkflow" && (
            <Grid
              style={{ margin: "0px" }}
              container
              spacing={2}
              className={`${classes.graphSection} ${
                !isGraphSectionVisible ? classes.collapsed : ""
              }`}
            >
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                className={classes.graphGridContainer}
                style={{ paddingLeft: "24px" }}
              >
                <Box className={classes.graphBox}>
                  <DocumentTypeGraph
                    handleChartDataClick={handleChartDataClick}
                    resetChartDataAndDocumentTableData={
                      resetChartDataAndDocumentTableData
                    }
                  />
                </Box>
              </Grid>
              {tabFilter !== "allDoc" ? (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  className={classes.graphGridContainer}
                  style={{ paddingLeft: "16px", paddingRight: "16px" }}
                >
                  <Box className={classes.graphBox}>
                    <DocumentStatusGraph
                      handleChartDataClick={handleChartDataClick}
                      resetChartDataAndDocumentTableData={
                        resetChartDataAndDocumentTableData
                      }
                    />
                  </Box>
                </Grid>
              ) : (
                ""
              )}

              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                className={classes.graphGridContainer}
                style={{ paddingRight: "24px" }}
              >
                <Box className={classes.graphBox}>
                  <DocumentSystemWiseGraph
                    handleChartDataClick={handleChartDataClick}
                    resetChartDataAndDocumentTableData={
                      resetChartDataAndDocumentTableData
                    }
                  />
                </Box>
              </Grid>
            </Grid>
          )}

        {/* </Box> */}
        {/* </Box> */}
        {/* <br /> */}

        {tabFilter !== "refDoc" ? (
          <DocumentTable
            drawer={drawer}
            setDrawer={setDrawer}
            toggleDrawer={toggleDrawer}
            filter={filter}
            setFilter={setFilter}
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            isGraphSectionVisible={isGraphSectionVisible}
            tabFilter={tabFilter}
            fetchDocuments={fetchDocuments}
            fetchChartData={fetchChartData}
            isTableDataLoading={isTableDataLoading}
            setIsTableDataLoading={setIsTableDataLoading}
            data={data}
            setData={setData}
            dataLength={dataLength}
            setDataLength={setDataLength}
            filterList={filterList}
            page={page}
            setPage={setPage}
            count={count}
            setCount={setCount}
            setRowsPerPage={setRowsPerPage}
            rowsPerPage={rowsPerPage}
            searchValues={searchValues}
            setSearch={setSearch}
            refElementForAllDocument2={refForAllDocuments2}
            refElementForAllDocument3={refForAllDocuments3}
            refElementForAllDocument4={refForAllDocuments4}
            refElementForAllDocument5={refForAllDocuments5}
          />
        ) : (
          <ReferenceDocument
            handleEdit={handleEdit}
            getData={getData}
            datas={datas}
            setDatas={setDatas}
          />
        )}

        {/* <br />
      <TempBubbleGraph /> */}
      </div>

      <Tour
        open={openTourForAllDocuments}
        onClose={() => setOpenTourForAllDocuments(false)}
        steps={steps}
      />
    </>
  );
};

export default DocumentControl;

/**
 * 
 *    <div
              style={{
                marginLeft: "auto",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={toggleGraphSection}
            >
              <NewFilterIcon
                style={{
                  width: "33px",
                  height: "30px",
                  padding: "1px",
                  marginLeft: "5px",
                }}
              />
              <div
                onClick={() => {
                  setTabFilter("distributedDoc");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 20px 4px 20px",
                  cursor: "pointer",
                  borderRadius: "5px",
                  position: "relative", // this is needed for the pseudo-element arrow
                  backgroundColor: "#3576BA", // conditional background color
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

              {isGraphSectionVisible ? "Hide Charts" : "Show Charts"}
              <ExpandIcon
                  className={classes.docNavIconStyle}
                  style={{
                    width: "21px",
                    height: "21px",
                    marginRight: "38px",
                    marginLeft: "7px",
                  }}
                />
            </div>
 */
