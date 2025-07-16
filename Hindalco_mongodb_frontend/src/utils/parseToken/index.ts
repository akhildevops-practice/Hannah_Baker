/**
 * This function parses the token by converting it to the base64
 * 
 * @param token
 * @returns parsed data from the token
 */

function parseToken (token:any) {
  if(token){
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  
    return JSON.parse(jsonPayload);
  }
}

export default parseToken;
