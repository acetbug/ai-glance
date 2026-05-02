/**
 * 显示一个短暂的消息提示
 * @param {string} msg 要显示的消息内容
 * @param {string|boolean} [type='success'] 类型：success/error/warning/info 或布尔值（true=error）
 * @param {number} [duration=2500] 显示时长（毫秒）
 */
const ICONS = {
  success: `<svg class="aig-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  error: `<svg class="aig-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg class="aig-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info: `<svg class="aig-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
};

let currentToast = null;

export default function showToast(msg, type = "success", duration = 2500) {
  if (currentToast) {
    currentToast.classList.add("aig-toast-out");
    setTimeout(() => {
      if (currentToast?.parentNode) currentToast.remove();
    }, 200);
  }

  const isError = typeof type === "boolean" ? type : false;
  const toastType = typeof type === "string" ? type : isError ? "error" : "success";

  const toast = document.createElement("div");
  toast.className = `aig-toast aig-toast-${toastType}`;
  toast.innerHTML = `${ICONS[toastType] || ICONS.success}<span>${msg}</span>`;

  document.body.appendChild(toast);
  currentToast = toast;

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add("aig-toast-out");
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
        if (currentToast === toast) currentToast = null;
      }, 200);
    }
  }, duration);

  return toast;
}

export function showSuccess(msg) {
  return showToast(msg, "success");
}

export function showError(msg) {
  return showToast(msg, "error");
}

export function showWarning(msg) {
  return showToast(msg, "warning");
}

export function showInfo(msg) {
  return showToast(msg, "info");
}
