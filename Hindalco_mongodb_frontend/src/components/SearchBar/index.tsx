import React from "react";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "../../assets/SearchIcon.svg";
import { Box, IconButton, TextField, useMediaQuery } from "@material-ui/core";
import InputAdornment from "@material-ui/core/InputAdornment";
import useStyles from "./styles";
import CloseIcon from "@material-ui/icons/Close";
import FormFieldController from "../FormFieldController";
import Autocomplete from "@material-ui/lab/Autocomplete";

type Props = {
  handleChange?: any;
  placeholder: string;
  name: string;
  values: any;
  handleApply: any;
  endAdornment?: any;
  handleClickDiscard?: any;
};

/**
 * This is the Search Bar UI
 *
 */

function SearchBar({
  handleChange,
  placeholder,
  name,
  values,
  handleApply,
  endAdornment = false,
  handleClickDiscard,
}: Props) {
  const classes = useStyles();
  const matches = useMediaQuery("(min-width:786px)");
  const smallScreen = useMediaQuery("(min-width:450px)");
  return (
    <>
      <Paper
        style={{
          width: smallScreen ? "285px" : "95%",
          height: "33px",
          float: "right",
          // margin: "11px",
          borderRadius: "20px",
          border: "1px solid #dadada",
          margin: "0px 10px 0px 0px ",
        }}
        component="form"
        data-testid="search-field-container"
        elevation={0}
        variant="outlined"
        className={classes.root}
        onSubmit={(e) => {
          e.preventDefault();
          handleApply();
        }}
      >
        <TextField
          className={classes.input}
          name={name}
          value={values[name]}
          placeholder={placeholder}
          onChange={handleChange}
          inputProps={{
            "data-testid": "search-field",
          }}
          style={{ margin: "0px 10px" }}
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start" className={classes.iconButton}>
                <img src={SearchIcon} alt="search" />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {endAdornment && values[name] && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickDiscard}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )}
              </>
            ),
            // classes: {
            //   input: classes.resize,
            // },
          }}
        />
      </Paper>
    </>
  );
}

export default SearchBar;
