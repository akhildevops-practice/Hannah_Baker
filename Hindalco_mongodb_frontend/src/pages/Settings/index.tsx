import { useState, useEffect } from "react";
import CustomTable from "../../components/CustomTable";
import {
  CircularProgress,
  Typography,
  Box,
  Fab,
  Tooltip,
} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import FilterListIcon from "@material-ui/icons/FilterList";
import useStyles from "./styles";
import CustomButton from "../../components/CustomButton";
import { useNavigate } from "react-router-dom";
import axios from "../../apis/axios.global";
import EmptyTableImg from "../../assets/EmptyTableImg.svg";
import NoAccess from "../../assets/NoAccess.svg";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useSnackbar } from "notistack";
import { useSetRecoilState } from "recoil";
import { orgFormData } from "../../recoil/atom";
import { orgForm } from "../../schemas/orgForm";
import FilterDrawer from "../../components/FilterDrawer";
import SearchBar from "../../components/SearchBar";
import formatQuery from "../../utils/formatQuery";
import MultiUserDisplay from "../../components/MultiUserDisplay";
import checkRoles from "../../utils/checkRoles";
import SimplePaginationController from "../../components/SimplePaginationController";
import getAppUrl from "../../utils/getAppUrl";

type Props = {};

const headers = [
  "Organization Name",
  "Organization Admin",
  "Created Date",
  "Org ID/Tenant ID",
  "Instance URL",
];

const fields = [
  "organizationName",
  "orgAdmin",
  "createdAt",
  "id",
  "instanceUrl",
];

/**
 * The settings page displays all the organizations
 *
 */

function Settings({}: Props) {
  const classes = useStyles();
  const [data, setData] = useState<any>();
  const [open, setOpen] = useState(false);
  const [deleteOrg, setDeleteOrg] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [rerender, setRerender] = useState(false);
  const setOrgData = useSetRecoilState(orgFormData);
  const [searchValue, setSearchValue] = useState<any>({});
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(1);
  const [count, setCount] = useState<number>();
  const [filterOpen, setFilterOpen] = useState(false);

  const navigate = useNavigate();

  let isAdmin = checkRoles("admin");
  let isOrgAdmin = checkRoles("ORG-ADMIN");

  const handleClick = () => {
    setOrgData(orgForm);
    navigate(`/settings/neworganization`);
  };

  const handleSearchChange = (e: any) => {
    e.preventDefault();
    setSearchValue({
      ...searchValue,
      [e.target.name]: e.target.value,
    });
  };

  const handleDiscard = () => {
    let url = formatQuery(`/api/organization`, { page: 1, limit: 5 }, [
      "page",
      "limit",
    ]);
    getData(url);
    setPage(1);
    setSearchValue({
      orgName: "",
      orgAdmin: "",
    });
  };

  const handleApply = () => {
    let url = formatQuery(
      `/api/organization`,
      { ...searchValue, page: 1, limit: 5 },
      ["orgName", "orgAdmin", "page", "limit"]
    );
    getData(url);
  };

  const getData = async (url: any) => {
    setLoading(true);
    try {
      let res = await axios.get(url);
      if (res?.data?.data) {
        setCount(res.data.dataCount);
        let val = res?.data?.data.map((item: any) => ({
          organizationName: item.organizationName,
          orgAdmin: <MultiUserDisplay data={item?.user} name="email" />,
          createdAt: item.createdAt
            ? new Date(item.createdAt).toDateString()
            : "N/A",
          id: item.id,
          instanceUrl: item.instanceUrl,
          realmName: item.realmName,
        }));
        setData(val);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleEditOrg = (data: any) => {
    navigate(`/settings/neworganization/${data.realmName}`);
  };

  const handleOpen = (val: any) => {
    setOpen(true);
    setDeleteOrg(val);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    handleClose();
    setLoading(true);
    try {
      let res = await axios.delete(
        `api/organization/deleteorg/${deleteOrg.id}`
      );
      enqueueSnackbar(`Operation Successfull`, { variant: "success" });
      setLoading(false);
      setRerender(!rerender);
    } catch (err) {
      enqueueSnackbar(`Error ${err}`, {
        variant: "error",
      });
      setLoading(false);
    }
  };

  const handleChangePage = (page: any) => {
    setPage(page);
    let url = formatQuery(
      `/api/organization`,
      { ...searchValue, page: page, limit: 5 },
      ["orgName", "orgAdmin", "page", "limit"]
    );
    getData(url);
  };

  useEffect(() => {
    setOrgData(orgForm);
    setPage(1);
    let url = formatQuery(`/api/organization`, { page: 1, limit: 5 }, [
      "page",
      "limit",
    ]);
    if (!isOrgAdmin) getData(url);
    if (isOrgAdmin) {
      let realmName = getAppUrl();
      navigate(`/settings/neworganization/${realmName}`);
    }
  }, [rerender]);

  return (
    <div className={classes.root}>
      <ConfirmDialog
        open={open}
        handleClose={handleClose}
        handleDelete={handleDelete}
      />
      <FilterDrawer
        open={filterOpen}
        setOpen={setFilterOpen}
        resultText={count ? `Showing ${count} Result(s)` : `No Results Found`}
        handleApply={handleApply}
        handleDiscard={handleDiscard}
      >
        <SearchBar
          placeholder="By Organization Name"
          name="orgName"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
        <SearchBar
          placeholder="By Organization Admin"
          name="orgAdmin"
          handleChange={handleSearchChange}
          values={searchValue}
          handleApply={handleApply}
        />
      </FilterDrawer>
      {isAdmin ? (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" color="primary">
              Organization Management
            </Typography>

            <Box display="flex" alignItems="center" justifyContent="flex-end">
              <Box className={classes.filterButtonContainer}>
                <Tooltip title="Filter">
                  <Fab
                    size="medium"
                    className={classes.fabButton}
                    onClick={() => setFilterOpen(true)}
                  >
                    <FilterListIcon />
                  </Fab>
                </Tooltip>
              </Box>
              <Tooltip title="Add Organization">
                <Fab
                  size="medium"
                  className={classes.fabButton}
                  onClick={handleClick}
                >
                  <AddIcon />
                </Fab>
              </Tooltip>
            </Box>
          </Box>

          {loading ? (
            <div className={classes.loader}>
              <CircularProgress />
            </div>
          ) : data && data?.length !== 0 ? (
            <div data-testid="custom-table" className={classes.tableContainer}>
              <CustomTable
                header={headers}
                fields={fields}
                data={data}
                isAction={true}
                actions={[
                  {
                    label: "Edit",
                    icon: <EditIcon fontSize="small" />,
                    handler: handleEditOrg,
                  },
                  {
                    label: "Delete",
                    icon: <DeleteIcon fontSize="small" />,
                    handler: handleOpen,
                  },
                ]}
              />
              <SimplePaginationController
                count={count}
                page={page}
                rowsPerPage={5}
                handleChangePage={handleChangePage}
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
                Let’s begin by adding an organization
              </Typography>
            </>
          )}
        </>
      ) : (
        <>
          <div className={classes.emptyTableImg}>
            <img src={NoAccess} alt="No Data" height="400px" width="300px" />
          </div>
          <Typography align="center" className={classes.emptyDataText}>
            You are not authorized to view this page
          </Typography>
        </>
      )}
    </div>
  );
}

export default Settings;
