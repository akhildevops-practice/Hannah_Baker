import checkButtonOptions from "../../../utils/checkButtonOptions";

describe("checkButtonOptions utility tests -> ", () => {
  test("should display button options when state is equal to DRAFT ", () => {
    let expectedOptions: any = ["Save as Draft", "Send for Review"];
    let options: any = checkButtonOptions("DRAFT", []);
    expect(options).toStrictEqual(expectedOptions);
  });

  test("should display button options when state is equal to IN_REVIEW", () => {
    let expectedOptions: any = ["In Review"];
    let options = checkButtonOptions("IN_REVIEW", []);
    expect(options).toStrictEqual(expectedOptions);
  });

  test("should display button options when state is equal to REVIEW_COMPLETE", () => {
    let expectedOptions: any = ["Send for Approval"];
    let options = checkButtonOptions("REVIEW_COMPLETE", []);
    expect(options).toStrictEqual(expectedOptions);
  });

  test("should display button options when state is equal to APPROVED", () => {
    let expectedOptions: any = ["Publish"];
    let options = checkButtonOptions("APPROVED", []);
    expect(options).toStrictEqual(expectedOptions);
  });

  test("should display button options when state is equal to IN_APPROVAL", () => {
    let expectedOptions: any = ["In Approval"];
    let options = checkButtonOptions("IN_APPROVAL", []);
    expect(options).toStrictEqual(expectedOptions);
  });

  test("should display button options when state is equal to PUBLISHED", () => {
    let expectedOptions: any = ["Amend"];
    let options = checkButtonOptions("PUBLISHED", []);
    expect(options).toStrictEqual(expectedOptions);
  });

  test("should display button options when state is equal to AMMEND", () => {
    let expectedOptions: any = ["Save as Draft", "Send for Review"];
    let options = checkButtonOptions("AMMEND", []);
    expect(options).toStrictEqual(expectedOptions);
  });
});
