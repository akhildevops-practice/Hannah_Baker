import { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Button,
} from "@material-ui/core";
import CheckboxAutocomplete from "../newComponents/inputs/CheckboxAutocomplete";
import ConfirmDialog from "../ConfirmDialog";
import { connectedAppsSchema } from "../../schemas/connectedAppsSchema";
import { useSnackbar } from "notistack";
import axios from "../../apis/axios.global";
import checkRole from "../../utils/checkRoles";
import { roles } from "../../utils/enums";
import useStyles from "./styles";
import { Autocomplete } from "@material-ui/lab";

interface Props {
  selectedApp: { id: string; appName: string; status: boolean };
  handleClose: () => void;
  locationOptions: { value: string; label: string }[];
}

function ConnectedAppForm({
  selectedApp,
  handleClose,
  locationOptions,
}: Props) {
  const [isNew, setIsNew] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [connectedAppData, setConnectedAppData] = useState(connectedAppsSchema);
  const [origCreds, setOrigCreds] = useState({
    username: "",
    password: "",
    clientId: "",
    clientSecret: "",
  });

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const isOrgAdmin = checkRole(roles.ORGADMIN);
  const allOption = { value: "All", label: "All" };

  useEffect(() => {
    setConnectedAppData((prev) => ({
      ...prev,
      locations: locationOptions?.map((obj) => obj.value),
    }));
  }, []);

  useEffect(() => {
    if (selectedApp.id) {
      setIsNew(false);
      getConnectedAppData();
    } else {
      setIsNew(true);
    }
  }, [selectedApp]);
  console.log("connected app location options", locationOptions);

  const getConnectedAppData = async () => {
    await axios(`/api/connected-apps/getconnectedappbyid/${selectedApp.id}`)
      .then((res) => {
        setConnectedAppData({
          id: res.data.id,
          appName: res.data.sourceName,
          status: res.data.Status,
          baseUrl: res.data.baseURL,
          redirectUrl: res.data.redirectURL,
          grantType: res.data.grantType,
          username: res.data.user,
          password: res.data.password,
          clientId: res.data.clientId,
          clientSecret: res.data.clientSecret,
          locations: res.data.locationId,
          description: res.data.description,
          lastModifiedTime: new Date(res.data.createdModifiedAt),
          lastModifiedUser: res.data.createdModifiedBy,
        });

        setOrigCreds({
          username: res.data.user,
          password: res.data.password,
          clientId: res.data.clientId,
          clientSecret: res.data.clientSecret,
        });
      })
      .catch((err) => console.error(err));
  };

  const handleChange = (e: any) => {
    console.log("change loc in handle change", e);
    setConnectedAppData((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // for autocomplete
  const handleChangeAdvance = (name: string, newValue: any[]) => {
    console.log("change loc", name, newValue);
    setConnectedAppData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSelectAll = (name: string, options: any[]) => {
    setConnectedAppData((prev) => ({
      ...prev,
      [name]: options.map((obj) => obj.value),
    }));
  };
  const handleSelectNone = (name: string) => {
    setConnectedAppData((prev) => ({ ...prev, [name]: [] }));
  };

  const handleDelete = async () => {
    await axios
      .delete(`/api/connected-apps/deleteconnectedapp/${selectedApp.id}`)
      .then((res) => {
        enqueueSnackbar(`App deleted`, { variant: "success" });
      })
      .catch((err) => {
        console.error(err);
        enqueueSnackbar(`Could not delete app`, { variant: "error" });
      });
    setConfirmOpen(false);
    handleClose();
  };

  const handleTestConnection = async () => {
    await axios(`/api/connected-apps/testConnection/${selectedApp.id}`)
      .then((res) => {
        setConnectedAppData((prev) => ({ ...prev, status: res.data }));
        if (res.data)
          enqueueSnackbar("Connection successful", { variant: "success" });
        else enqueueSnackbar("Connection failed", { variant: "error" });
        handleClose();
      })
      .catch((err) => {
        console.error(err);
        enqueueSnackbar("An error occured", { variant: "error" });
      });
  };

  const handleCreate = async () => {
    if (
      connectedAppData.appName &&
      connectedAppData.baseUrl &&
      connectedAppData.redirectUrl &&
      connectedAppData.clientId &&
      connectedAppData.clientSecret &&
      connectedAppData.locations.length &&
      connectedAppData.description &&
      (connectedAppData.grantType === "client" ||
        (connectedAppData.grantType === "password" &&
          connectedAppData.username &&
          connectedAppData.password))
    ) {
      const temp = {
        sourceName: connectedAppData.appName,
        clientId: connectedAppData.clientId,
        clientSecret: connectedAppData.clientSecret,
        baseURL: connectedAppData.baseUrl,
        user: connectedAppData.username,
        password: connectedAppData.password,
        redirectURL: connectedAppData.redirectUrl,
        grantType: connectedAppData.grantType,
        description: connectedAppData.description,
        locationId: connectedAppData.locations,
        Status: connectedAppData.status,
      };
      await axios
        .post(`/api/connected-apps/connectedapps`, temp)
        .then((res) =>
          enqueueSnackbar("Connected App added", {
            variant: "success",
          })
        )
        .catch((err) => {
          console.error(err);
          enqueueSnackbar("Could not add app", {
            variant: "error",
          });
        });
      handleClose();
    } else {
      enqueueSnackbar("Please fill all the required fields", {
        variant: "error",
      });
    }
  };

  const handleUpdate = async () => {
    if (
      connectedAppData.appName &&
      connectedAppData.baseUrl &&
      connectedAppData.redirectUrl &&
      connectedAppData.clientId &&
      connectedAppData.clientSecret &&
      connectedAppData.locations.length &&
      connectedAppData.description &&
      (connectedAppData.grantType === "client" ||
        (connectedAppData.grantType === "password" &&
          connectedAppData.username &&
          connectedAppData.password))
    ) {
      const temp = {
        clientId: connectedAppData.clientId,
        clientSecret: connectedAppData.clientSecret,
        baseURL: connectedAppData.baseUrl,
        user: connectedAppData.username,
        password: connectedAppData.password,
        redirectURL: connectedAppData.redirectUrl,
        description: connectedAppData.description,
        locationId: connectedAppData.locations,
        Status: connectedAppData.status,
      };
      await axios
        .put(
          `/api/connected-apps/updateselectedconnectedapp/${connectedAppData.id}`,
          temp
        )
        .then((res) =>
          enqueueSnackbar("Connected App updated", {
            variant: "success",
          })
        )
        .catch((err) => {
          console.error(err);
          enqueueSnackbar("Could not update app", {
            variant: "error",
          });
        });
      handleClose();
    } else {
      enqueueSnackbar("Please fill all the required fields", {
        variant: "error",
      });
    }
  };

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        handleClose={() => setConfirmOpen(false)}
        handleDelete={handleDelete}
      />
      <form
        data-testid="audit-system-form"
        autoComplete="off"
        className={classes.form}
      >
        <Grid
          container
          alignItems="center"
          justifyContent="flex-end"
          spacing={2}
        >
          <Grid item xs={4} md={2} className={classes.formTextPadding}>
            <strong>Connected App *</strong>
          </Grid>
          <Grid item xs={8} md={4} className={classes.formBox}>
            <TextField
              fullWidth
              name="appName"
              value={connectedAppData.appName}
              variant="outlined"
              onChange={handleChange}
              size="small"
              required
              disabled={!isNew}
            />
          </Grid>

          <Grid item xs={4} md={2} className={classes.formTextPadding}>
            <strong>Grant type *</strong>
          </Grid>
          <Grid item xs={8} md={4} className={classes.formBox}>
            <FormControl disabled={!isNew}>
              <RadioGroup
                name="grantType"
                row
                value={connectedAppData.grantType}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="client"
                  control={<Radio />}
                  label="Client"
                />
                <FormControlLabel
                  value="password"
                  control={<Radio />}
                  label="Password"
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={4} md={2} className={classes.formTextPadding}>
            <strong>Base URL *</strong>
          </Grid>
          <Grid item xs={8} md={4} className={classes.formBox}>
            <TextField
              fullWidth
              name="baseUrl"
              value={connectedAppData.baseUrl}
              variant="outlined"
              onChange={handleChange}
              size="small"
              required
            />
          </Grid>

          <Grid item xs={4} md={2} className={classes.formTextPadding}>
            <strong>Redirect URL *</strong>
          </Grid>
          <Grid item xs={8} md={4} className={classes.formBox}>
            <TextField
              fullWidth
              name="redirectUrl"
              value={connectedAppData.redirectUrl}
              variant="outlined"
              onChange={handleChange}
              size="small"
              required
            />
          </Grid>

          {connectedAppData.grantType === "password" && (
            <>
              <Grid item xs={4} md={2} className={classes.formTextPadding}>
                <strong>Username *</strong>
              </Grid>
              <Grid item xs={8} md={4} className={classes.formBox}>
                <TextField
                  fullWidth
                  name="username"
                  value={connectedAppData.username}
                  variant="outlined"
                  onChange={handleChange}
                  size="small"
                  required
                />
              </Grid>

              <Grid item xs={4} md={2} className={classes.formTextPadding}>
                <strong>Password *</strong>
              </Grid>
              <Grid item xs={8} md={4} className={classes.formBox}>
                <TextField
                  fullWidth
                  name="password"
                  type="password"
                  value={connectedAppData.password}
                  variant="outlined"
                  onChange={handleChange}
                  size="small"
                  required
                />
              </Grid>
            </>
          )}

          <Grid item xs={4} md={2} className={classes.formTextPadding}>
            <strong>Client ID *</strong>
          </Grid>
          <Grid item xs={8} md={4} className={classes.formBox}>
            <TextField
              fullWidth
              name="clientId"
              value={connectedAppData.clientId}
              variant="outlined"
              onChange={handleChange}
              size="small"
              required
            />
          </Grid>

          <Grid item xs={4} md={2} className={classes.formTextPadding}>
            <strong>Client secret *</strong>
          </Grid>
          <Grid item xs={8} md={4} className={classes.formBox}>
            <TextField
              fullWidth
              name="clientSecret"
              type="password"
              value={connectedAppData.clientSecret}
              variant="outlined"
              onChange={handleChange}
              size="small"
              required
            />
          </Grid>

          <Grid item xs={12} md={2} className={classes.formTextPadding}>
            <strong>Locations *</strong>
          </Grid>
          <Grid item xs={12} md={10} className={classes.formBox}>
            {/* <CheckboxAutocomplete
              name="locations"
              value={connectedAppData.locations}
              options={locationOptions}
              handleChange={handleChangeAdvance}
              handleSelectAll={handleSelectAll}
              handleSelectNone={handleSelectNone}
            /> */}
            <Autocomplete
              disablePortal
              multiple // Enable multiselect
              id="combo-box-demo"
              options={[allOption, ...locationOptions]} // Include the "All" option at the beginning
              onChange={(event, newValue) => {
                if (newValue.length === 1 && newValue[0]?.value === "All") {
                  // If "All" is selected, set the locations to ["All"]
                  setConnectedAppData((prevData) => ({
                    ...prevData,
                    locations: ["All"],
                  }));
                } else {
                  // If other options are selected, filter out "All" and set the selected locations
                  const filteredValue = newValue.filter(
                    (option) => option?.value !== "All"
                  );
                  setConnectedAppData((prevData) => ({
                    ...prevData,
                    locations: filteredValue?.map(
                      (option: any) => option?.value
                    ),
                  }));
                }
              }}
              value={connectedAppData.locations?.map((locationId) => {
                // If locations include "All", return the "All" option
                if (locationId === "All") return allOption;
                // Map other locationIds to corresponding options
                const option = locationOptions.find(
                  (option) => option.value === locationId
                );
                return option || null; // Return null for unmatched ids
              })}
              getOptionLabel={(option: any) =>
                option ? option.label || "" : ""
              } // Check if option is null before accessing properties
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  variant="outlined"
                  size="small"
                  label="Units"
                  fullWidth
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={2} className={classes.formTextPadding}>
            <strong>Description *</strong>
          </Grid>
          <Grid item xs={12} md={10} className={classes.formBox}>
            <TextField
              multiline
              rows={2}
              fullWidth
              name="description"
              value={connectedAppData.description}
              variant="outlined"
              onChange={handleChange}
              size="small"
              required
            />
          </Grid>

          {!isNew && (
            <>
              <Grid item xs={6} sm={"auto"}>
                <Button
                  onClick={() => setConfirmOpen(true)}
                  variant="contained"
                  className={classes.deleteButton}
                  disableElevation
                  disabled={!isOrgAdmin}
                >
                  Delete
                </Button>
              </Grid>
              <Grid item xs={6} sm={"auto"}>
                <Button
                  onClick={handleTestConnection}
                  variant="contained"
                  color="primary"
                  className={classes.testButton}
                  disableElevation
                >
                  Test connection
                </Button>
              </Grid>
            </>
          )}
          <Grid item xs={isNew ? 6 : 12} sm={"auto"}>
            <Button
              onClick={isNew ? handleCreate : handleUpdate}
              variant="contained"
              color="primary"
              disableElevation
              className={classes.submitButton}
              // disabled={
              //   // isOrgAdmin ||
              //   // connectedAppData.clientId === origCreds.clientId ||
              //   // connectedAppData.clientSecret === origCreds.clientSecret ||
              //   // (connectedAppData.grantType === "password" &&
              //   //   (connectedAppData.username === origCreds.username ||
              //   //     connectedAppData.password === origCreds.password))
              // }
            >
              {isNew ? "Add" : "Update"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}

export default ConnectedAppForm;
