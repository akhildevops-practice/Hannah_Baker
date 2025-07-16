import { ReactNode } from "react";
import FormStepper from "../../../components/FormStepper";
import { screen, render, fireEvent } from "@testing-library/react";
import { theme } from "../../../theme/index";
import { ThemeProvider } from "@material-ui/core";
import CreateOrgForm from "../../../components/CreateOrgForm";
import TechnicalConfigForm from "../../../components/TechnicalConfigForm";
import OrgAdminFormContainer from "../../../containers/OrgAdminFormContainer";
import MCOEAdminFormContainer from "../../../containers/MCOEAdminFormContainer";
import BusinessConfigForm from "../../../components/BusinessConfigForm";
import { BrowserRouter as Router } from "react-router-dom";
import { RecoilRoot } from "recoil";
import BasicLayout from "../../../layout/BasicLayout/index";
import { SnackbarProvider } from "notistack";
import setToken from "../../../utils/setToken";

const steps = [
  "Organization",
  "Technical Configuration",
  "Organization Admin",
  "MCOE Admin",
  "Business Configuration",
];

const forms = [
  { form: <CreateOrgForm /> },
  { form: <TechnicalConfigForm /> },
  { form: <OrgAdminFormContainer /> },
  { form: <MCOEAdminFormContainer /> },
  { form: <BusinessConfigForm isEdit={false} /> },
];

const submitFunction = jest.fn();

beforeAll(() => {
  setToken(
    "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJlQjVlLTdpQkxoN1pCcF9rdTJoZXFLcDBMT3JmOWNScF9mWHE1RjdsaVNBIn0.eyJleHAiOjE2NDk0MzI4ODEsImlhdCI6MTY0OTM5Njg4MiwianRpIjoiZDM0NWJhMDktYWE4My00ZWZhLWE5NmQtZDNiZDEwZDNkMTIwIiwiaXNzIjoiaHR0cDovLzE5Mi4xNjguMjkuOTE6ODA4MC9hdXRoL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOlsicmVhbGhoeG1zYmRtaC1yZWFsbSIsIjEyMy1yZWFsbSIsInJlYWxtZS1yZWFsbSIsImtra2wtcmVhbG0iLCJkYXNkdy1yZWFsbSIsIm5pbXNpaC1yZWFsbSIsImJiYy1yZWFsbSIsIm1hc3Rlci1yZWFsbSIsInJlYWxoZ2hoeG1zYmRtaC1yZWFsbSIsInNvbWVyYW5kb21yZ29zc3NkLXJlYWxtIiwic2Ftc3VuZy1yZWFsbSIsInNhbXBsZTItcmVhbG0iLCJzYW1wbGUtcmVhbG0iLCJhcHBsZS1yZWFsbSIsIm9yZ2FuaXphdGlvbjEtcmVhbG0iLCJ0ZXN0b3JnNS1yZWFsbSIsImJtdy1yZWFsbSIsInBvcnNjaGUtcmVhbG0iLCJ1dXVpLXJlYWxtIiwib29wLXJlYWxtIiwiaG9uZGEtcmVhbG0iLCJzb21lcmFuZG9tcmdvc3NkLXJlYWxtIiwic29tZXJhbmRvbU9yZy1yZWFsbSIsInJlYWxobW1oLXJlYWxtIiwibGxwLXJlYWxtIiwic29tZXJhbmRvbXJnb3MtcmVhbG0iLCJzb21lcmFuc2RvbXJnc3Nvc3NzZC1yZWFsbSIsInd3ZC1yZWFsbSIsInNvbWVyYW5kb21yZ3Nvc3NzZC1yZWFsbSIsInNvbWVyYW5zc3Nkb21yZ3Nzb3Nzc2QtcmVhbG0iLCJ3ZXN0ZXJuZGlnaXRhbC1yZWFsbSIsImh1bmRyZWQtcmVhbG0iLCJyZWFsbW0tcmVhbG0iLCJyZWFsbW1oLXJlYWxtIiwib3JnMi1yZWFsbSIsImxvZ2l0ZWNoLXJlYWxtIiwiYWNlci1yZWFsbSIsInBhdGFuamFsaS1yZWFsbSIsInJlYWxoaG1taC1yZWFsbSIsInNvbWVyYW5kb21yZy1yZWFsbSIsInJlYWxoaHhtYmRtaC1yZWFsbSIsInJlYWxoZ2hoeHhtc2JkbWgtcmVhbG0iLCJocC1yZWFsbSJdLCJzdWIiOiJlZWZiNGFlNi03M2YyLTQ2ZTQtYThjOC0xYTZiOTBhNDY0M2EiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhZG1pbi1jbGkiLCJzZXNzaW9uX3N0YXRlIjoiNTNhNTA2OGItODBiYS00NThkLWE5YjUtYTdlOWU0NmM1MmFkIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMDAvKiIsIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImNyZWF0ZS1yZWFsbSIsIm9mZmxpbmVfYWNjZXNzIiwiYWRtaW4iXX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCByb2xlcyIsInNpZCI6IjUzYTUwNjhiLTgwYmEtNDU4ZC1hOWI1LWE3ZTllNDZjNTJhZCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6InByYW5pdHByYWthc2gyQGdtYWlsLmNvbSJ9.eYsKWdEws9QiB6Indeotu4VlT1k2VepwG6OZvYzjeTXToqSdWRIqqazPe66RPwYOswoY-MLC9gG7BGiikM-A2j_w1mAGCaRttH7Y3UaNsyw56g-74DIlut_U6fjPcze8hqJAq5QnostVY9dA33gwLg1jk5ugMm1RcvtmlznmElUISefxub3-z3IbWjDefZyJzdgh0VvpB5NUk-oGFktFV3dIqQKV7tVxGu0CDl0peZuAPjm_dft-ugXI8GZ9Akt_NtfdG1kJLQnfMtUaUjmrMStO4chbUjpNeUWEWfiXuaHJkt3bhHcZGD1IWRgEWWqq1MXFQt0W3_SajDh8p8Gl7w"
  );
});

