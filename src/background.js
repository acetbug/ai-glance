/* global chrome */

const OFFSCREEN_PATH = "offscreen.html";
const OFFSCREEN_URL = chrome.runtime.getURL(OFFSCREEN_PATH);

async function ensureOffscreenDocument() {
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [OFFSCREEN_URL],
  });
  if (contexts.length > 0) return;

  await chrome.offscreen.createDocument({
    url: OFFSCREEN_PATH,
    reasons: ["BLOBS"],
    justification:
      "Render long chat captures off the active page to reduce UI jank.",
  });
}

function sendToOffscreen(message) {
  return new Promise((resolve) =>
    chrome.runtime.sendMessage(message, (response) =>
      resolve(response.payload),
    ),
  );
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "AIG_REVOKE_BLOB_URL") {
    chrome.runtime.sendMessage(
      { type: "AIG_OFFSCREEN_REVOKE_URL", url: message.url },
      () => {
        sendResponse({ ok: true });
      },
    );
    return true;
  }

  if (message?.type !== "AIG_RENDER_REQUEST") return;

  (async () => {
    await ensureOffscreenDocument();
    const payload = await sendToOffscreen({
      type: "AIG_OFFSCREEN_RENDER",
      html: message.html,
      options: message.options,
    });
    sendResponse({ ok: true, payload });
  })();

  return true;
});
