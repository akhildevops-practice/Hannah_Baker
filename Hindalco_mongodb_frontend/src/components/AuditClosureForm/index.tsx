import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Paper,
  Typography,
  Grid,
  TextField,
  Box,
  CircularProgress,
  Tooltip,
  Fab,
  IconButton,
} from "@material-ui/core";
import Popper, { PopperPlacementType } from "@material-ui/core/Popper";
import { ClickAwayListener } from "@material-ui/core";
import Fade from "@material-ui/core/Fade";
import Rating from "../Rating";
import { useSnackbar } from "notistack";
import AuditClosureTable from "../EditableTable/AuditClosureTable";
import { useParams } from "react-router-dom";
import AddIcon from "@material-ui/icons/Add";
import InboxIcon from "@material-ui/icons/Inbox";
import { useStyles } from "./styles";
import {
  auditRating,
  checkRatePermissions,
  fetchAuditRating,
  getAuditById,
} from "../../apis/auditApi";
import getUserId from "../../utils/getUserId";
import { useRecoilState } from "recoil";
import { auditCreationForm, auditFormData } from "recoil/atom";
import CommentsEditor from "./CommentsEditor";
import { Col, Form, Input, Row, UploadProps, Upload } from "antd";
import DeleteIcon from "@material-ui/icons/Delete";
import axios from "apis/axios.global";
import { generateUniqueId } from "utils/uniqueIdGenerator";
import checkRole from "utils/checkRoles";
import TextArea from "antd/es/input/TextArea";
import { API_LINK } from "config";
import TouchAppIcon from "@material-ui/icons/TouchApp";
import { Tour, TourProps } from "antd";
const { Dragger } = Upload;

interface ratingForm {
  rating: number;
  comment: string;
}

type Props = {
  disabled: boolean;
  refForReportForm28?: any;
};

