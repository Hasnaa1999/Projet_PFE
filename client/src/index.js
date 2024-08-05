import React from 'react';
import ReactDOM from "react-dom";
import './index.css';
import { configureStore } from "@reduxjs/toolkit";
import App from './App';

import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";

import { ContextProvider } from "./contexts/ContextProvider";

ReactDOM.render(
  <ContextProvider>
    <App />
  </ContextProvider>,
  document.getElementById("root")
);
