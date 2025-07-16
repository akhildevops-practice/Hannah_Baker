import React from "react";
import { screen, render, fireEvent } from "@testing-library/react";
import UserForm1 from "../../../../components/MasterAddOrEditForm/UserForm/UserForm1";

let handleChangeSpy: any;

beforeAll(() => {
  handleChangeSpy = jest.fn();
});

const mockFormData = {};
const mockUserType: any = ["User Type"];

describe("<UserForm1 /> component tests -> ", () => {
  test("should render <UserForm1 /> component on the screen", () => {
    const { container } = render(
      <UserForm1
        formData={mockFormData}
        handleChange={handleChangeSpy}
        userType={mockUserType}
      />
    );
    expect(container).toBeInTheDocument();
  });
});
