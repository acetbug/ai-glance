export default class MainButton {
  constructor(onClick) {
    this.button = document.createElement("button");
    this.button.className = "aig-main-btn";
    this.button.title = "多选复制为图片";
    this.button.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <span>复制为图片</span>
    `;
    this.button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    });
  }

  attachTo(parent) {
    parent.prepend(this.button);
  }
}
