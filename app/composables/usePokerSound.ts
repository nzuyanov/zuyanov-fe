type SoundType = 'blindsUp' | 'rebuyEnd' | 'gameEnd' | 'warning5min' | 'warning1min' | 'bubbleReached' | 'bubbleBurst'

interface ToneConfig {
	frequency: number
	duration: number
	type: OscillatorType
	ramp?: number
	repeat?: number
	gap?: number
}

const SOUND_CONFIGS: Record<SoundType, ToneConfig[]> = {
	blindsUp: [
		{ frequency: 660, duration: 0.15, type: 'sine' },
		{ frequency: 880, duration: 0.15, type: 'sine' },
		{ frequency: 1100, duration: 0.3, type: 'sine' },
	],
	rebuyEnd: [
		{ frequency: 440, duration: 0.2, type: 'sine' },
		{ frequency: 550, duration: 0.2, type: 'sine' },
		{ frequency: 660, duration: 0.4, type: 'sine' },
	],
	gameEnd: [
		{ frequency: 523, duration: 0.2, type: 'sine' },
		{ frequency: 659, duration: 0.2, type: 'sine' },
		{ frequency: 784, duration: 0.2, type: 'sine' },
		{ frequency: 1047, duration: 0.5, type: 'sine' },
	],
	warning5min: [
		{ frequency: 600, duration: 0.15, type: 'triangle' },
		{ frequency: 600, duration: 0.15, type: 'triangle' },
	],
	warning1min: [
		{ frequency: 500, duration: 0.1, type: 'triangle' },
	],
	// Тройной тон при наступлении баббла
	bubbleReached: [
		{ frequency: 440, duration: 0.15, type: 'sine' },
		{ frequency: 440, duration: 0.15, type: 'sine' },
		{ frequency: 440, duration: 0.3, type: 'sine' },
	],
	// Победный аккорд при лопании баббла (все в призах)
	bubbleBurst: [
		{ frequency: 523, duration: 0.15, type: 'sine' },
		{ frequency: 659, duration: 0.15, type: 'sine' },
		{ frequency: 784, duration: 0.15, type: 'sine' },
		{ frequency: 1047, duration: 0.4, type: 'sine' },
	],
}

export const usePokerSound = () => {
	const muted = ref(true)
	let audioContext: AudioContext | null = null

	const getContext = (): AudioContext => {
		if (!audioContext) {
			audioContext = new AudioContext()
		}
		return audioContext
	}

	const playTone = (ctx: AudioContext, config: ToneConfig, startTime: number): number => {
		const oscillator = ctx.createOscillator()
		const gainNode = ctx.createGain()

		oscillator.type = config.type
		oscillator.frequency.setValueAtTime(config.frequency, startTime)

		gainNode.gain.setValueAtTime(0.3, startTime)
		gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + config.duration)

		oscillator.connect(gainNode)
		gainNode.connect(ctx.destination)

		oscillator.start(startTime)
		oscillator.stop(startTime + config.duration)

		return startTime + config.duration + 0.05
	}

	const play = (sound: SoundType) => {
		if (muted.value) return

		try {
			const ctx = getContext()
			const tones = SOUND_CONFIGS[sound]
			let time = ctx.currentTime

			for (const tone of tones) {
				time = playTone(ctx, tone, time)
			}
		}
		catch {
			// Web Audio API not available or blocked
		}
	}

	const toggleMute = () => {
		muted.value = !muted.value

		// Resume AudioContext on first unmute (browser autoplay policy)
		if (!muted.value && audioContext?.state === 'suspended') {
			audioContext.resume()
		}
	}

	onUnmounted(() => {
		if (audioContext) {
			audioContext.close()
			audioContext = null
		}
	})

	return {
		muted: readonly(muted),
		play,
		toggleMute,
	}
}
