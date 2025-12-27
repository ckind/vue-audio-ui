export function createPowCurveNode(
  ctx: BaseAudioContext,
  min: number,
  max: number,
  base: number
): AudioWorkletNode {
  const node = new AudioWorkletNode(ctx, "pow-curve-processor",
    { parameterData: { min, max, base } }
  );
  return node;
}

export function createDbToGainNode(
  ctx: BaseAudioContext,
  minThreshold: number
): AudioWorkletNode {
  const node = new AudioWorkletNode(ctx, "db-to-gain-processor",
    { parameterData: { minThreshold } }
  );
  return node;
}

export function createScaleNode(
  ctx: BaseAudioContext,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number
): AudioWorkletNode {
  const node = new AudioWorkletNode(ctx, "scale-processor",
    { parameterData: { inputMin, inputMax, outputMin, outputMax } }
  );
  return node;
}

export function createLoggerNode(ctx: BaseAudioContext): AudioWorkletNode {
  const node = new AudioWorkletNode(ctx, "logger-processor");
  return node;
}

export function createWhiteNoiseNode(ctx: BaseAudioContext): AudioBufferSourceNode {
  // Create an empty three-second stereo buffer at the sample rate of the AudioContext
  const myArrayBuffer = ctx.createBuffer(
    2,
    ctx.sampleRate * 3,
    ctx.sampleRate,
  );

  // Fill the buffer with white noise;
  // just random values between -1.0 and 1.0
  for (let channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
    // This gives us the actual ArrayBuffer that contains the data
    const nowBuffering = myArrayBuffer.getChannelData(channel);
    for (let i = 0; i < myArrayBuffer.length; i++) {
      // Math.random() is in [0; 1.0]
      // audio needs to be in [-1.0; 1.0]
      nowBuffering[i] = Math.random() * 2 - 1;
    }
  }

  // Get an AudioBufferSourceNode.
  // This is the AudioNode to use when we want to play an AudioBuffer
  const source = ctx.createBufferSource();
  // set the buffer in the AudioBufferSourceNode
  source.buffer = myArrayBuffer;
  source.loop = true;

  return source;
}