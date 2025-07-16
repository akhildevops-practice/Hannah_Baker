import checkActionsAllowed from "../../../utils/checkActionsAllowed";
import setToken from "../../../utils/setToken";

const userToken =
  "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJyVFN1czhlUWJVS1NEY1Jld2ZSYUg1Ym50enZVLTZMOHZOMEtkS3BfTkZJIn0.eyJleHAiOjE2NjE5MjQ0ODYsImlhdCI6MTY2MTkyNDE4NiwiYXV0aF90aW1lIjoxNjYxOTIyOTg1LCJqdGkiOiI5YmNmMjRjYS0xMzYzLTQ4ZDAtYWRlYS1mNTE3OTU3ZjJmN2QiLCJpc3MiOiJodHRwOi8vMTkyLjE2OC4yOS4xMjQ6ODA4MC9hdXRoL3JlYWxtcy9iZW5xIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImY3NmM0MjU5LTA3NTUtNDE4MC04YTc0LTRjYWRhNjE1YzQzNCIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFkbWluLWNsaSIsIm5vbmNlIjoiZjk5ZWI3MTctMGQwZS00ZWJmLThiYmYtZWYxN2QxNTU5ZWNkIiwic2Vzc2lvbl9zdGF0ZSI6ImZhM2M5MDc0LTlkYzMtNDhkZS04ZDhiLTM5NDBhODY4ZWRiNSIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cDovL2JlbnEubG9jYWxob3N0OjMwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtYmVucSIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJBVURJVE9SIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6ImZhM2M5MDc0LTlkYzMtNDhkZS04ZDhiLTM5NDBhODY4ZWRiNSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6Ik1yaWR1bCBhdWRpdG9yIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYXVkaXRvciIsImdpdmVuX25hbWUiOiJNcmlkdWwiLCJmYW1pbHlfbmFtZSI6ImF1ZGl0b3IiLCJlbWFpbCI6Im1yaWR1bDEwMjRAZ21haWwuY29tIn0.XMRpswc8YsG2J-LgdFX-oyi7q-ZeMEJM3KhOGTwpQnJ4dQzvDIBuFVPPrmthlrCFZH5vY9vIHeVSx-mC66hzxh4j50tUdMJCmSPjJVJFz9AvrGIDWPmhxS_CptnATlJtZFQNfT2hn1Iv0z5ul4HS46QdZu__u_MrLvzvmrr45phxFzHscAbVBGJ90CbCPLqbBqS2YRiiq16GGrv8z92CpWPwRs70HDTFasaJ1y6rPJqWaNecZTzXTiTCiDTJpI0rr8uN2rt-wBSPEfxYBCV8lSDNiQ3Tw5EWoWUHBzdwDhLbMssDJoxeaBHhK8eURpldwAd9vXcBiYdBOUPCHh8khw";

describe("checkActionsAllowed utility tests -> ", () => {
  test("should return an empty option list when ", () => {
    setToken(userToken);
    let result = checkActionsAllowed(true, ["Random Option"]);
    expect(result).toStrictEqual([]);
  });

  test("should return an option list provided as the argument while invoking the checkActionAllowed", () => {
    setToken(userToken);
    let result = checkActionsAllowed(false, ["Random Option"], true);
    expect(result).toStrictEqual(["Random Option"]);
  });

  test("should return an action list when the the username is specified and checkAccess is not specified", () => {
    setToken(userToken);
    let result = checkActionsAllowed("auditor", ["Random Option"]);
    expect(result).toStrictEqual(["Random Option"]);
  });
});
