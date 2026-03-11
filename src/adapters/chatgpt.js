import { BaseAdapter } from "./base.js";

export class ChatGPTAdapter extends BaseAdapter {
  get name() {
    return "chatgpt";
  }

  static matches(url) {
    return /^https:\/\/(chatgpt\.com|chat\.openai\.com)/i.test(url);
  }

  get turnSelector() {
    return "article";
  }

  get actionBarSelector() {
    return "#conversation-header-actions";
  }
}
