import getUserId from "../../../utils/getUserId";
import setUserToken from "../../../utils/setUserId";

describe("getUserId utility tests -> ", () => {
  test("should return the expected user id from session storage ", () => {
    setUserToken("11121");
    const userid = getUserId();
    expect(userid).toBeTruthy();
  });
});
