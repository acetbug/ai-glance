const ClaudeAdapter = {
  name: "claude",
  urlPattern: new URLPattern("https://claude.ai/*"),
  turnSelector: "[data-test-render-count]",
  actionBarSelector: '[data-testid="wiggle-controls-actions"]',
};

export default ClaudeAdapter;
