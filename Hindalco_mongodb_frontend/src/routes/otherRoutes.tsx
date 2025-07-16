import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router";

import CustomInbox from "pages/CustomInbox";
import NotificationPage from "pages/Notification";
import FallBackPage from "pages/FallbackPage";
import GlobalSearch from "pages/GlobalSearch";
import ReferencesResultPage from "pages/ReferencesResultPage";
import TestPreviewFeature from "pages/TestPreviewFeature";
import Help from "pages/Help";
import UserStats from "../pages/UserStats";
import ReportIssue from "components/ReportIssue";
import CalendarRedirectPage from "pages/CalendarRedirectPage";
import TableTesting from "components/TableTesting";
import NoAccessPage from "pages/NoAccessPage";
import TestSelect from "pages/TestSelect";
import FreshworksTickets from "pages/FreshWork";
// import Reference from "pages/DocumentControl/Reference";

export const otherRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate replace to="/processdocuments/processdocument" />,
  },
  { path: "ticket", element: <FreshworksTickets /> },
  {
    path: "/preview",
    element: <TestPreviewFeature />,
  },
  {
    path: "/unset",
    element: <FallBackPage />,
  },
  {
    path: "/logout",
    element: <Navigate replace to="/processdocuments/processdocument" />,
  },
  {
    path: "/Inbox",
    element: <CustomInbox />,
  },
  {
    path: "/notification",
    element: <NotificationPage />,
  },
  {
    path: "/globalsearch",
    element: <GlobalSearch />,
  },
  {
    path: "/searchreferences",
    element: <ReferencesResultPage />,
  },
  {
    path: "/Help",
    element: <Help />,
  },
  {
    path: "/stats",
    element: <UserStats />,
  },
  {
    path: "/ReportIssue",
    element: <ReportIssue />,
  },
  {
    path: "/calRedirect",
    element: <CalendarRedirectPage />,
  },
  {
    path: "/testing",
    element: <TableTesting />,
  },

  {
    path: "/noaccess",
    element: <NoAccessPage />,
  },
  {
    path: "/testselect",
    element: <TestSelect />,
  },
];

export default otherRoutes;
