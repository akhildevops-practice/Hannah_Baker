import {
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import React, { useState } from "react";
import useStyles from "./styles";
import CustomButton from "../CustomButton";
import axios from "../../apis/axios.global";
import { useRecoilState } from "recoil";
import { orgFormData } from "../../recoil/atom";
import { useSnackbar } from "notistack";
import checkSpecialChar from "../../utils/checkSpecialChar";
import { REDIRECT_URL } from "../../config";
import { logoFormData } from "recoil/atom";
import toFormData from "utils/toFormData";
import { useNavigate } from "react-router-dom";

type Props = {
  isEdit?: any;
};

/**
 * This the whole UI structure of the Create Organization Form
 *
 * @param {boolean} isEdit This is to check if the form is in EDIT mode
 * @returns Create Org Form
 */

function CreateOrgForm({ isEdit = false }: Props) {
  const navigate = useNavigate();
  const [orgData, setOrgData] = useRecoilState(orgFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [values, setValues] = useState({
    realm: orgData.organizationName,
    instanceUrl: orgData.instanceUrl,
    principalGeography: orgData.principalGeography,
    domain:orgData.domain
  });
  const [uploadedImage, setUploadedImage] = useState<any>();
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  const handleDiscard = () => {
    setValues({
      realm: "",
      instanceUrl: "",
      principalGeography: "",
      domain:""
    });
  };

  const handleSubmit = async () => {
    if (checkSpecialChar(values.realm)) {
      enqueueSnackbar(`Org name cannot contain special characters`, {
        variant: "warning",
      });
    } else if (values.realm.length && values.principalGeography.length) {
      setIsLoading(true);
      //try {
      let form = toFormData({
        ...values,
        file: uploadedImage,
      });
      let res;
      if (isEdit) {
        res = await axios.patch(
          `/api/organization/editLogo/${orgData.id}?realm=${values.realm}`,
          form
        );
        navigate(0);
      } else {
        res = await axios.post(`/api/organization?realm=${values.realm}`, form);
      }
      setOrgData({
        ...orgData,
        realmName: res?.data?.realmName,
        organizationName: res?.data?.organizationName,
        id: res?.data.id,
        organizationId: res?.data.id,
      });
      setIsLoading(false);
      enqueueSnackbar(`${values.realm} successfully created`, {
        variant: "success",
      });
      // } catch (err: any) {
      //   setIsLoading(false);
      //   if (err.response.status === 409) {
      //     enqueueSnackbar(`Organization Already Exists`, {
      //       variant: "error",
      //     });
      //   } else {
      //     enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
      //       variant: "error",
      //     });
      //   }
      // }
    } else {
      enqueueSnackbar(`From Cannot Contain Empty Fields`, {
        variant: "error",
      });
    }
  };

  const handleChange = (e: any) => {
    if (e.target.name === "realm") {
      setValues({
        ...values,
        realm: e.target.value,
        instanceUrl: `https://${e.target.value
          .toLowerCase()
          .replace(/\s+/g, "")}.${REDIRECT_URL}`,
      });
    } else {
      setValues({
        ...values,
        [e.target.name]: e.target.value,
      });
    }
  };

  //-----------------

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
    }
  };

  return (
    <>
      <form
        data-testid="create-org-form"
        autoComplete="off"
        className={classes.form}
      >
        <Grid container>
          <Grid item xs={12} md={1}></Grid>
          <Grid item sm={12} md={5}>
            <Grid
              container
              style={{
                display: "flex",
                flexDirection: "column",
                alignContent: "center",
              }}
            >
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Organization Name:</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <TextField
                  fullWidth
                  name="realm"
                  value={values.realm}
                  variant="outlined"
                  onChange={handleChange}
                  required
                  disabled={isEdit || orgData.organizationName}
                  InputLabelProps={{
                    shrink: false,
                    style: { fontSize: "14px", height: "12px" },
                  }}
                  inputProps={{
                    maxLength: 25,
                    style: { fontSize: "14px", height: "12px", color: "black" },
                    "data-testid": "organization-name",
                  }}
                />
              </Grid>
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Prinicpal Geography:</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <FormControl className={classes.formControl} variant="outlined">
                  {/* <InputLabel>Prinicpal Geography</InputLabel> */}
                  <Select
                    // label="Principal Geography"
                    style={{ fontSize: "14px", color: "black" }}
                    value={values.principalGeography}
                    onChange={handleChange}
                    name="principalGeography"
                    data-testid="principal-geography"
                    disabled={isEdit || orgData.principalGeography}
                    required
                  >
                    <MenuItem value="India">India</MenuItem>
                    <MenuItem value="United States of America">
                      United States of America
                    </MenuItem>
                    <MenuItem value="Russia">Russia</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
               <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Domain Name:</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <TextField
                  fullWidth
                  name="domain"
                  value={values.domain}
                  variant="outlined"
                  onChange={handleChange}
                  required
                  disabled={isEdit || orgData.organizationName}
                  InputLabelProps={{
                    shrink: false,
                    style: { fontSize: "14px", height: "12px" },
                  }}
                  inputProps={{
                    maxLength: 25,
                    style: { fontSize: "14px", height: "12px", color: "black" },
                    "data-testid": "organization-name",
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={1}></Grid>
          <Grid item sm={12} md={5}>
            <Grid
              container
              style={{ display: "flex", flexDirection: "column" }}
            >
              <Grid item sm={12} md={4} className={classes.formTextPadding}>
                <strong>Instance URL:</strong>
              </Grid>
              <Grid item sm={12} md={8} className={classes.formBox}>
                <TextField
                  fullWidth
                  style={{ fontSize: "14px", height: "12px", color: "black" }}
                  // label="Instance URL"
                  name="instanceUrl"
                  value={values.instanceUrl}
                  variant="outlined"
                  onChange={handleChange}
                  inputProps={{
                    style: { fontSize: "14px", height: "12px", color: "black" },
                    "data-testid": "instance-url",
                  }}
                  required
                  disabled={isEdit || orgData.organizationName}
                />
              </Grid>

              <Grid item xs={12} md={1}></Grid>

              <Grid
                item
                sm={12}
                md={8}
                className={classes.formTextPadding}
                style={{ marginTop: "28px" }}
              >
                <strong>Upload Organization Logo:</strong>
              </Grid>

              <Grid item sm={12} md={8} className={classes.formBox}>
                <div style={{ display: "flex" }}>
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    style={{ marginTop: "15px" }}
                  />
                  <div>
                    {uploadedImage && (
                      <img
                        src={URL.createObjectURL(uploadedImage)}
                        alt="Uploaded"
                        style={{
                          width: "55px",
                          height: "55px",
                          marginTop: "-25px",
                        }}
                      />
                    )}
                  </div>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider style={{ margin: "0px 0 10px 0" }} />
        <div className={classes.buttonSection}>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <>
              {" "}
              {!isEdit && !orgData.organizationName && (
                <Button className={classes.discardBtn} onClick={handleDiscard}>
                  Discard
                </Button>
              )}
              {isEdit ? (
                <CustomButton text="Save" handleClick={handleSubmit} /> // Need to be enabled if Org edit comes into picture
              ) : (
                !orgData.organizationName && (
                  <CustomButton text="Create" handleClick={handleSubmit} />
                )
                // {
                /* {!orgData.organizationName && (
                <CustomButton text="Create" handleClick={handleSubmit} />
              )} */
                // }
              )}
            </>
          )}
        </div>
      </form>
    </>
  );
}

export default CreateOrgForm;
