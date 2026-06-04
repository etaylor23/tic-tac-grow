import React from "react";
import { createRoot } from "react-dom/client";
import "./assets/index";
import { Main } from "./main";

const container = document.getElementById("root");
if (!container) throw new Error("missing #root element");
createRoot(container).render(<Main />);
