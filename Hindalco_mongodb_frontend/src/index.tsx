import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
// import { SocketProvider } from "./components/SocketProvider/index";
import { MODE } from "./config";

/**
 * This section overrides the console log function calls with a blank body in production
 */

if (MODE === "production") console.log = () => {};

ReactDOM.render(
  // <React.StrictMode>
  // <SocketProvider>
  <App />,
  /* </SocketProvider>, */
  // </React.StrictMode>,
  document.getElementById("root")
);
