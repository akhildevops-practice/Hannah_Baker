import { useState, useEffect, useContext, Key } from "react";
import CustomTable from "components/CustomTable";
import useStyles from "./styles";
import {
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
  Chip,
  IconButton,
} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import SimplePaginationController from "components/SimplePaginationController";
import EmptyTableImg from "assets/EmptyTableImg.svg";
import Grid from "@material-ui/core/Grid";
import AddDocumentForm from "components/AddDocumentForm";
import CustomDialog from "components/CustomDialog";
import { useRecoilState } from "recoil";
import { documentTypeFormData } from "recoil/atom";
import { docTypeForm } from "schemas/docTypeForm";
import getAppUrl from "utils/getAppUrl";
import axios from "apis/axios.global";
import formatQuery from "utils/formatQuery";
import { useSnackbar } from "notistack";
import ConfirmDialog from "components/ConfirmDialog";
import CustomButton from "components/CustomButton";
import checkRoles from "utils/checkRoles";
import getUserId from "utils/getUserId";
import NoAccess from "assets/NoAccess.svg";
// import SocketContext from "components/SocketProvider/index";
import { isValidDocType } from "apis/documentsApi";
import UserInfoCard from "components/newComponents/UserInfoCard";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import ModuleHeader from "components/Navigation/ModuleHeader";
import { Button, Divider, Pagination, Table, Tooltip } from "antd";
import { ReactComponent as CustomDeleteICon } from "assets/documentControl/Delete.svg";
import { ReactComponent as CustomEditICon } from "assets/documentControl/Edit.svg";
import ListAltIcon from "@material-ui/icons/ListAlt";
import { roles } from "utils/enums";
import { isValid } from "utils/validateInput";
import { useNavigate } from "react-router-dom";

const headers = [
  "Document Type",
  "Review Frequency",
  "Revision Pre- Notification",
  "Read Access",
  //"Document Level",

  "Document Numbering",
];
const fields = [
  "documentTypeName",
  "reviewFrequency",
  "revisionRemind",
  "readAccess",
  // "document_classification",

  "documentNumbering",
];

const isOrgAdmin = checkRoles(roles.ORGADMIN);

