import getAvatar from "../../../utils/getAvatar";

describe("getAvatar utility tests -> ", () => {
  test("should get avatar from session storage ", () => {
    sessionStorage.setItem("avatar_img", "info");
    const result = getAvatar();
    expect(result).toBeUndefined();
  });
});
