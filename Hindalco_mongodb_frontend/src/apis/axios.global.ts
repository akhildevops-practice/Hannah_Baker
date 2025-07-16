import Axios from "axios";
import { API_LINK } from "../config";
import getToken from "../utils/getToken";

/**
 * This is the Axios interceptor with our custom settings.
 * @returns {AxiosConfig}
 */

let axios = Axios.create({
  baseURL: API_LINK,
});

axios.interceptors.request.use((config: any) => {
  let token = getToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axios;
