export type ScalerFunction = (value: number, index?: number) => number;

function expFunc(exponent: number): ScalerFunction {
  return (val: number) => {
    return val >= 0
      ? Math.pow(val, exponent)
      : -Math.pow(val, exponent);
  };
}

export class ScalerNode {
  input: AudioNode;
  output: AudioNode;
  private waveShaper: WaveShaperNode;

  constructor(context: BaseAudioContext, scaleFn: ScalerFunction) {
    this.waveShaper = new WaveShaperNode(
      context,
      { curve: this.getWaveShaperCurve(scaleFn) }
    );
    this.input = this.waveShaper;
    this.output = this.waveShaper;
  }

  getWaveShaperCurve(mapping: ScalerFunction, length = 1024): Float32Array {
		const array = new Float32Array(length);
		for (let i = 0; i < length; i++) {
			const normalized = (i / (length - 1)) * 2 - 1;
			array[i] = mapping(normalized, i);
		}
		return array;
	}
}

export class ExpScalerNode extends ScalerNode {
  constructor(context: BaseAudioContext, exponent: number) {
    super(context, expFunc(exponent));
  }
}