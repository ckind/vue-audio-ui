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