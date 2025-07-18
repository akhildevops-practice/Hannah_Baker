import { Button, Col, DatePicker, Form, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import { ReloadOutlined } from "@ant-design/icons";
import axios from "apis/axios.global";

type props = {
  setFormData?: any;
  setSelectedUnits?: any;
  selectedUnits?: any;
  setSelectedBusinessType?: any;
  selectedBusinessType?: any;
  setSelectedBusiness?: any;
  selectedBusiness?: any;
  setSelectedFunction?: any;
  selectedFunction?: any;
  getCipChartData?: any;
};

const CipDashboardFilter = ({
  setFormData,
  setSelectedUnits,
  selectedUnits,
  setSelectedBusinessType,
  selectedBusinessType,
  setSelectedBusiness,
  selectedBusiness,
  setSelectedFunction,
  selectedFunction,
  getCipChartData,
}: props) => {
  const [form] = Form.useForm();
  const classes = styles();
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);

  useEffect(() => {
    getFunctions();
    getBusiness();
    getStream();
  }, []);

  const handleChangeBusinessType = (value: any) => {
    setSelectedBusinessType(value);
  };

  const [stream, setStream] = useState([]);
  const getStream = async () => {
    const response = await axios.get("/api/audits/getAllBusinessType");

    setStream(response?.data);
  };

  const handleChangeBusiness = (value: any) => {
    setSelectedBusiness(value); // Store selected business IDs
  };

  const [business, setBusiness] = useState([]);
  const getBusiness = async () => {
    const response = await axios.get("/api/audits/getAllBusiness");

    setBusiness(response?.data);
  };

  const handleChangeFunction = (value: any) => {
    setSelectedFunction(value);
  };
  const [functions, setFunctions] = useState([]);
  const getFunctions = async () => {
    const response = await axios.get("/api/audits/getAllFunction");

    setFunctions(response?.data);
  };

  const handleChangeunits = (value: any) => {
    setSelectedUnits(value);
  };
  const handleUnitClick = () => {
    getUnits();
  };
  const [units, setUnits] = useState([]);
  const getUnits = async () => {
    const response = await axios.get(
      `/api/audits/getAllLocationForSeletedFunction?functionData[]=${selectedFunction.join(
        "&selectedFunction[]="
      )}&business[]=${selectedBusiness.join(
        "&business[]="
      )}&businessType[]=${selectedBusinessType.join(
        "&selectedBusinessType[]="
      )}`
    );

    setUnits(response?.data);
  };
  const sortedUnits = units
    .slice()
    .sort((a: any, b: any) => a.locationName.localeCompare(b.locationName));

  const handleFormReset = () => {
    form.resetFields();
    setFormData({});
  };

  const handleApplyFilter = () => {
    getCipChartData();
  };
  return (
    <div
      style={{
        backgroundColor: "#F8F9F9",
        border: "1px solid #89d5cd",
        padding: "10px",
        borderRadius: "10px",
        margin: "20px 0px 20px 0px",
      }}
    >
      <Form
        form={form}
        name="auditDFilters"
        onValuesChange={(changedValues, allValues) => {
          setFormData((prevFormData: any) => ({
            ...prevFormData,
            ...changedValues,
          }));
        }}
        layout="vertical"
        //   onFinish={onFinish}
      >
        <Row
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "-15px",
          }}
        >
          <Col span={11}>
            <Form.Item name="stream" label="Business Type">
              <Select
                mode="multiple"
                allowClear
                placeholder="Business Type"
                className={classes.container}
                showSearch
                optionFilterProp="children"
                filterOption={(input: any, option: any) => {
                  return (option?.children ?? "")
                    .toLowerCase()
                    .includes(input?.toLowerCase());
                }}
                defaultValue={["All"]}
                onChange={handleChangeBusinessType}
              >
                {stream.length > 0 &&
                !stream.some(
                  (item: any) => item?.stream?.toLowerCase() === "all"
                ) ? (
                  <Select.Option key="all" value="all">
                    All
                  </Select.Option>
                ) : null}

                {stream.map((item: any) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item name="business" label="Business">
              <Select
                mode="multiple"
                allowClear
                placeholder="Business"
                onChange={handleChangeBusiness}
                className={classes.container}
                value={selectedBusiness}
                defaultValue={["All"]}
                showSearch
                optionFilterProp="children"
                filterOption={(input: any, option: any) => {
                  return (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
              >
                {business.length > 0 &&
                !business.some(
                  (item: any) => item?.business?.toLowerCase() === "all"
                ) ? (
                  <Select.Option key="all" value="All">
                    All
                  </Select.Option>
                ) : null}
                {business.map((item: any) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "-15px",
          }}
        >
          <Col span={11}>
            <Form.Item name="function" label="Functions">
              <Select
                mode="multiple"
                allowClear
                placeholder="Functions"
                onChange={handleChangeFunction}
                defaultValue={["All"]}
                className={classes.container}
                showSearch
                optionFilterProp="children"
                filterOption={(input: any, option: any) => {
                  return (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
              >
                {functions.length > 0 &&
                !functions.some(
                  (item: any) => item?.functions?.toLowerCase() === "all"
                ) ? (
                  <Select.Option key="all" value="all">
                    All
                  </Select.Option>
                ) : null}
                {functions?.map((item: any) => (
                  <Select.Option key={item?.id} value={item?.id}>
                    {item?.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={11}>
            <Form.Item name="Unit" label="Unit">
              <Select
                mode="multiple"
                allowClear
                placeholder="Unit"
                // defaultValue={[userLocation?.locationName]}
                // defaultValue={["shivamogga"]}
                onChange={handleChangeunits}
                className={classes.container}
                value={selectedUnits}
                onClick={handleUnitClick}
                showSearch
                optionFilterProp="children"
                filterOption={(input: any, option: any) => {
                  return (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase());
                }}
              >
                {/* {units.some(
          (item: any) => item.locationName === item.userLocation.locationName
        ) && (
          <Select.Option key={userLocation.id} value={userLocation.id}>
            {userLocation.locationName}
          </Select.Option>
        )} */}
                {sortedUnits.map((item: any) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.locationName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "-15px",
          }}
        >
          <Col span={11}>
            <Form.Item label=" ">
              <Button
                type="primary"
                onClick={handleApplyFilter}
                htmlType="submit"
              >
                Apply
              </Button>
              <Button type="link" onClick={handleFormReset}>
                <ReloadOutlined />
              </Button>
            </Form.Item>
          </Col>
          <Col span={11}></Col>
        </Row>
      </Form>
    </div>
  );
};

export default CipDashboardFilter;
