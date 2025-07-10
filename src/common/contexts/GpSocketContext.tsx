import { useGetAccessToken, useIsAuthenticated } from "@hilma/auth";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Outlet } from "react-router-dom";
import { io } from "socket.io-client";
import { parseJwt } from "../functions/decodeToken";
import { UserInfoContextType } from "./UserContext";

const socketUri =
  import.meta.env.MODE !== "development"
    ? import.meta.env.VITE_API_URL ||
      "https://goodpoint-backend-production.up.railway.app"
    : import.meta.env.VITE_LOCAL_IP || "localhost:8080";
export const socket = io(socketUri);
export type ReceivedGp = {
  gpId: number;
  schoolId: number;
};
type GpSocketContextType = {
  didReceiveMessage: boolean;
  setDidReceiveMessage: Dispatch<SetStateAction<boolean>>;
  messageReceived: ReceivedGp;
  differentSchoolId: number | null;
  setDifferentSchoolId: Dispatch<SetStateAction<number | null>>;
};
const gpSocketContext = createContext<GpSocketContextType>({
  didReceiveMessage: false,
  setDidReceiveMessage: () => {},
  messageReceived: { gpId: 0, schoolId: 0 },
  differentSchoolId: null,
  setDifferentSchoolId: () => {},
});

export const GpSocketContext: FC<PropsWithChildren> = ({ children }) => {
  const queryClient = useQueryClient();
  const [messageReceived, setMessageReceived] = useState<ReceivedGp>({
    gpId: 0,
    schoolId: 0,
  });
  const [didReceiveMessage, setDidReceiveMessage] = useState(false);
  const [differentSchoolId, setDifferentSchoolId] = useState<number | null>(
    null
  );
  const isAuthenticated = useIsAuthenticated();
  const getToken = useGetAccessToken();

  useEffect(() => {
    console.log("🔍 GpSocketContext: Auth state changed:", isAuthenticated);

    if (!isAuthenticated) {
      console.log(
        "🔍 GpSocketContext: User not authenticated, removing socket listeners"
      );
      socket.removeAllListeners();
      return;
    }

    const token = getToken();
    console.log("🔍 GpSocketContext: Token exists:", !!token);
    if (!token) {
      console.error("❌ GpSocketContext: No token found in cookies");
      throw Error("problem with user cookies");
    }
    const user = parseJwt(token);
    console.log("🔍 GpSocketContext: Parsed user from token:", user);
    socket.on(`received-message/${user.id}`, (data: ReceivedGp) => {
      const contextSchoolId = queryClient.getQueryData<UserInfoContextType>(
        ["get-user-data"],
        {
          type: "all",
        }
      )?.currSchoolId;
      if (data.schoolId != contextSchoolId) {
        setDifferentSchoolId(data.schoolId);
      }
      setDidReceiveMessage(true);
      setMessageReceived(data);

      setTimeout(() => {
        setDidReceiveMessage(false);
      }, 2000);
    });
    return () => {
      socket.removeAllListeners();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    queryClient.invalidateQueries(["teacher-received-gps"]);
  }, [didReceiveMessage]);

  return (
    <gpSocketContext.Provider
      value={{
        didReceiveMessage,
        setDidReceiveMessage,
        messageReceived,
        differentSchoolId,
        setDifferentSchoolId,
      }}
    >
      {children}
      {<Outlet />}
    </gpSocketContext.Provider>
  );
};
export const useGpsSocket = () => useContext(gpSocketContext);
