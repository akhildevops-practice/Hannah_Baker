import { CircularProgress, Grid, Theme, makeStyles } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import ViewDocMobile from "containers/ViewDocMobile";
import ViewDocNormal from "containers/ViewDocNormal";
import DocumentViewer from "components/Document/DocumentTable/DocumentViewDrawer/DocumentViewer";
import { useRecoilState, useRecoilValue } from "recoil";
import { drawerData, mobileView } from "recoil/atom";
import ProcessDocFormWrapper from "containers/ProcessDocFormWrapper";
import axios from "apis/axios.global";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";
import {
  referenceDocumentsTableHeader,
  workflowHistoryTableHeader,
  versionHistoryTableHeader,
  versionHistoryTableFields,
  workflowHistoryTableFields,
  referenceDocumentsTableFields,
  attachmentHistoryTableHeader,
  attachmentHistoryTableFields,
} from "./constants";
import { Button, Modal } from "antd";
import getAppUrl from "utils/getAppUrl";
// import getUserId from "utils/getUserId";
import InboxDocumentDrawer from "pages/CustomInbox/EditDocumentDrawer";
import { matches } from "lodash";
import { useMediaQuery } from "@material-ui/core";
import DocumentDrawer from "components/Document/DocumentTable/DocumentDrawer";

const DocStateIdentifier: any = {
  "Send for Edit": "SEND_FOR_EDIT",
  "Review Complete": "IN_APPROVAL",
  Approve: "PUBLISHED",
  Publish: "PUBLISHED",
  "Send for Review": "IN_REVIEW",
  "Save as Draft": "DRAFT",
  Amend: "AMMEND",
  "Send for Approval": "IN_APPROVAL",
};

type Props = {
  id?: string;
  setId?: React.Dispatch<React.SetStateAction<string>>;
  reloadList?: any;
  name?: string;
  // docState? :string
  modal2Open: any;
  setModal2Open: any;
};

const useStyles = makeStyles((theme: Theme) => ({
  labelContainer: {
    display: "flex",
    alignItems: "center",
    marginRight: "16px",
  },
  labelStyle: {
    // paddingRight: "60px",
    width: "100px",
    whiteSpace: "normal",
    color: "gray",
  },

  rowStyle: {
    padding: "3px",
  },
  colWrapper: {
    display: "flex",
    alignItems: "center",
  },
  iconWrapper: {
    padding: "2px",
    fill: "gray",
    width: "0.85em",
    height: "0.85em",
  },
  iconStyle: {
    padding: "2px",
    fill: "gray",
    width: "1em",
    height: "1em",
  },
  tabsWrapper: {
    "& .ant-tabs .ant-tabs-tab": {
      // padding: "14px 9px",
      backgroundColor: "#F3F6F8",
      color: "#0E497A",
      fontSize: "14px",
      fontWeight: 600,
      letterSpacing: "0.8px",
    },
    "& .ant-tabs-tab-active": {
      // padding: "14px 9px",
      backgroundColor: "#006EAD !important",
      color: "#fff !important",
      fontSize: "14px",
      fontWeight: 600,
      letterSpacing: "0.8px",
    },
    "& .ant-tabs-tab-active div": {
      color: "white !important",
      fontWeight: 600,
      fontSize: "14px",
      letterSpacing: "0.8px",
    },
    "& .ant-tabs .ant-tabs-tab+.ant-tabs-tab": {
      margin: "0 0 0 25px",
    },
  },
  alternateRowColor1: {
    backgroundColor: "#ffffff", // change as per your need
  },
  alternateRowColor2: {
    backgroundColor: "#f7f7f7", // change as per your need
  },
  tableWrapper: {
    // width: "30%",
    // "& .ant-table-wrapper": {
    //   width: "30%",
    // },
    paddingLeft: "10px",
    "& .ant-table-wrapper .ant-table-thead>tr>th": {
      padding: "8px 16px",
      fontWeight: 600,
      fontSize: "13px",
      background: "#E8F3F9",
    },
    "& .ant-table-body": {
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "10px", // Adjust the height value as needed
        backgroundColor: "#e5e4e2",
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: "10px",
        backgroundColor: "grey",
      },
    },
  },
}));

