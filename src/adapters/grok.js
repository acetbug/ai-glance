const GrokAdapter = {
  name: "grok",
  urlPattern: new URLPattern("https://grok.com/*"),
  turnSelector: ".markdown",
  actionBarSelector: '[aria-label="Create share link"]',
};

export default GrokAdapter;
