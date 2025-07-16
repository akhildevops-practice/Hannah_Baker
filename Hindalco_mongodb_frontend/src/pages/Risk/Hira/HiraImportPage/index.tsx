import {
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  TextareaAutosize,
} from "@material-ui/core";
import checkRoles from "utils/checkRoles";
import { roles } from "utils/enums";
import getSessionStorage from "utils/getSessionStorage";
import { ReactComponent as OrgSettingsIcon } from "assets/moduleIcons/module-setting.svg";
import useStyles from "pages/Risk/Hira/HiraRegisterPagev2/style";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import { ReactComponent as SignificantIcon } from "assets/icons/significantIcon.svg";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import type { DescriptionsProps, UploadProps } from "antd";
import InboxIcon from "@material-ui/icons/Inbox";

import {
  Button,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Pagination,
  Popover,
  Select,
  Table as AntdTable,
  Tooltip,
  Typography,
  Upload,
  Modal,
  Radio,
  Spin,
} from "antd";
import {
  // Button,
  // IconButton,
  // Paper,
  TableRow,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  // Tooltip,
  TableHead,
  TextField,
  Grid,
  // Typography,
  makeStyles,
} from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "apis/axios.global";
import { useSnackbar } from "notistack";
import RiskScoreModal from "components/Risk/Hira/HiraRegister/RiskScoreModal";
import { isValid } from "utils/validateInput";
import { validateTitleForHiraImport } from "utils/validateInput";

const { Dragger } = Upload;

