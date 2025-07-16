import type { RouteObject } from "react-router";
import { Navigate } from "react-router-dom";
import ObjectiveGoals from "../pages/OrganizationGoals/OrgGoals";
import ObjectiveTable from "../pages/Objectives/ObjectiveTable";
import ObjectAndTarget from "pages/OrganizationGoals";
import ObjectiveDrawer from "pages/Objectives/Objective/KraRegister/CreateObjectiveForm/ObjectiveDrawer";

export const objectiveRoutes: RouteObject[] = [
  {
    path: "/objective/organizationgoals",
    element: <ObjectiveGoals />,
  },
  {
    path: "/objective",
    element: <ObjectAndTarget />,
  },
  {
    path: "/objective/objective",
    element: <ObjectiveTable />,
  },
  {
    path: "/objective/objectivedrawer",
    element: <ObjectiveTable />,
  },
];

export default objectiveRoutes;
