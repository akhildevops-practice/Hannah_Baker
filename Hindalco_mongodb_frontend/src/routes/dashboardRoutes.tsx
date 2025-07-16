import type { RouteObject } from "react-router";
import { Navigate } from "react-router-dom";
import KpiGraphs from "../components/KpiGraphs";
import Dashboard from "../pages/Dashboard";
import GraphsHomePage from "components/GraphsHomePage";

export const dashboardRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <GraphsHomePage />,
  },
  {
    path: "/dashboard/kpi",
    element: <KpiGraphs />,
  },
  {
    path: "/dashboard/objective",
    element: <KpiGraphs />,
  },
  {
    path: "/dashboard/documentdashboard",
    element: <Dashboard />,
  },
];

export default dashboardRoutes;
