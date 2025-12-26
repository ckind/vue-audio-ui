export function dbToGain(db: number): number {
	return Math.pow(10, db / 20);
}

export function gainToDb(gain: number): number {
	return 20 * (Math.log(gain) / Math.LN10);
}

export function logBaseN(n: number, x: number): number {
  return Math.log(x) / Math.log(n);
}

export function powBaseN(n: number, x: number): number {
  return Math.pow(n, x);
}

// scales an input value along the input range to the output range
export function scaleValue(
  inputValue: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number
) {
  return outputMin
    + (outputMax-outputMin) * ((inputValue-inputMin) / (inputMax-inputMin));
}