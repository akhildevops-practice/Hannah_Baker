import axios from "apis/axios.global";

import { auditPlanSchema } from "schemas/auditPlanSchema";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeft";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
const YearWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  margin: 3px 0px 0px 13px;
`;

const YearButton = styled.button`
  font: bold;
  color: #246dc1;
  font-weight: 800px;
  font-size: 25px;
  padding: 20;
  border: none;
  background: none;
  cursor: pointer;
  weight: 100%;
`;

const CurrentYear = styled.span`
  font-size: 16px;
  font-family: poppinsregular;

  padding: 20;
  margin: 0px;
  color: #246dc1;
  font-weight: 800px;
`;
type Props = {
  currentYear: any;
  setCurrentYear: any;
};
const YearComponent = ({ currentYear, setCurrentYear }: Props) => {
  useEffect(() => {
    // getYear();
  }, []);
  function adjustYear(yearString: any, offset: any) {
    // Ensure the input is a string
    yearString = yearString.toString();

    // For format: yyyy
    if (/^\d{4}$/.test(yearString)) {
      let year = parseInt(yearString, 10) + offset;
      return year.toString();
    }

    // For format: yy - yy+1
    if (/^\d{2}-\d{2}$/.test(yearString)) {
      let [start, end] = yearString.split("-").map((y: any) => parseInt(y, 10));
      start += offset;
      end += offset;
      return `${start}-${end}`;
    }

    // For format: yyyy- yy+1
    if (/^\d{4}-\d{2}$/.test(yearString)) {
      let [start, end] = yearString.split("-");
      let fullStart = parseInt(start, 10);
      let fullEnd = parseInt(start.slice(0, 2) + end, 10) + offset;
      return `${fullStart + offset}-${fullEnd.toString().slice(-2)}`;
    }

    // For format: yy+1
    if (/^\d{2}$/.test(yearString)) {
      let year = parseInt(yearString, 10) + offset;
      return year.toString().slice(-2);
    }

    throw new Error("Invalid year format");
  }
  const changeYear = (offset: any) => {
    const year = adjustYear(currentYear, offset);
    setCurrentYear(year);
   // setYear(val);
  };

  return (
    <YearWrapper className="year-component">
      {/* <YearButton onClick={() => changeYear(-1)}> */}
      {/* &lt; */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        onClick={() => changeYear(-1)}
      >
        <ArrowLeftIcon
          style={{
            width: "40px",
            height: "40px",
          }}
        />
      </div>
      {/* </YearButton> */}
      <CurrentYear>{currentYear}</CurrentYear>
      {/* <YearButton onClick={() => changeYear(1)}> */}
      {/* &gt;
       */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        onClick={() => changeYear(1)}
      >
        <ArrowRightIcon
          style={{
            width: "40px",
            height: "40px",
          }}
        />
      </div>
      {/* </YearButton> */}
    </YearWrapper>
  );
};

export default YearComponent;
