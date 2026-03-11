import { BaseAdapter } from "./base.js";

export class GeminiAdapter extends BaseAdapter {
  get name() {
    return "gemini";
  }

  static matches(url) {
    return /^https:\/\/gemini\.google\.com/i.test(url);
  }

  get turnSelector() {
    return ".query-text, .response-content";
  }

  get actionBarSelector() {
    return "top-bar-actions .right-section";
  }
}
