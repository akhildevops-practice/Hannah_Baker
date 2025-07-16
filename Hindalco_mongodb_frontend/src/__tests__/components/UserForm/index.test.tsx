import React from "react";
import {
  screen,
  render,
  fireEvent,
  waitFor,
  getByRole,
  within,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import UserForm from "../../../components/MasterAddOrEditForm/UserForm/index";
import { theme } from "../../../theme/index";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import { RecoilRoot } from "recoil";
import { SnackbarProvider } from "notistack";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

let checkSpy: any;

beforeAll(() => {
  checkSpy = jest.fn();
});

const dummySelectFieldData: any = {
  locations: ["/randomLocation", "/randomLocation", "/randomLocation"],
  sections: [
    {
      name: "sectionone",
      sectionId: "id",
    },
    {
      name: "sectiontwo",
      sectionId: "id",
    },
    {
      name: "sectionthree",
      sectionId: "id",
    },
  ],
};

const dummyDepartments: any = [
  "department",
  "department",
  "department",
  "department",
];

const dummyBusinessTypes: any = [
  "business unit",
  "business unit",
  "business unit",
  "business unit",
];

describe("<UserForm /> component tests ->", () => {
  test("should render <UserForm /> component ", () => {
    const { container } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <RecoilRoot>
            <UserForm
              locations={dummySelectFieldData?.locations}
              sections={dummySelectFieldData?.sections}
              departments={dummyDepartments}
              businessTypes={dummyBusinessTypes}
              edit={false}
              checkState={{
                MR: true,
                AUDITOR: false,
              }}
              setCheckState={true}
              checkedValues={checkSpy}
            />
          </RecoilRoot>
        </ThemeProvider>
      </SnackbarProvider>
    );

    expect(container).toBeInTheDocument();
  });

  test("should invoke handle change function when status changes", () => {
    const { container, getByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <RecoilRoot>
            <UserForm
              locations={dummySelectFieldData?.locations}
              sections={dummySelectFieldData?.sections}
              departments={dummyDepartments}
              businessTypes={dummyBusinessTypes}
              edit={false}
              checkState={{
                MR: true,
                AUDITOR: false,
              }}
              setCheckState={true}
              checkedValues={checkSpy}
            />
          </RecoilRoot>
        </ThemeProvider>
      </SnackbarProvider>
    );
    waitFor(() => {
      expect(container).toBeInTheDocument();
      getByRole("checkbox").click();
    });
  });

  test("should invoke handle function when roles changes", async () => {
    const { container, getByRole, getByText, getByTestId, getByLabelText } =
      render(
        <SnackbarProvider>
          <ThemeProvider theme={theme}>
            <RecoilRoot>
              <UserForm
                locations={dummySelectFieldData?.locations}
                sections={dummySelectFieldData?.sections}
                departments={dummyDepartments}
                businessTypes={dummyBusinessTypes}
                edit={false}
                checkState={{
                  MR: true,
                  AUDITOR: false,
                }}
                setCheckState={true}
                checkedValues={checkSpy}
              />
            </RecoilRoot>
          </ThemeProvider>
        </SnackbarProvider>
      );
    let rolesSelector: any = screen.queryByTestId("roles-select");
    // fireEvent.mouseDown(rolesSelector);

    // "MR",
    // "ORG-ADMIN",
    // "SUPER-ADMIN",
    // "LOCATION-ADMIN",
    // "PLANT-HEAD",
    await waitFor(() => {
      let optionOne: any = screen.queryByTestId("menu-item-MR");
      let optionTwo: any = screen.queryByText("ORG-ADMIN");
      let optionThree: any = screen.queryByText("SUPER-ADMIN");
      let optionFour: any = screen.queryByText("LOCATION-ADMIN");
      let optionFive: any = screen.queryByText("PLANT-HEAD");
    });
  });
});
