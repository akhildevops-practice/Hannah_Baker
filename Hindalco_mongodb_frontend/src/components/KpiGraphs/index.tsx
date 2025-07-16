import React, { useEffect, useRef, useState } from "react";
import { format, parse } from "date-fns";
import ArrowRightAltIcon from "@material-ui/icons/ArrowRightAlt";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale, // x-axis
  LinearScale, // y-axis
  PointElement,
  Legend,
  Tooltip as ChartTooltip,
} from "chart.js";
import { Alignment, ChartType, Position } from "../../utils/enums";
import {
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
  useMediaQuery,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import { useStyles } from "./styles";
import { Autocomplete } from "@material-ui/lab";
import ReportGraphComponent from "../ReportGraphComponent";
import KpiGraphsTable from "../KpiGraphsTable";
import ReloadIcon from "../../assets/icons/Reload.svg";
import Highcharts from "highcharts";
import HighchartsMore from "highcharts/highcharts-more";
import HighchartsReact from "highcharts-react-official";
import SolidGauge from "highcharts/modules/solid-gauge";
import axios from "../../apis/axios.global";
import { useRecoilState } from "recoil";
import { kpiChart, mobileView } from "../../recoil/atom";
import ArrowUpwardOutlinedIcon from "@material-ui/icons/ArrowUpwardOutlined";
import ImportExportOutlinedIcon from "@material-ui/icons/ImportExportOutlined";
import ArrowDownwardOutlinedIcon from "@material-ui/icons/ArrowDownwardOutlined";
import getAppUrl from "utils/getAppUrl";
import SettingsEthernetIcon from "@material-ui/icons/SettingsEthernet";
import { useLocation } from "react-router-dom";
import { ArrowsAltOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import CloseIconImageSvg from "assets/documentControl/Close.svg";
import { CloseCircleOutlined } from "@ant-design/icons";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SwipeableViews from "react-swipeable-views";
import SummaryChartKPI from "./SummaryChartKPI";
import { ReactComponent as FilterIcon } from "../../assets/documentControl/Filter.svg";

HighchartsMore(Highcharts);
SolidGauge(Highcharts);

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  ChartTooltip
);

function KpiGraphs() {
  const [kpiReportData, setKpiReportData] = useRecoilState(kpiChart);
  const [frequencyType, setFrequencyType] = useState();

  const [dayData, setDayData] = useState<any[]>([]);
  const [yearData, setYearData] = useState<any[]>([]);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [quarterData, setQuarterData] = useState<any[]>([]);
  const [location, setLocation] = useState<any[]>([]);
  const [businessUnit, setBusinessUnit] = useState<any[]>([]);
  const [entity, setEntity] = useState<any[]>([]);
  const [kpiId, setKpiId] = useState<string>();

  const [kpiNameList, setKpiNameList] = useState<any[]>([]);
  const [targetValue, setTargetValue] = useState<any>();
  const [avgTargetValue, setAvgTargetValue] = useState<any>();
  const [opValue, setOpValue] = useState<any>();
  const [actualValue, setActualValue] = useState<any>();
  const [percentageValue, setPercentageValue] = useState<any>();
  const [clicked, setClicked] = useState<boolean>(false);
  const [TableData, setTableData] = useState<any[]>(dayData);
  const locationstate = useLocation();
  const [isNewRowAdding, setIsNewRowAdding] = useState(false);
  const [newRowData, setNewRowData] = useState<any>({});
  const userDetail = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
  const startDate = getStartDate(userDetail.organization.fiscalYearQuarters);
  const [locationId, setLocationId] = useState<string>(userDetail.locationId);
  const [currentTab, setCurrentTab] = useState("Summary");

  const matches = useMediaQuery("(min-width:820px)");
  const smallScreen = useMediaQuery("(min-width:450px)");

  // console.log("startdate", locationId);

  function getStartDate(fiscalYearQuarters: any) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    if (fiscalYearQuarters === "April - Mar") {
      let startYear = currentYear;
      if (currentMonth < 3) {
        startYear = currentYear - 1;
      }

      return new Date(startYear, 3, 1);
    } else {
      return new Date(currentYear, 0, 1);
    }
  }

  useEffect(() => {
    setFrequencyType(kpiReportData.frequency);
  }, [kpiReportData]);

  // useEffect(() => {
  //   console.log("location state value", locationstate.state);
  //   if (
  //     !!locationstate.state.locationId &&
  //     !!locationstate.state.entityId &&
  //     !!locationstate.state.kpiId
  //   ) {
  //     setKpiId(locationstate.state.kpiId);
  //     setLocationId(locationstate.state.locationId);

  //     // setEntity(locationstate.state.entityId);
  //   }

  //   const oldday = new Date("2023-04-01");

  //   // kpiReportData.minDate = convertDate2(oldday);
  //   const today = new Date();
  //   //  kpiReportData.maxDate = convertDate2(today);
  //   if (!!locationId && !!kpiId)
  //     setKpiReportData((prev: any) => ({
  //       ...prev,
  //       location: locationstate.state.locationId,
  //       entity: locationstate.state.entity,
  //       kpiId: locationstate.state.kpi,
  //     }));
  // }, [locationstate]);
  // console.log("kpiid", kpiId);
  // console.log("locationid", locationId);

  const getTableDataProp = (propName: string) => {
    return TableData?.map((ele) => {
      if (ele.hasOwnProperty(propName)) {
        return ele[propName];
      }
      return null;
    });
  };

  interface Data {
    [key: string]: any;
  }

  const findObjectlabel = (
    data: Data[],
    value: string | number | any[],
    location: string
  ) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i][location] === value) {
        return data[i];
      } else if (Array.isArray(value)) {
        for (let j = 0; j < value.length; j++) {
          const labelresult = findObject(data, value[j], location);
          if (labelresult) {
            return labelresult;
          }
        }
      }
    }
    return null;
  };

  const allLabels = getTableDataProp("month");
  const allQuarters = getTableDataProp("qtrmonth");
  const allYear = getTableDataProp("year");
  const allDays = getTableDataProp("days");
  const allTarget = getTableDataProp("target");
  const allValues = getTableDataProp("value");
  const allPercentage = getTableDataProp("percentage");
  const [labelData, setLabelData] = useState<any[]>(allDays);
  const realmName = getAppUrl();
  const [fiscalMonth, setFiscalMonth] = useState<any>();
  const classes = useStyles(matches)();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  function getMonthName(month: number): string {
    return monthNames[month];
  }

  const quarterNames1 = ["Jan-Mar", "Apr-Jun", "Jul-Sep", "Oct-Dec"];
  const quarterNames2 = ["Apr-Jun", "Jul-Sep", "Oct-Dec", "Jan-Mar"];

  function getQuarterName(quarter: number): any {
    if (fiscalMonth === "Jan - Dec") {
      return quarterNames1[quarter - 1];
    } else {
      return quarterNames2[quarter - 1];
    }
  }
  // console.log("kpireportdata", kpiReportData);
  interface FooterProps {
    table: any;
    column: any;
  }
  const [averageValue, setAverageValue] = useState<string | number>("0");
  const [sumStringValue, setSumStringValue] = useState<string | number>("");

  // function calculateFooter(props: FooterProps, accessorKey: string) {
  //   const initialValue = 0;
  //   const sumWithInitial = props.table
  //     .getRowModel()
  //     .rows.reduce((previousValue: number, currentValue: any) => {
  //       return previousValue + currentValue.original[accessorKey];
  //     }, initialValue);

  //   const sumAsNumber = Number(sumWithInitial);
  //   const isInteger = Number.isInteger(sumAsNumber);
  //   const sumString = isInteger ? String(sumAsNumber) : sumAsNumber.toFixed(2);

  //   if (accessorKey === "target") {
  //     setTargetValue(sumAsNumber);
  //   }
  //   if (accessorKey === "value") {
  //     setActualValue(sumAsNumber);
  //   }
  //   if (accessorKey === "averageValue") {
  //     const count = props.table.getRowModel().rows.length;
  //     const avg = count > 1 ? actualValue / count : sumAsNumber;
  //     if (Number.isInteger(avg)) {
  //       return avg.toString();
  //     } else {
  //       return avg.toFixed(2);
  //     }
  //   }
  //   return sumString;
  // }
  const [variance, setVariance] = useState("0");
  function calculateFooter(props: FooterProps, accessorKey: string) {
    const initialValue = 0;

    // Calculate sum
    const sumWithInitial = props.table
      .getRowModel()
      .rows.reduce((previousValue: number, currentValue: any) => {
        const value = Number(currentValue.original[accessorKey]);
        // Check if value is a valid number
        if (isNaN(value)) {
          // console.error(
          //   `Invalid number for ${accessorKey}:`,
          //   currentValue.original[accessorKey]
          // );
          return previousValue; // Skip invalid values
        }
        return previousValue + value;
      }, initialValue);
    // console.log("propss", props);
    const sumAsNumber = parseFloat(Number(sumWithInitial).toFixed(2));
    // Check if sumAsNumber is a valid number
    if (isNaN(sumAsNumber)) {
      console.error(`Sum is NaN for ${accessorKey}`);
      return ""; // Return a fallback value
    }

    const isInteger = Number.isInteger(sumAsNumber);
    const sumString = isInteger ? String(sumAsNumber) : sumAsNumber.toFixed(2);

    // Handle specific accessorKey cases
    if (accessorKey === "target") {
      setTargetValue(sumAsNumber);
      const count = props.table.getRowModel().rows.length;
      if (count === 0) {
        console.error(`Row count is zero for ${accessorKey}`);
        return ""; // Return a fallback value
      }
      const avg = count > 1 ? sumAsNumber / count : sumAsNumber;
      const avgValue = Number.isInteger(avg) ? avg.toString() : avg.toFixed(2);
      setAvgTargetValue(avgValue);
      if (Number.isNaN(avg)) {
        console.error(`Average is NaN for ${accessorKey}`);
        return ""; // Return a fallback value
      }
    } else if (accessorKey === "value") {
      setActualValue(sumAsNumber);
    } else if (accessorKey === "averageValue") {
      const count = props.table.getRowModel().rows.length;
      if (count === 0) {
        console.error(`Row count is zero for ${accessorKey}`);
        return ""; // Return a fallback value
      }
      const avg = count > 1 ? actualValue / count : sumAsNumber;
      const avgValue = Number.isInteger(avg) ? avg.toString() : avg.toFixed(2);
      setAverageValue(avgValue);
      if (Number.isNaN(avg)) {
        console.error(`Average is NaN for ${accessorKey}`);
        return ""; // Return a fallback value
      }
      return Number.isInteger(avg) ? avg.toString() : avg.toFixed(2);
    } else if (accessorKey === "variance") {
      // Assuming variance should be calculated in a specific way
      const count = props.table.getRowModel().rows.length;
      if (count === 0) {
        console.error(`Row count is zero for ${accessorKey}`);
        return ""; // Return a fallback value
      }

      const mean = sumAsNumber / count;
      const varianceSum = props.table
        .getRowModel()
        .rows.reduce((acc: any, currentValue: any) => {
          const value = Number(currentValue.original[accessorKey]);
          if (isNaN(value)) {
            console.error(
              `Invalid number for variance calculation:`,
              currentValue.original[accessorKey]
            );
            return acc; // Skip invalid values
          }
          return acc + Math.pow(value - mean, 2);
        }, 0);

      // const variance = sumAsNumber / count;
      const variance = targetValue - actualValue;
      if (Number.isNaN(variance)) {
        console.error(`Calculated variance is NaN for ${accessorKey}`);
        return ""; // Return a fallback value
      }
      const varianceString = Number.isInteger(variance)
        ? variance.toString()
        : variance.toFixed(2);

      setVariance(varianceString);

      return Number.isInteger(variance)
        ? variance.toString()
        : variance.toFixed(2);
    }

    return sumString;
  }

  // console.log("targetValue", targetValue);

  const yearColumns = [
    {
      header: "Year",
      accessorKey: "year",
    },
    {
      header: "PnB (OP)",
      accessorKey: "operationalTarget",
      footer: (props: FooterProps) => calculateFooter(props, "target"),
    },
    {
      header: `Value(${kpiReportData.uom ? kpiReportData?.uom : ""})`,
      accessorKey: "value",
      footer: (props: FooterProps) => calculateFooter(props, "value"),
    },
    {
      header: "Variance",
      accessorKey: "variance",
      footer: (props: FooterProps) => {
        // calculateFooter(props, "variance")
        const variance: any =
          kpiReportData.targetType === "Increase" ||
          kpiReportData.targetType === "Maintain"
            ? -(targetValue - actualValue)
            : targetValue - actualValue;
        if (variance % 1 === 0) {
          setVariance(variance);
          return `${variance}`;
        } else {
          setPercentageValue(variance.toFixed(2));
          return `${variance.toFixed(2)}`;
        }
      },
    },
    {
      header: "Efficiency",
      accessorKey: "percentage",
      footer: () => {
        // const percentage = (actualValue / targetValue) * 100;
        // console.log("kpitarget type", kpiReportData.targetType);
        const percentage =
          kpiReportData.targetType === "Increase" ||
          kpiReportData.targetType === "Maintain" ||
          kpiReportData.targetType === "Range"
            ? (actualValue / targetValue) * 100
            : ((targetValue - actualValue) / targetValue) * 100;

        if (percentage % 1 === 0) {
          setPercentageValue(Number.isFinite(percentage) ? percentage : 0);
          return `${Number.isFinite(percentage) ? percentage : 0}%`;
        } else {
          setPercentageValue(
            Number.isFinite(percentage) ? percentage.toFixed(2) : 0
          );
          return `${Number.isFinite(percentage) ? percentage.toFixed(2) : 0}%`;
        }
      },
    },
    {
      header: "Avg Value",
      accessorKey: "averageValue",
      footer: (props: FooterProps) => calculateFooter(props, "averageValue"),
    },
  ];
  const monthColumns = [
    {
      header: "Year",
      accessorKey: "year",
    },
    {
      header: "Month",
      accessorKey: "month",
    },
    {
      header: "PnB (OP)",
      accessorKey: "operationalTarget",
      footer: (props: FooterProps) => calculateFooter(props, "target"),
    },
    {
      header: `Value(${kpiReportData.uom ? kpiReportData.uom : ""})`,
      accessorKey: "value",
      footer: (props: FooterProps) => calculateFooter(props, "value"),
    },
    {
      header: "Variance",
      accessorKey: "variance",
      footer: (props: FooterProps) => {
        // calculateFooter(props, "variance")
        const variance: any =
          kpiReportData.targetType === "Increase" ||
          kpiReportData.targetType === "Maintain"
            ? -(targetValue - actualValue)
            : targetValue - actualValue;
        if (variance % 1 === 0) {
          setVariance(variance);
          return `${variance}`;
        } else {
          setPercentageValue(variance.toFixed(2));
          return `${variance.toFixed(2)}`;
        }
      },
    },
    {
      header: "Efficiency",
      accessorKey: "percentage",
      footer: () => {
        const percentage =
          kpiReportData.targetType === "Increase" ||
          kpiReportData.targetType === "Maintain"
            ? (actualValue / targetValue) * 100
            : ((targetValue - actualValue) / targetValue) * 100;
        if (percentage % 1 === 0) {
          setPercentageValue(Number.isFinite(percentage) ? percentage : 0);
          return `${Number.isFinite(percentage) ? percentage : 0}%`;
        } else {
          setPercentageValue(
            Number.isFinite(percentage) ? percentage.toFixed(2) : 0
          );
          return `${Number.isFinite(percentage) ? percentage.toFixed(2) : 0}%`;
        }
      },
    },
    {
      header: "Avg Value",
      accessorKey: "averageValue",
      footer: (props: FooterProps) => calculateFooter(props, "averageValue"),
    },
    {
      header: "Remarks",
      accessorKey: "kpiComments",
    },
  ];
  const quaterColumns = [
    {
      header: "Year",
      accessorKey: "year",
    },
    {
      header: "Period",
      accessorKey: "qtrmonth",
    },
    {
      header: "PnB (OP)",
      accessorKey: "operationalTarget",
      footer: (props: FooterProps) => calculateFooter(props, "target"),
    },
    {
      header: `Value(${kpiReportData.uom ? kpiReportData.uom : ""})`,
      accessorKey: "value",
      footer: (props: FooterProps) => calculateFooter(props, "value"),
    },
    // {
    //   header: "Total",
    //   accessorKey: "total",
    //   footer: (props: FooterProps) => calculateFooter(props, "total"),
    // },

    {
      header: "Variance",
      accessorKey: "variance",
      footer: (props: FooterProps) => {
        // calculateFooter(props, "variance")
        const variance: any =
          kpiReportData.targetType === "Increase" ||
          kpiReportData.targetType === "Maintain"
            ? -(targetValue - actualValue)
            : targetValue - actualValue;
        if (variance % 1 === 0) {
          setVariance(variance);
          return `${variance}`;
        } else {
          setPercentageValue(variance.toFixed(2));
          return `${variance.toFixed(2)}`;
        }
      },
    },
    {
      header: "Efficiency",
      accessorKey: "percentage",
      footer: () => {
        const percentage =
          kpiReportData.targetType === "Increase" ||
          kpiReportData.targetType === "Maintain"
            ? (actualValue / targetValue) * 100
            : ((targetValue - actualValue) / targetValue) * 100;
        if (percentage % 1 === 0) {
          setPercentageValue(Number.isFinite(percentage) ? percentage : 0);
          return `${Number.isFinite(percentage) ? percentage : 0}%`;
        } else {
          setPercentageValue(
            Number.isFinite(percentage) ? percentage.toFixed(2) : 0
          );
          return `${Number.isFinite(percentage) ? percentage.toFixed(2) : 0}%`;
        }
      },
    },
    {
      header: "Avg Value",
      accessorKey: "averageValue",
      footer: (props: FooterProps) => calculateFooter(props, "averageValue"),
    },
  ];
  const dayscolumns = [
    {
      header: "Day",
      accessorKey: "days",
    },
    {
      header: "PnB (OP)",
      accessorKey: "operationalTarget",
      footer: (props: FooterProps) => calculateFooter(props, "target"),
    },
    {
      header: `Value(${kpiReportData.uom ? kpiReportData.uom : ""})`,
      accessorKey: "value",
      footer: (props: FooterProps) => calculateFooter(props, "value"),
    },
    {
      header: "Variance",
      accessorKey: "variance",
      footer: (props: FooterProps) => {
        // calculateFooter(props, "variance")
        const variance: any =
          kpiReportData.targetType === "Increase" ||
          kpiReportData.targetType === "Maintain"
            ? -(targetValue - actualValue)
            : targetValue - actualValue;
        if (variance % 1 === 0) {
          setVariance(variance);
          return `${variance}`;
        } else {
          setPercentageValue(variance.toFixed(2));
          return `${variance.toFixed(2)}`;
        }
      },
    },
    {
      header: "Efficiency",
      accessorKey: "percentage",
      footer: () => {
        const percentage =
          kpiReportData.targetType === "Increase" ||
          kpiReportData.targetType === "Maintain"
            ? (actualValue / targetValue) * 100
            : ((targetValue - actualValue) / targetValue) * 100;
        if (percentage % 1 === 0) {
          setPercentageValue(Number.isFinite(percentage) ? percentage : 0);
          return `${Number.isFinite(percentage) ? percentage : 0}%`;
        } else {
          setPercentageValue(
            Number.isFinite(percentage) ? percentage.toFixed(2) : 0
          );
          return `${Number.isFinite(percentage) ? percentage.toFixed(2) : 0}%`;
        }
      },
    },
    {
      header: "Avg Value",
      // accessorKey: "averageValue",
      footer: (props: FooterProps) => calculateFooter(props, "averageValue"),
    },
    {
      header: "Remarks",
      accessorKey: "kpiComments",
    },
  ];

  const QuarterTabledata = [
    {
      year: "2023",
      qtrmonth: "Jan-Mar",
      value: 8,
      total: 8,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2023",
      qtrmonth: "Apr-Jun",
      value: 6,
      total: 9,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2023",
      qtrmonth: "Jul-Sep",
      value: 9,
      total: 3,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2023",
      qtrmonth: "Oct-Dec",
      value: 10,
      total: 1,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2024",
      qtrmonth: "Jan-Mar",
      value: 5,
      total: 6,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2024",
      qtrmonth: "Apr-Jun",
      value: 6,
      total: 5,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2024",
      qtrmonth: "Jul-Sep",
      value: 9,
      total: 3,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2024",
      qtrmonth: "Oct-Dec",
      value: 14,
      total: 9,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2025",
      qtrmonth: "Jan-Mar",
      value: 11,
      total: 4,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2025",
      qtrmonth: "Apr-Jun",
      value: 4,
      total: 2,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2025",
      qtrmonth: "July-Aug",
      value: 3,
      total: 7,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
    {
      year: "2025",
      qtrmonth: "Sep-Dec",
      value: 7,
      total: 4,
      target: 10,
      averageValue: 70,
      score: 70,
      weightedScore: 100,
      variance: 20,
    },
  ];

  const speedometeroptions: Highcharts.Options = {
    chart: {
      type: "gauge",
      plotBorderWidth: 0,
      plotShadow: false,
      height: "70%",
    },
    title: {
      text: "Target vs Actual Cumulative",
      align: "center",
      verticalAlign: "top",
      style: {
        // fontFamily: "-apple-system",
        fontSize: "13px",
        fontWeight: "600",
        color: "#666666",
      },
      y: 0,
    },
    pane: {
      startAngle: -100,
      endAngle: 100,
      center: ["50%", "70%"],
      size: "110%",
    },
    yAxis: {
      min: 0,
      max: targetValue >= 100 ? targetValue : 100,
      tickPixelInterval: Math.ceil(
        (targetValue >= 100 ? targetValue : 100) / 3
      ),
      tickPosition: "inside",
      tickLength: 20,
      tickWidth: 2,
      minorTickInterval: null,
      labels: {
        distance: 20,
        style: {
          fontSize: "12px",
        },
      },
      plotBands: [
        {
          from: 0,
          to: 65,
          color: "#C73659", // red
          thickness: 30,
        },
        {
          from: 65,
          to: 130,
          color: "#DC5F00", // yellow
          thickness: 20,
        },
        {
          from: 130,
          to: targetValue >= 100 ? targetValue : 100,
          color: "#21618C", // green
          thickness: 20,
        },
      ],
    },
    series: [
      {
        type: "gauge",
        name: "Actual Value",
        data: [actualValue],
        tooltip: {
          // valueSuffix: " %",
        },
        dataLabels: {
          format: actualValue ? `${[percentageValue]} %` : "0",
          borderWidth: 0,
          color:
            (Highcharts.defaultOptions.title &&
              Highcharts.defaultOptions.title.style &&
              Highcharts.defaultOptions.title.style.color) ||
            "#333333",
          style: {
            fontSize: "16px",
          },
        },
        dial: {
          radius: "80%",
          backgroundColor: "gray",
          baseWidth: 12,
          baseLength: "0%",
          rearLength: "0%",
        },
        pivot: {
          backgroundColor: "gray",
          radius: 6,
          borderWidth: 2,
        },
      },
    ],
    credits: {
      enabled: false,
    },
  };

  const chartRef = useRef(null);

  const convertDate = (date: Date) => {
    const dd = String(date?.getDate()).padStart(2, "0");
    const mm = String(date?.getMonth() + 1).padStart(2, "0");
    const yyyy = date?.getFullYear();

    return yyyy + "-" + mm + "-" + dd;
  };

  function convertDate2(date: Date | null): string {
    if (date === null) {
      return "";
    }
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  const convertDatetoSystem = (newRowData: any) => {
    if (kpiReportData.displayBy === "Month") {
      const { Month, Year } = newRowData;

      const systemDate = new Date(`${Year}-${Month}-01T00:00:00`);

      const formattedDate = format(systemDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

      return formattedDate;
    } else if (kpiReportData.displayBy === "Quarter") {
      const quarterString = newRowData.Month;

      const startingMonth = quarterString.split("-")[0];

      // Determine the month index (0-based) for the starting month
      const monthIndex = getMonthIndex(startingMonth);

      // Assuming the year is available in newRowData as well
      const { Year } = newRowData;

      const systemDate = new Date(`${Year}-${monthIndex + 1}-01T00:00:00`);

      const formattedDate = format(systemDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

      return formattedDate;
    } else {
      const parsedDate = parse(newRowData.Day, "MMMM-dd", new Date());

      // Format the parsed date to the desired format
      const formattedDate = format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

      return formattedDate;
    }
  };
  const getMonthIndex = (monthName: string) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months.findIndex(
      (month) => month.toLowerCase() === monthName.toLowerCase()
    );
  };
  const getDayWiseData = async () => {
    const minDateValue = kpiReportData.minDate
      ? convertDate2(kpiReportData.minDate)
      : "";
    const maxDateValue = kpiReportData.maxDate
      ? convertDate2(kpiReportData.maxDate)
      : "";
    const location = kpiReportData.location
      ? kpiReportData?.location
      : userDetail.locationId;
    const entity = kpiReportData.entity
      ? kpiReportData?.entity
      : userDetail.entityId;
    if ((!!locationId || location) && !!kpiId) {
      await axios(
        `/api/kpi-report/computationForKpi/${kpiId}/${location}/${entity}/${maxDateValue}/${minDateValue}`
      )
        .then((res) => {
          setDayData(
            res.data?.allkpidata?.map((obj: any) => {
              const operationalTarget = obj.operationalTarget;
              const target = obj.target;
              const formattedOperationalTarget = `${target} (${operationalTarget})`;

              return {
                days: new Date(obj.reportFor)
                  .toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                  })
                  .split(" ")
                  .join("-"),
                value: obj.kpiValue ? parseFloat(obj.kpiValue.toFixed(2)) : 0,
                target: target,
                operationalTarget: formattedOperationalTarget,
                averageValue: obj.kpiValue
                  ? parseFloat(obj.kpiValue.toFixed(2))
                  : "",
                score: obj.kpiScore,
                weightedScore: obj.kpiWeightage,
                variance: obj.kpiVariance
                  ? parseFloat(obj.kpiVariance.toFixed(2))
                  : 0,
                percentage: obj.percentage
                  ? parseFloat(obj.percentage.toFixed(2))
                  : 0,
                kpiComments: obj.kpiComments,
              };
            })
          );
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const getYearWiseData = async () => {
    const minDateValue = kpiReportData.minDate
      ? convertDate2(kpiReportData.minDate)
      : "";
    const maxDateValue = kpiReportData.maxDate
      ? convertDate2(kpiReportData.maxDate)
      : "";
    const location = kpiReportData.location
      ? kpiReportData?.location
      : userDetail.locationId;
    const entity = kpiReportData.location
      ? kpiReportData?.entity
      : userDetail.entityId;
    await axios(
      `/api/kpi-report/calculationFromSummary/${kpiId}/${location}?entity=${entity}&startDate=${minDateValue}&endDate=${maxDateValue}`
    )
      .then((res) => {
        setYearData(
          res.data.sum.map((obj: any) => {
            const operationalTarget = obj.totalOperationalTarget;
            const target =
              kpiReportData?.displayType === "SUM"
                ? obj.totalTarget
                : obj.avgTarget;
            const minTarget: any =
              kpiReportData?.displayType === "SUM"
                ? obj.totalMinimumTarget
                : obj.avgMinimumTarget;
            const formattedOperationalTarget =
              kpiReportData?.targetType === "Range"
                ? `${minTarget}-${target}` +
                  (operationalTarget != null ? ` (${operationalTarget})` : "")
                : `${target}` +
                  (operationalTarget != null ? ` (${operationalTarget})` : "");
            return {
              year: obj.kpiYear,
              value: obj.totalMonthlySum
                ? parseFloat(obj.totalMonthlySum?.toFixed(2))
                : "",
              target: obj.totalTarget
                ? parseFloat(obj.totalTarget?.toFixed(2))
                : "",
              operationalTarget: formattedOperationalTarget,
              averageValue: obj.averageMonthlyAverage
                ? parseFloat(obj.averageMonthlyAverage.toFixed(2))
                : "",
              score: obj.averageMonthlyScore,
              weightedScore: obj.totalMonthlyWeightedScore,
              variance: obj.totalMonthlyVariance
                ? parseFloat(obj.totalMonthlyVariance.toFixed(2))
                : "",
              percentage: (() => {
                //100 - (Math.abs(targetValue - actualValue) / targetValue) * 100;
                const percentage =
                  kpiReportData.targetType === "Increase" ||
                  kpiReportData.targetType === "Maintain"
                    ? (obj.totalMonthlySum / obj.totalTarget) * 100
                    : 100 -
                      (Math.abs(obj.totalTarget - obj.totalMonthlySum) /
                        obj.totalTarget) *
                        100;
                if (percentage % 1 === 0) {
                  return Number.isFinite(percentage) ? percentage : 0;
                } else {
                  return Number.isFinite(percentage)
                    ? percentage.toFixed(2)
                    : 0;
                }
              })(),
            };
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getMonthWiseData = async () => {
    const minDateValue = kpiReportData.minDate
      ? convertDate2(kpiReportData.minDate)
      : "";
    const maxDateValue = kpiReportData.maxDate
      ? convertDate2(kpiReportData.maxDate)
      : "";
    const location = kpiReportData.location
      ? kpiReportData?.location
      : userDetail.locationId;
    const entity = kpiReportData.location
      ? kpiReportData?.entity
      : userDetail.entityId;
    // console.log("kpireportData", kpiReportData);
    await axios(
      `/api/kpi-report/calculationFromSummary/${kpiId}/${location}?entity=${entity}&startDate=${minDateValue}&endDate=${maxDateValue}`
      // `/api/kpi-report/calculationFromSummary/28ac1f0b-7590-408a-8568-ec0da75e7222?startDate=${minDateValue}&endDate=${maxDateValue}`
    )
      .then((res) => {
        setMonthData(
          res.data.monthwiseresult?.map((obj: any) => {
            const operationalTarget = obj.monthlyOperationalTarget;
            const target = obj.monthlyTarget;
            const minTarget = obj.monthlyMinimumTarget;

            const formattedOperationalTarget =
              kpiReportData?.targetType === "Range"
                ? `${minTarget}-${target}` +
                  (operationalTarget != null ? ` (${operationalTarget})` : "")
                : `${target}` +
                  (operationalTarget != null ? ` (${operationalTarget})` : "");
            return {
              year: obj.kpiYear,
              month: getMonthName(obj.kpiMonthYear),
              value: obj.monthlySum,
              target: obj.monthlyTarget,
              operationalTarget: formattedOperationalTarget,
              averageValue: obj.monthlyAverage
                ? parseFloat(obj.monthlyAverage.toFixed(2))
                : 0,
              score: obj.monthlyScore,
              weightedScore: obj.monthlyWeightedScore,
              variance: obj.monthlyVariance?.toFixed(2),
              percentage: obj.percentage
                ? parseFloat(obj.percentage?.toFixed(2))
                : 0,
              kpiComments: obj?.kpiComments,
            };
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getQuarterWiseData = async () => {
    const minDateValue = kpiReportData?.minDate
      ? convertDate2(kpiReportData?.minDate)
      : "";
    const maxDateValue = kpiReportData.maxDate
      ? convertDate2(kpiReportData.maxDate)
      : "";
    const location = kpiReportData.location
      ? kpiReportData?.location
      : userDetail.locationId;
    const entity = kpiReportData.location
      ? kpiReportData?.entity
      : userDetail.entityId;
    await axios(
      `/api/kpi-report/calculationFromSummary/${kpiId}/${location}?entity=${entity}&startDate=${minDateValue}&endDate=${maxDateValue}`
      // `/api/kpi-report/calculationFromSummary/28ac1f0b-7590-408a-8568-ec0da75e7222?startDate=${minDateValue}&endDate=${maxDateValue}`
    )
      .then((res) => {
        // console.log("responseMonth", res?.data?.quarter[0]?.kpiPeriod);
        setQuarterData(
          res.data?.quarter?.map((obj: any) => {
            const operationalTarget: any = obj.totalQuarterOperationalTarget;
            const target: any =
              kpiReportData?.displayType === "SUM"
                ? obj.totalQuarterTarget
                : obj.avgTarget;
            const minTarget: any =
              kpiReportData?.displayType === "SUM"
                ? obj.totalMinimumTarget
                : obj.avgMinimumTarget;
            const formattedOperationalTarget =
              kpiReportData?.targetType === "Range"
                ? `${minTarget}-${target}` +
                  (operationalTarget != null ? ` (${operationalTarget})` : "")
                : `${target}` +
                  (operationalTarget != null ? ` (${operationalTarget})` : "");

            return {
              year: obj.kpiYear,
              qtrmonth: getQuarterName(obj.kpiPeriod),
              value: obj.totalQuarterSum
                ? parseFloat(obj.totalQuarterSum?.toFixed(2))
                : "",
              total: obj.totalQuarterSum
                ? parseFloat(obj.totalQuarterSum?.toFixed(2))
                : 0,
              target: obj.totalQuarterTarget
                ? parseFloat(obj.totalQuarterTarget?.toFixed(2))
                : 0,
              operationalTarget: formattedOperationalTarget,
              averageValue: obj.averageQuarterAverage
                ? parseFloat(obj.averageQuarterAverage?.toFixed(2))
                : 0,
              variance: obj.totalQuarterVariance
                ? parseFloat(obj.totalQuarterVariance?.toFixed(2))
                : 0,
              percentage: (() => {
                const percentage =
                  kpiReportData.targetType === "Increase" ||
                  kpiReportData.targetType === "Maintain"
                    ? (obj.totalQuarterSum / obj.totalQuarterTarget) * 100
                    : 100 -
                      (Math.abs(obj.totalQuarterTarget - obj.totalQuarterSum) /
                        obj.totalQuarterTarget) *
                        100;
                if (percentage % 1 === 0) {
                  return Number.isFinite(percentage) ? percentage : 0;
                } else {
                  return Number.isFinite(percentage)
                    ? percentage.toFixed(2)
                    : 0;
                }
              })(),
            };
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // console.log("quarterdata", quarterData);
  const getLocationEntityBU = async () => {
    if (userDetail?.userType === "globalRoles") {
      // console.log("userDetail.additionalUnits", userDetail.additionalUnits);
      if (
        userDetail?.additionalUnits?.some(
          (unit: any) => unit.id === "All" || unit.locationName === "All"
        )
      ) {
        const res = await axios.get(`api/location/getAllLocationList`);
        if (res?.data) {
          setLocation(
            res?.data?.map((obj: any) => ({
              name: obj.locationName,
              id: obj.id,
            }))
          );
        }
      } else {
        setLocation(
          userDetail?.additionalUnits?.map((obj: any) => ({
            name: obj.locationName,
            id: obj.id,
          }))
        );
      }
    } else {
      await axios(`/api/kpi-report/getLocationEntityBU`).then((res) => {
        if (res?.data) {
          setLocation(
            res?.data?.map((obj: any) => ({
              name: obj.location.locationName,
              id: obj.location.id,
            }))
          );
          setBusinessUnit(
            res?.data
              ?.map((obj: any) => {
                const businessUnit = obj?.businessunit?.[0];
                if (businessUnit) {
                  const businessType = businessUnit.businessType;
                  if (businessType) {
                    return {
                      name: businessType.name,
                      id: businessType.id,
                    };
                  }
                }
                return null;
              })
              .filter(Boolean)
          );
        } else {
          setLocation([]);
        }

        // setEntity(
        //   res.data.flatMap((obj: any) =>
        //     obj.entityname.map((entity: any) => ({
        //       name: entity.entityName,
        //       id: entity.id,
        //     }))
        //   )
        // );
      });
    }
  };
  // console.log("locationId", locationId);
  const getEntititesForLocation = async () => {
    try {
      const response = await axios.get(
        "/api/kpi-report/getEntitiesByLocations",
        {
          params: {
            locationId:
              kpiReportData.location !== ""
                ? kpiReportData.location
                : userDetail.locationId,
            organizationId: userDetail.organizationId,
          },
        }
      );
      // console.log("get entitites", response.data);
      if (response.data.length > 0) {
        const entities = response.data.map((obj: any) => ({
          id: obj.id,
          name: obj.entityName,
        }));

        // Set the options with "All" first
        setEntity(entities);
      } else {
        setEntity([]);
      }
    } catch (error) {}
  };

  // console.log("entity", entity);
  const getKpiName = async () => {
    await axios(
      `/api/kpi-report/getKpiForLocation?kpiLocation=${
        kpiReportData?.location
          ? kpiReportData?.location
          : userDetail.locationId
      }&kpiEntity=${
        kpiReportData?.entity ? kpiReportData?.entity : userDetail.entityId
      }&kpibusinessunit=${kpiReportData?.businessUnit}`
    ).then((res) => {
      if (res.data) {
        setKpiNameList(
          res?.data
            .map((obj: any) => ({
              id: obj.kpiId,
              value: obj.kpiname,
              kpiuom: obj.kpiuom,
              targettype: obj.targettype,
              displayType: obj.displayType,
              deleted: obj?.deleted,
              frequency: obj?.frequency,
            }))
            .sort((a: any, b: any) => a.value.localeCompare(b.value))
        );

        // setFrequencyType()
      } else {
        setKpiNameList([]);
      }
    });
  };

  const getFiscalMonth = async () => {
    const result = await axios.get(`api/organization/${realmName}`);
    // console.log("result", result?.data, result?.data?.fiscalYearQuarters);
    setFiscalMonth(result?.data?.fiscalYearQuarters);
  };
  // console.log("kpireportdata", kpiId);
  useEffect(() => {
    getFiscalMonth();
    if (chartRef && chartRef.current) {
      (chartRef.current as any).chart.reflow();
    }
    getLocationEntityBU();
    getEntititesForLocation();
    // setTableData(kpiReportData.displayBy);

    if (kpiReportData.minDate && kpiReportData.maxDate && !!kpiId) {
      getDayWiseData();
      getYearWiseData();
      getMonthWiseData();
      getQuarterWiseData();
    }

    getKpiName();

    setTableData(dayData);
    setLabelData(allDays);
    setKpiReportData(kpiChart);
    const currentDate = new Date();

    // Calculate the last day of the current month
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    let location: any;
    if (userDetail?.userType === "globalRoles") {
      location = userDetail?.additionalUnits[0]?.id;
    } else {
      location = userDetail?.location?.id;
    }
    setKpiReportData((prevState: any) => ({
      ...prevState,
      minDate: startDate,
      maxDate: lastDayOfMonth,
      location: location,
      entity: userDetail?.entity?.id ? userDetail?.entity?.id : entity[0]?.id,
    }));
    setLocationId(userDetail?.location?.id);
  }, []);

  useEffect(() => {
    // console.log("kpireport useffect called", kpiReportData);
    if (kpiReportData?.minDate && kpiReportData?.maxDate && !!kpiId) {
      getDayWiseData();
      getYearWiseData();
      getMonthWiseData();
      getQuarterWiseData();
    }
    getEntititesForLocation();
    getKpiName();
  }, [kpiReportData]);
  useEffect(() => {
    if (!!locationstate?.state?.locationId && locationstate?.state?.kpiId) {
      setKpiReportData((prev: any) => ({
        ...prev,
        location: locationstate?.state?.locationId,
        entity: locationstate?.state?.entityId,
        kpiName: locationstate?.state?.kpiName,
        minDate: locationstate?.state?.minDate,
        maxDate: locationstate?.state?.maxDate,
      }));
    }
    setLocationId(locationstate?.state?.locationId);
    setKpiId(locationstate?.state?.kpiId);
    if (locationstate.pathname.includes("/dashboard/objective")) {
      const stateData = JSON.parse(
        sessionStorage.getItem("newTabState") || "{}"
      );
      // console.log("stateData", stateData);
      const currentDate = new Date();

      // Calculate the last day of the current month
      const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      setKpiReportData((prev: any) => ({
        ...prev,
        location: stateData?.locationId,
        entity: stateData?.entityId,
        kpiName: stateData?.kpiName,
        minDate: startDate,
        maxDate: lastDayOfMonth,
      }));
      setLocationId(stateData.locationId);
      setKpiId(stateData.kpiId);
    }
  }, [locationstate]);

  // useEffect(() => {
  //   console.log("kpiId in useeffect", kpiId);
  //   addnewRow();
  // }, [newRowData]);
  // useEffect(() => {
  //   console.log("locationIdin useeffect", locationId);
  // }, [locationId]);

  const findObject = (array: any[], key: string | number, value: any) => {
    return array.filter((object) => object[key] === value);
  };

  const handleChartDataClick = (data: any) => {
    const result = findObject(
      TableData,
      kpiReportData.displayBy === "Year"
        ? "year"
        : kpiReportData.displayBy === "Month"
        ? "month"
        : kpiReportData.displayBy === "Quarter"
        ? "qtrmonth"
        : "days",
      data.location
    );
    setTableData(result);
    const chartlabel = findObjectlabel(
      labelData,
      kpiReportData.displayBy === "Year"
        ? allYear
        : kpiReportData.displayBy === "Month"
        ? allLabels
        : kpiReportData.displayBy === "Quarter"
        ? allQuarters
        : allDays,
      data.location
    );

    if (chartlabel) {
      setLabelData(Object.values(chartlabel));
    }
    return;
  };

  useEffect(() => {
    // console.log("kpireportdata in useffect", kpiReportData);
    if (kpiReportData.displayBy === "Year") {
      setTableData(yearData);
      setLabelData(allYear);
    } else if (kpiReportData.displayBy === "Month") {
      setTableData(monthData);
      setLabelData(allLabels);
    } else if (kpiReportData.displayBy === "Quarter") {
      setTableData(quarterData);
      setLabelData(allQuarters);
    } else {
      setTableData(dayData);
      setLabelData(allDays);
    }
    setClicked(false);
  }, [clicked]);

  const PercentageVsTrendLinegraphData = {
    labels:
      kpiReportData.displayBy === "Year"
        ? allYear
        : kpiReportData.displayBy === "Month"
        ? allLabels
        : kpiReportData.displayBy === "Quarter"
        ? allQuarters
        : allDays,
    datasets: [
      // {
      //   label: "Trend",
      //   data: Array(allPercentage.length).fill(100),
      //   backgroundColor: "#003059",
      //   borderColor: "#003059",
      //   pointBorderColor: "black",
      //   fill: "true",
      //   tension: 0.4,
      // },
      {
        label: "Percentage",
        data: allPercentage,
        backgroundColor: "#DC5F00",
        borderColor: "#DC5F00",
        pointBorderColor: "black",
        fill: "true",
        tension: 0.4,
      },
    ],
  };
  // console.log("kpireportdata", kpiReportData);
  const ActualVsTargetLinegraphData = {
    labels:
      kpiReportData.displayBy === "Year"
        ? allYear
        : kpiReportData.displayBy === "Month"
        ? allLabels
        : kpiReportData.displayBy === "Quarter"
        ? allQuarters
        : allDays,
    datasets: [
      {
        label: "Target",
        data: allTarget,
        backgroundColor: "#003059",
        borderColor: "#003059",
        pointBorderColor: "black",
        fill: "true",
        tension: 0.4,
      },
      {
        label: "Actual",
        data: allValues,
        backgroundColor: "#DF5353",
        borderColor: "#DF5353",
        pointBorderColor: "black",
        fill: "true",
        tension: 0.4,
      },
    ],
  };

  const ActualVsTargetBargraphData = {
    labels:
      kpiReportData.displayBy === "Year"
        ? allYear
        : kpiReportData.displayBy === "Month"
        ? allLabels
        : kpiReportData.displayBy === "Quarter"
        ? allQuarters
        : allDays,
    datasets: [
      {
        label: "Target",
        data: allTarget,
        backgroundColor: "#055C96",
        borderColor: "#055C96",
        pointBorderColor: "black",
        fill: "true",
        tension: 0.4,
      },
      {
        label: "Actual",
        data: allValues,
        backgroundColor: "#DC5F00",
        borderColor: "#DC5F00",
        pointBorderColor: "black",
        fill: "true",
        tension: 0.4,
      },
    ],
  };
  const [selected1, setSelected1] = useState(false);
  const [selected2, setSelected2] = useState(false);
  const [selectedDate, setSelectedDate] = useState(false);
  // console.log("selectedDate", selectedDate);

  const handleChange = (e: any) => {
    // console.log("handle change called");
    if (e.target.name === "minDate" || e.target.name === "maxDate") {
      setKpiReportData((prev: any) => ({
        ...prev,
        [e.target.name]: e.target.valueAsDate,
      }));
      return;
    }
    if (e.target.name === "location") {
      setLocationId(e.target.value);
    }
    setKpiReportData({
      ...kpiReportData,
      [e.target.name]: e.target.value,
    });

    setSelected1(e.target.value !== "");
  };

  const handleDateChange = (e: any) => {
    handleChange(e);
    setSelectedDate(!!e.target.value); // Set selectedDate state based on whether a date is selected
  };

  const [selectedEndDate, setSelectedEndDate] = useState(false);
  const handleDateChange2 = (e: any) => {
    handleChange(e);
    setSelectedEndDate(!!e.target.value); // Set selectedDate state based on whether a date is selected
  };

  const handleChange2 = (e: any) => {
    // console.log("handle change called");
    if (e.target.name === "minDate" || e.target.name === "maxDate") {
      setKpiReportData((prev: any) => ({
        ...prev,
        [e.target.name]: e.target.valueAsDate,
      }));
      return;
    }
    if (e.target.name === "location") {
      setLocationId(e.target.value);
    }
    setKpiReportData({
      ...kpiReportData,
      [e.target.name]: e.target.value,
    });
    setSelected2(e.target.value !== "");
  };
  // console.log("newrowdata in kpigraphs", newRowData);
  const addnewRow = async () => {
    // console.log("newRowCalled");
    let kpiReportDate;
    kpiReportDate = convertDatetoSystem(newRowData);
    if (newRowData.Value) {
      const payload: any = {
        kpiId: kpiId,
        kpiLocation: kpiReportData?.location,
        kpiEntity: kpiReportData?.entity,
        kpiOrganization: userDetail.organizationId,
        kpiValue: newRowData?.Value,
        target: newRowData?.Target,
        kpiVariance: newRowData?.Variance,
        percentahe: newRowData?.Efficiency,
        kpiReportDate: kpiReportDate,
      };
      // console.log("newPayload", payload);
      const result = await axios.post(
        `/api/kpi-report/writeIndividualKpiData`,
        payload
      );
      if (result.status === 201) {
        setNewRowData({});
        setIsNewRowAdding(false);
        reload();
      }
    }
  };
  const reload = () => {
    if (kpiReportData.displayBy === "Year") {
      setTableData(yearData);
    } else if (kpiReportData.displayBy === "Month") {
      setTableData(monthData);
    } else if (kpiReportData.displayBy === "Quarter") {
      setTableData(QuarterTabledata);
    } else {
      setTableData(dayData);
    }
  };

  const inputLabel = React.useRef(null);

  const isMobile = useMediaQuery("(max-width: 960px)");

  const [selectedButton, setSelectedButton] = useState("");

  const handleButtonClick = (buttonName: any) => {
    if (selectedButton === buttonName) {
      setSelectedButton("");
    } else {
      setSelectedButton(buttonName);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [isModalOpenTwo, setIsModalOpenTwo] = useState(false);

  const showModalTwo = () => {
    setIsModalOpenTwo(true);
  };

  const handleOkTwo = () => {
    setIsModalOpenTwo(false);
  };

  const handleCancelTwo = () => {
    setIsModalOpenTwo(false);
  };

  //Efficiency trend line modal

  const [isModalOpenEfficiency, setIsModalOpenEfficiency] = useState(false);

  const showModalEfficiency = () => {
    setIsModalOpenEfficiency(true);
  };

  const handleOkEfficiency = () => {
    setIsModalOpenEfficiency(false);
  };

  const handleCancelEfficiency = () => {
    setIsModalOpenEfficiency(false);
  };

  const [selected, setSelected] = useState(false);

  const CustomArrowDropDownIcon = (props: any) => (
    <ArrowDropDownIcon
      {...props}
      // style={{ color: selected1 ? "white" : "black" }}
      style={{ color: "black" }}
    /> // Inline style for color
  );

  const CustomArrowDropDownIcon2 = (props: any) => (
    <ArrowDropDownIcon {...props} style={{ color: "black" }} /> // Inline style for color
  );

  useEffect(() => {
    newChartData();
  }, [kpiId]);

  const [newKPIChartData, setNewKPIChartData] = useState();

  const newChartData = async () => {
    if (!kpiId) {
      console.warn("kpiId is undefined or null, skipping API call");
      return;
    }

    try {
      const result = await axios.get(
        `/api/kpi-report/getAllKpiDataForGraph?kpiId=${kpiId}`
      );
      setNewKPIChartData(result.data);
    } catch (error) {
      console.error("Error fetching KPI data", error);
    }
  };

  const [index, setIndex] = useState(0);

  const handleNext = () => {
    if (index < 1) {
      setIndex(index + 1);
    }
    setCurrentTab("Analytics");
  };

  const handleBack = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
    setCurrentTab("Summary");
  };

  // mobile view filter moda.

  const [isModalOpenMobileFilter, setIsModalOpenMobileFilter] = useState(false);

  const showModalMobileFilter = () => {
    setIsModalOpenMobileFilter(true);
  };

  const handleOkMobileFilter = () => {
    setIsModalOpenMobileFilter(false);
  };

  const handleCancelMobileFilter = () => {
    setIsModalOpenMobileFilter(false);
  };

  return (
    <>
      <div className={classes.root}>
        {/* <Grid item style={{ padding: "10px 0" }}>
          <Typography color="primary" variant="h6">
            KPI Report{" "}
            {kpiReportData.kpiName ? (
              <>
                {" "}
                for <strong> {kpiReportData.kpiName}</strong>
              </>
            ) : (
              ""
            )}
          </Typography>
        </Grid> */}

        {matches ? (
          <Grid container style={{ paddingTop: "20px", paddingRight: "20px" }}>
            <Grid item sm={12} md={12}>
              <Grid
                container
                spacing={isMobile ? 3 : 0}
                justifyContent={isMobile ? undefined : "space-between"}
              >
                {/* <Grid item xs={12} md={2}>
              <FormControl
                className={classes.formControl}
                variant="outlined"
                size="small"
              >
                <InputLabel shrink ref={inputLabel}>
                  Business Unit
                </InputLabel>
                <Select
                  label="Business Unit"
                  name="businessUnit"
                  value={kpiReportData.businessUnit}
                  input={<OutlinedInput notched labelWidth={100} />}
                  onChange={(e: any) => {
                    handleChange(e);
                    // setBusinessUnitId(e.target.value);
                  }}
                  data-testid="businessUnit"
                  required
                >
                  {businessUnit
                    .filter((obj, index, self) => {
                      return (
                        index ===
                        self.findIndex(
                          (o) => o.id === obj.id && o.name === obj.name
                        )
                      );
                    })
                    .map((obj) => (
                      <MenuItem key={obj.id} value={obj.id}>
                        {obj.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid> */}
                <Grid item xs={12} md={2}>
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    {/* <InputLabel
                    shrink
                    ref={inputLabel}
                    style={{ display: selected1 ? "none" : "block" }}
                  >
                    Location
                  </InputLabel> */}
                    <Select
                      // label="Location"
                      name="location"
                      value={kpiReportData.location}
                      input={<OutlinedInput notched labelWidth={70} />}
                      onChange={(e: any) => {
                        handleChange(e);
                        // setLocationId(e.target.value);
                      }}
                      data-testid="location"
                      required
                      className={`${classes.select} ${
                        selected1 ? "selected" : ""
                      }`}
                      IconComponent={CustomArrowDropDownIcon}
                    >
                      {location.map((obj) => (
                        <MenuItem key={obj.id} value={obj.id}>
                          {obj.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                  <FormControl
                    className={classes.formControl}
                    variant="outlined"
                    size="small"
                  >
                    {/* <InputLabel
                    shrink
                    ref={inputLabel}
                    style={{ display: selected2 ? "none" : "block" }}
                  >
                    Entity
                  </InputLabel> */}
                    <Select
                      // label="Entity"
                      name="entity"
                      value={kpiReportData.entity}
                      input={<OutlinedInput notched labelWidth={50} />}
                      onChange={(e: any) => {
                        handleChange2(e);
                        // setEntityId(e.target.value);
                      }}
                      data-testid="entity"
                      required
                      // className={`${classes.select} ${
                      //   selected2 ? "selected" : ""
                      // }`}
                      className={classes.select}
                      IconComponent={CustomArrowDropDownIcon2}
                    >
                      {entity.map((obj) => {
                        if (obj && obj.id) {
                          return (
                            <MenuItem key={obj.id} value={obj.id}>
                              {obj.name}
                            </MenuItem>
                          );
                        }
                        // Don't render anything if the object is undefined or doesn't have an "id" property
                        return null;
                      })}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",

                      // border: selected ? "none" : "1px solid black",
                    }}
                  >
                    <Grid xs={12} md={11}>
                      <Tooltip title={kpiReportData.kpiName}>
                        <FormControl
                          className={classes.formControl}
                          variant="outlined"
                          size="small"
                          // style={{
                          //   border: selected ? "none" : "1px solid black",
                          // }}
                        >
                          <Autocomplete
                            options={kpiNameList}
                            getOptionLabel={(op) => op.value}
                            value={
                              kpiNameList.filter(
                                (op) => op?.value === kpiReportData?.kpiName
                              )[0]
                                ? kpiNameList.filter(
                                    (op) => op?.value === kpiReportData?.kpiName
                                  )[0]
                                : kpiReportData?.kpiName
                            }
                            onChange={(e, newValue) => {
                              setKpiReportData((prev: any) => ({
                                ...prev,
                                kpiName: newValue?.value,
                                uom: newValue?.kpiuom,
                                targetType: newValue?.targettype,
                                displayType: newValue?.displayType,
                                deleted: newValue?.deleted,
                                frequency: newValue?.frequency,
                              }));
                              setKpiId(newValue?.id);
                              setSelected(!!newValue);
                            }}
                            renderInput={(params) => {
                              return (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                  // label={selected ? "" : "KPI Name"}
                                  size="small"
                                  InputLabelProps={{ shrink: true }}
                                  placeholder="Select KPI Name"
                                  // style={{
                                  //   backgroundColor: selected
                                  //     ? "#9fbfdf"
                                  //     : "white",
                                  //   borderRadius: selected ? "20px" : "4px",
                                  // }}

                                  className={
                                    selected
                                      ? classes.textField
                                      : classes.textField2
                                  }

                                  // required
                                />
                              );
                            }}
                          />
                        </FormControl>
                      </Tooltip>
                    </Grid>
                    {/* <Grid xs={1} md={1}>
                    {kpiReportData.targetType === "Increase" ? (
                      <Tooltip
                        title={"Increase type"}
                        style={{ padding: "1px", marginBottom: "1px" }}
                      >
                        <ArrowRightAltIcon
                          style={{
                            color: "green",
                            fontWeight: "bolder",
                            fontSize: "40px",
                            stroke: "green",
                            strokeWidth: 1,

                            transform: "rotate(-90deg)",
                          }}
                          className={classes.arrowStyle}
                        />
                      </Tooltip>
                    ) : kpiReportData.targetType === "Decrease" ? (
                      <Tooltip
                        title={"Decrease type"}
                        style={{ padding: "1px" }}
                      >
                        <ArrowRightAltIcon
                          style={{
                            color: "#DF5353",
                            fontWeight: "bolder",

                            fontSize: "40px",
                            stroke: "#DF5353",
                            strokeWidth: 1,

                            zIndex: 1,
                            transform: "rotate(-270deg)",
                          }}
                          className={classes.arrowStyle}
                        />
                      </Tooltip>
                    ) : kpiReportData.targetType === "Range" ? (
                      <Tooltip title={"Range type"} style={{ padding: "1px" }}>
                        <SettingsEthernetIcon
                          style={{
                            color: "blue",
                            fontWeight: "bolder",
                            fontSize: "30px",
                            stroke: "blue",
                            strokeWidth: 1,

                            zIndex: 1,
                          }}
                          className={classes.arrowStyle}
                        />
                      </Tooltip>
                    ) : (
                      <ImportExportOutlinedIcon
                        className={classes.arrowStyle}
                      />
                    )}
                  </Grid> */}
                    <Grid xs={1} md={1}>
                      {kpiReportData.deleted ? (
                        <Tooltip title={"Inactive"} style={{ padding: "1px" }}>
                          <CloseCircleOutlined
                            style={{
                              color: "red",
                              fontWeight: "bolder",
                              fontSize: "20px",
                              stroke: "red",
                              strokeWidth: 1,
                              transform: "rotate(-90deg)",
                              paddingTop: "20px",
                            }}
                          ></CloseCircleOutlined>
                        </Tooltip>
                      ) : (
                        <>
                          {kpiReportData.targetType === "Increase" ? (
                            <Tooltip
                              title={"Increase type"}
                              style={{ padding: "1px", marginBottom: "1px" }}
                            >
                              <ArrowRightAltIcon
                                style={{
                                  color: "green",
                                  fontWeight: "bolder",
                                  fontSize: "40px",
                                  stroke: "green",
                                  strokeWidth: 1,
                                  transform: "rotate(-90deg)",
                                }}
                                className={classes.arrowStyle}
                              />
                            </Tooltip>
                          ) : kpiReportData.targetType === "Decrease" ? (
                            <Tooltip
                              title={"Decrease type"}
                              style={{ padding: "1px" }}
                            >
                              <ArrowRightAltIcon
                                style={{
                                  color: "#DF5353",
                                  fontWeight: "bolder",
                                  fontSize: "40px",
                                  stroke: "#DF5353",
                                  strokeWidth: 1,
                                  zIndex: 1,
                                  transform: "rotate(-270deg)",
                                }}
                                className={classes.arrowStyle}
                              />
                            </Tooltip>
                          ) : kpiReportData.targetType === "Range" ? (
                            <Tooltip
                              title={"Range type"}
                              style={{ padding: "1px" }}
                            >
                              <SettingsEthernetIcon
                                style={{
                                  color: "blue",
                                  fontWeight: "bolder",
                                  fontSize: "30px",
                                  stroke: "blue",
                                  strokeWidth: 1,
                                  zIndex: 1,
                                }}
                                className={classes.arrowStyle}
                              />
                            </Tooltip>
                          ) : (
                            <ImportExportOutlinedIcon
                              className={classes.arrowStyle}
                            />
                          )}
                        </>
                      )}
                    </Grid>
                  </div>
                </Grid>

                <Grid item xs={6} md={2}>
                  <TextField
                    // label={selectedDate ? "" : "From"}
                    variant="outlined"
                    type="date"
                    name="minDate"
                    onChange={handleDateChange}
                    value={convertDate(kpiReportData?.minDate)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    disabled={index === 0 ? true : false}
                    // className={
                    //   selectedDate
                    //     ? classes.selectedDateInput
                    //     : classes.selectedDateInputIntial
                    // }
                    className={classes.selectedDateInput}
                    fullWidth
                    inputProps={{
                      className: selectedDate
                        ? classes.selectedDateInput
                        : classes.dateInput,
                      style: {
                        fontSize: isMobile ? "16px" : "14px",
                        borderRadius: selectedDate ? "20px" : "4px",
                        fontWeight: 600,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    // label={selectedEndDate ? "" : "To"}
                    variant="outlined"
                    type="date"
                    name="maxDate"
                    onChange={handleDateChange2}
                    value={convertDate(kpiReportData?.maxDate)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    disabled={index === 0 ? true : false}
                    fullWidth
                    // className={
                    //   selectedEndDate
                    //     ? classes.selectedDateInput2
                    //     : classes.selectedDateInputIntial
                    // }
                    className={classes.selectedDateInput2}
                    inputProps={{
                      className: classes.dateInput,
                      style: {
                        fontSize: isMobile ? "16px" : "14px",
                        fontWeight: 600,
                      },
                    }}
                  />
                </Grid>

                {currentTab === "Analytics" ? (
                  <Grid item xs={12} md={1}>
                    <div
                      style={{
                        display: "flex",
                        height: "100%",
                        alignItems: "center",
                      }}
                    >
                      {/* <Button
                      color="secondary"
                      style={{
                        backgroundColor: "#003059",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: 600,
                        margin: "0px 5px",
                      }}
                      onClick={() => {
                        setClicked(true);
                      }}
                      fullWidth
                    >
                      GO
                    </Button> */}
                      {/* <Tooltip title="Graph reload">
                    <IconButton onClick={reload}>
                      <img src={ReloadIcon} alt="reload" width={18} />
                    </IconButton>
                  </Tooltip> */}
                    </div>
                  </Grid>
                ) : (
                  ""
                )}
              </Grid>
            </Grid>
          </Grid>
        ) : null}

        <div
          style={{
            display: "flex",
            gap: matches ? "20px" : "10px",
            padding: matches ? "20px 20px" : "10px 5px",
          }}
        >
          <div>
            <Button
              onClick={handleBack}
              disabled={index === 0}
              style={{
                border: "2px solid #003059",
                padding: matches ? "3px 15px" : "3px 5px",
                borderRadius: "5px",
                color: index === 0 ? "white" : "#003059",
                // margin: "25px 40px 0px 0px",
                fontWeight: 600,
                backgroundColor: index === 0 ? "#003059" : "white",
              }}
            >
              KPI Summary
            </Button>
          </div>
          <div>
            <Button
              onClick={handleNext}
              disabled={index === 1}
              style={{
                border: "2px solid #003059",
                padding: matches ? "3px 15px" : "3px 5px",
                borderRadius: "5px",
                color: index === 1 ? "white" : "#003059",
                fontWeight: 600,
                backgroundColor: index === 1 ? "#003059" : "white",
              }}
            >
              KPI Analytics
            </Button>
          </div>
        </div>

        <SwipeableViews
          index={index}
          onChangeIndex={(index) => setIndex(index)}
          style={{ width: "100%" }}
        >
          <div
            style={{
              padding: matches ? "0px 30px" : "0px 5px",
              marginBottom: "50px",
              width: "100%",
            }}
          >
            <SummaryChartKPI newKPIChartData={newKPIChartData} />
          </div>

          <div>
            <div>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: matches ? "row" : "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    // width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-evenly",
                    textAlign: "center",
                    flex: matches ? 7 : 1,

                    // paddingBottom: "10px",
                  }}
                >
                  <div className={classes.maincontainer}>
                    <div
                      style={{
                        borderRadius: matches ? "50%" : "5px",
                        width: "110px",
                        height: matches ? "110px" : "48px",
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px solid #686D76",
                      }}
                    >
                      <p
                        className={classes.number}
                        // style={{ backgroundColor: "#d72828" }}
                        style={{ backgroundColor: "#686D76" }}
                      >
                        {kpiReportData.displayType === "SUM"
                          ? targetValue
                          : avgTargetValue}
                      </p>
                    </div>

                    <p className={classes.text}>Target</p>
                  </div>
                  <div className={classes.maincontainer}>
                    <div
                      style={{
                        borderRadius: matches ? "50%" : "5px",
                        width: "110px",
                        height: matches ? "110px" : "48px",
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px solid #373A40",
                      }}
                    >
                      <p
                        className={classes.number}
                        // style={{ backgroundColor: "#666699" }}
                        style={{ backgroundColor: "#373A40" }}
                      >
                        {actualValue}
                      </p>
                    </div>
                    <p className={classes.text}>Value</p>
                  </div>
                  <div className={classes.maincontainer}>
                    <div
                      style={{
                        borderRadius: matches ? "50%" : "5px",
                        width: "110px",
                        height: matches ? "110px" : "48px",
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px solid #DC5F00",
                      }}
                    >
                      <p
                        className={classes.number}
                        // style={{ backgroundColor: "#ffbe1a" }}
                        style={{ backgroundColor: "#DC5F00" }}
                      >
                        {variance}
                      </p>
                    </div>
                    <p className={classes.text}>Variance</p>
                  </div>
                  {kpiReportData.displayType === "SUM" ? (
                    <div className={classes.maincontainer}>
                      <div
                        style={{
                          borderRadius: matches ? "50%" : "5px",
                          width: "110px",
                          height: matches ? "110px" : "48px",
                          textAlign: "center",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          border: "1px solid #21618C",
                        }}
                      >
                        <p
                          className={classes.number}
                          // style={{ backgroundColor: "#b9cd32" }}
                          style={{ backgroundColor: "#21618C" }}
                        >
                          {actualValue}
                        </p>
                      </div>
                      <p className={classes.text}>Total</p>
                    </div>
                  ) : (
                    <div className={classes.maincontainer}>
                      <div
                        style={{
                          borderRadius: matches ? "50%" : "5px",
                          width: "110px",
                          height: matches ? "110px" : "48px",
                          textAlign: "center",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          border: "1px solid #21618C",
                        }}
                      >
                        <p
                          className={classes.number}
                          // style={{ backgroundColor: "#b9cd32" }}
                          style={{ backgroundColor: "#21618C" }}
                        >
                          {averageValue}
                        </p>
                      </div>
                      <p className={classes.text}>Average</p>
                    </div>
                  )}
                  <div className={classes.maincontainer}>
                    <div
                      style={{
                        borderRadius: matches ? "50%" : "5px",
                        width: "110px",
                        height: matches ? "110px" : "48px",
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px solid #C73659",
                      }}
                    >
                      <p
                        className={classes.number}
                        // style={{ backgroundColor: "#3366cc" }}
                        style={{ backgroundColor: "#C73659" }}
                      >
                        {percentageValue}%{/* 100.56% */}
                      </p>
                    </div>
                    <p className={classes.text}>Efficiency</p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flex: matches ? 2 : 1,
                    justifyContent: matches ? "end" : "start",
                    marginRight: matches ? "20px" : "0px",
                    alignItems: "center",
                  }}
                >
                  <label style={{ marginRight: matches ? "15px" : "5px" }}>
                    Display By
                  </label>
                  <Tooltip title={"Yearly"}>
                    <Button
                      style={{
                        backgroundColor:
                          selectedButton === "year" ? "#9FA3A9" : "",
                      }}
                      className={classes.displayButton}
                      variant="outlined"
                      color={
                        selectedButton === "year" ? "secondary" : "primary"
                      }
                      onClick={() => {
                        handleButtonClick("year");
                        setKpiReportData((prev: any) => ({
                          ...prev,
                          displayBy: "Year",
                        }));
                        setClicked(true);
                      }}
                    >
                      Y
                    </Button>
                  </Tooltip>
                  {kpiReportData.frequency === "HALF-YEARLY" ||
                  kpiReportData.frequency === "YEARLY" ? (
                    <></>
                  ) : (
                    <Tooltip title={"Quarterly"}>
                      <Button
                        style={{
                          backgroundColor:
                            selectedButton === "quarter" ? "#9FA3A9" : "",
                        }}
                        className={classes.displayButton}
                        variant="outlined"
                        color={
                          selectedButton === "quarter" ? "secondary" : "primary"
                        }
                        onClick={() => {
                          handleButtonClick("quarter");
                          setKpiReportData((prev: any) => ({
                            ...prev,
                            displayBy: "Quarter",
                          }));
                          setClicked(true);
                        }}
                      >
                        Q
                      </Button>
                    </Tooltip>
                  )}
                  {kpiReportData.frequency === "HALF-YEARLY" ||
                  kpiReportData.frequency === "QUARTERLY" ? (
                    <></>
                  ) : (
                    <Tooltip title={"Monthly"}>
                      <Button
                        style={{
                          backgroundColor:
                            selectedButton === "month" ? "#9FA3A9" : "",
                        }}
                        className={classes.displayButton}
                        variant="outlined"
                        color={
                          selectedButton === "month" ? "secondary" : "primary"
                        }
                        onClick={() => {
                          handleButtonClick("month");
                          setKpiReportData((prev: any) => ({
                            ...prev,
                            displayBy: "Month",
                          }));
                          setClicked(true);
                        }}
                      >
                        M
                      </Button>
                    </Tooltip>
                  )}
                  {kpiReportData.frequency === "MONTHLY" ||
                  kpiReportData.frequency === "HALF-YEARLY" ||
                  kpiReportData.frequency === "QUARTERLY" ? (
                    <></>
                  ) : (
                    <Tooltip title={"Daily"}>
                      <Button
                        style={{
                          backgroundColor:
                            selectedButton === "day" ? "#9FA3A9" : "",
                        }}
                        className={classes.displayButton}
                        variant="outlined"
                        color={
                          selectedButton === "day" ? "secondary" : "primary"
                        }
                        onClick={() => {
                          handleButtonClick("day");
                          setKpiReportData((prev: any) => ({
                            ...prev,
                            displayBy: "Days",
                          }));
                          setClicked(true);
                        }}
                      >
                        D
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: matches ? "row" : "column",
                justifyContent: "space-between",
                gap: "20px",
                padding: "10px",
              }}
            >
              {/* // chart div */}
              <div>
                {/* // top 2  chart div */}
                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    flexDirection: matches ? "row" : "column",
                  }}
                >
                  <div
                    style={{
                      height: "350px",
                      border: "1px solid #D7CDC1",
                      padding: matches ? "10px" : "0px",
                      width: matches ? "360px" : "100%",
                    }}
                  >
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={speedometeroptions}
                      ref={chartRef}
                    />
                  </div>
                  <div
                    style={{
                      width: matches ? "360px" : "100%",
                      height: "350px",
                      border: "1px solid #D7CDC1",
                      padding: matches ? "10px" : "0px",
                      display: "flex",
                    }}
                  >
                    <ReportGraphComponent
                      chartType={ChartType.BAR}
                      displayTitle={true}
                      title="Target vs Actual By Time Series"
                      legendsAlignment={Alignment.START}
                      legendsPosition={Position.BOTTOM}
                      isStacked={false}
                      chartData={ActualVsTargetBargraphData}
                      handleChartDataClick={handleChartDataClick}
                      searchTitle="TargetvsActual"
                    />
                    {matches ? <ArrowsAltOutlined onClick={showModal} /> : null}
                  </div>
                </div>
                {/* // bottom 2  chart div */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: matches ? "row" : "column",
                    gap: "5px",
                    marginTop: "5px",
                  }}
                >
                  <div
                    style={{
                      width: matches ? "360px" : "100%",
                      height: "350px",
                      border: "1px solid #D7CDC1",
                      padding: matches ? "10px" : "0px",
                      display: "flex",
                    }}
                  >
                    <ReportGraphComponent
                      chartType={ChartType.LINE}
                      displayTitle={true}
                      title="Efficiency Trend Line"
                      legendsAlignment={Alignment.START}
                      legendsPosition={Position.BOTTOM}
                      isStacked={false}
                      chartData={PercentageVsTrendLinegraphData}
                      handleChartDataClick={handleChartDataClick}
                      searchTitle="PercentageVsTrend"
                    />
                    {matches ? (
                      <ArrowsAltOutlined onClick={showModalEfficiency} />
                    ) : null}
                  </div>
                  <div
                    style={{
                      width: matches ? "360px" : "100%",
                      height: "350px",
                      border: "1px solid #D7CDC1",
                      padding: matches ? "10px" : "0px",
                      display: "flex",
                    }}
                  >
                    <ReportGraphComponent
                      chartType={ChartType.LINE}
                      displayTitle={true}
                      title="Target vs Actual By Time Series"
                      legendsAlignment={Alignment.START}
                      legendsPosition={Position.BOTTOM}
                      isStacked={false}
                      chartData={ActualVsTargetLinegraphData}
                      handleChartDataClick={handleChartDataClick}
                      searchTitle="TargetvsActual"
                    />
                    {matches ? (
                      <ArrowsAltOutlined onClick={showModalTwo} />
                    ) : null}
                  </div>
                </div>
              </div>
              {/* // table div */}
              <div>
                <KpiGraphsTable
                  columns={
                    kpiReportData.displayBy === "Year"
                      ? yearColumns
                      : kpiReportData.displayBy === "Month"
                      ? monthColumns
                      : kpiReportData.displayBy === "Quarter"
                      ? quaterColumns
                      : dayscolumns
                  }
                  data={TableData}
                  showToolbar
                  isNewRowAdding={isNewRowAdding}
                  setIsNewRowAdding={setIsNewRowAdding}
                  newRowData={newRowData}
                  setNewRowData={setNewRowData}
                  addnewRow={addnewRow}
                />
              </div>
            </div>

            <Modal
              // title="Basic Modal"
              open={isModalOpenEfficiency}
              onOk={handleOkEfficiency}
              onCancel={handleCancelEfficiency}
              // width="90vw"
              style={{ display: "flex", justifyContent: "center" }}
              footer={null}
              closeIcon={
                <img
                  src={CloseIconImageSvg}
                  alt="close-drawer"
                  style={{
                    width: "30px",
                    height: "38px",
                    cursor: "pointer",
                    marginTop: "-5px",
                  }}
                />
              }
            >
              <div
                style={{
                  width: "85vw",
                  height: "450px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <ReportGraphComponent
                  chartType={ChartType.LINE}
                  displayTitle={true}
                  title="Efficiency Trend Line"
                  legendsAlignment={Alignment.START}
                  legendsPosition={Position.BOTTOM}
                  isStacked={false}
                  chartData={PercentageVsTrendLinegraphData}
                  handleChartDataClick={handleChartDataClick}
                  searchTitle="PercentageVsTrend"
                />
              </div>
            </Modal>

            <Modal
              // title="Basic Modal"
              open={isModalOpen}
              onOk={handleOk}
              onCancel={handleCancel}
              width="90vw"
              style={{
                display: "flex",
                justifyContent: "center",
              }}
              footer={null}
              closeIcon={
                <img
                  src={CloseIconImageSvg}
                  alt="close-drawer"
                  style={{
                    width: "30px",
                    height: "38px",
                    cursor: "pointer",
                    marginTop: "-5px",
                  }}
                />
              }
            >
              <div
                style={{
                  width: "85vw",
                  height: "450px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <ReportGraphComponent
                  chartType={ChartType.BAR}
                  displayTitle={true}
                  title="Target vs Actual By Time Series"
                  legendsAlignment={Alignment.START}
                  legendsPosition={Position.BOTTOM}
                  isStacked={false}
                  chartData={ActualVsTargetBargraphData}
                  handleChartDataClick={handleChartDataClick}
                  searchTitle="TargetvsActual"
                />
              </div>
            </Modal>

            <Modal
              // title="Basic Modal"
              open={isModalOpenTwo}
              onOk={handleOkTwo}
              onCancel={handleCancelTwo}
              // width="90vw"
              style={{ display: "flex", justifyContent: "center" }}
              footer={null}
              closeIcon={
                <img
                  src={CloseIconImageSvg}
                  alt="close-drawer"
                  style={{
                    width: "30px",
                    height: "38px",
                    cursor: "pointer",
                    marginTop: "-5px",
                  }}
                />
              }
            >
              <div
                style={{
                  width: "85vw",
                  height: "450px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <ReportGraphComponent
                  chartType={ChartType.LINE}
                  displayTitle={true}
                  title="Target vs Actual By Time Series"
                  legendsAlignment={Alignment.START}
                  legendsPosition={Position.BOTTOM}
                  isStacked={false}
                  chartData={ActualVsTargetLinegraphData}
                  handleChartDataClick={handleChartDataClick}
                  searchTitle="TargetvsActual"
                />
              </div>
            </Modal>
          </div>
        </SwipeableViews>
      </div>

      {matches ? (
        ""
      ) : (
        <div
          style={{
            paddingTop: "3px",
            position: "absolute",
            top: 82,
            right: 30,
          }}
        >
          <FilterIcon
            style={{ width: "24px", height: "24px" }}
            onClick={showModalMobileFilter}
          />
        </div>
      )}

      <Modal
        title={
          <div
            style={{
              backgroundColor: "#E8F3F9",
              padding: "8px",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
            }}
          >
            Filter By
          </div>
        }
        open={isModalOpenMobileFilter}
        onOk={handleOkMobileFilter}
        onCancel={handleCancelMobileFilter}
        // className={classes.modal}
        // style={{ height: "80vh" }}
        footer={null}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{
              width: "30px",
              height: "30px",
              cursor: "pointer",
              padding: "0px",
              margin: "7px 15px 0px 0px",
            }}
          />
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            // marginTop: "20px",
            // border: "1px solid rgba(19, 171, 155, 0.5)",
            // borderRadius: "12px",
            // padding: "20px",
            // margin: "20px 20px 10px 20px",
          }}
        >
          <div style={{ width: "100%" }}>
            <Select
              // label="Location"
              name="location"
              value={kpiReportData.location}
              input={<OutlinedInput notched labelWidth={70} />}
              onChange={(e: any) => {
                handleChange(e);
                // setLocationId(e.target.value);
              }}
              data-testid="location"
              required
              className={`${classes.select} ${selected1 ? "selected" : ""}`}
              IconComponent={CustomArrowDropDownIcon}
              style={{ width: "100%" }}
            >
              {location.map((obj) => (
                <MenuItem key={obj.id} value={obj.id}>
                  {obj.name}
                </MenuItem>
              ))}
            </Select>
          </div>

          <div style={{ width: "100%" }}>
            <Select
              // label="Entity"
              name="entity"
              value={kpiReportData.entity}
              input={<OutlinedInput notched labelWidth={50} />}
              onChange={(e: any) => {
                handleChange2(e);
                // setEntityId(e.target.value);
              }}
              data-testid="entity"
              required
              style={{ width: "100%" }}
              className={classes.select}
              IconComponent={CustomArrowDropDownIcon2}
            >
              {entity.map((obj) => {
                if (obj && obj.id) {
                  return (
                    <MenuItem key={obj.id} value={obj.id}>
                      {obj.name}
                    </MenuItem>
                  );
                }
                // Don't render anything if the object is undefined or doesn't have an "id" property
                return null;
              })}
            </Select>
          </div>

          <div style={{ width: "100%" }}>
            <Autocomplete
              options={kpiNameList}
              getOptionLabel={(op) => op.value}
              value={
                kpiNameList.filter(
                  (op) => op?.value === kpiReportData?.kpiName
                )[0]
                  ? kpiNameList.filter(
                      (op) => op?.value === kpiReportData?.kpiName
                    )[0]
                  : kpiReportData?.kpiName
              }
              onChange={(e, newValue) => {
                setKpiReportData((prev: any) => ({
                  ...prev,
                  kpiName: newValue?.value,
                  uom: newValue?.kpiuom,
                  targetType: newValue?.targettype,
                  displayType: newValue?.displayType,
                  deleted: newValue?.deleted,
                  frequency: newValue?.frequency,
                }));
                setKpiId(newValue?.id);
                setSelected(!!newValue);
              }}
              style={{ width: "100%" }}
              renderInput={(params) => {
                return (
                  <TextField
                    {...params}
                    variant="outlined"
                    // label={selected ? "" : "KPI Name"}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    placeholder="Select KPI Name"
                    // style={{
                    //   backgroundColor: selected
                    //     ? "#9fbfdf"
                    //     : "white",
                    //   borderRadius: selected ? "20px" : "4px",
                    // }}

                    className={
                      selected ? classes.textField : classes.textField2
                    }

                    // required
                  />
                );
              }}
            />
          </div>

          <div style={{ width: "100%" }}>
            <TextField
              // label={selectedDate ? "" : "From"}
              variant="outlined"
              type="date"
              name="minDate"
              onChange={handleDateChange}
              value={convertDate(kpiReportData?.minDate)}
              InputLabelProps={{
                shrink: true,
              }}
              disabled={index === 0 ? true : false}
              style={{ width: "100%" }}
              className={classes.selectedDateInput}
              fullWidth
              inputProps={{
                className: selectedDate
                  ? classes.selectedDateInput
                  : classes.dateInput,
                style: {
                  fontSize: isMobile ? "16px" : "14px",
                  borderRadius: selectedDate ? "20px" : "4px",
                  fontWeight: 600,
                },
              }}
            />
          </div>

          <div style={{ width: "100%" }}>
            <TextField
              // label={selectedEndDate ? "" : "To"}
              variant="outlined"
              type="date"
              name="maxDate"
              onChange={handleDateChange2}
              value={convertDate(kpiReportData?.maxDate)}
              InputLabelProps={{
                shrink: true,
              }}
              disabled={index === 0 ? true : false}
              fullWidth
              style={{ width: "100%" }}
              className={classes.selectedDateInput2}
              inputProps={{
                className: classes.dateInput,
                style: {
                  fontSize: isMobile ? "16px" : "14px",
                  fontWeight: 600,
                },
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

export default KpiGraphs;
