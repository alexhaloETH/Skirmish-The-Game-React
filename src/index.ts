import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { App } from "./app.component";
import "./styles/styles.css";

const element = document.getElementById("root")!;
const root = createRoot(element);

root.render(createElement(App));
