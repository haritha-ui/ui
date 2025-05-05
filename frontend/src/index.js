import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App";
import { MainContextProvider } from "./store/main_context";
import UserProvider from './hooks/UserContext';


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <MainContextProvider>
    <UserProvider>
      <BrowserRouter>
        <App className="root" />
      </BrowserRouter>
    </UserProvider>
  </MainContextProvider>
);
