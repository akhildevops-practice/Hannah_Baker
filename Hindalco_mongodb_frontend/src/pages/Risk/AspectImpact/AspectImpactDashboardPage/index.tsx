import {
  Col,
  Row,
  Space,
  Table,
  Select,
  Form,
  Typography,
  Card,
  Button,
  Tooltip,
  DatePicker,
  Pagination,
  Breadcrumb,
  Modal,
  message,
} from "antd";
import type { PaginationProps } from "antd";
import axios from "apis/axios.global";
import { useEffect, useState } from "react";
import getSessionStorage from "utils/getSessionStorage";
import useStyles from "./style";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import CategoryDonughtChart from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactDashboard/CategoryDonughtChart";
import AspectTrendLineChart from "components/Risk/AspectImpact/AspectImpactRegister/AspectImpactDashboard/AspectTrendLineChart";
import { Paper, useMediaQuery } from "@material-ui/core";
import AspImpGraphSection from "./AspImpGraphSection";
import AspImpTableSection from "./AspImpTableSection";
import AspectImpactDrawer from "./AspectImpactDrawer";
import { FilterTwoTone } from "@ant-design/icons";
import DashboardFilterModal from "components/Dashboard/DashboardFilterModal";
import RotateLeftIcon from "@material-ui/icons/RotateLeft";
import AspImpCountSection from "./AspImpCountSection";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { ReactComponent as FilterIcon } from "assets/documentControl/Filter.svg";
import { FileExcelTwoTone } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment";

const { RangePicker } = DatePicker;

function isEmptyObj(obj: any) {
  return Object.keys(obj).length === 0;
}

function arrayToQueryString(key: any, array: any) {
  if (array && array.length > 0) {
    return array
      .map((item: any) => `${key}[]=${encodeURIComponent(item)}`)
      .join("&");
  }
  return "";
}

const calculateIfSignificant = (rowData: any) => {
  if (rowData?.legalImpact === "Yes") {
    return true;
  } else if (rowData?.interestedParties?.length) {
    return true;
  } else {
    if (rowData?.mitigations && rowData?.mitigations?.length) {
      if (rowData?.postMitigationScore >= 9 || rowData?.postSeverity >= 3) {
        return true;
      }
    } else {
      if (rowData?.preMitigationScore >= 9 || rowData?.preSeverity >= 3) {
        return true;
      }
    }
  }
};

const generateQueryString = (
  isPrimaryFilterParam: any = true,
  defaultFilter: any = false,
  selectedEntity: string,
  selectedLocation: string,
  formData: any,
  selectedDateRange: any,
  userDetails: any
) => {
  let entityQueryString = "",
    unitQueryString = "";

  if (!defaultFilter) {
    if (selectedEntity && selectedEntity !== "All") {
      entityQueryString = arrayToQueryString("entity", [selectedEntity]);
    }
    if (selectedLocation && selectedLocation !== "All") {
      unitQueryString = arrayToQueryString("unit", [selectedLocation]);
    }
  } else {
    entityQueryString = arrayToQueryString("entity", [userDetails?.entity?.id]);
    unitQueryString = arrayToQueryString("unit", [userDetails?.location?.id]);
  }


  let queryStringParts: any = [];
  if (isPrimaryFilterParam) {
    queryStringParts = [
      entityQueryString,
      unitQueryString,
    ].filter((part) => part.length > 0);
    queryStringParts.push(`isPrimaryFilter=true`);
    if (selectedDateRange?.fromDate && selectedDateRange?.toDate) {
      queryStringParts.push(
        `fromDate=${selectedDateRange?.fromDate}&toDate=${selectedDateRange?.toDate}`
      );
    }
  }
    else {
      const fallbackEntityQuery = arrayToQueryString("entity", [userDetails?.entity?.id]);
      const fallBackLocationQuery = arrayToQueryString("unit", [userDetails?.location?.id]);
      if (fallbackEntityQuery) {
        queryStringParts.push(fallbackEntityQuery);
      }
      if (fallBackLocationQuery) {
        queryStringParts.push(fallBackLocationQuery);
      }
    }

  queryStringParts.push(`organizationId=${userDetails?.organizationId}`);

  return queryStringParts.join("&");
};

const showTotalForAll: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;

