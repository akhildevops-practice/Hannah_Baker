import React from "react";
import useStyles from "../styles";
import {
  FormControl,
  Grid,
  InputLabel,
  Select,
  TextField,
  MenuItem,
} from "@material-ui/core";

type Props = {
  userType: any;
  handleChange: any;
  formData: any;
  disabledForDeletedModal?: boolean;
};

function UserForm1({
  userType,
  handleChange,
  formData,
  disabledForDeletedModal,
}: Props) {
  const classes = useStyles();
  //console.log("data in UserFrom1", formData);
  return (
    <Grid container>
      {/* <Grid item sm={12} md={4} className={classes.formTextPadding}>
        <strong>User Type*</strong>
      </Grid>
      <Grid item sm={12} md={8} className={classes.formBox}>
        <FormControl
          className={classes.formControl}
          variant="outlined"
          size="small"
        >
          <InputLabel>User Type</InputLabel>
          <Select
            label="User Type"
            value={formData.userType}
            onChange={handleChange}
            name="userType"
            data-testid="userType"
            required
          >
            {userType.map((item: any) => {
              return (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid> */}
      <Grid item sm={12} md={4} className={classes.formTextPadding}>
        <strong>Email Address*</strong>
      </Grid>
      <Grid item sm={12} md={8} className={classes.formBox}>
        <TextField
          fullWidth
          // label='Login URL'
          name="email"
          value={formData.email}
          inputProps={{
            "data-testid": "login-url",
          }}
          disabled={disabledForDeletedModal}
          variant="outlined"
          onChange={handleChange}
          size="small"
        />
      </Grid>
      <Grid item sm={12} md={4} className={classes.formTextPadding}>
        <strong>First Name*</strong>
      </Grid>
      <Grid item sm={12} md={8} className={classes.formBox}>
        <TextField
          fullWidth
          // label='Login URL'
          name="firstName"
          value={formData.firstName}
          inputProps={{
            "data-testid": "login-url",
          }}
          disabled={disabledForDeletedModal}
          variant="outlined"
          onChange={handleChange}
          size="small"
        />
      </Grid>
      <Grid item sm={12} md={4} className={classes.formTextPadding}>
        <strong>Last Name*</strong>
      </Grid>
      <Grid item sm={12} md={8} className={classes.formBox}>
        <TextField
          fullWidth
          // label='Login URL'
          name="lastName"
          value={formData.lastName}
          inputProps={{
            "data-testid": "login-url",
          }}
          disabled={disabledForDeletedModal}
          variant="outlined"
          onChange={handleChange}
          size="small"
        />
      </Grid>
      <Grid item sm={12} md={4} className={classes.formTextPadding}>
        <strong>Username*</strong>
      </Grid>
      <Grid item sm={12} md={8} className={classes.formBox}>
        <TextField
          fullWidth
          // label='Login URL'
          name="username"
          value={formData.username}
          inputProps={{
            "data-testid": "login-url",
            maxLength: 100,
          }}
          disabled={disabledForDeletedModal}
          variant="outlined"
          onChange={handleChange}
          size="small"
        />
      </Grid>
    </Grid>
  );
}

export default UserForm1;
