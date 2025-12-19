// version of useMetering designed to be SSR compatible

export function useMetering(fftSize: number, input?: AudioNode) {
  let analyzer: (AnalyserNode | undefined);
  let dataArray: Float32Array<ArrayBuffer>;

  // if input is defined and passed in, set up the analyzer right away
  if (input) {
    setupAnalyzer(input);
  }

  function setupAnalyzer(node: AudioNode) {
    analyzer = node.context.createAnalyser();
    analyzer.fftSize = fftSize;
    dataArray = new Float32Array(analyzer.frequencyBinCount);

    node.connect(analyzer);
  }

  // return this function to used to handle changes in the input -
  // useful in cases of server side rendering, where any web audio api
  // references will have to be deferred until after components are mounted
  function onInputChanged(newInput: AudioNode | undefined, oldInput: AudioNode | undefined) {
    if (newInput) {
      // todo: memory leaks? need to clean up old analyzer?
      setupAnalyzer(newInput);
    }
  }

  function getFloatTimeDomainData(): Float32Array | undefined {
    analyzer?.getFloatTimeDomainData(dataArray);

    return dataArray;
  }

  function getFloatFrequencyData(): Float32Array | undefined {
    analyzer?.getFloatFrequencyData(dataArray);

    return dataArray;
  }

  function getPeakDb(buffer: Float32Array): number {
    let peak = 0;
    let value;

    for (let i = 0; i < buffer.length; i++) {
      value = Math.abs(buffer[i]!);
      if (value > peak) {
        peak = value;
      }
    }

    return 20 * Math.log10(peak);
  }

  function getRmsDb(buffer: Float32Array): number {
    let squareSum = 0;
    let value;

    for (let i = 0; i < buffer.length; i++) {
      value = Math.abs(buffer[i]!);
      squareSum += value * value;
    }

    return 20 * Math.log10(Math.sqrt(squareSum / buffer.length));
  };

  return {
    getPeakDb,
    getRmsDb,
    getFloatTimeDomainData,
    getFloatFrequencyData,
    onInputChanged
  };
}