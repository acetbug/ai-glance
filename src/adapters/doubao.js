const DoubaoAdapter = {
  name: "doubao",
  urlPattern: new URLPattern("https://www.doubao.com/*"),
  turnSelector: '[data-testid="message_text_content"]',
  actionBarSelector: "#generic-tools-placeholder",
};

export default DoubaoAdapter;
