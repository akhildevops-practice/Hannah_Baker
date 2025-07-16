//react
import { useState, useEffect } from "react";

//mui
import { Typography, Grid, TextField } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
//antd
import type { CheckboxChangeEvent } from "antd/es/checkbox";

//assets
import riskGuideline from "assets/images/riskGuideline.png";

//utils
// import { HiraConfigSchema, RiskConfigSchema } from "schemas/riskConfigSchema";
import checkRoles from "utils/checkRoles";
import useStyles from "./styles";
import { useSnackbar } from "notistack";

//components
import RiskMatrixTable from "components/RiskRegister/RiskConfiguration/RiskConfifurationFormStepper/RiskConfigurationStepperForm2/RiskMatrixTable";
import RiskLevelIndicatorTable from "components/RiskRegister/RiskConfiguration/RiskConfifurationFormStepper/RiskConfigurationStepperForm2/RiskLevelIndicatorTable";
//components
import DynamicFormFields from "components/DynamicFormFields";
import HiraMatrixTable from "./HiraMatrixTable";
import { Button, Popover } from "antd";
import axios from "apis/axios.global";
import { roles } from "utils/enums";
// import checkRoles from "utils/checkRoles";
import getSessionStorage from "utils/getSessionStorage";
import { validateTitle } from "utils/validateInput";
interface Props {
  hiraConfigData: any;
  setHiraConfigData: (data: any) => void;
  edit?: boolean;
  id?: string;
}

