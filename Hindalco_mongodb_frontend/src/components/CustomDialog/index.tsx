import { ComponentType, useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import useStyles from "./styles";
import CustomButton from "../CustomButton";

type DialogProps = {
  component: any;
  setOpen: any;
  open: any;
};

function CustomDialog({ component, open, setOpen }: DialogProps) {
  const classes = useStyles();

  /**
   * @method handleClose
   * @description Function to which closes the custom dialog component
   * @returns nothing
   */
  const handleClose = () => {
    setOpen(false);
  };
  
  return (
    <>
      <Dialog fullWidth={true} maxWidth="xl" open={open} onClose={handleClose}>
        <DialogContent className={classes.dialogBorder}>
          {component}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CustomDialog;
