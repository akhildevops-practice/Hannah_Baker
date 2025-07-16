import { Button, Tabs } from "antd";
import type { TabsProps } from "antd";

import { useNavigate } from "react-router-dom";
import styles from "./styles";
import Settings from "../Settings";
import RCA from "../RCA";
import DefectSettings from "../DefectSettings";

const SettingsMainPage = () => {
  const classes = styles();
  const navigate = useNavigate();

  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Origin",
      children: <Settings />,
    },
    {
      key: "2",
      label: "RCA",
      children: <RCA />,
    },
    {
      key: "3",
      label: "Defect Types",
      children: <DefectSettings />,
    },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div className={classes.tabContainer} style={{ width: "100%" }}>
        <Tabs
          defaultActiveKey="1"
          items={items}
          onChange={onChange}
          className={classes.tabsWrapper}
        />
      </div>
      <Button
        onClick={() => {
          navigate("/cara");
        }}
        style={{
          backgroundColor: "#0E497A",
          color: "#ffffff",
          position: "relative",
          top: 20,
          right: 30,
        }}
      >
        Back
      </Button>
    </div>
  );
};

export default SettingsMainPage;
