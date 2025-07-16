import React from "react";
import AutoComplete from "../../../components/AutoComplete";
import {
  screen,
  render,
  fireEvent,
  getByText,
  waitFor,
} from "@testing-library/react";
import { ThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { theme } from "../../../theme/index";

let clickSpy: () => void;
let setFormData: any;
let getSuggestionList: any;

const formData = {
  id: "",
  documentTypeName: "",
  reviewFrequency: "",
  documentNumbering: "",
  prefix: [],
  suffix: [],
  readAccess: "",
  creators: [],
  reviewers: [],
  approvers: [],
  users: [],
};

beforeAll(() => {
  clickSpy = jest.fn();
  setFormData = jest.fn();
  getSuggestionList = jest.fn();
});

describe("<AutoComplete /> component tests -> ", () => {
  test("should display <AutoComplete /> component", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <AutoComplete
            suggestionList={[
              {
                users: "name",
              },
            ]}
            name="Users"
            keyName="users"
            formData={formData}
            setFormData={setFormData}
            getSuggestionList={getSuggestionList}
            defaultValue={[]}
            type="RA"
          />
        </RecoilRoot>
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  //   test("should invoke the change handler when an option is clicked", () => {
  //     const { container } = render(
  //       <ThemeProvider theme={theme}>
  //         <RecoilRoot>
  //           <AutoComplete
  //             suggestionList={[
  //               {
  //                 users: "name",
  //               },
  //             ]}
  //             name="Users"
  //             keyName="users"
  //             formData={formData}
  //             setFormData={setFormData}
  //             getSuggestionList={getSuggestionList}
  //             defaultValue={[]}
  //             type="RA"
  //           />
  //         </RecoilRoot>
  //       </ThemeProvider>
  //     );
  //     consoel
  //     expect(container).toBeInTheDocument();
  //   });
});
