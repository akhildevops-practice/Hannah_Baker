import React, { useState, useEffect } from "react";
import { Table, Button, Drawer } from "antd";
import Select from "react-select";
import Papa from "papaparse";
import Testing22 from "./Testing22";

const DraggableCell = ({
  children,
  record,
  column,
  rowIndex,
  dataSource,
  setDataSource,
  ...restProps
}: any) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const newValue = e.dataTransfer.getData("text");
    if (newValue) {
      const newDataSource = [...dataSource];
      newDataSource[rowIndex][column.dataIndex] = newValue;
      setDataSource(newDataSource);
    }
  };

  return (
    <td
      {...restProps}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {children}
    </td>
  );
};

const TableTesting = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      onCell: (record: any, rowIndex: number) => ({
        record,
        column: { dataIndex: "name" },
        rowIndex,
        dataSource,
        setDataSource,
      }),
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      onCell: (record: any, rowIndex: number) => ({
        record,
        column: { dataIndex: "age" },
        rowIndex,
        dataSource,
        setDataSource,
      }),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      onCell: (record: any, rowIndex: number) => ({
        record,
        column: { dataIndex: "address" },
        rowIndex,
        dataSource,
        setDataSource,
      }),
    },
    {
      title: "Number",
      dataIndex: "number",
      key: "number",
      onCell: (record: any, rowIndex: number) => ({
        record,
        column: { dataIndex: "number" },
        rowIndex,
        dataSource,
        setDataSource,
      }),
    },
  ];

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      // Prevent default paste behavior
      event.preventDefault();

      // Get the pasted text
      const pastedData = event.clipboardData?.getData("Text");

      if (pastedData) {
        // Parse the pasted data using PapaParse
        Papa.parse(pastedData, {
          complete: (result) => {
            // Extract data and map to table rows
            const parsedData = result.data;
            const newRows = parsedData.map((row: any, index: any) => ({
              key: `${index}-${Date.now()}`, // Ensure unique keys
              name: row[0],
              age: row[1],
              address: row[2],
              number: row[3],
            }));

            // Append the new rows to the existing data source
            setDataSource((prevDataSource) => [...prevDataSource, ...newRows]);
          },
        });
      }
    };

    // Add event listener for paste
    document.addEventListener("paste", handlePaste);

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  const onDragStart = (e: React.DragEvent, value: string) => {
    e.dataTransfer.setData("text", value);
  };

  const draggableOptions = ["Jack", "Lucy", "Tom"];

  const options = [
    { value: "Jack", label: "Jack" },
    { value: "Lucy", label: "Lucy" },
    { value: "Tom", label: "Tom" },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px",
        }}
      >
        <div style={{ flex: 4 }}>
          <Table
            dataSource={dataSource}
            columns={columns.map((col: any) => ({
              ...col,
              onCell: (record: any, rowIndex: any) => ({
                record,
                column: col,
                rowIndex,
                dataSource,
                setDataSource,
              }),
            }))}
            components={{
              body: {
                cell: (props: any) => <DraggableCell {...props} />,
              },
            }}
          />
        </div>
        <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
          <Button type="primary" onClick={() => setOpen(true)}>
            Open Drawer
          </Button>
          <div style={{ marginTop: "40px" }}>
            {draggableOptions.map((option) => (
              <div
                key={option}
                draggable
                onDragStart={(e) => onDragStart(e, option)}
                style={{
                  padding: "8px",
                  margin: "4px 0",
                  border: "1px solid #ccc",
                  cursor: "move",
                }}
              >
                {option}
              </div>
            ))}
          </div>

          <div style={{ marginTop: "40px" }}>
            <Select
              options={options}
              components={{
                Option: (props: any) => (
                  <div
                    draggable
                    onDragStart={(e) => onDragStart(e, props.data.value)}
                    style={{ cursor: "move" }}
                  >
                    {props.data.label}
                  </div>
                ),
              }}
            />
          </div>
        </div>

        <Drawer title="Basic Drawer" onClose={() => setOpen(false)} open={open}>
          <div>
            {draggableOptions.map((option) => (
              <div
                key={option}
                draggable
                onDragStart={(e) => onDragStart(e, option)}
                style={{
                  padding: "8px",
                  margin: "4px 0",
                  border: "1px solid #ccc",
                  cursor: "move",
                }}
              >
                {option}
              </div>
            ))}
          </div>
        </Drawer>
      </div>
      <Testing22 />
    </div>
  );
};

export default TableTesting;
