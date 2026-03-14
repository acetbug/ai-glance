import Core from "./core/core.js";

const CORE_KEY = "__aiGlanceCore__";

if (!window[CORE_KEY]) {
  const core = new Core();
  core.init();
  window[CORE_KEY] = core;
}
