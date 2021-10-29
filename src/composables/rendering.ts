import { ref } from "vue";

const useRendering = () => {
	const continueRendering = ref(false);

	const renderLoop = (callback: Function): void => {
		try {
			callback();
		} catch (error) {
			continueRendering.value = false;
			console.log(`error in render callback - ${error}`);
		}

		if (continueRendering.value) {
			window.requestAnimationFrame(() => renderLoop(callback));
		}
	};

	const startRendering = (callback: Function): void => {
		continueRendering.value = true;

		renderLoop(callback);
	};

	const stopRendering = (): void => {
		continueRendering.value = false;
	};

	return { startRendering, stopRendering };
}

export default useRendering;