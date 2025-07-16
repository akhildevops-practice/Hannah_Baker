"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Grid,
  LinearProgress,
  Container,
  makeStyles,
  createStyles,
  type Theme,
  Tooltip,
  DialogContent,
  DialogActions,
  Dialog,
  ListItem,
  List,
  IconButton,
  DialogTitle,
  ListItemAvatar,
  ListItemText,
  Divider,
  TablePagination,
} from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import CloseIcon from "@material-ui/icons/Close";
import ReplyIcon from "@material-ui/icons/Reply";
import PersonIcon from "@material-ui/icons/Person";
import SupportIcon from "@material-ui/icons/HeadsetMic";
import {
  Refresh as RefreshIcon,
  GetApp as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ConfirmationNumber as TicketIcon,
  Today as CalendarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Web as WebIcon,
  Phone as PhoneIcon,
  Chat as ChatIcon,
  Build as BuildIcon,
  Send as SendIcon,
} from "@material-ui/icons";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import axios from "apis/axios.global";

interface FreshworksTicket {
  id: number;
  subject: string;
  description_text: string;
  status: number;
  priority: number;
  requester_id: number;
  responder_id: number;
  created_at: string;
  updated_at: string;
  type: string;
  source: number;
  tags: string[];
  requester_name: string;
  responder_name: string;
  company_name: string;
  category: string;
}

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#9c27b0",
      light: "#ba68c8",
      dark: "#7b1fa2",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    success: {
      main: "#4caf50",
      light: "#81c784",
      dark: "#388e3c",
    },
    warning: {
      main: "#ff9800",
      light: "#ffb74d",
      dark: "#f57c00",
    },
    error: {
      main: "#f44336",
      light: "#e57373",
      dark: "#d32f2f",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: "2.125rem",
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  overrides: {
    MuiCard: {
      root: {
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        borderRadius: 12,
      },
    },
    MuiButton: {
      root: {
        borderRadius: 8,
        textTransform: "none",
        fontWeight: 600,
      },
    },
    MuiChip: {
      root: {
        borderRadius: 6,
        fontWeight: 500,
      },
    },
  },
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minHeight: "100vh",
      backgroundColor: theme.palette.background.default,
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    headerContainer: {
      marginBottom: theme.spacing(4),
    },
    headerTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing(4),
      [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        alignItems: "flex-start",
        gap: theme.spacing(2),
      },
    },
    titleContainer: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(2),
    },
    gradientText: {
      background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      marginBottom: theme.spacing(1),
    },
    gradientAvatar: {
      background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
      width: 48,
      height: 48,
    },
    buttonContainer: {
      display: "flex",
      gap: theme.spacing(2),
      [theme.breakpoints.down("sm")]: {
        width: "100%",
        justifyContent: "stretch",
      },
    },
    statsCard: {
      height: "100%",
      color: "white",
    },
    openCard: {
      background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
    },
    pendingCard: {
      background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
    },
    resolvedCard: {
      background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
    },
    closedCard: {
      background: "linear-gradient(135deg, #9e9e9e 0%, #616161 100%)",
    },
    statsContent: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statsAvatar: {
      backgroundColor: "rgba(255,255,255,0.2)",
      width: 48,
      height: 48,
    },
    searchContainer: {
      display: "flex",
      gap: theme.spacing(2),
      marginBottom: theme.spacing(3),
      [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
      },
    },
    searchField: {
      flexGrow: 1,
    },
    tableCard: {
      boxShadow: theme.shadows[4],
    },
    tableHeader: {
      padding: theme.spacing(3),
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    stickyHeader: {
      "& th": {
        fontWeight: 600,
        backgroundColor: theme.palette.grey[50],
      },
    },
    tableRow: {
      "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
      },
      "&:hover": {
        backgroundColor: theme.palette.action.selected,
      },
    },
    urgentRow: {
      borderLeft: `4px solid ${theme.palette.error.main}`,
    },
    priorityDot: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      marginRight: theme.spacing(1),
    },
    ticketId: {
      display: "flex",
      alignItems: "center",
      fontFamily: "monospace",
      fontWeight: "bold",
    },
    ticketDetails: {
      "& > *": {
        marginBottom: theme.spacing(1),
      },
    },
    ticketSubject: {
      fontWeight: "bold",
      marginBottom: theme.spacing(0.5),
    },
    ticketDescription: {
      color: theme.palette.text.secondary,
      marginBottom: theme.spacing(1),
    },
    priorityChip: {
      fontWeight: 600,
    },
    customerInfo: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    customerAvatar: {
      width: 24,
      height: 24,
      fontSize: "0.75rem",
    },
    companyName: {
      marginLeft: theme.spacing(4),
      color: theme.palette.text.secondary,
      fontSize: "0.75rem",
    },
    timelineItem: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(0.5),
      marginBottom: theme.spacing(0.5),
      fontSize: "0.75rem",
      color: theme.palette.text.secondary,
    },
    tagsContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: theme.spacing(0.5),
    },
    footer: {
      marginTop: theme.spacing(4),
      textAlign: "center",
    },
    footerPaper: {
      display: "inline-flex",
      alignItems: "center",
      gap: theme.spacing(2),
      padding: theme.spacing(1.5, 3),
      borderRadius: 24,
    },
    divider: {
      height: 20,
      margin: theme.spacing(0, 1),
    },
  })
);

