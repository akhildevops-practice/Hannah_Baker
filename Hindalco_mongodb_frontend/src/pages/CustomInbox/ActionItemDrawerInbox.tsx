import {
  CircularProgress,
  Tooltip,
  useMediaQuery,
  Menu,
  MenuItem,
} from "@material-ui/core";
import { Button, Drawer, Modal, Space, Tabs } from "antd";

import { useContext, useEffect, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import { referencesData } from "../../recoil/atom";

import { useRecoilState } from "recoil";
import axios from "../../apis/axios.global";
import { useSnackbar } from "notistack";
import getAppUrl from "../../utils/getAppUrl";
import toFormData from "../../utils/toFormData";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
// import SocketContext from "components/SocketProvider/index";

import CommonReferencesTab from "../../components/CommonReferencesComponents/CommonReferencesTab";
import getSessionStorage from "../../utils/getSessionStorage";
import TextArea from "antd/es/input/TextArea";
import EditMrmActionPoint from "../MRM/Drawer/EditMrmActionPoint";
import ActionItem from "components/CIPManagement/CIPTable/CIPDrawer/StakeHolders/ActionItem";
import ActionItemDrawer from "components/CIPManagement/CIPTable/ActionItemDrawer";
import CaraDrawer from "components/CaraDrawer";
import CaraActionitemDrawer from "components/CaraDrawer/CaraActionitemDrawer";

const DocStateIdentifier: any = {
  "Send for Edit": "SEND_FOR_EDIT",
  "Review Complete": "IN_APPROVAL",
  Approve: "PUBLISHED",
  Publish: "PUBLISHED",
  "Send for Review": "IN_REVIEW",
  "Save as Draft": "DRAFT",
  Amend: "AMMEND",
  "Send for Approval": "IN_APPROVAL",
  Save: "Save",
};

type Props = {
  drawer?: any;
  setDrawer?: any;
  reloadList?: any;
  handleCloseDrawer: any;
  handleCapaDrawer?: any;
  // reloadGraphs?: any;
};

const ActionItemDrawerInbox = ({
  drawer,
  setDrawer,
  reloadList,
  handleCloseDrawer,
  handleCapaDrawer,
}: Props) => {
  const [activeTabKey, setActiveTabKey] = useState<any>(1);
  const [detailsDrawer, setDetailsDrawer] = useState<any>(false);
  const [editData, setEditData] = useState<any>({});
  const [auditTrailDrawer, setAuditTrailDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [mrmActionPointEdit, setMrmActionPointEdit] = useState(false);
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const realmName = getAppUrl();
  const navigate = useNavigate();
  const location = useLocation();

  const { enqueueSnackbar } = useSnackbar();
  // const { socket } = useContext<any>(SocketContext);

  const [formData, setFormData] = useState<any>({});
  const [drawerDataState, setDrawerDataState] = useState<any>({});
  const loggedInUser = JSON.parse(sessionStorage.getItem("userDetails") as any);

  const [uploadFileError, setUploadFileError] = useState<any>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<any>([]);
  const [disableFormFields, setDisableFormFields] = useState<any>(false);
  const [acitveTab, setActiveTab] = useState<any>("2");
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isUpload, setUpload] = useState<boolean>(false);
  const [selectedReviewerFormData, setSelectedReviewerFormData] = useState<any>(
    []
  );
  const [commnetValue, setCommentValue] = useState("");

  const [selectedApproverFormData, setSelectedApproverFormData] = useState<any>(
    []
  );
  const [favorite, setFavorite] = useState<boolean>(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState("");

  const [refsData] = useRecoilState(referencesData);

  const userDetails = getSessionStorage();
  const orgId = sessionStorage.getItem("orgId");
  const [editTrue, setEditTrue] = useState(true);
  const [mrmActionId, setMrmActionId] = useState<any>();

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const [openModalForComment, setopenModalForComment] = useState(false);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isItemInDisableBtnFor = (disableBtnFor: any, item: any) => {
    return disableBtnFor.includes(item);
  };
  const [open, setOpen] = useState(false);
  // useEffect(() => {
  //   if (drawer?.mode === "edit") {
  //     setDrawerDataState({
  //       data: drawer?.data,
  //       id: drawer?.data?._id,
  //       formMode: "edit",
  //     });
  //     setMrmActionId(drawer?.data?._id);
  //   }
  // });

  const handlerActionEditClose = () => {
    setMrmActionPointEdit(false);
  };
  const handleCapaCloseDrawer = () => {
    // setDrawer({
    //   data: null,
    //   open: false,
    //   mode: "create",
    // });

    if (setIsEdit) {
      setIsEdit(false);
    }
    // getCapaResponse();
  };
  return (
    <>
      {drawer.source === "MRM" && (
        <EditMrmActionPoint
          open={true}
          onClose={handlerActionEditClose}
          addNew={true}
          dataSourceFilter={mrmActionId}
          setAgendaData={undefined}
          agendaData={undefined}
          setFormData={undefined}
          formData={undefined}
          actionRowData={drawer.data}
          year={drawer.data.year}
          valueById={undefined}
          data={undefined}
          readMode={false}
          inboxDrawer={drawer}
          handleCloseDrawer={handleCloseDrawer}
          setLoadActionPoint={false}
          moduleName={"INBOX"}
        />
      )}
      {drawer.source === "CIP" && (
        <ActionItemDrawer
          actionItemDrawer={drawer}
          actionRowData={drawer.data}
          inboxDrawer={drawer}
          setActionItemDrawer={setDrawer}
          moduleName={"INBOX"}
          handleCloseDrawer={handleCloseDrawer}
        />
      )}
      {drawer?.source === "CAPA" && (
        <CaraActionitemDrawer
          openmodal={true}
          setOpen={setOpen}
          drawerdata={drawer.data}
          drawer={drawer}
          moduleName={"INBOX"}
          handleCloseDrawer={handleCloseDrawer}
          setEditData={setEditData}
        />
      )}
    </>
  );
};

export default ActionItemDrawerInbox;
