import { ref } from "vue";

const useMetering = (audioCtx: BaseAudioContext, fftSize: number) => {

	const analyzer = ref(audioCtx.createAnalyser());
	analyzer.value.fftSize = fftSize;

	const dataArray = new Float32Array(analyzer.value.frequencyBinCount);

	const getFloatTimeDomainData = (): Float32Array => {
		analyzer.value.getFloatTimeDomainData(dataArray);

		return dataArray;
	}

	const getFloatFrequencyData = (): Float32Array => {
		analyzer.value.getFloatFrequencyData(dataArray);

		return dataArray;
	}

	const getPeakDb = (buffer: Float32Array): number => {
		let peak = 0;
		let value;

		for (let i = 0; i < buffer.length; i++) {
			value = Math.abs(buffer[i]);
			if (value > peak) {
				peak = value;
			}
		}

		// if (peak > 0) {
		// 	console.log(peak);
		// }

		return 20 * Math.log10(peak);
	}

	const getRmsDb = (buffer: Float32Array): number => {
		let squareSum = 0;
		let value;

		for (let i = 0; i < buffer.length; i++) {
			value = Math.abs(buffer[i]);
			squareSum += value * value;
		}

		return 20 * Math.log10(Math.sqrt(squareSum / buffer.length));
	};

	return { getPeakDb, getRmsDb, getFloatTimeDomainData, getFloatFrequencyData, analyzer };
}

export default useMetering;