/* eslint-disable testing-library/prefer-screen-queries */
import { ReactNode } from "react";
import CustomAppBar from "../../../components/CustomAppBar";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider } from "@material-ui/core/styles";
import { theme } from "../../../theme";
import { BrowserRouter as Router } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { SnackbarProvider } from "notistack";
import setToken from "../../../utils/setToken";
import axios from "../../../apis/axios.global";


jest.mock("axios", () => {
  return {
    create: () => {
      return {
        interceptors: {
          request: { eject: jest.fn(), use: jest.fn() },
          response: { eject: jest.fn(), use: jest.fn() },
        },
        get: () => jest.fn(),
        post: () => jest.fn(),
      };
    },
  };
});

const mockAxios = axios as jest.Mocked<typeof axios>;

const dummyData = {
  id:"b11d6388-1973-46fd-b11a-36663f016ab7",
  kcId:"7af2f458-6c1d-4986-9962-027567728dcc",
  email:"mintukurmi71@gmail.com",
  username:"auditortwo",
  firstnam:"Mintu",
  lastname:"Auditor",
  createdAt:"2022-08-01T09:52:25.436Z",
  createdBy:null,
  updatedAt:"2022-08-01T09:52:25.437Z",
  updatedBy:null,
  enabled:null,
  organizationId:"c3d7cd44-445b-4dc8-9a71-b560d5b7d738",
  locationId:"cc11e87c-1408-402a-bf13-701f881c282d",
  businessTypeId:"ea05f177-fc5b-4d83-a92e-867208f18a1a",
  sectionId:"015ef0ba-87a7-4a12-a1d6-c7465c865598",
  entityId:"c0e51cce-4aa2-42d0-a133-73c6e22430a5",
  userType:"IDP",
  status:true,
  avatar:null,
  entity:{
    id:"c0e51cce-4aa2-42d0-a133-73c6e22430a5",
    entityName:"Some name",
    description:"2edewdccecevec",
    entityTypeId:"6607c0db-d768-4444-8195-e54a767db0f4",
    businessTypeId:"ea05f177-fc5b-4d83-a92e-867208f18a1a",
    organizationId:"c3d7cd44-445b-4dc8-9a71-b560d5b7d738",
    locationId:"cc11e87c-1408-402a-bf13-701f881c282d",
    createdBy:null,
    entityId:"e1212",
    createdAt:"2022-08-01T07:02:13.512Z",
    updatedAt:"2022-08-01T07:02:13.513Z",
    updatedBy:null
  },
  location:{
    id:"cc11e87c-1408-402a-bf13-701f881c282d",
    locationName:"Guwahati",
    locationType:"Internal",
    locationId:"12313",
    description:"This is a test.",
    status:null,
    createdBy:null,
    createdAt:"2022-08-01T06:58:51.092Z",
    updatedAt:"2022-08-01T06:58:51.092Z",
    updatedBy:null,
    organizationId:"c3d7cd44-445b-4dc8-9a71-b560d5b7d738"
  }
}

var clickSpy: any;
var mockUseNavigate: any;

beforeAll(() => {
  clickSpy = jest.fn();
  mockUseNavigate = jest.fn();
});

