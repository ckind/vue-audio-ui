function logBaseN(n, x) {
  return Math.log(x) / Math.log(n);
}

function powBaseN(n, x) {
  return Math.pow(n, x);
}

/**
 * maps the input value along an n^x curve from min to max
 * where x is the sampled value of the signal and n is the given base
 * works best with min > 1 and max > 1
 * clamps values outside of [min, max]
 */
class PowCurveWorkletProcessor extends AudioWorkletProcessor {
  // https://webaudio.github.io/web-audio-api/#AudioParamDescriptor
  static get parameterDescriptors () {
    return [{
      name: 'min',
      defaultValue: 1,
      automationRate: "k-rate"
    }, {
      name: 'max',
      defaultValue: 100,
      automationRate: "k-rate"
    }, {
      name: 'base',
      defaultValue: 2,
      automationRate: "k-rate"
    }];
  }

  // https://webaudio.github.io/web-audio-api/#process
  process(inputs, outputs, parameters) {
    // Get the first input and output.
    const input = inputs[0];
    const output = outputs[0];

    // k-rate params only have one value per render quantum
    // todo: do extra variable assignments in process callback affect performance?
    const min = parameters.min[0];
    const max = parameters.max[0];
    const n = parameters.base[0];

    const range = max - min;
    const logMin = logBaseN(n, min);
    const logMax = logBaseN(n, max);
    const logRange = logMax - logMin;

    // for each render quantum.
    for (let channel = 0; channel < output.length; ++channel) {
      for (let i = 0; i < output[channel].length; ++i) {
        const t = (input[channel][i] - min) / range;
        output[channel][i] = powBaseN(n, t * logRange + logMin);
      }
    }

    return true;
  }
}

registerProcessor("pow-curve-processor", PowCurveWorkletProcessor);