import { usePokerStore } from '~/stores/poker'

export interface PokerTimerCallbacks {
	onBlindsUp: () => void
	onGameTimeUp: () => void
	onWarning5min: () => void
	onWarning1minBlinds: () => void
	onRebuyPeriodEnd: () => void
}

export const usePokerTimer = (callbacks: PokerTimerCallbacks) => {
	const store = usePokerStore()

	let intervalId: ReturnType<typeof setInterval> | null = null

	const warned5min = ref(false)
	const warned1minBlinds = ref(false)
	const rebuyPeriodEnded = ref(false)

	const start = () => {
		if (intervalId !== null) return

		intervalId = setInterval(() => {
			if (store.gameState.status !== 'playing') return

			const prevElapsed = store.gameState.elapsedSeconds
			const wasRebuyPeriod = prevElapsed < store.rebuyPeriodSeconds

			store.tick()

			// Check game time up
			if (store.remainingGameSeconds <= 0) {
				callbacks.onGameTimeUp()
			}

			// Warning: 5 minutes remaining
			if (!warned5min.value && store.remainingGameSeconds <= 300 && store.remainingGameSeconds > 0) {
				warned5min.value = true
				callbacks.onWarning5min()
			}

			// Warning: 1 minute before blind increase
			if (!warned1minBlinds.value && store.gameState.blindTimerSeconds <= 60 && store.gameState.blindTimerSeconds > 0) {
				warned1minBlinds.value = true
				callbacks.onWarning1minBlinds()
			}

			// Rebuy period ended
			if (!rebuyPeriodEnded.value && wasRebuyPeriod && store.gameState.elapsedSeconds >= store.rebuyPeriodSeconds) {
				rebuyPeriodEnded.value = true
				callbacks.onRebuyPeriodEnd()
			}
		}, 1000)
	}

	// Звук повышения блайндов играем, когда уровень реально применён (по кнопке «Следующая раздача»)
	watch(() => store.gameState.currentBlindLevel, (newLevel, oldLevel) => {
		if (newLevel > oldLevel) {
			callbacks.onBlindsUp()
			warned1minBlinds.value = false
		}
	})

	const stop = () => {
		if (intervalId !== null) {
			clearInterval(intervalId)
			intervalId = null
		}
	}

	const resetWarnings = () => {
		warned5min.value = false
		warned1minBlinds.value = false
		rebuyPeriodEnded.value = false
	}

	// Auto-start/stop based on game status
	watch(
		() => store.gameState.status,
		(status) => {
			if (status === 'playing') {
				start()
			}
			else {
				stop()
			}
		},
		{ immediate: true },
	)

	onUnmounted(() => {
		stop()
	})

	return {
		start,
		stop,
		resetWarnings,
		warned5min: readonly(warned5min),
		warned1minBlinds: readonly(warned1minBlinds),
		rebuyPeriodEnded: readonly(rebuyPeriodEnded),
	}
}
