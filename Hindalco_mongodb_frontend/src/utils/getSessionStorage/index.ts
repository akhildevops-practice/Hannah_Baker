/**
 * This function retrieves the token from the session storage.
 *
 * @returns cached user details
 */

function getSessionStorage() {
    let userDetails = JSON.parse(sessionStorage.getItem("userDetails") as any);
    return userDetails;
}

export default getSessionStorage;
