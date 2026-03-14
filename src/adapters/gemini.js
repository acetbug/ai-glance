const GeminiAdapter = {
  name: "gemini",
  urlPattern: new URLPattern("https://gemini.google.com/*"),
  turnSelector: ".query-text, .response-content",
  actionBarSelector: "top-bar-actions .right-section",
};

export default GeminiAdapter;
