import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
} from "react";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Updater, useImmer } from "use-immer";

import { useIsAuthenticated } from "@hilma/auth";
import { DEFAULT_LANG } from "../../i18n/i18n-consts";
import { Language } from "../../i18n/init-i18n";
import { useChangeLanguage, useLanguage } from "../../i18n/mainI18n";
import { sortObjBy } from "../functions";

import { ClassList, StarredStudyGroup } from "../types/UserContext.type";

import Loading from "../../components/Loading";

export type UserInfoContextType = {
  starred: { classes: ClassList[]; studyGroups: StarredStudyGroup[] };
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  preferredLanguage: Language;
  systemNotifications: boolean;
  goodPointsCount: string;
  schools: { schoolId: number; schoolName: string }[];
  currSchoolId: number;
  unreadGps: number;
  idmUser: boolean;
};

const initialValues: UserInfoContextType = {
  starred: { classes: [], studyGroups: [] },
  username: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  preferredLanguage: DEFAULT_LANG,
  systemNotifications: true,
  goodPointsCount: "",
  schools: [],
  currSchoolId: 0,
  unreadGps: 0,
  idmUser: false,
};

const UserContext = createContext<{
  user: UserInfoContextType;
  setUser: Updater<UserInfoContextType>;
}>({
  user: initialValues,
  setUser: () => {},
});

export const UserProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useImmer<UserInfoContextType>(initialValues);
  const isAuthenticated = useIsAuthenticated();
  const changeLang = useChangeLanguage();
  const currentLang = useLanguage();

  const { isLoading, data, error } = useQuery(
    ["get-user-data"],
    async () => {
      console.log("🔍 UserContext: Fetching user data...");
      console.log("🔍 UserContext: isAuthenticated =", isAuthenticated);
      console.log("🔍 UserContext: API URL =", axios.defaults.baseURL);

      try {
        const response = await axios.get("/api/staff/get-user-data");

        console.log(
          "✅ UserContext: User data fetched successfully",
          response.data
        );

        // בדיקה נוספת שהתשובה היא JSON ולא HTML
        if (
          typeof response.data === "string" &&
          response.data.includes("<!DOCTYPE html>")
        ) {
          console.error("❌ UserContext: Server returned HTML instead of JSON");
          throw new Error("Server returned HTML instead of JSON");
        }

        return response.data as UserInfoContextType;
      } catch (error) {
        console.error("❌ UserContext: Error fetching user data:", error);
        throw error;
      }
    },
    {
      enabled: isAuthenticated,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  useEffect(() => {
    if (data && typeof data === "object" && !Array.isArray(data)) {
      console.log("🔧 UserContext: Processing user data...");

      // בדיקה שהנתונים הם באמת אובייקט משתמש תקין
      if (!data.username && !data.firstName) {
        console.error("❌ UserContext: Invalid user data received:", data);
        return;
      }

      // אם המשתמש כבר קיים עם אותו username, אל תעבד שוב
      if (user.username && user.username === data.username) {
        console.log(
          "✅ UserContext: User data already processed for this user"
        );
        return;
      }

      // יצירת עותק של הנתונים כדי לא לשנות את המקור
      const processedData = {
        ...data,
        starred: {
          classes: data.starred?.classes
            ? [...data.starred.classes].sort((a, b) =>
                sortObjBy(a, b, ["grade", "classIndex"])
              )
            : [],
          studyGroups: data.starred?.studyGroups
            ? [...data.starred.studyGroups].sort((a, b) =>
                sortObjBy(a, b, "name")
              )
            : [],
        },
      };

      setUser(processedData);
      console.log(
        "🔄 UserContext: Current language:",
        currentLang,
        "Preferred language:",
        processedData.preferredLanguage
      );

      // שנה שפה רק אם השפה המועדפת שונה מהנוכחית
      if (processedData.preferredLanguage !== currentLang) {
        console.log(
          "🔄 UserContext: Changing language to:",
          processedData.preferredLanguage
        );
        changeLang(processedData.preferredLanguage);
      } else {
        console.log(
          "✅ UserContext: Language is already correct, no change needed"
        );
      }

      console.log("✅ UserContext: User data processed and set");
    } else if (data && typeof data === "string") {
      console.error("❌ UserContext: Received HTML instead of JSON user data");
      console.error("❌ UserContext: This indicates a server routing issue");
    }
  }, [data, setUser, changeLang, currentLang, user.username]);

  useEffect(() => {
    console.log("🔍 UserContext: Auth state changed:", {
      isAuthenticated,
      isLoading,
      error: !!error,
    });
  }, [isAuthenticated, isLoading, error]);

  if (error) {
    console.error("❌ UserContext: Error in user data fetch:", error);
  }

  return isLoading && isAuthenticated ? (
    <Loading force />
  ) : (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
