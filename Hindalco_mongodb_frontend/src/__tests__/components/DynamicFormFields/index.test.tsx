import DynamicFormFields from "../../../components/DynamicFormFields/index";
import { fireEvent, screen, render } from "@testing-library/react";
import { orgForm } from "../../../schemas/orgForm";
import { theme } from "../../../theme";
import { ThemeProvider } from "@material-ui/core";
import BusinessConfigForm from "../../../components/BusinessConfigForm";
import { RecoilRoot } from "recoil";

const functionSpy = jest.fn();

const dummyFormData = {
  organizationId: 0,
  principalGeography: "",
  instanceUrl: "",
  organizationName: "",
  realmName: "",
  businessUnit: [{ name: "random name" }, { name: "random name two" }],
  entity: [{ name: "" }],
  section: [{ name: "" }],
  fiscalYearQuarters: "",
};

describe("<DynamicFormFields /> component tests -> ", () => {
  test("should render <DynamicFieldFields /> component", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <DynamicFormFields
          data={orgForm}
          name="businessUnit"
          setData={functionSpy}
        />
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });

  test("should invoke handle change function when value of a field changes", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <BusinessConfigForm deleteField={functionSpy} />
        </RecoilRoot>
      </ThemeProvider>
    );
    let dynamicField: any = screen.queryAllByTestId("dynamic-form-field");
    fireEvent.change(dynamicField[0], {
      target: { value: "random text" },
    });
    expect(dynamicField[0]).toHaveValue("random text");
  });

  test("should add a new field when add button is clicked", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <DynamicFormFields
            data={dummyFormData}
            setData={functionSpy}
            name="businessUnit"
          />
        </RecoilRoot>
      </ThemeProvider>
    );
    let addButton: any = screen.queryAllByTestId("field-add-button");
    fireEvent.click(addButton[0]);
    let deleteButton: any = screen.queryAllByTestId("field-delete-button");
    expect(deleteButton[0]).toBeInTheDocument();
  });

  test("should remove a field when delete button is clicked", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <DynamicFormFields
            data={dummyFormData}
            setData={functionSpy}
            name="businessUnit"
          />
        </RecoilRoot>
      </ThemeProvider>
    );
    let addButton: any = screen.queryAllByTestId("field-add-button");
    fireEvent.click(addButton[0]);
    let deleteButton: any = screen.queryAllByTestId("field-delete-button");
    fireEvent.click(deleteButton[0]);
    expect(functionSpy).toBeCalled();
  });
});