const useStylesTable = makeStyles((theme) => ({
  tableContainer: {
    maxHeight: 440,
    overflow: "auto",
  },
  table: {
    minWidth: 650,
  },
  tableHead: {
    backgroundColor: "#e8f3f9",
  },
  tableHeadCell: {
    fontWeight: "bold",
    position: "sticky",
    top: 0,
    backgroundColor: "#E8F3F9",
    zIndex: 1,
  },
  textArea: {
    width: "100%",
    minHeight: "60px",
    padding: theme.spacing(1),
    border: "1px solid #ced4da",
    borderRadius: "4px",
    "&:focus": {
      outline: "none",
      border: `2px solid black`,
    },
  },
  sticky: {
    position: "sticky",
    right: 0,
    background: "white",
    // boxShadow: "5px 2px 5px grey",
    borderLeft: "2px solid #fafafa",
  },
  hazardSelectStyle: {
    width: "100%",
    minWidth: "180px",
    maxWidth: "250px", // Set a maximum width
    overflow: "hidden", // Hide overflow
    textOverflow: "ellipsis", // Show ellipsis for overflow
    whiteSpace: "nowrap", // No wrapping of text to a new line
  },
  uploadSection: {
    border: `1px dashed ${theme.palette.primary.main}`,
    borderRadius: "4px",
    backgroundColor: "#fafafa",
    padding: theme.spacing(2),
    textAlign: "center",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f0f0f0",
    },
  },
  dragIcon: {
    color: theme.palette.primary.main,
    fontSize: "32px",
  },
  uploadText: {
    marginTop: "2px",
    // marginBottom: ,
    color: "blue",
  },
  disabledSelect: {
    "& .ant-select-disabled .ant-select-selector": {
      backgroundColor: "white !important",
      background: "white !important",
      color: "black !important",
      border: "none",
    },
    "& .ant-select-disabled .ant-select-selection-item": {
      color: "black !important",
    },
    "& .ant-select-disabled .ant-select-arrow": {
      display: "none",
    },
  },
  hiraImportForm: {
    "& .ant-upload-wrapper .ant-upload-select": {
      width: "100% !important",
    },
  },
}));
const HiraImportPage = () => {
  const userDetails = getSessionStorage();
  const classes = useStyles();
  const classes1 = useStylesTable();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isMR = checkRoles(roles.MR);
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;
  const [hiraHeaderForm] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const [hiraHeaderFormData, setHiraHeaderFormData] = useState<any>(null); //this will be used to save form details of hira header
  const [areaOptions, setAreaOptions] = useState<any>([]);
  const [sectionOptions, setSectionOptions] = useState<any>([]);
  const [riskTypeOptions, setRiskTypeOptions] = useState<any>([]);
  const [conditionOptions, setConditionOptions] = useState<any>([]);
  const [locationWiseUsers, setLocationWiseUsers] = useState<any>([]);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [existingRiskConfig, setExistingRiskConfig] = useState<any>(null);
  const [hazardTypeOptions, setHazardTypeOptions] = useState<any>([]);

  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const [riskScoreModal, setRiskScoreModal] = useState<any>({
    open: false,
    data: {},
  });
  const [editingKeys, setEditingKeys] = useState<any>([]);

  const isEditing = (key: any) => editingKeys.includes(key);
  // const isEditing = (record: any) =>
  // record?.key === editingKey || record?.id === editingKey;

  const [data, setData] = useState<any>([]);
  const [sheetNames, setSheetNames] = useState<any>([]); // State for the sheet names
  const [selectedSheetName, setSelectedSheetName] = useState<any>(""); // State for the selected sheet name
  const [selectedStepsStartingFromRow, setSelectedStepsStartingFromRow] =
    useState<any>(0); // State for the starting row
  const [isValidatHiraFileApiCalled, setIsValidatHiraFileApiCalled] =
    useState<any>(false);
  const [selectedResponsiblePerson, setSelectedResponsiblePerson] =
    useState<any>("");
  const [isSheetLoading, setIsSheetLoading] = useState<any>(false);
  const [importModal, setImportModal] = useState<any>({ open: false });
  const [fileList, setFileList] = useState<any>([]);
  const scrollRef = useRef<any>(null); // Ref for auto-scroll
  const [validationWarning, setValidationWarning] = useState<any>("");
  const [showResidualRiskWarning, setShowResidualRiskWarning] =
    useState<any>(false);
  const [hasInvalidScores, setHasInvalidScores] = useState<any>(false);
  const [hasResidualRiskIssue, setHasResidualRiskIssue] = useState<any>(false);
  const [pendingSaveRow, setPendingSaveRow] = useState<any>(null);
  const [isSaveAllTriggered, setIsSaveAllTriggered] = useState<any>(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          getHazardTypeOptions(),
          fetchHiraConfig(),
          getAllLocations(),
          getAllDepartmentsByLocation(userDetails?.location?.id),
          getAllAreaMaster(userDetails?.location?.id),
          getSectionOptions(userDetails?.entity?.id),
          fetchUsersByLocation(),
        ]);
      } catch (error) {
        console.error("Error loading data", error);
        enqueueSnackbar("Failed to load data", { variant: "error" });
      }
      setLoading(false);
    };

    loadData();
    setHiraHeaderFormData({
      entityId: userDetails?.entity?.id,
      locationId: userDetails?.location?.id,
    });
    hiraHeaderForm?.setFieldsValue({
      entityId: userDetails?.entity?.id,
      locationId: userDetails?.location?.id,
    });
  }, []);

  useEffect(() => {
    if (isValidatHiraFileApiCalled && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isValidatHiraFileApiCalled]);

  const handleSheetNameChange = (e: any) => {
    setSelectedSheetName(e?.target?.value);
  };

  const handleStepsRowChange = (value: any) => {
    setSelectedStepsStartingFromRow(value);
  };

  const uploadProps: UploadProps = {
    multiple: false, // Set to true to allow multiple file uploads
    beforeUpload: () => false,
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        console.log("checkimport fileList", fileList);
        setFileList(fileList); // Set the entire file list instead of a single file
      }
    },
    onRemove: (file) => {
      // if (!!existingFiles && existingFiles.length > 0) {
      //   setExistingFiles((prevState: any) =>
      //     prevState.filter((f: any) => f.uid !== file.uid)
      //   ); // Update the existingFiles state to remove the specific fil
      // }
      setFileList((prevState: any) =>
        prevState.filter((f: any) => f.uid !== file.uid)
      ); // Remove the specific file from the list
    },
    // fileList: formData?.file && formData.file.uid ? [formData.file] : [],
  };

  const handleLocationChange = (value: any) => {
    setSelectedLocation(value);
    setSelectedEntity("");
    getAllAreaMaster(value);
    getAllDepartmentsByLocation(value);
  };

  const getAllDepartmentsByLocation = async (locationId: any = "") => {
    try {
      const res = await axios.get(
        `/api/aspect-impact/getAllDepartmentsByLocation/${locationId}`
      );

      if (res.status === 200 || res.status === 201) {
        // console.log("checkriskimport res in getAllDepartments", res);
        if (res?.data?.data && !!res.data.data.length) {
          setDepartmentOptions(
            res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.entityName,
            }))
          );
        } else {
          setDepartmentOptions([]);
          enqueueSnackbar("No Departments Found", {
            variant: "warning",
          });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getAllDepartments", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("checkriskimport error in fetching all job title", error);
    }
  };

  const getSectionOptions = async (entityId: any) => {
    try {
      const res = await axios.get(
        `api/business/getAllSectionsForEntity/${entityId}`
      );

      // console.log("checkriskimport res in getHazardTypeOptions", res);
      if (res.status === 200) {
        if (res?.data && !!res?.data?.length) {
          const sectionOptions = res?.data?.map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
          setSectionOptions(sectionOptions);
        } else {
          setSectionOptions([]);

          // enqueueSnackbar("No Sections found for selected Dept/Vertical", {
          //   variant: "warning",
          // });
        }
      } else {
        setSectionOptions([]);

        enqueueSnackbar("Something went wrong while fetching Sections", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while fetching Sections", {
        variant: "error",
      });
      // console.log("checkriskimport error in getHiraTypesOptions ", error);
    }
  };

  const getAllLocations = async () => {
    try {
      const res = await axios.get(
        `/api/aspect-impact/getAllLocation/${userDetails?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        // console.log("checkriskimport res in getAllDepartments", res);
        if (res?.data?.data && !!res.data.data.length) {
          setLocationOptions(
            res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.locationName,
            }))
          );
        } else {
          setLocationOptions([]);
          enqueueSnackbar("No Departments Found", {
            variant: "warning",
          });
        }
      } else {
        // setJobTitleOptions([]);
        enqueueSnackbar("Error in fetching getAllDepartments", {
          variant: "error",
        });
      }
    } catch (error) {
      // console.log("checkriskimport error in fetching all job title", error);
    }
  };

  const fetchUsersByLocation = async () => {
    const locationId = userDetails.locationId || "";
    try {
      // setIsLoading(true);
      const res = await axios.get(
        `/api/riskregister/users/${userDetails?.organizationId}`
      );
      // console.log("checkriskimport res", res);
      if (res.status === 200 || res.status === 201) {
        if (!!res.data && res.data.length > 0) {
          const userOptions = res.data.map((user: any) => ({
            userId: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            value: user.id,
            label: user.email,
            email: user.email,
            id: user.id,
            fullname: user.firstname + " " + user.lastname,
            // label : user.firstname + " " + user.lastname,
            // // name : user.firstname + " " + user.lastname,
            // value : user.id,
          }));
          setLocationWiseUsers(userOptions);
          // setIsLoading(false);
        } else {
          setLocationWiseUsers([]);
          // setIsLoading(false);
        }
      } else {
        setLocationWiseUsers([]);
        // setIsLoading(false);
      }
    } catch (error) {
      // setIsLoading(false);
      // console.log("errror in fetching users based on location", error);
    }
  };

  const fetchHiraConfig = async () => {
    try {
      const res = await axios.get(
        `/api/riskconfig/getHiraConfig/${userDetails?.organizationId}`
      );
      // console.log("check res", res);
      if (res.status === 200 || res.status === 201) {
        if (!!res.data && !!res.data.length) {
          const data = res.data[0];
          setExistingRiskConfig({
            ...data,
            riskIndicatorData:
              data?.riskLevelData.map((item: any) => ({
                ...item,
                color: item.riskIndicator.split("-")[1],
              })) || [],
          });
          const riskTypeOptions = data?.riskType?.map((riskType: any) => ({
            label: riskType.name,
            value: riskType._id,
          }));
          const conditionOptions = data?.condition?.map((riskType: any) => ({
            label: riskType.name,
            value: riskType._id,
          }));
          setConditionOptions(conditionOptions);
          setRiskTypeOptions(riskTypeOptions);
        } else {
          setExistingRiskConfig(null);
        }
      }
    } catch (error) {
      // console.log("errror in fetch config", error);
    }
  };

  const getHazardTypeOptions = async () => {
    try {
      const res = await axios.get(
        `api/riskconfig/getHiraTypes?locationId=${userDetails?.location?.id}&type=hazard&orgId=${userDetails?.organizationId}&master=true`
      );
      // console.log("checkriskimport res in getHazardTypeOptions", res);
      if (res.status === 200) {
        if (res?.data && !!res?.data?.data?.length) {
          const hazardTypeOptions = res?.data?.data?.map((hazard: any) => ({
            label: hazard.name,
            value: hazard._id,
          }));
          setHazardTypeOptions(hazardTypeOptions);
        } else {
          setHazardTypeOptions([]);

          enqueueSnackbar("No Hazard Types found for HIRA config", {
            variant: "warning",
          });
        }
      } else {
        setHazardTypeOptions([]);

        enqueueSnackbar("Something went wrong while fetching hazard types", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while fetching hazard types", {
        variant: "error",
      });
      // console.log("checkriskimport error in getHiraTypesOptions ", error);
    }
  };

  const getAllAreaMaster = async (locationId: any) => {
    try {
      const res = await axios.get(
        `api/riskconfig/getAllAreaMaster?locationId=${locationId}&orgId=${userDetails?.organizationId}&master=true`
      );
      // console.log("checkriskimport res in getHazardTypeOptions", res);
      if (res.status === 200) {
        if (res?.data && !!res?.data?.data?.length) {
          const hazardTypeOptions = res?.data?.data?.map((hazard: any) => ({
            label: hazard.name,
            value: hazard._id,
          }));
          setAreaOptions(hazardTypeOptions);
        } else {
          setAreaOptions([]);

          enqueueSnackbar("No Area Master found for HIRA config", {
            variant: "warning",
          });
        }
      } else {
        setAreaOptions([]);

        enqueueSnackbar("Something went wrong while fetching Area Master", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while fetching Area Master", {
        variant: "error",
      });
      // console.log("checkriskimport error in getHiraTypesOptions ", error);
    }
  };

  const configHandler = () => {
    navigate(`/risk/riskconfiguration/HIRA`);
  };
  const handleBackClick = () => {
    navigate(`/risk/riskregister/HIRA`);
  };

  const columns = [
    { id: "sNo", label: "S.No", type: "number" },
    { id: "jobBasicStep", label: "Basic Step of Job", type: "text" },
    { id: "hazardType", label: "Hazard Type", type: "select" },
    { id: "hazardDescription", label: "Hazard Description", type: "text" },
    { id: "impactText", label: "Impact", type: "text" },
    { id: "existingControl", label: "Existing Control Measure", type: "text" },
    { id: "preProbability", label: "P", type: "number" },
    { id: "preSeverity", label: "S", type: "number" },

    {
      id: "additionalControlMeasure",
      label: "Additional Control Measure",
      type: "text",
    },
    { id: "responsiblePerson", label: "Responsible Person", type: "select" },
    {
      id: "implementationStatus",
      label: "Implementation Status",
      type: "text",
    },
    { id: "postProbability", label: "P", type: "number" },
    { id: "postSeverity", label: "S", type: "number" },
  ];

  const importSteps = () => {
    setImportModal({ open: true });
  };

  // const handleSave = (key: any) => {
  //   setEditingKeys(editingKeys.filter((k: any) => k !== key));
  //   // enqueueSnackbar(`Row ${key} saved successfully`, { variant: "success" });
  // };

  const handleEdit = (key: any) => {
    setEditingKeys([...editingKeys, key]);
  };

  const handleChange = (event: any, key: any, field: any) => {
    if (!!event?.target?.value) {
      const updatedData = data.map((row: any) =>
        row.key === key ? { ...row, [field]: event.target.value } : row
      );
      setData(updatedData);
    } else {
      if (field === "hazardType") {
        const selectedHazardOption = hazardTypeOptions.find(
          (option: any) => option.value === event
        );
        const updatedData = data.map((row: any) =>
          row.key === key
            ? {
                ...row,
                [field]: event,
                hazardName: selectedHazardOption?.label,
              }
            : row
        );
        setData(updatedData);
      } else {
        const selectedPersonName = locationWiseUsers.find(
          (option: any) => option.value === event
        );
        const updatedData = data.map((row: any) =>
          row.key === key
            ? { ...row, [field]: event, personName: selectedPersonName?.label }
            : row
        );
        setData(updatedData);
      }
    }
  };

  const handleValidateHiraImport = async () => {
    try {
      setIsSheetLoading(true);
      const formData = new FormData();

      formData.append("file", fileList[0].originFileObj);
      const response = await axios.post(
        `/api/riskregister/validateImport`,
        formData
      );
      if (response?.status === 200 || response?.status === 201) {
        if (response?.data?.sheetNames?.length) {
          setSelectedStepsStartingFromRow(response?.data?.stepsStartingFromRow);
          setSelectedSheetName(response?.data?.sheetNames[0]);
          setSheetNames(response?.data?.sheetNames);
          setIsValidatHiraFileApiCalled(true);
          setIsSheetLoading(false);
        } else {
          setIsSheetLoading(false);
          enqueueSnackbar("No Valid Sheet Found, Please Contact Admin!", {
            variant: "warning",
          });
        }
      } else {
        setIsSheetLoading(false);
        enqueueSnackbar("Error in Validating Sheet, Please Contact Admin!", {
          variant: "error",
        });
      }
    } catch (error) {
      setIsSheetLoading(false);
      // console.log("checkriskimport error in handleImportHira", error);
    }
  };

  const handleImportHira = async () => {
    try {
      const formData = new FormData();
      formData.append("file", fileList[0].originFileObj);
      formData.append("sheetName", selectedSheetName);
      formData.append("stepsStartingFromRow", selectedStepsStartingFromRow);
      const response = await axios.post(`/api/riskregister/import`, formData);

      if (response?.status === 200 || response?.status === 201) {
        const filteredData = response?.data?.filter((item: any) =>
          Number.isFinite(item.sNo)
        );

        if (filteredData?.length) {
          let hasError = false;
          let hasOutOfRangeError = false;

          const formattedData = filteredData.map((item: any, index: number) => {
            const preProbability = item.preProbability || 0;
            const preSeverity = item.preSeverity || 0;
            let postProbability = item.postProbability || 0;
            let postSeverity = item.postSeverity || 0;

            // If postProbability and postSeverity are 0 and (preProbability * preSeverity) <= 8, copy values
            if (
              postProbability === 0 &&
              postSeverity === 0 &&
              preProbability * preSeverity <= 8
            ) {
              postProbability = preProbability;
              postSeverity = preSeverity;
            }

            // Check if values are empty/zero or out of range (not 1-5)
            if (
              !preProbability ||
              !preSeverity ||
              !postProbability ||
              !postSeverity ||
              preProbability < 1 ||
              preProbability > 5 ||
              preSeverity < 1 ||
              preSeverity > 5 ||
              postProbability < 1 ||
              postProbability > 5 ||
              postSeverity < 1 ||
              postSeverity > 5
            ) {
              hasError = true;
              if (
                preProbability > 5 ||
                preSeverity > 5 ||
                postProbability > 5 ||
                postSeverity > 5
              ) {
                hasOutOfRangeError = true;
              }
            }

            return {
              ...item,
              key: index.toString(),
              hazardType: "",
              hazardName: "",
              responsiblePerson:
                selectedResponsiblePerson || item?.responsiblePerson,
              personName: selectedResponsiblePerson
                ? locationWiseUsers.find(
                    (option: any) => option.value === selectedResponsiblePerson
                  )?.label
                : "",
              postProbability,
              postSeverity,
            };
          });

          // Update table data
          setData(formattedData);
          setEditingKeys(formattedData.map((row: any) => row.key));

          // Set error message
          let errorMsg = "";
          if (hasError)
            errorMsg += "⚠️ Score fields cannot be empty or contain 0.\n";
          if (hasOutOfRangeError)
            errorMsg += "⚠️ Scores must be between 1 and 5.";

          setValidationWarning(errorMsg);
          setHasInvalidScores(hasError || hasOutOfRangeError);

          setImportModal({ open: false });
        } else {
          setData([]);
          setEditingKeys([]);
          setImportModal({ open: false });
          enqueueSnackbar("Error in Importing Sheet, Please Contact Admin!", {
            variant: "error",
            autoHideDuration: 2000,
          });
        }
      } else {
        enqueueSnackbar("Error in Importing Sheet, Please Contact Admin!", {
          variant: "error",
          autoHideDuration: 2000,
        });
      }
    } catch (error) {
      console.log("checkriskimport error in handleImportHira", error);
    }
  };

  const handleSubmitHira = async () => {
    try {
      // console.log("checkriskimport handleSubmitHira", existingRiskConfig);

      if (editingKeys?.length) {
        enqueueSnackbar("Please save all the rows", { variant: "warning" });
        return;
      }
      if (data?.length === 0) {
        enqueueSnackbar("Please import HIRA Steps", { variant: "warning" });
        return;
      }

      await hiraHeaderForm.validateFields();
      console.log("checkriskimport hiraHeaderFormData", hiraHeaderFormData);

      const validateJobTitle = isValid(hiraHeaderFormData?.jobTitle);
      if (!validateJobTitle?.isValid) {
        enqueueSnackbar(
          `Please Enter Valid Job Title ${validateJobTitle?.errorMessage}`,
          {
            variant: "warning",
          }
        );
        return;
      }

      if (!!hiraHeaderFormData?.additionalAssesmentTeam) {
        const validateAdditionalAssesmentTeam = isValid(
          hiraHeaderFormData?.additionalAssesmentTeam
        );
        if (!validateAdditionalAssesmentTeam?.isValid) {
          enqueueSnackbar(
            `Please Enter Valid Additional Assesment Team ${validateAdditionalAssesmentTeam?.errorMessage}`,
            {
              variant: "warning",
            }
          );
          return;
        }
      }

      let hasValidationError = false;
      let errorMessages: any = [];

      // Validate each row in data
      data.forEach((row: any, index: number) => {
        const fieldsToValidate = [
          { name: "jobBasicStep", value: row.jobBasicStep },
          { name: "hazardDescription", value: row.hazardDescription },
          { name: "impactText", value: row.impactText },
          { name: "existingControl", value: row.existingControl },
          {
            name: "additionalControlMeasure",
            value: row.additionalControlMeasure,
          },
        ];

        fieldsToValidate.forEach(({ name, value }) => {
          validateTitleForHiraImport(name, value, (error) => {
            if (error) {
              const errorMessage = `Row ${index + 1}, field ${name}: ${error}`;
              console.error(`checkriskimport ${errorMessage}`);
              errorMessages.push(errorMessage);
              hasValidationError = true;
            }
          });
        });
      });

      if (hasValidationError) {
        enqueueSnackbar(errorMessages.join("\n"), {
          variant: "warning",
          autoHideDuration: 5000,
          style: { whiteSpace: "pre-line" },
        });
        return;
      }

      // console.log("checkriskimport hiraTableData", data);
      const finalData = data.map((item: any) => ({
        ...item,
        // ...hiraHeaderFormData,
        entityId: userDetails?.entity?.id,
        locationId: userDetails?.location?.id,
        // organizationId: userDetails?.organizationId,
        createdBy: userDetails?.id,
        // hiraConfigId: existingRiskConfig?._id,
      }));

      const hiraData = {
        ...hiraHeaderFormData,
        createdBy: userDetails?.id,
        organizationId: userDetails?.organizationId,
        status: "active",
        workflowStatus: "DRAFT",
        currentVersion: 0,
      };

      console.log("checkriskimport finalData", {
        hira: hiraData,
        steps: finalData,
      });

      const res = await axios.post(`/api/riskregister/hira/insertBulkSteps`, {
        hira: hiraData,
        steps: finalData,
      });
      // console.log("checkriskimport res in handleSubmitHira", res);
      if (res?.status === 201 || res?.status === 200) {
        enqueueSnackbar("HIRA registered successfully", { variant: "success" });
        navigate(`/risk/riskregister/HIRA`);
      }
    } catch (error) {
      console.log("checkriskimport error in handleSubmitHira", error);
    }
  };

  const handleSave = (key: any) => {
    setIsSaveAllTriggered(false); // ✅ Ensure we are saving a single row
    const row = data.find((r: any) => r.key === key);

    if (!row) return;

    let errorMsg = "";
    let hasInvalidScores = false;
    let hasResidualRiskIssue = false;
    let hasOutOfRangeError = false;

    const preProbability = Number(row.preProbability) || 0;
    const preSeverity = Number(row.preSeverity) || 0;
    const postProbability = Number(row.postProbability) || 0;
    const postSeverity = Number(row.postSeverity) || 0;
    const baseRisk = preProbability * preSeverity;
    const residualRisk = postProbability * postSeverity;

    if (
      (row.hasOwnProperty("preProbability") &&
        (preProbability < 1 || preProbability > 5)) ||
      (row.hasOwnProperty("preSeverity") &&
        (preSeverity < 1 || preSeverity > 5)) ||
      (row.hasOwnProperty("postProbability") &&
        (postProbability < 1 || postProbability > 5)) ||
      (row.hasOwnProperty("postSeverity") &&
        (postSeverity < 1 || postSeverity > 5))
    ) {
      hasInvalidScores = true;
    }

    if (baseRisk > 8 && residualRisk >= baseRisk) {
      hasResidualRiskIssue = true;
    }

    if (hasInvalidScores || hasOutOfRangeError) {
      enqueueSnackbar(
        "⚠️ Scores must be between 1 and 5, and cannot be empty or 0.",
        {
          variant: "warning",
          autoHideDuration: 2500,
        }
      );
      return;
    }

    if (!row.hazardType || !row.responsiblePerson) {
      enqueueSnackbar("⚠️ Please fill Hazard Type and Responsible Person.", {
        variant: "warning",
        autoHideDuration: 2500,
      });
      return;
    }

    if (hasResidualRiskIssue) {
      setShowResidualRiskWarning(true);
      setPendingSaveRow(key);
      return;
    }

    setEditingKeys(editingKeys.filter((k: any) => k !== key));
    enqueueSnackbar(`Row ${key + 1} saved successfully`, {
      variant: "success",
    });
  };

  const handleSaveAll = () => {
    let hasInvalidScores = false;
    let hasResidualRiskIssue = false;
    let hasOutOfRangeError = false;

    const updatedData = data.map((row: any) => {
      const preProbability = row.preProbability || 0;
      const preSeverity = row.preSeverity || 0;
      const postProbability = row.postProbability || 0;
      const postSeverity = row.postSeverity || 0;
      const baseRisk = preProbability * preSeverity;
      const residualRisk = postProbability * postSeverity;

      if (
        (row.hasOwnProperty("preProbability") &&
          (preProbability < 1 || preProbability > 5)) ||
        (row.hasOwnProperty("preSeverity") &&
          (preSeverity < 1 || preSeverity > 5)) ||
        (row.hasOwnProperty("postProbability") &&
          (postProbability < 1 || postProbability > 5)) ||
        (row.hasOwnProperty("postSeverity") &&
          (postSeverity < 1 || postSeverity > 5))
      ) {
        hasInvalidScores = true;
        hasOutOfRangeError = true;
      }

      if (baseRisk > 8 && residualRisk >= baseRisk) {
        hasResidualRiskIssue = true;
      }

      return row;
    });

    setData(updatedData);

    let errorMsg = "";
    if (hasInvalidScores)
      errorMsg += "⚠️ Some score fields cannot be empty or 0.\n";
    if (hasOutOfRangeError) errorMsg += "⚠️ Scores must be between 1 and 5.";

    setValidationWarning(errorMsg);
    setHasInvalidScores(hasInvalidScores || hasOutOfRangeError);

    if (hasInvalidScores) return;

    if (hasResidualRiskIssue) {
      setShowResidualRiskWarning(true);
      setIsSaveAllTriggered(true); // ✅ Indicate that "Save All" triggered the modal
      return;
    }

    // ✅ Proceed to save if no errors
    saveAllSteps();
  };

  const saveAllSteps = () => {
    setData((prevData: any) =>
      prevData.map((row: any) => ({
        ...row,
        hasError: false, // Remove error styling
      }))
    );
    setEditingKeys([]);
    enqueueSnackbar(
      "All Steps Saved Successfully, Please Verify All Details And Submit HIRA",
      { variant: "info", autoHideDuration: 2500 }
    );
  };

  const handleCancelImportModal = () => {
    setFileList([]);
    setSelectedResponsiblePerson("");
    setSelectedSheetName("");
    setSelectedStepsStartingFromRow(0);
    setIsValidatHiraFileApiCalled(false);
    setData([]);
    setImportModal({ open: false });
  };

  return (
    <div>
      <Box
        sx={{
          // width: "100%",
          bgcolor: "background.paper",
          marginTop: "10px",
          alignItems: "center",
          // position: "relative",
          display: "flex",
        }}
      >
        {(isMCOE || isMR) && (
          <div
            onClick={configHandler}
            style={{
              display: "flex",
              alignItems: "center",
              // justifyContent: "center",
              padding: "4px 10px 4px 10px",
              cursor: "pointer",
              borderRadius: "5px",
              position: "relative", // this is needed for the pseudo-element arrow
              // backgroundColor: tabFilter === "inWorkflow" ? "#3576BA" : "", // conditional background color
            }}
          >
            <OrgSettingsIcon
              // fill={tabFilter === "inWorkflow" ? "white" : "black"}
              className={classes.docNavIconStyle}
            />
            <span
              className={`${classes.docNavText}`}
              style={{
                color: "black",
                // fontWeight: "600", // conditional background color
              }}
            >
              Settings
            </span>
          </div>
        )}

        <Button
          onClick={() => handleBackClick()}
          style={{
            marginLeft: "10px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ChevronLeftIcon fontSize="small" />
          Back
        </Button>
      </Box>
      {/* Content */}
      <div>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* HIRA HEADER FORM */}
            <div
              style={{ marginBottom: "15px", marginTop: "15px" }}
              className={classes.descriptionLabelStyle}
            >
              <Form
                form={hiraHeaderForm}
                layout="vertical"
                onValuesChange={(changedValues, allValues) => {
                  console.log("checkriskimport changed values", changedValues);
                  console.log("checkriskimport all values", allValues);
                  // console.log(
                  //   "checkriskimportimport onchange hiraheader form called",
                  //   changedValues
                  // );

                  setHiraHeaderFormData({
                    ...hiraHeaderFormData,
                    ...changedValues,
                  });
                }}
              >
                <Descriptions
                  bordered
                  size="small"
                  column={{
                    xxl: 3, // or any other number of columns you want for xxl screens
                    xl: 3, // or any other number of columns you want for xl screens
                    lg: 2, // or any other number of columns you want for lg screens
                    md: 2, // or any other number of columns you want for md screens
                    sm: 1, // or any other number of columns you want for sm screens
                    xs: 1, // or any other number of columns you want for xs screens
                  }}
                >
                  <Descriptions.Item label="Job Title* : ">
                    <Form.Item
                      name="jobTitle"
                      rules={[
                        {
                          required: true,
                          message: "Please input your job title!",
                        },
                      ]}
                      className={classes.disabledInput}
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="Enter Job Title" size="large" />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item label="Corp Unit/Func*: ">
                    <Form.Item
                      className={classes1.disabledSelect}
                      style={{ marginBottom: 0 }}
                      name="locationId"
                      rules={[
                        {
                          required: true,
                          message: "Please Select Unit!",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder="Select Unit"
                        optionFilterProp="children"
                        filterOption={(input: any, option: any) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        style={{ width: "100%" }}
                        // value={selectedLocation}
                        onChange={(value) => handleLocationChange(value)}
                        listHeight={200}
                        dropdownRender={(menu) => (
                          <Paper style={{ padding: "1px" }}>{menu}</Paper>
                        )}
                        disabled
                      >
                        {locationOptions.map((option: any) => (
                          <Select.Option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item label="Dept/Vertical*: ">
                    <Form.Item
                      className={classes1.disabledSelect}
                      style={{ marginBottom: 0 }}
                      name="entityId"
                      rules={[
                        {
                          required: true,
                          message: "Please Select Dept/Vertical!",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder="Select Dept/Vertical"
                        optionFilterProp="children"
                        filterOption={(input: any, option: any) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        style={{ width: "100%" }}
                        // value={selectedEntity}
                        options={departmentOptions || []}
                        onChange={(value) => {
                          setSelectedEntity(value);

                          hiraHeaderForm.setFieldsValue({
                            section: undefined,
                          });
                          getSectionOptions(value);
                        }}
                        size="large"
                        listHeight={200}
                        disabled
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item label="Routine/Non Routine*:">
                    <Form.Item
                      name="riskType"
                      style={{ marginBottom: 0 }}
                      // rules={[
                      //   {
                      //     required: true,
                      //     message: "Please Select Risk Type!",
                      //   },
                      // ]}
                      className={classes.disabledSelect}
                    >
                      <Select
                        placeholder="Select Routine/Non Routine"
                        allowClear
                        style={{
                          width: "100%",
                        }}
                        options={riskTypeOptions}
                        size="large"
                        listHeight={200}
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item label="Condition*:">
                    <Form.Item
                      // label="Condition: "
                      name="condition"
                      style={{ marginBottom: 0 }}
                      // rules={[
                      //   {
                      //     required: true,
                      //     message: "Please Select Condition!",
                      //   },
                      // ]}
                      className={classes.disabledSelect}
                    >
                      <Select
                        placeholder="Select Condition"
                        allowClear
                        style={{
                          // minWidth: "340px",
                          // maxWidth: "450px"
                          width: "100%",
                        }}
                        options={conditionOptions}
                        size="large"
                        listHeight={200}
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item label="Area*: ">
                    <Form.Item
                      name="area"
                      // rules={[
                      //   {
                      //     required: true,
                      //     message: "Please Input Your Area!",
                      //   },
                      // ]}
                      className={classes.disabledInput}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        placeholder="Select Area"
                        showSearch
                        allowClear
                        style={{
                          width: "100%",
                        }}
                        filterOption={(input, option: any) =>
                          option?.label
                            ?.toLowerCase()
                            .indexOf(input?.toLowerCase()) >= 0
                        }
                        options={areaOptions}
                        size="large"
                        listHeight={200}
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item label="Section*: ">
                    <Form.Item
                      name="section"
                      className={classes.disabledInput}
                      style={{ marginBottom: 0 }}
                    >
                      <Select
                        placeholder="Select Section"
                        allowClear
                        style={{
                          width: "100%",
                        }}
                        options={sectionOptions}
                        size="large"
                        listHeight={200}
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item label="Assessment Team*: ">
                    <Form.Item
                      className={classes.disabledMultiSelect}
                      name="assesmentTeam"
                      style={{ marginBottom: 0 }}
                      rules={[
                        { required: true, message: "Please Select Team!" },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder="Select Team"
                        allowClear
                        style={{
                          width: "100%",
                        }}
                        mode="multiple"
                        options={locationWiseUsers || []}
                        size="large"
                        filterOption={(input, option: any) =>
                          option?.label
                            ?.toLowerCase()
                            .indexOf(input?.toLowerCase()) >= 0
                        }
                        listHeight={200}
                      />
                    </Form.Item>
                  </Descriptions.Item>
                  <Descriptions.Item label="Additional Assessment Team: ">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Form.Item
                        style={{ marginBottom: 0, flex: 1 }}
                        name="additionalAssesmentTeam"
                        className={classes.disabledInput}
                      >
                        <Input
                          placeholder="Enter Additional Team Members"
                          size="large"
                          width={"100%"}
                        />
                      </Form.Item>
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </Form>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                onClick={importSteps}
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#003566",
                  color: "white",
                  marginRight: "5px",
                  marginBottom: "20px",
                }}
              >
                Import Steps
              </Button>
              <Button
                onClick={handleSubmitHira}
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#003566",
                  color: "white",
                  marginRight: "5px",
                  marginBottom: "20px",
                }}
              >
                Submit HIRA
              </Button>
            </div>
            {/* HIRA TABLE */}
            {validationWarning && (
              <div
                style={{
                  color: "red",
                  fontWeight: "bold",
                  marginBottom: "10px",
                  padding: "10px",
                  border: "1px solid red",
                  borderRadius: "5px",
                  backgroundColor: "#ffeeee",
                  whiteSpace: "pre-line",
                }}
              >
                {validationWarning}
              </div>
            )}

            <Paper>
              {editingKeys.length > 0 && (
                <Button
                  color="primary"
                  onClick={handleSaveAll}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#003566",
                    color: "white",
                    marginRight: "15px",
                    marginBottom: "10px",
                    float: "right",
                  }}
                >
                  Save All
                </Button>
              )}
              <TableContainer
              //   className={classes.tableContainer}
              >
                <Table
                  stickyHeader
                  //  className={classes.table}
                >
                  <TableHead
                  //   className={classes.tableHead}
                  >
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          //   className={classes.tableHeadCell}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                      <TableCell
                        className={classes1.sticky}
                        style={{ backgroundColor: "#fafafa" }}
                        //    className={classes.tableHeadCell}
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row: any) => (
                      <TableRow key={row.key}>
                        {columns.map((column) => {
                          return (
                            <TableCell
                              key={column.id}
                              style={{
                                borderBottom: "2px solid #fafafa",
                                minWidth: "120px",
                              }}
                            >
                              {isEditing(row.key) ? (
                                column.type === "select" ? (
                                  <FormControl fullWidth>
                                    {column.id === "hazardType" ? (
                                      <Select
                                        showSearch
                                        size="large"
                                        placeholder="Select Hazard"
                                        options={hazardTypeOptions}
                                        // style={{ width: "100%", minWidth: "180px" }}
                                        className={classes1.hazardSelectStyle}
                                        // className={classes.hazardSelectStyle}
                                        onChange={(value) =>
                                          handleChange(
                                            value,
                                            row.key,
                                            column.id
                                          )
                                        }
                                        filterOption={(
                                          input: any,
                                          option: any
                                        ) =>
                                          option?.label
                                            ?.toLowerCase()
                                            .indexOf(input?.toLowerCase()) >= 0
                                        }
                                        listHeight={200}
                                      />
                                    ) : (
                                      <Select
                                        showSearch
                                        size="large"
                                        placeholder="Select Person"
                                        value={
                                          selectedResponsiblePerson || undefined
                                        }
                                        options={locationWiseUsers || []}
                                        // style={{ width: "100%", minWidth: "180px" }}
                                        className={classes1.hazardSelectStyle}
                                        // className={classes.hazardSelectStyle}
                                        onChange={(value) =>
                                          handleChange(
                                            value,
                                            row.key,
                                            column.id
                                          )
                                        }
                                        filterOption={(
                                          input: any,
                                          option: any
                                        ) =>
                                          option?.label
                                            ?.toLowerCase()
                                            .indexOf(input?.toLowerCase()) >= 0
                                        }
                                        listHeight={200}
                                      />
                                    )}
                                  </FormControl>
                                ) : column.type === "number" ? (
                                  <div style={{ position: "relative" }}>
                                    <TextField
                                      id={`outlined-number-${row.key}-${column.id}`}
                                      value={row[column.id]}
                                      type="number"
                                      onChange={(e) =>
                                        handleChange(e, row.key, column.id)
                                      }
                                      variant="outlined"
                                      minRows={2}
                                      style={{
                                        width: "100%",
                                        border:
                                          [
                                            "preProbability",
                                            "preSeverity",
                                            "postProbability",
                                            "postSeverity",
                                          ].includes(column.id) &&
                                          (row[column.id] === 0 ||
                                            row[column.id] === "" ||
                                            row[column.id] > 5 ||
                                            row[column.id] < 1)
                                            ? "2px solid red"
                                            : "1px solid #ccc",
                                        borderRadius: "4px",
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <TextareaAutosize
                                    className={classes.textArea}
                                    value={row[column.id]}
                                    onChange={(e) =>
                                      handleChange(e, row.key, column.id)
                                    }
                                    minRows={3}
                                  />
                                )
                              ) : column.id === "hazardType" ? (
                                row["hazardName"]
                              ) : column.id === "responsiblePerson" ? (
                                row["personName"]
                              ) : (
                                row[column.id]
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell
                          className={classes1.sticky}
                          style={{ borderBottom: "2px solid #fafafa" }}
                        >
                          {isEditing(row.key) ? (
                            <IconButton
                              onClick={() => handleSave(row.key)}
                              color="primary"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          ) : (
                            <IconButton
                              onClick={() => handleEdit(row.key)}
                              color="primary"
                            >
                              <CustomEditICon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </div>

      {importModal.open && (
        <Modal
          title="Import Steps"
          open={importModal.open}
          onCancel={() => handleCancelImportModal()}
          width={"50%"} // Increased width for better readability
          footer={
            <div style={{ textAlign: "right" }}>
              {!isValidatHiraFileApiCalled && fileList?.length ? (
                <Button
                  key="submit"
                  type="primary"
                  onClick={handleValidateHiraImport}
                >
                  Upload File
                </Button>
              ) : null}
              {isValidatHiraFileApiCalled && (
                <Button key="submit" type="primary" onClick={handleImportHira}>
                  OK
                </Button>
              )}
            </div>
          }
        >
          <div
            style={{ maxHeight: "600px", overflowY: "auto", padding: "10px" }}
          >
            {/* BEFORE UPLOADING INSTRUCTIONS */}
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "12px",
                borderRadius: "5px",
                border: "1px solid #d1d1d1",
                marginBottom: "15px",
              }}
            >
              <Typography.Title level={5} style={{ marginBottom: "10px" }}>
                📌 Please Read Before Uploading:
              </Typography.Title>
              <ul style={{ paddingLeft: "18px", fontSize: "14px" }}>
                <li>
                  This import feature does not support <strong>H_Sheel</strong>{" "}
                  and <strong>Mangal Hindi</strong> fonts.
                </li>
                <li>
                  If the <strong>Base Risk</strong> is less than{" "}
                  <strong>8</strong>, the same score gets copied to{" "}
                  <strong>Residual Scores</strong>.
                </li>
                <li>
                  <strong>0 is not allowed</strong> as a score value.
                </li>
                <li>
                  <strong>Significant risks</strong> must have a Residual Score.
                  Empty or 0 is not allowed.
                </li>
                <li>Scoring can be modified after importing the sheet.</li>
              </ul>
            </div>

            <Form layout="vertical" className={classes1.hiraImportForm}>
              {/* FILE UPLOAD SECTION */}
              <Form.Item label="Attach File:">
                <Dragger
                  {...uploadProps}
                  fileList={fileList}
                  showUploadList={true}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxIcon style={{ fontSize: "40px", color: "#1890ff" }} />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                </Dragger>
              </Form.Item>

              {isSheetLoading ? (
                <div>
                  <Spin />
                </div>
              ) : (
                <>
                  {/* SHEET SELECTION */}
                  {isValidatHiraFileApiCalled && (
                    <>
                      <div ref={scrollRef}>
                        <Form.Item label="Sheet to be imported: ">
                          <Radio.Group
                            onChange={handleSheetNameChange}
                            value={selectedSheetName}
                          >
                            {sheetNames?.length &&
                              sheetNames.map((name: any, index: any) => (
                                <Radio key={index} value={name}>
                                  {name}
                                </Radio>
                              ))}
                          </Radio.Group>
                        </Form.Item>

                        <Form.Item label="Steps Starting From Row: ">
                          <InputNumber
                            min={1}
                            value={selectedStepsStartingFromRow}
                            onChange={handleStepsRowChange}
                          />
                        </Form.Item>

                        <Form.Item label="Steps Starting From Column: ">
                          <Input value={"B"} disabled />
                        </Form.Item>

                        <Form.Item label="Select Responsible Person: ">
                          <Select
                            showSearch
                            size="large"
                            placeholder="Select Person"
                            options={locationWiseUsers || []}
                            className={classes1.hazardSelectStyle}
                            onChange={(value) =>
                              setSelectedResponsiblePerson(value)
                            }
                            filterOption={(input: any, option: any) =>
                              option?.label
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            listHeight={200}
                          />
                        </Form.Item>
                      </div>
                    </>
                  )}
                </>
              )}
            </Form>
          </div>
        </Modal>
      )}
      <Modal
        title="⚠️ Residual Risk Warning"
        open={showResidualRiskWarning}
        onCancel={() => {
          setShowResidualRiskWarning(false);
          setPendingSaveRow(null);
          setIsSaveAllTriggered(false); // ✅ Reset flag when canceling
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setShowResidualRiskWarning(false);
              setPendingSaveRow(null);
              setIsSaveAllTriggered(false);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="yes"
            type="primary"
            onClick={() => {
              setShowResidualRiskWarning(false);
              if (isSaveAllTriggered) {
                saveAllSteps(); // ✅ If triggered by "Save All", save all rows
                setIsSaveAllTriggered(false);
              } else if (pendingSaveRow !== null) {
                setEditingKeys(
                  editingKeys.filter((k: any) => k !== pendingSaveRow)
                );
                enqueueSnackbar(
                  `Row ${pendingSaveRow + 1} saved successfully`,
                  { variant: "success" }
                );
                setPendingSaveRow(null);
              }
            }}
          >
            Yes, Proceed
          </Button>,
        ]}
      >
        <p>
          Some residual risks' scores have remained the same or increased
          despite additional control measures. Do you wish to proceed?
        </p>
      </Modal>
    </div>
  );
};

export default HiraImportPage;