const AspectImpactDashboardPage = () => {
  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:470px)");
  const [impactGroupedData, setImpactGroupedData] = useState<any>([]);
  const [aspectGroupedData, setAspectGroupedData] = useState<any>([]);

  const [topTenData, setTopTenData] = useState<any>([]);

  //form states
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);

  const [jobTitleOptions, setJobTitleOptions] = useState<any>([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState<any>("All");

  const [businessTypeOptions, setBusinessTypeOptions] = useState<any>([]);
  const [selectedBusinessType, setSelectedBusinessType] =
    useState<any>(undefined);

  const [businessOptions, setBusinessOptions] = useState<any>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(undefined);

  const [functionOptions, setFunctionOptions] = useState<any>([]);
  const [selectedFunction, setSelectedFunction] = useState<any>(undefined);

  const [selectedDateRange, setSelectedDateRange] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const [isDefaultFilter, setIsDefaultFilter] = useState<any>(true);
  const [tableFilters, setTableFilters] = useState<any>({});
  const [paginationForAll, setPaginationForAll] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [tableData, setTableData] = useState<any>([]);
  const [riskId, setRiskId] = useState<any>("");
  const [formType, setFormType] = useState<string>("create");
  const [tableDataLoading, setTableDataLoading] = useState<any>(false);
  const [aspImpDrawerOpen, setAspImpDrawerOpen] = useState<any>(false);
  const [filterModal, setFilterModal] = useState<any>({
    open: false,
  });
  const [activeTab, setActiveTab] = useState<any>(null);
  const [isPrimaryFilter, setIsPrimaryFilter] = useState<any>(true);

  const userDetails = getSessionStorage();
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [filterForm] = Form.useForm();
  const [tags, setTags] = useState<any>([]);
  const [tagsWithoutDeptFilter, setTagsWithoutDeptFilter] = useState<any>([]);
  const [countObject, setCountObject] = useState<any>({});
  const [showTableModal, setShowTableModal] = useState<any>(false);
  const [disableDept, setDisableDept] = useState<any>(false);
  const [consolidatedCountTableData, setConsolidatedCountTableData] = useState<any>([]);
  console.log("setAspectGroupedData", aspectGroupedData);
  useEffect(() => {
    filterForm?.setFieldsValue({
      unit: userDetails?.location?.id,
      entity: userDetails?.entity?.id,
    });
    setTags([
      {
        tagName: `Unit : ${userDetails?.location?.locationName}`,
        color: "blue",
      },
      {
        tagName: `Department : ${userDetails?.entity?.entityName}`,
        color: "orange",
      },
    ]);
    setTagsWithoutDeptFilter([
      {
        tagName: `Unit : ${userDetails?.location?.locationName}`,
        color: "blue",
      },
      {
        tagName: `Department : ${userDetails?.entity?.entityName}`,
        color: "orange",
      },
    ]);
    setSelectedEntity(userDetails?.entity?.id);
    setSelectedLocation(userDetails?.location?.id);
    getLocationOptions();
    getDepartmentOptions(userDetails?.location?.id);
    // fetchAllJobTitles(userDetails?.entity?.id);
    // getBusinessTypeOptions();
    // getBusinessOptions();
    // getFunctionOptions();
    fetchAspImpDashboardCounts(false, true);
    getImpactGroupedData(false, true);
    getAspectGroupedData(false, true);
    getTop10AspImp(true);
    fetchAspImpConslidatedCount();
  }, []);

  useEffect(() => {
    console.log("checkdashboard tableFilters", tableFilters);
    if (!isEmptyObj(tableFilters)) {
      setPaginationForAll({
        current: 1,
        pageSize: 10,
        total: 0,
      });
      getTableDataBasedOnFilters(true, 1, 10);
    }
  }, [tableFilters]);

  const handleResetFilters = (values: any) => {
    setPaginationForAll({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    setDisableDept(false);
    setTags([
      {
        tagName: `Unit : ${userDetails?.location?.locationName}`,
        color: "blue",
      },
      {
        tagName: `Department : ${userDetails?.entity?.entityName}`,
        color: "orange",
      },
    ]);
    setTagsWithoutDeptFilter([
      {
        tagName: `Unit : ${userDetails?.location?.locationName}`,
        color: "blue",
      },
      {
        tagName: `Department : ${userDetails?.entity?.entityName}`,
        color: "orange",
      },
    ]);
    filterForm?.setFieldsValue({
      // jobTitle: undefined,
      entity: userDetails?.entity?.id,
      unit: userDetails?.location?.id,
      // businessTypes: undefined,
      // business: undefined,
      // function: undefined,
    });
    setSelectedLocation(userDetails?.location?.id);
    setSelectedEntity(userDetails?.entity?.id);
    setSelectedDateRange(null);
    setIsDefaultFilter(true);
    getImpactGroupedData(false, true);
    getAspectGroupedData(false, true);
    fetchAspImpDashboardCounts(false, true);
    getTop10AspImp(true);
  };

  const getTableDataBasedOnFilters = async (
    isPrimaryFilterParam: any = true,
    page: any = 1,
    pageSize: any = 10
  ) => {
    try {
      let entityQueryString = "",
        unitQueryString = "";
      setTableDataLoading(true);
      if (!isDefaultFilter) {
        if(selectedEntity !== "All") {
          entityQueryString = arrayToQueryString("entity", [selectedEntity]);
        }
        if(selectedLocation !== "All") {
          unitQueryString = arrayToQueryString("unit", [selectedLocation]);
        }
      } else {
        entityQueryString = arrayToQueryString("entity", [
          userDetails?.entity?.id,
        ]);
        unitQueryString = arrayToQueryString("unit", [
          userDetails?.location?.id,
        ]);
      }
      let jobTitleQueryString = "";
      if (!formData?.jobTitle?.includes("All")) {
        // Check if jobTitle includes 'All'
        jobTitleQueryString = arrayToQueryString(
          "jobTitle",
          formData?.jobTitle
        );
      }

      let queryStringParts = [];

      queryStringParts = [
        jobTitleQueryString,
        entityQueryString,
        unitQueryString,
      ].filter((part) => part.length > 0);

      if (selectedDateRange?.fromDate && selectedDateRange?.toDate) {
        queryStringParts.push(
          `fromDate=${selectedDateRange?.fromDate}&toDate=${selectedDateRange?.toDate}`
        );
      }

      queryStringParts.push(`organizationId=${userDetails?.organizationId}`);

      // console.log("checkdashboard tableFilters in getTableDataBasedOnFilters", tableFilters);
      

      // Handle tableFilters
      if (!isEmptyObj(tableFilters)) {
        if (tableFilters.impactType) {
          queryStringParts.push(
            `impactType=${encodeURIComponent(tableFilters.impactType)}`
          );
        }
      }

      let queryString = queryStringParts.join("&");
      const res = await axios.get(
        `/api/aspect-impact/getTableDataBasedOnFilters?${queryString}&page=${page}&pageSize=${pageSize}`
      );
      console.log("checkdashboard getall ai table data", res.data);
      if (res?.status === 200) {
        if (!!res?.data?.list && !!res?.data?.list?.length) {
          const tblData = res?.data?.list.map((obj: any) => ({
            id: obj._id,
            sNo: obj.sNo,
            highlight: false,
            jobTitle: obj?.jobTitle || "",
            activity: obj?.activity || "",
            createdBy: obj?.createdBy || "",
            createdAt: obj?.createdAt || "",
            hiraConfigId: obj?.hiraConfigId || {},
            // dateOfIdentification: obj.dateOfIdentification || "",
            entityId: obj?.entityId || "",
            locationId: obj?.locationId || "",
            significanceScore: obj?.significanceScore || "",
            status: obj?.status || "",
            entity: !!obj.entity ? obj.entity.entityName : "",
            closeDate: obj?.closeDate || "",
            preMitigation: obj?.preMitigation || [],
            postMitigation: obj?.postMitigation || [],
            preMitigationScore: obj?.preMitigationScore || 0,
            postMitigationScore: obj?.postMitigationScore || 0,
            selectedAspectType: obj?.selectedAspectTypes || null,
            selectedCondition: obj?.selectedConditions || null,
            selectedImpactType: obj?.selectedImpactTypes || null,
            interestedParties: obj?.interestedParties || [],
            preSeverity: obj?.preSeverity || "",
            preProbability: obj?.preProbability || "",
            createdByUserDetails: obj?.createdByUserDetails || null,
            postSeverity: obj?.postSeverity,
            postProbability: obj?.postProbability,
            legalImpact: obj?.legalImpact || "",
            specificEnvAspect: obj?.specificEnvAspect || "",
            specificEnvImpact: obj?.specificEnvImpact || "",
            mitigations: obj.mitigations?.map((mitigationObj: any) => ({
              ...mitigationObj,
              jobTitle: mitigationObj.title,
              id: mitigationObj._id,
              riskId: obj._id,
              createdBy: obj.createdBy,
              status: mitigationObj.status == "true" ? "OPEN" : "CLOSED",
              type: true,
            })),
            prefixSuffix: obj?.prefixSuffix || "",

            // children: obj.mitigations?.map((mitigationObj: any) => ({
            //   ...mitigationObj,
            //   jobTitle: mitigationObj.title,
            //   id: mitigationObj._id,
            //   riskId: obj._id,
            //   createdBy: obj.createdBy,
            //   status: mitigationObj.status == "true" ? "OPEN" : "CLOSED",
            //   type: true,
            // })),
          }));
          setTableData(tblData);
          setPaginationForAll((prev) => ({
            ...prev,
            total: res.data.total,
          }));
          setShowTableModal(true);
          setTableDataLoading(false);
        } else {
          setTableData([]);
          setPaginationForAll((prev) => ({ ...prev, total: 0 }));

          setTableDataLoading(false);
        }
      } else {
        setTableData([]);
        setPaginationForAll((prev) => ({ ...prev, total: 0 }));

        setTableDataLoading(false);
        console.log("Error in getAllHiraTableDataBasedOnFilter", res.data);
      }
    } catch (error) {
      setTableDataLoading(false);
    }
  };

  const getTableDataBasedOnFiltersForExcel = async () => {
    try {
      let entityQueryString = "",
        unitQueryString = "";
  
      if (!isDefaultFilter) {
        entityQueryString = arrayToQueryString("entity", formData?.entity);
        unitQueryString = arrayToQueryString("unit", formData?.unit);
      } else {
        entityQueryString = arrayToQueryString("entity", [userDetails?.entity?.id]);
        unitQueryString = arrayToQueryString("unit", [userDetails?.location?.id]);
      }
  
      let jobTitleQueryString = "";
      if (!formData?.jobTitle?.includes("All")) {
        jobTitleQueryString = arrayToQueryString("jobTitle", formData?.jobTitle);
      }
  
      let queryStringParts = [jobTitleQueryString, entityQueryString, unitQueryString].filter(
        (part) => part.length > 0
      );
  
      if (selectedDateRange?.fromDate && selectedDateRange?.toDate) {
        queryStringParts.push(
          `fromDate=${selectedDateRange?.fromDate}&toDate=${selectedDateRange?.toDate}`
        );
      }
  
      queryStringParts.push(`organizationId=${userDetails?.organizationId}`);
  
      // Handle tableFilters
      if (!isEmptyObj(tableFilters)) {
        if (tableFilters.impactType) {
          queryStringParts.push(`impactType=${encodeURIComponent(tableFilters.impactType)}`);
        }
      }
  
      let queryString = queryStringParts.join("&");
  
      // Fetch data
      const res = await axios.get(
        `/api/aspect-impact/getTableDataBasedOnFilters?${queryString}&pagination=false`
      );
  
      if (res?.status === 200 && res?.data?.list?.length) {
        const formattedData = res.data.list.map((obj: any) => ({
          id: obj._id,
          sNo: obj.sNo,
          jobTitle: obj?.jobTitle || "",
          activity: obj?.activity || "",
          createdBy: obj?.createdBy || "",
          createdAt: obj?.createdAt || "",
          entity: !!obj.entity ? obj.entity.entityName : "",
          locationId: obj?.locationId || "",
          significanceScore: obj?.significanceScore || "",
          status: obj?.status || "",
          closeDate: obj?.closeDate || "",
          preMitigationScore: obj?.preMitigationScore || 0,
          postMitigationScore: obj?.postMitigationScore || 0,
          selectedAspectType: obj?.selectedAspectTypes || null,
          selectedCondition: obj?.selectedConditions || null,
          selectedImpactType: obj?.selectedImpactTypes || null,
          interestedParties: obj?.interestedParties || [],
          preSeverity: obj?.preSeverity || "",
          preProbability: obj?.preProbability || "",
          postSeverity: obj?.postSeverity,
          postProbability: obj?.postProbability,
          legalImpact: obj?.legalImpact || "",
          specificEnvAspect: obj?.specificEnvAspect || "",
          specificEnvImpact: obj?.specificEnvImpact || "",
        }));
  
        return { list: formattedData, total: res.data.total };
      }
  
      return { list: [], total: 0 };
    } catch (error) {
      return { list: [], total: 0 };
    }
  };
  

  const handleChangePageNewForAll = (page: number, pageSize: number) => {
    // console.log("checkrisk page", page, pageSize);
    setPaginationForAll((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize,
    }));
    getTableDataBasedOnFilters(true, page, pageSize);
  };

  const getLocationOptions = async () => {
    try {
      const res = await axios.get(
        `/api/aspect-impact/getAllLocation/${userDetails?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        console.log("checkrisk res in getAllLocation", res);
        if (res?.data?.data && !!res.data.data.length) {
          setLocationOptions([
            ...[{ value: "All", label: "All" }],
            ...res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.locationName,
            })),
          ]);
        } else {
          setLocationOptions([]);
          enqueueSnackbar("No Locations Found", {
            variant: "warning",
          });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getAllLocation", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };

  const getDepartmentOptions = async (locationId: any = "") => {
    try {
      const res = await axios.get(
        `/api/aspect-impact/getAllDepartmentsByLocation/${locationId}`
      );

      if (res.status === 200 || res.status === 201) {
        console.log("checkrisk res in getAllDepartmentsByLocation", res);
        if (res?.data?.data && !!res.data.data.length) {
          setDepartmentOptions([
            ...[{ value: "All", label: "All" }],
            ...res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.entityName,
            })),
          ]);
        } else {
          setDepartmentOptions([]);
          enqueueSnackbar("No Departments Found", {
            variant: "warning",
          });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getAllDepartmentsByLocation", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };

  const fetchAspImpDashboardCounts = async (
    isPrimaryFilterParam: any = true,
    defaultFilter: any = false
  ) => {
    try {
      let entityQueryString = "",
        unitQueryString = "",
        jobTitleQueryString = "",
        queryStringParts: any = [];
      if (defaultFilter) {
        entityQueryString = arrayToQueryString("entity", [
          userDetails?.entity?.id,
        ]);
        unitQueryString = arrayToQueryString("unit", [
          userDetails?.location?.id,
        ]);
        queryStringParts = [entityQueryString, unitQueryString].filter(
          (part) => part.length > 0
        );
      } else {
        if (selectedEntity && selectedEntity !== "All") {
          entityQueryString = arrayToQueryString("entity", [selectedEntity]);
        }
        if (selectedLocation && selectedLocation !== "All") {
          unitQueryString = arrayToQueryString("unit", [selectedLocation]);
        }
        // console.log("checkdashboard formDATA in hazardgraph", formData);
        if (isPrimaryFilterParam) {
          queryStringParts = [
            jobTitleQueryString,
            entityQueryString,
            unitQueryString,
          ].filter((part) => part.length > 0);
          queryStringParts.push(`isPrimaryFilter=true`);
          if (selectedDateRange?.fromDate && selectedDateRange?.toDate) {
            queryStringParts.push(
              `fromDate=${selectedDateRange?.fromDate}&toDate=${selectedDateRange?.toDate}`
            );
          }
        } else {
          if (
            activeTab === 0 ||
            activeTab === 2 ||
            activeTab === 4 ||
            activeTab === 6 ||
            activeTab === 8 ||
            activeTab === 10
          ) {
            queryStringParts.push(
              `entityId=${encodeURIComponent(userDetails?.entity?.id)}`
            );
          }
          if (
            activeTab === 1 ||
            activeTab === 3 ||
            activeTab === 5 ||
            activeTab === 7 ||
            activeTab === 9 ||
            activeTab === 11
          ) {
            queryStringParts.push(
              `locationId=${encodeURIComponent(userDetails?.location?.id)}`
            );
          }
        }
      }
      console.log("query string parts--.", queryStringParts);

      const queryString = queryStringParts.join("&");
      const res = await axios.get(
        `/api/aspect-impact/fetchAspImpDashboardCounts/${userDetails?.organizationId}?${queryString}`
      );
      if (res?.status === 200) {
        setCountObject(res.data);
      } else {
        console.log("Error in fetchOverallStatusCounts");
      }
    } catch (error) {
      console.log("Error in fetchOverallStatusCounts", error);
    }
  };

  const getImpactGroupedData = async (
    isPrimaryFilterParam: any = true,
    defaultFilter: any = false
  ) => {
    try {
      const queryString = generateQueryString(
        isPrimaryFilterParam,
        defaultFilter,
        selectedEntity || userDetails?.entity?.id,
        selectedLocation || userDetails?.location?.id,
        formData,
        selectedDateRange,
        userDetails
      );
      console.log(
        "checkdashboardnew queryString in getImpactGroupedData",
        queryString
      );

      const res = await axios.get(
        `/api/aspect-impact/getGroupedImpactDashboard?${queryString}`
      );
      console.log("checkdashboardnew data in getImpactGroupedData", res.data);
      if (res?.status === 200) {
        if (!!res.data?.impactTypeCounts?.length) {
          setImpactGroupedData(res.data?.impactTypeCounts);
        } else {
          setImpactGroupedData([]);
        }
      } else {
        console.log("Error in getImpactGroupedData", res);
        setImpactGroupedData([]);
      }
    } catch (error) {
      setImpactGroupedData([]);

      console.log("Error in getImpactGroupedData", error);
    }
  };

  const getAspectGroupedData = async (
    isPrimaryFilterParam: any = true,
    defaultFilter: any = false
  ) => {
    try {
      // Use the existing query string generator function
      const queryString = generateQueryString(
        isPrimaryFilterParam,
        defaultFilter,
        selectedEntity || userDetails?.location?.id,
        selectedLocation || userDetails?.entity?.id,
        formData,
        selectedDateRange,
        userDetails
      );

      const res = await axios.get(
        `/api/aspect-impact/getGroupedAspectDashboard?${queryString}`
      );

      if (res.status === 200) {
        console.log("checka res for dashboard aspect data", res);
        setAspectGroupedData(res.data);
      } else {
        console.log("Error in getAspectGroupedData", res);
        setAspectGroupedData([]);
      }
    } catch (error) {
      console.error("Error in getAspectGroupedData", error);
      setAspectGroupedData([]);
    }
  };

  const fetchAspImpConslidatedCount = async () => {
    try {

      const res = await axios.get(
        `/api/aspect-impact/fetchAspImpConslidatedCount/${userDetails?.organizationId}`
      );
      // console.log("checkdashboardnew data in fetchAspImpConslidatedCount", res.data);
      if (res?.status === 200) {
        if (!!res.data?.length) {
          setConsolidatedCountTableData(res.data);
        } else {
          setConsolidatedCountTableData([]);
        }
      } else {
        // console.log("Error in fetchAspImpConslidatedCount", res);
        setConsolidatedCountTableData([]);
      }
    } catch (error) {
      setConsolidatedCountTableData([]);

      // console.log("Error in fetchAspImpConslidatedCount", error);
    }
  };

  //based on post mitigation score, (will list only asp imps whose post mitigation score is greater than 0)
  const getTop10AspImp = async (defaultFilter: any = false) => {
    try {
      let entityQueryString = "",
        unitQueryString = "";
      let queryStringParts = [];
      if (!defaultFilter) {
        if (selectedEntity) {
          entityQueryString = arrayToQueryString("entity", [selectedEntity]);
        }
        if (selectedLocation) {
          unitQueryString = arrayToQueryString("unit", [selectedLocation]);
        }
      } else {
        entityQueryString = arrayToQueryString("entity", [
          userDetails?.entity?.id,
        ]);
        unitQueryString = arrayToQueryString("unit", [
          userDetails?.location?.id,
        ]);
      }

      // Create jobTitleQueryString conditionally
      let jobTitleQueryString = "";
      if (!formData?.jobTitle?.includes("All")) {
        // Check if jobTitle includes 'All'
        jobTitleQueryString = arrayToQueryString(
          "jobTitle",
          formData?.jobTitle
        );
      }

      queryStringParts = [
        jobTitleQueryString,
        entityQueryString,
        unitQueryString,
      ].filter((part) => part.length > 0);
      queryStringParts.push(`isPrimaryFilter=true`);
      if (selectedDateRange?.fromDate && selectedDateRange?.toDate) {
        queryStringParts.push(
          `fromDate=${selectedDateRange?.fromDate}&toDate=${selectedDateRange?.toDate}`
        );
      }
      queryStringParts.push(`organizationId=${userDetails?.organizationId}`);

      const queryString = queryStringParts.join("&");
      const res = await axios.get(
        `/api/aspect-impact/getTopTenAspImp?${queryString}`
      );
      if (res.status === 200) {
        console.log("checka res for dashboard impact data getTop10AspImp", res);
        if (!!res.data.length) {
          setTopTenData(res.data);
        } else {
          setTopTenData([]);
        }
      }
    } catch (error) {}
  };

  const handleClickFetch = (values: any) => {
    setIsPrimaryFilter(true);
    let usedTags: any = [];
    if (selectedLocation) {
      const locationName = locationOptions.find(
        (option: any) => option.value === selectedLocation
      )?.label;
      usedTags = [
        ...usedTags,
        { tagName: `Unit : ${locationName}`, color: "orange" },
      ];
    }

    if (selectedEntity) {
      const entityName = departmentOptions.find(
        (option: any) => option.value === selectedEntity
      )?.label;
      usedTags = [
        ...usedTags,
        { tagName: `Department : ${entityName}`, color: "blue" },
      ];
    }
    if(!selectedEntity) {
      setSelectedEntity("All")
      usedTags = [
        ...usedTags,
        { tagName: `Department : All`, color: "blue" },
      ]
    }
    if(!selectedLocation) {
      setSelectedLocation("All")
      setSelectedEntity("All")
      usedTags = [
        ...usedTags,
        { tagName: `Unit : All`, color: "orange" },
        { tagName: `Department : All`, color: "blue" },
      ]
    }
    setTags(usedTags);
    // if (selectedLocation && selectedEntity) {
      setIsDefaultFilter(false);
      getImpactGroupedData(true, false);
      getAspectGroupedData(true, false);
      fetchAspImpDashboardCounts(true, false);
      getTop10AspImp(false);
    // }
  };

  const handleLocationChange = (value: any) => {
    if (value !== "All") {
      setSelectedLocation(value);
      setSelectedEntity(undefined);
      getDepartmentOptions(value);
      setDisableDept(false);
    } else {
      setSelectedLocation(value);
      setSelectedEntity("All");
      setDisableDept(true);
    }
  };
  const handleDepartmentChange = (value: any) => {
    setSelectedEntity(value);
  };

  // mobile view filter moda.

  const [isModalOpenMobileFilter, setIsModalOpenMobileFilter] = useState(false);

  const showModalMobileFilter = () => {
    setIsModalOpenMobileFilter(true);
  };

  const handleOkMobileFilter = () => {
    setIsModalOpenMobileFilter(false);
  };

  const handleCancelMobileFilter = () => {
    setIsModalOpenMobileFilter(false);
  };
  const exportToExcel = async () => {
    const { list: tableData } = await getTableDataBasedOnFiltersForExcel();

    if (!tableData || tableData.length === 0) {
      message.warning("No Aspect & Impact data to export.");
      return;
    }

    const dataForExcel = tableData.map((item: any) => ({
      "S.No": item.sNo || "N/A",
      "Life Cycle Stage": item.jobTitle || "N/A",
      Activities: item.activity || "N/A",
      "Aspect Type": item.selectedAspectType?.name || "N/A",
      "Specific Env. Aspect": item.specificEnvAspect || "N/A",
      "Impact Type": item.selectedImpactType?.name || "N/A",
      "Specific Env. Impact": item.specificEnvImpact || "N/A",
      Condition: item.selectedCondition?.name || "N/A",
      "Legal Impact": item.legalImpact === "Yes" ? "Yes" : "No",
      "Dept/Vertical": item.entity || "N/A",
      "P (Pre)": item.preProbability ?? "N/A",
      "S (Pre)": item.preSeverity ?? "N/A",
      "Pre Score": item.preMitigationScore ?? "N/A",
      "P (Post)": item.postProbability ?? "N/A",
      "S (Post)": item.postSeverity ?? "N/A",
      "Post Score": item.postMitigationScore ?? "N/A",
      Significant: calculateIfSignificant(item) ? "Yes" : "No",
      "Created On": item.createdAt
        ? moment(item.createdAt).format("DD-MM-YYYY")
        : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);

    // Set all columns to width 30
    worksheet["!cols"] = new Array(Object.keys(dataForExcel[0]).length).fill({
      wch: 30,
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Aspect & Impact Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "binary",
    });

    const s2ab = (s: string) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
      return buf;
    };

    const data = new Blob([s2ab(excelBuffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, "Aspect_Impact_Data.xlsx");
  };
  
  
  return (
    <>
      <div>
        {matches ? (
          <div
            style={{
              // cursor: "pointer",
              // position: "absolute",
              // top: "10px",
              // right: "35px",
              fontSize: "20px",
              color: "black !important",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {/* <FilterTwoTone
              width={25}
              height={21}
              style={{ marginRight: "5px" }}
            /> */}
            <Breadcrumb separator="  ">
              <Breadcrumb.Item>
                <span style={{ color: "black" }}>Unit:</span>
                <Select
                  showSearch
                  allowClear
                  placeholder="Select Unit"
                  onClear={() => setSelectedLocation(undefined)}
                  value={selectedLocation}
                  style={{
                    width: 280,
                    marginLeft: 8,
                    border: "1px solid black",
                    borderRadius: "5px",
                  }}
                  onChange={handleLocationChange}
                  optionFilterProp="children"
                  filterOption={(input: any, option: any) =>
                    (option?.children ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {locationOptions.map((option: any) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <span>Department:</span>
                <Select
                  showSearch
                  allowClear
                  onClear={() => setSelectedEntity(undefined)}
                  placeholder="Select Department"
                  disabled={disableDept}
                  value={selectedEntity}
                  style={{
                    width: 320,
                    marginLeft: 8,
                    border: "1px solid black",
                    borderRadius: "5px",
                  }}
                  onChange={handleDepartmentChange}
                  optionFilterProp="children"
                  filterOption={(input: any, option: any) =>
                    (option?.children ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {departmentOptions.map((option: any) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Breadcrumb.Item>
            </Breadcrumb>
            <Button
              type="primary"
              onClick={handleClickFetch}
              style={{
                width: "70px",
                backgroundColor: "rgb(0, 48, 89)",
                marginLeft: "5px",
                height: "28px",
                lineHeight: "16px",
              }}
            >
              Apply
            </Button>
            <Button
              type="text"
              onClick={handleResetFilters}
              style={{
                width: "40px",
                display: "flex",
                justifyContent: "center",
                height: "32px",
              }}
              icon={<RotateLeftIcon />}
            />
          </div>
        ) : null}
        <AspImpCountSection
          countObject={countObject}
          isLoading={false}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDefaultFilter={isDefaultFilter}
        />
        <AspImpGraphSection
          formData={formData}
          impactGroupedData={impactGroupedData}
          aspectGroupedData={aspectGroupedData}
          topTenData={topTenData}
          tableFilters={tableFilters}
          setTableFilters={setTableFilters}
          tags={tags}
          tagsWithoutDeptFilter={tagsWithoutDeptFilter}
          consolidatedCountTableData={consolidatedCountTableData}
        />
        <br />
        <Modal
          title=""
          open={showTableModal}
          width={"auto"}
          footer={null}
          onCancel={() => setShowTableModal(false)}
          closeIcon={
            <img
              src={CloseIconImageSvg}
              alt="close-drawer"
              style={{
                width: "30px",
                height: "38px",
                cursor: "pointer",
                marginTop: "-5px",
              }}
            />
          }
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "12px 20px",
            }}
          >
            <Button
              type="primary"
              onClick={exportToExcel}
              icon={<FileExcelTwoTone />}
            >
              Download Excel
            </Button>
          </div>
          <AspImpTableSection
            tableData={tableData}
            handleChangePageNewForAll={handleChangePageNewForAll}
            paginationForAll={paginationForAll}
            showTotalForAll={showTotalForAll}
            setFormType={setFormType}
            setRiskId={setRiskId}
            setAspImpDrawerOpen={setAspImpDrawerOpen}
          />
        </Modal>
        {aspImpDrawerOpen && (
          <AspectImpactDrawer
            addModalOpen={aspImpDrawerOpen}
            setAddModalOpen={setAspImpDrawerOpen}
            riskId={riskId}
            formType={formType}
          />
        )}
      </div>
      {matches ? (
        ""
      ) : (
        <div
          style={{
            paddingTop: "3px",
            position: "absolute",
            top: 82,
            right: 30,
          }}
        >
          <FilterIcon
            style={{ width: "24px", height: "24px" }}
            onClick={showModalMobileFilter}
          />
        </div>
      )}

      <Modal
        title={
          <div
            style={{
              backgroundColor: "#E8F3F9",
              padding: "8px",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
            }}
          >
            Filter By
          </div>
        }
        open={isModalOpenMobileFilter}
        onOk={handleOkMobileFilter}
        onCancel={handleCancelMobileFilter}
        // className={classes.modal}
        footer={null}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "30px",
              cursor: "pointer",
              padding: "0px",
              margin: "7px 15px 0px 0px",
            }}
          />
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
            // marginTop: "20px",
            // border: "1px solid rgba(19, 171, 155, 0.5)",
            // borderRadius: "12px",
            // padding: "20px",
            // margin: "20px 20px 10px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <span style={{ color: "black" }}>Unit:</span>

            <Select
              showSearch
              allowClear
              placeholder="Select Unit"
              onClear={() => setSelectedLocation(undefined)}
              value={selectedLocation}
              style={{
                width: matches ? 280 : "100%",
                // marginLeft: 8,
                border: "1px solid black",
                borderRadius: "5px",
              }}
              onChange={handleLocationChange}
              optionFilterProp="children"
              filterOption={(input: any, option: any) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {locationOptions.map((option: any) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <span>Department:</span>

            <Select
              showSearch
              allowClear
              onClear={() => setSelectedEntity(undefined)}
              placeholder="Select Department"
              value={selectedEntity}
              style={{
                width: matches ? 320 : "100%",
                // marginLeft: matches  8,
                border: "1px solid black",
                borderRadius: "5px",
              }}
              onChange={handleDepartmentChange}
              optionFilterProp="children"
              filterOption={(input: any, option: any) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {departmentOptions.map((option: any) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <Button
              type="primary"
              onClick={handleClickFetch}
              style={{
                width: "70px",
                backgroundColor: "rgb(0, 48, 89)",
                marginLeft: "5px",
                height: "28px",
                lineHeight: "16px",
              }}
            >
              Apply
            </Button>
            <Button
              type="text"
              onClick={handleResetFilters}
              style={{
                width: "40px",
                display: "flex",
                justifyContent: "center",
                height: "32px",
              }}
              icon={<RotateLeftIcon />}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AspectImpactDashboardPage;
