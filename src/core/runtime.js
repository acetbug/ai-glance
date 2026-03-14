/** 运行时 DOM 工具函数 */

/**
 * 进入选择模式，允许用户点击对话轮次进行选中
 * @param {Element} el 轮次元素
 * @param {Function} onToggleSelection 选中状态切换回调
 */
export function enterSelection(el, onToggleSelection) {
  if (el.querySelector(".aig-turn-check")) return;
  el.classList.add("aig-selectable");
  el.style.position ||= "relative";

  const check = document.createElement("div");
  check.className = "aig-turn-check";

  const callback = (e) => {
    if (e.target.closest("a, button:not(.aig-turn-check)")) return;
    e.preventDefault();
    el.classList.toggle("aig-selected");
    check.classList.toggle("aig-checked");
    onToggleSelection();
  };
  el.addEventListener("click", callback);
  el._aigToggle = callback;

  el.prepend(check);
}

/**
 * 退出选择模式
 * @param {Element} el 轮次元素
 */
export function exitSelection(el) {
  if (el._aigToggle) {
    el.removeEventListener("click", el._aigToggle);
    delete el._aigToggle;
  }
  el.classList.remove("aig-selectable", "aig-selected");
  el.querySelector(".aig-turn-check")?.remove();
}

/**
 * 克隆一组元素并清洗为最简数据
 * 合并了安全清理、非内容元素移除、插件UI移除、class剥离
 * @param {Element} el
 * @returns {Element}
 */
export function cloneAndClean(el) {
  const clone = document.createElement("div");
  el.childNodes.forEach((child) => {
    clone.appendChild(child.cloneNode(true));
  });

  clone
    .querySelectorAll(
      '.aig-turn-check, script, style, link, iframe, frame, object, embed, applet, noscript, base, meta, [onload], [onerror], button, [role="button"], svg',
    )
    .forEach((n) => n.remove());
  clone.querySelectorAll("*").forEach((n) => {
    if (n.hasAttribute("class")) n.removeAttribute("class");
    for (const attr of [...n.attributes])
      if (attr.name.startsWith("on")) n.removeAttribute(attr.name);
  });

  return clone;
}
