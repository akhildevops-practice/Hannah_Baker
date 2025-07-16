import { createContext, useContext, useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import { API_LINK } from "../../config";

// type Props = {
//   children: any;
// };

// const SocketContext = createContext({
//   socket: undefined,
// });

// /**
//  * @description A wrapper for connecting to the websocket and initialize a socket instance. This can be shared accross different
//  * @param children {any}
//  * @returns
//  */
// export const SocketProvider = ({ children }: Props) => {
//   const [socket, setSocket] = useState<any>(null);

//   useEffect(() => {
//     setSocket(io(`${API_LINK}`, { transports: ["websocket"] }));
//     return () => {
//       socket?.disconnect();
//     };
//   }, []);

//   return (
//     <SocketContext.Provider value={{ socket }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export default SocketContext;
