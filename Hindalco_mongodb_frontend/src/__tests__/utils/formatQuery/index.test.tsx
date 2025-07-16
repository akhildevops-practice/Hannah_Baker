import formatQuery from "../../../utils/formatQuery";

describe("FormatQuery utility test", () => {
  test("should return the expected result", () => {
    let expectedUrl =
      "/api/organization?orgName=randomOrg&orgAdmin=randomAdmin&";
    let url = formatQuery(
      `/api/organization`,
      {
        orgName: "randomOrg",
        orgAdmin: "randomAdmin",
      },
      ["orgName", "orgAdmin"]
    );
    expect(url).toEqual(expectedUrl);
  });
});
