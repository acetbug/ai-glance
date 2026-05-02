/** 运行时 DOM 工具函数 */

const ELEMENTS_TO_REMOVE = [
  ".aig-turn-check",
  "script",
  "style",
  "link",
  "iframe",
  "frame",
  "object",
  "embed",
  "applet",
  "noscript",
  "base",
  "meta",
  "button",
  '[role="button"]',
  '[data-testid*="copy"]',
  '[data-testid*="share"]',
  '[data-testid*="edit"]',
  '[aria-label*="copy"]',
  '[aria-label*="share"]',
].join(", ");

const ATTRIBUTES_TO_REMOVE = [
  "onload",
  "onerror",
  "onclick",
  "onmouseover",
  "onmouseout",
  "onfocus",
  "onblur",
  "onchange",
  "onsubmit",
  "onkeydown",
  "onkeypress",
  "onkeyup",
  "data-*",
  "aria-*",
  "role",
  "tabindex",
  "contenteditable",
  "spellcheck",
  "draggable",
  "dropzone",
  "translate",
];

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

export function exitSelection(el) {
  if (el._aigToggle) {
    el.removeEventListener("click", el._aigToggle);
    delete el._aigToggle;
  }
  el.classList.remove("aig-selectable", "aig-selected");
  el.querySelector(".aig-turn-check")?.remove();
}

export function cloneAndClean(el) {
  const clone = document.createElement("div");
  
  el.childNodes.forEach((child) => {
    clone.appendChild(cloneNodePreservingImages(child));
  });

  clone
    .querySelectorAll(ELEMENTS_TO_REMOVE)
    .forEach((n) => n.remove());

  cleanupElement(clone);

  return clone;
}

function cloneNodePreservingImages(node) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const clone = node.cloneNode(false);
    
    if (clone.tagName === "IMG") {
      preserveImage(clone, node);
    }
    
    if (clone.tagName === "PICTURE") {
      preservePicture(clone, node);
    }
    
    if (clone.tagName === "SVG") {
      preserveSVG(clone, node);
    }
    
    if (clone.tagName === "FIGURE") {
      preserveFigure(clone, node);
    }

    node.childNodes.forEach((child) => {
      const clonedChild = cloneNodePreservingImages(child);
      if (clonedChild) {
        clone.appendChild(clonedChild);
      }
    });

    return clone;
  }
  
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.nodeValue);
  }
  
  return null;
}

function preserveImage(imgClone, imgOriginal) {
  const src = imgOriginal.src || imgOriginal.getAttribute("src");
  const srcset = imgOriginal.srcset || imgOriginal.getAttribute("srcset");
  const alt = imgOriginal.alt || imgOriginal.getAttribute("alt");
  const width = imgOriginal.width || imgOriginal.getAttribute("width");
  const height = imgOriginal.height || imgOriginal.getAttribute("height");
  const loading = imgOriginal.getAttribute("loading");
  const decoding = imgOriginal.getAttribute("decoding");

  imgClone.style.maxWidth = "100%";
  imgClone.style.height = "auto";
  imgClone.style.display = "block";
  imgClone.style.margin = "12px 0";
  imgClone.style.borderRadius = "8px";
  imgClone.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

  if (src) {
    imgClone.setAttribute("src", src);
  }
  
  if (srcset) {
    imgClone.setAttribute("srcset", srcset);
  }
  
  if (alt) {
    imgClone.setAttribute("alt", alt);
  }
  
  if (width) {
    imgClone.setAttribute("width", width);
  }
  
  if (height) {
    imgClone.setAttribute("height", height);
  }
  
  if (loading) {
    imgClone.setAttribute("loading", loading);
  }
  
  if (decoding) {
    imgClone.setAttribute("decoding", decoding);
  }
}

function preservePicture(pictureClone, pictureOriginal) {
  const sources = pictureOriginal.querySelectorAll("source");
  sources.forEach((source) => {
    const sourceClone = source.cloneNode(true);
    pictureClone.appendChild(sourceClone);
  });
  
  const img = pictureOriginal.querySelector("img");
  if (img) {
    const imgClone = img.cloneNode(false);
    preserveImage(imgClone, img);
    pictureClone.appendChild(imgClone);
  }
}

function preserveSVG(svgClone, svgOriginal) {
  svgClone.innerHTML = svgOriginal.innerHTML;
  
  const viewBox = svgOriginal.getAttribute("viewBox") || svgClone.getAttribute("viewBox");
  if (viewBox) {
    svgClone.setAttribute("viewBox", viewBox);
  }
  
  svgClone.style.maxWidth = "100%";
  svgClone.style.height = "auto";
  svgClone.style.display = "block";
  svgClone.style.margin = "12px 0";
}

function preserveFigure(figureClone, figureOriginal) {
  figureClone.style.margin = "16px 0";
  figureClone.style.textAlign = "center";
  
  const img = figureOriginal.querySelector("img");
  if (img) {
    const imgClone = figureClone.querySelector("img");
    if (imgClone) {
      preserveImage(imgClone, img);
    }
  }
  
  const figcaption = figureOriginal.querySelector("figcaption");
  if (figcaption) {
    const figcaptionClone = figureClone.querySelector("figcaption");
    if (figcaptionClone) {
      figcaptionClone.style.fontSize = "12px";
      figcaptionClone.style.color = "inherit";
      figcaptionClone.style.opacity = "0.7";
      figcaptionClone.style.marginTop = "8px";
    }
  }
}

function cleanupElement(el) {
  el.querySelectorAll("*").forEach((node) => {
    if (node.hasAttribute("class")) {
      const className = node.getAttribute("class");
      if (
        className.includes("markdown") ||
        className.includes("code") ||
        className.includes("math") ||
        className.includes("formula")
      ) {
        node.setAttribute("data-aig-preserve", "true");
      } else {
        node.removeAttribute("class");
      }
    }
    
    for (const attr of ATTRIBUTES_TO_REMOVE) {
      if (attr.endsWith("*")) {
        const prefix = attr.slice(0, -1);
        for (const a of [...node.attributes]) {
          if (a.name.startsWith(prefix)) {
            node.removeAttribute(a.name);
          }
        }
      } else {
        if (node.hasAttribute(attr)) {
          node.removeAttribute(attr);
        }
      }
    }

    if (node.tagName === "PRE") {
      node.style.whiteSpace = "pre-wrap";
      node.style.overflowWrap = "anywhere";
      node.style.wordBreak = "break-word";
    }

    if (node.tagName === "CODE") {
      node.style.fontFamily = '"Fira Code", "JetBrains Mono", Consolas, monospace';
    }

    if (node.tagName === "TABLE") {
      node.style.width = "100%";
      node.style.borderCollapse = "collapse";
    }

    if (node.tagName === "TH" || node.tagName === "TD") {
      node.style.border = "1px solid";
      node.style.padding = "8px 12px";
      node.style.textAlign = "left";
    }
  });
}

export function cleanHtmlForExport(html) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  
  wrapper.querySelectorAll(ELEMENTS_TO_REMOVE).forEach((n) => n.remove());
  cleanupElement(wrapper);
  
  return wrapper.innerHTML;
}
