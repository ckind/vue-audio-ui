let globalAudioContext: (AudioContext | undefined);

import loggerWorkletUrl from "../helpers/audio-worklets/LoggerWorkletProcessor.js?url";
import dbToGainWorkletUrl from "../helpers/audio-worklets/DbToGainWorkletProcessor.js?url";
import scaleWorkletUrl from "../helpers/audio-worklets/ScaleWorkletProcessor.js?url";
import powCurveWorkletUrl from "../helpers/audio-worklets/PowCurveWorkletProcessor.js?url";

export async function addAudioWorkletModules(ctx: AudioContext) {
  const promises = [
    ctx.audioWorklet.addModule(loggerWorkletUrl),
    ctx.audioWorklet.addModule(dbToGainWorkletUrl),
    ctx.audioWorklet.addModule(scaleWorkletUrl),
    ctx.audioWorklet.addModule(powCurveWorkletUrl),
  ];

  await Promise.all(promises);
}

export function setupAutoResume(ctx: AudioContext) {
  document.addEventListener("mousedown", () => {
    if (ctx.state != "running") {
      ctx.resume();
    }
  });
};

export async function createAudioContext(): Promise<AudioContext> {
  const ctx = new window.AudioContext();
  await addAudioWorkletModules(ctx); 
  setupAutoResume(ctx);

  return ctx;
}

export async function requestGlobalAudioContext(): Promise<AudioContext> {
  await navigator.locks.request("globalAudioContext", async (lock) => {
    if (globalAudioContext === undefined) {
      globalAudioContext = await createAudioContext();
      console.log("initialized global audio context", globalAudioContext);
    }
	});

  return globalAudioContext!;
};

export function requestMicrophoneAccess(audioCtx: AudioContext, callback: (a: MediaStreamAudioSourceNode) => void) {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      const source = audioCtx.createMediaStreamSource(stream);
      callback(source);
    })
    .catch((err) => {
      console.log("error requesting microphone access:" + err);
    });
};