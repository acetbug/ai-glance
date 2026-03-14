/**
 * 显示一个短暂的消息提示
 * @param {string} msg 要显示的消息内容
 * @param {boolean} [isError=false] 是否为错误消息，影响样式
 */
export default function showToast(msg, isError = false) {
  const toast = document.createElement("div");
  toast.className = `aig-toast${isError ? " aig-toast-error" : ""}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}
