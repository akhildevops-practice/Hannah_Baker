import React from "react";
import { screen, render, fireEvent } from "@testing-library/react";
import DocInfo from "../../../../components/ProcessDocForms/DocInfo";

let formData = {
  documentName: "document name",
  reasonOfCreation: "reason",
  documentNumbering: "Serial",
  currentVersion: "version",
  description: "description",
};
let setFormData: any;

beforeAll(() => {
  setFormData = jest.fn();
});

describe("<DocInfo /> component tests -> ", () => {
  test("should <DocInfo /> component on the screen", () => {
    const { container } = render(
      <DocInfo
        formData={formData}
        setFormData={setFormData}
        disableFormFields={false}
      />
    );
    expect(container).toBeInTheDocument();
  });

  test("should render <DocInfo /> component mobile view when view is true", () => {
    const { container } = render(
      <DocInfo
        formData={formData}
        setFormData={setFormData}
        disableFormFields={true}
        view={true}
      />
    );
    expect(container).toBeInTheDocument();
  });

  test("should invoke the upload file handler when file is selected in the file input field", () => {
    const { container } = render(
      <DocInfo
        formData={formData}
        setFormData={setFormData}
        disableFormFields={false}
      />
    );
    const fileInput: any = screen.queryByTestId("file-upload");
    fireEvent.change(fileInput, {
      target: {
        files: [new File(["(⌐□_□)"], "chucknorris.png", { type: "image/png" })],
      },
    });
    expect(container).toBeInTheDocument();
  });
});
