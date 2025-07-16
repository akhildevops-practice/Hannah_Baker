//react, react-router, recoil
import React, { useState, useEffect, useContext, useRef } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { drawerData, processDocFormData, graphData } from "recoil/atom";
import { useLocation } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  useMediaQuery,
} from "@material-ui/core";
//antd
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Row,
  Table,
  Tag,
  Pagination,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusCircleOutlined,
  MinusCircleOutlined,
  FilterOutlined,
  FilterFilled,
} from "@ant-design/icons";
import type { PaginationProps } from "antd";

//material-ui
import {
  Box,
  Tooltip,
  CircularProgress,
  Typography,
  IconButton,
  TextField,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

//utils
import formatQuery from "utils/formatQuery";
import checkRole from "utils/checkRoles";
import getSessionStorage from "utils/getSessionStorage";
import { formatDashboardQuery } from "utils/formatDashboardQuery";
import axios from "apis/axios.global";
import getAppUrl from "utils/getAppUrl";
import { processDocForm } from "schemas/processDocForm";

//assets
import EmptyTableImg from "assets/EmptyTableImg.svg";
import ReloadIcon from "assets/icons/Reload.svg";
import { ReactComponent as CustomEditIcon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";

//components
import DocumentDrawer from "components/Document/DocumentTable/DocumentDrawer";
import DocumentViewDrawer from "components/Document/DocumentTable/DocumentViewDrawer";

//reusable components
import SearchBar from "components/SearchBar";
import ConfirmDialog from "components/ConfirmDialog";
import FilterPopOver from "components/FilterPopOver";
import AutoComplete from "components/AutoComplete";
import FilterDatepicker from "components/FilterDatepicker";
import MultiUserDisplay from "components/MultiUserDisplay";
import { Autocomplete, AutocompleteRenderInputParams } from "@material-ui/lab";
//thirdparty library
import { useSnackbar } from "notistack";
import { debounce } from "lodash";

//styles
import useStyles from "./styles";
import DepartmentSelector from "components/ReusableComponents/DepartmentSelector";

const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;
type Props = {
  toggleDrawer: any;
  drawer: any;
  setDrawer: any;
  filter: any;
  setFilter: any;
  filterOpen: any;
  setFilterOpen: any;
  isGraphSectionVisible: any;
  tabFilter: any;
  fetchDocuments?: any;
  fetchChartData?: any;
  isTableDataLoading?: any;
  setIsTableDataLoading?: any;
  searchValues?: any;
  setSearch?: any;
  data?: any;
  setData?: any;
  filterList?: any;
  count?: any;
  setCount?: any;

  page?: any;
  setPage?: any;
  rowsPerPage?: any;
  dataLength?: any;
  setDataLength?: any;
  setRowsPerPage?: any;
  refElementForAllDocument2?: any;
  refElementForAllDocument3?: any;
  refElementForAllDocument4?: any;
  refElementForAllDocument5?: any;
};

const ROWS_PER_PAGE = 10;

function DocumentTable({
  toggleDrawer,
  drawer,
  setDrawer,
  filter,
  setFilter,
  filterOpen,
  setFilterOpen,
  isGraphSectionVisible,
  tabFilter,
  filterList,
  fetchChartData,
  searchValues,
  setSearch,
  fetchDocuments,
  isTableDataLoading,
  setIsTableDataLoading,
  data,
  setData,
  count,
  setCount,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  dataLength,
  setDataLength,
  refElementForAllDocument2,
  refElementForAllDocument3,
  refElementForAllDocument4,
  refElementForAllDocument5,
}: Props) {
  const setFormData = useSetRecoilState(processDocFormData);
  const [isLoading, setIsLoading] = useState(false);
  // const [data, setData] = useState<any>([]);
  const isMr = checkRole("MR");
  const [searchValue, setSearchValue] = useState<any>({});
  const [primaryFilterReload, setPrimaryfilterReload] = useState<any>(false);
  const [open, setOpen] = useState(false);
  // const [count, setCount] = useState<number>(0);
  // const [dataLength, setDataLength] = useState(0);
  // const [page, setPage] = useState(1);
  const [deleteDoc, setDeleteDoc] = useState<any>();

  const [entity, setEntity] = React.useState([]);
  const [location, setLocation] = React.useState<any>([]);
  const [user, setUser] = React.useState([]);
  const [system, setSystem] = React.useState([]);
  const [document, setDocument] = React.useState([]);
  const [businessType, setBusinessType] = React.useState([]);
  const [filterData, setFilterData] = React.useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const realmName = getAppUrl();
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const [expandedRows, setExpandedRows] = useState<any>([]);
  const [hoveredRow, setHoveredRow] = useState(null);

  const iconColor = "#380036";
  const [docViewDrawer, setDocViewDrawer] = useState({
    open: false,
    data: {},
  });
  const [drawerDataState, setDrawerDataState] = useRecoilState(drawerData);
  const [isHovered, setIsHovered] = useState(false);

  const [graphDataState, setGraphDataState] = useRecoilState(graphData);
  const [statusFilter, setStatusFilter] = useState<any>([]);
  const locationState = useLocation();

  // const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState<string>("");
  const [statusFilterValues, setStatusFilterValues] = useState<any>([]);
  const matches = useMediaQuery("(min-width:822px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  const classes = useStyles({
    isGraphSectionVisible: isGraphSectionVisible,
    matches: matches,
  });

  const userDetailsforFilter = JSON.parse(
    sessionStorage.getItem("userDetails") || "{}"
  );
  const orgId = sessionStorage.getItem("orgId");
  const userDetails = getSessionStorage();
  // const defaultDocumentUrl = formatDashboardQuery(`/api/dashboard/`, {
  //   ...searchValues,
  //   locationId:
  //     userDetailsforFilter.location !== null
  //       ? userDetailsforFilter?.location?.id
  //       : "",
  //   page: page,
  //   limit: rowsPerPage,
  // });
  const defaultMyDocumentUrl = formatDashboardQuery(
    `/api/dashboard/mydocuments/`,
    {
      ...searchValues,
      page: 1,
      limit: 10,
    }
  );

  const defaultDistributedDocumentUrl = formatDashboardQuery(
    `/api/dashboard/myDistributedDocuments/`,
    { ...searchValues, page: 1, limit: 10 }
  );
  const defaultMyFavDocumentUrl = formatDashboardQuery(
    `/api/dashboard/favorite/`,
    { ...searchValues, page: 1, limit: 10 }
  );

  const defaultInWorkFlowDocumentUrl = formatDashboardQuery(
    `/api/dashboard/workFlowDocuments`,
    { ...searchValues, page: 1, limit: 10 }
  );
  const defaultGraphUrl = `api/dashboard/chart/${orgId}?allDoc=true`;
  const roles = ["CREATOR", "REVIEWER", "APPROVER"];
  const [unitId, setUnitId] = useState<string>(userDetails?.location?.id);
  const [selectedDept, setSelectedDept] = useState<any>({});

  useEffect(() => {
    if (tabFilter === "allDoc") {
      const url = formatDashboardQuery(`/api/dashboard/`, {
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
        limit: rowsPerPage,
        documentStatus: statusFilterValues,
      });
      fetchDocuments(url);
    } else if (tabFilter === "myDoc") {
      const url = formatDashboardQuery(`/api/dashboard/mydocuments/`, {
        ...searchValues,
        page: page,
        limit: rowsPerPage,
        documentStatus: statusFilterValues,
      });
      fetchDocuments(url);
    } else if (tabFilter === "distributedDoc") {
      const url = formatDashboardQuery(
        `/api/dashboard/myDistributedDocuments/`,
        {
          ...searchValues,
          page: page,
          limit: rowsPerPage,
          documentStatus: [...statusFilterValues, "PUBLISHED"],
        }
      );
      fetchDocuments(url);
    } else if (tabFilter === "myFavDocs") {
      const url = formatDashboardQuery(`/api/dashboard/favorite/`, {
        ...searchValues,
        page: page,
        limit: rowsPerPage,
        documentStatus: statusFilterValues,
      });
      fetchDocuments(url);
    }
  }, [statusFilterValues]);

  useEffect(() => {
    setPage(1);
    setRowsPerPage(10);
    setSearch({
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
    if (!!statusFilterValues) {
      if (tabFilter === "allDoc") {
        fetchDocuments();
        setFilterData(data);
        setTabValue("");
        setUnitId(userDetails?.location?.id);
        fetchInitialDepartment(userDetails.entityId);
      } else if (tabFilter === "myDoc") {
        fetchDocuments(defaultMyDocumentUrl);
        setTabValue("mydocuments");
        setUnitId("All");
        fetchInitialDepartment("All");
      } else if (tabFilter === "distributedDoc") {
        fetchDocuments(defaultDistributedDocumentUrl);
        setTabValue("myDistributedDocuments");
        setUnitId(userDetails?.location?.id);
        fetchInitialDepartment(userDetails.entityId);
      } else if (tabFilter === "myFavDocs") {
        fetchDocuments(defaultMyFavDocumentUrl);
        setTabValue("favorite");
        setUnitId(userDetails?.location?.id);
        fetchInitialDepartment(userDetails.entityId);
      } else if (tabFilter === "inWorkflow") {
        fetchDocuments(defaultInWorkFlowDocumentUrl);
        setTabValue("workFlowDocuments");
        setUnitId(userDetails?.location?.id);
        fetchInitialDepartment(userDetails.entityId);
      }
    }
    setselectedDocType([]);
    setfilterType(false);
    setselectedSystem([]);
    setfilterSystem(false);
    setSelectedStatus([]);
    setfilterStatus(false);
    setfilterMyRole(false);
    setselectedMyPending([]);
    setIsFilterMyPending(false);
  }, [tabFilter]);

  const fetchInitialDepartment = async (id: string) => {
    try {
      if (id === "All") {
        setSelectedDept({ ...{ id: "All", name: "All" }, type: "All" });
      } else {
        const res = await axios.get(`/api/entity/getSelectedEntity/${id}`);
        const entity = res.data;

        setSelectedDept({
          id: entity.id,
          name: entity.entityName,
          type: entity?.entityType?.name,
        });
      }
    } catch (error) {
      console.error("Failed to fetch initial department:", error);
    }
  };

  useEffect(() => {
    if (locationState.state && locationState.state.drawerOpenEditMode) {
      // Open the drawer
      setDrawer({
        ...drawer,
        open: !drawer.open,
        mode: "edit",
        toggle: true,
        clearFields: false,
        data: { ...drawer?.data, id: drawerDataState?.id },
      });
    } else if (locationState.state && locationState.state.drawerOpenAddMode) {
      setDrawer({
        ...drawer,
        open: !drawer.open,
        clearFields: false,
        toggle: true,
        mode: "create",
        data: { ...drawer?.data, id: null },
      });
    }
  }, [locationState]);

  useEffect(() => {
    Object.keys(searchValues).forEach((values: any) => {
      if (values !== null || "") {
        setSearchValue({
          ...searchValue,
          locationId: searchValues.locationName?.id,
          department: searchValues.department?.id,
          creator: searchValues.creator?.id,
          ["system[]"]: searchValues.system?._id,
          documentType: searchValues.documentType?.documentTypeName,
          documentStartDate: searchValues.documentStartDate,
          documentEndDate: searchValues.documentEndDate,
          // businessType:searchValues.businessType?.name
        });
      }
    });
    getData();
  }, [searchValues]);

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteDoc(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    handleClose();
    setIsLoading(true);
    try {
      let res = await axios.delete(`api/documents/${deleteDoc}`);
      enqueueSnackbar(`Operation Successful`, { variant: "success" });
      setIsLoading(false);
      // setRerender(!rerender);
      fetchDocuments();
    } catch (err) {
      enqueueSnackbar(`Error ${err}`, {
        variant: "error",
      });
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setSearch({
      ...searchValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleApply = () => {
    let docStatus = selectedStatus.map((type: any) => type.toUpperCase());
    const hasOtherKeys = Object.keys(searchValues).some(
      (key) => key !== "searchQuery"
    );
    let columnfilterurl = formatDashboardQuery(
      `/api/${
        tabFilter === "allDoc"
          ? "dashboard"
          : tabFilter === "myDoc"
          ? "dashboard/mydocuments"
          : tabFilter === "distributedDoc"
          ? "dashboard/myDistributedDocuments"
          : tabFilter === "inWorkflow"
          ? "dashboard/workFlowDocuments"
          : "dashboard/favorite"
      }${hasOtherKeys ? "" : "/"}`,
      {
        documentTypes: selectedDocType,
        system: selectedSystem,
        documentStatus: docStatus,
      },
      true
    );
    if (columnfilterurl.endsWith("?")) {
      columnfilterurl = columnfilterurl.slice(0, -1);
    }

    reloadGraphsOnFilter();
    if (searchValues.searchQuery) {
      let url = formatQuery(
        filter
          ? `/api/${
              tabFilter === "allDoc"
                ? "dashboard"
                : tabFilter === "myDoc"
                ? "dashboard/mydocuments"
                : tabFilter === "distributedDoc"
                ? "dashboard/myDistributedDocuments"
                : tabFilter === "inWorkflow"
                ? "dashboard/workFlowDocuments"
                : "dashboard/favorite"
            }/${filter}`
          : `/api/${
              tabFilter === "allDoc"
                ? "dashboard"
                : tabFilter === "myDoc"
                ? "dashboard/mydocuments"
                : tabFilter === "distributedDoc"
                ? "dashboard/myDistributedDocuments"
                : tabFilter === "inWorkflow"
                ? "dashboard/workFlowDocuments"
                : "dashboard/favorite"
            }`,
        {
          ...searchValues,
          department: searchValues?.department?.id,

          page: page,
          limit: rowsPerPage,
        },
        [
          "locationId",
          "locationName",
          "department",
          "creator",
          "page",
          "limit",
          "documentStartDate",
          "documentEndDate",
          "searchQuery",
          "documentStatus[]",
          "documentType",
          "readAccess",
          "documentName",
          "system[]",
          // "status",
        ]
      );
      if (hasOtherKeys && url?.endsWith("?")) {
        url = url?.slice(0, -1);
      }
      fetchDocuments(
        selectedDocType?.length > 0 ||
          selectedStatus?.length > 0 ||
          selectedSystem?.length > 0
          ? `${url}${columnfilterurl}`
          : url
      );
      reloadGraphsOnSearch(searchValues);
    } else {
      // searchValue

      if (
        searchValue.creator === undefined &&
        searchValue.department === undefined &&
        searchValue.documentEndDate === undefined &&
        searchValue.documentStartDate === undefined &&
        searchValue.documentType === undefined &&
        searchValue.locationId === undefined &&
        searchValue.system === undefined
      ) {
        enqueueSnackbar(`Select Filter Value`, { variant: "error" });
        return;
      }
      // if (!searchValues.searchQuery) {
      //   return;
      // }
      let url = formatQuery(
        filter
          ? `/api/${
              tabFilter === "allDoc"
                ? "dashboard"
                : tabFilter === "myDoc"
                ? "dashboard/mydocuments"
                : tabFilter === "distributedDoc"
                ? "dashboard/myDistributedDocuments"
                : tabFilter === "inWorkflow"
                ? "dashboard/workFlowDocuments"
                : "dashboard/favorite"
            }/${filter}`
          : `/api/${
              tabFilter === "allDoc"
                ? "dashboard"
                : tabFilter === "myDoc"
                ? "dashboard/mydocuments"
                : tabFilter === "distributedDoc"
                ? "dashboard/myDistributedDocuments"
                : tabFilter === "inWorkflow"
                ? "dashboard/workFlowDocuments"
                : "dashboard/favorite"
            }`,
        {
          ...searchValue,
          page: page,
          department: searchValues?.department?.id,
          limit: rowsPerPage,
        },
        [
          "locationId",
          "locationName",
          "department",
          "creator",
          "page",
          "limit",
          "documentStartDate",
          "documentEndDate",
          "documentStatus[]",
          "documentType",
          "readAccess",
          "documentName",
          "system[]",
          // "status",
        ]
      );
      if (hasOtherKeys && url?.endsWith("?")) {
        url = url?.slice(0, -1);
      }
      fetchDocuments(
        selectedDocType?.length > 0 ||
          selectedStatus?.length > 0 ||
          selectedSystem?.length > 0
          ? `${url}${columnfilterurl}`
          : url
      );
      // reloadGraphsOnSearch(searchValues);
    }
  };

  const reloadGraphsOnSearch = async (
    searchValues: any = { searchQuery: "" }
  ) => {
    if (!!isGraphSectionVisible) {
      const hasOtherKeys = Object.keys(searchValues).some(
        (key) => key !== "searchQuery"
      );
      let url = formatQuery(
        filter
          ? `/api/dashboard/chart/${filter}`
          : isOrgAdmin
          ? `/api/dashboard/chart/`
          : `api/dashboard/chart/`,
        {
          ...searchValue,
          ...((!hasOtherKeys || tabValue) && {
            locationId:
              userDetailsforFilter.location !== null
                ? userDetailsforFilter?.location?.id
                : "",
            department:
              userDetailsforFilter.entity !== null
                ? userDetailsforFilter?.entity?.id
                : "",
          }),
        },
        [
          "locationId",
          "locationName",
          "department",
          "creator",
          "documentStartDate",
          "documentEndDate",
          "documentStatus[]",
          "documentType",
          "readAccess",
          "documentName",
          "system[]",
          // "status",
        ]
      );
      if (tabFilter === "allDoc") {
        fetchChartData(`${url}allDoc=true`);
      } else if (tabFilter == "myDoc") {
        fetchChartData(`${url}allDoc=false`);
      } else if (tabFilter === "distributedDoc") {
        fetchChartData(
          `api/dashboard/chart/${orgId}?distributedDoc=true&searchQuery=${searchValues?.searchQuery}`
        );
      } else if (tabFilter === "myFavDocs") {
        fetchChartData(
          `api/dashboard/chart/${orgId}?myFavDocs=true&userName=${userDetails?.id}&searchQuery=${searchValues?.searchQuery}`
        );
      }
    }
  };

  const reloadGraphsOnFilter = async () => {
    let queryString = "&filter=true";
    if (searchValues.locationName) {
      queryString =
        queryString + `&locationId=${searchValues?.locationName?.id}`;
    }
    if (searchValues.system) {
      queryString = queryString + `&systems[]=${searchValues?.system?._id}`;
    }
    if (searchValues.department) {
      queryString = queryString + `&department=${searchValues?.department?.id}`;
    }
    if (searchValues.creator) {
      queryString = queryString + `&creator=${searchValues?.creator?.id}`;
    }
    if (searchValues.documentType) {
      queryString =
        queryString +
        `&documentType=${searchValues?.documentType?.documentTypeName}`;
    }

    if (!!isGraphSectionVisible) {
      const hasOtherKeys = Object.keys(searchValues).some(
        (key) => key !== "searchQuery"
      );
      let url = formatQuery(
        filter
          ? `/api/dashboard/chart/${filter}`
          : isOrgAdmin
          ? `/api/dashboard/chart/`
          : `api/dashboard/chart/`,
        {
          ...searchValue,
          ...((!hasOtherKeys || tabValue) && {
            locationId:
              userDetailsforFilter.location !== null
                ? userDetailsforFilter?.location?.id
                : "",
            department:
              userDetailsforFilter.entity !== null
                ? userDetailsforFilter?.entity?.id
                : "",
          }),
        },
        [
          "locationId",
          "locationName",
          "department",
          "creator",
          "documentStartDate",
          "documentEndDate",
          "documentStatus[]",
          "documentType",
          "readAccess",
          "documentName",
          "system[]",
          // "status",
        ]
      );
      if (tabFilter === "allDoc") {
        fetchChartData(`${url}allDoc=true`);
      } else if (tabFilter == "myDoc") {
        fetchChartData(`${url}allDoc=false`);
      }
    }
  };

  const handleDiscard = () => {
    // setSearch({
    //   locationId: "",
    //   locationName: "",
    //   department: "",
    //   creator: "",
    //   documentStartDate: "",
    //   documentEndDate: "",
    //   documentStatus: [],
    //   documentType: "",
    //   readAccess: "",
    //   documentName: "",
    //   system: [],
    // });
    setSearch({
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
    setUnitId(userDetailsforFilter?.locationId);
    fetchInitialDepartment(userDetailsforFilter?.entityId);

    setSearchValue({
      locationId: "",
      locationName: "",
      department: "",
      creator: "",
      documentStartDate: "",
      documentEndDate: "",
      documentStatus: [],
      documentType: "",
      readAccess: "",
      documentName: "",
      system: [],
    });
    setPrimaryfilterReload(true);
    reloadGraphsOnSearch();
    // setDiscard(!discard);
  };

  const handleChangePageNew = (
    page: any,
    pageSize: any = rowsPerPage,
    discard: any = false
  ) => {
    setPage(page);
    setRowsPerPage(pageSize);
    let docStatus = selectedStatus.map((type: any) => type.toUpperCase());
    const hasOtherKeys = Object.keys(searchValues).some(
      (key) => key !== "searchQuery"
    );

    let columnfilterurl: any = formatDashboardQuery(
      `/api/dashboard${hasOtherKeys ? "" : "/"}`,
      {
        documentTypes: selectedDocType,
        system: selectedSystem,
        documentStatus: docStatus,
        section: selectedMySection,
        role: selectedMyRole,
        dept: selectedMyDept,
        loc: selectedMyLoc,
        user: selectedMyPending,
      },
      true
    );

    // if (columnfilterurl.endsWith("?")) {
    //   columnfilterurl = columnfilterurl.slice(0, -1);
    // }
    let url = formatQuery(
      filter
        ? `/api/dashboard/${filter}`
        : isOrgAdmin
        ? `/api/dashboard/${tabValue ? `${tabValue}` : ""}`
        : `api/dashboard${tabValue ? `/${tabValue}/` : ""}`,
      {
        ...searchValue,
        // ...searchValues,
        searchQuery: !discard ? searchValues?.searchQuery : "",
        ...((!hasOtherKeys || tabValue) && {
          locationId:
            userDetailsforFilter.location !== null
              ? userDetailsforFilter?.location?.id
              : "",
          department:
            userDetailsforFilter.entity !== null
              ? userDetailsforFilter?.entity?.id
              : "",
        }),
      },
      [
        "locationId",
        "locationName",
        "department",
        "creator",
        "documentStartDate",
        "documentEndDate",
        "documentStatus[]",
        "documentType",
        "readAccess",
        "documentName",
        "system[]",
        "searchQuery",
        // "status",
      ]
    );
    if (!hasOtherKeys && !isOrgAdmin && url?.endsWith("?")) {
      url = url?.slice(0, -1);
    }
    fetchDocuments(
      selectedDocType?.length > 0 ||
        selectedStatus?.length > 0 ||
        selectedSystem?.length > 0 ||
        selectedMyRole?.length > 0 ||
        selectedMyDept?.length > 0 ||
        selectedMyLoc?.length > 0 ||
        selectedMySection?.length > 0 ||
        selectedMyPending?.length > 0
        ? `${url}page=${page}&limit=${pageSize}&${columnfilterurl}`
        : `${url}page=${page}&limit=${pageSize}`
    );
  };

  const handleEditProcessDoc = (data: any) => {
    setFormData(processDocForm);
    setDrawer({
      ...drawer,
      mode: "edit",
      clearFields: false,
      toggle: false,
      data: data,
      open: !drawer.open,
    });
    // navigate(`/processdocuments/processdocument/newprocessdocument/${data.id}`);
  };

  const toggleDocViewDrawer = (record: any = {}) => {
    setDocViewDrawer({
      ...drawer,
      open: !docViewDrawer.open,
      data: {
        ...record,
      },
    });
    // navigate(
    //   `http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/processdocuments/processdocument/viewprocessdocument/${record.id}`
    // );
  };

  const handleClickDiscard = () => {
    let url = formatQuery(
      filter ? `/api/dashboard/${filter}` : `/api/dashboard`,
      { ...searchValues, searchQuery: "", page: 1, limit: 10 },
      [
        "locationId",
        "locationName",
        "department",
        "creator",
        "page",
        "limit",
        "documentStartDate",
        "documentEndDate",
        "searchQuery",
        "documentStatus",
        "documentType",
        "readAccess",
        "system[]",
        "documentName[]",
      ]
    );
    setSearch({
      ...searchValues,
      searchQuery: "",
    });
    // fetchDocuments(url);
    handleChangePageNew(1, 10, true);
    reloadGraphsOnSearch();
  };

  const onChange = (checkedValues: any) => {
    setStatusFilterValues(checkedValues);

    // let statusUrl = formatQuery(
    //   `api/dashboard`,
    //   { ...searchValues, status: checkedValues },
    //   [
    //     "locationId",
    //     "department",
    //     "creator",
    //     "documentStartDate",
    //     "documentEndDate",
    //     "filterField",
    //     "status"
    //   ]
    // );
    // fetchDefaultData(statusUrl);
  };
  const [selectedDocType, setselectedDocType] = useState<any>([]);
  const [isFilterType, setfilterType] = useState<boolean>(false);
  const [selectedSystem, setselectedSystem] = useState<any>([]);
  const [isFilterSystem, setfilterSystem] = useState<boolean>(false);
  const [isFilterMyRole, setfilterMyRole] = useState<boolean>(false);
  const [isFilterMySection, setFilerMySection] = useState<boolean>(false);
  const [isFilterMyPending, setIsFilterMyPending] = useState<boolean>(false);
  const [isFilterMyDept, setfilterMyDept] = useState<boolean>(false);
  const [isFilterMyLoc, setfilterMyLoc] = useState<boolean>(false);
  const [selectedMyDept, setselectedMyDept] = useState<any>([]);
  const [selectedMyPending, setselectedMyPending] = useState<any>([]);

  const [selectedMyLoc, setselectedMyLoc] = useState<any>([]);
  const [selectedStatus, setSelectedStatus] = useState<any>([]);
  const [isFilterStatus, setfilterStatus] = useState<boolean>(false);
  const [selectedMyRole, setselectedMyRole] = useState<any>([]);
  const [selectedMySection, setSelectedMySection] = useState<any>([]);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // Mark it as not the first render anymore
      return; // Skip the first effect call
    }
    if (tabFilter === "allDoc") handleChangePageNew(1, rowsPerPage);
    setPrimaryfilterReload(false);
  }, [
    !isFilterType,
    !isFilterStatus,
    !isFilterSystem,
    primaryFilterReload,
    !isFilterMyRole,
    isFilterMyDept,
    isFilterMyLoc,
    !isFilterMySection,
  ]);

  const allColumns: ColumnsType<any> = [
    {
      title: "Doc Number",
      dataIndex: "docNumber",
      key: "docNumber",
      width: 50,
      render: (_: any, record: any, index) => {
        if (index === 0) {
          return (
            <Tooltip title={record.docNumber}>
              <div
                style={{
                  width: 100,
                }}
              >
                <div
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  ref={refElementForAllDocument2}
                >
                  {record.docNumber}
                </div>
              </div>
            </Tooltip>
          );
        }
        return (
          <Tooltip title={record.docNumber}>
            <div
              style={{
                width: 100,
              }}
            >
              <div
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {record.docNumber}
              </div>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Title",
      dataIndex: "documentName",
      key: "documentName",
      width: 100,
      // sorter: (a, b) => a.documentName - b.documentName,
      render: (_: any, record: any, index) => {
        if (index === 0) {
          return record.action ? (
            <Tooltip title={record.documentName}>
              <div
                style={{
                  textDecorationLine: "underline",
                  cursor: "pointer",
                  width: 130,
                }}
              >
                <div
                  className={classes.clickableField}
                  onClick={() => toggleDocViewDrawer(record)}
                  style={{
                    whiteSpace: "normal", // Adjusted to wrap text
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  ref={refElementForAllDocument3}
                >
                  {record.documentName}
                </div>
              </div>
            </Tooltip>
          ) : (
            <Tooltip title={record.documentName}>
              <>{record.documentName}</>
            </Tooltip>
          );
        }
        return record.action ? (
          <Tooltip title={record.documentName}>
            <div
              style={{
                textDecorationLine: "underline",
                cursor: "pointer",
                width: 130,
              }}
            >
              <div
                className={classes.clickableField}
                onClick={() => toggleDocViewDrawer(record)}
                style={{
                  whiteSpace: "normal", // Adjusted to wrap text
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {record.documentName}
              </div>
            </div>
          </Tooltip>
        ) : (
          <Tooltip title={record.documentName}>
            <>{record.documentName}</>
          </Tooltip>
        );
      },
    },
    {
      title: "Type",
      dataIndex: "docType",
      width: 100,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record.docType}
          </div>
        </div>
      ),
      filterIcon: (filtered: any) =>
        isFilterType ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8 }}>
            {filterList?.doctype?.map((name: any) => (
              <div key={name}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedDocType([...selectedDocType, value]);
                      } else {
                        setselectedDocType(
                          selectedDocType.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={name}
                    checked={selectedDocType.includes(name)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedDocType.length === 0}
                onClick={() => {
                  setfilterType(true);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedDocType([]);
                  setfilterType(false);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "System",
      dataIndex: "system",
      width: 50,
      render: (_, record) => {
        return <MultiUserDisplay data={record.system} name="name" />;
      },
      filterIcon: (filtered: any) =>
        isFilterSystem ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }) => {
        return (
          <div
            style={{
              padding: 8,
            }}
          >
            {filterList?.system?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedSystem([...selectedSystem, value]);
                      } else {
                        setselectedSystem(
                          selectedSystem.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedSystem.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedSystem.length === 0}
                onClick={() => {
                  setfilterSystem(true);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedSystem([]);
                  fetchDocuments();
                  setfilterSystem(false);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Issue - Version",
      dataIndex: "version",
      width: 220,
      key: "version",
      render: (_: any, record: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          {record.issueNumber} - {record.version}
        </div>
      ),
      // sorter: (a, b) => a.version - b.version,
    },
    {
      title: "Status",
      dataIndex: "docStatus",
      key: "docStatus",
      width: 130,
      render: (_: any, record: any, index) => {
        if (index === 0) {
          return (
            <div ref={refElementForAllDocument4}>
              {record.docStatus === "Approved" && (
                <Tag
                  style={{ backgroundColor: "#7cbf3f" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  {record.docStatus}
                </Tag>
              )}
              {record.docStatus === "For Review" && (
                <Tag
                  style={{ backgroundColor: "#F2BB00" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  In Review
                </Tag>
              )}
              {record.docStatus === "Review Complete" && (
                <Tag
                  style={{ backgroundColor: "#F2BB00" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  {record.docStatus}
                </Tag>
              )}
              {record.docStatus === "For Approval" && (
                <Tag
                  style={{ backgroundColor: "#FB8500" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  In Approval
                </Tag>
              )}
              {record.docStatus === "Amend" && (
                <Tag
                  style={{ backgroundColor: "#D62DB1" }}
                  color="yellow"
                  key={record.docStatus}
                >
                  {record.docStatus}
                </Tag>
              )}
              {record.docStatus === "Published" && (
                <Tag
                  style={{ backgroundColor: "#7CBF3F" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  {record.docStatus}
                </Tag>
              )}
              {record.docStatus === "Draft" && (
                <Tag
                  style={{ backgroundColor: "#0075A4" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  {record.docStatus}
                </Tag>
              )}
              {record.docStatus === "Send For Edit" && (
                <Tag
                  style={{ backgroundColor: "#0075A4" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  Sent For Edit
                </Tag>
              )}

              {record.docStatus === "Retire - In Review" && (
                <Tag
                  style={{ backgroundColor: "#0075A4" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  {"Retire Review"}
                </Tag>
              )}
              {record.docStatus === "Retire - In Approval" && (
                <Tag
                  style={{ backgroundColor: "#0075A4" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  {"Retire Approval"}
                </Tag>
              )}
              {record.docStatus === "Retire" && (
                <Tag
                  style={{ backgroundColor: "#0075A4" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  {record.docStatus}
                </Tag>
              )}
              {record.docStatus === "Obsolete" && (
                <Tag color="#003566" key={record.docStatus}>
                  {record.docStatus}
                </Tag>
              )}
              {/* If none of the above conditions match, simply render the docStatus */}
              {![
                "Approved",
                "For Review",
                "Review Complete",
                "For Approval",
                "Amend",
                "Published",
                "Draft",
                "Send For Edit",
                "Obsolete",
                "Retire - In Review",
              ].includes(record.docStatus) && (
                <Tag key={record.docStatus}>{record.docStatus}</Tag>
              )}
            </div>
          );
        }
        return (
          <div>
            {record.docStatus === "Approved" && (
              <Tag
                style={{ backgroundColor: "#7cbf3f" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                {record.docStatus}
              </Tag>
            )}
            {record.docStatus === "For Review" && (
              <Tag
                style={{ backgroundColor: "#F2BB00" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                In Review
              </Tag>
            )}
            {record.docStatus === "Review Complete" && (
              <Tag
                style={{ backgroundColor: "#F2BB00" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                {record.docStatus}
              </Tag>
            )}
            {record.docStatus === "For Approval" && (
              <Tag
                style={{ backgroundColor: "#FB8500" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                In Approval
              </Tag>
            )}
            {record.docStatus === "Amend" && (
              <Tag
                style={{ backgroundColor: "#D62DB1" }}
                color="yellow"
                key={record.docStatus}
              >
                {record.docStatus}
              </Tag>
            )}
            {record.docStatus === "Published" && (
              <Tag
                style={{ backgroundColor: "#7CBF3F" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                {record.docStatus}
              </Tag>
            )}
            {record.docStatus === "Draft" && (
              <Tag
                style={{ backgroundColor: "#0075A4" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                {record.docStatus}
              </Tag>
            )}
            {record.docStatus === "Send For Edit" && (
              <Tag
                style={{ backgroundColor: "#0075A4" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                Sent For Edit
              </Tag>
            )}

            {record.docStatus === "Retire - In Review" && (
              <Tag
                style={{ backgroundColor: "#0075A4" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                {"Retire Review"}
              </Tag>
            )}
            {record.docStatus === "Retire - In Approval" && (
              <Tag
                style={{ backgroundColor: "#0075A4" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                {"Retire Approval"}
              </Tag>
            )}
            {record.docStatus === "Obsolete" && (
              <Tag color="#003566" key={record.docStatus}>
                {record.docStatus}
              </Tag>
            )}
            {/* If none of the above conditions match, simply render the docStatus */}
            {![
              "Approved",
              "For Review",
              "Review Complete",
              "For Approval",
              "Amend",
              "Published",
              "Draft",
              "Send For Edit",
              "Obsolete",
              "Retire - In Review",
              "Retire - In Approval",
            ].includes(record.docStatus) && (
              <Tag key={record.docStatus}>{record.docStatus}</Tag>
            )}
          </div>
        );

        // if (record.docStatus === "Approved") {
        //   return (
        //     <Tag
        //       style={{ backgroundColor: "#7cbf3f" }}
        //       key={record.docStatus}
        //       className={classes.statusTag}
        //     >
        //       {record.docStatus}
        //     </Tag>
        //   );
        // } else if (record.docStatus === "For Review") {
        //   return (
        //     <Tag
        //       style={{ backgroundColor: "#F2BB00" }}
        //       key={record.docStatus}
        //       className={classes.statusTag}
        //     >
        //       In Review
        //     </Tag>
        //   );
        // } else if (record.docStatus === "Review Complete") {
        //   return (
        //     <Tag
        //       style={{ backgroundColor: "#F2BB00" }}
        //       key={record.docStatus}
        //       className={classes.statusTag}
        //     >
        //       {record.docStatus}
        //     </Tag>
        //   );
        // } else if (record.docStatus === "For Approval") {
        //   return (
        //     <Tag
        //       style={{ backgroundColor: "#FB8500" }}
        //       key={record.docStatus}
        //       className={classes.statusTag}
        //     >
        //       {/* {record.docStatus} */}
        //       In Approval
        //     </Tag>
        //   );
        // } else if (record.docStatus === "Amend") {
        //   return (
        //     <Tag
        //       style={{ backgroundColor: "#D62DB1" }}
        //       color="yellow"
        //       key={record.docStatus}
        //     >
        //       {record.docStatus}
        //     </Tag>
        //   );
        // } else if (record.docStatus === "Published") {
        //   return (
        //     <Tag
        //       style={{ backgroundColor: "#7CBF3F" }}
        //       key={record.docStatus}
        //       className={classes.statusTag}
        //     >
        //       {record.docStatus}
        //     </Tag>
        //   );
        // } else if (record.docStatus === "Draft") {
        //   return (
        //     <Tag
        //       style={{ backgroundColor: "#0075A4" }}
        //       key={record.docStatus}
        //       className={classes.statusTag}
        //     >
        //       {record.docStatus}
        //     </Tag>
        //   );
        // } else if (record.docStatus === "Send For Edit") {
        //   return (
        //     <Tag
        //       style={{ backgroundColor: "#0075A4" }}
        //       key={record.docStatus}
        //       className={classes.statusTag}
        //     >
        //       {`Sent For Edit`}
        //     </Tag>
        //   );
        // } else if (record.docStatus === "Obsolete") {
        //   return (
        //     <Tag color="#003566" key={record.docStatus}>
        //       {record.docStatus}
        //     </Tag>
        //   );
        // } else return record.docStatus
      },

      // Check if tabFilter is not equal to "distributedDoc" before rendering the filter
      ...(tabFilter !== "distributedDoc" &&
        tabFilter !== "allDoc" && {
          filterIcon: (filtered: any) =>
            isFilterStatus ? (
              <FilterFilled style={{ fontSize: "16px", color: "black" }} />
            ) : (
              <FilterOutlined style={{ fontSize: "16px" }} />
            ),
          filterDropdown: ({ confirm, clearFilters }: any) => {
            return (
              <div style={{ padding: 8 }}>
                {filterList?.status?.map((name: any) => (
                  <div key={name}>
                    <label style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setSelectedStatus([...selectedStatus, value]);
                          } else {
                            setSelectedStatus(
                              selectedStatus.filter((key: any) => key !== value)
                            );
                          }
                        }}
                        value={name}
                        checked={selectedStatus.includes(name)} // Check if the checkbox should be checked
                        style={{
                          width: "16px",
                          height: "16px",
                          marginRight: "5px",
                        }}
                      />
                      {name}
                    </label>
                  </div>
                ))}
                <div style={{ marginTop: 8 }}>
                  <Button
                    type="primary"
                    disabled={selectedStatus.length === 0}
                    onClick={() => {
                      setfilterStatus(true);
                      handleChangePageNew(1, 10);
                    }}
                    style={{
                      marginRight: 8,
                      backgroundColor: "#E8F3F9",
                      color: "black",
                    }}
                  >
                    Apply
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedStatus([]);
                      // fetchDocuments();
                      fetchDocuments();
                      setfilterStatus(false);
                      confirm();
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            );
          },
          // filterDropdown: ({ confirm, clearFilters }: any) => {
          //   // Create a set to store unique names
          //   const uniqueNames = new Set();

          //   // Iterate through allAuditPlanDetails and add unique names to the set
          //   data?.forEach((item: any) => {
          //     const name = item.docStatus;
          //     uniqueNames.add(name);
          //   });

          //   // Convert the set back to an array for rendering
          //   const uniqueNamesArray = Array.from(uniqueNames);

          //   return (
          //     <div style={{ padding: 8 }}>
          //       {uniqueNamesArray.map((name: any) => (
          //         <div key={name}>
          //           {console.log(
          //             "checked",
          //             selectedStatus.includes(name),
          //             selectedStatus,
          //             name
          //           )}
          //           <label style={{ display: "flex", alignItems: "center" }}>
          //             <input
          //               type="checkbox"
          //               onChange={(e) => {
          //                 const value = e.target.value;
          //                 if (e.target.checked) {
          //                   setSelectedStatus([...selectedStatus, value]);
          //                 } else {
          //                   setSelectedStatus(
          //                     selectedStatus.filter((key: any) => key !== value)
          //                   );
          //                 }
          //               }}
          //               value={name}
          //               checked={selectedStatus.includes(name)} // Check if the checkbox should be checked
          //               style={{
          //                 width: "16px",
          //                 height: "16px",
          //                 marginRight: "5px",
          //               }}
          //             />
          //             {name}
          //           </label>
          //         </div>
          //       ))}
          //       <div style={{ marginTop: 8 }}>
          //         <Button
          //           type="primary"
          //           disabled={selectedStatus.length === 0}
          //           onClick={() => {
          //             // let url = formatDashboardQuery(`/api/dashboard/`, {
          //             //   ...searchValues,
          //             //   documentStatus: selectedStatus,
          //             //   page: page,
          //             //   limit: rowsPerPage,
          //             onChange(selectedStatus);
          //             // });
          //             // fetchDocuments(url);
          //             setfilterType(true);
          //           }}
          //           style={{
          //             marginRight: 8,
          //             backgroundColor: "#E8F3F9",
          //             color: "black",
          //           }}
          //         >
          //           Apply
          //         </Button>
          //         <Button
          //           onClick={() => {
          //             setSelectedStatus([]);
          //             fetchDocuments();
          //             setfilterType(false);
          //             confirm();
          //           }}
          //         >
          //           Reset
          //         </Button>
          //       </div>
          //     </div>
          //   );
          // },
        }),
    },
    {
      title: "Published Date",
      dataIndex: "approvedDate",
      key: "approvedDate",
      width: 200,
      render: (_: any, record: any) => record?.approvedDate || "",
      // sorter: (a, b) => a.department - b.department,
    },

    {
      title: "Next Rev Due on",
      dataIndex: "nextRevisionDate",
      key: "nextRevisionDate",
      width: 200,
      render: (_: any, record: any) => record?.nextRevisionDate,
      // sorter: (a, b) => a.department - b.department,
    },
    // {tabFilter==="inWorkflow"&&{}}
    {
      title: "Dept/Vertical",
      dataIndex: "department",
      key: "department",
      width: 100,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record.department}
          </div>
        </div>
      ),
      filterIcon: (filtered: any) =>
        selectedMyDept?.length > 0 ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }) => {
        return (
          <div
            style={{
              padding: 8,
              maxHeight: 200, // Set the maximum height of the container
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            {filterList?.entity?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedMyDept([...selectedMyDept, value]);
                      } else {
                        setselectedMyDept(
                          selectedMyDept.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedMyDept.includes(item.id)}
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedMyDept.length === 0}
                onClick={() => {
                  setfilterMyDept(!isFilterMyDept);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedMyDept([]);
                  fetchDocuments();
                  setfilterMyDept(!isFilterMyDept);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
      // sorter: (a, b) => a.department - b.department,
    },
    {
      title: "Corp Func/Unit",
      dataIndex: "location",
      key: "location",
      width: 150,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record.location}
          </div>
        </div>
      ),
      // sorter: (a, b) => a.location - b.location,
    },
    {
      title: "Section",
      dataIndex: "sectionName",
      key: "sectionName",
      width: 100,
      filterIcon: (filtered: any) =>
        isFilterMySection ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }) => {
        return (
          <div
            style={{
              padding: 8,
              maxHeight: 200, // Set the maximum height of the container
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            {filterList?.section?.map((item: any) => (
              <div key={item}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedMySection([...selectedMySection, value]);
                      } else {
                        setSelectedMySection(
                          selectedMySection.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedMySection.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedMySection.length === 0}
                onClick={() => {
                  setFilerMySection(true);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setSelectedMySection([]);
                  fetchDocuments();
                  setFilerMySection(false);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },

    {
      title: "Action",
      // fixed: "right",
      dataIndex: "isAction",
      key: "isAction",
      width: 180,
      render: (_: any, record: any, index) => {
        if (index === 0) {
          return (
            !record.isVersion && (
              <>
                {record.editAcess && matches ? (
                  // <Tooltip title="Click to Amend">
                  <IconButton
                    className={classes.actionButtonStyle}
                    data-testid="action-item"
                    onClick={() => handleEditProcessDoc(record)}
                    style={{ color: iconColor }}
                  >
                    <div ref={refElementForAllDocument5}>
                      <CustomEditIcon width={18} height={18} />
                    </div>
                  </IconButton>
                ) : (
                  // </Tooltip>
                  ""
                )}
                <Divider type="vertical" className={classes.docNavDivider} />
                {record.deleteAccess ? (
                  <IconButton
                    className={classes.actionButtonStyle}
                    data-testid="action-item"
                    onClick={() => handleOpen(record.id)}
                    style={{ color: iconColor }}
                  >
                    <CustomDeleteICon width={18} height={18} />
                  </IconButton>
                ) : (
                  ""
                )}
              </>
            )
          );
        }
        return (
          !record.isVersion && (
            <>
              {record.editAcess && matches ? (
                // <Tooltip title="Click to Amend">
                <IconButton
                  className={classes.actionButtonStyle}
                  data-testid="action-item"
                  onClick={() => handleEditProcessDoc(record)}
                  style={{ color: iconColor }}
                >
                  <div>
                    <CustomEditIcon width={18} height={18} />
                  </div>
                </IconButton>
              ) : (
                // </Tooltip>
                ""
              )}
              <Divider type="vertical" className={classes.docNavDivider} />
              {record.deleteAccess ? (
                <IconButton
                  className={classes.actionButtonStyle}
                  data-testid="action-item"
                  onClick={() => handleOpen(record.id)}
                  style={{ color: iconColor }}
                >
                  <CustomDeleteICon width={18} height={18} />
                </IconButton>
              ) : (
                ""
              )}
            </>
          )
        );
      },
    },
  ];
  const columns: ColumnsType<any> = [
    {
      title: "Doc Number",
      dataIndex: "docNumber",
      key: "docNumber",
      width: 50,
      render: (_: any, record: any, index) => {
        if (index === 0) {
          return (
            <Tooltip title={record.docNumber}>
              <div
                style={{
                  width: 100,
                }}
              >
                <div
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  ref={refElementForAllDocument2}
                >
                  {record.docNumber}
                </div>
              </div>
            </Tooltip>
          );
        }
        return (
          <Tooltip title={record.docNumber}>
            <div
              style={{
                width: 100,
              }}
            >
              <div
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {record.docNumber}
              </div>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Title",
      dataIndex: "documentName",
      key: "documentName",
      width: 100,
      // sorter: (a, b) => a.documentName - b.documentName,
      render: (_: any, record: any, index) => {
        if (index === 0) {
          return record.action ? (
            <Tooltip title={record.documentName}>
              <div
                style={{
                  textDecorationLine: "underline",
                  cursor: "pointer",
                  width: 130,
                }}
              >
                <div
                  className={classes.clickableField}
                  onClick={() => toggleDocViewDrawer(record)}
                  style={{
                    whiteSpace: "normal", // Adjusted to wrap text
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  ref={refElementForAllDocument3}
                >
                  {record.documentName}
                </div>
              </div>
            </Tooltip>
          ) : (
            <Tooltip title={record.documentName}>
              <>{record.documentName}</>
            </Tooltip>
          );
        }
        return record.action ? (
          <Tooltip title={record.documentName}>
            <div
              style={{
                textDecorationLine: "underline",
                cursor: "pointer",
                width: 130,
              }}
            >
              <div
                className={classes.clickableField}
                onClick={() => toggleDocViewDrawer(record)}
                style={{
                  whiteSpace: "normal", // Adjusted to wrap text
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {record.documentName}
              </div>
            </div>
          </Tooltip>
        ) : (
          <Tooltip title={record.documentName}>
            <>{record.documentName}</>
          </Tooltip>
        );
      },
    },
    {
      title: "Type",
      dataIndex: "docType",
      width: 100,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record.docType}
          </div>
        </div>
      ),
      filterIcon: (filtered: any) =>
        isFilterType ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8 }}>
            {filterList?.doctype?.map((name: any) => (
              <div key={name}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedDocType([...selectedDocType, value]);
                      } else {
                        setselectedDocType(
                          selectedDocType.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={name}
                    checked={selectedDocType.includes(name)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedDocType.length === 0}
                onClick={() => {
                  setfilterType(true);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedDocType([]);
                  setfilterType(false);
                  confirm();
                  fetchDocuments();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "System",
      dataIndex: "system",
      width: 50,
      render: (_, record) => {
        return <MultiUserDisplay data={record.system} name="name" />;
      },
      filterIcon: (filtered: any) =>
        isFilterSystem ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }) => {
        return (
          <div
            style={{
              padding: 8,
            }}
          >
            {filterList?.system?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedSystem([...selectedSystem, value]);
                      } else {
                        setselectedSystem(
                          selectedSystem.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedSystem.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedSystem.length === 0}
                onClick={() => {
                  setfilterSystem(true);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedSystem([]);
                  fetchDocuments();
                  setfilterSystem(false);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Issue - Version",
      dataIndex: "version",
      width: 220,
      key: "version",
      render: (_: any, record: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          {record.issueNumber} - {record.version}
        </div>
      ),
      // sorter: (a, b) => a.version - b.version,
    },
    {
      title: "Status",
      dataIndex: "docStatus",
      key: "docStatus",
      width: 130,
      render: (_: any, record: any, index) => {
        if (index === 0) {
          return (
            <div ref={refElementForAllDocument4}>
              {record.docStatus === "Approved" && (
                <Tag
                  style={{ backgroundColor: "#7cbf3f" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  {record.docStatus}
                </Tag>
              )}
              {record.docStatus === "For Review" && (
                <Tag
                  style={{ backgroundColor: "#F2BB00" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  In Review
                </Tag>
              )}
              {record.docStatus === "Review Complete" && (
                <Tag
                  style={{ backgroundColor: "#F2BB00" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  {record.docStatus}
                </Tag>
              )}
              {record.docStatus === "For Approval" && (
                <Tag
                  style={{ backgroundColor: "#FB8500" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  In Approval
                </Tag>
              )}
              {record.docStatus === "Amend" && (
                <Tag
                  style={{ backgroundColor: "#D62DB1" }}
                  color="yellow"
                  key={record.docStatus}
                >
                  {record.docStatus}
                </Tag>
              )}
              {record.docStatus === "Published" && (
                <Tag
                  style={{ backgroundColor: "#7CBF3F" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  {record.docStatus}
                </Tag>
              )}
              {record.docStatus === "Draft" && (
                <Tag
                  style={{ backgroundColor: "#0075A4" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  {record.docStatus}
                </Tag>
              )}
              {record.docStatus === "Send For Edit" && (
                <Tag
                  style={{ backgroundColor: "#0075A4" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  Sent For Edit
                </Tag>
              )}

              {record.docStatus === "Retire - In Review" && (
                <Tag
                  style={{ backgroundColor: "#0075A4" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  {"Retire Review"}
                </Tag>
              )}
              {record.docStatus === "Retire - In Approval" && (
                <Tag
                  style={{ backgroundColor: "#0075A4" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  {"Retire Approval"}
                </Tag>
              )}
              {record.docStatus === "Retire" && (
                <Tag
                  style={{ backgroundColor: "#0075A4" }}
                  key={record.docStatus}
                  className={classes.statusTag}
                >
                  {record.docStatus}
                </Tag>
              )}
              {record.docStatus === "Obsolete" && (
                <Tag color="#003566" key={record.docStatus}>
                  {record.docStatus}
                </Tag>
              )}
              {/* If none of the above conditions match, simply render the docStatus */}
              {![
                "Approved",
                "For Review",
                "Review Complete",
                "For Approval",
                "Amend",
                "Published",
                "Draft",
                "Send For Edit",
                "Obsolete",
                "Retire - In Review",
              ].includes(record.docStatus) && (
                <Tag key={record.docStatus}>{record.docStatus}</Tag>
              )}
            </div>
          );
        }
        return (
          <div>
            {record.docStatus === "Approved" && (
              <Tag
                style={{ backgroundColor: "#7cbf3f" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                {record.docStatus}
              </Tag>
            )}
            {record.docStatus === "For Review" && (
              <Tag
                style={{ backgroundColor: "#F2BB00" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                In Review
              </Tag>
            )}
            {record.docStatus === "Review Complete" && (
              <Tag
                style={{ backgroundColor: "#F2BB00" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                {record.docStatus}
              </Tag>
            )}
            {record.docStatus === "For Approval" && (
              <Tag
                style={{ backgroundColor: "#FB8500" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                In Approval
              </Tag>
            )}
            {record.docStatus === "Amend" && (
              <Tag
                style={{ backgroundColor: "#D62DB1" }}
                color="yellow"
                key={record.docStatus}
              >
                {record.docStatus}
              </Tag>
            )}
            {record.docStatus === "Published" && (
              <Tag
                style={{ backgroundColor: "#7CBF3F" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                {record.docStatus}
              </Tag>
            )}
            {record.docStatus === "Draft" && (
              <Tag
                style={{ backgroundColor: "#0075A4" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                {record.docStatus}
              </Tag>
            )}
            {record.docStatus === "Send For Edit" && (
              <Tag
                style={{ backgroundColor: "#0075A4" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                Sent For Edit
              </Tag>
            )}

            {record.docStatus === "Retire - In Review" && (
              <Tag
                style={{ backgroundColor: "#0075A4" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                {"Retire Review"}
              </Tag>
            )}
            {record.docStatus === "Retire - In Approval" && (
              <Tag
                style={{ backgroundColor: "#0075A4" }}
                key={record.docStatus}
                className={classes.statusTag}
              >
                {"Retire Approval"}
              </Tag>
            )}
            {record.docStatus === "Obsolete" && (
              <Tag color="#003566" key={record.docStatus}>
                {record.docStatus}
              </Tag>
            )}
            {/* If none of the above conditions match, simply render the docStatus */}
            {![
              "Approved",
              "For Review",
              "Review Complete",
              "For Approval",
              "Amend",
              "Published",
              "Draft",
              "Send For Edit",
              "Obsolete",
              "Retire - In Review",
              "Retire - In Approval",
            ].includes(record.docStatus) && (
              <Tag key={record.docStatus}>{record.docStatus}</Tag>
            )}
          </div>
        );

        // if (record.docStatus === "Approved") {
        //   return (
        //     <Tag
        //       style={{ backgroundColor: "#7cbf3f" }}
        //       key={record.docStatus}
        //       className={classes.statusTag}
        //     >
        //       {record.docStatus}
        //     </Tag>
        //   );
        // } else if (record.docStatus === "For Review") {
        //   return (
        //     <Tag
        //       style={{ backgroundColor: "#F2BB00" }}
        //       key={record.docStatus}
        //       className={classes.statusTag}
        //     >
        //       In Review
        //     </Tag>
        //   );
        // } else if (record.docStatus === "Review Complete") {
        //   return (
        //     <Tag
        //       style={{ backgroundColor: "#F2BB00" }}
        //       key={record.docStatus}
        //       className={classes.statusTag}
        //     >
        //       {record.docStatus}
        //     </Tag>
        //   );
        // } else if (record.docStatus === "For Approval") {
        //   return (
        //     <Tag
        //       style={{ backgroundColor: "#FB8500" }}
        //       key={record.docStatus}
        //       className={classes.statusTag}
        //     >
        //       {/* {record.docStatus} */}
        //       In Approval
        //     </Tag>
        //   );
        // } else if (record.docStatus === "Amend") {
        //   return (
        //     <Tag
        //       style={{ backgroundColor: "#D62DB1" }}
        //       color="yellow"
        //       key={record.docStatus}
        //     >
        //       {record.docStatus}
        //     </Tag>
        //   );
        // } else if (record.docStatus === "Published") {
        //   return (
        //     <Tag
        //       style={{ backgroundColor: "#7CBF3F" }}
        //       key={record.docStatus}
        //       className={classes.statusTag}
        //     >
        //       {record.docStatus}
        //     </Tag>
        //   );
        // } else if (record.docStatus === "Draft") {
        //   return (
        //     <Tag
        //       style={{ backgroundColor: "#0075A4" }}
        //       key={record.docStatus}
        //       className={classes.statusTag}
        //     >
        //       {record.docStatus}
        //     </Tag>
        //   );
        // } else if (record.docStatus === "Send For Edit") {
        //   return (
        //     <Tag
        //       style={{ backgroundColor: "#0075A4" }}
        //       key={record.docStatus}
        //       className={classes.statusTag}
        //     >
        //       {`Sent For Edit`}
        //     </Tag>
        //   );
        // } else if (record.docStatus === "Obsolete") {
        //   return (
        //     <Tag color="#003566" key={record.docStatus}>
        //       {record.docStatus}
        //     </Tag>
        //   );
        // } else return record.docStatus
      },

      // Check if tabFilter is not equal to "distributedDoc" before rendering the filter
      ...(tabFilter !== "distributedDoc" &&
        tabFilter !== "allDoc" && {
          filterIcon: (filtered: any) =>
            isFilterStatus ? (
              <FilterFilled style={{ fontSize: "16px", color: "black" }} />
            ) : (
              <FilterOutlined style={{ fontSize: "16px" }} />
            ),
          filterDropdown: ({ confirm, clearFilters }: any) => {
            return (
              <div style={{ padding: 8 }}>
                {filterList?.status?.map((name: any) => (
                  <div key={name}>
                    <label style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setSelectedStatus([...selectedStatus, value]);
                          } else {
                            setSelectedStatus(
                              selectedStatus.filter((key: any) => key !== value)
                            );
                          }
                        }}
                        value={name}
                        checked={selectedStatus.includes(name)} // Check if the checkbox should be checked
                        style={{
                          width: "16px",
                          height: "16px",
                          marginRight: "5px",
                        }}
                      />
                      {name}
                    </label>
                  </div>
                ))}
                <div style={{ marginTop: 8 }}>
                  <Button
                    type="primary"
                    disabled={selectedStatus.length === 0}
                    onClick={() => {
                      setfilterStatus(true);
                      handleChangePageNew(1, 10);
                    }}
                    style={{
                      marginRight: 8,
                      backgroundColor: "#E8F3F9",
                      color: "black",
                    }}
                  >
                    Apply
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedStatus([]);
                      fetchDocuments();
                      setfilterStatus(false);
                      confirm();
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            );
          },
          // filterDropdown: ({ confirm, clearFilters }: any) => {
          //   // Create a set to store unique names
          //   const uniqueNames = new Set();

          //   // Iterate through allAuditPlanDetails and add unique names to the set
          //   data?.forEach((item: any) => {
          //     const name = item.docStatus;
          //     uniqueNames.add(name);
          //   });

          //   // Convert the set back to an array for rendering
          //   const uniqueNamesArray = Array.from(uniqueNames);

          //   return (
          //     <div style={{ padding: 8 }}>
          //       {uniqueNamesArray.map((name: any) => (
          //         <div key={name}>
          //           {console.log(
          //             "checked",
          //             selectedStatus.includes(name),
          //             selectedStatus,
          //             name
          //           )}
          //           <label style={{ display: "flex", alignItems: "center" }}>
          //             <input
          //               type="checkbox"
          //               onChange={(e) => {
          //                 const value = e.target.value;
          //                 if (e.target.checked) {
          //                   setSelectedStatus([...selectedStatus, value]);
          //                 } else {
          //                   setSelectedStatus(
          //                     selectedStatus.filter((key: any) => key !== value)
          //                   );
          //                 }
          //               }}
          //               value={name}
          //               checked={selectedStatus.includes(name)} // Check if the checkbox should be checked
          //               style={{
          //                 width: "16px",
          //                 height: "16px",
          //                 marginRight: "5px",
          //               }}
          //             />
          //             {name}
          //           </label>
          //         </div>
          //       ))}
          //       <div style={{ marginTop: 8 }}>
          //         <Button
          //           type="primary"
          //           disabled={selectedStatus.length === 0}
          //           onClick={() => {
          //             // let url = formatDashboardQuery(`/api/dashboard/`, {
          //             //   ...searchValues,
          //             //   documentStatus: selectedStatus,
          //             //   page: page,
          //             //   limit: rowsPerPage,
          //             onChange(selectedStatus);
          //             // });
          //             // fetchDocuments(url);
          //             setfilterType(true);
          //           }}
          //           style={{
          //             marginRight: 8,
          //             backgroundColor: "#E8F3F9",
          //             color: "black",
          //           }}
          //         >
          //           Apply
          //         </Button>
          //         <Button
          //           onClick={() => {
          //             setSelectedStatus([]);
          //             fetchDocuments();
          //             setfilterType(false);
          //             confirm();
          //           }}
          //         >
          //           Reset
          //         </Button>
          //       </div>
          //     </div>
          //   );
          // },
        }),
    },
    {
      title: "Published Date",
      dataIndex: "approvedDate",
      key: "approvedDate",
      width: 200,
      render: (_: any, record: any) => record?.approvedDate || "",
      // sorter: (a, b) => a.department - b.department,
    },
    // {tabFilter==="inWorkflow"&&{}}
    {
      title: "Dept/Vertical",
      dataIndex: "department",
      key: "department",
      width: 100,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record.department}
          </div>
        </div>
      ),
      filterIcon: (filtered: any) =>
        selectedMyDept?.length > 0 ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }) => {
        return (
          <div
            style={{
              padding: 8,
              maxHeight: 200, // Set the maximum height of the container
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            {filterList?.entity?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedMyDept([...selectedMyDept, value]);
                      } else {
                        setselectedMyDept(
                          selectedMyDept.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedMyDept.includes(item.id)}
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedMyDept.length === 0}
                onClick={() => {
                  setfilterMyDept(!isFilterMyDept);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedMyDept([]);
                  fetchDocuments();
                  setfilterMyDept(!isFilterMyDept);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
      // sorter: (a, b) => a.department - b.department,
    },
    {
      title: "Corp Func/Unit",
      dataIndex: "location",
      key: "location",
      width: 150,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record.location}
          </div>
        </div>
      ),
      // sorter: (a, b) => a.location - b.location,
    },
    {
      title: "Section",
      dataIndex: "sectionName",
      key: "sectionName",
      width: 100,
      filterIcon: (filtered: any) =>
        isFilterMySection ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }) => {
        return (
          <div
            style={{
              padding: 8,
              maxHeight: 200, // Set the maximum height of the container
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            {filterList?.section?.map((item: any) => (
              <div key={item}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedMySection([...selectedMySection, value]);
                      } else {
                        setSelectedMySection(
                          selectedMySection.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedMySection.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedMySection.length === 0}
                onClick={() => {
                  setFilerMySection(true);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setSelectedMySection([]);
                  fetchDocuments();
                  setFilerMySection(false);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },

    {
      title: "Action",
      // fixed: "right",
      dataIndex: "isAction",
      key: "isAction",
      width: 180,
      render: (_: any, record: any, index) => {
        if (index === 0) {
          return (
            !record.isVersion && (
              <>
                {record.editAcess && matches ? (
                  // <Tooltip title="Click to Amend">
                  <IconButton
                    className={classes.actionButtonStyle}
                    data-testid="action-item"
                    onClick={() => handleEditProcessDoc(record)}
                    style={{ color: iconColor }}
                  >
                    <div ref={refElementForAllDocument5}>
                      <CustomEditIcon width={18} height={18} />
                    </div>
                  </IconButton>
                ) : (
                  // </Tooltip>
                  ""
                )}
                <Divider type="vertical" className={classes.docNavDivider} />
                {record.deleteAccess ? (
                  <IconButton
                    className={classes.actionButtonStyle}
                    data-testid="action-item"
                    onClick={() => handleOpen(record.id)}
                    style={{ color: iconColor }}
                  >
                    <CustomDeleteICon width={18} height={18} />
                  </IconButton>
                ) : (
                  ""
                )}
              </>
            )
          );
        }
        return (
          !record.isVersion && (
            <>
              {record.editAcess && matches ? (
                // <Tooltip title="Click to Amend">
                <IconButton
                  className={classes.actionButtonStyle}
                  data-testid="action-item"
                  onClick={() => handleEditProcessDoc(record)}
                  style={{ color: iconColor }}
                >
                  <div>
                    <CustomEditIcon width={18} height={18} />
                  </div>
                </IconButton>
              ) : (
                // </Tooltip>
                ""
              )}
              <Divider type="vertical" className={classes.docNavDivider} />
              {record.deleteAccess ? (
                <IconButton
                  className={classes.actionButtonStyle}
                  data-testid="action-item"
                  onClick={() => handleOpen(record.id)}
                  style={{ color: iconColor }}
                >
                  <CustomDeleteICon width={18} height={18} />
                </IconButton>
              ) : (
                ""
              )}
            </>
          )
        );
      },
    },
  ];

  const myDocumentColumns: ColumnsType<any> = [
    {
      title: "Doc Number",
      dataIndex: "docNumber",
      key: "docNumber",
      width: 70,
      render: (_: any, record: any) => (
        <Tooltip title={record.docNumber}>
          <div
            style={{
              width: 100,
            }}
          >
            <div
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {record.docNumber}
            </div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Title",
      dataIndex: "documentName",
      key: "documentName",
      width: 100,
      render: (_: any, record: any, index) => {
        if (index === 0) {
          return record.action ? (
            <Tooltip title={record.documentName}>
              <div
                style={{
                  textDecorationLine: "underline",
                  cursor: "pointer",
                  width: 130,
                }}
              >
                <div
                  className={classes.clickableField}
                  onClick={() => toggleDocViewDrawer(record)}
                  style={{
                    whiteSpace: "normal", // Adjusted to wrap text
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  ref={refElementForAllDocument3}
                >
                  {record.documentName}
                </div>
              </div>
            </Tooltip>
          ) : (
            <Tooltip title={record.documentName}>
              <>{record.documentName}</>
            </Tooltip>
          );
        }
        return record.action ? (
          <Tooltip title={record.documentName}>
            <div
              style={{
                textDecorationLine: "underline",
                cursor: "pointer",
                width: 130,
              }}
            >
              <div
                className={classes.clickableField}
                onClick={() => toggleDocViewDrawer(record)}
                style={{
                  whiteSpace: "normal", // Adjusted to wrap text
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {record.documentName}
              </div>
            </div>
          </Tooltip>
        ) : (
          <Tooltip title={record.documentName}>
            <>{record.documentName}</>
          </Tooltip>
        );
      },
    },
    {
      title: "Type",
      dataIndex: "docType",
      width: 100,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record.docType}
          </div>
        </div>
      ),
      filterIcon: (filtered: any) =>
        isFilterType ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8 }}>
            {filterList?.doctype?.map((name: any) => (
              <div key={name}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedDocType([...selectedDocType, value]);
                      } else {
                        setselectedDocType(
                          selectedDocType.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={name}
                    checked={selectedDocType.includes(name)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedDocType.length === 0}
                onClick={() => {
                  setfilterType(true);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedDocType([]);
                  setfilterType(false);
                  fetchDocuments();
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "System",
      dataIndex: "system",
      width: 50,
      render: (_, record) => {
        return <MultiUserDisplay data={record.system} name="name" />;
      },
      filterIcon: (filtered: any) =>
        isFilterSystem ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }) => {
        return (
          <div
            style={{
              padding: 8,
            }}
          >
            {filterList?.system?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedSystem([...selectedSystem, value]);
                      } else {
                        setselectedSystem(
                          selectedSystem.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedSystem.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedSystem.length === 0}
                onClick={() => {
                  setfilterSystem(true);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedSystem([]);
                  fetchDocuments();
                  setfilterSystem(false);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "My Role",
      dataIndex: "type",
      width: 50,
      render: (_, record) => {
        return <MultiUserDisplay data={record.type} name="type" />;
      },
      filterIcon: (filtered: any) =>
        isFilterMyRole ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }) => {
        return (
          <div
            style={{
              padding: 8,
            }}
          >
            {roles?.map((item: any) => (
              <div key={item}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedMyRole([...selectedMyRole, value]);
                      } else {
                        setselectedMyRole(
                          selectedMyRole.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item}
                    checked={selectedMyRole.includes(item)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedMyRole.length === 0}
                onClick={() => {
                  setfilterMyRole(true);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedMyRole([]);
                  fetchDocuments();
                  setfilterMyRole(false);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Issue - Version",
      dataIndex: "version",
      width: 220,
      key: "version",
      render: (_: any, record: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          {record.issueNumber} - {record.version}
        </div>
      ),
      // sorter: (a, b) => a.version - b.version,
    },
    {
      title: "Status",
      dataIndex: "docStatus",
      key: "docStatus",
      width: 150,
      render: (_: any, record: any) => {
        if (record.docStatus === "Approved") {
          return (
            <Tag
              style={{ backgroundColor: "#7cbf3f" }}
              key={record.docStatus}
              className={classes.statusTag}
            >
              {record.docStatus}
            </Tag>
          );
        } else if (record.docStatus === "For Review") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.docStatus}
              className={classes.statusTag}
            >
              In Review
            </Tag>
          );
        } else if (record.docStatus === "Review Complete") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.docStatus}
              className={classes.statusTag}
            >
              {record.docStatus}
            </Tag>
          );
        } else if (record.docStatus === "For Approval") {
          return (
            <Tag
              style={{ backgroundColor: "#FB8500" }}
              key={record.docStatus}
              className={classes.statusTag}
            >
              {/* {record.docStatus} */}
              In Approval
            </Tag>
          );
        } else if (record.docStatus === "Amend") {
          return (
            <Tag
              style={{ backgroundColor: "#D62DB1" }}
              color="yellow"
              key={record.docStatus}
            >
              {record.docStatus}
            </Tag>
          );
        } else if (record.docStatus === "Published") {
          return (
            <Tag
              style={{ backgroundColor: "#7CBF3F" }}
              key={record.docStatus}
              className={classes.statusTag}
            >
              {record.docStatus}
            </Tag>
          );
        } else if (record.docStatus === "Draft") {
          return (
            <Tag
              style={{ backgroundColor: "#0075A4" }}
              key={record.docStatus}
              className={classes.statusTag}
            >
              {record.docStatus}
            </Tag>
          );
        } else if (record.docStatus === "Send For Edit") {
          return (
            <Tag
              style={{ backgroundColor: "#0075A4" }}
              key={record.docStatus}
              className={classes.statusTag}
            >
              {`Sent For Edit`}
            </Tag>
          );
        } else if (record.docStatus === "Retire - In Review") {
          return (
            <Tag color="#0075A4" key={record.docStatus}>
              {"Retire Review"}
            </Tag>
          );
        } else if (record.docStatus === "Retire - In Approval") {
          return (
            <Tag color="#FB8500" key={record.docStatus}>
              {"Retire Approval"}
            </Tag>
          );
        } else if (record.docStatus === "Obsolete") {
          return (
            <Tag color="#003566" key={record.docStatus}>
              {record.docStatus}
            </Tag>
          );
        } else return record.docStatus;
      },
      // Check if tabFilter is not equal to "distributedDoc" before rendering the filter
      ...(tabFilter !== "distributedDoc" && {
        filterIcon: (filtered: any) =>
          isFilterStatus ? (
            <FilterFilled style={{ fontSize: "16px", color: "black" }} />
          ) : (
            <FilterOutlined style={{ fontSize: "16px" }} />
          ),
        filterDropdown: ({ confirm, clearFilters }: any) => {
          return (
            <div style={{ padding: 8 }}>
              {filterList?.status?.map((name: any) => (
                <div key={name}>
                  <label style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (e.target.checked) {
                          setSelectedStatus([...selectedStatus, value]);
                        } else {
                          setSelectedStatus(
                            selectedStatus.filter((key: any) => key !== value)
                          );
                        }
                      }}
                      value={name}
                      checked={selectedStatus.includes(name)} // Check if the checkbox should be checked
                      style={{
                        width: "16px",
                        height: "16px",
                        marginRight: "5px",
                      }}
                    />
                    {name}
                  </label>
                </div>
              ))}
              <div style={{ marginTop: 8 }}>
                <Button
                  type="primary"
                  disabled={selectedStatus.length === 0}
                  onClick={() => {
                    setfilterStatus(true);
                    handleChangePageNew(1, 10);
                  }}
                  style={{
                    marginRight: 8,
                    backgroundColor: "#E8F3F9",
                    color: "black",
                  }}
                >
                  Apply
                </Button>
                <Button
                  onClick={() => {
                    setSelectedStatus([]);
                    fetchDocuments();
                    setfilterStatus(false);
                    confirm();
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          );
        },
      }),
    },
    {
      title: "Published Date",
      dataIndex: "approvedDate",
      key: "approvedDate",
      width: 200,
      render: (_: any, record: any) => record?.approvedDate || "",
      // sorter: (a, b) => a.department - b.department,
    },
    // {tabFilter==="inWorkflow"&&{}}
    {
      title: "Dept/Vertical",
      dataIndex: "department",
      key: "department",
      width: 100,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record.department}
          </div>
        </div>
      ),
      filterIcon: (filtered: any) =>
        selectedMyDept?.length > 0 ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }) => {
        return (
          <div
            style={{
              padding: 8,
              maxHeight: 200, // Set the maximum height of the container
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            {filterList?.entity?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedMyDept([...selectedMyDept, value]);
                      } else {
                        setselectedMyDept(
                          selectedMyDept.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedMyDept.includes(item.id)}
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedMyDept.length === 0}
                onClick={() => {
                  setfilterMyDept(!isFilterMyDept);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedMyDept([]);
                  fetchDocuments();
                  setfilterMyDept(!isFilterMyDept);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
      // sorter: (a, b) => a.department - b.department,
    },
    {
      title: "Corp Func/Unit",
      dataIndex: "location",
      key: "location",
      width: 150,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record.location}
          </div>
        </div>
      ),
      filterIcon: (filtered: any) =>
        isFilterMyLoc ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }) => {
        return (
          <div
            style={{
              padding: 8,
            }}
          >
            {filterList?.location?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedMyLoc([...selectedMyLoc, value]);
                      } else {
                        setselectedMyLoc(
                          selectedMyLoc.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedMyLoc.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedMyLoc.length === 0}
                onClick={() => {
                  setfilterMyLoc(!isFilterMyLoc);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedMyLoc([]);
                  fetchDocuments();
                  setfilterMyLoc(!isFilterMyLoc);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
      // sorter: (a, b) => a.location - b.location,
    },
    {
      title: "Section",
      dataIndex: "sectionName",
      key: "sectionName",
      filterIcon: (filtered: any) =>
        isFilterMySection ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }) => {
        return (
          <div
            style={{
              padding: 8,
              maxHeight: 200, // Set the maximum height of the container
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            {filterList?.section?.map((item: any) => (
              <div key={item}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedMySection([...selectedMySection, value]);
                      } else {
                        setSelectedMySection(
                          selectedMySection.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedMySection.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedMySection.length === 0}
                onClick={() => {
                  setFilerMySection(true);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setSelectedMySection([]);
                  fetchDocuments();
                  setFilerMySection(false);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },

    {
      title: "Action",
      // fixed: "right",
      dataIndex: "isAction",
      key: "isAction",
      width: 180,
      render: (_: any, record: any) =>
        !record.isVersion && (
          <>
            {record.editAcess && matches ? (
              // <Tooltip title="Click to Amend">
              <IconButton
                className={classes.actionButtonStyle}
                data-testid="action-item"
                onClick={() => handleEditProcessDoc(record)}
                style={{ color: iconColor }}
              >
                <CustomEditIcon width={18} height={18} />
              </IconButton>
            ) : (
              // </Tooltip>
              ""
            )}
            <Divider type="vertical" className={classes.docNavDivider} />
            {record.deleteAccess ? (
              <IconButton
                className={classes.actionButtonStyle}
                data-testid="action-item"
                onClick={() => handleOpen(record.id)}
                style={{ color: iconColor }}
              >
                <CustomDeleteICon width={18} height={18} />
              </IconButton>
            ) : (
              ""
            )}
          </>
        ),
    },
  ];
  const columnsforInFlow: ColumnsType<any> = [
    {
      title: "Doc Number",
      dataIndex: "docNumber",
      key: "docNumber",
      width: 50,
      render: (_: any, record: any) => (
        <Tooltip title={record.docNumber}>
          <div
            style={{
              width: 80,
            }}
          >
            <div
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {record.docNumber}
            </div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Title",
      dataIndex: "documentName",
      key: "documentName",
      width: 100,
      // sorter: (a, b) => a.documentName - b.documentName,
      render: (_: any, record: any, index) => {
        if (index === 0) {
          return record.action ? (
            <Tooltip title={record.documentName}>
              <div
                style={{
                  textDecorationLine: "underline",
                  cursor: "pointer",
                  width: 130,
                }}
              >
                <div
                  className={classes.clickableField}
                  onClick={() => toggleDocViewDrawer(record)}
                  style={{
                    whiteSpace: "normal", // Adjusted to wrap text
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  ref={refElementForAllDocument3}
                >
                  {record.documentName}
                </div>
              </div>
            </Tooltip>
          ) : (
            <Tooltip title={record.documentName}>
              <>{record.documentName}</>
            </Tooltip>
          );
        }
        return record.action ? (
          <Tooltip title={record.documentName}>
            <div
              style={{
                textDecorationLine: "underline",
                cursor: "pointer",
                width: 130,
              }}
            >
              <div
                className={classes.clickableField}
                onClick={() => toggleDocViewDrawer(record)}
                style={{
                  whiteSpace: "normal", // Adjusted to wrap text
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {record.documentName}
              </div>
            </div>
          </Tooltip>
        ) : (
          <Tooltip title={record.documentName}>
            <>{record.documentName}</>
          </Tooltip>
        );
      },
    },
    {
      title: "Document Type",
      dataIndex: "docType",
      width: 150,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record.docType}
          </div>
        </div>
      ),
      filterIcon: (filtered: any) =>
        isFilterType ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }: any) => {
        return (
          <div style={{ padding: 8 }}>
            {filterList?.doctype?.map((name: any) => (
              <div key={name}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedDocType([...selectedDocType, value]);
                      } else {
                        setselectedDocType(
                          selectedDocType.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={name}
                    checked={selectedDocType.includes(name)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedDocType.length === 0}
                onClick={() => {
                  setfilterType(true);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedDocType([]);
                  setfilterType(false);
                  fetchDocuments();
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },

    {
      title: "System",
      dataIndex: "system",
      width: 50,
      render: (_, record) => {
        return <MultiUserDisplay data={record.system} name="name" />;
      },
      filterIcon: (filtered: any) =>
        isFilterSystem ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }) => {
        return (
          <div
            style={{
              padding: 8,
            }}
          >
            {filterList?.system?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedSystem([...selectedSystem, value]);
                      } else {
                        setselectedSystem(
                          selectedSystem.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedSystem.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedSystem.length === 0}
                onClick={() => {
                  setfilterSystem(true);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedSystem([]);
                  setfilterSystem(false);
                  fetchDocuments();
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Issue - Version",
      dataIndex: "version",
      key: "version",
      render: (_: any, record: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          {record.issueNumber} - {record.version}
        </div>
      ),
      // sorter: (a, b) => a.version - b.version,
    },
    {
      title: "Status",
      dataIndex: "docStatus",
      key: "docStatus",
      render: (_: any, record: any) => {
        if (record.docStatus === "Approved") {
          return (
            <Tag
              style={{ backgroundColor: "#7cbf3f" }}
              key={record.docStatus}
              className={classes.statusTag}
            >
              {record.docStatus}
            </Tag>
          );
        } else if (record.docStatus === "For Review") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.docStatus}
              className={classes.statusTag}
            >
              In Review
            </Tag>
          );
        } else if (record.docStatus === "Review Complete") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.docStatus}
              className={classes.statusTag}
            >
              {record.docStatus}
            </Tag>
          );
        } else if (record.docStatus === "For Approval") {
          return (
            <Tag
              style={{ backgroundColor: "#FB8500" }}
              key={record.docStatus}
              className={classes.statusTag}
            >
              {/* {record.docStatus} */}
              In Approval
            </Tag>
          );
        } else if (record.docStatus === "Amend") {
          return (
            <Tag
              style={{ backgroundColor: "#D62DB1" }}
              color="yellow"
              key={record.docStatus}
            >
              {record.docStatus}
            </Tag>
          );
        } else if (record.docStatus === "Published") {
          return (
            <Tag
              style={{ backgroundColor: "#7CBF3F" }}
              key={record.docStatus}
              className={classes.statusTag}
            >
              {record.docStatus}
            </Tag>
          );
        } else if (record.docStatus === "Draft") {
          return (
            <Tag
              style={{ backgroundColor: "#0075A4" }}
              key={record.docStatus}
              className={classes.statusTag}
            >
              {record.docStatus}
            </Tag>
          );
        } else if (record.docStatus === "Send For Edit") {
          return (
            <Tag
              style={{ backgroundColor: "#0075A4" }}
              key={record.docStatus}
              className={classes.statusTag}
            >
              {`Sent For Edit`}
            </Tag>
          );
        } else if (record.status === "Retire - In Review") {
          return (
            <Tag
              color="#0075A4"
              key={record.status}
              className={classes.statusTag}
            >
              {"Retire Review"}
            </Tag>
          );
        } else if (record.docStatus === "Retire - In Approval") {
          return (
            <Tag color="#FB8500" key={record.docStatus}>
              {"Retire Approval"}
            </Tag>
          );
        } else if (record.docStatus === "Obsolete") {
          return (
            <Tag color="#003566" key={record.docStatus}>
              {record.docStatus}
            </Tag>
          );
        } else return record.docStatus;
      },
      // Check if tabFilter is not equal to "distributedDoc" before rendering the filter
      ...(tabFilter !== "distributedDoc" && {
        filterIcon: (filtered: any) =>
          isFilterStatus ? (
            <FilterFilled style={{ fontSize: "16px", color: "black" }} />
          ) : (
            <FilterOutlined style={{ fontSize: "16px" }} />
          ),
        filterDropdown: ({ confirm, clearFilters }: any) => {
          return (
            <div style={{ padding: 8 }}>
              {filterList?.status
                ?.filter((name: any) => name !== "PUBLISHED")
                ?.map((name: any) => (
                  <div key={name}>
                    <label style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (e.target.checked) {
                            setSelectedStatus([...selectedStatus, value]);
                          } else {
                            setSelectedStatus(
                              selectedStatus.filter((key: any) => key !== value)
                            );
                          }
                        }}
                        value={name}
                        checked={selectedStatus.includes(name)} // Check if the checkbox should be checked
                        style={{
                          width: "16px",
                          height: "16px",
                          marginRight: "5px",
                        }}
                      />
                      {name}
                    </label>
                  </div>
                ))}
              <div style={{ marginTop: 8 }}>
                <Button
                  type="primary"
                  disabled={selectedStatus.length === 0}
                  onClick={() => {
                    setfilterStatus(true);
                    handleChangePageNew(1, 10);
                  }}
                  style={{
                    marginRight: 8,
                    backgroundColor: "#E8F3F9",
                    color: "black",
                  }}
                >
                  Apply
                </Button>
                <Button
                  onClick={() => {
                    setSelectedStatus([]);
                    setfilterStatus(false);
                    fetchDocuments();
                    confirm();
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          );
        },
      }),
    },
    {
      title: "Pending with",
      dataIndex: "pendingWith",
      key: "pendingWith",
      render: (_, record) => {
        return <MultiUserDisplay data={record.pendingWith} name="userName" />;
      },

      filterIcon: (filtered: any) =>
        selectedMyPending?.length > 0 ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }) => {
        return (
          <div
            style={{
              padding: 8,
              maxHeight: 200, // Set the maximum height of the container
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            {filterList?.pendingWith?.map((item: any) => (
              <div key={item.userId}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedMyPending([...selectedMyPending, value]);
                      } else {
                        setselectedMyPending(
                          selectedMyPending.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.userId}
                    checked={selectedMyPending.includes(item.userId)}
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {`${item.firstname} ${item?.lastname}`}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedMyPending.length === 0}
                onClick={() => {
                  setIsFilterMyPending(!isFilterMyPending);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedMyPending([]);
                  fetchDocuments();
                  setIsFilterMyPending(!isFilterMyPending);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
      // render: (_: any, record: any) => record?.approvedDate || "",
      // sorter: (a, b) => a.department - b.department,
    },
    // {tabFilter==="inWorkflow"&&{}}
    {
      title: "Dept/Vertical",
      dataIndex: "department",
      key: "department",
      width: 100,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record.department}
          </div>
        </div>
      ),
      filterIcon: (filtered: any) =>
        selectedMyDept?.length > 0 ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }) => {
        return (
          <div
            style={{
              padding: 8,
              maxHeight: 200, // Set the maximum height of the container
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            {filterList?.entity?.map((item: any) => (
              <div key={item.id}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setselectedMyDept([...selectedMyDept, value]);
                      } else {
                        setselectedMyDept(
                          selectedMyDept.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedMyDept.includes(item.id)}
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedMyDept.length === 0}
                onClick={() => {
                  setfilterMyDept(!isFilterMyDept);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setselectedMyDept([]);
                  fetchDocuments();
                  setfilterMyDept(!isFilterMyDept);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
      // sorter: (a, b) => a.department - b.department,
    },
    {
      title: "Corp Func/Unit",
      dataIndex: "location",
      key: "location",
      width: 150,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 100,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record.location}
          </div>
        </div>
      ),
      // sorter: (a, b) => a.location - b.location,
    },
    {
      title: "Section",
      dataIndex: "sectionName",
      key: "sectionName",
      filterIcon: (filtered: any) =>
        isFilterMySection ? (
          <FilterFilled style={{ fontSize: "16px", color: "black" }} />
        ) : (
          <FilterOutlined style={{ fontSize: "16px" }} />
        ),
      filterDropdown: ({ confirm, clearFilters }) => {
        return (
          <div
            style={{
              padding: 8,
              maxHeight: 200, // Set the maximum height of the container
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            {filterList?.section?.map((item: any) => (
              <div key={item}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedMySection([...selectedMySection, value]);
                      } else {
                        setSelectedMySection(
                          selectedMySection.filter((key: any) => key !== value)
                        );
                      }
                    }}
                    value={item.id}
                    checked={selectedMySection.includes(item.id)} // Check if the checkbox should be checked
                    style={{
                      width: "16px",
                      height: "16px",
                      marginRight: "5px",
                    }}
                  />
                  {item.name}
                </label>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                disabled={selectedMySection.length === 0}
                onClick={() => {
                  setFilerMySection(true);
                  handleChangePageNew(1, 10);
                }}
                style={{
                  marginRight: 8,
                  backgroundColor: "#E8F3F9",
                  color: "black",
                }}
              >
                Apply
              </Button>
              <Button
                onClick={() => {
                  setSelectedMySection([]);
                  fetchDocuments();
                  setFilerMySection(false);
                  confirm();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      title: "Action",
      // fixed: "right",
      dataIndex: "isAction",
      key: "isAction",
      width: 100,
      render: (_: any, record: any) =>
        !record.isVersion && (
          <>
            {record.editAcess && matches ? (
              // <Tooltip title="Click to Amend">
              <IconButton
                className={classes.actionButtonStyle}
                data-testid="action-item"
                onClick={() => handleEditProcessDoc(record)}
                style={{ color: iconColor }}
              >
                <CustomEditIcon width={18} height={18} />
              </IconButton>
            ) : (
              // </Tooltip>
              ""
            )}
            <Divider type="vertical" className={classes.docNavDivider} />
            {record.deleteAccess ? (
              <IconButton
                className={classes.actionButtonStyle}
                data-testid="action-item"
                onClick={() => handleOpen(record.id)}
                style={{ color: iconColor }}
              >
                <CustomDeleteICon width={18} height={18} />
              </IconButton>
            ) : (
              ""
            )}
          </>
        ),
    },
  ];

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
  const subColumns: ColumnsType<any> = [
    {
      title: "Document Number",
      dataIndex: "documentNumbering",
      key: "documentNumbering",
      width: 180,
      render: (_: any, record: any) => record.documentNumbering || "",
    },
    {
      title: "Title",
      dataIndex: "documentName",
      key: "documentName",
      width: 150,
      // sorter: (a, b) => a.documentName - b.documentName,
      render: (_: any, record: any) =>
        record.access ? (
          <div
            style={{
              textDecorationLine: "underline",
              cursor: "pointer",
              width: 250,
            }}
          >
            <div
              className={classes.clickableField}
              onClick={() => toggleDocViewDrawer(record)}
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {record.documentName}
            </div>

            {/* <a            href={`http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/processdocuments/processdocument/viewprocessdocument/${record.id}`}            target="_blank"            rel="noreferrer"            className={classes.clickableField}          >            old {record.documentName}          </a> */}
          </div>
        ) : (
          <Tooltip title={record.documentName}>
            <>{record.documentName}</>
          </Tooltip>
        ),

      // if (record.action) {
      //   <div
      //     style={{
      //       textDecorationLine: "underline",
      //       cursor: "pointer",
      //     }}
      //   >
      //     <div
      //       className={classes.clickableField}
      //       onClick={() => toggleDocViewDrawer(record)}
      //     >
      //       {record.documentName}
      //     </div>
      //     <a
      //       href={`http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/processdocuments/processdocument/viewprocessdocument/${record.id}`}
      //       target="_blank"
      //       rel="noreferrer"
      //       className={classes.clickableField}
      //     >
      //       {record.documentName}
      //     </a>
      //   </div>;
      // } else {
      //   <div
      //     style={{
      //       textDecorationLine: "underline",
      //       cursor: "pointer",
      //     }}
      //   >
      //     <div
      //       className={classes.clickableField}
      //       // onClick={() => toggleDocViewDrawer(record)}
      //     >
      //       {record.documentName}
      //     </div>
      //     {/* <a
      //       href={`http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/processdocuments/processdocument/viewprocessdocument/${record.id}`}
      //       target="_blank"
      //       rel="noreferrer"
      //       className={classes.clickableField}
      //     >
      //       {record.documentName}
      //     </a> */}
      //   </div>;
      // }
    },
    {
      title: "Document Type",
      dataIndex: "documentType",
      width: 150,
      render: (_: any, record: any) => (
        <div
          style={{
            width: 150,
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {record.documentType}
          </div>
        </div>
      ),
      // filterIcon: (filtered: any) => (
      //   <FilterListIcon
      //     style={{
      //       fill: isFilterType ? iconColor : "grey",
      //       width: "0.89em",
      //       height: "0.89em",
      //     }}
      //   />
      // ),

      // filterDropdown: ({ confirm, clearFilters }: any) => {
      //   // Create a set to store unique names
      //   const uniqueNames = new Set();

      //   // Iterate through allAuditPlanDetails and add unique names to the set
      //   data?.forEach((item: any) => {
      //     const name = item.docType;
      //     uniqueNames.add(name);
      //   });

      //   // Convert the set back to an array for rendering
      //   const uniqueNamesArray = Array.from(uniqueNames);

      //   return (
      //     <div style={{ padding: 8 }}>
      //       {uniqueNamesArray.map((name: any) => (
      //         <div key={name}>
      //           {console.log(
      //             "checked",
      //             selectedDocType.includes(name),
      //             selectedDocType,
      //             name
      //           )}
      //           <label style={{ display: "flex", alignItems: "center" }}>
      //             <input
      //               type="checkbox"
      //               onChange={(e) => {
      //                 const value = e.target.value;
      //                 if (e.target.checked) {
      //                   setselectedDocType([...selectedDocType, value]);
      //                 } else {
      //                   setselectedDocType(
      //                     selectedDocType.filter((key: any) => key !== value)
      //                   );
      //                 }
      //               }}
      //               value={name}
      //               checked={selectedDocType.includes(name)} // Check if the checkbox should be checked
      //               style={{
      //                 width: "16px",
      //                 height: "16px",
      //                 marginRight: "5px",
      //               }}
      //             />
      //             {name}
      //           </label>
      //         </div>
      //       ))}
      //       <div style={{ marginTop: 8 }}>
      //         <Button
      //           type="primary"
      //           disabled={selectedDocType.length === 0}
      //           onClick={() => {
      //             let url = formatDashboardQuery(`/api/dashboard/`, {
      //               ...searchValues,
      //               documentTypes: selectedDocType,
      //               page: page,
      //               limit: rowsPerPage,
      //             });
      //             fetchDocuments(url);
      //             setfilterType(true);
      //           }}
      //           style={{
      //             marginRight: 8,
      //             backgroundColor: "#E8F3F9",
      //             color: "black",
      //           }}
      //         >
      //           Apply
      //         </Button>
      //         <Button
      //           onClick={() => {
      //             setselectedDocType([]);
      //             fetchDocuments();
      //             setfilterType(false);
      //             confirm();
      //           }}
      //         >
      //           Reset
      //         </Button>
      //       </div>
      //     </div>
      //   );
      // },
    },

    {
      title: "Issue - Version",
      dataIndex: "version",
      key: "version",
      width: 150,
      render: (_: any, record: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          {record.issueNumber} - {record.version}
        </div>
      ),
      // sorter: (a, b) => a.version - b.version,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_: any, record: any) => {
        if (record.status === "APPROVED") {
          return (
            <Tag
              style={{ backgroundColor: "#7cbf3f" }}
              key={record.status}
              className={classes.statusTag}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "IN_REVIEW") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.status}
              className={classes.statusTag}
            >
              In Review
            </Tag>
          );
        } else if (record.status === "REVIEW_COMPLETE") {
          return (
            <Tag
              style={{ backgroundColor: "#F2BB00" }}
              key={record.status}
              className={classes.statusTag}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "IN_APPROVAL") {
          return (
            <Tag
              style={{ backgroundColor: "#FB8500" }}
              key={record.status}
              className={classes.statusTag}
            >
              {/* {record.docStatus} */}
              In Approval
            </Tag>
          );
        } else if (record.status === "AMMEND") {
          return (
            <Tag
              style={{ backgroundColor: "#D62DB1" }}
              color="yellow"
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "PUBLISED") {
          return (
            <Tag
              style={{ backgroundColor: "#7CBF3F" }}
              key={record.status}
              className={classes.statusTag}
            >
              Published
            </Tag>
          );
        } else if (record.status === "DRAFT") {
          return (
            <Tag
              style={{ backgroundColor: "#0075A4" }}
              key={record.status}
              className={classes.statusTag}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "SEND_FOR_EDIT") {
          return (
            <Tag
              style={{ backgroundColor: "#0075A4" }}
              key={record.status}
              className={classes.statusTag}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "Retire - In Review") {
          return (
            <Tag
              color="#0075A4"
              key={record.status}
              className={classes.statusTag}
            >
              {"Retire Review"}
            </Tag>
          );
        } else if (record.docStatus === "Retire - In Approval") {
          return (
            <Tag color="#FB8500" key={record.docStatus}>
              {"Retire Approval"}
            </Tag>
          );
        } else if (record.status === "OBSOLETE") {
          return (
            <Tag
              color="#003566"
              key={record.status}
              className={classes.statusTag}
            >
              OBSOLETE
            </Tag>
          );
        } else return record.status;
      },
    },
    {
      title: "Published Date",
      dataIndex: "approvedDate",
      key: "approvedDate",
      render: (_: any, record: any) => formatDate(record?.approvedDate) || "",
      // sorter: (a, b) => a.department - b.department,
    },

    {
      title: "Action",
      // fixed: "right",
      dataIndex: "isAction",
      key: "isAction",
      width: 100,
      render: (_: any, record: any) =>
        !record.isVersion && (
          <>
            {record.editAcess && matches ? (
              // <Tooltip title="Click to Amend">
              <IconButton
                className={classes.actionButtonStyle}
                data-testid="action-item"
                onClick={() => handleEditProcessDoc(record)}
                style={{ color: iconColor }}
              >
                <CustomEditIcon width={18} height={18} />
              </IconButton>
            ) : (
              // </Tooltip>
              ""
            )}
            <Divider type="vertical" className={classes.docNavDivider} />
            {record.deleteAccess ? (
              <IconButton
                className={classes.actionButtonStyle}
                data-testid="action-item"
                onClick={() => handleOpen(record.id)}
                style={{ color: iconColor }}
              >
                <CustomDeleteICon width={18} height={18} />
              </IconButton>
            ) : (
              ""
            )}
          </>
        ),
    },
  ];

  const getData = async () => {
    try {
      let res = await axios.get(
        `api/documents/filerValueNew?locationId=${searchValues?.locationName.id}`
      );
      setLocation(res.data.locations);
      setEntity(res.data.entity);
      setSystem(res.data.allSystems);
      setUser(res.data.allUser);
      setDocument(res.data.allDoctype);
    } catch (err) {}
  };

  const handleMouseEnter = (record: any) => {
    setHoveredRow(record.id);
  };

  const handleMouseLeave = () => {
    setHoveredRow(null);
  };

  const handleFetchDocuments = () => {
    // window.location.reload();

    fetchDocuments();
    if (!!isGraphSectionVisible) {
      fetchChartData();
    }
  };

  const rowClassName = (record: any, index: number) => {
    return index % 2 === 0
      ? classes.alternateRowColor1
      : classes.alternateRowColor2;
  };
  const expandIcon = ({ expanded, onExpand, record }: any) => {
    const icon = expanded ? <MinusCircleOutlined /> : <PlusCircleOutlined />;
    if (record?.documentVersions?.length > 0) {
      return <a onClick={(e) => onExpand(record, e)}>{icon}</a>;
    }
    return null;
  };
  return (
    <div>
      <div style={{}}>
        <FilterPopOver
          open={filterOpen}
          setOpen={setFilterOpen}
          resultText={count ? `Showing ${count} Result(s)` : ``}
          handleApply={handleApply}
          handleDiscard={() => {}}
          searchValues={searchValues}
          matches={matches}
          // refElementForAllDocument5={ refElementForAllDocument5}
        >
          <div className={classes.filterBody}>
            <div className={classes.filterDate}>
              <div className={classes.topSection}>
                <div className={classes.publishedDateContainer}>
                  Published Date
                </div>
                <div>
                  <Tooltip title={"Reload"}>
                    <IconButton
                      data-testid="reset-button"
                      onClick={() => {
                        handleDiscard();
                        // setPrimaryfilterReload(true);
                      }}
                      style={{ padding: "0px" }}
                    >
                      <img src={ReloadIcon} alt="reload" width={18} />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
              <div>
                <FilterDatepicker
                  dateFields={handleSearchChange}
                  searchValues={searchValues}
                />
              </div>
            </div>
            <Divider className={classes.dottedDividerStyle} />
            {/* <div className={classes.filterWhere}>Where</div> */}
            <div className={classes.filterFieldRow}>
              <Box className={classes.boxStyle}>
                {/* <AutoComplete
                suggestionList={location}
                name={"Corp Func/Unit"}
                keyName={"locationName"}
                formData={searchValues}
                setFormData={setSearch}
                // getSuggestionList={getSuggestionListLocation}
                labelKey={"locationName"}
           
                defaultValue={
                  searchValues.location?.locationName
                  // userDetailsforFilter.location !== null &&
                  // searchValues.searchQuery === ""
                  //   ? userDetailsforFilter.location
                  //   : ""
                }
                multiple={false}
              /> */}
                <Autocomplete
                  options={[{ id: "All", locationName: "All" }, ...location]}
                  value={searchValues?.locationName}
                  getOptionLabel={(option: any) => option.locationName}
                  getOptionSelected={(option: any, value: any) =>
                    option?.id === value?.id
                  }
                  onChange={(_, value) => {
                    setSearch({ locationName: value });
                    setUnitId(value.id);
                    setSelectedDept(null);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label={"Corp Func/Unit"}
                      placeholder={"sample text"}
                      size="small"
                    />
                  )}
                />
              </Box>
            </div>
            <div className={classes.filterFieldRow}>
              <Box className={classes.boxStyle}>
                {/* <AutoComplete
                  suggestionList={[{ id: "All", entityName: "All" }, ...entity]}
                  name={"Entity Name"}
                  keyName={"department"}
                  formData={searchValues}
                  setFormData={setSearch}
                  getSuggestionList={() => {}}
                  labelKey={"entityName"}
                  defaultValue={searchValues.department?.entityName}
                  disabled={
                    searchValues?.locationName?.id === "All" ? true : false
                  }
                  multiple={false}
                /> */}
                <DepartmentSelector
                  locationId={unitId}
                  selectedDepartment={selectedDept}
                  onSelect={(dept, type) => {
                    setSelectedDept({ ...dept, type });
                    setSearch({
                      ...searchValues,
                      department: {
                        id: dept.id,
                        entityName: dept.name,
                      },
                    });
                  }}
                  onClear={() => setSelectedDept(null)}
                />
              </Box>
            </div>
            <div className={classes.filterFieldRow}>
              <Box className={classes.boxStyle}>
                <AutoComplete
                  suggestionList={user}
                  name={"Creator Name"}
                  keyName={"creator"}
                  formData={searchValues}
                  setFormData={setSearch}
                  getSuggestionList={() => {}}
                  labelKey="username"
                  multiple={false}
                  defaultValue={searchValues.creator?.username}
                />
              </Box>
            </div>

            <div
              className={
                matches ? classes.filterFieldRow : classes.filterFieldRowMobile
              }
            >
              <Box className={classes.boxStyle}>
                <AutoComplete
                  suggestionList={system}
                  name={"System Name"}
                  keyName={"system"}
                  formData={searchValues}
                  setFormData={setSearch}
                  getSuggestionList={() => {}}
                  labelKey="name"
                  defaultValue={searchValues.system?.name}
                  multiple={false}
                />
              </Box>
              <Box className={classes.boxStyle}>
                <AutoComplete
                  suggestionList={document}
                  name={"Document Type"}
                  keyName={"documentType"}
                  formData={searchValues}
                  setFormData={setSearch}
                  getSuggestionList={() => {}}
                  labelKey="documentTypeName"
                  multiple={false}
                  defaultValue={searchValues.documentType?.documentTypeName}
                />
              </Box>
            </div>
          </div>
        </FilterPopOver>
      </div>

      <SearchBar
        placeholder="Search Document"
        name="searchQuery"
        values={searchValues}
        handleChange={handleSearchChange}
        handleApply={handleApply}
        endAdornment={true}
        handleClickDiscard={handleClickDiscard}
      />
      {
        isTableDataLoading ? (
          <Box
            marginY="auto"
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="40vh"
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box
              style={{
                width: "100%",
                backgroundColor: "#E8F3F9",
                height: "54 px",
              }}
              // className={classes.graphContainer}
            ></Box>
            {matches ? (
              ""
            ) : (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-evenly",
                  width: "100%",
                  // height: "100vh",
                  overflowY: "scroll",
                  marginBottom: "40px",
                }}
              >
                {data?.map((record: any) => (
                  <div
                    style={{
                      border: "1px solid black",
                      borderRadius: "5px",
                      padding: "5px",
                      margin: "10px",
                      width: smallScreen ? "45%" : "100%",
                    }}
                  >
                    <p
                      onClick={() => toggleDocViewDrawer(record)}
                      style={{
                        padding: "3px 10px",
                        backgroundColor: "#9FBFDF",
                        borderRadius: "2px",
                        cursor: "pointer",
                      }}
                    >
                      {record?.documentName}
                    </p>
                    <p
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      Doc Number : <span>{record?.docNumber}</span>
                    </p>
                    <p>Type : {record.docType}</p>
                    <p
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                      }}
                    >
                      Issue - Version :{" "}
                      <span
                        style={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                        }}
                      >
                        {record.issueNumber} - {record.version}
                      </span>
                    </p>

                    {tabFilter === "myDoc" ||
                    tabFilter === "myFavDocs" ||
                    tabFilter === "inWorkflow" ? (
                      <p>Status : {record.docStatus} </p>
                    ) : (
                      ""
                    )}

                    {tabFilter === "allDoc" ||
                    tabFilter === "distributedDoc" ? (
                      <p>Published Date:{record?.approvedDate || ""}</p>
                    ) : (
                      ""
                    )}

                    {/* {record.actionItem.length > 0 ? (
                          <Accordion className={classes.headingRoot}>
                            <AccordionSummary
                              expandIcon={
                                <ExpandMoreIcon style={{ padding: "3px" }} />
                              }
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                              className={classes.summaryRoot}
                              style={{ margin: "0px", height: "10px" }}
                            >
                              Action Items
                            </AccordionSummary>
                            <AccordionDetails
                              className={classes.headingRoot}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              {data?.actionItem?.map((record: any) => (
                                <div>
                                  <p
                                    onClick={() => toggleDocViewDrawer(record)}
                                    style={{
                                      textDecorationLine: "underline",
                                      cursor: "pointer",
                                      margin: "5px 3px",
                                    }}
                                  >
                                    {record.documentName}
                                  </p>
                                </div>
                              ))}
                            </AccordionDetails>
                          </Accordion>
                        ) : (
                          ""
                        )} */}
                  </div>
                ))}
              </div>
            )}
            <div className={classes.pagination}>
              <Pagination
                size="small"
                current={page}
                pageSize={rowsPerPage}
                total={count}
                showTotal={
                  selectedMyPending?.length > 0 ? undefined : showTotal
                }
                showSizeChanger
                showQuickJumper
                onChange={(page, pageSize) => {
                  handleChangePageNew(page, pageSize);
                }}
              />
            </div>
            {matches ? (
              <div
                data-testid="custom-table"
                className={classes.tableContainer}
              >
                <Table
                  columns={
                    tabFilter === "inWorkflow"
                      ? columnsforInFlow
                      : tabFilter === "myDoc"
                      ? myDocumentColumns
                      : tabFilter === "allDoc"
                      ? allColumns
                      : columns
                  }
                  dataSource={data}
                  pagination={false}
                  size="middle"
                  rowKey={"id"}
                  // bordered
                  expandedRowKeys={expandedRows}
                  onExpandedRowsChange={setExpandedRows}
                  expandable={{
                    // expandIcon: ({ expanded, onExpand, record }: any) => {
                    //   if (record.children && record.children.length > 0) {
                    //     return expanded ? (
                    //       <KeyboardArrowDownRoundedIcon
                    //         className={classes.groupArrow}
                    //         onClick={(e: any) => onExpand(record, e)}
                    //       />
                    //     ) : (
                    //       <ChevronRightRoundedIcon
                    //         className={classes.groupArrow}
                    //         onClick={(e: any) => onExpand(record, e)}
                    //       />
                    //     );
                    //   }
                    //   return null;
                    // },
                    expandedRowRender: (record: any) => {
                      if (tabFilter == "myDoc")
                        return (
                          <Table
                            className={classes.subTableContainer}
                            style={{
                              width: 1200,
                              paddingBottom: "20px",
                              paddingTop: "20px",
                            }}
                            columns={subColumns}
                            bordered
                            dataSource={record?.documentVersions}
                            pagination={false}
                          />
                        );
                    },
                    expandIcon,
                  }}
                  className={classes.documentTable}
                  // rowClassName={rowClassName}
                  onRow={(record) => ({
                    onMouseEnter: () => handleMouseEnter(record),
                    onMouseLeave: handleMouseLeave,
                  })}
                />
              </div>
            ) : (
              ""
            )}

            <ConfirmDialog
              open={open}
              handleClose={handleClose}
              handleDelete={handleDelete}
            />
          </>
        )

        // : (
        //   <>
        //     <div className={classes.emptyTableImg}>
        //       <img
        //         src={EmptyTableImg}
        //         alt="No Data"
        //         height="400px"
        //         width="300px"
        //       />
        //     </div>
        //     <Typography align="center" className={classes.emptyDataText}>
        //       Let’s begin by adding a Document
        //     </Typography>
        //   </>
        // )
      }

      <div>
        {!!drawer.open && (
          <DocumentDrawer
            drawer={drawer}
            setDrawer={setDrawer}
            handleFetchDocuments={handleFetchDocuments}
          />
        )}
      </div>
      <div>
        {!!docViewDrawer.open && (
          <DocumentViewDrawer
            docViewDrawer={docViewDrawer}
            setDocViewDrawer={setDocViewDrawer}
            toggleDocViewDrawer={toggleDocViewDrawer}
            handleFetchDocuments={handleFetchDocuments}
          />
        )}
      </div>
    </div>
  );
}

export default DocumentTable;
