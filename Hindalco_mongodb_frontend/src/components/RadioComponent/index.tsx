import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import React from "react";
import { useStyles } from "./styles";

type Props = {
  handler: (e: React.ChangeEvent<{}>) => void;
  data?: any;
  disabled?: boolean;
  initialValue?: any;
};

/**
 * @method RadioComponent
 * @description Function component to generate a radio component
 * @param handler {function}
 * @param data {any}
 * @param disabled {boolean}
 * @returns a react node
 */
const RadioComponent = ({
  handler,
  data,
  disabled,
  initialValue = "",
}: Props) => {
  const classes = useStyles();
  const [value, setValue] = React.useState(initialValue);

  /**
   * @method handleChange
   * @description Function to handle changes on the radio component
   * @param event {any}
   */
  const handleChange = (event: any) => {
    setValue(event.target.value);
  };

  return (
    <FormControl
      component="fieldset"
      className={classes.radio}
      disabled={disabled}
    >
      <RadioGroup row name="radio" value={value} onChange={handler}>
        {data.map((item: any) => (
          <FormControlLabel
            value={item.name}
            name="radio"
            control={<Radio color="primary" />}
            label={item.name}
            onChange={handleChange}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default RadioComponent;
