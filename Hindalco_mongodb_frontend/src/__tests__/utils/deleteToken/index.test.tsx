import deleteToken from "../../../utils/deleteToken";

describe("deleteToken utility tests -> ", () => {
  test("should delete the token when it is present", () => {
    sessionStorage.setItem("kc_token", "random_token");
    deleteToken();
    let token = sessionStorage.getItem("kc_token");
    expect(token).toBeNull();
  });
});
