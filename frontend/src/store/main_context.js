import React, { useEffect } from "react";
import { useState } from "react";
import jwt_decode from "jwt-decode";

let logoutTimer;

const MainContext = React.createContext({
  MAIN_URI:
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_MAIN_URI
      : process.env.REACT_APP_LOCAL_URI,
  auth: {
    isLoggedIn: false,
    token: null,
    refreshToken: null,
    user: "",
    loginHandler: () => {},
    logoutHandler: () => {},
  },
  homeRight: {
    yaml_data: {},
    setYAMLChanged: () => {},
    setCustYAMLChanged: () => {},
    selectedLink: [],
    setIsLoading: () => {},
    inputData: {},
  },
  notify: {
    setShowNotify: () => {},
  },
  jobLeft: {
    status: "ALL",
    user: "",
  },
  jobRight: {
    jobid: 0,
    jobLogRef: () => {},
    jobStatus: "",
    jobStartTime: "",
    jobEndTime: "",
    alertRef: () => {},
    job_meta_data: {},
  },
  utilitiesLeft: {
    user: "",
  },
  utilitiesRight: {
    utilitiesJobDataTrigger: () => {},
    updateFirmRefCon: () => {},
    updateFirmRefDis: () => {},
    runPhypRef: () => {},
    systemInfoRef: () => {},
    updateSystemRef: () => {},
    servicepackFirmRef: () => {},
    utilitiesJobDataRef: () => {},
    jobid: 0,
    jobLogRef: () => {},
    jobStatus: "",
    jobStartTime: "",
    jobEndTime: "",
    utilityCategory: "",
    alertRef: () => {},
    job_meta_data: {},
  },
});

const retrieveToken = () => {
  const token = localStorage.getItem("token");
  const expTime = localStorage.getItem("tokenExpireTime");
  const refToken = localStorage.getItem("refreshToken");
  const user_name = localStorage.getItem("user_name");
  const remTime = new Date(+expTime).getTime() - new Date().getTime();
  if (token && remTime <= 3600) {
    console.log("Token expired after reload");
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpireTime");
    localStorage.removeItem("user_name");
    localStorage.removeItem("refreshToken");
    return null;
  }

  return {
    token: token,
    duration: expTime,
    refreshToken: refToken,
    user_name: user_name,
    rem_time: remTime,
  };
};

export const MainContextProvider = (props) => {
  // Fetch values from localstorage on page load

  let initToken, initUser, initRefreshToken;
  const tokenData = retrieveToken();
  if (tokenData) {
    initToken = tokenData.token;
    initUser = tokenData.user_name;
    initRefreshToken = tokenData.refreshToken;
  }

  const [token, setToken] = useState(initToken);
  const [refreshToken, setRefreshToken] = useState(initRefreshToken);
  const [username, setUsername] = useState(initUser);
  const isLoggedIn = !!token;
  const [notifyState, setNotifyState] = useState({});

  const logoutHandler = () => {
    setToken((ps) => null);
    setRefreshToken((ps) => null);
    setUsername((ps) => null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user_name");
    localStorage.removeItem("tokenExpireTime");
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  };

  const loginHandler = (token, refreshToken) => {
    setToken((prevState) => token);
    setRefreshToken((prevState) => refreshToken);
    const data = jwt_decode(token);
    setUsername((prevState) => data.user_name);
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user_name", data.user_name);
    localStorage.setItem(
      "tokenExpireTime",
      `${new Date(+data.exp * 1000).getTime()}`
    );
    const remTime = new Date(+data.exp * 1000).getTime() - new Date().getTime();
    logoutTimer = setTimeout(() => {
      console.log("Logging out after ", remTime, " seconds");
      logoutHandler();
    }, remTime);
  };

  useEffect(() => {
    if (tokenData) {
      console.log(`Remaining time to logout ${tokenData.rem_time}`);
      logoutTimer = setTimeout(logoutHandler, tokenData.rem_time);
    }
  }, [tokenData]);

  const contextValue = {
    MAIN_URI:
      process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_MAIN_URI
        : process.env.REACT_APP_LOCAL_URI,
    auth: {
      isLoggedIn: isLoggedIn,
      token: token,
      refreshToken: refreshToken,
      user: username,
      loginHandler: loginHandler,
      logoutHandler: logoutHandler,
    },
    homeRight: {
      yaml_data: {},
      setYAMLChanged: () => {},
      setCustYAMLChanged: () => {},
      selectedLink: [],
      setIsLoading: () => {},
      inputData: {},
    },
    // notify: {
    //   //setShowNotify: () => {},
    //   setShowNotify: (newState) => {
    //     setNotifyState(newState);
    //   }
    // }
    notify: {
      setShowNotify: () => {},
    },
    jobLeft: {
      status: "ALL",
      user: "",
    },
    jobRight: {
      jobid: 0,
      jobLogRef: () => {},
      jobStatus: "",
      jobStartTime: "",
      jobEndTime: "",
      alertRef: () => {},
      job_meta_data: {},
    },
    utilitiesLeft: {
      user: "",
    },
    utilitiesRight: {
      utilitiesJobDataTrigger: () => {},
      updateFirmRefCon: () => {},
      updateFirmRefDis: () => {},
      utilitiesJobDataRef: () => {},
      runPhypRef: () => {},
      systemInfoRef: () => {},
      updateSystemRef: () => {},
      servicepackFirmRef: () => {},
      utilitiesJobDataRef: () => {},
      jobid: 0,
      jobLogRef: () => {},
      jobStatus: "",
      jobStartTime: "",
      jobEndTime: "",
      utilityCategory: "",
      alertRef: () => {},
      job_meta_data: {},
    },
  };
  return (
    <MainContext.Provider value={contextValue}>
      {props.children}
    </MainContext.Provider>
  );
};

export default MainContext;
