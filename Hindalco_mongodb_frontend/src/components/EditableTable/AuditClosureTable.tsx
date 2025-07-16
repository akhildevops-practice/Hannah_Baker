import { useState, useEffect } from "react";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import { Edit, Delete, Add, CheckBox } from "@material-ui/icons";
import {
  InputBase,
  IconButton,
  Select,
  MenuItem,
  Box,
  Tooltip,
} from "@material-ui/core";
import {
  auditCreationForm,
  auditFormData,
  closureClause,
} from "../../recoil/atom";
import { useRecoilState, useRecoilValue } from "recoil";
import { cloneDeep, clone } from "lodash";
import { useStyles } from "./styles";
import { useParams } from "react-router-dom";
import { addAttachment, getAuditById } from "../../apis/auditApi";
import { useLocation } from "react-router";
import EmptyIcon from "../../assets/EmptyTableImg.svg";
import checkRole from "../../utils/checkRoles";
import axios from "apis/axios.global";
import { useSnackbar } from "notistack";
import { getAllClauses } from "apis/clauseApi";
import { Button, Modal, Space, Upload, UploadFile } from "antd";
import {
  StarOutlined,
  UploadOutlined,
  FileOutlined,
  DeleteOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import getAppUrl from "utils/getAppUrl";
import ReferencesResultPage from "pages/ReferencesResultPage";
import DocumentViewerAudit from "../../pages/AuditorProfile/DocumentViewer";
import HindalcoLogoSvg from "assets/logo/HindalcoLogoSvg.svg";
import CloseIconImageSvg from "assets/documentControl/Close.svg";

type Props = {
  disabled: boolean;
  refForReportForm22?: any;
  refForReportForm23?: any;
  refForReportForm24?: any;
};

/**
 * This is a table component which has a feature for editing and deleting rows inside the table itself
 *
 */
function AuditClosureTable({
  disabled,
  refForReportForm22,
  refForReportForm23,
  refForReportForm24,
}: Props) {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<any>({});
  const [editIndex, setEditIndex] = useState<any>(null);
  const [clauses, setClauses] = useState([{}]);
  const [template, setTemplate] = useRecoilState<any>(auditCreationForm);
  const [formData, setFormData] = useRecoilState<any>(auditFormData);
  const { id } = useParams();
  const location: any = useLocation();
  const isAuditor = checkRole("AUDITOR");
  const isLocAdmin = checkRole("LOCATION-ADMIN");
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const isMr = checkRole("MR");
  const [optionData, setOptionData] = useState([]);
  const [allClauses, setAllClause] = useState<any>([]);
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);
  const [fileLinkCi, setFileLinkCi] = useState<any>();
  const [certifiOpen, setCertifiOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState({});

  const realmName = getAppUrl();

  const { enqueueSnackbar } = useSnackbar();
  const [logo, setLogo] = useState<any>(null);
  const getLogo = async () => {
    const response = await axios.get(`/api/location/getLogo`);
    setLogo(response.data);
  };
  useEffect(() => {
    getLogo();
    getOptionData();
    fetchAllClauses();
  }, []);
  /**
   * @description headers array which describes the names of the table headers and the functions which are associated with it. Options can be
   * changed based on the features required in that particular field
   */

  const fetchAllClauses = () => {
    const data = formData.system;
    const selectedClauses = formData?.auditedClauses?.map(
      (value: any) => value?.item?.id
    );

    if (selectedClauses?.includes("All")) {
      getAllClauses(`${data}`).then((response: any) => {
        // Check if response.data is an array before mapping
        let mappedData: any = response.data.map((item: any) => ({
          // id: item.id,
          // clauseName: item.name,
          // clauseNumber: item.number,
          label: item?.name,
          value: item?.name,
          id: item?.id,
          clauseName: item?.name,
          name: item?.name,
          number: item?.number,
          clauseNumber: item?.number,
        }));

        setAllClause(mappedData);
      });
    } else {
      let parsedClause = formData.auditedClauses.map((clause: any) => {
        return {
          label: clause.item?.name,
          value: clause.item?.name,
          id: clause.item?.id,
          clauseName: clause.item?.name,
          name: clause.item?.name,
          number: clause.item?.number,
          clauseNumber: clause.item?.number,
        };
      });
      setAllClause(parsedClause);
    }
  };
  const getOptionData = async () => {
    try {
      let res = await axios.get(
        `/api/audit-settings/getAuditReportOptionData/${formData.auditType}`
      );
      const data = res.data.map((value: any) => {
        return {
          label: value.findingType,
          value: value.findingType,
          selectClause: value.selectClause,
          findingTypeId: value.findingTypeId,
        };
      });
      setOptionData(data);
    } catch (error) {}
  };

  const headers = [
    // {
    //   name: "questionNumber",
    //   label: "Question No.",
    //   options: {
    //     editable: false,
    //   },
    // },
    {
      name: "title",
      label: "Checkpoint",
      options: {
        editable: true,
      },
    },
    {
      name: "type",
      label: "Findings",
      options: {
        editable: true,
        select: true,
        selectOptions:
          // [
          // { label: "NC", value: "NC" },
          // { label: "Observation", value: "Observation" },
          // { label: "OFI", value: "OFI" },
          optionData,
        // ],
      },
    },
    {
      name: "comment",
      label: "Findings Details",
      options: {
        editable: true,
      },
    },
    {
      name: "clause",
      label: "Clause Number",
      checkSelected: true,
      options: {
        editable: true,
        select: true,
        selectOptions: allClauses,
      },
    },

    // {
    //   name: "severity",
    //   label: "Severity",
    //   options: {
    //     editable: true,
    //     select: true,
    //     selectOptions: [
    //       { label: "Major", value: "Major" },
    //       { label: "Minor", value: "Minor" },
    //     ],
    //   },
    // },
    {
      name: "reference",
      label: "HIIMS Reference",
      options: {
        editable: true,
      },
    },

    {
      name: "evidence",
      label: "HIIMS Evidence",
      options: {
        editable: true,
      },
    },
  ];

  /**
   * @description This function is used to get the data from the recoil state and parse it to the table
   * @param array - The data array which is to be parsed to the table
   * @returns array   {modified array of objects}
   * @memberof AuditClosureTable
   */
  function getTableData(sections: any) {
    const arr: any = [];
    sections?.forEach((section: any, index: number) => {
      for (let s = 0; s < section?.sections?.length; s++) {
        for (let i = 0; i < section?.sections[s]?.fieldset.length; i++) {
          const nc = section?.sections[s]?.fieldset[i].nc;
          if (nc !== null && nc !== undefined && nc !== "undefined") {
            if (Object?.keys(nc)?.length > 0) {
              console.log(
                "escaped data2",
                nc,
                nc?.type,
                Object?.keys(nc)?.length
              );

              arr.push({
                checklistNumber: `${index}`,
                title: section?.sections[s]?.fieldset[i]?.title ?? "-",
                questionNumber: `${index.toString()}.${s}.${i.toString()}`,
                comment: nc?.comment,
                clause:
                  (nc?.clause?.clauseName || nc?.clause?.[0]?.clauseName) ??
                  "-",
                severity: nc?.severity ?? "-",
                type: nc?.type,
                evidence: nc?.evidence || [],
                reference: nc?.reference || [],
                statusClause: nc?.statusClause,
              });
            }
          }
        }
      }
    });
    return arr;
  }

  /**
   * @method handleEditChange
   * @description Function to handle editing inside the clauses table
   * @param e {any}
   * @param i {number}
   * @returns nothing
   */
  // const handleEditChange = (e: any, field: string, i: number) => {
  //   console.log(
  //     "inside auditClosureTable handleEditChange",
  //     [...data],
  //     template
  //   );
  //   setEditValue({ ...editValue, [field]: e.target.value });
  //   const newData: any = [...data];
  //   newData[i][field] = e.target.value;
  //   setData(newData);
  // };

  /**
   * @method submitHandler - This function is used to submit the edited data to the recoil state
   * @param i {number} - index number
   * @param qId {number}  - question number
   * @returns nothing
   * @memberof AuditClosureTable
   */
  const submitHandler = (index: number, qId: string) => {
    const [checklistId, sectionId, questionId] = qId.split(".");
    if (isEditing) {
      const copyOfState: any = cloneDeep(template);
      const oldNC: any =
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ]["nc"];
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"] = {
        ...oldNC,
        ...editValue,
      };
      setTemplate(copyOfState);
      getTableData(template.sections);
    }

    if (editValue.title) {
      const copyOfState: any = cloneDeep(template);
      const oldNC: any = (copyOfState[checklistId].sections[
        parseInt(sectionId)
      ].fieldset[parseInt(questionId)].title = editValue.title);

      setTemplate(copyOfState);
      getTableData(template.sections);
    }

    setIsEditing((prev) => !prev);
    setEditIndex(index);
    setEditValue({});
  };

  /**
   * @method selectHandler
   * @description This function is used to handle the select option inside the table
   * @param e {any} - event
   * @param field {string} - field name
   * @param qId {string} - question number
   * @returns nothing
   * @memberof AuditClosureTable
   */
  const selectHandler = (e: any, field: string, qId: string, qName: string) => {
    let data: any = e.target.value as string;
    if (field === "comment") {
      const [checklistId, sectionId, questionId] = qId.split(".");
      const copyOfState: any = cloneDeep(template);
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].comment = e.target.value;
      setTemplate(copyOfState);
      setEditValue({ ...editValue, [field]: e.target.value });
    }

    if (field === "title") {
      const [checklistId, sectionId, questionId] = qId.split(".");
      const copyOfState: any = cloneDeep(template);
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ].title = e.target.value;
    }

    if (field === "type") {
      const setStatus: any = optionData.filter(
        (value: any) => value.value === e.target.value
      );
      const status = setStatus[0].selectClause;
      if (setStatus.length > 0) {
        const [checklistId, sectionId, questionId] = qId.split(".");

        const copyOfState: any = cloneDeep(template);
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ]["nc"].statusClause = setStatus[0].selectClause;
        if (status === false) {
          copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
            parseInt(questionId)
          ]["nc"].clause = "";
        }
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ]["nc"].type = e.target.value;
        setTemplate(copyOfState);
      } else {
        const [checklistId, sectionId, questionId] = qId.split(".");
        const copyOfState: any = cloneDeep(template);
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ]["nc"].type = e.target.value;
        setTemplate(copyOfState);
      }
    } else {
      if (field === "clause") {
        const cluased = formData.auditedClauses.map(
          (value: any) => value?.item?.id
        );
        if (!cluased.includes("All")) {
          const clauseObject = formData?.auditedClauses?.find(
            (clause: any) => clause.item.name === data
          );

          const newClauseObject = {
            id: clauseObject?.item?.id,
            clauseNumber: clauseObject?.item?.number,
            clauseName: clauseObject?.item?.name,
          };

          data = clone(newClauseObject);
        } else {
          const clauseObject = allClauses?.find(
            (clause: any) => clause.clauseName === data
          );

          const newClauseObject = {
            id: clauseObject?.id,
            clauseNumber: clauseObject?.number,
            clauseName: clauseObject?.name,
          };
          data = clone(newClauseObject);
        }
      }

      const [checklistId, sectionId, questionId] = qId.split(".");
      const copyOfState: any = cloneDeep(template);
      // if (parseInt(checklistId) > 0) {
      if (field === "title") {
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ].title = data;
        setTemplate(copyOfState);
      } else {
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ]["nc"][field] = data;
        setTemplate(copyOfState);
      }
      // } else {
      //   enqueueSnackbar("Additional Fields cannot be added", {
      //     variant: "warning",
      //   });
      // }
    }
  };

  const handleRemoveReferenceNew = (file: any, index: any) => {
    const [checklistId, sectionId, questionId] = index.split(".");
    const copyOfState: any = JSON.parse(JSON.stringify(template));
    const data =
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].reference;

    const filteredData = data?.filter((value: any) => value._id !== file._id);
    copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
      parseInt(questionId)
    ]["nc"].reference = filteredData;
    setTemplate(copyOfState);
    setSelectedData([]);
  };
  /**
   * @method handleDelete
   * @description Function to delete a clause using handleDelete
   * @param i {number}
   */
  const handleDelete = (qId: string) => {
    const [checklistId, sectionId, questionId] = qId.split(".");

    const copyOfState: any = cloneDeep(template);
    copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
      parseInt(questionId)
    ]["nc"] = {};

    setTemplate(copyOfState);
    const value = getTableData(template.sections);
    setData(value);
  };

  useEffect(() => {
    const value = getTableData(template);
    setData(value);
  }, [template]);

  /**
   * @method parseClauses
   * @description This function is used to parse the clauses to the select options
   * @param clauses {any} - clauses
   * @returns array - array of objects
   * @memberof AuditClosureTable
   */
  const parseClauses = (clauses: any[]) => {
    return clauses?.map((item: any) => {
      return {
        label: item?.item?.name,
        value: item?.item?.name,
      };
    });
  };
  /**
   * @method setClausesAndDocuments
   * @description Function to insert clauses and documents suggestion list
   * @param formData {any}
   * @returns nothing
   */
  const setClausesAndDocuments = (formData: any) => {
    let parsedClause = formData.auditedClauses.map((clause: any) => {
      return {
        item: clause,
      };
    });
    let parsedDocuments = formData.auditedDocuments.map((doc: any) => {
      return {
        item: doc,
      };
    });

    setFormData((prev: any) => {
      return {
        ...prev,
        auditedClauses: parsedClause,
        auditedDocuments: parsedDocuments,
      };
    });

    setClauses(parseClauses(parsedClause));
  };

  /**
   * @method getAuditData
   * @description Function to fetch audit data when an audit is opened in edit mode
   * @param id {string}
   * @returns nothing
   */
  const getAuditData = (id: string) => {
    getAuditById(id).then((res: any) => {
      setClausesAndDocuments(res?.respond);
    });
  };

  useEffect(() => {
    location?.state?.moveToLast && getAuditData(id!);
  }, []);

  useEffect(() => {
    let clausesHeaderData = parseClauses(formData?.auditedClauses);
    setClauses(clausesHeaderData);
  }, []);

  const newEvidence = {
    text: "",
    attachment: [],
    refernce: [],
  };

  const addEvidence = (index: any) => {
    const [checklistId, sectionId, questionId] = index.split(".");
    const copyOfState: any = cloneDeep(template);
    const data =
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].evidence;

    if (data === undefined) {
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].evidence = [newEvidence];
      setTemplate(copyOfState);
    } else {
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].evidence = [...data, newEvidence];
      setTemplate(copyOfState);
    }
  };

  const handleManageEvidence = (
    index: any,
    indexOfEvidence: any,
    name: any,
    value: any
  ) => {
    const [checklistId, sectionId, questionId] = index.split(".");
    const copyOfState: any = cloneDeep(template);

    // copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
    //   parseInt(questionId)
    // ]["nc"].evidence[indexOfEvidence];

    if (name === "text") {
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].evidence[indexOfEvidence].text = value.target.value;

      setTemplate(copyOfState);
    }
  };

  const handleChange =
    (index: any, indexOfEvidence: any, qno: number) =>
    (info: UploadChangeParam<UploadFile<any>>) => {
      // Handle the change event here
      const [checklistId, sectionId, questionId] = index.split(".");
      const copyOfState: any = JSON.parse(JSON.stringify(template));
      const data =
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ]["nc"].evidence[indexOfEvidence].attachment;
      if (data !== undefined) {
        let formData = new FormData();
        const fileToAdd =
          (info.file as UploadFile<any>).originFileObj || (info.file as RcFile);
        formData.append("file", fileToAdd);
        addAttachment(
          formData,
          realmName,
          loggedInUser.location.locationName
        ).then((response: any) => {
          const attachmentData = [
            {
              uid: generateUniqueId(10),
              name: response?.data.name,
              url: response?.data.path,
              status: "done",
            },
          ];
          const data =
            copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
              parseInt(questionId)
            ]["nc"].evidence[indexOfEvidence].attachment;
          // = attachmentData;
          const finalData = [...data, ...attachmentData];

          // copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          //   parseInt(questionId)
          // ]["nc"].attachment = finalData;
          setTemplate((prev: any) => {
            copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
              parseInt(questionId)
            ]["nc"].evidence[indexOfEvidence].attachment = finalData;
            return copyOfState;
          });
        });
      } else {
        let formData = new FormData();
        const fileToAdd =
          (info.file as UploadFile<any>).originFileObj || (info.file as RcFile);
        formData.append("file", fileToAdd);

        addAttachment(
          formData,
          realmName,
          loggedInUser.location.locationName
        ).then((response: any) => {
          const attachmentData = [
            {
              uid: generateUniqueId(10),
              name: response?.data.name,
              url: response?.data.path,
              status: "done",
            },
          ];
          copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
            parseInt(questionId)
          ]["nc"].evidence[indexOfEvidence].attachment = attachmentData;
          setTemplate(copyOfState);
        });
      }
    };
  const handleRefernce = (indexMain: any, selectedData: any) => {
    const [checklistId, sectionId, questionId] = indexMain.split(".");
    const copyOfState: any = JSON.parse(JSON.stringify(template));
    const data =
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].reference;

    if (data !== undefined) {
      // copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
      //   parseInt(questionId)
      // ]["nc"].attachment = finalData;
      const refernceData =
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ]["nc"].reference;

      const finalData = [...refernceData, ...selectedData];
      setTemplate((prev: any) => {
        copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
          parseInt(questionId)
        ]["nc"].reference = finalData;
        return copyOfState;
      });
    } else {
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].reference = selectedData;
      setTemplate(copyOfState);
    }
    setSelectedData([]);
    setIsModalVisible(false);
  };

  const handleOk = () => {
    handleRefernce(currentQuestionNumber, selectedData);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const redirectToGlobalSearch = () => {
    setIsModalVisible(true);
  };

  const handlerCloseCertifiModal = () => {
    setCertifiOpen(false);
  };

  const handleRemoveAttachment = (
    file: any,
    indexOfEvidence: any,
    index: any
  ) => {
    const [checklistId, sectionId, questionId] = index.split(".");
    const copyOfState: any = JSON.parse(JSON.stringify(template));
    const data =
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].evidence[indexOfEvidence].attachment;

    const filteredData = data?.filter((value: any) => value.uid !== file.uid);
    copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
      parseInt(questionId)
    ]["nc"].evidence[indexOfEvidence].attachment = filteredData;
    setTemplate(copyOfState);
  };

  const handleModuleData = (data: any) => {
    let url;

    if (data.hasOwnProperty("documentNumbering")) {
      // http://test.localhost:3000/processdocuments/viewdoc/clt6ojklr0000ura4b1qu0t33?versionId=B === doc
      url = `/processdocuments/viewdoc/${data.id}?versionId=${data?.version}`;
      // navigate(
      //   `/processdocuments/viewdoc/${data?.id}?versionId=${data?.version}&version=true`
      // );
      window.open(url, "_blank");
    } else if (data.hasOwnProperty("severity")) {
      url = `/audit/nc/${data?.id}`;
      window.open(url, "_blank");
    } else if (data.hasOwnProperty("type") && data.type === "HIRA") {
      const encodedJobTitle = encodeURIComponent(data?.jobTitle);
      url = `/risk/riskregister/HIRA/${encodedJobTitle}`;
      window.open(url, "_blank");
    }
  };

  const nameConstruct = (data: any) => {
    if (data?.hasOwnProperty("documentNumbering")) {
      return data?.documentNumbering;
    } else if (data?.hasOwnProperty("type")) {
      return data?.name;
    } else if (data?.jobTitle) {
      return data?.jobTitle;
    }
  };

  const handleRemoveReference = (
    file: any,
    indexOfEvidence: any,
    index: any
  ) => {
    const [checklistId, sectionId, questionId] = index.split(".");
    const copyOfState: any = JSON.parse(JSON.stringify(template));
    const data =
      copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
        parseInt(questionId)
      ]["nc"].evidence[indexOfEvidence].reference;

    const filteredData = data?.filter((value: any) => value._id !== file._id);
    copyOfState[checklistId].sections[parseInt(sectionId)].fieldset[
      parseInt(questionId)
    ]["nc"].evidence[indexOfEvidence].reference = filteredData;
    setTemplate(copyOfState);
    setSelectedData([]);
  };

  return (
    <>
      {data.length > 0 ? (
        <TableContainer
          component={Paper}
          elevation={0}
          variant="outlined"
          ref={refForReportForm22}
        >
          <Table stickyHeader className={classes.table}>
            <TableHead>
              <TableRow>
                {headers?.map((item: any) => (
                  <TableCell key={item}>
                    <Typography
                      variant="body2"
                      className={classes.tableHeaderColor}
                    >
                      {item?.label}
                    </Typography>
                  </TableCell>
                ))}
                <TableCell></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data?.map((val: any, i: number) => {
                return (
                  <TableRow key={i}>
                    {headers?.map((item: any) =>
                      item.name === "reference" ? (
                        <TableCell className={classes.tableCell} key={item}>
                          {isEditing && editIndex === i ? (
                            <>
                              <Button
                                icon={<UploadOutlined />}
                                disabled={disabled}
                                style={{
                                  marginTop: "10px",
                                  marginLeft: "15px",
                                }}
                                onClick={() => {
                                  setSelectedData([]);
                                  redirectToGlobalSearch();
                                  setCurrentQuestionNumber(val?.questionNumber);
                                }}
                              >
                                Upload Reference
                              </Button>
                              <div>
                                <Space direction="vertical">
                                  {val[item.name]?.map((file: any) => (
                                    <div
                                      key={file._id}
                                      className="ant-upload-list-item-container"
                                    >
                                      <div className="ant-upload-list-item ant-upload-list-item-done">
                                        <Space>
                                          <PaperClipOutlined />
                                          <Typography
                                            className="ant-upload-list-item-name"
                                            onClick={() => {
                                              handleModuleData(file);
                                            }}
                                            style={{
                                              fontSize: "11px",
                                              cursor: "pointer",
                                              color: "blue",
                                            }}
                                          >
                                            {nameConstruct(file).length > 20
                                              ? `${nameConstruct(
                                                  file
                                                ).substring(0, 20)}...`
                                              : nameConstruct(file)}
                                          </Typography>
                                          <Button
                                            title="Remove file"
                                            type="text"
                                            value={file.uid}
                                            size="small"
                                            disabled={disabled}
                                            onClick={() => {
                                              handleRemoveReferenceNew(
                                                file,
                                                val?.questionNumber
                                              );
                                            }}
                                            icon={<DeleteOutlined />}
                                          />
                                        </Space>
                                      </div>
                                    </div>
                                  ))}
                                </Space>
                              </div>
                            </>
                          ) : (
                            <div>
                              <Space direction="vertical">
                                {val[item.name]?.map((file: any) => (
                                  <div
                                    key={file._id}
                                    className="ant-upload-list-item-container"
                                  >
                                    <div className="ant-upload-list-item ant-upload-list-item-done">
                                      <Space>
                                        <PaperClipOutlined />
                                        <Typography
                                          className="ant-upload-list-item-name"
                                          onClick={() => {
                                            handleModuleData(file);
                                          }}
                                          style={{
                                            fontSize: "11px", // Adjust the font size as needed
                                            cursor: "pointer",
                                            color: "blue",
                                          }}
                                        >
                                          {nameConstruct(file).length > 20
                                            ? `${nameConstruct(file).substring(
                                                0,
                                                20
                                              )}...`
                                            : nameConstruct(file)}
                                        </Typography>
                                        <Button
                                          title="Remove file"
                                          type="text"
                                          value={file.uid}
                                          size="small"
                                          disabled={disabled}
                                          onClick={() => {
                                            handleRemoveReferenceNew(
                                              file,
                                              val?.questionNumber
                                            );
                                          }}
                                          icon={<DeleteOutlined />}
                                        />
                                      </Space>
                                    </div>
                                  </div>
                                ))}
                              </Space>
                            </div>
                          )}
                        </TableCell>
                      ) : item.name !== "evidence" ? (
                        <TableCell className={classes.tableCell} key={item}>
                          {item?.options.editable &&
                          (val.statusClause === true && item.name === "clause"
                            ? true
                            : item.name !== "clause"
                            ? true
                            : false) &&
                          isEditing &&
                          editIndex === i ? (
                            item?.options?.select ? (
                              <>
                                <Select
                                  fullWidth
                                  onChange={(e: any) => {
                                    return selectHandler(
                                      e,
                                      item?.name,
                                      val?.questionNumber,
                                      val?.questionName
                                    );
                                  }}
                                  value={val[item.name]}
                                  style={{ fontSize: "12px" }}
                                >
                                  {item?.options?.selectOptions.map(
                                    (option: { label: string; value: any }) => (
                                      <MenuItem value={option?.value}>
                                        {console.log(
                                          "option in clause",
                                          option
                                        )}
                                        {option?.label}
                                      </MenuItem>
                                    )
                                  )}
                                </Select>
                              </>
                            ) : (
                              <InputBase
                                className={classes.editField}
                                multiline
                                name={item.name}
                                onChange={(e: any) => {
                                  // handleEditChange(e, item.name, i)
                                  return selectHandler(
                                    e,
                                    item?.name,
                                    val?.questionNumber,
                                    val?.title
                                  );
                                }}
                                value={val[item.name]}
                              />
                            )
                          ) : (
                            val[item?.name]
                          )}
                        </TableCell>
                      ) : (
                        <TableCell>
                          <>
                            {isEditing && editIndex === i && (
                              <Button
                                onClick={() => {
                                  addEvidence(val?.questionNumber);
                                }}
                              >
                                Add Evidence
                              </Button>
                            )}
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Evidence</TableCell>
                                  <TableCell>Attachment</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {val[item.name].map(
                                  (value: any, index: any) => (
                                    <>
                                      <TableRow>
                                        <TableCell
                                          className={classes.tableCell}
                                          key={item}
                                        >
                                          {isEditing && editIndex === i ? (
                                            <InputBase
                                              className={classes.editField}
                                              multiline
                                              name={item.name}
                                              onChange={(e: any) => {
                                                return handleManageEvidence(
                                                  val?.questionNumber,
                                                  index,
                                                  "text",
                                                  e
                                                );
                                              }}
                                              value={value?.text}
                                            />
                                          ) : (
                                            value?.text
                                          )}
                                        </TableCell>
                                        <TableCell
                                          className={classes.tableCell}
                                          key={item}
                                        >
                                          {isEditing && editIndex === i ? (
                                            <div>
                                              <Upload
                                                action={
                                                  "https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                                                }
                                                accept=".jpeg,.png,.jpg,.JPEG,.PNG,.JPG"
                                                onChange={handleChange(
                                                  val?.questionNumber,
                                                  index,
                                                  val
                                                )}
                                                showUploadList={false}
                                                fileList={val[item.name]}
                                              >
                                                <Button
                                                  icon={<UploadOutlined />}
                                                  disabled={disabled}
                                                >
                                                  Upload
                                                </Button>
                                              </Upload>
                                              <div>
                                                <Space direction="vertical">
                                                  {value.attachment?.map(
                                                    (file: any) => (
                                                      <div
                                                        key={file.uid}
                                                        className="ant-upload-list-item-container"
                                                      >
                                                        <div className="ant-upload-list-item ant-upload-list-item-done">
                                                          <Space>
                                                            <PaperClipOutlined />
                                                            <Typography
                                                              className="ant-upload-list-item-name"
                                                              onClick={() => {
                                                                setFileLinkCi(
                                                                  file
                                                                );
                                                                setCertifiOpen(
                                                                  true
                                                                );
                                                              }}
                                                              style={{
                                                                fontSize:
                                                                  "11px", // Adjust the font size as needed
                                                                cursor:
                                                                  "pointer",
                                                                color: "blue",
                                                              }}
                                                            >
                                                              {file?.name
                                                                ?.length > 20
                                                                ? `${file?.name.substring(
                                                                    0,
                                                                    20
                                                                  )}...`
                                                                : file?.name}
                                                            </Typography>

                                                            <Button
                                                              title="Remove file"
                                                              type="text"
                                                              value={file.uid}
                                                              size="small"
                                                              disabled={
                                                                disabled
                                                              }
                                                              onClick={() => {
                                                                handleRemoveAttachment(
                                                                  file,
                                                                  index,
                                                                  val?.questionNumber
                                                                );
                                                              }}
                                                              icon={
                                                                <DeleteOutlined />
                                                              }
                                                            />
                                                          </Space>
                                                        </div>
                                                      </div>
                                                    )
                                                  )}
                                                </Space>
                                              </div>
                                            </div>
                                          ) : (
                                            <div>
                                              <Space direction="vertical">
                                                {value.attachment?.map(
                                                  (file: any) => (
                                                    <div
                                                      key={file.uid}
                                                      className="ant-upload-list-item-container"
                                                    >
                                                      <div className="ant-upload-list-item ant-upload-list-item-done">
                                                        <Space>
                                                          <PaperClipOutlined />
                                                          <Typography
                                                            className="ant-upload-list-item-name"
                                                            onClick={() => {
                                                              setFileLinkCi(
                                                                file
                                                              );
                                                              setCertifiOpen(
                                                                true
                                                              );
                                                            }}
                                                            style={{
                                                              fontSize: "11px", // Adjust the font size as needed
                                                              cursor: "pointer",
                                                              color: "blue",
                                                            }}
                                                          >
                                                            {file?.name
                                                              ?.length > 20
                                                              ? `${file?.name.substring(
                                                                  0,
                                                                  20
                                                                )}...`
                                                              : file?.name}
                                                          </Typography>

                                                          <Button
                                                            title="Remove file"
                                                            type="text"
                                                            value={file.uid}
                                                            size="small"
                                                            disabled={disabled}
                                                            onClick={() => {
                                                              handleRemoveAttachment(
                                                                file,
                                                                index,
                                                                val?.questionNumber
                                                              );
                                                            }}
                                                            icon={
                                                              <DeleteOutlined />
                                                            }
                                                          />
                                                        </Space>
                                                      </div>
                                                    </div>
                                                  )
                                                )}
                                              </Space>
                                            </div>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    </>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </>
                        </TableCell>
                      )
                    )}

                    <TableCell className={classes.actionButtonTableCell}>
                      <IconButton
                        // disabled={!isAuditor||isOrgAdmin}
                        disabled={disabled}
                        onClick={() => submitHandler(i, val?.questionNumber)}
                        ref={refForReportForm23}
                      >
                        {isEditing && editIndex === i ? (
                          <CheckBox style={{ fontSize: "18px" }} />
                        ) : (
                          <div>
                            <Edit style={{ fontSize: "18px" }} />
                          </div>
                        )}
                      </IconButton>

                      <IconButton
                        // disabled={!isLocAdmin|| !isAuditor}
                        disabled={disabled}
                        onClick={() => {
                          handleDelete(val.questionNumber);
                        }}
                        style={{ fontSize: "16px" }}
                      >
                        <div ref={refForReportForm24}>
                          <Delete style={{ fontSize: "18px" }} />
                        </div>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box
          pt={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <img src={EmptyIcon} alt="empty table" />
          <Typography variant="body2" color="textSecondary">
            Let’s begin by adding NC/Observation Summary
          </Typography>
        </Box>
      )}
      <Modal
        title={
          <div className={classes.header}>
            <img
              src={logo || HindalcoLogoSvg}
              height={"50px"}
              width={"70px"}
              style={{ marginRight: "15px" }}
            />
            <span>Search Results</span>
          </div>
        }
        width={800}
        style={{ top: 100, right: 250 }}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Submit
          </Button>,
        ]}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
        bodyStyle={{ overflow: "hidden" }}
      >
        <div>
          {/* <div style={{ position: "absolute", top: 10, left: 10 }}>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search"
            />
          </div> */}

          <ReferencesResultPage
            searchValue={""}
            selected={selectedData}
            setSelected={setSelectedData}
            isModalVisible={isModalVisible}
          />
        </div>
      </Modal>
      <Modal
        title={fileLinkCi?.name || "No Name"}
        open={certifiOpen}
        onCancel={handlerCloseCertifiModal}
        footer={null}
        width="400px"
      >
        <div>
          <DocumentViewerAudit fileLink={fileLinkCi?.url} status={false} />
        </div>
      </Modal>
    </>
  );
}

export default AuditClosureTable;
