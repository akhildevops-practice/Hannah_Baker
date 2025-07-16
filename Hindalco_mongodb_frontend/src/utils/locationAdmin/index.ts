import getToken from "../getToken";
import parseToken from "../parseToken";
import capitalizeFirstLetter from "../capitalizeFirstLetter";

export default function locationAdmin(): string {
  const token = getToken();
  const parsedToken = parseToken(token);
  // console.log("parsedToken", parsedToken);
  const rolesList = [
    "AUDITOR",
    "ENTITY-HEAD",
    "ORG-ADMIN",
    "admin",
    "LOCATION-ADMIN",
    "MR",
  ];

  let roleName = "";

  rolesList.forEach((item) => {
    if (parsedToken.realm_access?.roles?.includes(item)) {
      if (item === "MR") {
        roleName += " IMSC";
      } else if (item === "ORG-ADMIN") {
        roleName += " MCOE";
      } else {
        roleName += " " + item;
      }
    }
  });

  const roles = roleName.trim().replace("-", " ").split(" ");

  const capitalisedRoles = roles.map((role) => capitalizeFirstLetter(role));

  const locationAdmin = capitalisedRoles.join(" ");

  return locationAdmin;
}
