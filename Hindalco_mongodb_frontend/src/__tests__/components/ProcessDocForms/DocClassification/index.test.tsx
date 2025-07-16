import React from "react";
import { screen, render, fireEvent } from "@testing-library/react";
import DocClassification from "../../../../components/ProcessDocForms/DocClassification";

let clickSpy: any;
let setFormData: any;

beforeAll(() => {
  setFormData = jest.fn();
});

const mockFormData = {
  tags: ["random tag"],
  docTypes: [
    {
      id: "1231231",
      documentTypeName: "doc name",
    },
  ],
};

describe("<DocClassification /> component tests -> ", () => {
  test("should render <DocClassification /> component on the screen ", () => {
    const { container } = render(
      <DocClassification
        formData={mockFormData}
        setFormData={setFormData}
        edit={false}
      />
    );
  });

  test("should render <DocClassification /> mobile view when view prop is true", () => {
    const { container } = render(
      <DocClassification
        formData={mockFormData}
        setFormData={setFormData}
        edit={false}
        view={true}
      />
    );
  });
});