describe("CustomAppBarTest", () => {
  beforeEach(() => {
    jest.mock("react-router-dom", () => ({
      ...(jest.requireActual("react-router-dom") as any),
      useNavigate: () => mockUseNavigate,
      useHref: () => "abc",
      BrowserRouter: ({ children }: { children: ReactNode }) => <>{children}</>,
      Route: ({ children }: { children: ReactNode }) => <>{children}</>,
    }));
  });

  test("should render <CustomAppBar /> component", () => {
    const mockGet = jest.spyOn(mockAxios, "get");
    mockAxios.get.mockResolvedValue({
      data: {
        id:"b11d6388-1973-46fd-b11a-36663f016ab7",
        kcId:"7af2f458-6c1d-4986-9962-027567728dcc",
        email:"mintukurmi71@gmail.com",
        username:"auditortwo",
        firstnam:"Mintu",
        lastname:"Auditor",
        createdAt:"2022-08-01T09:52:25.436Z",
        createdBy:null,
        updatedAt:"2022-08-01T09:52:25.437Z",
        updatedBy:null,
        enabled:null,
        organizationId:"c3d7cd44-445b-4dc8-9a71-b560d5b7d738",
        locationId:"cc11e87c-1408-402a-bf13-701f881c282d",
        businessTypeId:"ea05f177-fc5b-4d83-a92e-867208f18a1a",
        sectionId:"015ef0ba-87a7-4a12-a1d6-c7465c865598",
        entityId:"c0e51cce-4aa2-42d0-a133-73c6e22430a5",
        userType:"IDP",
        status:true,
        avatar:null,
        entity:{
          id:"c0e51cce-4aa2-42d0-a133-73c6e22430a5",
          entityName:"Some name",
          description:"2edewdccecevec",
          entityTypeId:"6607c0db-d768-4444-8195-e54a767db0f4",
          businessTypeId:"ea05f177-fc5b-4d83-a92e-867208f18a1a",
          organizationId:"c3d7cd44-445b-4dc8-9a71-b560d5b7d738",
          locationId:"cc11e87c-1408-402a-bf13-701f881c282d",
          createdBy:null,
          entityId:"e1212",
          createdAt:"2022-08-01T07:02:13.512Z",
          updatedAt:"2022-08-01T07:02:13.513Z",
          updatedBy:null
        },
        location:{
          id:"cc11e87c-1408-402a-bf13-701f881c282d",
          locationName:"Guwahati",
          locationType:"Internal",
          locationId:"12313",
          description:"This is a test.",
          status:null,
          createdBy:null,
          createdAt:"2022-08-01T06:58:51.092Z",
          updatedAt:"2022-08-01T06:58:51.092Z",
          updatedBy:null,
          organizationId:"c3d7cd44-445b-4dc8-9a71-b560d5b7d738"
        }
      }
    });
    setToken(
      "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJlQjVlLTdpQkxoN1pCcF9rdTJoZXFLcDBMT3JmOWNScF9mWHE1RjdsaVNBIn0.eyJleHAiOjE2NDk0MzI4ODEsImlhdCI6MTY0OTM5Njg4MiwianRpIjoiZDM0NWJhMDktYWE4My00ZWZhLWE5NmQtZDNiZDEwZDNkMTIwIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMjkuOTE6ODA4MC9hdXRoL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOlsicmVhbGhoeG1zYmRtaC1yZWFsbSIsIjEyMy1yZWFsbSIsInJlYWxtZS1yZWFsbSIsImtra2wtcmVhbG0iLCJkYXNkdy1yZWFsbSIsIm5pbXNpaC1yZWFsbSIsImJiYy1yZWFsbSIsIm1hc3Rlci1yZWFsbSIsInJlYWxoZ2hoeG1zYmRtaC1yZWFsbSIsInNvbWVyYW5kb21yZ29zc3NkLXJlYWxtIiwic2Ftc3VuZy1yZWFsbSIsInNhbXBsZTItcmVhbG0iLCJzYW1wbGUtcmVhbG0iLCJhcHBsZS1yZWFsbSIsIm9yZ2FuaXphdGlvbjEtcmVhbG0iLCJ0ZXN0b3JnNS1yZWFsbSIsImJtdy1yZWFsbSIsInBvcnNjaGUtcmVhbG0iLCJ1dXVpLXJlYWxtIiwib29wLXJlYWxtIiwiaG9uZGEtcmVhbG0iLCJzb21lcmFuZG9tcmdvc3NkLXJlYWxtIiwic29tZXJhbmRvbU9yZy1yZWFsbSIsInJlYWxobW1oLXJlYWxtIiwibGxwLXJlYWxtIiwic29tZXJhbmRvbXJnb3MtcmVhbG0iLCJzb21lcmFuc2RvbXJnc3Nvc3NzZC1yZWFsbSIsInd3ZC1yZWFsbSIsInNvbWVyYW5kb21yZ3Nvc3NzZC1yZWFsbSIsInNvbWVyYW5zc3Nkb21yZ3Nzb3Nzc2QtcmVhbG0iLCJ3ZXN0ZXJuZGlnaXRhbC1yZWFsbSIsImh1bmRyZWQtcmVhbG0iLCJyZWFsbW0tcmVhbG0iLCJyZWFsbW1oLXJlYWxtIiwib3JnMi1yZWFsbSIsImxvZ2l0ZWNoLXJlYWxtIiwiYWNlci1yZWFsbSIsInBhdGFuamFsaS1yZWFsbSIsInJlYWxoaG1taC1yZWFsbSIsInNvbWVyYW5kb21yZy1yZWFsbSIsInJlYWxoaHhtYmRtaC1yZWFsbSIsInJlYWxoZ2hoeHhtc2JkbWgtcmVhbG0iLCJocC1yZWFsbSJdLCJzdWIiOiJlZWZiNGFlNi03M2YyLTQ2ZTQtYThjOC0xYTZiOTBhNDY0M2EiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhZG1pbi1jbGkiLCJzZXNzaW9uX3N0YXRlIjoiNTNhNTA2OGItODBiYS00NThkLWE5YjUtYTdlOWU0NmM1MmFkIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMDAvKiIsIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImNyZWF0ZS1yZWFsbSIsIm9mZmxpbmVfYWNjZXNzIiwiYWRtaW4iXX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCByb2xlcyIsInNpZCI6IjUzYTUwNjhiLTgwYmEtNDU4ZC1hOWI1LWE3ZTllNDZjNTJhZCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6InByYW5pdHByYWthc2gyQGdtYWlsLmNvbSJ9.eYsKWdEws9QiB6Indeotu4VlT1k2VepwG6OZvYzjeTXToqSdWRIqqazPe66RPwYOswoY-MLC9gG7BGiikM-A2j_w1mAGCaRttH7Y3UaNsyw56g-74DIlut_U6fjPcze8hqJAq5QnostVY9dA33gwLg1jk5ugMm1RcvtmlznmElUISefxub3-z3IbWjDefZyJzdgh0VvpB5NUk-oGFktFV3dIqQKV7tVxGu0CDl0peZuAPjm_dft-ugXI8GZ9Akt_NtfdG1kJLQnfMtUaUjmrMStO4chbUjpNeUWEWfiXuaHJkt3bhHcZGD1IWRgEWWqq1MXFQt0W3_SajDh8p8Gl7w"
    );
    const { container } = render(
      <SnackbarProvider>
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <Router>
            <CustomAppBar
              handleLogout={clickSpy}
              open={false}
              setOpen={clickSpy}
            />
          </Router>
        </ThemeProvider>
      </RecoilRoot>
      </SnackbarProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should call logout handler on logout button click", () => {
    const mockGet = jest.spyOn(mockAxios, "get");
    mockAxios.get.mockResolvedValue({
      data: {
        id:"b11d6388-1973-46fd-b11a-36663f016ab7",
        kcId:"7af2f458-6c1d-4986-9962-027567728dcc",
        email:"mintukurmi71@gmail.com",
        username:"auditortwo",
        firstnam:"Mintu",
        lastname:"Auditor",
        createdAt:"2022-08-01T09:52:25.436Z",
        createdBy:null,
        updatedAt:"2022-08-01T09:52:25.437Z",
        updatedBy:null,
        enabled:null,
        organizationId:"c3d7cd44-445b-4dc8-9a71-b560d5b7d738",
        locationId:"cc11e87c-1408-402a-bf13-701f881c282d",
        businessTypeId:"ea05f177-fc5b-4d83-a92e-867208f18a1a",
        sectionId:"015ef0ba-87a7-4a12-a1d6-c7465c865598",
        entityId:"c0e51cce-4aa2-42d0-a133-73c6e22430a5",
        userType:"IDP",
        status:true,
        avatar:null,
        entity:{
          id:"c0e51cce-4aa2-42d0-a133-73c6e22430a5",
          entityName:"Some name",
          description:"2edewdccecevec",
          entityTypeId:"6607c0db-d768-4444-8195-e54a767db0f4",
          businessTypeId:"ea05f177-fc5b-4d83-a92e-867208f18a1a",
          organizationId:"c3d7cd44-445b-4dc8-9a71-b560d5b7d738",
          locationId:"cc11e87c-1408-402a-bf13-701f881c282d",
          createdBy:null,
          entityId:"e1212",
          createdAt:"2022-08-01T07:02:13.512Z",
          updatedAt:"2022-08-01T07:02:13.513Z",
          updatedBy:null
        },
        location:{
          id:"cc11e87c-1408-402a-bf13-701f881c282d",
          locationName:"Guwahati",
          locationType:"Internal",
          locationId:"12313",
          description:"This is a test.",
          status:null,
          createdBy:null,
          createdAt:"2022-08-01T06:58:51.092Z",
          updatedAt:"2022-08-01T06:58:51.092Z",
          updatedBy:null,
          organizationId:"c3d7cd44-445b-4dc8-9a71-b560d5b7d738"
        }
      }
    });
    setToken(
      "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJlQjVlLTdpQkxoN1pCcF9rdTJoZXFLcDBMT3JmOWNScF9mWHE1RjdsaVNBIn0.eyJleHAiOjE2NDk0MzI4ODEsImlhdCI6MTY0OTM5Njg4MiwianRpIjoiZDM0NWJhMDktYWE4My00ZWZhLWE5NmQtZDNiZDEwZDNkMTIwIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMjkuOTE6ODA4MC9hdXRoL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOlsicmVhbGhoeG1zYmRtaC1yZWFsbSIsIjEyMy1yZWFsbSIsInJlYWxtZS1yZWFsbSIsImtra2wtcmVhbG0iLCJkYXNkdy1yZWFsbSIsIm5pbXNpaC1yZWFsbSIsImJiYy1yZWFsbSIsIm1hc3Rlci1yZWFsbSIsInJlYWxoZ2hoeG1zYmRtaC1yZWFsbSIsInNvbWVyYW5kb21yZ29zc3NkLXJlYWxtIiwic2Ftc3VuZy1yZWFsbSIsInNhbXBsZTItcmVhbG0iLCJzYW1wbGUtcmVhbG0iLCJhcHBsZS1yZWFsbSIsIm9yZ2FuaXphdGlvbjEtcmVhbG0iLCJ0ZXN0b3JnNS1yZWFsbSIsImJtdy1yZWFsbSIsInBvcnNjaGUtcmVhbG0iLCJ1dXVpLXJlYWxtIiwib29wLXJlYWxtIiwiaG9uZGEtcmVhbG0iLCJzb21lcmFuZG9tcmdvc3NkLXJlYWxtIiwic29tZXJhbmRvbU9yZy1yZWFsbSIsInJlYWxobW1oLXJlYWxtIiwibGxwLXJlYWxtIiwic29tZXJhbmRvbXJnb3MtcmVhbG0iLCJzb21lcmFuc2RvbXJnc3Nvc3NzZC1yZWFsbSIsInd3ZC1yZWFsbSIsInNvbWVyYW5kb21yZ3Nvc3NzZC1yZWFsbSIsInNvbWVyYW5zc3Nkb21yZ3Nzb3Nzc2QtcmVhbG0iLCJ3ZXN0ZXJuZGlnaXRhbC1yZWFsbSIsImh1bmRyZWQtcmVhbG0iLCJyZWFsbW0tcmVhbG0iLCJyZWFsbW1oLXJlYWxtIiwib3JnMi1yZWFsbSIsImxvZ2l0ZWNoLXJlYWxtIiwiYWNlci1yZWFsbSIsInBhdGFuamFsaS1yZWFsbSIsInJlYWxoaG1taC1yZWFsbSIsInNvbWVyYW5kb21yZy1yZWFsbSIsInJlYWxoaHhtYmRtaC1yZWFsbSIsInJlYWxoZ2hoeHhtc2JkbWgtcmVhbG0iLCJocC1yZWFsbSJdLCJzdWIiOiJlZWZiNGFlNi03M2YyLTQ2ZTQtYThjOC0xYTZiOTBhNDY0M2EiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhZG1pbi1jbGkiLCJzZXNzaW9uX3N0YXRlIjoiNTNhNTA2OGItODBiYS00NThkLWE5YjUtYTdlOWU0NmM1MmFkIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMDAvKiIsIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImNyZWF0ZS1yZWFsbSIsIm9mZmxpbmVfYWNjZXNzIiwiYWRtaW4iXX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCByb2xlcyIsInNpZCI6IjUzYTUwNjhiLTgwYmEtNDU4ZC1hOWI1LWE3ZTllNDZjNTJhZCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6InByYW5pdHByYWthc2gyQGdtYWlsLmNvbSJ9.eYsKWdEws9QiB6Indeotu4VlT1k2VepwG6OZvYzjeTXToqSdWRIqqazPe66RPwYOswoY-MLC9gG7BGiikM-A2j_w1mAGCaRttH7Y3UaNsyw56g-74DIlut_U6fjPcze8hqJAq5QnostVY9dA33gwLg1jk5ugMm1RcvtmlznmElUISefxub3-z3IbWjDefZyJzdgh0VvpB5NUk-oGFktFV3dIqQKV7tVxGu0CDl0peZuAPjm_dft-ugXI8GZ9Akt_NtfdG1kJLQnfMtUaUjmrMStO4chbUjpNeUWEWfiXuaHJkt3bhHcZGD1IWRgEWWqq1MXFQt0W3_SajDh8p8Gl7w"
    );
    const { container } = render(
      <SnackbarProvider>  
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <Router>
            <CustomAppBar
              handleLogout={clickSpy}
              open={false}
              setOpen={clickSpy}
            />
          </Router>
        </ThemeProvider>
      </RecoilRoot>
      </SnackbarProvider>
    );
    let logoutButton: any = screen.queryByTestId("logout-button");
    waitFor(() => {
      expect(logoutButton).toBeInTheDocument();
      fireEvent.click(logoutButton);
      expect(clickSpy).toBeCalled();
    })
  });

  test("should invoke the file upload function when a file is added via the file input field", () => {
    const mockPost = jest.spyOn(mockAxios, "post");
    mockAxios.post.mockResolvedValue({
      data: {
        id:"b11d6388-1973-46fd-b11a-36663f016ab7",
        kcId:"7af2f458-6c1d-4986-9962-027567728dcc",
        email:"mintukurmi71@gmail.com",
        username:"auditortwo",
        firstname:"Mintu",
        lastname:"Auditor",
        createdAt:"2022-08-01T09:52:25.436Z",
        createdBy:null,
        updatedAt:"2022-08-23T13:01:01.337Z",
        updatedBy:null,
        enabled:null,
        organizationId:"c3d7cd44-445b-4dc8-9a71-b560d5b7d738",
        locationId:"cc11e87c-1408-402a-bf13-701f881c282d",
        businessTypeId:"ea05f177-fc5b-4d83-a92e-867208f18a1a",
        sectionId:"015ef0ba-87a7-4a12-a1d6-c7465c865598",
        entityId:"c0e51cce-4aa2-42d0-a133-73c6e22430a5",
        userType:"IDP",
        status:true,
        avatar:"4409ca08-cc05-4497-9256-0449f266413b.jpg"
      },
      status: 201
    })
    const mockGet = jest.spyOn(mockAxios, "get");
    mockAxios.get.mockResolvedValue({
      data: {
        id:"b11d6388-1973-46fd-b11a-36663f016ab7",
        kcId:"7af2f458-6c1d-4986-9962-027567728dcc",
        email:"mintukurmi71@gmail.com",
        username:"auditortwo",
        firstnam:"Mintu",
        lastname:"Auditor",
        createdAt:"2022-08-01T09:52:25.436Z",
        createdBy:null,
        updatedAt:"2022-08-01T09:52:25.437Z",
        updatedBy:null,
        enabled:null,
        organizationId:"c3d7cd44-445b-4dc8-9a71-b560d5b7d738",
        locationId:"cc11e87c-1408-402a-bf13-701f881c282d",
        businessTypeId:"ea05f177-fc5b-4d83-a92e-867208f18a1a",
        sectionId:"015ef0ba-87a7-4a12-a1d6-c7465c865598",
        entityId:"c0e51cce-4aa2-42d0-a133-73c6e22430a5",
        userType:"IDP",
        status:true,
        avatar:null,
        entity:{
          id:"c0e51cce-4aa2-42d0-a133-73c6e22430a5",
          entityName:"Some name",
          description:"2edewdccecevec",
          entityTypeId:"6607c0db-d768-4444-8195-e54a767db0f4",
          businessTypeId:"ea05f177-fc5b-4d83-a92e-867208f18a1a",
          organizationId:"c3d7cd44-445b-4dc8-9a71-b560d5b7d738",
          locationId:"cc11e87c-1408-402a-bf13-701f881c282d",
          createdBy:null,
          entityId:"e1212",
          createdAt:"2022-08-01T07:02:13.512Z",
          updatedAt:"2022-08-01T07:02:13.513Z",
          updatedBy:null
        },
        location:{
          id:"cc11e87c-1408-402a-bf13-701f881c282d",
          locationName:"Guwahati",
          locationType:"Internal",
          locationId:"12313",
          description:"This is a test.",
          status:null,
          createdBy:null,
          createdAt:"2022-08-01T06:58:51.092Z",
          updatedAt:"2022-08-01T06:58:51.092Z",
          updatedBy:null,
          organizationId:"c3d7cd44-445b-4dc8-9a71-b560d5b7d738"
        }
      }
    });
    setToken(
      "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJlQjVlLTdpQkxoN1pCcF9rdTJoZXFLcDBMT3JmOWNScF9mWHE1RjdsaVNBIn0.eyJleHAiOjE2NDk0MzI4ODEsImlhdCI6MTY0OTM5Njg4MiwianRpIjoiZDM0NWJhMDktYWE4My00ZWZhLWE5NmQtZDNiZDEwZDNkMTIwIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMjkuOTE6ODA4MC9hdXRoL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOlsicmVhbGhoeG1zYmRtaC1yZWFsbSIsIjEyMy1yZWFsbSIsInJlYWxtZS1yZWFsbSIsImtra2wtcmVhbG0iLCJkYXNkdy1yZWFsbSIsIm5pbXNpaC1yZWFsbSIsImJiYy1yZWFsbSIsIm1hc3Rlci1yZWFsbSIsInJlYWxoZ2hoeG1zYmRtaC1yZWFsbSIsInNvbWVyYW5kb21yZ29zc3NkLXJlYWxtIiwic2Ftc3VuZy1yZWFsbSIsInNhbXBsZTItcmVhbG0iLCJzYW1wbGUtcmVhbG0iLCJhcHBsZS1yZWFsbSIsIm9yZ2FuaXphdGlvbjEtcmVhbG0iLCJ0ZXN0b3JnNS1yZWFsbSIsImJtdy1yZWFsbSIsInBvcnNjaGUtcmVhbG0iLCJ1dXVpLXJlYWxtIiwib29wLXJlYWxtIiwiaG9uZGEtcmVhbG0iLCJzb21lcmFuZG9tcmdvc3NkLXJlYWxtIiwic29tZXJhbmRvbU9yZy1yZWFsbSIsInJlYWxobW1oLXJlYWxtIiwibGxwLXJlYWxtIiwic29tZXJhbmRvbXJnb3MtcmVhbG0iLCJzb21lcmFuc2RvbXJnc3Nvc3NzZC1yZWFsbSIsInd3ZC1yZWFsbSIsInNvbWVyYW5kb21yZ3Nvc3NzZC1yZWFsbSIsInNvbWVyYW5zc3Nkb21yZ3Nzb3Nzc2QtcmVhbG0iLCJ3ZXN0ZXJuZGlnaXRhbC1yZWFsbSIsImh1bmRyZWQtcmVhbG0iLCJyZWFsbW0tcmVhbG0iLCJyZWFsbW1oLXJlYWxtIiwib3JnMi1yZWFsbSIsImxvZ2l0ZWNoLXJlYWxtIiwiYWNlci1yZWFsbSIsInBhdGFuamFsaS1yZWFsbSIsInJlYWxoaG1taC1yZWFsbSIsInNvbWVyYW5kb21yZy1yZWFsbSIsInJlYWxoaHhtYmRtaC1yZWFsbSIsInJlYWxoZ2hoeHhtc2JkbWgtcmVhbG0iLCJocC1yZWFsbSJdLCJzdWIiOiJlZWZiNGFlNi03M2YyLTQ2ZTQtYThjOC0xYTZiOTBhNDY0M2EiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhZG1pbi1jbGkiLCJzZXNzaW9uX3N0YXRlIjoiNTNhNTA2OGItODBiYS00NThkLWE5YjUtYTdlOWU0NmM1MmFkIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMDAvKiIsIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImNyZWF0ZS1yZWFsbSIsIm9mZmxpbmVfYWNjZXNzIiwiYWRtaW4iXX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCByb2xlcyIsInNpZCI6IjUzYTUwNjhiLTgwYmEtNDU4ZC1hOWI1LWE3ZTllNDZjNTJhZCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6InByYW5pdHByYWthc2gyQGdtYWlsLmNvbSJ9.eYsKWdEws9QiB6Indeotu4VlT1k2VepwG6OZvYzjeTXToqSdWRIqqazPe66RPwYOswoY-MLC9gG7BGiikM-A2j_w1mAGCaRttH7Y3UaNsyw56g-74DIlut_U6fjPcze8hqJAq5QnostVY9dA33gwLg1jk5ugMm1RcvtmlznmElUISefxub3-z3IbWjDefZyJzdgh0VvpB5NUk-oGFktFV3dIqQKV7tVxGu0CDl0peZuAPjm_dft-ugXI8GZ9Akt_NtfdG1kJLQnfMtUaUjmrMStO4chbUjpNeUWEWfiXuaHJkt3bhHcZGD1IWRgEWWqq1MXFQt0W3_SajDh8p8Gl7w"
    );
    const { container } = render(
      <SnackbarProvider>  
      <RecoilRoot>
        <ThemeProvider theme={theme}>
          <Router>
            <CustomAppBar
              handleLogout={clickSpy}
              open={false}
              setOpen={clickSpy}
            />
          </Router>
        </ThemeProvider>
      </RecoilRoot>
      </SnackbarProvider>
    );

    const profileButton: any = screen.queryByTestId("profile-button");
    fireEvent.click(profileButton);
    const imageUploadButton: any = screen.queryByTestId("file-input")
    waitFor(() => {
      expect(imageUploadButton).toBeInTheDocument();
      fireEvent.change(imageUploadButton, {target: {
        files: [new File(['(⌐□_□)'], 'chucknorris.png', {type: 'image/png'})],
      }})
      expect(mockPost).toBeCalledTimes(1);
    })
  })


  //-------------------------------------------------------------------------
//  const mockpayload = {
//     id:"b11d6388-1973-46fd-b11a-36663f016ab7",
//     kcId:"7af2f458-6c1d-4986-9962-027567728dcc",
//     email:"mintukurmi71@gmail.com",
//     username:"auditortwo",
//     firstname:"Mintu",
//     lastname:"Auditor",
//     createdAt:"2022-08-01T09:52:25.436Z",
//     createdBy:null,
//     updatedAt:"2022-08-23T13:01:01.337Z",
//     updatedBy:null,
//     enabled:null,
//     organizationId:"c3d7cd44-445b-4dc8-9a71-b560d5b7d738",
//     locationId:"cc11e87c-1408-402a-bf13-701f881c282d",
//     businessTypeId:"ea05f177-fc5b-4d83-a92e-867208f18a1a",
//     sectionId:"015ef0ba-87a7-4a12-a1d6-c7465c865598",
//     entityId:"c0e51cce-4aa2-42d0-a133-73c6e22430a5",
//     userType:"IDP",
//     status:true,
//     avatar:"4409ca08-cc05-4497-9256-0449f266413b.jpg"
//   }


});
