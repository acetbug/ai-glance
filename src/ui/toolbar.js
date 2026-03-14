export default class Toolbar {
  constructor(getCount, onSelectAll, onConfirm, onCancel) {
    this.toolbar = document.createElement("div");
    this.toolbar.className = "aig-selection-toolbar";
    this.toolbar.innerHTML = `
      <span class="aig-toolbar-count"></span>
      <button class="aig-toolbar-btn" data-action="selectAll">全选</button>
      <button class="aig-toolbar-btn aig-toolbar-primary" data-action="confirm">确定</button>
      <button class="aig-toolbar-btn" data-action="cancel">取消</button>
    `;
    this.toolbar.addEventListener("click", (e) => {
      const action = e.target.dataset?.action;
      switch (action) {
        case "selectAll":
          onSelectAll();
          break;
        case "confirm":
          onConfirm();
          break;
        case "cancel":
          onCancel();
          break;
      }
      this.updateCount();
    });
    this._getCount = getCount;
    this._countLabel = this.toolbar.querySelector(".aig-toolbar-count");
  }

  show() {
    document.body.appendChild(this.toolbar);
  }

  hide() {
    this.toolbar.remove();
  }

  updateCount() {
    const count = this._getCount();
    this._countLabel.textContent = count > 0 ? `已选 ${count} 条` : "";
  }
}
