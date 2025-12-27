export type SignalScalerType = {
  input: AudioNode;
  output: AudioNode;
  dispose(): void;
}

export class SignalScaler implements SignalScalerType {
  private _minusInputMin: ConstantSourceNode;
  private _plusOutputMin: ConstantSourceNode;
  private _dividedByInputRange: GainNode;
  private _multipliedByOutputRange: GainNode;

  input: AudioNode;
  output: AudioNode;

  constructor(
    ctx: BaseAudioContext,
    inputMin: number,
    inputMax: number,
    outputMin: number,
    outputMax: number,
    loggerNode?: AudioNode
  ) {
    // outputSignal = outputMin
    //   + (outputMax-outputMin) * ((inputSignal-inputMin) / (inputMax-inputMin));

    this._minusInputMin = new ConstantSourceNode(ctx, { offset: -inputMin });
    this._dividedByInputRange = new GainNode(ctx, { gain: 1/(inputMax - inputMin) });
    this._multipliedByOutputRange = new GainNode(ctx, { gain: (outputMax - outputMin) });
    this._plusOutputMin = new ConstantSourceNode(ctx, { offset: outputMin });

    this._minusInputMin .start();
    this._plusOutputMin.start();

    this.input = new GainNode(ctx, { gain: 1 });
    this.output = new GainNode(ctx, { gain: 1 });

    this._minusInputMin.connect(this.input);
    this.input.connect(this._dividedByInputRange);
    this._dividedByInputRange.connect(this._multipliedByOutputRange);
    this._multipliedByOutputRange.connect(this.output);
    this._plusOutputMin.connect(this.output);

    if (loggerNode) {
      this.output.connect(loggerNode);
    }
  }

  dispose() {
    this._minusInputMin.stop();
    this._plusOutputMin.stop();
    this._minusInputMin.disconnect();
    this._plusOutputMin.disconnect();
    this._dividedByInputRange.disconnect();
    this._multipliedByOutputRange.disconnect();

    this.input.disconnect();
    this.output.disconnect();
  }
}