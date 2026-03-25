import { defineStore } from 'pinia'
import type {
	PokerConfig,
	PokerGameState,
	PokerPlayer,
	PokerBlindLevel,
	BlindLevel,
	TournamentStage,
} from '~/types/poker'

const createDefaultConfig = (): PokerConfig => ({
	name: '',
	buyIn: 500,
	maxRebuys: 3,
	rebuyPeriodMinutes: 60,
	gameDurationMinutes: 180,
	prizes: [50, 30, 20],
	blinds: {
		startSB: 25,
		startBB: 50,
		intervalMinutes: 15,
		multiplier: 2,
	},
	buyInChips: 2000,
	gameSpeed: 'standard',
	chipCase: [],
})

const createDefaultGameState = (): PokerGameState => ({
	status: 'idle',
	elapsedSeconds: 0,
	currentBlindLevel: 0,
	blindTimerSeconds: 0,
	dealerIndex: 0,
	players: [],
	totalPot: 0,
	eliminationCounter: 0,
	handNumber: 1,
	totalAddOns: 0,
})

export const usePokerStore = defineStore('poker', () => {
	const config = ref<PokerConfig>(createDefaultConfig())
	const gameState = ref<PokerGameState>(createDefaultGameState())

	// --- Getters ---

	const activePlayers = computed<PokerPlayer[]>(
		() => gameState.value.players.filter(p => !p.isEliminated),
	)

	const activePlayerIndices = computed<number[]>(
		() => gameState.value.players
			.map((p, i) => p.isEliminated ? -1 : i)
			.filter(i => i !== -1),
	)

	const roundBlindToChip = (value: number): number => Math.max(Math.round(value), 1)

	const getBlindLevelValues = (level: number): { sb: number; bb: number } => {
		const { startSB, startBB, multiplier } = config.value.blinds
		const rawSB = startSB * (multiplier ** level)
		const rawBB = startBB * (multiplier ** level)
		return {
			sb: roundBlindToChip(rawSB),
			bb: roundBlindToChip(rawBB),
		}
	}

	const currentBlinds = computed(() => getBlindLevelValues(gameState.value.currentBlindLevel))

	const nextBlinds = computed(() => getBlindLevelValues(gameState.value.currentBlindLevel + 1))

	const blindLevelsPreview = computed<PokerBlindLevel[]>(() => {
		const levels: PokerBlindLevel[] = []
		for (let i = 0; i < 8; i++) {
			const { sb, bb } = getBlindLevelValues(i)
			levels.push({ level: i, sb, bb })
		}
		return levels
	})

	// --- Новые геттеры (фаза 10) ---

	const minBet = computed(() => currentBlinds.value.bb)

	const minRaise = computed(() => currentBlinds.value.bb * 2)

	const averageStackBB = computed(() => {
		const totalRebuys = gameState.value.players.reduce((sum, p) => sum + p.rebuysUsed, 0)
		const totalChips = config.value.buyInChips * gameState.value.players.length
			+ totalRebuys * config.value.buyInChips
			+ gameState.value.totalAddOns * config.value.buyInChips
		const active = activePlayers.value.length
		const bb = currentBlinds.value.bb
		if (active === 0 || bb === 0) return 0
		return Math.round(totalChips / active / bb)
	})

	const tournamentStage = computed((): TournamentStage => {
		const active = activePlayers.value.length
		const total = gameState.value.players.length
		const prizeCount = config.value.prizes.length

		if (active <= 2) return 'heads-up'
		if (active <= 3) return 'final-table'
		if (active <= prizeCount) return 'in-prizes'
		if (active === prizeCount + 1) return 'bubble'
		if (total > 0 && active / total > 0.7) return 'early'
		return 'middle'
	})

	// Заглушка — будет заменена в фазе 11 на generateBlindLevels()
	const allBlindLevels = computed<BlindLevel[]>(() => {
		const levels: BlindLevel[] = []
		const intervalMinutes = config.value.blinds.intervalMinutes
		const totalLevels = Math.ceil(config.value.gameDurationMinutes / intervalMinutes) + 2
		for (let i = 0; i < totalLevels; i++) {
			const { sb, bb } = getBlindLevelValues(i)
			levels.push({
				level: i + 1,
				smallBlind: sb,
				bigBlind: bb,
				durationMinutes: intervalMinutes,
			})
		}
		return levels
	})

	const prizeAmounts = computed<[number, number, number]>(() => {
		const pot = gameState.value.totalPot
		return config.value.prizes.map(p => Math.round(pot * p / 100)) as [number, number, number]
	})

	// Курс: сколько рублей стоит 1 фишка
	const chipRate = computed(() => {
		const { buyIn, buyInChips } = config.value
		if (buyInChips === 0) return { rubPerChip: 0, chipsPerRub: 0 }
		const rubPerChip = Math.round(buyIn / buyInChips * 100) / 100
		const chipsPerRub = Math.round(buyInChips / buyIn * 100) / 100
		return { rubPerChip, chipsPerRub }
	})

	const gameDurationSeconds = computed(() => config.value.gameDurationMinutes * 60)

	const remainingGameSeconds = computed(
		() => Math.max(0, gameDurationSeconds.value - gameState.value.elapsedSeconds),
	)

	const rebuyPeriodSeconds = computed(() => config.value.rebuyPeriodMinutes * 60)

	const isRebuyPeriod = computed(
		() => gameState.value.elapsedSeconds < rebuyPeriodSeconds.value
			&& gameState.value.status !== 'idle'
			&& gameState.value.status !== 'finished',
	)

	const isAddOnAvailable = computed(
		() => !isRebuyPeriod.value
			&& gameState.value.status !== 'idle'
			&& gameState.value.status !== 'finished',
	)

	const getNextActiveIndex = (fromIndex: number): number => {
		const indices = activePlayerIndices.value
		if (indices.length === 0) return fromIndex

		const currentPos = indices.indexOf(fromIndex)
		if (currentPos === -1) {
			// Find the nearest active index after fromIndex
			for (let i = 0; i < indices.length; i++) {
				if (indices[i]! > fromIndex) return indices[i]!
			}
			return indices[0]!
		}

		return indices[(currentPos + 1) % indices.length]!
	}

	const dealerPlayer = computed<PokerPlayer | null>(() => {
		const players = gameState.value.players
		if (players.length === 0) return null
		return players[gameState.value.dealerIndex] ?? null
	})

	const sbPlayer = computed<PokerPlayer | null>(() => {
		const active = activePlayers.value
		if (active.length < 2) return null

		// Heads-up: dealer = SB
		if (active.length === 2) return dealerPlayer.value

		const sbIndex = getNextActiveIndex(gameState.value.dealerIndex)
		return gameState.value.players[sbIndex] ?? null
	})

	const bbPlayer = computed<PokerPlayer | null>(() => {
		const active = activePlayers.value
		if (active.length < 2) return null

		if (active.length === 2) {
			// Heads-up: the other player is BB
			const sbIndex = getNextActiveIndex(gameState.value.dealerIndex)
			return gameState.value.players[getNextActiveIndex(sbIndex)] ?? null
		}

		const sbIndex = getNextActiveIndex(gameState.value.dealerIndex)
		const bbIndex = getNextActiveIndex(sbIndex)
		return gameState.value.players[bbIndex] ?? null
	})

	// --- Actions ---

	const initGame = (newConfig: PokerConfig, players: PokerPlayer[]) => {
		config.value = newConfig
		gameState.value = {
			status: 'playing',
			elapsedSeconds: 0,
			currentBlindLevel: 0,
			blindTimerSeconds: newConfig.blinds.intervalMinutes * 60,
			dealerIndex: 0,
			players,
			totalPot: players.length * newConfig.buyIn,
			eliminationCounter: 0,
			handNumber: 1,
			totalAddOns: 0,
		}
	}

	const rebuy = (playerId: number) => {
		const player = gameState.value.players.find(p => p.id === playerId)
		if (!player || player.isEliminated) return

		if (isRebuyPeriod.value) {
			if (player.rebuysUsed >= config.value.maxRebuys) return
			player.rebuysUsed++
		}
		else if (isAddOnAvailable.value) {
			if (player.addOnUsed) return
			player.addOnUsed = true
			gameState.value.totalAddOns++
		}
		else {
			return
		}

		player.totalContributed += config.value.buyIn
		gameState.value.totalPot += config.value.buyIn
	}

	const canRebuy = (playerId: number): boolean => {
		const player = gameState.value.players.find(p => p.id === playerId)
		if (!player || player.isEliminated) return false

		if (isRebuyPeriod.value) {
			return player.rebuysUsed < config.value.maxRebuys
		}

		if (isAddOnAvailable.value) {
			return !player.addOnUsed
		}

		return false
	}

	const isPlayerAddOn = (playerId: number): boolean => {
		if (isRebuyPeriod.value) return false
		const player = gameState.value.players.find(p => p.id === playerId)
		if (!player) return false
		return isAddOnAvailable.value && !player.addOnUsed
	}

	const eliminatePlayer = (playerId: number) => {
		const player = gameState.value.players.find(p => p.id === playerId)
		if (!player || player.isEliminated) return

		gameState.value.eliminationCounter++
		player.isEliminated = true
		player.eliminationOrder = gameState.value.eliminationCounter

		// If only 1 player left — finish game
		if (activePlayers.value.length <= 1) {
			finishGame()
		}
	}

	const nextDeal = () => {
		const active = activePlayers.value
		if (active.length < 2) return

		gameState.value.dealerIndex = getNextActiveIndex(gameState.value.dealerIndex)
		gameState.value.handNumber++
	}

	const advanceBlinds = () => {
		gameState.value.currentBlindLevel++
		gameState.value.blindTimerSeconds = config.value.blinds.intervalMinutes * 60
	}

	const tick = () => {
		if (gameState.value.status !== 'playing') return

		gameState.value.elapsedSeconds++
		gameState.value.blindTimerSeconds--

		if (gameState.value.blindTimerSeconds <= 0) {
			advanceBlinds()
		}

		if (gameState.value.elapsedSeconds >= gameDurationSeconds.value) {
			// Game time is up — don't auto-finish, just let the UI handle the notification
		}
	}

	const pause = () => {
		if (gameState.value.status === 'playing') {
			gameState.value.status = 'paused'
		}
	}

	const resume = () => {
		if (gameState.value.status === 'paused') {
			gameState.value.status = 'playing'
		}
	}

	const togglePause = () => {
		if (gameState.value.status === 'playing') pause()
		else if (gameState.value.status === 'paused') resume()
	}

	const finishGame = () => {
		gameState.value.status = 'finished'

		// The last active player gets 1st place (eliminationOrder = null means they survived)
		// Rankings: survived players first, then eliminated in reverse order
	}

	const getResults = computed(() => {
		const players = [...gameState.value.players]

		// Active players (not eliminated) come first
		const active = players.filter(p => !p.isEliminated)
		// Eliminated players sorted by eliminationOrder descending (last eliminated = higher place)
		const eliminated = players
			.filter(p => p.isEliminated)
			.sort((a, b) => (b.eliminationOrder ?? 0) - (a.eliminationOrder ?? 0))

		return [...active, ...eliminated]
	})

	const reset = () => {
		config.value = createDefaultConfig()
		gameState.value = createDefaultGameState()
	}

	const restoreState = (savedConfig: PokerConfig, savedGameState: PokerGameState) => {
		config.value = savedConfig
		gameState.value = { ...savedGameState, status: 'paused' }
	}

	return {
		// State
		config,
		gameState,

		// Getters
		activePlayers,
		currentBlinds,
		nextBlinds,
		blindLevelsPreview,
		prizeAmounts,
		chipRate,
		gameDurationSeconds,
		remainingGameSeconds,
		rebuyPeriodSeconds,
		isRebuyPeriod,
		isAddOnAvailable,
		dealerPlayer,
		sbPlayer,
		bbPlayer,
		getResults,
		minBet,
		minRaise,
		averageStackBB,
		tournamentStage,
		allBlindLevels,

		// Actions
		initGame,
		rebuy,
		canRebuy,
		isPlayerAddOn,
		eliminatePlayer,
		nextDeal,
		advanceBlinds,
		tick,
		pause,
		resume,
		togglePause,
		finishGame,
		reset,
		restoreState,
	}
})