const AuditClosureForm = ({ disabled, refForReportForm28 }: Props) => {
  const [ratingValues, setRatingValues] = React.useState<ratingForm>({
    rating: 0,
    comment: "",
  });
  const [canRate, setCanRate] = React.useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [open, setOpen] = React.useState(false);
  const [placement, setPlacement] = React.useState<PopperPlacementType>();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const classes = useStyles();
  const userId: any = getUserId();
  const [isFetching, setIsFetching] = React.useState(true);
  const [template, setTemplate] = useRecoilState<any>(auditCreationForm);
  const [formData, setFormData] = useRecoilState<any>(auditFormData);
  const [fileList, setFileList] = useState<any>([]);
  const [richComment, setRichComment] = useState<any>("");

  const isMr = checkRole("MR");
  useEffect(() => {
    setFormData({ ...formData, comment: richComment });
  }, [richComment]);

  useEffect(() => {
    // console.log("check comment and files-->", template);
    if (!!formData?.comment) {
      setRichComment(formData?.comment);
    }
  }, [formData]);

  // useEffect(() => {
  //   console.log("check formData in closure form", formData);
  // }, [formData]);

  const handleDeleteFile = async (url: string) => {
    try {
      // Filter out the deleted URL from formData.urls
      const updatedUrls = formData.urls.filter((item: any) => item.uid !== url);

      setFormData((prevFormData: any) => ({
        ...prevFormData,
        urls: updatedUrls,
      }));
    } catch (error) {
      console.log("error in deleting file", error);
    }
  };

  const uploadProps: UploadProps = {
    multiple: true,
    beforeUpload: () => false,
    fileList: formData?.files || [],
    onRemove: (file) => {
      const updatedFileList = formData.files.filter(
        (item: any) => item.uid !== file.uid
      );
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        urls: updatedFileList,
      }));
    },
    onChange({ file, fileList }) {
      if (
        file.status !== "uploading" &&
        file.status !== "removed" &&
        file.status !== "error"
      ) {
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          urls: fileList,
        }));
      }
    },
  };

  /**
   * @method closePopper
   * @description Function to close popper
   * @returns nothing
   */
  const closePopper = () => {
    setOpen(false);
  };

  /**
   * @method ratingFormSubmit
   * @description Function to submit the rating along with the comments
   * @param event {React.FormEvent}
   * @returns nothing
   */
  const ratingFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await auditRating(
      `${id}`,
      userId,
      ratingValues.rating,
      ratingValues.comment
    );
    closePopper();
    enqueueSnackbar("Rating submitted successfully", {
      variant: "success",
    });
  };

  /**
   * @method ratingHandler
   * @description Function to handle rating component changes
   * @param event {React.ChangeEvent<{value: unknown}>}
   * @returns nothing
   */
  const ratingHandler = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRatingValues({ ...ratingValues, rating: event.target.value as number });
  };

  /**
   * @method ratingCommentHandler
   * @description Function to handle comment field changes
   * @param event {React.ChangeEvent<{value: unknown}>}
   */
  const ratingCommentHandler = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setRatingValues({ ...ratingValues, comment: event.target.value as string });
  };

  /**
   * @method handleClick
   * @description Function to open rating popper
   * @param newPlacement {PopperPlacementType}
   * @param event {React.MouseEvent<HTMLButtonElement>}
   * @returns nothing
   */

  const handleClick =
    (newPlacement: PopperPlacementType) =>
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
      setOpen((prev) => placement !== newPlacement || !prev);
      setPlacement(newPlacement);
    };

  const addNewNcObject = () => {
    const newNcObject = {
      nc: {
        type: "-",
        comment: "",
        findingTypeId: "",
        added: true,
        clause: [],
        attachment:[],
        statusClause: true,
      },
      _id: generateUniqueId(24),
      id: generateUniqueId(10),
      title: "",
      inputType: "text",
      questionScore: 0,
      required: true,
      allowImageUpload: true,
      value: "",
      hint: "",
      slider: false,
      open: false,
      image: "image url",
      imageName: "",
      // createdAt: "2023-08-08T00:00:00.000Z",
      // updatedAt: "2023-08-08T00:00:00.000Z",
      __v: 0,
    };
    setTemplate((prev: any) => {
      let copyData = JSON?.parse(JSON?.stringify(prev));
      if (copyData?.length > 0) {
        copyData[copyData.length - 1]?.sections[0]?.fieldset?.push(newNcObject);
        return copyData;
      } else {
        enqueueSnackbar("Add atleast 1 questions to add additional questions", {
          variant: "warning",
        });
        return copyData;
      }
    });
  };

  /**
   * @method checkRatingPermission
   * @description Function to check whether current user has rating permission or not
   * @returns nothing
   */
  const checkRatingPermission = () => {
    id &&
      checkRatePermissions(id!, {
        userId: userId,
      }).then((response: any) => {
        setCanRate(response?.data);
      });
  };

  /**
   * @method fetchRating
   * @param audId
   * @description Function to fetch rating for the current user and set rating values
   * @returns nothing
   */
  const fetchRating = async (audId: string) => {
    setIsFetching(true);
    const res = await fetchAuditRating(id!, audId);
    setRatingValues({
      rating: res?.rating,
      comment: res?.comment,
    });
    setIsFetching(false);
  };

  async function getAuditId() {
    const res = await getAuditById(id!);
    res.success && fetchRating(res?.respond?.auditors[0]?.id);
  }

  React.useEffect(() => {
    checkRatingPermission();
    getAuditId();
  }, []);

  const viewObjectStorageDoc = async (link: any) => {
    const response = await axios.post(`${API_LINK}/api/documents/viewerOBJ`, {
      documentLink: link,
    });
    return response.data;
  };

  const handleLinkClick = async (item: any) => {
    const finalLink =
      process.env.REACT_APP_IS_OBJECT_STORAGE === "false"
        ? item?.url
        : await viewObjectStorageDoc(item?.url);
    const anchor = document.createElement("a");
    anchor.href = finalLink || "#";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
    // Your custom logic for link click goes here
    // event.preventDefault();
  };

  const refForReportForm21 = useRef(null);
  const refForReportForm22 = useRef(null);
  const refForReportForm23 = useRef(null);
  const refForReportForm24 = useRef(null);
  const refForReportForm25 = useRef(null);
  const refForReportForm26 = useRef(null);
  const refForReportForm27 = useRef(null);
  // const refForReportForm28 = useRef(null);

  const [openTourForReportFormS1, setOpenTourForReportFormS1] =
    useState<boolean>(false);

  const stepsForReportFormS1: TourProps["steps"] = [
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm21.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm22.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm23.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm24.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm25.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm26.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm27.current,
    },
    {
      title: "Submit",
      description:
        "Submit & inform will inform coordinators or unit or department heads of the planned audits vis email",
      target: () => refForReportForm28.current,
    },
  ];

  return (
    <>
      <div className={classes.scroll}>
        <Paper elevation={0} className={classes.root}>
          <Typography align="center" className={classes.title}>
            Audit Summary
          </Typography>
          {/* <div
            // style={{ position: "fixed", top: "77px", right: "120px" }}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "end",
              position: "relative",
              top: "-30px",
              right:"13px",
            }}
          >
            <TouchAppIcon
              style={{ cursor: "pointer" }}
              onClick={() => {
                setOpenTourForReportFormS1(true);
              }}
            />
          </div> */}
          <Grid container justify="flex-end">
            <Grid item>
              {template ? (
                <Tooltip title="New Issues">
                  <Fab
                    size="medium"
                    onClick={addNewNcObject}
                    // disabled={!template}
                    disabled={disabled}
                    ref={refForReportForm21}
                  >
                    <AddIcon />
                  </Fab>
                </Tooltip>
              ) : (
                <Tooltip title="Please select CheckList">
                  <Fab
                    size="medium"
                    onClick={addNewNcObject}
                    // disabled={!template}
                    disabled={disabled}
                  >
                    <AddIcon />
                  </Fab>
                </Tooltip>
              )}
            </Grid>
          </Grid>
          <div className={classes.tableSection}>
            <div className={classes.table}>
              <AuditClosureTable
                disabled={disabled}
                refForReportForm22={refForReportForm22}
                refForReportForm23={refForReportForm23}
                refForReportForm24={refForReportForm24}
              />
              {isMr && id && (
                <div className={classes.ratingButtonWrapper}>
                  <ClickAwayListener onClickAway={closePopper}>
                    <div>
                      <Popper
                        open={open}
                        anchorEl={anchorEl}
                        placement={placement}
                        transition
                      >
                        {({ TransitionProps }) => (
                          <Fade {...TransitionProps} timeout={0}>
                            <Paper className={classes.popperContainer}>
                              {isFetching ? (
                                <Box
                                  width={350}
                                  height={150}
                                  display="flex"
                                  justifyContent="center"
                                  alignItems="center"
                                >
                                  <CircularProgress />
                                </Box>
                              ) : (
                                <form onSubmit={ratingFormSubmit}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} sm={12} md={4}>
                                      <Typography variant="body2">
                                        Rate Auditor
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={8}>
                                      <Rating
                                        name="rate-auditors"
                                        value={ratingValues.rating}
                                        onChange={ratingHandler}
                                        readOnly={false}
                                        size="medium"
                                      />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={4}>
                                      <Box
                                        display="flex"
                                        alignItems="center"
                                        height="100%"
                                      >
                                        <Typography variant="body2">
                                          Review Auditor
                                        </Typography>
                                      </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={8}>
                                      <TextField
                                        type="text"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        multiline
                                        value={ratingValues.comment}
                                        onChange={ratingCommentHandler}
                                      />
                                    </Grid>
                                    <Button
                                      className={classes.submitButton}
                                      size="small"
                                      type="submit"
                                    >
                                      Submit
                                    </Button>
                                  </Grid>
                                </form>
                              )}
                            </Paper>
                          </Fade>
                        )}
                      </Popper>
                      {/* <Button
                        data-testid="form-stepper-back-button"
                        onClick={handleClick("bottom")}
                        className={classes.ratingButton}
                        size="small"
                      >
                        Rate Auditor
                      </Button> */}
                    </div>
                  </ClickAwayListener>
                </div>
              )}
            </div>
          </div>
          {/* <Row
            gutter={[16, 16]}
            style={{ marginLeft: "12px", marginRight: "12px" }}
          >
            <Col span={24}>
              <div ref={refForReportForm25}>
                <Typography variant="body2" style={{ margin: "2px" }}>
                  Good Practices :{" "}
                </Typography>
                <TextArea
                  rows={1}
                  autoSize={{ minRows: 1, maxRows: 6 }}
                  placeholder="Good Practices"
                  size="large"
                  name="goodpractices"
                  style={{ fontSize: "14px" }}
                  onChange={(e: any) => {
                    setFormData({
                      ...formData,
                      ["goodPractices"]: e.target.value,
                    });
                  }}
                  value={formData?.goodPractices}
                />
              </div>
            </Col>
          </Row> */}
          <Row
            gutter={[16, 16]}
            style={{ marginLeft: "12px", marginRight: "12px" }}
          >
            <Col span={24}>
              <div ref={refForReportForm26}>
                <Typography variant="body2" style={{ margin: "2px" }}>
                  Audit Report Comments :{" "}
                </Typography>

                <CommentsEditor
                  comment={richComment}
                  setComment={setRichComment}
                  disabled={disabled}
                />
              </div>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ margin: "12px" }}>
            <Col span={24}>
              <div ref={refForReportForm27}>
                <Typography variant="body2" style={{ marginBottom: "8px" }}>
                  Attach Files:
                </Typography>
                <Form.Item name="uploader" style={{ display: "none" }}>
                  <Input />
                </Form.Item>
                <Dragger name="files" {...uploadProps} disabled={disabled}>
                  <div style={{ textAlign: "center" }}>
                    <InboxIcon style={{ fontSize: "36px" }} />
                    <p className="ant-upload-text">
                      Click or drag files here to upload
                    </p>
                  </div>
                </Dragger>
                {!!formData?.urls && !!formData?.urls?.length && (
                  <div>
                    <Typography
                      variant="body2"
                      style={{ marginTop: "16px", marginBottom: "8px" }}
                    >
                      Uploaded Files:
                    </Typography>
                    {formData?.urls?.map((item: any, index: number) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <Typography
                          className={classes.filename}
                          onClick={() => handleLinkClick(item)}
                        >
                          {/* File {index + 1} */}
                          {item.name}
                        </Typography>
                        <div
                          style={{ cursor: "pointer", marginRight: "8px" }}
                          onClick={() => handleDeleteFile(item.uid)}
                        >
                          <DeleteIcon style={{ fontSize: "18px" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Paper>
      </div>

      <Tour
        open={openTourForReportFormS1}
        onClose={() => setOpenTourForReportFormS1(false)}
        steps={stepsForReportFormS1}
      />
    </>
  );
};

export default AuditClosureForm;
