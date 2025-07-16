//react,recoil
import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import { referencesData } from "recoil/atom";

//material-ui
import {
  FormLabel,
  InputAdornment,
  TextField,
  Tooltip,
  useMediaQuery,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import SendIcon from "@material-ui/icons/Send";
import DeleteIcon from "@material-ui/icons/Delete";

//logo,icons
import HindalcoLogoSvg from "assets/logo/HindalcoLogoSvg.svg";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import HelpIcon from "@material-ui/icons/Help";

//antd
import { Modal, Table, Button, Form, Input, Popconfirm, Popover } from "antd";
import type { FormInstance } from "antd/es/form";

//components
import ReferencesResultPage from "pages/ReferencesResultPage";

//styles
import useStyles from "./style";

//css
import "./temp.css";
import axios from "apis/axios.global";
import getSessionStorage from "utils/getSessionStorage";
// import { matches } from "lodash";

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: any;
  handleSave: (record: any) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<any>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef?.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    // console.log("inside is the editable if");

    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input
          ref={inputRef}
          onPressEnter={save}
          onBlur={save}
          // placeholder="Enter Your Comments Here..."
          style={{ border: "2px solid #e8f3f9" }}
        />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type Props = {
  drawer?: any;
  drawerDataState?: any;
  clauseSearch?: boolean;
  activeTabKey?: any;
  disableFormFields?: boolean;
  refForcipForm24?: any;
};

function arrayToQueryString(key: any, array: any) {
  if (array && array.length > 0) {
    return array
      .map((item: any) => `${key}[]=${encodeURIComponent(item)}`)
      .join("&");
  }
  return "";
}

const CommonReferencesTab = ({
  drawer,
  drawerDataState,
  clauseSearch,
  activeTabKey,
  disableFormFields,
  refForcipForm24,
}: Props) => {
  const matches = useMediaQuery("(min-width:786px)");
  const [searchValue, setSearchValue] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selected, setSelected] = useState<any>([]);
  const [selectedData, setSelectedData] = useState<any>([]);
  const [locationOptions, setLocationOptions] = useState<any>([]);
  const [departmentOptions, setDepartmentOptions] = useState<any>([]);

  const userDetails = getSessionStorage();
  const [refData, setRefData] = useRecoilState(referencesData);
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [logo, setLogo] = useState<any>(null);
  const getLogo = async () => {
    const response = await axios.get(`/api/location/getLogo`);
    setLogo(response.data);
  };
  useEffect(() => {
    setRefData(selectedData);
  }, [selectedData]);
  useEffect(() => {
    getLogo();
    getLocationList();
    getAllDepartmentsByOrgAndUnitFilter();

    // console.log("in common ref tab useEffect[drawer?.mode]", drawer);
    if (!!drawer && drawer?.mode === "edit") {
      getRefsForDocument();
    }
    if (!!drawerDataState && !drawer && drawerDataState?.formMode === "edit") {
      getRefsForDocument();
    }
  }, [drawer?.mode]);
  // console.log("inside commonreferences tab", drawer);

  useEffect(() => {
    if (selected && selected.length > 0) {
      // console.log("check selected in useEffect ", selected);
      let filteredData = selected.reduce((unique: any, item: any) => {
        return unique.findIndex(
          (uniqueItem: any) =>
            uniqueItem.refId === item.refId && uniqueItem.type === item.type
        ) < 0
          ? [...unique, item]
          : unique;
      }, []);
      // console.log("check filteredData", filteredData);

      setSelectedData(filteredData);
    }
  }, [selected]);

  const getLocationList = async () => {
    try {
      const res = await axios.get(
        `/api/aspect-impact/getAllLocation/${userDetails?.organizationId}`
      );

      if (res.status === 200 || res.status === 201) {
        console.log("checkrisk res in getAllDepartments", res);
        if (res?.data?.data && !!res.data.data.length) {
          setLocationOptions(
            res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.locationName,
            }))
          );
        } else {
          setLocationOptions([]);
          // enqueueSnackbar("No Departments Found", {
          //   variant: "warning",
          // });
        }
      } else {
        // setJobTitleOptions([]);
        // enqueueSnackbar("Error in fetching getAllDepartments", {
        //   variant: "error",
        // });
      }
    } catch (error) {}
  };

  const getAllDepartmentsByOrgAndUnitFilter = async (
    locationIdArray: any = []
  ) => {
    try {
      let locationIdQueryString = "",
        queryStringParts = [];
      if (!!locationIdArray?.length) {
        locationIdQueryString = arrayToQueryString("location", locationIdArray);
      }
      queryStringParts = [locationIdQueryString].filter(
        (part) => part.length > 0
      );
      queryStringParts.join("&");
      const res = await axios.get(
        `/api/entity/all/org/${userDetails?.organizationId}?${queryStringParts}`
      );

      if (res.status === 200 || res.status === 201) {
        if (res?.data?.data && !!res.data.data.length) {
          setDepartmentOptions(
            res?.data?.data?.map((item: any) => ({
              ...item,
              value: item.id,
              label: item.entityName,
            }))
          );
        } else {
          setDepartmentOptions([]);
          // enqueueSnackbar("No Departments Found", {
          //   variant: "warning",
          // });
        }
      } else {
        // setJobTitleOptions([]);
        // enqueueSnackbar("Error in fetching getAllDepartments", {
        //   variant: "error",
        // });
      }
    } catch (error) {
      // console.log("checkrisk error in fetching all job title", error);
    }
  };
  const getRefsForDocument = async () => {
    try {
      const docId = drawer?.data?.id || drawerDataState?.id;
      const response = await axios.get(`api/refs/${docId}`);
      // console.log("in getRefsForDocument", response);
      if (response.status === 200 || response.status === 201) {
        if (response?.data || response?.data?.length > 0) {
          setSelectedData(response.data);
          setSelectedData(response.data);
        } else {
          setSelectedData([]);
        }
      }
    } catch (error) {}
  };

  const handlePressEnter = (event: any) => {
    if (event.key === "Enter") {
      // console.log("press enter", searchValue);
      redirectToGlobalSearch();
    }
  };

  const handleDelete = (refId: any) => {
    const newData = selectedData.filter((item: any) => item.refId !== refId);
    setSelectedData(newData);
  };

  const handleSave = (row: any) => {
    const newData = [...selectedData];
    const index = newData.findIndex((item) => row.id === item.id);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });

    // console.log("check newData", newData);
    setSelectedData(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const referencesColumns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (_: any, record: any) => record.type,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => {
        if (!!record?.link && record?.link !== "") {
          return (
            <a
              href={record?.link}
              target="_blank"
              style={{ color: "black", textDecoration: "underline" }}
            >
              {record?.name}
            </a>
          );
        } else {
          return record?.name;
        }
      },
    },
    {
      title: "Comments",
      dataIndex: "comments",
      key: "comments",
      editable: true,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: any) =>
        selectedData.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record?.refId)}
          >
            <Tooltip title="Delete">
              <DeleteIcon style={{ fill: "#003566" }} />
            </Tooltip>
          </Popconfirm>
        ) : null,
    },
  ];

  const newreferencesColumns = [
    {
      title: "Clause Number",
      dataIndex: "number",
      key: "number",
      render: (_: any, record: any) => record.number,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => {
        if (!!record?.link && record?.link !== "") {
          return (
            <a
              href={record?.link}
              target="_blank"
              style={{ color: "black", textDecoration: "underline" }}
            >
              {record?.name}
            </a>
          );
        } else {
          return record?.name;
        }
      },
    },
    {
      title: "systemName",
      dataIndex: "systemName",
      key: "systemName",
      editable: true,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: any) =>
        selectedData.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record?.refId)}
          >
            <Tooltip title="Delete">
              <DeleteIcon style={{ fill: "#003566" }} />
            </Tooltip>
          </Popconfirm>
        ) : null,
    },
  ];
  const columns = referencesColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave,
      }),
    };
  });

  const handleClickSearch = () => {
    // console.log("click search", searchValue);
    redirectToGlobalSearch();
  };

  const redirectToGlobalSearch = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const content = (
    <div style={{ padding: "10px", fontSize: "14px" }}>
      {clauseSearch ? (
        <>
          <ul style={{ margin: 0, paddingLeft: "20px", width: "400px" }}>
            <li>
              <b>Clauses </b>(By Number, Name, and Description)
            </li>
          </ul>
          <br />
          <li>
            <b>By Default User's Unit Filter is Applied</b>
          </li>
        </>
      ) : (
        <>
          <ul style={{ margin: 0, paddingLeft: "20px", width: "400px" }}>
            <li>
              <b>Documents</b> (By Doc Name, Doc Number, Tags, Doc Type,
              Department, State )
            </li>
            <li>
              <b>CAPA</b> (By Title and Description)
            </li>
            <li>
              <b>CIP</b> (By Title)
            </li>
            <li>
              <b>HIRA</b> (By Job Title)
            </li>
            <li>
              <b>Aspect</b> impact (by Stage)
            </li>
            <li>
              <b>Ref Doc</b> (By Title)
            </li>
            <li>
              <b>NC </b>(By Numbrt, Status, Severity)
            </li>
            <li>
              <b>Clauses </b>(By Number, Name, and Description)
            </li>
          </ul>
          <br />
          <li>
            <b>By Default User's Unit Filter is Applied</b>
          </li>
        </>
      )}
    </div>
  );
  return (
    <div className={classes.modalWrapper}>
      <br />
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <TextField
          style={{ width: "245px" }}
          id="standard-basic"
          placeholder={"Global Search"}
          value={searchValue}
          onChange={(e) => setSearchValue(e.currentTarget.value)}
          onKeyDown={handlePressEnter}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{ fill: "black" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <Tooltip
                title={
                  searchValue
                    ? "Click to search for entered value"
                    : "Click to search in all clauses"
                }
              >
                <InputAdornment position="end">
                  <SendIcon
                    style={{ fill: "black", cursor: "pointer" }}
                    onClick={() => handleClickSearch()}
                  />
                </InputAdornment>
              </Tooltip>
            ),
            inputProps: {
              style: { color: "black" },
            },
          }}
        />
        <Popover
          placement="bottomRight"
          title={"Search"}
          content={content}
          trigger={["hover", "click"]}
        >
          <HelpIcon
            style={{
              fontSize: "24px",
              cursor: "pointer",
              // color: "blue",
            }}
          />
        </Popover>
      </div>
      <br /> <br />
      {/* {selectedData && selectedData.length > 0 && (
        <div data-testid="custom-table" className={classes.tableContainer}>
          <Table
            columns={columns as any}
            dataSource={selectedData}
            pagination={false}
            rowKey="id"
            components={components}
            rowClassName={() => "editable-row"}
          />
        </div>
      )} */}
      {selectedData && selectedData.length > 0 && (
        <div data-testid="custom-table" className={classes.tableContainer}>
          {!clauseSearch ? (
            <Table
              columns={columns as any}
              dataSource={selectedData}
              pagination={false}
              rowKey="id"
              components={components}
              rowClassName={() => "editable-row"}
            />
          ) : (
            <>
              {selectedData && (
                <Table
                  columns={newreferencesColumns}
                  dataSource={selectedData.filter(
                    (item: any) => item.type === "Clause"
                  )}
                  pagination={false}
                  rowKey="id"
                  components={components}
                  rowClassName={() => "editable-row"}
                />
              )}
            </>
          )}
        </div>
      )}
      <Modal
        title={
          <div className={classes.header}>
            <img
              src={logo || HindalcoLogoSvg}
              height={"50px"}
              width={"70px"}
              style={{ marginRight: "15px" }}
            />

            <span className={classes.moduleHeader}>Search Results</span>
          </div>
        }
        width={1000}
        style={{ top: 6, right: matches ? 254 : 0 }}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
        footer={false}
        bodyStyle={{ overflow: "hidden" }}
        className={classes.modalWrapper}
      >
        <ReferencesResultPage
          searchValue={searchValue}
          selected={selectedData}
          setSelected={setSelected}
          isModalVisible={isModalVisible}
          clauseSearch={clauseSearch}
          activeTabKey={activeTabKey}
          locationOptions={locationOptions}
          departmentOptions={departmentOptions}
          getAllDepartmentsByOrgAndUnitFilter={
            getAllDepartmentsByOrgAndUnitFilter
          }
        />
      </Modal>
    </div>
  );
};

export default CommonReferencesTab;
