import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import store from "./store/store";
import { Provider } from "react-redux";

import jmsLogo from "./assets/jms.png";

const setFavicon = (icon) => {
  let link = document.querySelector("link[rel~='icon']");

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.href = icon;
};

setFavicon(jmsLogo);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);