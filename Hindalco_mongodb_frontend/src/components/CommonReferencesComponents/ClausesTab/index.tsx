//react
import { useState, useEffect } from "react";

//recoil-atom
import { useRecoilState } from "recoil";
import { moduleNamesAtom, globalSearchClausesResult } from "recoil/atom";
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
//antd
import { Pagination, Table } from "antd";
import type { PaginationProps } from "antd";
//material-ui
import CircularProgress from "@material-ui/core/CircularProgress";

//styles
import useStyles from "./style";
import axios from "apis/axios.global";

const showTotal: PaginationProps["showTotal"] = (total) =>
  `Total ${total} items`;


type Props = {
  clauseTableData: any;
  selected?: any;
  setSelected?: any;
  searchValue?: string;
};

const ClausesTab = ({
  clauseTableData = [],
  selected,
  setSelected,
  searchValue = "",
}: Props) => {
  const [tableData, setTableData] = useState<any>([]);
  const [count, setCount] = useState<any>(0);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [page, setPage] = useState<any>(1);
  const [pageSize, setPageSize] = useState<number>(100); // Default page size is 100

  const [moduleNames, setModuleNames] = useRecoilState(moduleNamesAtom);
  const [globalSearchClauses, setGlobalSearchClauses] = useRecoilState<any>(
    globalSearchClausesResult
  );

  const classes = useStyles();

  const totalCount =
  moduleNames.find((module) => module.name === "Clauses")?.count || 0;


  useEffect(() => {
    console.log("checkref clauseTableData in clauses tab-->", clauseTableData);
    setCount(totalCount || 0);
    setTableData(clauseTableData);
  }, [clauseTableData, searchValue]);


  const fetchTableData = async (page: number=1, pageSize: number=100) => {
    try {
      const queryParams: any = {
        organizationId: sessionStorage.getItem("orgId"),
        searchQuery: searchValue,
        page, // Current page
        limit: pageSize, // Page size
      };
      let queryStringParts: any = [];
      for (let [key, value] of Object.entries(queryParams) as [string, any][]) {
        queryStringParts.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
        );
      }
  
      const queryString = queryStringParts.join("&");
      const res = await axios.get(
        `api/globalsearch/getClausesSearchResultWithFilter?${queryString}`
      );
  
      if (res?.status === 200) {
        console.log("Response in getClausesSearchResultWithFilter tab:", res);
        setTableData(res?.data?.data || []);
      }
    } catch (error) {
      console.error("fetchTableData -> error", error);
      
    }
  }

  const handlePaginationChange = (pageParam: number, pageSizeParam?: number) => {
    setPage(pageParam);
    setPageSize(pageSizeParam || 100); // Update page size if changed
    fetchTableData(pageParam, pageSizeParam || 100);
  };


  const columns = [
    {
      title: "Clause Number",
      dataIndex: "number",
      key: "number",
      render: (_: any, record: any) => record?.number,
    },
    {
      title: "Clause Title",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => record?.name,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (_: any, record: any) => (
        <>
          {!!record?.description ? (
            <textarea
              // minRows={1}
              rows={3}
              value={record?.description}
              style={{
                width: "100%",
                resize: "none", // Disable resizing to make it look cleaner
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                padding: "8px",
                fontSize: "14px",
              }}
              readOnly
            />
          ) : (
            "N/A"
          )}
        </>
      ),
    },
    {
      title: "System",
      dataIndex: "systemName",
      key: "systemName",
      render: (_: any, record: any) => record.systemName,
    },
    {
      title: "Units Applicable",
      dataIndex: "applicable_locations",
      key: "applicable_locations",
      render: (_: any, record: any) =>
        record.applicable_locations?.map((item: any, index: number) => (
          <span key={index}>
            {item.id}
            {index !== record.applicable_locations.length - 1 ? "," : ""}
          </span>
        )),
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      // console.log(
      //   "checkref check in clause tab onchange rows selection selected",
      //   selectedRows,
      //   selected
      // );
      const formattedSelectedRows = selectedRows.map((row: any) => ({
        ...row,
        type: "Clause",
        id: row._id,
        refId: row._id,
        name: row.name,
        comments: "Enter Comments Here...",
        link: "",
      }));
      let newSelected = [...selected];
      // console.log("checkref newSelected -->", newSelected);
      // console.log("checkref formattedSelectedRows -->", formattedSelectedRows);
      
      newSelected.push(...formattedSelectedRows);
      // console.log("check new selected", newSelected);
      // Add newly selected rows, checking for duplicates
      //   formattedSelectedRows.forEach((row: any) => {
      //     if (
      //       !newSelected.some(
      //         (selectedRow: any) =>
      //           selectedRow.id === row.id && selectedRow.type === "Clause"
      //       )
      //     ) {
      //       newSelected.push(row);
      //     }
      //   });
      //   console.log("check formatted selected", formattedSelectedRows);

      // Remove deselected rows
      //   newSelected = newSelected.filter((row: any) =>
      //     formattedSelectedRows.some(
      //       (selectedRow: any) => selectedRow.id === row.id
      //     )
      //   );
      console.log("setSelected", setSelected, newSelected);
      setSelected && setSelected(newSelected);
      // console.log(
      //   `selectedRowKeys: ${selectedRowKeys}`,
      //   "selectedRows: ",
      //   selectedRows
      // );
    },
    // getCheckboxProps: (record: any) => ({
    //   disabled: record.name === "Disabled User",
    //   // Column configuration not to be checked
    //   name: record.name,
    // }),
  };

  return (
    <>
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <>
          <div
            data-testid="clause-table"
            className={classes.clauseTableContainer}
          >
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              size="middle"
              rowKey={"id"}
              rowSelection={{ ...rowSelection }}
            />
             <div className={classes.pagination}>
              <Pagination
                size="small"
                current={page}
                pageSize={pageSize}
                total={count} // Use totalCount from moduleNames
                showTotal={showTotal}
                showSizeChanger
                onChange={handlePaginationChange}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ClausesTab;