const statusConfig: any = {
  2: {
    label: "Open",
    color: "secondary" as const,
    icon: <WarningIcon fontSize="small" />,
  },
  3: {
    label: "Pending",
    color: "default" as const,
    icon: <ScheduleIcon fontSize="small" />,
  },
  4: {
    label: "Resolved",
    color: "primary" as const,
    icon: <CheckCircleIcon fontSize="small" />,
  },
  5: {
    label: "Closed",
    color: "default" as const,
    icon: <CancelIcon fontSize="small" />,
  },
};

const priorityConfig: any = {
  1: { label: "Low", color: "#4caf50", bgColor: "#e8f5e8" },
  2: { label: "Medium", color: "#ff9800", bgColor: "#fff3e0" },
  3: { label: "High", color: "#ff5722", bgColor: "#fce4ec" },
  4: { label: "Urgent", color: "#f44336", bgColor: "#ffebee" },
};

const sourceConfig: any = {
  1: { label: "Email", icon: <EmailIcon fontSize="small" /> },
  2: { label: "Portal", icon: <WebIcon fontSize="small" /> },
  3: { label: "Phone", icon: <PhoneIcon fontSize="small" /> },
  4: { label: "Chat", icon: <ChatIcon fontSize="small" /> },
  7: { label: "Widget", icon: <BuildIcon fontSize="small" /> },
  9: { label: "Outbound", icon: <SendIcon fontSize="small" /> },
};

// Mock data

