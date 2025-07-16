import CIPSettings from "pages/CIPControl/CIPSettings";
import CIPControl from "pages/CIPControl";
import type { RouteObject } from "react-router";

type CustomeRouteObject = {
  protected? : boolean,
} & RouteObject


export const cpiRoutes: CustomeRouteObject[] = [
  {
    path: "/cip/management",
    element: <CIPControl />,
  },
  {
    path: "/cipsettings",
    protected : true,
    element: <CIPSettings />,
  },
];

export default cpiRoutes;
