import {
  Grid,
  IconButton,
  Tooltip,
  TextField,
  Popover,
  Chip,
} from "@material-ui/core";
import React, { memo } from "react";
// import AddIcon from "@material-ui/icons/Add";
// import DeleteIcon from "@material-ui/icons/Delete";
import { ReactComponent as DeleteIcon } from "../../assets/documentControl/Delete.svg";
import { ReactComponent as AddIcon } from "../../assets/icons/SquareAddIcon.svg";
import { ReactComponent as EditIcon } from "../../assets/icons/EditLineIcon.svg";
// import PaletteIcon from "@material-ui/icons/Palette";
import useStyles from "./styles";
import { SwatchesPicker, SketchPicker } from "react-color";
import { Autocomplete } from "@material-ui/lab";

type Props = {
  data: any;
  name: string;
  setData: any;
  keyName: string;
  fixedValue?: string;
  isEdit?: boolean;
  canEdit?: boolean;
  colorPalette?: boolean;
  label?: string;
};

/**
 * This component is responsible for the Dynamic Textfields in forms, It handles the adding and deletion of the textFields
 *
 */

function DynamicFormFields({
  data,
  name,
  setData,
  keyName,
  fixedValue,
  colorPalette = false,
  isEdit = false,
  canEdit = true,
  label,
}: Props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [color, setColor] = React.useState("yellow");
  const [colorIndex, setColorIndex] = React.useState<number>();
  /**
   * @method handleChange
   * @description Function to handle input field value changes and update the recoil state with the latest values
   * @param e {any}
   * @param i {number}
   * @returns nothing
   */

  const handleColorChange = (newColor: any) => {
    const i: any = colorIndex;
    setData((prevState: any) => {
      let currentFieldData = JSON.parse(JSON.stringify(data[name]));
      currentFieldData.splice(i, 1, {
        ...data[name][i],
        color: newColor.hex,
      });
      return { ...prevState, [name]: currentFieldData };
    });
    setColor(newColor.hex);
    setAnchorEl(null);
  };

  const handleOpenPopover = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };
  const handleChange = (e: any, i: number) => {
    setData((prevState: any) => {
      let currentFieldData = JSON.parse(JSON.stringify(data[name]));
      currentFieldData.splice(i, 1, {
        ...data[name][i],
        [keyName]: e.target.value,
      });
      return { ...prevState, [name]: currentFieldData };
    });
  };
  /**
   * @method handleAddFields
   * @description Function to add a new dynamic field component
   * @returns nothing
   */
  const handleAddFields = () => {
    setData((prevState: any) => {
      if (name === "systemType") {
        return {
          ...prevState,
          [name]: [...data[name], { [keyName]: "", color: "yellow" }],
        };
      } else {
        return { ...prevState, [name]: [...data[name], { [keyName]: "" }] };
      }
    });
  };
  /**
   * @method handleDeleteField
   * @description Function to remove a dynamic field component
   * @param index {number}
   * @returns nothing
   */
  const handleDeleteField = (index: number) => {
    setData((prevState: any) => {
      return {
        ...prevState,
        [name]: [...data[name].filter((item: any, i: number) => i !== index)],
      };
    });
  };
  return (
    <Grid container>
      {data[name].map((val: any, i: number) => (
        <React.Fragment key={i}>
          <Grid item xs={6} md={10} className={classes.formBox}>
            <TextField
              // fullWidth
              label={label}
              style={{ width: "90%" }}
              name={keyName}
              value={val[keyName]}
              disabled={
                !canEdit || (val[keyName] === fixedValue && isEdit)
                  ? true
                  : false
              }
              variant="outlined"
              onChange={(e) => {
                handleChange(e, i);
              }}
              size="small"
              InputProps={{
                style: { fontSize: "14px", height: "50px", color: "black" },
                endAdornment: colorPalette ? (
                  <Tooltip title="Add color">
                    <div
                      onClick={(e) => {
                        handleOpenPopover(e);
                        setColorIndex(i);
                      }}
                    >
                      <div
                        style={{
                          borderRadius: "10px",
                          width: "20px",
                          height: "20px",
                          background: val["color"],
                        }}
                      />
                    </div>
                  </Tooltip>
                ) : (
                  ""
                ),
              }}
            />
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleClosePopover}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              <SketchPicker color={color} onChange={handleColorChange} />
            </Popover>
          </Grid>
          <Grid item xs={2} md={2}>
            <Grid container>
              {data[name].length > 1 &&
                !Boolean(data[name][i][keyName] === fixedValue && isEdit) && (
                  <Grid item xs={6} md={6}>
                    <Tooltip title="Remove field">
                      <IconButton
                        data-testid="field-delete-button"
                        style={{
                          marginLeft: "-22px",
                          visibility: `${canEdit ? "visible" : "hidden"}`,
                        }}
                        onClick={() => {
                          handleDeleteField(i);
                        }}
                      >
                        <DeleteIcon width={24} height={24} />
                        {/* <EditIcon width={24} height={24} /> */}
                      </IconButton>
                    </Tooltip>
                  </Grid>
                )}
              {i === data[name].length - 1 &&
                !Boolean(data[name][i][keyName] === "") && (
                  <Grid item xs={6} md={6}>
                    <Tooltip title={`Add a new "${name}" field`}>
                      <IconButton
                        data-testid="field-add-button"
                        onClick={handleAddFields}
                        style={{
                          marginLeft: "-22px",
                          visibility: `${canEdit ? "visible" : "hidden"}`,
                        }}
                      >
                        <AddIcon width={24} height={24}></AddIcon>
                        {/* Add System Type */}
                      </IconButton>
                    </Tooltip>

                    {/* <Tooltip title={`Choose Color`}>
                      <IconButton>
                        {colorPalette ? (
                          <PaletteIcon fontSize="small" color="primary" />
                        ) : null}
                      </IconButton>
                    </Tooltip> */}
                  </Grid>
                )}
            </Grid>
          </Grid>
        </React.Fragment>
      ))}
    </Grid>
  );
}

export default DynamicFormFields;
