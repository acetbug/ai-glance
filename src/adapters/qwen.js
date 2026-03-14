const QwenAdapter = {
  name: "qwen",
  urlPattern: new URLPattern("https://chat.qwen.ai/*"),
  turnSelector: ".qwen-markdown, .chat-user-message",
  actionBarSelector: "#qwen-chat-header-right",
};

export default QwenAdapter;
