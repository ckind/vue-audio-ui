import { ref } from "vue";

export function useRendering() {
	const continueRendering = ref(false);

	function renderLoop(callback: Function): void {
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

	function startRendering(callback: Function): void {
		continueRendering.value = true;

		renderLoop(callback);
	};

	function stopRendering(): void {
		continueRendering.value = false;
	};

	return { startRendering, stopRendering };
}
