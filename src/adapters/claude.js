import { BaseAdapter } from "./base.js";

export class ClaudeAdapter extends BaseAdapter {
  get name() {
    return "claude";
  }

  static matches(url) {
    return /^https:\/\/claude\.ai/i.test(url);
  }

  get turnSelector() {
    return '[data-test-render-count="1"]';
  }

  get actionBarSelector() {
    return '[data-testid="wiggle-controls-actions"]';
  }
}
