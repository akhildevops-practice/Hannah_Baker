import parseToken from "../parseToken";
import getToken from "../getToken";
import { truncate } from "fs/promises";

/**
 * @param value Access Value (Either true or false)
 * @param action Array of actions
 * @param checkAccess Optional argument, determines whether to look at the token or not for checking access
 * @returns The specific access the role has to actions
 */

function checkActionsAllowed(
  value: any,
  action: string[],
  checkAccess = false
) {
  let access: any = [];
  if (checkAccess) {
    if (!value) return action;
    return [];
  } else {
    let token = getToken();
    let parsedToken = parseToken(token);
    let username = parsedToken?.preferred_username;
    if (username) {
      if (value === username) {
        action.forEach((item) => {
          access.push(item);
        });
      }
    }
    return access;
  }
}

export default checkActionsAllowed;
