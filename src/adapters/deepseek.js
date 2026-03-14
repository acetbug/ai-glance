const DeepSeekAdapter = {
  name: "deepseek",
  urlPattern: new URLPattern("https://chat.deepseek.com/*"),
  turnSelector: ".ds-message",
  actionBarSelector: ".bf38813a",
};

export default DeepSeekAdapter;