function DocumentRead({
  id = "",
  name,
  reloadList,
  modal2Open,
  setModal2Open,
}: Props) {
  const mobView = useRecoilValue(mobileView);
  const [formData, setFormData] = React.useState<any>();
  const [options, setOptions] = React.useState<any>();
  const [favorite, setFavorite] = React.useState<boolean>(false);
  const [rerender, setRerender] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [commentsLoader, setCommentsLoader] = React.useState(false);
  const [comments, setComments] = React.useState<any>([]);
  const [renderedFrom, setRenderedFrom] = useState<string>("");
  const [reloadId, setReloadId] = useState<boolean>(false);
  const [openModalForComment, setopenModalForComment] = useState(false);

  const matches = useMediaQuery("(min-width:786px)");

  const realm = getAppUrl();
  let params = useParams();
  let paramArg: string = params.id!;
  let navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  let realmName = getAppUrl();
  const location = useLocation();
  let queryParams = new URLSearchParams(location.search);
  const versionId = queryParams.get("versionId");
  let version = queryParams.get("version") ? true : false;
  const [docId, setDocId] = useState<string>(id ? id : paramArg);
  const classes = useStyles();
  const [commentDrawer, setCommentDrawer] = useState<any>({
    open: false,
    data: {},
  });
  const [drawer, setDrawer] = useState<any>({
    mode: "create",
    open: false,
    clearFields: true,
    toggle: false,
    data: {},
  });

  const [drawerDataState, setDrawerDataState] = useRecoilState(drawerData);
  const [buttonStatus, setButtonStatus] = useState(false);

  const userDetails = JSON.parse(sessionStorage.getItem("userDetails") as any);

  // const [reloadId, setReloadId] = useState<boolean>(false);
  // Know where the request is from, if its /inbox or /processdocuemnts

  const handlerButtonStatus = () => {
    if (buttonStatus === true) {
      setButtonStatus(false);
    } else {
      setButtonStatus(true);
    }
  };

  useEffect(() => {
    if (location.state && location.state.drawerOpenEditMode) {
      // Open the drawer
      setDrawer({
        ...drawer,
        open: !drawer.open,
        mode: "edit",
        toggle: true,
        clearFields: false,
        data: { ...drawer?.data, id: drawerDataState?.id },
      });
    }
  }, [location]);

  useEffect(() => {
    if (location.pathname.toLowerCase().includes("/inbox")) {
      setRenderedFrom("inbox");
      setDocId(id);
    } else if (
      location.pathname
        .toLowerCase()
        .includes("/processdocuments/processdocument/viewprocessdocument")
    ) {
      setRenderedFrom("process");
      setDocId(paramArg);
    } else if (
      location.pathname.toLowerCase().includes("/processdocuments/viewdoc")
    ) {
      setRenderedFrom("process");
      setDocId(paramArg);
    }
  }, [location, id, params]);

  const handleCommentSubmit = async (value: string) => {
    setCommentsLoader(true);
    if (value) {
      try {
        let res = await axios.post("/api/documents/createComment", {
          documentId: docId,
          commentText: value,
        });
        setCommentsLoader(false);
        enqueueSnackbar(`Comment Added Successfully`, { variant: "success" });
        getComments();
      } catch (err: any) {
        enqueueSnackbar(`Request Failed, Code: ${err.response.status}`, {
          variant: "success",
        });
        setCommentsLoader(false);
      }
    } else {
      enqueueSnackbar(`Enter a comment`, { variant: "warning" });
    }
  };
  const getComments = async () => {
    setCommentsLoader(true);
    try {
      let res: any = version
        ? await axios.get(
            `/api/documents/getCommentsForDocument/${docId}?version=true`
          )
        : await axios.get(`/api/documents/getCommentsForDocument/${docId}`);
      setComments(res.data);
      setCommentsLoader(false);
    } catch (err) {
      enqueueSnackbar(
        `Could not get Comments, Check your internet connection`,
        { variant: "error" }
      );
      setCommentsLoader(false);
    }
  };

  const openVersionDoc = (id: any) => {
    navigate(
      `/processdocuments/processdocument/viewprocessdocument/${id}?version=true`
    );
  };

  const getDocData = async () => {
    try {
      setIsLoading(true);
      let res = version
        ? await axios.get(
            `/api/documents/getSingleDocument/${docId}?version=true&versionId=${versionId}`
          )
        : await axios.get(
            `/api/documents/getSingleDocument/${docId}?versionId=${versionId}`
          );
      setFormData({
        ...res.data,
        documentLinkNew: res.data.documentLink,
        locationName: res.data.creatorLocation.locationName,
        status: res?.data?.documentState,
        sectionName: res?.data?.sectionName,
        systemNames: res?.data?.doctype.applicable_systems.filter((item: any) =>
          res?.data?.system.includes(item.id)
        ),

        entityName: res.data.creatorEntity.entityName,
        docType: res.data.doctype.documentTypeName,
        attachmentHistory: res.data?.attachmentHistory?.map((item: any) => ({
          updatedBy: item.updatedBy,
          attachment: item.attachment,
          updatedAt: item.updatedAt,
        })),
        DocumentWorkFlowHistory: res.data.DocumentWorkFlowHistory.map(
          (item: any) => ({
            ...item,
            actionName:
              item.actionName === "IN_REVIEW"
                ? "For Review"
                : item.actionName === "IN_APPROVAL"
                ? "For Approval"
                : item.actionName === "AMMEND"
                ? "Amend"
                : item.actionName === "DRAFT"
                ? "Draft"
                : item.actionName === "APPROVED"
                ? "Approved"
                : item.actionName === "PUBLISHED"
                ? "Published"
                : item.actionName === "REVIEW_COMPLETE"
                ? "Review Complete"
                : item.actionName === "SEND_FOR_EDIT"
                ? "Send For Edit"
                : item.actionName === "RETIRE_INREVIEW"
                ? "Retire In Review"
                : item.actionName === "RETIRE_INAPPROVE"
                ? "Retire In Approve"
                : item.actionName === "RETIRE"
                ? "Retire"
                : "N/A",
            createdAt: new Date(item.createdAt).toDateString(),
          })
        ),
        DocumentVersions: res.data.DocumentVersions.map((item: any) => ({
          ...item,
          approvedDate: new Date(item?.approvedDate).toDateString(),
          versionLink: (
            <div
              onClick={() => {
                openVersionDoc(item.id);
              }}
              style={{ textDecoration: "underline", cursor: "pointer" }}
            >
              Link
            </div>
          ),
        })),
        ReferenceDocuments: res.data.ReferenceDocuments.map((item: any) => ({
          ...item,
          documentLink: (
            <a
              href={`http://${realmName}.${process.env.REACT_APP_REDIRECT_URL}/processdocuments/processdocument/viewprocessdocument/${item.refId}`}
              target="_blank"
              rel="noreferrer"
            >
              Link
            </a>
          ),
        })),
      });
      setIsLoading(false);
    } catch (err) {
      console.log("err inside 0", err);
      enqueueSnackbar(`Could not get Data, Check your internet connection`, {
        variant: "error",
      });
      setIsLoading(false);
    }
  };
  const getFavorite = async () => {
    // let userId = getUserId();
    const userId = userDetails?.id;
    await axios(`/api/favorites/checkFavorite/${userId}/${docId}`)
      .then((res) => setFavorite(res.data))
      .catch((err) => console.error(err));
  };

  const handleEditDocument = (data: any = {}) => {
    setDrawer({
      ...drawer,
      mode: "edit",
      clearFields: false,
      toggle: false,
      data: {
        id: docId,
      },
      open: !drawer.open,
    });
  };

  const getUserOptions = async () => {
    try {
      setIsLoading(true);
      let res = await axios.get(`/api/documents/checkUserPermissions/${docId}`);
      setOptions(res.data);
      // setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const handleFavorite = async () => {
    // let userId = getUserId();
    const userId = userDetails?.id;
    await axios
      .put(`/api/favorites/updateFavorite/${userId}`, {
        targetObjectId: docId,
      })
      .then((res) => {
        getFavorite();
      })
      .catch((err) => console.error(err));
  };

  const handleSubmit = async (option: string, submit = false) => {
    // let userId = getUserId();
    const user: any = sessionStorage.getItem("userDetails");
    const userId = JSON.parse(user).id;
    if (DocStateIdentifier[option] === "SEND_FOR_EDIT" && !submit) {
      setopenModalForComment(true);
      // enqueueSnackbar(`Please Attach The File`, {
      //   variant: "warning",
      // });
      return;
    }
    try {
      setIsLoading(true);
      let res = await axios.post(
        `/api/documents/setStatus/${docId}?status=${DocStateIdentifier[option]}`
      );

      //Reload Inbox list if request is from path /inbox else navigate to /processdocument
      if (renderedFrom === "inbox") {
        reloadList(true);
      } else {
        navigate("/processdocuments/processdocument");
      }
      // socket?.emit("documentUpdated", {
      //   data: { id: docId },
      //   currentUser: `${userId}`,
      // });
      // setIsLoading(false);
      enqueueSnackbar(`${option} Successful`, { variant: "success" });
    } catch (err: any) {
      setIsLoading(false);
      console.log("errror in handle submit set status", err);

      enqueueSnackbar(`Request Failed ${err.response.status}`, {
        variant: "error",
      });
    }
  };

  React.useEffect(() => {
    !version && getUserOptions();
    getDocData();
    getComments();
    getFavorite();
  }, [docId]);

  const toggleCommentsDrawer = (data: any = {}) => {
    setCommentDrawer({
      ...commentDrawer,
      open: !commentDrawer.open,
      data: { ...data },
    });
  };

  return (
    <>
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          {formData && (
            <>
              {matches ? (
                <>
                  <Grid item xs={12} sm={6} md={6} style={{ zIndex: 0 }}>
                    <ProcessDocFormWrapper
                      parentPageLink="/processdocuments/processdocument"
                      handleSubmit={handleSubmit}
                      options={options}
                      disableBtnFor={["In Review", "In Approval", "Amend"]}
                      favorite={favorite}
                      handleFavorite={handleFavorite}
                      handleEditDocument={handleEditDocument}
                      name={name}
                      formData={formData}
                      openModalForComment={openModalForComment}
                      setopenModalForComment={setopenModalForComment}
                      handleCommentSubmit={handleCommentSubmit}
                      // docState={docState}
                    >
                      {matches ? (
                        <DocumentViewer fileLink={formData.documentLinkNew} />
                      ) : (
                        ""
                      )}
                    </ProcessDocFormWrapper>
                  </Grid>
                </>
              ) : (
                <></>
              )}
              <Grid item xs={12} sm={4} md={4}>
                {mobView ? (
                  <>
                    <ViewDocMobile
                      handleCommentSubmit={handleCommentSubmit}
                      versionHistoryTableHeader={versionHistoryTableHeader}
                      referenceDocumentsTableHeader={
                        referenceDocumentsTableHeader
                      }
                      workflowHistoryTableHeader={workflowHistoryTableHeader}
                      versionHistoryTableFields={versionHistoryTableFields}
                      workflowHistoryTableFields={workflowHistoryTableFields}
                      attachmentHistoryTableHeader={
                        attachmentHistoryTableHeader
                      }
                      attachmentHistoryTableFields={
                        attachmentHistoryTableFields
                      }
                      referenceDocumentsTableFields={
                        referenceDocumentsTableFields
                      }
                      formData={formData}
                      commentData={comments}
                      commentsLoader={commentsLoader}
                      version={version}
                    />
                  </>
                ) : (
                  <>
                    {matches ? (
                      <>
                        {" "}
                        <ViewDocNormal
                          handleCommentSubmit={handleCommentSubmit}
                          versionHistoryTableHeader={versionHistoryTableHeader}
                          referenceDocumentsTableHeader={
                            referenceDocumentsTableHeader
                          }
                          workflowHistoryTableHeader={
                            workflowHistoryTableHeader
                          }
                          versionHistoryTableFields={versionHistoryTableFields}
                          workflowHistoryTableFields={
                            workflowHistoryTableFields
                          }
                          attachmentHistoryTableHeader={
                            attachmentHistoryTableHeader
                          }
                          attachmentHistoryTableFields={
                            attachmentHistoryTableFields
                          }
                          referenceDocumentsTableFields={
                            referenceDocumentsTableFields
                          }
                          formData={formData}
                          commentData={comments}
                          commentsLoader={commentsLoader}
                          version={version}
                        />
                      </>
                    ) : (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            // paddingTop: "20px",
                          }}
                        ></div>
                        <Modal
                          title={name}
                          centered
                          open={modal2Open}
                          onOk={() => setModal2Open(false)}
                          onCancel={() => setModal2Open(false)}
                          footer={null}
                        >
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={6}
                            style={{ zIndex: 0 }}
                          >
                            <ProcessDocFormWrapper
                              parentPageLink="/processdocuments/processdocument"
                              handleSubmit={handleSubmit}
                              options={options}
                              disableBtnFor={[
                                "In Review",
                                "In Approval",
                                "Amend",
                              ]}
                              favorite={favorite}
                              handleFavorite={handleFavorite}
                              handleEditDocument={handleEditDocument}
                              name={name}
                              formData={formData}
                              openModalForComment={openModalForComment}
                              setopenModalForComment={setopenModalForComment}
                              handleCommentSubmit={handleCommentSubmit}
                              handlerButtonStatus={handlerButtonStatus}
                              // docState={docState}
                            >
                              {matches ? (
                                <DocumentViewer
                                  fileLink={formData.documentLinkNew}
                                />
                              ) : (
                                ""
                              )}
                            </ProcessDocFormWrapper>
                          </Grid>
                          <div style={{ paddingBottom: "10px" }}>
                            <DocumentViewer
                              fileLink={formData.documentLinkNew}
                            />
                          </div>
                          {buttonStatus && (
                            <div>
                              <ViewDocNormal
                                handleCommentSubmit={handleCommentSubmit}
                                versionHistoryTableHeader={
                                  versionHistoryTableHeader
                                }
                                referenceDocumentsTableHeader={
                                  referenceDocumentsTableHeader
                                }
                                workflowHistoryTableHeader={
                                  workflowHistoryTableHeader
                                }
                                versionHistoryTableFields={
                                  versionHistoryTableFields
                                }
                                workflowHistoryTableFields={
                                  workflowHistoryTableFields
                                }
                                attachmentHistoryTableHeader={
                                  attachmentHistoryTableHeader
                                }
                                attachmentHistoryTableFields={
                                  attachmentHistoryTableFields
                                }
                                referenceDocumentsTableFields={
                                  referenceDocumentsTableFields
                                }
                                formData={formData}
                                commentData={comments}
                                commentsLoader={commentsLoader}
                                version={version}
                              />
                            </div>
                          )}
                        </Modal>
                      </div>
                    )}
                  </>
                )}
              </Grid>
              <div>
                {!!drawer.open && (
                  //    <DocumentDrawer
                  //    drawer={drawer}
                  //    setDrawer={setDrawer}
                  //    handleFetchDocuments={reloadList}
                  //  />
                  <DocumentDrawer
                    drawer={drawer}
                    setDrawer={setDrawer}
                    handleFetchDocuments={reloadList}
                  />
                  // <InboxDocumentDrawer
                  //   drawer={drawer}
                  //   setDrawer={setDrawer}
                  //   reloadList={reloadList}
                  // />
                )}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export default DocumentRead;
