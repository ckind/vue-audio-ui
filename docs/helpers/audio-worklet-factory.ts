export function createPowCurveNode(
  ctx: BaseAudioContext,
  min: number,
  max: number,
  base: number
): AudioWorkletNode {
  const node = new AudioWorkletNode(
    ctx,
    "pow-curve-processor",
    { parameterData: { min: min, max: max, base: base } }
  );
  return node;
}