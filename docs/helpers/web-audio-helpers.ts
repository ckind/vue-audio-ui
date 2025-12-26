let globalAudioContext: (AudioContext | undefined);

export async function addAudioWorkletModules(ctx: AudioContext) {
  const promises = [
    ctx.audioWorklet.addModule("../helpers/audio-worklets/PowCurveWorkletProcessor.js")
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