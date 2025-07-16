import type { RouteObject } from "react-router";
// import { Navigate } from "react-router-dom";

// import RiskRegister from "pages/RiskRegister";
import RiskConfiguration from "pages/RiskRegister/RiskConfiguration";
import RiskConfigurationFormStepper from "pages/RiskRegister/RiskConfiguration/RiskConfigurationFormStepper";
import HiraConfigurationTabWrapper from "pages/RiskRegister/RiskConfiguration/HiraConfigurationTabWrapper";
// import HiraRegisterPage from "pages/Risk/Hira/HiraRegisterPage";
import HiraConfigurationPage from "pages/Risk/Hira/HiraConfigurationPage";
import HiraRegisterReviewPage from "pages/Risk/Hira/HiraRegisterReviewPage";
import AspectImpactRegisterPage from "pages/Risk/AspectImpact/AspectImpactRegisterPage";
// import AspectImpactConfiguratioTab from "components/Risk/AspectImpact/AspectImpactConfiguration/AspectImpactConfigurationTab";
import AspectImpactConfigurationPage from "pages/Risk/AspectImpact/AspectImpactConfigurationPage";
import AspectImpactReviewPage from "pages/Risk/AspectImpact/AspectImpactReviewPage";
import HiraRegisterPagev2 from "pages/Risk/Hira/HiraRegisterPagev2";
import HiraRevisionHistoryPage from "pages/Risk/Hira/HiraRevisionHistoryPage";
import AspectImpactRevisionHistoryPage from "pages/Risk/AspectImpact/AspectImpactRevisionHistoryPage";
import AspectImpactDashboardPage from "pages/Risk/AspectImpact/AspectImpactDashboardPage";
import HiraImportPage from "pages/Risk/Hira/HiraImportPage";

// //old imports to be delete after migrating data
// import HiraRegisterPagev2Old from "pages/Risk/HiraOld/HiraRegisterPagev2";
// import HiraImportPageOld from "pages/Risk/HiraOld/HiraImportPage";
// import HiraRegisterReviewPageOld from "pages/Risk/HiraOld/HiraRegisterReviewPage";
// import HiraRevisionHistoryPageOld from "pages/Risk/HiraOld/HiraRevisionHistoryPage";
export const riskRoutes: RouteObject[] = [
  // {
  //   path: "/risk/:riskcategory",
  //   element: <Navigate replace to="/risk/riskregister/:riskcategory" />,
  // },
  {
    path: "/risk/riskconfiguration/:riskcategory",
    element: <RiskConfiguration />,
  },
  {
    path: "/risk/riskconfiguration/stepper/:riskcategory",
    element: <RiskConfigurationFormStepper />,
  },
  {
    path: "/risk/riskconfiguration/stepper/HIRA",
    element: <HiraConfigurationTabWrapper />,
  },
  {
    path: "/risk/riskconfiguration/HIRA",
    element: <HiraConfigurationPage />,
    // element: <RiskConfigurationFormStepper />,
  },
  {
    path: "/risk/riskconfiguration/stepper/:riskcategory/:id",
    element: <RiskConfigurationFormStepper />,
  },
  // {
  //   path: "/risk/riskregister/:riskcategory",
  //   element: <RiskRegister />,
  // },
  {
    path: "/risk/riskregister/HIRA",
    // element: <HiraRegisterPage />,
    element: <HiraRegisterPagev2 />,
  },

  {
    path: "/risk/riskregister/HIRA/:hiraId",
    // element: <HiraRegisterPage />,
    element: <HiraRegisterPagev2 />,
  },
  {
    path: "/risk/riskregister/HIRA/:jobTitle/:entityId",
    // element: <HiraRegisterPage />,
    element: <HiraRegisterPagev2 />,
  },

  {
    path: "/risk/riskregister/HIRA/import",
    element: <HiraImportPage />,
  },

  // {
  //   path: "/risk/riskregister/HIRA/review/:jobTitle",
  //   element: <HiraRegisterReviewPage />,
  // },

  {
    path: "/risk/riskregister/HIRA/review/:hiraId",
    element: <HiraRegisterReviewPage />,
  },

  {
    path: "/risk/riskregister/HIRA/workflow/:hiraWorkflowId",
    element: <HiraRegisterReviewPage />,
  },

  {
    path: "/risk/riskregister/HIRA/revisionHistory/:hiraId/:cycleNumber",
    element: <HiraRevisionHistoryPage />,
  },


  // //below old routes of hira , to be deleted after migrating data
  // {
  //   path: "/risk/riskregister/old/HIRA",
  //   // element: <HiraRegisterPage />,
  //   element: <HiraRegisterPagev2Old />,
  // },

  // {
  //   path: "/risk/riskregister/old/HIRA/:jobTitle",
  //   // element: <HiraRegisterPage />,
  //   element: <HiraRegisterPagev2Old />,
  // },
  // {
  //   path: "/risk/riskregister/old/HIRA/:jobTitle/:entityId",
  //   // element: <HiraRegisterPage />,
  //   element: <HiraRegisterPagev2Old />,
  // },

  // {
  //   path: "/risk/riskregister/old/HIRA/import",
  //   element: <HiraImportPageOld />,
  // },

  // {
  //   path: "/risk/riskregister/old/HIRA/review/:jobTitle",
  //   element: <HiraRegisterReviewPageOld />,
  // },
  // {
  //   path: "/risk/riskregister/old/HIRA/workflow/:hiraWorkflowId",
  //   element: <HiraRegisterReviewPageOld />,
  // },
  
  // {
  //   path: "/risk/riskregister/old/HIRA/revisionHistory/:hiraId/:cycleNumber",
  //   element: <HiraRevisionHistoryPageOld />,
  // },

  {
    path: "/risk/riskregister/AspectImpact/revisionHistory",
    element: <AspectImpactRevisionHistoryPage />,
  },

  {
    path: "/risk/riskregister/AspectImpact",
    element: <AspectImpactRegisterPage />,
  },

  {
    path: "/risk/riskregister/AspectImpact/Dashboard",
    element: <AspectImpactDashboardPage />,
  },

  {
    path: "/risk/riskconfiguration/AspectImpact",
    element: <AspectImpactConfigurationPage />,
    // element: <RiskConfigurationFormStepper />,
  },

  {
    path: "/risk/riskregister/AspectImpact/review/bydepartment/:entityId",
    element: <AspectImpactReviewPage />,
  },

  {
    path: "/risk/riskregister/AspectImpact/workflow/:hiraWorkflowId",
    element: <AspectImpactReviewPage />,
  },
];

export default riskRoutes;