export default function FreshworksTickets() {
  const classes = useStyles();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [conversations, setConversations] = useState([]);

  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0); // starts from 0
  const [rowsPerPage, setRowsPerPage] = useState(10);
  //   const [mockTickets,setMockTickets] = useState<FreshworksTicket[]>([])

  useEffect(() => {
    fetchData();
    // setTickets(mockTickets)
  }, []);

  const fetchData = async () => {
    const res = await axios.get(
      `/api/organization/getFreshWorksData?id=${searchTerm}`
    );
    setTickets(res?.data || []);
  };

  const handleTicketClick = (ticket: FreshworksTicket) => {
    setSelectedTicket(ticket);
    fetchTicketMessage(ticket);
    // setConversations(mockConversations[ticket.id] || [])
    // setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTicket(null);
    setConversations([]);
  };

  //   const refreshTickets = () => {
  //     setLoading(true)
  //     setTimeout(() => {
  //       setTickets(mockTickets)
  //       setLoading(false)
  //     }, 1000)
  //   }

  const fetchTicketMessage = async (dataTicket: any) => {
    const res = await axios.get(
      `api/organization/getTicketMessages/${dataTicket?.id}`
    );
    setConversations(res?.data || []);
    setDialogOpen(true);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text?.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const filteredTickets = tickets;

  const getStatusCounts = () => {
    const counts = { open: 0, pending: 0, resolved: 0, closed: 0 };
    tickets.forEach((ticket: any) => {
      switch (ticket.status) {
        case 2:
          counts.open++;
          break;
        case 3:
          counts.pending++;
          break;
        case 4:
          counts.resolved++;
          break;
        case 5:
          counts.closed++;
          break;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    const newSize = parseInt(event.target.value, 10);
    setRowsPerPage(newSize);
    setPage(0); // reset to first page
  };

  const getStringToColor = (string: string) => {
    let hash = 0;
    let i;
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={classes.root}>
        <Container maxWidth="xl">
          {/* Header Section */}
          <Box className={classes.headerContainer}>
            <Box className={classes.headerTop}>
              <Box>
                <Box className={classes.titleContainer}>
                  <Avatar className={classes.gradientAvatar}>
                    <TicketIcon />
                  </Avatar>
                  <Typography
                    variant="h4"
                    component="h1"
                    className={classes.gradientText}
                  >
                    Tickets
                  </Typography>
                </Box>
                <Typography variant="subtitle1" color="textSecondary">
                  Comprehensive ticket management dashboard
                </Typography>
              </Box>
              {/* <Box className={classes.buttonContainer}>
                <Button
                  variant="outlined"
                  startIcon={loading ? <LinearProgress size={20} /> : <RefreshIcon />}
                  onClick={refreshTickets}
                  disabled={loading}
                >
                  Refresh
                </Button>
                <Button variant="contained" color="primary" startIcon={<DownloadIcon />}>
                  Export
                </Button>
              </Box> */}
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} style={{ marginBottom: 32 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card className={`${classes.statsCard} ${classes.openCard}`}>
                  <CardContent>
                    <Box className={classes.statsContent}>
                      <Box>
                        <Typography
                          variant="body2"
                          style={{ opacity: 0.8, marginBottom: 8 }}
                        >
                          Open Tickets
                        </Typography>
                        <Typography variant="h4" style={{ fontWeight: "bold" }}>
                          {statusCounts.open}
                        </Typography>
                      </Box>
                      <Avatar className={classes.statsAvatar}>
                        <WarningIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card className={`${classes.statsCard} ${classes.pendingCard}`}>
                  <CardContent>
                    <Box className={classes.statsContent}>
                      <Box>
                        <Typography
                          variant="body2"
                          style={{ opacity: 0.8, marginBottom: 8 }}
                        >
                          Pending
                        </Typography>
                        <Typography variant="h4" style={{ fontWeight: "bold" }}>
                          {statusCounts.pending}
                        </Typography>
                      </Box>
                      <Avatar className={classes.statsAvatar}>
                        <ScheduleIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  className={`${classes.statsCard} ${classes.resolvedCard}`}
                >
                  <CardContent>
                    <Box className={classes.statsContent}>
                      <Box>
                        <Typography
                          variant="body2"
                          style={{ opacity: 0.8, marginBottom: 8 }}
                        >
                          Resolved
                        </Typography>
                        <Typography variant="h4" style={{ fontWeight: "bold" }}>
                          {statusCounts.resolved}
                        </Typography>
                      </Box>
                      <Avatar className={classes.statsAvatar}>
                        <CheckCircleIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card className={`${classes.statsCard} ${classes.closedCard}`}>
                  <CardContent>
                    <Box className={classes.statsContent}>
                      <Box>
                        <Typography
                          variant="body2"
                          style={{ opacity: 0.8, marginBottom: 8 }}
                        >
                          Closed
                        </Typography>
                        <Typography variant="h4" style={{ fontWeight: "bold" }}>
                          {statusCounts.closed}
                        </Typography>
                      </Box>
                      <Avatar className={classes.statsAvatar}>
                        <CancelIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Demo Alert */}
            {/* <Alert severity="info" style={{ marginBottom: 24 }}>
              <AlertTitle>Demo Mode</AlertTitle>
              This is sample data showing how your Freshworks tickets will be displayed. Connect your real API to see
              live data.
            </Alert> */}

            {/* Search and Filters */}
            <Box className={classes.searchContainer}>
              <TextField
                className={classes.searchField}
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          fetchData();
                        }}
                        edge="end"
                      >
                        <SearchIcon color="action" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>

          {/* Main Table */}
          <Card className={classes.tableCard}>
            <Box className={classes.tableHeader}>
              <Typography variant="h6" component="h2" gutterBottom>
                Tickets Overview
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Showing {filteredTickets.length} of {tickets.length} tickets
              </Typography>
            </Box>

            {loading && <LinearProgress />}

            <TableContainer>
              <Table stickyHeader className={classes.stickyHeader}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell style={{ minWidth: 300 }}>
                      Ticket Details
                    </TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    {/* <TableCell>Type & Source</TableCell> */}
                    <TableCell>Module</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>Created At</TableCell>
                    {/* <TableCell>Tags</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTickets.map((ticket: any, index) => (
                    <TableRow
                      key={ticket.id}
                      className={`${classes.tableRow} ${
                        ticket.priority === 4 ? classes.urgentRow : ""
                      }`}
                    >
                      <TableCell>
                        <Box
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8, // 1 spacing unit = 8px in MUI
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor:
                                priorityConfig[ticket.priority]?.color ||
                                "grey.400",
                            }}
                          />
                          <Tooltip title="Click to view conversations">
                            <Button
                              variant="text"
                              size="small"
                              onClick={() => handleTicketClick(ticket)}
                              style={{
                                fontFamily: "monospace",
                                fontWeight: "bold",
                                minWidth: "auto",
                                padding: theme.spacing(0.5),
                                color: theme.palette.primary.main,
                                backgroundColor: "transparent",
                              }}
                              // onMouseOver={(e) => {
                              //   e.currentTarget.style.backgroundColor =
                              //     theme.palette.primary[50] || theme.palette.action.hover;
                              // }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }}
                            >
                              {ticket.id}
                            </Button>
                          </Tooltip>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box className={classes.ticketDetails}>
                          <Typography
                            variant="subtitle2"
                            className={classes.ticketSubject}
                          >
                            {truncateText(ticket.subject, 60)}
                          </Typography>
                          <Typography
                            variant="body2"
                            className={classes.ticketDescription}
                          >
                            {truncateText(ticket.description_text, 100)}
                          </Typography>
                          {/* <Chip
                            label={ticket.category}
                            size="small"
                            variant="outlined"
                          /> */}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            statusConfig[ticket.status]?.label || "Unknown"
                          }
                          color={
                            statusConfig[ticket.status]?.color || "default"
                          }
                          icon={statusConfig[ticket.status]?.icon}
                          variant="default"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            priorityConfig[ticket.priority]?.label || "Unknown"
                          }
                          className={classes.priorityChip}
                          style={{
                            backgroundColor:
                              priorityConfig[ticket.priority]?.bgColor ||
                              "#f5f5f5",
                            color:
                              priorityConfig[ticket.priority]?.color ||
                              "#757575",
                          }}
                        />
                      </TableCell>

                      {/* <TableCell>
                        <Box>
                          <Typography variant="body2" style={{ fontWeight: 500, marginBottom: 4 }}>
                            {ticket.type}
                          </Typography>
                          <Box style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {sourceConfig[ticket.source]?.icon}
                            <Typography variant="caption" color="textSecondary">
                              {sourceConfig[ticket.source]?.label || "Unknown"}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell> */}

                      <TableCell>
                        <Box className={classes.customerInfo}>
                          <Typography
                            variant="caption"
                            className={classes.companyName}
                          >
                            {ticket?.moduleName?.trim()}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box className={classes.customerInfo}>
                          <Avatar
                            className={classes.customerAvatar}
                            style={{
                              backgroundColor: getStringToColor(
                                ticket.requester_name
                              ),
                            }}
                          >
                            {ticket.requester_name.charAt(0)}
                          </Avatar>
                          <Typography
                            variant="body2"
                            style={{ fontWeight: 500 }}
                          >
                            {ticket.requester_name}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        {/* <Box> */}
                        <Box className={classes.timelineItem}>
                          <CalendarIcon style={{ fontSize: 14 }} />
                          <span> {formatDate(ticket.created_at)}</span>
                        </Box>
                        {/* <Box className={classes.timelineItem}>
                            <CalendarIcon style={{ fontSize: 14 }} />
                            <span>Updated: {formatDate(ticket.updated_at)}</span>
                          </Box>
                        </Box> */}
                      </TableCell>

                      {/* <TableCell>
                        <Box className={classes.tagsContainer}>
                          {ticket.tags.slice(0, 2).map((tag, tagIndex) => (
                            <Chip key={tagIndex} label={tag} size="small" variant="outlined" />
                          ))}
                          {ticket.tags.length > 2 && (
                            <Chip label={`+${ticket.tags.length - 2}`} size="small" variant="outlined" />
                          )}
                        </Box>
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 20, 50]}
            />
          </Card>

          {/* Footer */}
          <Box className={classes.footer}>
            <Paper elevation={2} className={classes.footerPaper}>
              <Typography variant="body2" color="textSecondary">
                <strong>{filteredTickets.length}</strong> tickets displayed
              </Typography>
              <Box
                className={classes.divider}
                style={{ borderLeft: "1px solid #e0e0e0" }}
              />
              <Typography variant="body2" color="textSecondary">
                Last updated: {new Date().toLocaleString()}
              </Typography>
            </Paper>
          </Box>
        </Container>

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            style: {
              borderRadius: 16,
              maxHeight: "80vh",
            },
          }}
        >
          <DialogTitle
            disableTypography
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: 8,
            }}
          >
            <Box>
              <Typography variant="h6" component="div">
                Ticket #{selectedTicket?.id} - Conversations
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedTicket?.subject}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers style={{ padding: 0 }}>
            {conversations.length > 0 ? (
              <List style={{ padding: 0 }}>
                {conversations.map((conversation: any, index) => (
                  <Box key={conversation.id}>
                    <ListItem
                      alignItems="flex-start"
                      style={{
                        padding: "16px 24px",
                        backgroundColor:
                          conversation.user_type === "agent"
                            ? "#e3f2fd"
                            : "#f5f5f5", // primary.50 or grey.50
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          style={{
                            backgroundColor:
                              conversation.user_type === "agent"
                                ? "#1976d2" // primary.main
                                : getStringToColor(conversation.user_name),
                            width: 40,
                            height: 40,
                          }}
                        >
                          {conversation.user_type === "agent" ? (
                            <SupportIcon />
                          ) : (
                            <PersonIcon />
                          )}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              style={{ fontWeight: "bold", marginRight: 8 }}
                            >
                              {conversation.user_name}
                            </Typography>
                            <Chip
                              label={
                                conversation.user_type === "agent"
                                  ? "Support Agent"
                                  : "Customer"
                              }
                              size="small"
                              color={
                                conversation.user_type === "agent"
                                  ? "primary"
                                  : "default"
                              }
                              variant="outlined"
                              style={{ marginRight: 8 }}
                            />
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              style={{ marginLeft: "auto" }}
                            >
                              {formatDate(conversation.created_at)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              style={{
                                whiteSpace: "pre-wrap",
                                marginBottom: 8,
                              }}
                            >
                              {conversation.body_text}
                            </Typography>
                            <Box
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              {sourceConfig[conversation.source]?.icon}
                              <Typography
                                variant="caption"
                                color="textSecondary"
                                style={{ marginLeft: 4 }}
                              >
                                via{" "}
                                {sourceConfig[conversation.source]?.label ||
                                  "Unknown"}
                              </Typography>
                              {conversation.incoming && (
                                <Chip
                                  label="Incoming"
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  style={{ marginLeft: 8 }}
                                />
                              )}
                              {conversation?.private && (
                                <Chip
                                  label="Private"
                                  size="small"
                                  variant="outlined"
                                  color="secondary"
                                  style={{ marginLeft: 8 }}
                                />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < conversations.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            ) : (
              <Box style={{ padding: 32, textAlign: "center" }}>
                <Typography variant="body1" color="textSecondary">
                  No conversations found for this ticket.
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions style={{ padding: 16 }}>
            {/* <Button startIcon={<ReplyIcon />} variant="contained" disabled>
              Reply (Demo)
            </Button> */}
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
