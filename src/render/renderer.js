/* global chrome */

/**
 * 渲染器 — 将带内联样式的容器元素渲染为 PNG Blob
 *
 * 优先走 background/offscreen 渲染，失败时回退到内容页本地渲染
 * 支持自定义 scale、重试机制
 */

const MAX_RETRIES = 2;
const RETRY_DELAY = 500;

function sendRenderRequest(html, options) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Render request timeout"));
    }, 30000);

    chrome.runtime.sendMessage(
      { type: "AIG_RENDER_REQUEST", html, options },
      (response) => {
        clearTimeout(timeout);
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response?.payload) {
          resolve(response.payload);
        } else {
          reject(new Error("Invalid response from renderer"));
        }
      },
    );
  });
}

function revokeOffscreenBlobUrl(url) {
  if (!url) return;
  try {
    chrome.runtime.sendMessage({ type: "AIG_REVOKE_BLOB_URL", url });
  } catch (e) {
    console.warn("Failed to revoke blob URL:", e);
  }
}

/**
 * 延迟执行
 * @param {number} ms 毫秒数
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 渲染容器为 Blob，带重试机制
 * @param {Element} container
 * @param {object} options
 * @param {number} options.scale 渲染缩放倍数
 * @param {number} options.maxRetries 最大重试次数
 * @returns {Promise<Blob>}
 */
export default async function render(container, options = {}) {
  const scale = options.scale || 2;
  const maxRetries = options.maxRetries ?? MAX_RETRIES;
  const html = container.outerHTML;

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await delay(RETRY_DELAY * attempt);
      }

      const payload = await sendRenderRequest(html, {
        type: "png",
        scale: scale,
        embedFonts: false,
        fast: true,
        compress: true,
        attempt: attempt + 1,
      });

      const res = await fetch(payload.blobUrl);
      const blob = await res.blob();
      revokeOffscreenBlobUrl(payload.blobUrl);

      if (!blob || blob.size === 0) {
        throw new Error("Rendered blob is empty");
      }

      return blob;
    } catch (error) {
      lastError = error;
      console.warn(`Render attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt < maxRetries) {
        console.info(`Retrying in ${RETRY_DELAY * (attempt + 1)}ms...`);
      }
    }
  }

  throw new Error(`Render failed after ${maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`);
}

/**
 * 检查渲染服务是否可用
 * @returns {Promise<boolean>}
 */
export async function isRendererAvailable() {
  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: "AIG_PING" },
        (response) => resolve(response),
      );
    });
    return response?.ok === true;
  } catch {
    return false;
  }
}

/**
 * 渲染进度回调类型
 * @callback ProgressCallback
 * @param {number} percent - 进度百分比 (0-100)
 * @param {string} stage - 当前阶段
 */

/**
 * 带进度回调的渲染
 * @param {Element} container
 * @param {object} options
 * @param {ProgressCallback} options.onProgress
 * @returns {Promise<Blob>}
 */
export async function renderWithProgress(container, options = {}) {
  const { onProgress, ...renderOptions } = options;

  if (onProgress) {
    onProgress(10, "准备渲染");
  }

  try {
    if (onProgress) {
      onProgress(30, "发送渲染请求");
    }

    const blob = await render(container, renderOptions);

    if (onProgress) {
      onProgress(100, "渲染完成");
    }

    return blob;
  } catch (error) {
    if (onProgress) {
      onProgress(0, `渲染失败: ${error.message}`);
    }
    throw error;
  }
}
