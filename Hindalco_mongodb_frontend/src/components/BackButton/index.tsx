import { Button } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import useStyles from "./styles";
import { useRecoilValue } from "recoil";
import { mobileView } from "../../recoil/atom";

type Props = {
  parentPageLink: string;
  redirectToTab?: string;
};

function BackButton({ parentPageLink, redirectToTab = "" }: Props) {
  const mobile = useRecoilValue(mobileView);
  const navigate = useNavigate();
  const classes = useStyles();
  return (
    <Button
      onClick={() => {
        navigate(parentPageLink, {
          state: { redirectToTab: redirectToTab }, // Your state here
        });
      }}
      className={mobile ? classes.backBtnMobile : classes.backBtn}
    >
      <ChevronLeftIcon fontSize="small" />
      Back
    </Button>
  );
}

export default BackButton;
