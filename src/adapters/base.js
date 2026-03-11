/**
 * 站点适配器基类
 * 子类只需提供 turnSelector 和 actionBarSelector
 */
export class BaseAdapter {
  /** 站点标识 */
  get name() {
    throw new Error("adapter must define name");
  }

  /** 判断当前页面是否由此适配器处理 */
  static matches(_url) {
    return false;
  }

  /** 单个对话轮次（turn）选择器 — 最小单位 */
  get turnSelector() {
    return "";
  }

  /** 页面顶部操作栏选择器（主按钮插入位置） */
  get actionBarSelector() {
    return "";
  }

  /** 获取页面上所有 turn 元素 */
  getTurnElements() {
    return [...document.querySelectorAll(this.turnSelector)];
  }

  /** 获取操作栏容器 */
  getActionBar() {
    return document.querySelector(this.actionBarSelector);
  }
}
