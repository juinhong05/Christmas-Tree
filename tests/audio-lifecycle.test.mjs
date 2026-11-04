import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = ts.transpileModule(
  readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
).outputText;

function mount({ blocked = false, deferred = false, focused = true } = {}) {
  const window = new EventTarget();
  const document = Object.assign(new EventTarget(), {
    visibilityState: "visible", hasFocus: () => focused,
  });
  const audio = Object.assign(new EventTarget(), {
    paused: true, plays: 0,
    pause() { this.paused = true; },
    play() {
      this.plays++;
      if (blocked) return Promise.reject(new Error("Autoplay blocked"));
      this.paused = false;
      this.dispatchEvent(new Event("play"));
      return deferred ? new Promise((resolve) => { this.resolve = resolve; }) : Promise.resolve();
    },
  });
  let refIndex = 0;
  const effects = [];
  const prompt = { visible: undefined };
  const exports = {};
  vm.runInNewContext(source, {
    exports, window, document,
    require: (name) => name === "react" ? {
      useRef: (value) => ({ current: ++refIndex === 2 ? audio : value }),
      useState: (initial) => {
        prompt.visible = initial;
        return [initial, (value) => { prompt.visible = value; }];
      },
      useCallback: (callback) => callback,
      useEffect: (effect) => effects.push(effect),
    } : { jsx: () => null, jsxs: () => null },
  });
  exports.default();
  const cleanup = effects[0]();
  return { audio, document, window, cleanup, prompt };
}

test("surprise prompt is present when the page opens without focus", async () => {
  const { audio, document, window, cleanup, prompt } = mount({ focused: false });
  assert.equal(audio.plays, 0);
  assert.equal(prompt.visible, true);
  document.hasFocus = () => true;
  window.dispatchEvent(new Event("focus"));
  await Promise.resolve();
  assert.equal(prompt.visible, true);
  cleanup();
});

test("successful autoplay does not hide the untapped surprise prompt", async () => {
  const { cleanup, prompt } = mount();
  await Promise.resolve();
  assert.equal(prompt.visible, true);
  cleanup();
});

test("tab hiding, mobile page exit, and focus loss pause music; return resumes", async () => {
  const { audio, document, window, cleanup } = mount();
  await Promise.resolve();
  assert.equal(audio.paused, false);
  document.visibilityState = "hidden";
  document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(audio.paused, true);
  await audio.play();
  assert.equal(audio.paused, true, "native playback cannot restart hidden audio");
  document.visibilityState = "visible";
  document.dispatchEvent(new Event("visibilitychange"));
  await Promise.resolve();
  assert.equal(audio.paused, false);
  for (const [leave, enter] of [["pagehide", "pageshow"], ["blur", "focus"]]) {
    window.dispatchEvent(new Event(leave));
    assert.equal(audio.paused, true);
    window.dispatchEvent(new Event(enter));
    await Promise.resolve();
    assert.equal(audio.paused, false);
  }
  cleanup();
  assert.equal(audio.paused, true);
  window.dispatchEvent(new Event("focus"));
  assert.equal(audio.paused, true, "unmount removes resume listeners");
});

test("a pending play request is paused if it resolves after leaving", async () => {
  const { audio, window, cleanup } = mount({ deferred: true });
  window.dispatchEvent(new Event("pagehide"));
  audio.paused = false;
  audio.resolve();
  await Promise.resolve();
  assert.equal(audio.paused, true);
  cleanup();
});

test("blocked autoplay is not retried just because the visitor returns", async () => {
  const { audio, window, cleanup } = mount({ blocked: true });
  await Promise.resolve();
  window.dispatchEvent(new Event("blur"));
  window.dispatchEvent(new Event("focus"));
  assert.equal(audio.plays, 1);
  assert.equal(audio.paused, true);
  cleanup();
});
