

export function useMetering(audioCtx: BaseAudioContext, fftSize: number) {

	const analyzer = audioCtx.createAnalyser();
	
	analyzer.fftSize = fftSize;

	const dataArray = new Float32Array(analyzer.frequencyBinCount);

	function getFloatTimeDomainData(): Float32Array {
		analyzer.getFloatTimeDomainData(dataArray);

		return dataArray;
	}

	function getFloatFrequencyData(): Float32Array {
		analyzer.getFloatFrequencyData(dataArray);

		return dataArray;
	}

	function getPeakDb(buffer: Float32Array): number {
		let peak = 0;
		let value;

		for (let i = 0; i < buffer.length; i++) {
			value = Math.abs(buffer[i]);
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
			value = Math.abs(buffer[i]);
			squareSum += value * value;
		}

		return 20 * Math.log10(Math.sqrt(squareSum / buffer.length));
	};

	return {
		getPeakDb,
		getRmsDb,
		getFloatTimeDomainData,
		getFloatFrequencyData,
		analyzer
	};
}