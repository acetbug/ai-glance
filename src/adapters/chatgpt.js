const ChatGPTAdapter = {
  name: "chatgpt",
  urlPattern: new URLPattern("https://chatgpt.com/*"),
  turnSelector: "article",
  actionBarSelector: "#conversation-header-actions",
};

export default ChatGPTAdapter;
