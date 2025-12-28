
function gainToDb(gain) {
	return 20 * (Math.log(gain) / Math.LN10);
}

/**
 * converts an incoming decibel value [0, -infinity) to a gain value [0, 1]
 */
class DbToGainWorkletProcessor extends AudioWorkletProcessor {
  // https://webaudio.github.io/web-audio-api/#AudioParamDescriptor
  static get parameterDescriptors () {
    // set gain to 0 for anything below minThreshold
    return [{
      name: 'minThreshold',
      defaultValue: -80,
      automationRate: "k-rate",
    }];
  }

  // https://webaudio.github.io/web-audio-api/#process
  process(inputs, outputs, parameters) {
    // Get the first input and output.
    const input = inputs[0];
    const output = outputs[0];

    // k-rate params only have one value per render quantum
    // todo: do extra variable assignments in process callback affect performance?
    const minThreshold = parameters.minThreshold[0];

    // assume only one input channel and output channel for now
    const inputChannel = input[0];
    const outputChannel = output[0]

    if (!inputChannel || !outputChannel) return true;

    for (let i = 0; i < inputChannel.length; ++i) {
      outputChannel[i] = inputChannel[i] < minThreshold
        ? 0
        : dbToGain(inputChannel[i]);
    }

    return true;
  }
}

registerProcessor("db-to-gain-processor", DbToGainWorkletProcessor);