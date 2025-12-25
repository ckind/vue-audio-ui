export type TransferFunction = (value: number, index: number) => number;

// scales an input value along the input range to the output range
function scaleValue(
  inputValue: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number
) {
  return outputMin
    + (outputMax-outputMin) * ((inputValue-inputMin) / (inputMax-inputMin));
}


function getWaveShaperCurve(transferFn: TransferFunction, length = 1024, normalize = false): Float32Array<ArrayBuffer> {
  const curveMapping = new Array<number>(length);

  for (let i = 0; i < length; i++) {
    // linear mapping of values from -1 to 1
    const linearValue = (i/(length - 1) * 2) - 1;
    // generate mapping with transfer function applied
    curveMapping[i] = transferFn(linearValue, i);
  }

  if (normalize) {
    // normalize curved mapping back to [-1,1]
    for (let i = 0; i < length; i++) {
      curveMapping[i] = scaleValue(
        curveMapping[i],
        curveMapping[0],
        curveMapping[length - 1],
        -1,
        1
      );
    }
  }

  return new Float32Array(curveMapping);
}

// base class for scaler node
// a utility for applying mathemiatical operators to incoming audio signals
export class ScalerNode extends WaveShaperNode {
  constructor(context: BaseAudioContext, transferFn: TransferFunction, normalize: boolean) {
    const options = {
      curve: getWaveShaperCurve(transferFn, context.sampleRate, normalize),
    } as WaveShaperOptions;
    super(context, options);
  }
}

// add a constant amount to the incoming signal
export class AdditionNode extends ScalerNode {
  constructor(context: BaseAudioContext, amount: number) {
    super(context, (value, index) => value + amount, false);
  }
}

// subtract a constant amount from the incoming signal
export class SubtractionNode extends ScalerNode {
  constructor(context: BaseAudioContext, amount: number) {
    super(context, (value, index) => value - amount, false);
  }
}

// multiply incoming signal by constant amount
export class MultiplicationNode extends ScalerNode {
  constructor(context: BaseAudioContext, amount: number) {
    super(context, (value, index) => value * amount, false);
  }
}