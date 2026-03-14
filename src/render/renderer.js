/* global chrome */

/**
 * 渲染器 — 将带内联样式的容器元素渲染为 PNG Blob
 *
 * 优先走 background/offscreen 渲染，失败时回退到内容页本地渲染
 */
function sendRenderRequest(html, options) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: "AIG_RENDER_REQUEST", html, options },
      (response) => resolve(response.payload),
    );
  });
}

function revokeOffscreenBlobUrl(url) {
  if (!url) return;
  chrome.runtime.sendMessage({ type: "AIG_REVOKE_BLOB_URL", url });
}

/**
 * @param {Element} container
 * @returns {Promise<Blob>}
 */
export default async function render(container) {
  const html = container.outerHTML;
  const payload = await sendRenderRequest(html, {
    type: "png",
    scale: 1.5,
    embedFonts: false,
    fast: true,
    compress: true,
  });
  const res = await fetch(payload.blobUrl);
  const blob = await res.blob();
  revokeOffscreenBlobUrl(payload.blobUrl);
  return blob;
}
