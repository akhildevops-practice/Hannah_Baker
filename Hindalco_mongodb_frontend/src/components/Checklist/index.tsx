import React, { useEffect, useRef, useState } from "react";
import { templateForm, auditCreationForm } from "../../recoil/atom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { ComponentType, InputHandlerType } from "../../utils/enums";
import { auditFormData } from "../../recoil/atom";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import InfoIcon from "../../assets/icons/Info.svg";
import ChatIcon from "@material-ui/icons/Chat";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import AttachIcon from "../../assets/icons/AttachIcon.svg";
import ComponentGenerator from "../ComponentGenerator";
import AddIcon from "@material-ui/icons/Add";
import IconButton from "@material-ui/core/IconButton";
import NcCard from "../NcCard";
import ClearIcon from "@material-ui/icons/Clear";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import RemoveIcon from "@material-ui/icons/Remove";
import {
  TextField,
  InputAdornment,
  Fab,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Divider,
  Modal,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import _, { toInteger } from "lodash";
import FormFieldController from "../../components/FormFieldController";
import { Autocomplete } from "@material-ui/lab";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import { formStepperError } from "../../recoil/atom";
import toFormData from "../../utils/toFormData";
import {
  addAttachment,
  deleteAttachment,
  getAllSuggestions,
  getAuditTemplate,
  getAuditCreationTemplateById,
} from "../../apis/auditApi";
import { API_LINK } from "../../config";
import { Link, useParams } from "react-router-dom";
import CrossIcon from "../../assets/icons/BluecrossIcon.svg";
import useStyles from "./style";
import checkRole from "../../utils/checkRoles";
import { number } from "yup";
import axios from "apis/axios.global";
import { formatDashboardQuery } from "utils/formatDashboardQuery";
import getAppUrl from "utils/getAppUrl";
import TouchAppIcon from "@material-ui/icons/TouchApp";
import { Tour, TourProps } from "antd";
import { generateUniqueId } from "utils/uniqueIdGenerator";

type Props = {
  disabled?: boolean;
};

/**
 * @description Used for defining operator types which makes calculation easier
 */
const operatorType: any = {
  gt: ">",
  lt: "<",
  eq: "==",
  abs: "abs",
};

/**
 * @method evaluateScore
 * @param operator {any}
 * @param value {any}
 * @param operatorValue {any}
 * @param operatorScore {any}
 * @returns the calculated score
 */
const evaluateScore = (
  operator: any,
  value: any,
  operatorValue: any,
  operatorScore: any
) => {
  let result;
  switch (operator) {
    case "gt":
      if (value > operatorValue) result = operatorScore;
      else result = 0;
      break;
    case "lt":
      if (value < operatorValue) result = operatorScore;
      else result = 0;
      break;
    case "eq":
      if (value == operatorValue) result = operatorScore;
      else result = 0;
      break;
    default:
      result = 0;
  }
  return result;
};

const Checklist = ({ disabled }: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const [template, setTemplate] = useRecoilState<any>(auditCreationForm);
  const [displayCard, setDisplayCard] = React.useState(false);
  const [currentQuestionIndex, setcurrentQuestionIndex] = React.useState<any>();
  const [currentSectionIndex, setcurrentSectionIndex] = React.useState<any>();
  const [currentCheckListId, setcurrentCheckListId] = React.useState<any>();
  const [totalQuestions, setTotalQuestions] = React.useState(0);
  const [comments, SetComments] = React.useState("");
  const [sectionsIndex, setsectionIndex] = React.useState<any>();
  const [questionsIndex, setQuestionIndex] = React.useState(0);
  const [defaultValue, setDefaultValue] = React.useState(false);

  const [showModal, setShowModal] = React.useState(false);
  const idParam = useParams();
  const templateData = useRecoilState(templateForm);
  const [formData, setFormData] = useRecoilState<any>(auditFormData);
  const [suggestion, setSuggestion] = React.useState([]);
  const [icon, setIcon] = React.useState(false);
  const [totalScore, setTotalScore] = React.useState<Number | undefined>(
    template?.totalScore
  );
  const setStepperError = useSetRecoilState<boolean>(formStepperError);
  const [value, setValue] = React.useState<any>();
  const [visible, setVisible] = React.useState(false);
  const classes: any = useStyles();
  const isAuditor = checkRole("AUDITOR");
  const isLocAdmin = checkRole("LOCATION-ADMIN");
  const [hoveredUserId, setHoveredUserId] = useState(false);
  const realmName = getAppUrl();
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);

  // useEffect(()=>{
  //   console.log("check formData in checklist page", formData);

  // },[formData])

  /**
   * @method handleImageUpload
   * @description Function to handle file upload. Converts the image to form data before inserting it into the recoil state object.
   * @param e {any}
   * @param sectionIndex {any}
   * @param questionIndex {any}
   */

  // const validationCheck = () => {
  //   if (template?.questionCount) {
  //     setStepperError(false);
  //   } else {
  //     setStepperError(true);
  //   }
  // };

  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

  console.log("template ready", template);
  const handleLinkClick = async (item: any) => {
    const finalLink =
      process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
        ? item?.image
        : await viewObjectStorageDoc(item?.image);
    const anchor = document.createElement("a");
    anchor.href = finalLink || "#";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
    // Your custom logic for link click goes here
    // event.preventDefault();
  };


  const handleImageUpload = (
    e: any,
    indextemp: any,
    sectionIndex: any,
    questionIndex: any
  ) => {
    let formData = new FormData();
    formData.append("file", e.target.files[0]);
    let copyData = JSON.parse(JSON.stringify(template));

    const data =
      copyData[indextemp].sections[sectionIndex].fieldset[questionIndex]["nc"]
        ?.evidence;



    if (data === undefined) {
      addAttachment(
        formData,
        realmName,
        loggedInUser.location.locationName
      ).then((response: any) => {
        const attachmentData = {
          text: "",
          attachment: [
            {
              uid: generateUniqueId(10),
              name: response?.data.name,
              url: response?.data.path,
              status: "done",
            },
          ],
          refernce:[]
        };

        setTemplate((prev: any) => {
          copyData[indextemp].sections[sectionIndex].fieldset[questionIndex][
            "nc"
          ].evidence= [attachmentData];

          return copyData;
        });
      });
    } else {
      addAttachment(
        formData,
        realmName,
        loggedInUser.location.locationName
      ).then((response: any) => {
        const oldData =
          copyData[indextemp].sections[sectionIndex].fieldset[questionIndex][
            "nc"
          ].evidence[0].attachment;
        const attachmentData: any = [
          {
            text: "",
            attachment: [
              {
                uid: generateUniqueId(10),
                name: response?.data.name,
                url: response?.data.path,
                status: "done",
              },
            ],
          },
        ];

        setTemplate((prev: any) => {
          copyData[indextemp].sections[sectionIndex].fieldset[questionIndex][
            "nc"
          ].evidence[0] = attachmentData;

          return copyData;
        });
      });
    }
  };
  /**
   * @method fetchSuggestionsList
   * @description Function to fetch suggestions list
   * @param searchText {string}
   * @returns suggestions {array}
   */
  // const fetchSuggestionsList = () => {
  //   getAllSuggestions(formData.location).then((res: any) => {
  //     setSuggestion(res?.data);
  //   });
  // };
  /**
   * @method handleChange
   * @description Function to handle form input changes in the checklist
   * @param e {any}
   * @returns nothing
   */
  const handleChange = (
    e: any,
    value: any,
    indextemp: any,
    sectionIndex: any,
    questionIndex: any
  ) => {
    if (e.target.name === "radio") {
      const checklistData = JSON.parse(JSON.stringify(template));
      if (e.target.value === "yes") {
        setTemplate((prev: any) => {
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].value =
            checklistData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].options[0].name;
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].questionScore =
            checklistData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].options[0].value;
          // return { ...prev, ...checklistData };
          return checklistData;
        });
      }
      if (e.target.value === "no") {
        setTemplate((prev: any) => {
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].value =
            checklistData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].options[1].name;
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].questionScore =
            checklistData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].options[1].value;
          // return { ...prev, ...checklistData };
          return checklistData;
        });
      }
      if (e.target.value === "na") {
        setTemplate((prev: any) => {
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].value =
            checklistData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].options[2].name;
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].questionScore =
            checklistData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].options[2].value;
          // return { ...prev, ...checklistData };
          return checklistData;
        });
      }
    } else if (e.target.name === "yes") {
      const checklistData = JSON.parse(JSON.stringify(template));
      setTemplate((prev: any) => {
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].options.splice(1, 1, {
          ...checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].options[1],
          checked: false,
        });
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].options.splice(0, 1, {
          ...checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].options[0],
          checked:
            !checklistData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].options[0].checked,
        });

        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].questionScore = parseInt(
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].options[0].value
        );
        // return { ...prev, ...checklistData };
        return checklistData;
      });
    } else if (e.target.name === "no") {
      const checklistData = JSON.parse(JSON.stringify(template));
      setTemplate((prev: any) => {
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].options.splice(0, 1, {
          ...checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].options[0],
          checked: false,
        });
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].options.splice(1, 1, {
          ...checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].options[1],
          checked:
            !checklistData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].options[1].checked,
        });

        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].questionScore = parseInt(
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].options[1].value
        );

        // return { ...prev, ...checklistData };
        return checklistData;
      });
    } else if (e.target.name === "text") {
      const checklistData = JSON.parse(JSON.stringify(template));
      setTemplate((prev: any) => {
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].value = e.target.value;
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].nc.comment = defaultValue ? e.target.value : "";
        return checklistData;
      });
    } else if (e.target.name === undefined && value) {
      const checklistData = JSON.parse(JSON.stringify(template));
      let numericTotalScore = 0;
      const name0 =
        checklistData[indextemp].sections[sectionIndex].fieldset[questionIndex]
          .score[0].name;
      if (name0 === "abs") {
        numericTotalScore = value;
      } else {
        let optionOne = evaluateScore(
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[0].name,
          value,
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[0].value,
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[0].score
        );
        let optionTwo = evaluateScore(
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[1].name,
          value,
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[1].value,
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[1].score
        );

        numericTotalScore = optionOne + optionTwo;
      }

      setTemplate((prev: any) => {
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].value = value;
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].questionScore = numericTotalScore;
        // return { ...prev, ...checklistData };
        return checklistData;
      });
    } else if (e.target.name === "numericText") {
      const checklistData = JSON.parse(JSON.stringify(template));
      let numericTotalScore = 0;
      const name0 =
        checklistData[indextemp].sections[sectionIndex].fieldset[questionIndex]
          .score[0].name;
      if (name0 === "abs") {
        const absMin =
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[0].value;
        const absMax =
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[1].value;
        if (e.target.value >= absMin && e.target.value <= absMax) {
          numericTotalScore = parseInt(e.target.value);
        } else {
          numericTotalScore = 0;
        }
      } else {
        let optionOne = evaluateScore(
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[0].name,
          e.target.value,
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[0].value,
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[0].score
        );
        let optionTwo = evaluateScore(
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[1].name,
          e.target.value,
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[1].value,
          checklistData[indextemp].sections[sectionIndex].fieldset[
            questionIndex
          ].score[1].score
        );

        numericTotalScore = optionOne + optionTwo;
      }

      setTemplate((prev: any) => {
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].value = e.target.value as number;
        checklistData[indextemp].sections[sectionIndex].fieldset[
          questionIndex
        ].questionScore = numericTotalScore;
        // return { ...prev, ...checklistData };
        return checklistData;
      });
    }
  };

  //?copyData.sections[index].fieldset[itemIndex].value
  const handleChangeNew = (
    event: any,
    value: any,
    itemIndex: any,
    index: any
  ) => {
    if (event === "mainComments") {
      setTemplate((prev: any) => {
        let copyData = JSON.parse(JSON.stringify(template));
        copyData.sections[index].fieldset[itemIndex].nc.mainComments = value;

        return { ...prev, ...copyData };
      });
      setShowModal(false);
    } else if (event.target.value === "zero") {
      setTemplate((prev: any) => {
        let copyData = JSON.parse(JSON.stringify(template));

        copyData.sections[index].fieldset[itemIndex].nc = {
          ...copyData.sections[index].fieldset[itemIndex].nc,
          type: "NC",
          clause: "",
          severity: "",
        };
        setIcon(false);
        setDisplayCard(true);
        return { ...prev, ...copyData };
      });
    } else if (event.target.value === "one") {
      setTemplate((prev: any) => {
        let copyData = JSON.parse(JSON.stringify(template));
        copyData.sections[index].fieldset[itemIndex].nc = {
          ...copyData.sections[index].fieldset[itemIndex].nc,
          type: "NC",
          clause: "",
          severity: "",
          // Comment:copyData.sections[index].fieldset[itemIndex].inputType==='text'?copyData.sections[index].fieldset[itemIndex].value:""
        };
        setIcon(false);
        setDisplayCard(true);
        return { ...prev, ...copyData };
      });
    } else if (event.target.value === "two") {
      setTemplate((prev: any) => {
        let copyData = JSON.parse(JSON.stringify(template));
        copyData.sections[index].fieldset[itemIndex].nc = {
          ...copyData.sections[index].fieldset[itemIndex].nc,
          type: "Observation",
          clause: "",
          severity: "",
        };
        setDisplayCard(true);
        setIcon(false);
        return { ...prev, ...copyData };
      });
    } else if (event.target.value === "three") {
      setTemplate((prev: any) => {
        let copyData = JSON.parse(JSON.stringify(template));
        copyData.sections[index].fieldset[itemIndex].nc = {
          ...copyData.sections[index].fieldset[itemIndex].nc,
          type: "",
          clause: "",
          severity: "",
        };
        setIcon(true);
        setDisplayCard(false);
        return { ...prev, ...copyData };
      });
    }

    setValue(event === "mainComments" ? "" : event.taget.value);

    setcurrentQuestionIndex(itemIndex);
    setcurrentSectionIndex(index);
  };

  /**
   * @method calculateTotalScore
   * @description Function to calculate total score
   * @returns nothing
   */
  // const calculateTotalScore = () => {
  //   let total = 0;
  //   template?.sections?.map((item: any) => {
  //     let sum = _.sumBy(item.fieldset, (obj: any) => {
  //       return obj.questionScore;
  //     });
  //     total = total + sum;
  //   });
  //   setTotalScore(total);
  // };

  const getAllSuggestions = async () => {
    const res = await axios.get(
      `api/audit-template/getAllAuditTemplatesByLocation/${formData?.location}`
    );
    setSuggestion(res.data);
  };

  useEffect(() => {
    getAllSuggestions();
    // fetchSuggestionsList();
    if (formData?.auditTemplate) {
      fetchAuditTemplateById(formData?.auditTemplate);
    }

    if (formData.selectedTemplates.length > 0) {
      getList(formData.selectedTemplates);
    }
    if (idParam.id) {
      setStepperError(false);
    }
  }, []);

  // useEffect(() => {
  //   validationCheck();
  // }, [template]);

  // useEffect(() => {
  //   setTemplate([
  //     {
  //       ...template,
  //       totalScore: totalScore,
  //     },
  //   ]);
  // }, [totalScore]);

  // useEffect(() => {
  //   calculateTotalScore();
  // }, [template]);

  /**
   * @method clearFile
   * @description Function to clear a file
   * @param sectionIndex {any}
   * @param questionIndex {any}
   * @returns nothing
   */
  const clearFile = (indextemp: any, sectionIndex: any, questionIndex: any) => {
    try {
      let copyData = JSON.parse(JSON.stringify(template));
      deleteAttachment({
        path: copyData[indextemp]?.sections[sectionIndex]?.fieldset[
          questionIndex
        ]?.image,
      })?.then((response: any) => {
        if (response?.data?.status === 200) {
          setTemplate((prev: any) => {
            copyData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].imageName = "";
            copyData[indextemp].sections[sectionIndex].fieldset[
              questionIndex
            ].image = "";
            return copyData;
          });
        }
      });
    } catch {
      console.error("error occured");
    }
  };

  /**
   * @method fetchAuditTemplateById
   * @description Function to fetch audit template by its id
   * @param id {string}
   * @returns nothing
   */
  const fetchAuditTemplateById = async (ids: string) => {
    let data: any;
    setIcon(false);
    // setTemplate([]);
    setDisplayCard(false);
    const url = formatDashboardQuery(
      `/api/audit-template/getmultipleTemplates`,
      { id: ids }
    );
    const response = await axios.get(url);

    const selectedChecklistIds = template?.map((item: any) => item.id);

    let finalTemplate = [];
    for (let value of response?.data) {
      if (selectedChecklistIds.includes(value.id)) {
        const pushData = template.filter((item: any) => item.id === value.id);
        finalTemplate.push(...pushData);
      } else {
        finalTemplate.push(value);
      }
    }
    setTemplate(finalTemplate);

    // getAuditCreationTemplateById(ids).then((response: any) => {
    //   // console.log("check in fetchAuditTemplateById", response?.data);

    //   setTemplate({ ...template, ...response?.data });
    // });
  };

  const data = (id: string) => {
    getAuditTemplate(id).then((res: any) => {
      setDefaultValue(res?.data?.status);
    });
  };
  /**
   * @method scrollToTop
   * @description Function for scrolling to top of the page
   * @returns nothing
   */
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /**
   * @method toggleVisible
   * @description Function to toggle the visibility of the scroll to top button
   * @returns nothing
   */
  const toggleVisible = () => {
    const scrolled = document?.documentElement?.scrollTop;
    if (scrolled > 300) {
      setVisible(true);
    } else if (scrolled <= 300) {
      setVisible(false);
    }
  };
  window.addEventListener("scroll", toggleVisible);

  const getList = (value: any) => {
    const ids = value.map((item: any) => item._id);
    fetchAuditTemplateById(ids);
    data(value._id);
  };

  const refForReportForm13 = useRef(null);
  const refForReportForm14 = useRef(null);
  const refForReportForm15 = useRef(null);
  const refForReportForm16 = useRef(null);
  const refForReportForm17 = useRef(null);
  const refForReportForm18 = useRef(null);
  const refForReportForm19 = useRef(null);
  const refForReportForm20 = useRef(null);

  const [openTourForReportFormCL1, setOpenTourForReportFormCL1] =
    useState<boolean>(false);

  const stepsForReportFormCL1: TourProps["steps"] = [
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm13.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm14.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm15.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm16.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm17.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm18.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm19.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm20.current,
    },
  ];

  return (
    <>
      {/* <div
              // style={{ position: "fixed", top: "77px", right: "120px" }}
              style={{width:"97%",display:"flex",justifyContent:"end" }}
              >
                <TouchAppIcon
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setOpenTourForReportFormCL1(true);
                  }}
                />
              </div> */}
      <div className={classes.root}>
        <div className={classes.checklistHeader}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6}>
              <FormFieldController label="Use Checklist">
                <Box width="100%">
                  {/* <Autocomplete
                  // disabled={formData.auditTemplate ? false : disabled}
                  fullWidth
                  id="combo-box-demo"
                  options={suggestion}
                  size="small"
                  onChange={(e: any, value: any) => {
                    fetchAuditTemplateById(value._id);
                    data(value._id);
                  }}
                  getOptionLabel={(option: any) => option?.title}
                  renderInput={(params: any) => (
                    
                    <TextField
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon
                              style={{ fontSize: 18, paddingLeft: 5 }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      placeholder="Search template"
                      variant="outlined"
                      size="small"
                    />
                  )}
                /> */}
                  <div ref={refForReportForm13}>
                    <Autocomplete
                      disabled={disabled}
                      fullWidth
                      id="combo-box-demo"
                      multiple={true}
                      value={formData.selectedTemplates}
                      options={suggestion}
                      size="small"
                      onChange={(e, value) => {
                        setFormData({
                          ...formData,
                          selectedTemplates: value,
                        });
                        getList(value);
                        // data(value._id);
                      }}
                      filterSelectedOptions
                      getOptionSelected={(option, value) => {
                        return option._id === value._id;
                      }}
                      getOptionLabel={(option) => {
                        return option?.title;
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Checklist"
                          variant="outlined"
                          // style={{ color: "black" }}
                          // placeholder="options"
                        />
                      )}
                    />
                  </div>
                </Box>
              </FormFieldController>
            </Grid>

            {/* <Grid item xs={12} sm={12} md={6} className={classes.headerInfo}>
            <div className={classes.questions}>
              <Typography variant="body2">
                Total number of questions : {template?.questionCount}
              </Typography>
            </div>
            <div className={classes.score}>
              <Typography variant="body2">
                Score {template?.totalScore ?? 0}
              </Typography>
            </div>
          </Grid> */}
          </Grid>
        </div>

        <Box display="flex" flexDirection="column" alignItems="center">
          <Box
            display="flex"
            flexDirection="column"
            gridGap={10}
            width="100%"
            // maxWidth={900}
          >
            {/* {Object.keys(template).length === 1 ? ( */}
            {formData?.selectedTemplates <= 0 ? (
              <Typography
                variant="body2"
                align="center"
                style={{
                  color: "gray",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ height: 20 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Please select a template to display the checklist
              </Typography>
            ) : (
              template?.map((itemTemp: any, indextemp: any) => (
                <Accordion
                  style={{
                    width: "100% !important",
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                      ref={refForReportForm14}
                    >
                      <div style={{ justifyContent: "flex-start" }}>
                        <Typography
                          style={{
                            fontWeight: 700,
                            fontSize: matches ? "16px" : "12px",
                          }}
                        >
                          {itemTemp.title}
                        </Typography>
                      </div>
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <div
                          style={{
                            justifyContent: "flex-end",
                            paddingRight: "50px",
                          }}
                        >
                          <Typography
                            style={{
                              fontWeight: 700,
                              fontSize: matches ? "16px" : "12px",
                              marginLeft: matches ? "0px" : "30px",
                            }}
                          >
                            Total number of questions {itemTemp.questionCount}
                          </Typography>
                        </div>
                        <div
                          style={{ justifyContent: "flex-end" }}
                          onMouseEnter={() => {
                            setHoveredUserId(true);
                          }}
                          onMouseLeave={() => {
                            setHoveredUserId(false);
                          }}
                        >
                          <Typography
                            style={{
                              fontWeight: 700,
                              fontSize: matches ? "16px" : "12px",
                            }}
                          >
                            Score{" "}
                            {itemTemp.sections.reduce(
                              (acc: any, section: { fieldset: any[] }) => {
                                const sectionScore = section.fieldset.reduce(
                                  (
                                    sectionTotal: any,
                                    fieldset: { questionScore: any }
                                  ) => {
                                    return (
                                      sectionTotal + fieldset.questionScore
                                    );
                                  },
                                  0
                                );
                                return acc + sectionScore;
                              },
                              0
                            )}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </AccordionSummary>

                  <div style={{ display: "flex", flexDirection: "row" }}>
                    <div style={{ flex: 7 }}>
                      <AccordionDetails
                        style={{
                          width: "90% !important",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "90%",
                          }}
                        >
                          {itemTemp?.sections?.map(
                            (item: any, index: number) => (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  width: "90%",
                                }}
                              >
                                <div className={classes.sectionHeader}>
                                  <Typography className={classes.text}>
                                    {index + 1}.
                                  </Typography>

                                  <Typography className={classes.text}>
                                    <strong>{item?.title}</strong>
                                  </Typography>
                                </div>

                                {item?.fieldset?.map(
                                  (item: any, itemIndex: number) => (
                                    <>
                                      <div>
                                        <div
                                          className={classes.questionContainer}
                                          ref={refForReportForm15}
                                        >
                                          <div
                                            className={classes.questionHeader}
                                          >
                                            <Typography
                                              className={classes.text}
                                            >
                                              {index + 1}.{itemIndex + 1}
                                            </Typography>
                                            <Typography
                                              className={classes.text}
                                            >
                                              {item?.title}
                                            </Typography>
                                            <Tooltip
                                              title={item?.hint}
                                              enterTouchDelay={0}
                                            >
                                              <img src={InfoIcon} alt="info" />
                                            </Tooltip>
                                            {template[itemTemp]?.sections[index]
                                              ?.fieldset[itemIndex].nc.type ===
                                            "NC" ? (
                                              <span className={classes.ncTag}>
                                                NC
                                              </span>
                                            ) : template[itemTemp]?.sections[
                                                index
                                              ]?.fieldset[itemIndex].nc.type ===
                                              "Observation" ? (
                                              <span className={classes.obsTag}>
                                                Obs
                                              </span>
                                            ) : template[itemTemp]?.sections[
                                                index
                                              ]?.fieldset[itemIndex].nc.type ===
                                              "OFI" ? (
                                              <span className={classes.ofiTag}>
                                                OFI
                                              </span>
                                            ) : (
                                              ``
                                            )}
                                          </div>
                                          <div
                                            style={{
                                              display: "flex",
                                              justifyContent: "flex-start",
                                            }}
                                          >
                                            {defaultValue ? (
                                              <Grid container>
                                                <Grid
                                                  item
                                                  sm={8}
                                                  md={2}
                                                  className={
                                                    classes.formTextPadding
                                                  }
                                                >
                                                  <strong>
                                                    Ranked Response
                                                  </strong>
                                                </Grid>
                                                <FormControl>
                                                  <Select
                                                    style={{ padding: "3px" }}
                                                    type="any"
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    value={value}
                                                    name="checkOne"
                                                    label="Ranked Response"
                                                    onChange={(e) => {
                                                      return handleChangeNew(
                                                        e,
                                                        value,
                                                        itemIndex,
                                                        index
                                                      );
                                                    }}
                                                  >
                                                    <MenuItem value="zero">
                                                      0
                                                    </MenuItem>
                                                    <MenuItem value="one">
                                                      1
                                                    </MenuItem>
                                                    <MenuItem value="two">
                                                      2
                                                    </MenuItem>
                                                    <MenuItem value="three">
                                                      3
                                                    </MenuItem>
                                                  </Select>
                                                </FormControl>
                                              </Grid>
                                            ) : (
                                              ""
                                            )}
                                          </div>
                                          <div>
                                            <Modal
                                              open={showModal}
                                              aria-labelledby="simple-modal-title"
                                              aria-describedby="simple-modal-description"
                                              style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                              }}
                                            >
                                              <Box
                                                maxWidth="500vw"
                                                mx="auto"
                                                my={4}
                                                p={3}
                                                style={{
                                                  backgroundColor: "#ffffff",
                                                }}
                                              >
                                                <div>
                                                  <Typography variant="h6">
                                                    Add Comments
                                                  </Typography>
                                                  <Divider />

                                                  <form>
                                                    <Grid
                                                      container
                                                      style={{
                                                        paddingTop: "30px",
                                                      }}
                                                    >
                                                      <Grid
                                                        item
                                                        sm={12}
                                                        md={12}
                                                      >
                                                        <Grid
                                                          item
                                                          sm={2}
                                                          md={2}
                                                          className={
                                                            classes.formTextPadding
                                                          }
                                                        >
                                                          <strong>
                                                            Comments*
                                                          </strong>
                                                        </Grid>
                                                        <Grid
                                                          item
                                                          sm={12}
                                                          md={8}
                                                          className={
                                                            classes.formBox
                                                          }
                                                        >
                                                          <TextField
                                                            fullWidth
                                                            variant="outlined"
                                                            label="Comments"
                                                            value={
                                                              template[itemTemp]
                                                                ?.sections[
                                                                sectionsIndex
                                                              ]?.fieldset[
                                                                questionsIndex
                                                              ]?.nc
                                                                ?.mainComments ||
                                                              comments
                                                            }
                                                            multiline
                                                            rows={4}
                                                            onChange={(e) => {
                                                              // console.log("value of comments",e.target.value)
                                                              // template?.sections[sectionsIndex]?.fieldset[questionsIndex]?.nc?.mainComments||comments
                                                              SetComments(
                                                                e.target.value
                                                              );
                                                            }}
                                                            name="mainComments"
                                                            // Add value and onChange handlers here
                                                          />
                                                        </Grid>
                                                      </Grid>
                                                    </Grid>

                                                    <Box
                                                      width="100%"
                                                      display="flex"
                                                      justifyContent="center"
                                                      pt={2}
                                                    >
                                                      <Button
                                                        className={
                                                          classes.buttonColor
                                                        }
                                                        variant="outlined"
                                                        onClick={() => {
                                                          setShowModal(false);
                                                        }}
                                                      >
                                                        Cancel
                                                      </Button>

                                                      <Button
                                                        variant="contained"
                                                        color="primary"
                                                        value="mainComments"
                                                        onClick={(e) => {
                                                          return handleChangeNew(
                                                            "mainComments",
                                                            comments,
                                                            itemIndex,
                                                            index
                                                          );
                                                          // Handle submit logic here
                                                        }}
                                                      >
                                                        Submit
                                                      </Button>
                                                    </Box>
                                                  </form>
                                                </div>
                                              </Box>
                                            </Modal>
                                          </div>

                                          {/* <ChatIcon
                              onClick={() => {
                                setsectionIndex(item);
                                setQuestionIndex(itemIndex);
                                setShowModal(!showModal);
                                // setsectionIndex(item)
                                // setQuestionIndex(itemIndex)
                              }}
                            /> */}
                                          <Grid container spacing={3}>
                                            <Grid item xs={12} sm={12} md={8}>
                                              <ComponentGenerator
                                                // disabled={formData.auditTemplate ? false : disabled}
                                                disabled={disabled}
                                                type={item.inputType}
                                                handler={(e: any, value: any) =>
                                                  handleChange(
                                                    e,
                                                    value,
                                                    indextemp,
                                                    index,
                                                    itemIndex
                                                  )
                                                }
                                                inputHandlerType={
                                                  item.inputType ===
                                                    "numeric" && item.slider
                                                    ? InputHandlerType.SLIDER
                                                    : InputHandlerType.TEXT
                                                }
                                                numericData={
                                                  item.inputType ===
                                                    "numeric" && item.slider
                                                    ? item.score
                                                    : ""
                                                }
                                                radioData={
                                                  item.inputType === "radio" ||
                                                  item.inputType === "checkbox"
                                                    ? item.options
                                                    : ""
                                                }
                                                textValue={item.value}
                                                min={
                                                  item.inputType ===
                                                    "numeric" &&
                                                  item.score[0].name === "abs"
                                                    ? item.score[0].value
                                                    : 0
                                                }
                                                max={
                                                  item.inputType ===
                                                    "numeric" &&
                                                  item.score[1].name === "abs"
                                                    ? item.score[1].value
                                                    : 10
                                                }
                                              />
                                            </Grid>

                                            <Grid item xs={6} sm={6} md={4}>
                                              <div
                                                className={
                                                  classes.attachBtnContainer
                                                }
                                              >
                                                {/* <label htmlFor="contained-button-file"> */}
                                                <Button
                                                  variant="contained"
                                                  component="label"
                                                  disabled={
                                                    !item.allowImageUpload
                                                  }
                                                  className={
                                                    classes.attachButton
                                                  }
                                                  size="large"
                                                  startIcon={
                                                    <img
                                                      src={AttachIcon}
                                                      alt=""
                                                    />
                                                  }
                                                  disableElevation
                                                >
                                                  <input
                                                    accept="image/*"
                                                    // id="contained-button-file"
                                                    onChange={(e: any) => {
                                                      handleImageUpload(
                                                        e,
                                                        indextemp,
                                                        index,
                                                        itemIndex
                                                      );
                                                      e.target.value = "";
                                                    }}
                                                    multiple
                                                    type="file"
                                                    disabled={
                                                      !item.allowImageUpload
                                                    }
                                                    hidden
                                                  />
                                                  Attach
                                                </Button>
                                                {console.log(
                                                  "data in image",
                                                  item
                                                )}
                                                {item.imageName && (
                                                  <Box
                                                    display="flex"
                                                    alignItems="center"
                                                  >
                                                    <Tooltip
                                                      title={item.imageName}
                                                      arrow
                                                    >
                                                      <Typography
                                                        variant="body2"
                                                        className={
                                                          classes.fileName
                                                        }
                                                        onClick={() =>
                                                          handleLinkClick(item)
                                                        }
                                                      >
                                                        {item.imageName}
                                                      </Typography>
                                                    </Tooltip>
                                                    <IconButton
                                                      disabled={
                                                        formData.auditTemplate
                                                          ? false
                                                          : disabled
                                                      }
                                                      onClick={() =>
                                                        clearFile(
                                                          indextemp,
                                                          index,
                                                          itemIndex
                                                        )
                                                      }
                                                      className={
                                                        classes.clearBtn
                                                      }
                                                    >
                                                      <ClearIcon />
                                                    </IconButton>
                                                  </Box>
                                                )}
                                              </div>
                                            </Grid>

                                            <Grid
                                              item
                                              xs={6}
                                              className={
                                                classes.addBtnMobileContainer
                                              }
                                            >
                                              <IconButton
                                                disabled={
                                                  formData.auditTemplate
                                                    ? false
                                                    : disabled
                                                }
                                                className={classes.attachButton}
                                                onClick={() => {
                                                  if (
                                                    displayCard &&
                                                    currentQuestionIndex ===
                                                      itemIndex &&
                                                    currentSectionIndex ===
                                                      index &&
                                                    currentCheckListId ===
                                                      itemTemp.id
                                                  ) {
                                                    setDisplayCard(false);
                                                  } else {
                                                    setDisplayCard(true);
                                                    setcurrentQuestionIndex(
                                                      itemIndex
                                                    );
                                                    setcurrentSectionIndex(
                                                      index
                                                    );
                                                    setcurrentCheckListId(
                                                      itemTemp.id
                                                    );
                                                  }
                                                }}
                                              >
                                                <div>
                                                  {displayCard &&
                                                  currentQuestionIndex ===
                                                    itemIndex &&
                                                  currentSectionIndex ===
                                                    index &&
                                                  currentCheckListId ===
                                                    itemTemp.id ? (
                                                    <RemoveIcon />
                                                  ) : (
                                                    <AddIcon />
                                                  )}
                                                </div>
                                              </IconButton>
                                            </Grid>
                                          </Grid>

                                          <IconButton
                                            ref={refForReportForm16}
                                            disabled={
                                              formData.auditTemplate
                                                ? false
                                                : disabled
                                            }
                                            className={
                                              classes.attachButtonRight
                                            }
                                            onClick={() => {
                                              if (
                                                displayCard &&
                                                currentQuestionIndex ===
                                                  itemIndex &&
                                                currentSectionIndex === index &&
                                                currentCheckListId ===
                                                  itemTemp.id
                                              ) {
                                                setDisplayCard(false);
                                              } else {
                                                setDisplayCard(true);
                                                setcurrentQuestionIndex(
                                                  itemIndex
                                                );
                                                setcurrentSectionIndex(index);
                                                setcurrentCheckListId(
                                                  itemTemp.id
                                                );
                                              }
                                            }}
                                          >
                                            {displayCard &&
                                            currentQuestionIndex ===
                                              itemIndex &&
                                            currentSectionIndex === index &&
                                            currentCheckListId ===
                                              itemTemp.id ? (
                                              <RemoveIcon />
                                            ) : (
                                              <AddIcon />
                                            )}
                                          </IconButton>
                                        </div>

                                        {displayCard &&
                                          currentQuestionIndex === itemIndex &&
                                          currentSectionIndex === index &&
                                          currentCheckListId ===
                                            itemTemp.id && (
                                            <NcCard
                                              key={index}
                                              sectionIndex={index}
                                              questionIndex={itemIndex}
                                              status={defaultValue}
                                              checkListIndex={indextemp}
                                              auditTypeId={formData.auditType}
                                              closeCard={() =>
                                                setDisplayCard(false)
                                              }
                                              refForReportForm17={
                                                refForReportForm17
                                              }
                                              refForReportForm18={
                                                refForReportForm18
                                              }
                                              refForReportForm19={
                                                refForReportForm19
                                              }
                                              refForReportForm20={
                                                refForReportForm20
                                              }
                                            />
                                          )}
                                      </div>
                                    </>
                                  )
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </AccordionDetails>
                    </div>
                    <div style={{ flex: 3 }}>
                      {hoveredUserId && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                          }}
                        >
                          {itemTemp.sections.map(
                            (
                              section: { title: string; fieldset: any },
                              index: number
                            ) => (
                              <div key={index} style={{ paddingRight: "30px" }}>
                                <div>
                                  {section.title} :{" "}
                                  {section.fieldset.reduce(
                                    (sectionTotal: any, fieldset: any) => {
                                      return (
                                        sectionTotal + fieldset.questionScore
                                      );
                                    },
                                    0
                                  )}{" "}
                                  /{" "}
                                  {section.fieldset.reduce(
                                    (sectionTotal: any, fieldset: any) => {
                                      let maxScore = 0;
                                      if (fieldset.inputType === "checkbox") {
                                        maxScore = Math.max(
                                          fieldset.options[0]?.value || 0,
                                          fieldset.options[1]?.value || 0
                                        );
                                      } else if (
                                        fieldset.inputType === "radio"
                                      ) {
                                        maxScore = Math.max(
                                          fieldset.options[0]?.value || 0,
                                          fieldset.options[1]?.value || 0,
                                          fieldset.options[2]?.value || 0
                                        );
                                      } else if (
                                        fieldset.inputType === "numeric"
                                      ) {
                                        maxScore = Math.max(
                                          fieldset.score[0]?.score || 0,
                                          fieldset.score[1]?.score || 0
                                        );
                                      } else {
                                        maxScore = 0;
                                      }
                                      return sectionTotal + maxScore;
                                    },
                                    0
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Accordion>
              ))
            )}
          </Box>
        </Box>
        {visible && (
          <Tooltip title="Scroll To Top">
            <Fab
              size="medium"
              data-testid="fabMobile"
              onClick={scrollToTop}
              className={classes.fabBtn}
            >
              <ArrowUpwardIcon />
            </Fab>
          </Tooltip>
        )}
      </div>

      <Tour
        open={openTourForReportFormCL1}
        onClose={() => setOpenTourForReportFormCL1(false)}
        steps={stepsForReportFormCL1}
      />
    </>
  );
};

export default Checklist;
