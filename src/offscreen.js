/* global chrome */

import { snapdom } from "@zumer/snapdom";

const host = document.createElement("div");
document.body.appendChild(host);
const activeBlobUrls = new Set();

function clearHost() {
  while (host.firstChild) {
    host.firstChild.remove();
  }
}

async function renderHtmlToBlob(html, options = {}) {
  clearHost();

  const wrapper = document.createElement("template");
  wrapper.innerHTML = html;
  const container = wrapper.content.firstElementChild;
  if (!container) throw new Error("Invalid render html");

  host.appendChild(container);
  container.getBoundingClientRect();
  await new Promise((r) => setTimeout(r, 0));

  const blob = await snapdom.toBlob(container, options);

  clearHost();

  return blob;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "AIG_OFFSCREEN_REVOKE_URL") {
    if (message.url && activeBlobUrls.has(message.url)) {
      URL.revokeObjectURL(message.url);
      activeBlobUrls.delete(message.url);
    }
    sendResponse({ ok: true });
    return;
  }

  if (message?.type !== "AIG_OFFSCREEN_RENDER") return;

  renderHtmlToBlob(message.html, message.options).then((blob) => {
    const blobUrl = URL.createObjectURL(blob);
    activeBlobUrls.add(blobUrl);
    sendResponse({
      ok: true,
      payload: {
        blobUrl,
        size: blob.size,
      },
    });
  });

  return true;
});
