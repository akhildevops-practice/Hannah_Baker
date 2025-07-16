import { Suspense } from "react";
import type { RouteObject } from "react-router";
import { Navigate } from "react-router-dom";

import DocumentTypeDetails from "pages/DocumentControl/DocumentTypeDetails";
import CustomLoadingComponent from "components/CustomLoadingComponent";
import ExpandedDocViewPage from "pages/DocumentControl/ExpandedDocViewPage";
import DocumentDrawer from "components/Document/DocumentTable/DocumentDrawer";
import InboxDocumentDrawer from "pages/CustomInbox/EditDocumentDrawer";
import DocumentControl from "pages/DocumentControl";
import AddDocumentForm from "components/AddDocumentForm";

// import ManageReferenceDocument from "pages/ManageReferenceDocument";

type CustomeRouteObject = {
  protected? : boolean,
} & RouteObject
export const documentRoutes: CustomeRouteObject[] = [
  {
    path: "/processdocuments/documenttype",
    protected : true,
    element: <DocumentTypeDetails />,
  },
   {
    path:"/processdocuments/documenttype/data",
    element:<AddDocumentForm/>
  },
  {
    path:"/processdocuments/documenttype/data/:id",
    element:<AddDocumentForm/>
  },
  {
    path: "/processdocuments",
    element: <Navigate replace to="/processdocuments/processdocument" />,
  },
  {
    path: "/processdocuments/documenttypedetails",
    element: <DocumentTypeDetails />,
  },
  {
    path: "/processdocuments/processdocument",
    element: <DocumentControl />,
  },
  // {
  //   path: "/processdocuments/processdocument/newprocessdocument",
  //   element: <NewProcessDocument />,
  // },
  // {
  //   path: "/processdocuments/processdocument/newprocessdocument/:id",
  //   element: <NewProcessDocument />,
  // },
  {
    path: "/processdocuments/processdocument/viewprocessdocument/:id",
    element: (
      <Suspense
        fallback={
          <CustomLoadingComponent
            text={"Loading your document, please wait..."}
          />
        }
      >
        <ExpandedDocViewPage />
      </Suspense>
    ),
  },
  {
    path: "/processdocuments/fullformview",
    element: <DocumentDrawer />,
  },
  {
    path: "/Inbox/fullformview",
    element: <InboxDocumentDrawer />,
  },
  {
    path: "/processdocuments/viewdoc/:id",
    element: <ExpandedDocViewPage />,
  },
 
];

export default documentRoutes;
