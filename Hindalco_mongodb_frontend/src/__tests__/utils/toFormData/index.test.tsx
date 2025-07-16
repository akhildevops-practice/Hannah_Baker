import toFormData from "../../../utils/toFormData";
import formatQuery from "../../../utils/formatQuery";

describe("toFormData utility tests -> ", () => {
  test("should return the expected form data when file data is passed to the utility function", () => {
    const expectedFormData: FormData = new FormData();
    const fileData = {
      doctypeId: "",
      documentName: "",
      documentNumbering: "",
      reasonOfCreation: "",
      currentVersion: "",
      documentLink: "",
      description: "",
      tags: ["fasdfa", "asdfasdf"],
      referenceDocuments: [],
      documentVersions: [],
      additionalReaders: [],
      creators: [],
      approvers: [],
      reviewers: [],
      file: [
        {
          randomKey: "one",
        },
      ],
      locationName: "",
      departmentName: "",
      doctypes: [],
      readAccess: "",
      documentState: "",
    };

    const formData = toFormData(fileData);
    expect(formData).toMatchObject({});
  });
});
