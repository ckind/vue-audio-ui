let globalAudioContext = null as AudioContext | null;

function setupAutoResume(ctx: AudioContext) {
	document.addEventListener("mousedown", () => {
		if (ctx.state != "running") {
			ctx.resume();
		}
	});
}

const helpers = {

	setupAudioContext(useGlobal = true): AudioContext {
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

	requestMicrophoneAccess(audioCtx: AudioContext, callback: (a: MediaStreamAudioSourceNode) => void) {
		navigator.mediaDevices
			.getUserMedia({ video: false, audio: true })
			.then((stream) => {
				const source = audioCtx.createMediaStreamSource(stream);
				callback(source);
			})
			.catch((err) => {
				console.log("error requesting microphone access:" + err);
			});
	}

};

export default helpers;