import React from "react";
import EntityForm from "../../../components/MasterAddOrEditForm/EntityForm";
import {
  fireEvent,
  waitFor,
  screen,
  render,
  within,
} from "@testing-library/react";
import { RecoilRoot } from "recoil";
import { ThemeProvider } from "@material-ui/core";
import { theme } from "../../../theme/index";

let clickSpy: any;

beforeAll(() => {
  clickSpy = jest.fn();
});

describe("<EntityForm /> component tests ->", () => {
  test("should render <EntityForm /> component", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <EntityForm
            selectFieldData={{
              location: [{ locationName: "location one", locationId: "1" }],
              sections: [{ sectionName: "section one", sectionId: "2" }],
              entityTypes: [
                {
                  name: "entityone",
                  id: "1",
                },
              ],
            }}
            edit={false}
            bu={[
              {
                name: "bu one",
                id: "1",
              },
              {
                name: "bu two",
                id: "2",
              },
              {
                name: "bu three",
                id: "3",
              },
            ]}
            disableFormFields={false}
            handleSubmit={clickSpy}
            isLoading={false}
            isCreated={false}
          />
        </RecoilRoot>
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should invoke handle change function when field values change in the <EntityForm /> component", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <EntityForm
            selectFieldData={{
              location: [{ locationName: "location one", locationId: "1" }],
              sections: [{ sectionName: "section one", sectionId: "2" }],
              entityTypes: [
                {
                  name: "entityone",
                  id: "1",
                },
              ],
            }}
            edit={false}
            bu={[
              {
                name: "bu one",
                id: "1",
              },
              {
                name: "bu two",
                id: "2",
              },
              {
                name: "bu three",
                id: "3",
              },
            ]}
            disableFormFields={false}
            handleSubmit={clickSpy}
            isLoading={false}
            isCreated={false}
          />
        </RecoilRoot>
      </ThemeProvider>
    );

    const view = screen.getByTestId("entity-type");
    const select = within(view).getByRole("button", {
      name: /​/i,
    });
    fireEvent.mouseDown(select);
    // const entityOption: any = screen.queryByTestId('menu-entityone')
    waitFor(() => {
      const entityOption: any = screen.getByRole("option", {
        name: /entityone/i,
      });
      fireEvent.click(entityOption);
    });
  });
});
