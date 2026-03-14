export default class AdapterManager {
  constructor(...adapters) {
    this.adapters = {};
    this._currentAdapter = null;
    for (const adapter of adapters) this.register(adapter);
  }

  detect() {
    this._currentAdapter = null;
    const url = location.href;
    Object.values(this.adapters).forEach((adapter) => {
      if (adapter.urlPattern?.test(url)) this._currentAdapter = adapter;
    });
    return this._currentAdapter;
  }

  register(adapter) {
    if (adapter.name) this.adapters[adapter.name] = adapter;
  }

  getTurnElements() {
    return [
      ...document.querySelectorAll(this._currentAdapter?.turnSelector ?? ""),
    ];
  }

  getActionBar() {
    return document.querySelector(
      this._currentAdapter?.actionBarSelector ?? "",
    );
  }
}
