let globalAudioContext = null as AudioContext | null;

function setupAutoResume(ctx: AudioContext) {
	document.addEventListener("mousedown", () => {
		if (ctx.state != "running") {
			ctx.resume();
		}
	});
}

const helpers = {

	setupAudioContext(useGlobal: boolean = true): AudioContext {
		if (useGlobal) {
			if (globalAudioContext == null) {
				globalAudioContext = new window.AudioContext();
				setupAutoResume(globalAudioContext);
			}
			
			return globalAudioContext;
		}
		else {
			const ctx = new window.AudioContext();

			setupAutoResume(ctx);

			return ctx;
		}
	},

};

export default helpers;