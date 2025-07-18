import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  modal: {
    "& .ant-modal-header": {
      textAlign: "center",
    },
  },
  formBox: {
    marginTop: "15px",
    height: "400px",
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "10px",
      backgroundColor: "white",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  gridWrapper: {
    "&. MuiGrid-item": {
      margin: "auto",
    },
  },
  line: {
    width: "20%",
    display: "flex",
    justifyContent: "center",
  },

  root: {
    flexGrow: 1,
    maxWidth: 752,
    backgroundColor: "white",
    padding: "10px",
  },
  demo: {
    "& .MuiListItem-giutters": {
      paddinRight: "0px",
    },
    "& .MuiListItem-root": {
      paddingTop: "0px",
    },
  },
  scrollableList : {
    maxHeight: '200px', // Set the height according to your needs
    overflowY: 'auto',
    "&::-webkit-scrollbar": {
      width: "10px",
      backgroundColor: "white",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      backgroundColor: "grey",
    },
  },
  title: {
    margin: theme.spacing(4, 0, 2),
  },
}));

export default useStyles;
