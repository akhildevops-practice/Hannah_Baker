import React, { useState } from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  tableContainer: {
    width: "100%",
    borderCollapse: "collapse",
    "& table": {
      width: "100%",
      borderCollapse: "collapse",
    },
    "& th, & td": {
      padding: "12px 16px",
      textAlign: "left",
      border: "1px solid #ddd",
    },
    "& th": {
      backgroundColor: "#E8F3F9",
      color: "#00224E",
      fontWeight: 600,
    },
  },
  expandIcon: {
    cursor: "pointer",
    marginRight: "10px",
  },
  subTableContainer: {
    marginLeft: "20px",
    "& table": {
      width: "95%",
    },
    "& th, & td": {
      padding: "10px 12px",
    },
  },
}));

type Props = {
  consolidatedCountTableData: any;
};

const AspectImpactConsolidatedTableChart = ({
  consolidatedCountTableData = [],
}: Props) => {
  const classes = useStyles();
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);

  const toggleExpandLocation = (locationId: string) => {
    setExpandedLocation((prev) => (prev === locationId ? null : locationId));
  };

  return (
    <div className={classes.tableContainer}>
      <Typography
        align="center"
        gutterBottom
        style={{ fontSize: "16px", color: "black" }}
      >
        Aspect Impact Consolidated Count
      </Typography>
      <table>
        <thead>
          <tr>
            <th>Corp Func/Unit</th>
          </tr>
        </thead>
        <tbody>
          {consolidatedCountTableData?.map((location: any) => (
            <React.Fragment key={location?._id}>
              <tr>
                <td>
                  <span
                    className={classes.expandIcon}
                    onClick={() => toggleExpandLocation(location?._id)}
                  >
                    {expandedLocation === location?._id ? (
                      <MinusCircleOutlined />
                    ) : (
                      <PlusCircleOutlined />
                    )}
                  </span>
                  {location?.locationName}
                </td>
              </tr>
              {expandedLocation === location?._id && (
                <tr>
                  <td>
                    <div className={classes.subTableContainer}>
                      <table>
                        <thead>
                          <tr>
                            <th>Dept/Vertical</th>
                            <th>Draft</th>
                            <th>In Review</th>
                            <th>In Approval</th>
                            <th>Approved</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {location?.entityGroupedCount?.map((entity: any) => (
                            <tr key={entity?.entityId}>
                              <td>{entity.entityName}</td>
                              <td>{entity.DRAFT || 0}</td>
                              <td>{entity.IN_REVIEW || 0}</td>
                              <td>{entity.IN_APPROVAL || 0}</td>
                              <td>{entity.APPROVED || 0}</td>
                              <td>{entity.total || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AspectImpactConsolidatedTableChart;
