export type SignalToRatioType = {
  input: AudioNode;
  output: AudioNode;
  dispose(): void;
};

/**
 * converts the incoming signal to a ratio (0, 1) based on the min and max
 */
export class SignalToRatio implements SignalToRatioType {
  private _minusInputMin: ConstantSourceNode;
  private _dividedByInputRange: GainNode;

  input: AudioNode;
  output: AudioNode;

  constructor(
    ctx: BaseAudioContext,
    inputMin: number,
    inputMax: number,
    loggerNode?: AudioNode
  ) {
    // outputSignal = (inputSignal-inputMin) / (inputMax-inputMin);

    this._minusInputMin = new ConstantSourceNode(ctx, { offset: -inputMin });
    this._dividedByInputRange = new GainNode(ctx, {
      gain: 1 / (inputMax - inputMin),
    });

    this._minusInputMin.start();

    this.input = new GainNode(ctx, { gain: 1 });
    this.output = new GainNode(ctx, { gain: 1 });

    this._minusInputMin.connect(this.input);
    this.input.connect(this._dividedByInputRange);
    this.output = this._dividedByInputRange;

    if (loggerNode) {
      // this._dividedByInputRange.connect(loggerNode);
    }
  }

  dispose() {
    this._minusInputMin.stop();
    this._minusInputMin.disconnect();
    this._dividedByInputRange.disconnect();

    this.input.disconnect();
    this.output.disconnect();
  }
}
