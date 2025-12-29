import { solveQuadratic } from "./math-helpers.ts";

interface CurvedRange {
  getCurvedValue(_linearValue: number): number;

  getLinearValue(_curvedValue: number): number;
}

class BaseCurvedRange {
  readonly min: number;
  readonly max: number;

  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }

  getCurvedValue(_linearValue: number): number {
    throw "getCurvedValue must be overriden in child class";
  }

  getLinearValue(_curvedValue: number): number {
    throw "getLinearValue must be overriden in child class";
  }

  protected validateInput(value: number) {
    if (value < this.min) {
      throw `given value ${value} is less than min value ${this.min}`;
    } else if (value > this.max) {
      throw `given value ${value} is greater than max value ${this.max}`;
    }
  }
}

/** 
 * 

------ ll.og formula ------

$f1 = input_value
$f2 = min_input_value
$f3 = max_input_value
$f4 = min_output_value
$f5 = max_output_value
$f6 = log_base

(exp((($f1 - $f2) / ($f3-$f2) - 1) * $f6) - 1)
  /
(exp(-$f6) - 1)
  *
($f4 - $f5)
  +
$f5

*/

function exp(x: number): number {
  return Math.pow(Math.E, x);
}

function getLogCurve(
  x: number,
  minInput: number,
  maxInput: number,
  minOutput: number,
  maxOutput: number,
  curveAmt: number
) {
  return (
    ((exp(((x - minInput) / (maxInput - minInput) - 1) * curveAmt) - 1) /
      (exp(-curveAmt) - 1)) *
      (minOutput - maxOutput) +
    maxOutput
  );
}

function getInverseLogCurve(
  x: number,
  minInput: number,
  maxInput: number,
  minOutput: number,
  maxOutput: number,
  curveAmt: number
) {
  return (
    (Math.log(
      ((x - maxOutput) * (exp(-curveAmt) - 1)) / (minOutput - maxOutput) + 1
    ) /
      curveAmt +
      1) *
      (maxInput - minInput) +
    minInput
  );
}

class InverseLogCurvedRange extends BaseCurvedRange {
  private curveAmount: number;

  constructor(min: number, max: number, curveAmount: number) {
    super(min, max);
    this.curveAmount = curveAmount;
  }

  getCurvedValue(value: number): number {
    this.validateInput(value);

    return getInverseLogCurve(
      value,
      this.min,
      this.max,
      this.min,
      this.max,
      this.curveAmount
    );
  }

  getLinearValue(value: number): number {
    this.validateInput(value);

    return getLogCurve(
      value,
      this.min,
      this.max,
      this.min,
      this.max,
      this.curveAmount
    );
  }
}

class LogCurvedRange extends BaseCurvedRange {
  private curveAmount: number;

  constructor(min: number, max: number, curveAmount: number) {
    super(min, max);
    this.curveAmount = curveAmount;
  }

  getCurvedValue(value: number): number {
    this.validateInput(value);

    return getLogCurve(
      value,
      this.min,
      this.max,
      this.min,
      this.max,
      this.curveAmount
    );
  }

  getLinearValue(value: number): number {
    this.validateInput(value);

    return getInverseLogCurve(
      value,
      this.min,
      this.max,
      this.min,
      this.max,
      this.curveAmount
    );
  }
}

class LinearCurvedRange extends BaseCurvedRange {
  constructor(min: number, max: number) {
    super(min, max);
  }

  getCurvedValue(value: number): number {
    this.validateInput(value);
    return value;
  }

  getLinearValue(value: number): number {
    this.validateInput(value);
    return value;
  }
}

/*

Parameteric Quadratic Bezier Equation

  x(t) = (1 - t)^2*x0 + 2t*(1 - t)*x1 + t^2*x2
  y(t) = (1 - t)^2*y0 + 2t*(1 - t)*y1 + t^2*y2

Equations for getting curved value

  (x0, y0) = (0, min)   // start
  (x1, y1) = (max, 0)   // control point
  (x2, y2) = (max, max) // end

  t = (x - min) / (max - min)

  curved value = y(t) = (1 - t)^2*y0 + 2t*(1 - t)*y1 + t^2*y2

*/
interface Point {
  x: number;
  y: number;
}

class QuadBezierCurvedRange extends BaseCurvedRange {
  private p: Array<Point> = [];
  private range: number;

  constructor(min: number, max: number) {
    super(min, max);
    this.range = max - min;
    this.p = new Array<Point>(3);
    this.p[0] = { x: 0, y: 0 };
    this.p[1] = { x: this.range, y: 0 }; // todo: make this adjustable
    this.p[2] = { x: this.range, y: this.range };
  }

  getCurvedValue(linearValue: number): number {
    this.validateInput(linearValue);
    // calculate t
    const t = (linearValue - this.min) / (this.max - this.min);
    // get value along bezier interpolation using t
    // y(t) = (y0 - 2y1 + y2)t^2 + 2(y1 + y0)t + y0
    let y =
      (this.p[0]!.y - 2 * this.p[1]!.y + this.p[2]!.y) * Math.pow(t, 2) +
      2 * (this.p[1]!.y + this.p[0]!.y) * t +
      this.p[0]!.y;
    y += this.min;
    return y;
  }

  getLinearValue(curvedValue: number): number {
    this.validateInput(curvedValue);
    // y(t) = (1 - t)^2*y0 + 2t*(1 - t)*y1 + t^2*y2
    // y(t) = (y0 - 2y1 + y2)t^2 + 2(y1 + y0)t + y0
    // 0    = (y0 - 2y1 + y2)t^2 + 2(y1 + y0)t + (y0 - y(t));
    // solve for t
    const yt = curvedValue - this.min;
    const a = this.p[0]!.y - 2 * this.p[1]!.y + this.p[2]!.y;
    const b = 2 * (this.p[1]!.y + this.p[0]!.y);
    const c = this.p[0]!.y - yt;
    const solution = solveQuadratic(a, b, c);
    if (
      solution.solution1.imaginaryPart != 0 ||
      solution.solution2.imaginaryPart != 0
    ) {
      throw "invalid bezier curve - quadratic solution is not real";
    }
    // we only care about the positive solution
    const t =
      solution.solution1.realPart < 0
        ? solution.solution2.realPart
        : solution.solution1.realPart;
    // get value along linear interpolation using t
    const y = this.min + t * (this.max - this.min);
    return y;
  }
}

class Pow2CurvedRange extends BaseCurvedRange {
  private readonly range: number;
  private readonly logMin: number;
  private readonly logMax: number;
  private readonly logRange: number;

  constructor(min: number, max: number) {
    super(min, max);
    this.range = max - min;
    this.logMin = this.log2(Math.max(min, Number.MIN_VALUE));
    this.logMax = this.log2(this.range);
    this.logRange = this.logMax - this.logMin;
  }

  private log2(x: number) {
    return Math.log(x) / Math.log(2);
  }

  private exp2(x: number) {
    return Math.pow(2, x);
  }

  getCurvedValue(value: number): number {
    this.validateInput(value);
    const t = (value - this.min) / this.range;
    const val = this.exp2(t * this.logRange + this.logMin); // todo: fix this
    return val;
  }

  getLinearValue(value: number): number {
    this.validateInput(value);
    const t = (this.log2(value) - this.logMin) / this.logRange;
    const val = t * this.range + this.min;
    return val;
  }
}

export {
  type CurvedRange,
  LinearCurvedRange,
  Pow2CurvedRange,
  QuadBezierCurvedRange,
  LogCurvedRange,
  InverseLogCurvedRange,
};