const HiraConfigurationTab = ({
  hiraConfigData,
  setHiraConfigData,
  edit,
  id,
}: Props) => {
  const [tableData, setTableData] = useState<any>([]);
  const [tableDataS, setTableDataS] = useState<any>([]);
  const [headerValues, setHeaderValues] = useState<any>([
    "Criteria Type",
    "1",
    "2",
    "3",
    "4",
    "5",
  ]);
  const userDetails = getSessionStorage();
  // const isMR = checkRoles(roles.MR);
  const isMCOE = checkRoles("ORG-ADMIN") && !!userDetails?.location?.id;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const EMPTY_ROW = {
    criteriaType: "",
    score1Text: "",
    score2Text: "",
    score3Text: "",
    score4Text: "",
    score5Text: "",
  };

  const EMPTY_ROW_S = {
    riskIndicator: "",
    // riskColor : "",
    riskLevel: "",
    description : "",
  };

  const cols = [
    {
      header: " ",
      accessorKey: "criteriaType",
    },
    {
      header: "1",
      accessorKey: "score1Text",
    },
    {
      header: "2",
      accessorKey: "score2Text",
    },
    {
      header: "3",
      accessorKey: "score3Text",
    },
    {
      header: "4",
      accessorKey: "score4Text",
    },
    {
      header: "5",
      accessorKey: "score5Text",
    },
  ];

  //below text and content for info icon popover in config tab

  const text = <span>Risk Guideline</span>;

  const content = (
    <div>
      <img src={riskGuideline} alt="risk-guideline" />
    </div>
  );

  useEffect(() => {
    console.log("checkrisk risk level  tableData", tableDataS);
  }, [tableDataS]);

  const significanceCols = [
    {
      header: "Risk Indicator*",
      accessorKey: "riskIndicator",
    },
    {
      header: "Description*",
      accessorKey: "description",
    },
    {
      header: "Risk Level*",
      accessorKey: "riskLevel",
    },
  ];
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isMR = checkRoles("MR");
  const canEdit = isOrgAdmin || isMR;

  // useEffect(() => {
  //   console.log(
  //     "checkrisk useEffect[headerValues] in hira config tab",
  //     headerValues
  //   );
  // }, [headerValues]);

  // useEffect(() => {
  //   console.log("checkrisk useEffect[hiraConfigData]", hiraConfigData);
  // }, [hiraConfigData]);

  useEffect(() => {
    //if edit is true, then populate the table with data for hiraMatrixData and riskFactorial table
    if (edit) {
      setHeaderValues(
        hiraConfigData?.hiraMatrixHeader?.length
          ? hiraConfigData.hiraMatrixHeader?.map((item: any) => {
              if (!item) return "";
              else return item;
            })
          : ["Criteria Type", "1", "2", "3", "4", "5"]
      );
      const hiraMatrixData = hiraConfigData?.hiraMatrixData as any[];
      if (hiraMatrixData.length > 0 && canEdit) {
        if (!hasEmptyObjectInArray(hiraMatrixData)) {
          //push EMPTY_ROW if there is no empty row
          hiraMatrixData.push(EMPTY_ROW);
        }
      } else {
        //push empty row if the array is empty
        if (canEdit) hiraMatrixData.push(EMPTY_ROW);
      }

      const riskLevelData = hiraConfigData?.riskLevelData as any[];
      // console.log("risk significance data", riskSignificanceData);

      if (riskLevelData?.length > 0 && canEdit) {
        if (!hasEmptyObjectInArrayS(riskLevelData)) {
          riskLevelData.push(EMPTY_ROW_S);
        }
      } else {
        if (canEdit) riskLevelData.push(EMPTY_ROW_S);
      }

      setTableData([...hiraMatrixData]);

      setTableDataS([...riskLevelData]);
    }
    //if edit is false, then populate the table with empty row
    else {
      const hiraMatrixData = [],
        riskLevelData = [];
      hiraMatrixData.push(EMPTY_ROW);

      riskLevelData.push(EMPTY_ROW_S);
      setTableData([...hiraMatrixData]);

      setTableDataS([...riskLevelData]);
    }
  }, [hiraConfigData]);

  // useEffect(() => {
  //   console.log("checkrisk useEffect[hiraConfigData]", hiraConfigData);
  // }, [hiraConfigData]);

  //util function used to check riskFactorial and hiraMatrixData arrays for empty objects
  const hasEmptyObjectInArray = (array: any[]) => {
    return array.some((item) => {
      return (
        item.criteriaType === "" &&
        item.score1Text === "" &&
        item.score2Text === "" &&
        item.score3Text === "" &&
        item.score4Text === "" &&
        item.score5Text === ""
      );
    });
  };

  //util function used to check riskLevelData array for empty objects
  const hasEmptyObjectInArrayS = (array: any[]) => {
    return array.some((item) => {
      return item.riskIndicator === "" && item.riskLevel === "";
    });
  };

  //util function used to filter out empty objects from riskFactorial and hiraMatrixData arrays
  const filterEmptyObjects = (arr: any[]) => {
    return arr.filter((item: any) => {
      const isEmptyObject =
        item.criteriaType === "" &&
        item.score1Text === "" &&
        item.score2Text === "" &&
        item.score3Text === "" &&
        item.score4Text === "" &&
        item.score5Text === "";
      return !isEmptyObject;
    });
  };

  //util function used to filter out empty objects from riskLevelData array

  const filterEmptyObjectsS = (arr: any[]) => {
    return arr.filter((item: any) => {
      const isEmptyObject = item.riskIndicator === "" && item.riskLevel === "";
      return !isEmptyObject;
    });
  };

  //handleBlur, handleCreate, handleUpdate and handleDelete used for hiraMatrixData table
  const handleBlur = (row: any) => {
    // console.log("checkrisk in handleBlur row", row);

    if (row._id) {
      if (
        !(
          !!row.criteriaType &&
          !!(
            !!row.score1Text ||
            !!row.score2Text ||
            !!row.score3Text ||
            !!row.score4Text ||
            !!row.score5Text
          )
        )
      ) {
        // console.log("invalid row in cumulative");
        enqueueSnackbar(`Criteria type and Atleast One Scoring is Required`, {
          variant: "error",
        });
        handleDelete(row);
      } else {
        // console.log("check handleupdate called in else");

        handleUpdate(row);
      }
    } else if (
      !!row.criteriaType &&
      !!(
        !!row.score1Text ||
        !!row.score2Text ||
        !!row.score3Text ||
        !!row.score4Text ||
        !!row.score5Text
      )
    ) {
      // console.log("checkrisk handlecreate called in else");

      handleCreate(row);
    }
  };

  const handleCreate = (row: any) => {
    let cumulativeData = [...tableData] as any[];
    // console.log("checkrisk in handleCreate, ", cumulativeData);
    // console.log("checkrisk in handleCreate row, ", row);

    cumulativeData = filterEmptyObjects(cumulativeData);

    // console.log("checkrisk cumuluativedata after filter, ", cumulativeData);

    const newRiskConfigData = {
      ...hiraConfigData,
      hiraMatrixData: cumulativeData,
      // riskCumulativeHeader: headerValues,
    };
    // console.log("check in handleCreate hiraConfigData", newRiskConfigData);

    setHiraConfigData(newRiskConfigData);
  };

  const handleUpdate = (row: any) => {
    const cumulativeData = hiraConfigData?.hiraMatrixData as any[];
    let newCumulativeData = cumulativeData.map((item) => {
      if (item._id === row._id) {
        return row;
      }
      return item;
    });

    newCumulativeData = filterEmptyObjects(newCumulativeData);
    const newRiskConfigData = {
      ...hiraConfigData,
      hiraMatrixData: newCumulativeData,
      // riskCumulativeHeader: headerValues,
    };
    // console.log("check in handleUpdate hiraConfigData", newRiskConfigData);

    setHiraConfigData(newRiskConfigData);
  };

  const handleDelete = (row: any) => {
    const rowIndex = row.index;
    const newCumulativeData = tableData.filter((item: any, index:any) => {
      // Check if the specified properties of the object are all empty strings
      const isEmptyObject =
        item.criteriaType === "" &&
        item.score1Text === "" &&
        item.score2Text === "" &&
        item.score3Text === "" &&
        item.score4Text === "" &&
        item.score5Text === "";
      // Filter out the object with matching _id and the empty object
      return index !== rowIndex && !isEmptyObject;
    });
    
    const newRiskConfigData = {
      ...hiraConfigData,
      hiraMatrixData: newCumulativeData,
      // riskCumulativeHeader: headerValues,
    };

    setHiraConfigData(newRiskConfigData);
  };

  //handleBlur and handleUpdate for risks significance grid
  const handleBlurS = (row: any) => {
    console.log("checkrisk in handleBlurS, ", row);

    if (row._id) {
      if (row.riskIndicator === "" || row.riskLevel === "") {
        enqueueSnackbar(`Both the fields are required`, {
          variant: "error",
        });
        handleDeleteS(row);
      } else {
        handleUpdateS(row);
      }
    } else if (!!row.riskIndicator && !!row.riskLevel) {
      // console.log("check row in handleBlurS, ", row);

      handleCreateS(row);
    }
  };

  const handleCreateS = (row: any) => {
    let significanceData = [...tableDataS] as any[];
    significanceData = filterEmptyObjectsS(significanceData);
    // console.log("significanceData", significanceData);

    const newRiskConfigData = {
      ...hiraConfigData,
      riskLevelData: significanceData,
    };
    setHiraConfigData(newRiskConfigData);
  };

  // const handleCreateS = (row: any) => {
  //   let significanceData = [...tableDataS];
  //   const [indicator, color] = row.riskIndicator.split("-");
  //   significanceData.push({
  //     ...row,
  //     riskIndicator: indicator,
  //     riskIndicatorColor: color,
  //   });

  //   significanceData = filterEmptyObjectsS(significanceData);

  //   const newRiskConfigData = {
  //     ...hiraConfigData,
  //     riskLevelData: significanceData,
  //   };
  //   setHiraConfigData(newRiskConfigData);
  // };
  const handleUpdateS = (row: any) => {
    const significanceData = hiraConfigData?.riskLevelData as any[];
    let newSignificanceData = significanceData.map((item) => {
      if (item._id === row._id) {
        return row;
      }
      return item;
    });
    newSignificanceData = filterEmptyObjectsS(newSignificanceData);
    const newRiskConfigData = {
      ...hiraConfigData,
      riskLevelData: newSignificanceData,
    };
    setHiraConfigData(newRiskConfigData);
  };

  const handleDeleteS = (row: any) => {
    console.log("checkrisk in handleDeleteS check row, ", row);
    const rowIndex = row.index;
    const newSignificanceData = tableDataS.filter(
      (item: any, index: any) => index !== rowIndex
    );
    console.log(
      "checkrisk in handleDeleteS check newSignificanceData, ",
      newSignificanceData
    );
    const newRiskConfigData = {
      ...hiraConfigData,
      riskLevelData: newSignificanceData,
    };
    setTableDataS(newSignificanceData);
    setHiraConfigData(newRiskConfigData);
  };

  const handleSubmitHiraConfig = async () => {
    try {

      console.log("checkhira hiraConfigData", hiraConfigData);
      
      let filteredHiraMatrixData = filterEmptyObjects(
        hiraConfigData.hiraMatrixData
      );

      let filteredRiskLevelData = filterEmptyObjectsS(
        hiraConfigData.riskLevelData
      );
      const hiraConfigDataToBeUpdated = {
        hiraMatrixData: filteredHiraMatrixData,
        riskLevelData: filteredRiskLevelData,
        riskType: hiraConfigData.riskType,
        hiraMatrixHeader: hiraConfigData?.hiraMatrixHeader?.length
          ? hiraConfigData.hiraMatrixHeader?.map((item: any) => {
              if (!item) return "";
              else return item;
            })
          : ["Criteria Type", "1", "2", "3", "4", "5"],
      };

      let hasValidationError = false;
      let errorMessages:any = [];
  
      // Validate hiraMatrixData
      hiraConfigDataToBeUpdated?.hiraMatrixData?.forEach((item: any, index: any) => {
        const fieldsToValidate = [
          { name: 'criteriaType', value: item.criteriaType },
          { name: 'score1Text', value: item.score1Text },
          { name: 'score2Text', value: item.score2Text },
          { name: 'score3Text', value: item.score3Text },
          { name: 'score4Text', value: item.score4Text },
          { name: 'score5Text', value: item.score5Text },
        ];
  
        fieldsToValidate?.forEach(({ name, value }) => {
          validateTitle(name, value, (error) => {
            if (error) {
              const errorMessage = `Row ${index + 1}, field ${name}: ${error}`;
              console.error(`checkaspimp ${errorMessage}`);
              errorMessages.push(errorMessage);
              hasValidationError = true;
            }
          });
        });
      });
  
      // Validate hiraMatrixHeader
      hiraConfigDataToBeUpdated?.hiraMatrixHeader?.forEach((header: any, index: any) => {
        validateTitle('header', header, (error) => {
          if (error) {
            const errorMessage = `Header ${index + 1}: ${error}`;
            console.error(`checkaspimp ${errorMessage}`);
            errorMessages.push(errorMessage);
            hasValidationError = true;
          }
        });
      });
  
      // Validate riskLevelData fields (riskIndicator, description)
      hiraConfigDataToBeUpdated?.riskLevelData?.forEach((item: any, index: any) => {
        const fieldsToValidate = [
          { name: 'riskIndicator', value: item.riskIndicator },
          // { name: 'description', value: item.description },
        ];
  
        fieldsToValidate?.forEach(({ name, value }) => {
          validateTitle(name, value, (error) => {
            if (error) {
              const errorMessage = `Risk Level ${index + 1}, field ${name}: ${error}`;
              console.error(`checkaspimp ${errorMessage}`);
              errorMessages.push(errorMessage);
              hasValidationError = true;
            }
          });
        });
      });

      hiraConfigData?.condition?.forEach((item: any, index: any) => {
        const fieldsToValidate = [
          { name: 'name', value: item.name },
        ];
        fieldsToValidate?.forEach(({ name, value }) => {
          validateTitle(name, value, (error) => {
            if (error) {
              const errorMessage = `Condition ${index + 1}, field ${name}: ${error}`;
              console.error(`checkhira ${errorMessage}`);
              errorMessages.push(errorMessage);
              hasValidationError = true;
            }
        });
      });
    })

    hiraConfigDataToBeUpdated?.riskType?.forEach((item: any, index: any) => {
      const fieldsToValidate = [
        { name: 'name', value: item.name },
      ];
      fieldsToValidate?.forEach(({ name, value }) => {
        validateTitle(name, value, (error) => {
          if (error) {
            const errorMessage = `Hira Type ${index + 1}, field ${name}: ${error}`;
            console.error(`checkhira ${errorMessage}`);
            errorMessages.push(errorMessage);
            hasValidationError = true;
          }
      });
    });
  })
    
      if (hasValidationError) {
        // Show all error messages in one snackbar
        enqueueSnackbar(errorMessages?.join("\n"), {
          variant: 'warning',
          autoHideDuration: 5000,  // Increase duration for longer messages
          style: { whiteSpace: 'pre-line' },  // To display each message on a new line
        });
        return;
      }

      console.log(
        "checkhira hiraConfigDataToBeUpdated",
        hiraConfigDataToBeUpdated
      );
      const res = await axios.patch(
        `/api/riskconfig/updateHiraConfig/${hiraConfigData.id}`,
        hiraConfigDataToBeUpdated
      );
      if (res.status === 200 || res.status === 201) {
        enqueueSnackbar(`Hira Configuration Updated Successfully`, {
          variant: "success",
        });
      } else {
        enqueueSnackbar(
          `Something went wrong while updating Hira Configuration`,
          {
            variant: "error",
          }
        );
      }
    } catch (error) {
      // console.log("error in handleSubmitHiraConfig", error);
    }
  };

  return (
    <>
      <div className={classes.root}>
        <Grid container>
          <Grid item xs={12} md={6}>
            <Grid container>
              <Grid
                item
                sm={12}
                md={4}
                className={classes.formTextPadding}
                style={{ marginBottom: "48px" }}
              >
                <strong>Category*</strong>
              </Grid>
              <Grid item sm={12} md={6} className={classes.formBox}>
                <TextField
                  fullWidth
                  minRows={1}
                  multiline
                  style={{ width: "89%" }}
                  name="category"
                  value={hiraConfigData.riskCategory || ""}
                  variant="outlined"
                  // onChange={handleChange}
                  size="small"
                  disabled={true}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* New Condition field */}
          <Grid item xs={12} md={6}>
            <Grid container>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Condition*</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <DynamicFormFields
                  data={hiraConfigData}
                  setData={setHiraConfigData}
                  name="condition"
                  keyName="name"
                  canEdit={!!isMCOE}
                
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item sm={12} md={6}>
            <Grid container>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Hira Types*</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <DynamicFormFields
                  data={hiraConfigData}
                  setData={setHiraConfigData}
                  name="riskType"
                  keyName="name"
                  canEdit={!!isMCOE}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <div
          style={{ backgroundColor: "white" }}
          className={classes.tableContainer}
        >
          <Typography variant="h6" className={classes.tableHeader}>
            Risk Matrix Setup
            <Popover
              placement="right"
              title={text}
              content={content}
              trigger="click"
            >
              <InfoIcon />
            </Popover>
          </Typography>

          <HiraMatrixTable
            columns={cols}
            data={tableData}
            setData={setTableData}
            handleBlur={handleBlur}
            canEdit={!!isMCOE}
            isAction={true}
            handleDelete={handleDelete}
            headerValues={headerValues}
            setHeaderValues={setHeaderValues}
            hiraConfigData={hiraConfigData}
            setHiraConfigData={setHiraConfigData}
          />
          <br />
          <>
            <Typography variant="h6" className={classes.tableHeader}>
              Risk Level Indicator
            </Typography>
            <div style={{ marginTop: "10px" }}>
              <RiskLevelIndicatorTable
                columns={significanceCols}
                data={tableDataS}
                setData={setTableDataS}
                handleBlur={handleBlurS}
                isAction={true}
                handleDelete={handleDeleteS}
                canEdit={!!isMCOE}
              />
            </div>
          </>
        </div>
        {!!isMCOE && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "10px",
            }}
          >
            <Button
              style={{
                float: "right",
                display: "flex",
                alignItems: "center",
                backgroundColor: "#003566",
                color: "white",
              }}
              // type="primary"
              // disabled={!isMCOE}
              onClick={() => handleSubmitHiraConfig()}
            >
              Submit
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default HiraConfigurationTab;
