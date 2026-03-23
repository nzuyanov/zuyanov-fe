import { usePokerStore } from '~/stores/usePokerStore'
import type { PokerSaveData } from '~/types/poker'

const STORAGE_KEY = 'poker-board-state'
const SAVE_VERSION = 1
const AUTOSAVE_INTERVAL = 60_000

export const usePokerStorage = () => {
	const store = usePokerStore()

	let autosaveId: ReturnType<typeof setInterval> | null = null

	const save = (): boolean => {
		try {
			const data: PokerSaveData = {
				version: SAVE_VERSION,
				savedAt: Date.now(),
				config: toRaw(store.config),
				gameState: toRaw(store.gameState),
			}
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
			return true
		}
		catch {
			console.warn('Failed to save poker state to localStorage')
			return false
		}
	}

	const load = (): PokerSaveData | null => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY)
			if (!raw) return null

			const data = JSON.parse(raw) as PokerSaveData
			if (data.version !== SAVE_VERSION) return null
			if (!data.config || !data.gameState) return null
			if (data.gameState.status === 'finished' || data.gameState.status === 'idle') return null

			return data
		}
		catch {
			return null
		}
	}

	const clear = () => {
		try {
			localStorage.removeItem(STORAGE_KEY)
		}
		catch {
			// Ignore
		}
	}

	const restore = (data: PokerSaveData) => {
		store.restoreState(data.config, data.gameState)
	}

	const startAutosave = () => {
		stopAutosave()
		autosaveId = setInterval(() => {
			if (store.gameState.status === 'playing' || store.gameState.status === 'paused') {
				save()
			}
		}, AUTOSAVE_INTERVAL)
	}

	const stopAutosave = () => {
		if (autosaveId !== null) {
			clearInterval(autosaveId)
			autosaveId = null
		}
	}

	const saveOnAction = () => {
		if (store.gameState.status === 'playing' || store.gameState.status === 'paused') {
			save()
		}
	}

	// beforeunload handler
	const onBeforeUnload = () => {
		if (store.gameState.status === 'playing' || store.gameState.status === 'paused') {
			save()
		}
	}

	const setupAutoSaveListeners = () => {
		window.addEventListener('beforeunload', onBeforeUnload)
		startAutosave()
	}

	const cleanupAutoSaveListeners = () => {
		window.removeEventListener('beforeunload', onBeforeUnload)
		stopAutosave()
	}

	return {
		save,
		load,
		clear,
		restore,
		saveOnAction,
		startAutosave,
		stopAutosave,
		setupAutoSaveListeners,
		cleanupAutoSaveListeners,
	}
}
