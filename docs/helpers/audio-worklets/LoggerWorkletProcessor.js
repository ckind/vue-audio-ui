
class LoggerWorkletProcessor extends AudioWorkletProcessor {
  // https://webaudio.github.io/web-audio-api/#process
  process(inputs, outputs, parameters) {
    // Get the first input and output.
    const input = inputs[0];
    const output = outputs[0];

    // assume only one input channel and output channel for now
    const inputChannel = input[0];
    const outputChannel = output[0]

    if (!inputChannel || !outputChannel) return true;

    for (let i = 0; i < inputChannel.length; ++i) {
      outputChannel[i] = inputChannel[i];
    }

    console.log(inputChannel[0]);

    return true;
  }
}

registerProcessor("logger-processor", LoggerWorkletProcessor);