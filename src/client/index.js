import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";

// Load global bootstrap styles
import "bootstrap-css/lib/buttons.css";

import GameApp from "./App";

const render = Application =>
  ReactDOM.render(
    <AppContainer>
      <Application />
    </AppContainer>,
    document.getElementById("root")
  );

render(GameApp);

if (module.hot) {
  module.hot.accept("./App", () => render(GameApp));
}