interface Location {
  id: string;
  locationName: string;
  // Add other properties here
}
const DocumentTypeData = () => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [count, setCount] = useState<number>();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState(10);
  const [formData, setFormData] = useRecoilState(documentTypeFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>([
    { id: "All", locationName: "All" },
  ]);
  const [selectedLoc, setSelectedLoc] = useState([]);
  const [locationNames, setLocationNames] = useState<Location[]>([]);
  const [tableData, setTableData] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteDocType, setDeleteDocType] = useState<any>();
  const [rerender, setRerender] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [nEdit, setNEdit] = useState(false);
  const isOrgAdmin = checkRoles("ORG-ADMIN");
  const isAdmin = checkRoles("admin");
  const isLocAdmin = checkRoles("LOCATION-ADMIN");
  const isMR = checkRoles("MR");
  const realmName = getAppUrl();
  const [locationName, setLocationName] = useState(null);
  const [readMode, setReadMode] = useState(false);
  // const { socket } = useContext<any>(SocketContext);
  const navigate = useNavigate();

  const listData = ["None", "Respective Department", "Respective Unit"];

  useEffect(() => {}, [formData]);

  const getLocationNames = async () => {
    setIsLoading(true);
    try {
      setIsLoading(true);
      const res = await axios.get(
        `api/location/getLocationsForOrg/${realmName}`
      );

      setLocationNames(res.data);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };
  const allOption = { id: "All", locationName: "All" };
  const getTableData = async (url: any) => {
    try {
      setIsLoading(true);
      const res = await axios.get(url);
      if (res.data) {
        setCount(res.data.length);
        setLocationName(res.data.location ? res.data.location : null);
        let temp = res.data.data.map((item: any) => {
          return {
            id: item.id,
            documentTypeName: item.documentTypeName,
            reviewFrequency: item.reviewFrequency ? item.reviewFrequency : "-",
            revisionRemind: item.revisionRemind ? item.revisionRemind : "-",
            // readAccess: item.readAccess.type,
            readAccess: item.readAccess,
            readAccessUsers: item.readAccessUsers,
            creators: item.creators,
            reviewers: item.reviewers,
            approvers: item.approvers,
            documentNumbering: item.documentNumbering,
            users: item?.users,
            prefix: item.prefix.split("-"),
            suffix: item.suffix.split("-"),
            applicable_systems: item.applicable_systems,
            distributionList: item.distributionList,
            distributionUsers: item.distributionUsers,
            newdistribution: item.distributionUsers,

            document_classification: item.document_classification,
            currentVersion: item.currentVersion,
            locationId: item.locationId,
          };
        });
        setTableData(temp);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };
  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteDocType(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChangePage = (page: any) => {
    let url: any;
    setPage(page);
    if (selectedLocation.find((option: any) => option.id === "All")) {
      url = formatQuery(`api/doctype/location/All`, { page, limit }, [
        "page",
        "limit",
      ]);
    } else {
      // const locationIds = selectedLocation.map((value: any) => value.id);
      // url = formatQuery(
      //   `api/doctype/location/${locationIds}`,
      //   { page, limit: 5 },
      //   ["page", "limit"]
      // );
      const locationIds = selectedLocation.map((value: any) => `"${value.id}"`);
      const locationIdsString = locationIds.join(",");
      url = formatQuery(
        `api/doctype/location/[${locationIdsString}]`,
        { page, limit },
        ["page", "limit"]
      );
    }
    getTableData(url);
  };

  const handleChange = (event: any, values: any) => {
    if (values.find((option: any) => option.id === "All")) {
      setSelectedLocation([allOption]);
    } else {
      setSelectedLocation(values.filter((option: any) => option.id !== "All"));
    }
  };

  const handleDelete = async () => {
    handleClose();
    setIsLoading(true);
    try {
      await axios.delete(`api/doctype/${deleteDocType.id}`);
      enqueueSnackbar(`Operation Successful`, { variant: "success" });
      setIsLoading(false);
      setRerender(!rerender);
    } catch (err) {
      enqueueSnackbar(`Error ${err}`, {
        variant: "error",
      });
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    let { users, ...finalValues } = formData;
    let userId = getUserId();

    // let document_classification = await isValidDocType(
    //   formData.document_classification
    // ).then((response: any) => {
    //   //console.log("response", response.data);
    //   return response.data;
    // });

    //let finalResult = edit ? true : document_classification;
    const validatedocumentTypeName = await isValid(formData.documentTypeName);

    if (validatedocumentTypeName.isValid === false) {
      enqueueSnackbar(
        `Document Type Name ${validatedocumentTypeName?.errorMessage}`,
        {
          variant: "error",
        }
      );
      return;
    }

    if (formData.reviewFrequency === "") {
      enqueueSnackbar(`Update Revision Frequency`, {
        variant: "warning",
      });
      return;
    }

    if (formData?.applicable_systems?.length === 0) {
      enqueueSnackbar(`Update System`, {
        variant: "warning",
      });
      return;
    }

    if (formData.revisionRemind === "") {
      enqueueSnackbar(`Update Revision Remind`, {
        variant: "warning",
      });
      return;
    }

    if (
      formData.documentTypeName &&
      formData.documentNumbering &&
      (formData.readAccess !== "None"
        ? formData.readAccessUsers.length > 0
          ? true
          : false
        : true) &&
      // formData.creators &&
      //   formData.distributionList !== "None" ||
      // formData.distributionList !== "Respective Department" ||
      // formData.distributionList !== "Respective Unit"
      (!listData.includes(formData.distributionList)
        ? formData.distributionUsers.length > 0
          ? true
          : false
        : true) &&
      // (formData.distributionList !== "Respective Department"
      //   ? formData.distributionUsers.length > 0
      //     ? true
      //     : false
      //   : true) &&
      // (formData.distributionList !== "Respective Unit"
      //   ? formData.distributionUsers.length > 0
      //     ? true
      //     : false
      //   : true) &&
      //finalResult &&
      (formData.documentNumbering === "Serial"
        ? formData.prefix.length || formData.suffix.length
        : true)
    ) {
      setFormDialogOpen(false);
      setIsLoading(true);

      if (edit) {
        try {
          if (formData.readAccess === "Restricted Access") {
            let res = await axios.patch(`api/doctype/${formData.id}`, {
              ...formData,
              creators: formData.creators,
              locationIdOfDoctype: formData.locationId,
              reviewFrequency: parseInt(formData.reviewFrequency),
              revisionRemind: parseInt(formData.revisionRemind),
              readAccess: { type: formData.readAccess, usersWithAccess: users },
            });
            // socket?.emit("documentTypeUpdated", {
            //   data: res.data,
            //   currentUser: `${userId}`,
            // });
            enqueueSnackbar(`Operation Successful`, { variant: "success" });
          } else {
            let res = await axios.patch(`api/doctype/${formData.id}`, {
              ...formData,
              document_classification: formData?.document_classification
                ? formData.document_classification
                : null,
              creators: formData.creators,
              locationIdOfDoctype: formData.locationId,
              distributionList: formData.distributionList,
              distributionUsers: formData.distributionUsers,
              reviewFrequency: parseInt(formData.reviewFrequency),
              revisionRemind: parseInt(formData.revisionRemind),
              readAccess: { type: formData.readAccess },
              readAccessUsers: formData.readAccessUsers,
            });
            // socket?.emit("documentTypeUpdated", {
            //   data: res.data,
            //   currentUser: `${userId}`,
            // });
            enqueueSnackbar(`Doc Type Saved`, { variant: "success" });
          }
          setRerender(!rerender);
          setIsLoading(false);
        } catch (err) {}
      } else {
        try {
          if (formData.readAccess === "Restricted Access") {
            let { users, ...finalValues } = formData;
            let res = await axios.post("api/doctype", {
              ...formData,
              document_classification: formData?.document_classification
                ? formData.document_classification
                : null,
              creators: formData.creators,
              reviewFrequency: parseInt(formData.reviewFrequency),
              revisionRemind: parseInt(formData.revisionRemind),
              readAccess: {
                type: formData.readAccess,
                // usersWithAccess: formData.readAccessUsers,
              },
              readAccessUsers: formData.readAccessUsers,
              locationIdOfDoctype: formData.locationId,
            });

            // socket?.emit("documentTypeCreated", {
            //   data: res.data,
            //   currentUser: `${userId}`,
            // });
          } else {
            let res = await axios.post("api/doctype", {
              ...formData,
              document_classification: formData?.document_classification
                ? formData.document_classification
                : null,
              creators: formData.creators,
              reviewFrequency: parseInt(formData.reviewFrequency),
              revisionRemind: parseInt(formData.revisionRemind),
              readAccess: { type: formData.readAccess },
              readAccessUsers: formData.readAccessUsers,
              locationIdOfDoctype: formData.locationId,
            });
            formData?.locationId?.map((value: any) => {});

            // socket?.emit("documentTypeCreated", {
            //   data: res.data,
            //   currentUser: userId,
            // });
          }
          enqueueSnackbar(`Doc Type Created`, { variant: "success" });
          setRerender(!rerender);
          setIsLoading(false);
        } catch (err: any) {
          if (err.response.status === 409) {
            enqueueSnackbar(`Document Classification Already Exists`, {
              variant: "error",
            });
          } else {
            enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
              variant: "error",
            });
          }
          setIsLoading(false);
        }
      }
    } else {
      enqueueSnackbar(
        `Please fill all the required fields Or Check Document Classification`,
        {
          variant: "warning",
        }
      );
    }
  };
  const handleDiscard = () => {
    setFormData(docTypeForm);
    setFormDialogOpen(false);
  };

  useEffect(() => {
    if (!isAdmin) {
      getLocationNames();
    }
  }, []);

  useEffect(() => {
    let url;
    if (selectedLocation.find((option: any) => option.id === "All")) {
      // console.log("logged in here", locationName);
      const testAll: any[] = ["All"];
      url = formatQuery(`api/doctype/location/${testAll}`, { page, limit }, [
        "page",
        "limit",
      ]);
    } else {
      const locationIds = selectedLocation.map((value: any) => `"${value.id}"`);
      const locationIdsString = locationIds.join(",");
      url = formatQuery(
        `api/doctype/location/[${locationIdsString}]`,
        { page, limit },
        ["page", "limit"]
      );
    }
    if (!isAdmin) getTableData(url);
  }, [rerender, selectedLocation]);

  const handleClickFormDialogOpen = () => {
    setEdit(false);
    setFormData(docTypeForm);
    setFormDialogOpen(true);
    setNEdit(false);
  };

  const handleEditDocTpe = (values: any) => {
    const allLocationdetails = [];
    for (let loc of values.locationId) {
      if (loc === "All") {
        allLocationdetails.push(allOption);
      } else {
        const result = locationNames.map((value) => {
          if (value.id === loc) {
            allLocationdetails.push(value);
          }
        });
      }
    }
    setEdit(true);
    setFormData({ ...values, locationId: allLocationdetails });
    setFormDialogOpen(true);
    setNEdit(true);
  };

  if (isLoading) {
    return (
      <div className={classes.loader}>
        <CircularProgress />
      </div>
    );
  }

  const columns = [
    {
      title: "Document Type",
      dataIndex: "documentTypeName",
      onCell: (record: any) => ({
        onClick: () => {
          navigate(`/processdocuments/documenttype/data/${record?.id}`, {});
        },
      }),
      render: (text: any) => <a>{text}</a>,
    },

    {
      title: "Review Frequency",
      dataIndex: "reviewFrequency",
    },
    {
      title: "Revision Pre- Notification",
      dataIndex: "revisionRemind",
    },
    {
      title: "Read Access",
      dataIndex: "readAccess",
    },
    {
      title: "Document Numbering",
      dataIndex: "documentNumbering",
    },
    {
      title: "Action",
      key: "action",
      width: 200,

      // {
      //   label: "Edit",
      //   icon: <EditIcon fontSize="small" />,
      //   handler: handleEditDocTpe,
      // },
      // {
      //   label: "Delete",
      //   icon: <DeleteIcon fontSize="small" />,
      //   handler: handleOpen,
      // },
      render: (_: any, record: any) => (
        <>
          {isOrgAdmin && (
            <Tooltip title={"Edit Document Type"}>
              <IconButton
                onClick={() => {
                  // handleEditDocTpe(record);
                  // setReadMode(false);
                  navigate(
                    `/processdocuments/documenttype/data/${record?.id}`,
                    {}
                  );
                }}
                style={{ padding: "10px" }}
              >
                <CustomEditICon width={20} height={20} />
              </IconButton>
            </Tooltip>
          )}

          {isOrgAdmin && (
            <Tooltip title={"Delete Document Type"}>
              <IconButton
                onClick={() => {
                  handleOpen(record);
                }}
                style={{ padding: "10px" }}
              >
                <CustomDeleteICon width={20} height={20} />
              </IconButton>
            </Tooltip>
          )}
        </>
      ),
    },
  ];

  const pagination = {
    current: page,
    pageSize: limit, // Display 10 items per page
    total: count, // Total number of items
    showSizeChanger: true, // Show a dropdown to change pageSize
    showQuickJumper: true, // Show quick jumper to jump to page
    showTotal: (total: any, range: any) =>
      `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <>
      {isAdmin ? (
        <>
          <ModuleHeader moduleName="Document Type" />
          <div className={classes.emptyTableImg}>
            <img src={NoAccess} alt="No Data" height="400px" width="300px" />
          </div>
          <Typography align="center" className={classes.emptyDataText}>
            You are not authorized to view this page
          </Typography>
        </>
      ) : (
        <>
          <ModuleHeader moduleName="Document Type" />
          <div className={classes.topSection} style={{ marginTop: "30px" }}>
            <div
              className={classes.topSectionLeft}
              style={{ marginLeft: "5px" }}
            >
              <Grid container>
                <Grid item xs={12} md={3}>
                  <Typography color="primary" className={classes.searchBoxText}>
                    <strong>Applicable unit</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={8}>
                  {isOrgAdmin ? (
                    <div className={classes.locSearchBox}>
                      <Autocomplete
                        multiple
                        id="location-autocomplete"
                        options={[allOption, ...locationNames]}
                        getOptionLabel={(option) => option.locationName || ""}
                        getOptionSelected={(option, value) =>
                          option.id === value.id
                        }
                        value={selectedLocation}
                        onChange={handleChange}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            size="small"
                            label="Location"
                            fullWidth
                          />
                        )}
                      />
                    </div>
                  ) : (
                    <Typography
                      color="primary"
                      className={classes.searchBoxText}
                    >
                      {locationName}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </div>
            <div className={classes.dialogBtnSection}>
              {isOrgAdmin && (
                <CustomButton
                  text="Add"
                  disabled={!isOrgAdmin}
                  handleClick={() => {
                    navigate(`/processdocuments/documenttype/data`, {});
                  }}
                  style={{ width: 71 }}
                />
              )}
              {/* <CustomDialog
                open={formDialogOpen}
                setOpen={setFormDialogOpen}
                component={
                  <AddDocumentForm
                    tableData={tableData}
                    handleSubmit={handleSubmit}
                    handleDiscard={handleDiscard}
                    locId={selectedLocation}
                    locInformation={isOrgAdmin ? selectedLoc : locationNames}
                    isEdit={nEdit}
                    readMode={readMode}
                    setReadMode={setReadMode}
                  />
                }
              /> */}
            </div>
          </div>

          {tableData && tableData?.length ? (
            <div
              data-testid="custom-table"
              className={classes.tableContainer}
              style={{ marginLeft: "5px" }}
            >
              {/* <CustomTable
                header={headers}
                fields={fields}
                // data={docDetails}
                data={tableData}
                isAction={isOrgAdmin}
                actions={[
                  {
                    label: "Edit",
                    icon: <EditIcon fontSize="small" />,
                    handler: handleEditDocTpe,
                  },
                  {
                    label: "Delete",
                    icon: <DeleteIcon fontSize="small" />,
                    handler: handleOpen,
                  },
                ]}
              /> */}
              <Table
                dataSource={tableData}
                columns={columns}
                className={classes.tableContainer}
                pagination={pagination}
                onChange={(e) => {
                  handleChangePage(e.current);
                }}
              />

              {/* <SimplePaginationController
                count={count}
                page={page}
                rowsPerPage={5}
                handleChangePage={handleChangePage}
              /> */}
              <ConfirmDialog
                open={open}
                handleClose={handleClose}
                handleDelete={handleDelete}
              />
            </div>
          ) : (
            <>
              <div className={classes.emptyTableImg}>
                <img
                  src={EmptyTableImg}
                  alt="No Data"
                  height="400px"
                  width="300px"
                />
              </div>
              <Typography align="center" className={classes.emptyDataText}>
                Let’s begin by adding a new Document Type
              </Typography>
            </>
          )}
        </>
      )}
    </>
  );
};
export default DocumentTypeData;
