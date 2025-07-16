/**
 * @method getUserId
 * @description Function to extract user id from session storage
 * @returns a user id
 */
const getUserId = () => {
  let userInfo: any = sessionStorage.getItem("userDetails");
  let parseData = JSON.parse(userInfo);
  return parseData.id;
};

export default getUserId;
