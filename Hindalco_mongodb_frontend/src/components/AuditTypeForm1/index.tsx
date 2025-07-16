import React, { useEffect, useState } from "react";
import useStyles from "./styles";
import {
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import DynamicFormSearchField from "components/DynamicFormSearchField";
import AutoComplete from "components/AutoComplete";
import axios from "apis/axios.global";
import { debounce } from "lodash";
import getAppUrl from "utils/getAppUrl";
import { useSnackbar } from "notistack";
import checkRoles from "utils/checkRoles";

type Props = {
  scopes: any;
  handleChange: any;
  formData: any;
  setFormData: any;
  selectedData: any;
  setSelectedData: any;
  tabKey: any;
};

const AuditTypeForm1 = ({
  scopes,
  handleChange,
  formData,
  setFormData,
  selectedData,
  tabKey,
  setSelectedData,
}: Props) => {
  const classes = useStyles();

  const [isChecked, setIsChecked] = useState(false);
  const orgName = getAppUrl();
  const [location, setLocation] = React.useState([]);
  // const [department, setDepartment] = React.useState([]);
  const [systemOption, setSystemOption] = React.useState([]);
  const [departments, setDepartments] = React.useState<any>([]);
  const [scheduleDepartments, setScheduleDepartments] = React.useState<any>([]);
  const { enqueueSnackbar } = useSnackbar();
  const orgId = sessionStorage.getItem("orgId");
  const allOption = { id: "All", locationName: "All" };
  let isOrgAdmin = checkRoles("ORG-ADMIN");

  var typeAheadValue: string;
  var typeAheadType: string;

  // React.useEffect(() => {
  //   if (formData.planningUnit) {
  //     // getDept();
  //     getDepartment();
  //   }
  // }, [formData.planningUnit]);

  React.useEffect(() => {
    fetchSystem();
  }, []);

  const getSuggestionListLocation = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearchLocation();
  };

  const fetchSystem = async () => {
    const res = await axios.get(`api/systems/getAllSystemFromOrg`);
    setSystemOption(res.data);
  };

  const debouncedSearchLocation = debounce(() => {
    getLocation(typeAheadValue, typeAheadType);
  }, 50);

  const getLocation = async (value: string, type: string) => {
    try {
      let res = await axios.get(
        `/api/documents/filerValue?searchLocation=${value}&searchBusinessType=&searchEntity=&searchSystems=&searchDoctype=&searchUser=`
      );
      console.log("res.data.locations", res.data.locations);
      setLocation(res.data.locations);
    } catch (err) {
      console.log(err);
    }
  };
  const getSuggestionListDepartment = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearchDepartment();
  };

  const debouncedSearchDepartment = debounce(() => {
    getDepartment(typeAheadValue, typeAheadType);
  }, 50);

  const getDepartment = async (value: string, type: string) => {
    const locationId = formData?.planningUnit?.map(
      (item: any) => `"${item.id}"`
    );
    try {
      let res = await axios.get(
        `/api/entity/getEntityForLocations?orgid=${orgId}&locid=[${locationId}]&searchDepartment=${value}`
      );
      console.log("res.data", res.data);
      setDepartments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getSuggestionListScheduleDepartment = (value: any, type: string) => {
    typeAheadValue = value;
    typeAheadType = type;
    debouncedSearchScheduleDepartment();
  };

  const debouncedSearchScheduleDepartment = debounce(() => {
    getScheduleDepartment(typeAheadValue, typeAheadType);
  }, 50);

  const getScheduleDepartment = async (value: string, type: string) => {
    const locationId = formData?.schedulingUnit?.map(
      (item: any) => `"${item.id}"`
    );
    try {
      let res = await axios.get(
        `/api/entity/getEntityForLocations?orgid=${orgId}&locid=[${locationId}]&searchDepartment=${value}`
      );
      setScheduleDepartments(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const handleCheckboxChange = (event: any) => {
    const { name, checked } = event.target;

    setFormData((prevData: any) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  // const getDept = async () => {
  //   const loctionId = () => {
  //     formData?.location?.map((item: any) => {
  //       {
  //         item.id;
  //       }
  //     });
  //   };
  //   if (formData?.planningUnit?.id || formData?.scheduling?.id) {
  //     try {
  //       const res = await axios.get(
  //         // `api/location/getDeptForLocation/${orgName}/${formData.locationId}`
  //         `http://localhost:5000/api/entity/getEntityForLocations?orgid=${orgId}&locid=${loctionId}&searchDepartment=e2`
  //       );
  //       if (res.data) {
  //         setDepartments(res.data);
  //       }
  //     } catch (err) {
  //       enqueueSnackbar(`Error ${err}`, { variant: "error" });
  //     }
  //   }
  // };

  //----------read mode ---------------
  const [isReadMode, setIsReadMode] = useState(false);

  useEffect(() => {
    const url = window.location.href;
    const isReadModeUrl = url.includes(
      "audit/auditsettings/auditTypeForm/readMode"
    );
    setIsReadMode(isReadModeUrl);
  }, []);

  return (
    <form
      data-testid="audit-system-form"
      autoComplete="off"
      className={classes.form}
    >
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Grid container item sm={12} md={6} style={{ marginTop: "-30px" }}>
          {/* <Grid
            container
            style={{
              display: "flex",
              flexDirection: "column",
              // alignContent: "center",
            }}
          > */}
          <Grid item sm={12} md={5} className={classes.formTextPadding}>
            <strong>
              <span className={classes.asterisk}>*</span>{" "}
              <span className={classes.label}>Audit Type:</span>
            </strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            <TextField
              label="Enter Audit Type Name"
              name="auditType"
              disabled={!isOrgAdmin || isReadMode ? true : false}
              value={selectedData?.auditType || formData.auditType || ""}
              onChange={handleChange}
              fullWidth
              size="small"
              variant="outlined"
              className={classes.textField}
            />
          </Grid>

          <Grid item sm={12} md={5} className={classes.formTextPadding}>
            <strong>
              <span className={classes.asterisk}>*</span>{" "}
              <span className={classes.label}>Audit For:</span>
            </strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel htmlFor="Scope">Select Scope</InputLabel>
              <Select
                label="Select Scope"
                name="scope"
                value={selectedData?.scope || formData.scope || ""}
                onChange={handleChange}
                disabled={!isOrgAdmin || isReadMode ? true : false}
                className={classes.select}
              >
                {scopes.map((obj: any) => (
                  <MenuItem key={obj.id} value={JSON.stringify(obj)}>
                    {obj.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item sm={12} md={5} className={classes.formTextPadding}>
            <strong>
              <span className={classes.asterisk}>*</span>{" "}
              <span className={classes.label}>System:</span>
            </strong>
          </Grid>

          <Grid item sm={12} md={8} className={classes.formBox}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel htmlFor="system">Select Option</InputLabel>
              <Select
                label="Select Option"
                name="system"
                disabled={isOrgAdmin ? false : true}
                value={selectedData?.system || formData.system || []}
                multiple={true}
                onChange={(e)=>{
                  setFormData({...formData,system:e.target.value})
                }}
                className={classes.select}
              >
                {systemOption.map((value: any) => (
                  <MenuItem value={value?.id}>{value?.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item sm={12} md={5} className={classes.formTextPadding}>
            <strong>
              <span className={classes.asterisk}>*</span>{" "}
              <span className={classes.label}>Who Can Plan:</span>
            </strong>
          </Grid>

          <Grid item sm={12} md={8} className={classes.formBox}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel htmlFor="whoCanPlan">Select Option</InputLabel>
              <Select
                label="Select Option"
                name="whoCanPlan"
                disabled={!isOrgAdmin || isReadMode ? true : false}
                value={selectedData?.whoCanPlan || formData.whoCanPlan || ""}
                onChange={handleChange}
                className={classes.select}
              >
                <MenuItem value="MCOE">MCOE</MenuItem>
                <MenuItem value="IMS Coordinator">IMS Coordinator</MenuItem>
                <MenuItem value="Entity Head">Entity Head</MenuItem>
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Function SPOC">Function SPOC</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {(formData?.whoCanPlan === "Entity Head" ||
            formData?.whoCanPlan === "Function SPOC") && (
            <>
              <Grid item sm={12} md={5} className={classes.formTextPadding}>
                <strong>
                  <span className={classes.asterisk}>*</span>{" "}
                  <span className={classes.label}>Planning Unit:</span>
                </strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <AutoComplete
                  suggestionList={location ? [allOption, ...location] : []}
                  name={"Planning Unit"}
                  keyName={"locationName"}
                  formData={formData}
                  disabled={!isOrgAdmin || isReadMode ? true : false}
                  setFormData={setFormData}
                  getSuggestionList={getSuggestionListLocation}
                  labelKey={"locationName"}
                  defaultValue={formData?.planningUnit}
                  handleChangeFromForm={(e: any, value: any) => {
                    setFormData((prevFormData: any) => ({
                      ...prevFormData,
                      planningUnit: value,
                      planningEntity: {},
                    }));
                  }}
                  multiple={true}
                />
                {/* </FormControl> */}
              </Grid>
            </>
          )}

          {formData?.whoCanPlan === "Entity Head" && (
            <>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>
                  <span className={classes.asterisk}>*</span>{" "}
                  <span className={classes.label}>Planning Entity:</span>
                </strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <AutoComplete
                  suggestionList={departments || []}
                  name={"Planning Entity"}
                  keyName={"entityName"}
                  formData={formData}
                  setFormData={setFormData}
                  disabled={!isOrgAdmin || isReadMode ? true : false}
                  // disabled={
                  //   formData.planningUnit &&
                  //   Object.keys(formData.planningUnit).length === 0
                  // }
                  getSuggestionList={getSuggestionListDepartment}
                  labelKey={"entityName"}
                  defaultValue={formData?.planningEntity}
                  handleChangeFromForm={(e: any, value: any) => {
                    setFormData((prevFormData: any) => ({
                      ...prevFormData,
                      planningEntity: value,
                    }));
                  }}
                  multiple={false}
                />
              </Grid>
            </>
          )}

          <Grid item sm={12} md={5} className={classes.formTextPadding}>
            <strong>Description:</strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            <TextField
              key={tabKey}
              label="Enter Description"
              name="Description"
              value={selectedData?.Description || formData.Description || ""}
              onChange={handleChange}
              fullWidth
              disabled={!isOrgAdmin || isReadMode ? true : false}
              multiline={true}
              variant="outlined"
              size="small"
              minRows={5}
              maxRows={5}
              className={classes.textField}
            />
          </Grid>
          {/* </Grid> */}
        </Grid>

        <Grid container item sm={12} md={6}>
          {/* <Grid
            container
            style={{
              display: "flex",
              flexDirection: "column",
              alignContent: "center",
            }}
          > */}
          <Grid item sm={12} md={5} className={classes.formTextPadding}>
            <strong>
              <span className={classes.asterisk}>*</span>{" "}
              <span className={classes.label}>Audit Type ID:</span>
            </strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            <TextField
              label="Enter Audit Type ID"
              name="auditTypeId"
              value={selectedData?.auditTypeId || formData.auditTypeId || ""}
              onChange={handleChange}
              fullWidth
              disabled={!isOrgAdmin || isReadMode ? true : false}
              size="small"
              className={classes.textField}
              variant="outlined"
              inputProps={{ maxLength: 8 }}
            />
          </Grid>
          <Grid item sm={12} md={5} className={classes.formTextPadding}>
            <strong>
              <span className={classes.asterisk}>*</span>{" "}
              <span className={classes.label}>Who Can Conduct Audit:</span>
            </strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel htmlFor="responsibility">
                Select Responsibility
              </InputLabel>
              <Select
                label="Select Responsibility"
                name="responsibility"
                disabled={!isOrgAdmin || isReadMode ? true : false}
                value={
                  selectedData?.responsibility || formData.responsibility || ""
                }
                onChange={handleChange}
                className={classes.select}
              >
                {/* <MenuItem value="MCOE">MCOE</MenuItem>
                <MenuItem value="IMS Coordinator">IMS Coordinator</MenuItem> */}
                <MenuItem value="Auditor">Auditor</MenuItem>
              </Select>
              {/* <TextField
                name="responsibility"
                disabled
                value={
                  selectedData?.responsibility
                    ? selectedData?.responsibility
                    : "Auditor"
                }
                fullWidth
                size="small"
                variant="outlined"
              /> */}
            </FormControl>
          </Grid>

          <Grid item sm={12} md={5} className={classes.formTextPadding}>
            <strong>Plan Type:</strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel htmlFor="plantype">Select PlanType</InputLabel>
              <Select
                label="Select PlanType"
                name="planType"
                disabled={!isOrgAdmin || isReadMode ? true : false}
                value={"Month"}
                className={classes.select}
                onChange={handleChange}
              >
                <MenuItem value="Month">Month</MenuItem>
                {/* <MenuItem value="Date Range">Date Range</MenuItem> */}
              </Select>
            </FormControl>
          </Grid>

          <Grid item sm={12} md={5} className={classes.formTextPadding}>
            <strong>
              <span className={classes.asterisk}>*</span>{" "}
              <span className={classes.label}>Who Can Schedule:</span>
            </strong>
          </Grid>
          <Grid item sm={12} md={8} className={classes.formBox}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel htmlFor="whoCanSchedule">Select Option</InputLabel>
              <Select
                label="Select Option"
                name="whoCanSchedule"
                disabled={!isOrgAdmin || isReadMode ? true : false}
                value={
                  selectedData?.whoCanSchedule || formData.whoCanSchedule || ""
                }
                className={classes.select}
                onChange={handleChange}
              >
                <MenuItem value="MCOE">MCOE</MenuItem>
                <MenuItem value="IMS Coordinator">IMS Coordinator</MenuItem>
                <MenuItem value="Entity Head">Entity Head</MenuItem>
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Function SPOC">Function SPOC</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formData?.whoCanSchedule === "Entity Head" && (
            <>
              <Grid item sm={12} md={5} className={classes.formTextPadding}>
                <strong>
                  <span className={classes.asterisk}>*</span>{" "}
                  <span className={classes.label}>Scheduling Unit:</span>
                </strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <AutoComplete
                  suggestionList={location ? [allOption, ...location] : []}
                  name={"Scheduling Unit"}
                  keyName={"locationName"}
                  disabled={!isOrgAdmin || isReadMode ? true : false}
                  formData={formData}
                  setFormData={setFormData}
                  getSuggestionList={getSuggestionListLocation}
                  labelKey={"locationName"}
                  defaultValue={formData?.schedulingUnit}
                  handleChangeFromForm={(e: any, value: any) => {
                    setFormData((prevFormData: any) => ({
                      ...prevFormData,
                      schedulingUnit: value,
                      schedulingEntity: {},
                    }));
                  }}
                  multiple={true}
                />
                {/* </FormControl> */}
              </Grid>
            </>
          )}
          {formData?.whoCanSchedule === "Entity Head" && (
            <>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>
                  <span className={classes.asterisk}>*</span>{" "}
                  <span className={classes.label}>Scheduling Entity:</span>
                </strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <AutoComplete
                  suggestionList={scheduleDepartments || []}
                  name={"Scheduling Entity"}
                  keyName={"entityName"}
                  formData={formData}
                  setFormData={setFormData}
                  disabled={
                    formData.schedulingUnit &&
                    Object.keys(formData.schedulingUnit).length === 0 &&
                    isReadMode
                  }
                  getSuggestionList={getSuggestionListScheduleDepartment}
                  labelKey={"entityName"}
                  defaultValue={formData?.schedulingEntity}
                  handleChangeFromForm={(e: any, value: any) => {
                    setFormData((prevFormData: any) => ({
                      ...prevFormData,
                      schedulingEntity: value,
                    }));
                  }}
                  multiple={false}
                />
              </Grid>
            </>
          )}
          <div className={classes.formContainer}>
            <div className={classes.formTextPadding}>
              {/* <strong>Allow Consecutive Audits by Auditors:</strong>
              <Checkbox
                style={{ marginLeft: "10px" }}
                name="allowConsecutive"
                checked={formData?.allowConsecutive || isChecked}
                onChange={handleCheckboxChange}
                color="primary"
              /> */}

              <strong style={{ marginLeft: "10px" }}>
                Select auditor in plan:
              </strong>
              <Checkbox
                style={{ marginLeft: "10px" }}
                name="auditorCheck"
                disabled={!isOrgAdmin || isReadMode ? true : false}
                checked={formData?.auditorCheck || isChecked}
                onChange={handleCheckboxChange}
                color="primary"
              />
            </div>
            <div className={classes.formTextPadding}>
              {/* <strong>Allow Auditors from Same Department:</strong>
              <Checkbox
                name="auditorsFromSameDept"
                checked={formData?.auditorsFromSameDept || isChecked}
                disabled={
                  isOrgAdmin
                    ? formData.scope !== undefined &&
                      formData.scope !== "undefined" &&
                      formData.scope !== ""
                      ? JSON.parse(formData.scope).id === "Unit"
                        ? true
                        : false
                      : false
                    : true
                }
                onChange={handleCheckboxChange}
                color="primary"
              /> */}
              <strong>Auditors from same unit:</strong>
              <Checkbox
                name="auditorsFromSameUnit"
                checked={formData?.auditorsFromSameUnit || isChecked}
                disabled={
                  isOrgAdmin && !isReadMode
                    ? formData.scope !== undefined &&
                      formData.scope !== "undefined" &&
                      formData.scope !== ""
                      ? JSON.parse(formData.scope).id === "Unit"
                        ? true
                        : false
                      : false
                    : true
                }
                onChange={handleCheckboxChange}
                color="primary"
              />
              {/* <strong>Use Functions for Planning:</strong>
              <Checkbox
                name="useFunctionsForPlanning"
                checked={formData?.useFunctionsForPlanning || isChecked}
                disabled={
                  isOrgAdmin
                    ? formData.scope !== undefined &&
                      formData.scope !== "undefined" &&
                      formData.scope !== ""
                      ? JSON.parse(formData.scope).id === "Unit" ||
                        JSON.parse(formData.scope).id === "corpFunction"
                        ? true
                        : false
                      : false
                    : true
                }
                onChange={handleCheckboxChange}
                color="primary"
              /> */}
            </div>

            {/* <div className={classes.formTextPadding}>
              <strong>Auditor Induction require Approval:</strong>
              <Checkbox
                style={{ marginLeft: "30px" }}
                name="inductionApproval"
                checked={formData?.inductionApproval || isChecked}
                onChange={handleCheckboxChange}
                color="primary"
              />
            </div> */}
          </div>
        </Grid>
      </Grid>
    </form>
  );
};

export default AuditTypeForm1;