import React from "react";
import { fireEvent, screen, render } from "@testing-library/react";
import UserForm2 from "../../../../components/MasterAddOrEditForm/UserForm/UserForm2";

let handleChangeSpy: any;

beforeAll(() => {
  handleChangeSpy = jest.fn();
});

const mockFormData = {};
const mockBusinessTypes: any = [
  {
    id: "123123123",
    name: "Business Type",
  },
];
const mockDepartments: any = [
  {
    id: "112312312",
    entityName: "Entity Name",
  },
];
const mockLocations: any = [
  {
    id: "1231231",
    locationName: "Random Location",
  },
];
const mockSections: any = [
  {
    sectionId: "1213123123",
    name: "Section Name",
  },
];

describe("<UserForm2 /> component tests -> ", () => {
  test("should render <UserForm2 /> component on the screen", () => {
    const { container } = render(
      <UserForm2
        formData={mockFormData}
        handleChange={handleChangeSpy}
        businessTypes={mockBusinessTypes}
        departments={mockDepartments}
        locations={mockLocations}
        sections={mockSections}
        edit={false}
      />
    );
    expect(container).toBeInTheDocument();
  });
});
