import React, { useEffect, useState } from "react";
import BorderColorIcon from "@material-ui/icons/BorderColor";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import { Tooltip, Typography } from "@material-ui/core";
import PencilIcon from "../../assets/icons/PencilIcon.svg";
import { ReactComponent as EditIcon } from "../../assets/documentControl/Edit.svg";

import { useNavigate } from "react-router";
import checkRole from "../../utils/checkRoles";
import CloseIconImageSvg from "assets/documentControl/Close.svg";

import { Modal, Table, Tag } from "antd";
import { ncSummaryObservationType, ncSummarySchema } from "schemas/ncSummary";
import { Link } from "react-router-dom";
import useStyles from "./styles";
import MultiUserDisplay from "components/MultiUserDisplay";
import { newRoles } from "utils/enums";
import axios from "apis/axios.global";
// import { userInfo } from "os";

interface Props {
  count: number;
  isDraft: boolean;
  id: number;
  auditorName?: [];
  auditLocation?: any;
}

/**
 * @method TableNcUtil
 * @description Functional component to generate the closure count as well as the draft icon
 * @param count {number}
 * @param isDraft {boolean}
 * @returns
 */
export default function TableNcUtil({
  count,
  isDraft,
  id,
  auditorName,
  auditLocation,
}: Props) {
  const navigate = useNavigate();
  const classes = useStyles();
  const isAuditor = checkRole("AUDITOR");
  const isOrgAdmin = checkRole("ORG-ADMIN");
  const isMR = checkRole("MR");
  const userInfo = JSON.parse(sessionStorage.getItem("userDetails") as string);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ncObsData, setNcObsData] = useState<ncSummarySchema[]>();

  const [isAccess, setIsAccess] = useState<boolean>(false);

  useEffect(() => {
    const auditors = auditorName?.map((item: any) => {
      return item.username;
    });
    if (
      isOrgAdmin ||
      (auditors?.includes(userInfo?.userName) && isAuditor) ||
      (isMR && auditLocation?.locationName === userInfo?.location?.locationName)
    ) {
      setIsAccess(true);
    }
  }, []);

  const getData = async () => {
    const data = await axios.get(`api/audits/getNcDataByAuditId/${id}`);
    const parsedData = dataParser(data?.data?.nc);
    setNcObsData(parsedData);
  };
  useEffect(() => {
    if (isModalVisible === true) {
      getData();
    }
  }, [isModalVisible]);

  const ncObsColumns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (ncObsId: any, record: any, index: any) => {
        if (index === 0) {
          return (
            <>
              <Link
                to={record.ncObsId.props.to}
                className="makeStyles-link-216"
                target="_blank"
              >
                {record.type}
              </Link>
            </>
          );
        }
        return (
          <>
            <Link
              to={record.ncObsId.props.to}
              className="makeStyles-link-216"
              target="_blank"
            >
              {record.type}
            </Link>
          </>
        );
      },
    },
    {
      title: "Findings",
      dataIndex: "ncObsId",
      key: "ncObsId",
      // render: (ncObsId: any) => (
      //   <Link to={ncObsId.props.to} className="makeStyles-link-216">
      //     {ncObsId.props.children}
      //   </Link>
      // ),
    },

    {
      title: "Department",
      dataIndex: "entity",
      key: "entity",
    },
    {
      title: "Audit Name",
      dataIndex: "auditName",
      key: "auditName",
    },
    {
      title: "System",
      dataIndex: "systemName",
      key: "systemName",
      render: (system: any) => <MultiUserDisplay data={system} name="name" />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_: any, record: any) => {
        if (record.status === "OPEN") {
          return (
            <Tag
              style={{ backgroundColor: "#c9e4de", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "ACCEPTED") {
          return (
            <Tag
              style={{ backgroundColor: "#c6def1", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "REJECTED") {
          return (
            <Tag
              style={{ backgroundColor: "#edcad1", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "VERIFIED") {
          return (
            <Tag
              style={{ backgroundColor: "#dbcdf0", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "CLOSED") {
          return (
            <Tag
              style={{ backgroundColor: "#f2c6de", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "AUDITORREVIEW") {
          return (
            <Tag
              // color="#b1d1ef"
              style={{ backgroundColor: "#b1d1ef", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else if (record.status === "IN_PROGRESS") {
          return (
            <Tag
              // color="#b1d1ef"
              style={{ backgroundColor: "#96EFFF", color: "black" }}
              key={record.status}
            >
              {record.status}
            </Tag>
          );
        } else return record.status;
      },
    },
    {
      title: "Pending With",
      dataIndex: "currentlyUnder",
      key: "currentlyUnder",
      render: (name: any) => newRoles[name],
    },
    {
      title: "Auditor",
      dataIndex: "auditor",
      key: "auditor",
      render: (auditor: any) => <MultiUserDisplay data={auditor} name="name" />,
    },
    {
      title: "Auditee",
      dataIndex: "auditees",
      key: "auditees",
      render: (auditees: any) => (
        <MultiUserDisplay data={auditees} name="name" />
      ),
    },
  ];
  const toggleLink = (
    type: ncSummaryObservationType,
    linkId: string,
    id: string
  ) => {
    // if (type === "NC") {
    return (
      <Link to={`/audit/nc/${linkId}`} className={classes.link} target="_blank">
        {id}
      </Link>
    );
    // }
    // return (
    //   <Link to={`/audit/obs/${linkId}`} className={classes.link}>
    //     {id}
    //   </Link>
    // );
  };

  const dataParser: any = (data: any) => {
    return data?.map((nc: any) => {
      const isUserAuditee = nc.auditees.some(
        (auditee: any) => auditee.id === userInfo?.id
      );
      const isUserInAuditedEntity = nc?.auditedEntityNew?.users?.some(
        (user: any) => user?.id === userInfo?.id
      );

      const auditors = nc?.auditors?.map((auditor: any) => ({
        name: auditor.firstname + " " + auditor.lastname,
      }));

      const auditees = nc?.auditees?.map((auditee: any) => ({
        name: auditee.firstname + " " + auditee.lastname,
      }));
      return {
        ncObsId: toggleLink(nc.type, nc._id, nc.id),
        id: nc._id,
        comment: nc.comment ?? "-",
        type: nc.type,
        entity: nc?.auditedEntityNew?.entityName,
        auditName: nc?.audit?.auditName || "",
        severity:
          nc.severity === "Major" ? (
            <>
              Major&nbsp;<span className={classes.red__exclamation}>!</span>
            </>
          ) : (
            nc.severity
          ),
        systemName: nc?.system,
        auditor: auditors,
        auditees: auditees,
        status: nc.status,
        access: nc.access,
        auditFindings: nc.auditFindings,
        isUserInAuditedEntity,
        isUserAuditee,
        currentlyUnder: nc?.currentlyUnder || "",
      };
    });
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={0}
        m={0}
      >
        <Tooltip title={isAccess ? "Open NC closure form" : `${count}NCs`}>
          <Typography
            variant="body2"
            color="primary"
            style={{ cursor: "pointer", paddingRight: "10px" }}
          >
            <u
              data-testid="click"
              onClick={() => {
                isDraft && isAccess
                  ? // isAccess &&
                    navigate(`/audit/auditreport/newaudit/${id}`, {
                      state: {
                        edit: true,
                        id: id,
                        moveToLast: true,
                        read: true,
                      },
                    })
                  : setIsModalVisible(true);
              }}
            >
              +{count}
            </u>
          </Typography>
        </Tooltip>

        {isDraft && isAccess && (
          <Tooltip
            title={
              isAccess ? "Open draft audit" : "You don't have access priviledge"
            }
          >
            <IconButton
              size="small"
              data-testid="auditorClick"
              onClick={() =>
                isAccess &&
                navigate(`/audit/auditreport/newaudit/${id}`, {
                  state: { edit: true, id: id, read: false },
                })
              }
            >
              {/* <img src={EditIcon} alt="Pencil Icon" /> */}
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Modal
        title="List of Findings"
        visible={isModalVisible}
        onOk={() => {
          setIsModalVisible(false);
        }}
        onCancel={() => {
          setIsModalVisible(false);
        }}
        footer={null}
        closeIcon={
          <img
            src={CloseIconImageSvg}
            alt="close-drawer"
            style={{ width: "36px", height: "38px", cursor: "pointer" }}
          />
        }
        width={2000} // Customize the width as needed
      >
        <Table
          dataSource={ncObsData}
          columns={ncObsColumns}
          className={classes.newTableContainer}
        />
      </Modal>
    </>
  );
}
