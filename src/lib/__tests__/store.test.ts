import test from "node:test";
import assert from "node:assert/strict";
import { useResumeStore } from "../store";

test("useResumeStore - initial state and state mutations", () => {
  // Test initial default values or current state
  const state = useResumeStore.getState();
  assert.equal(typeof state.markdown, "string");
  assert.equal(typeof state.theme, "string");
  assert.equal(typeof state.scale, "number");
  assert.equal(typeof state.autoScale, "boolean");

  // Test setMarkdown
  state.setMarkdown("# Test Resume");
  assert.equal(useResumeStore.getState().markdown, "# Test Resume");

  // Test setCustomCss
  state.setCustomCss("body { color: red; }");
  assert.equal(useResumeStore.getState().customCss, "body { color: red; }");

  // Test setTheme
  state.setTheme("minimal");
  assert.equal(useResumeStore.getState().theme, "minimal");

  // Test setScale
  state.setScale(0.85);
  assert.equal(useResumeStore.getState().scale, 0.85);

  // Test setAutoScale
  state.setAutoScale(false);
  assert.equal(useResumeStore.getState().autoScale, false);

  // Test resetStore
  state.resetStore("# Default Markdown");
  const resetState = useResumeStore.getState();
  assert.equal(resetState.markdown, "# Default Markdown");
  assert.equal(resetState.customCss, "");
  assert.equal(resetState.theme, "modern");
  assert.equal(resetState.scale, 0.92);
  assert.equal(resetState.autoScale, true);
});