describe("<FormStepper /> component tests -> ", () => {
  jest.mock("react-router-dom", () => ({
    ...(jest.requireActual("react-router-dom") as any),
    useNavigate: () => jest.fn(),
    useHref: () => "abc",
    BrowserRouter: ({ children }: { children: ReactNode }) => <>{children}</>,
    Route: ({ children }: { children: ReactNode }) => <>{children}</>,
  }));

  test("should render <FormStepper /> component", () => {
    const { container } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <RecoilRoot>
            <Router>
              <FormStepper
                backBtn={<div>backbutton</div>}
                steps={steps}
                forms={forms}
                handleFinalSubmit={submitFunction}
              />
            </Router>
          </RecoilRoot>
        </ThemeProvider>
      </SnackbarProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should render invalid form response if form data is empty", () => {
    const dummyForms: any = [];
    const { container } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <RecoilRoot>
            <Router>
              <FormStepper
                backBtn={<div>backbutton</div>}
                steps={steps}
                forms={dummyForms}
                handleFinalSubmit={submitFunction}
              />
            </Router>
          </RecoilRoot>
        </ThemeProvider>
      </SnackbarProvider>
    );
    let getInvalidFormText = screen.queryByText("Invalid Form");
    expect(getInvalidFormText).toBeInTheDocument();
  });

  test("should render mobile view when view state is equal to true", () => {
    const { container } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <Router>
            <RecoilRoot>
              <BasicLayout handleLogout={jest.fn()}>
                <FormStepper
                  backBtn={<div>backbutton</div>}
                  steps={steps}
                  forms={forms}
                  handleFinalSubmit={submitFunction}
                />
              </BasicLayout>
            </RecoilRoot>
          </Router>
        </ThemeProvider>
      </SnackbarProvider>
    );
    global.innerWidth = 500;
    global.dispatchEvent(new Event("resize"));
    let stepperNode = screen.queryByTestId("mobile-view-stepper-node");
    expect(stepperNode).toBeInTheDocument();
  });

  test("should render next form on next button click", () => {
    const { container } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <Router>
            <RecoilRoot>
              <FormStepper
                backBtn={<div>backbutton</div>}
                steps={steps}
                forms={forms}
                handleFinalSubmit={submitFunction}
              />
            </RecoilRoot>
          </Router>
        </ThemeProvider>
      </SnackbarProvider>
    );
    let nextButton: any = screen.queryByTestId("form-stepper-next-button");
    fireEvent.click(nextButton);
    let technicalConfigForm: any = screen.queryByTestId(
      "technical-config-form"
    );
    expect(technicalConfigForm).toBeInTheDocument();
  });

  test("should render previous form on previous button click", () => {
    const { container } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <Router>
            <RecoilRoot>
              <FormStepper
                backBtn={<div>backbutton</div>}
                steps={steps}
                forms={forms}
                handleFinalSubmit={submitFunction}
              />
            </RecoilRoot>
          </Router>
        </ThemeProvider>
      </SnackbarProvider>
    );
    let nextButton: any = screen.queryByTestId("form-stepper-next-button");
    fireEvent.click(nextButton);
    let backButton: any = screen.queryByTestId("form-stepper-back-button");
    fireEvent.click(backButton);
    let createOrgForm: any = screen.queryByTestId("create-org-form");
    expect(createOrgForm).toBeInTheDocument();
  });
});
