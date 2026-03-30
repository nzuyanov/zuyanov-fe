import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'
import type {
	PokerConfig,
	PokerGameState,
	PokerPlayer,
	TournamentStage,
	TournamentSetup,
} from '~/types/poker'
import {
	POKER_CONFIG_DEFAULT,
	NEW_CHIP_COLOR_DEFAULT,
	NEW_CHIP_COUNT_DEFAULT,
	MIN_BB_DEPTH,
	MAX_BB_DEPTH,
} from '~/constants/poker'
import { calculateTournament } from '~/utils/poker'

const initGameState: PokerGameState = {
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
}

export const usePokerStore = defineStore('poker', () => {
	const config = ref<PokerConfig>(POKER_CONFIG_DEFAULT)
	const gameState = ref<PokerGameState>(initGameState)
	const niceRateEnabled = ref(false)

	const gameSetup = computed<TournamentSetup>(() => calculateTournament(config.value, niceRateEnabled.value))

	const isGameTooShort = computed(() => gameSetup.value.startingDepthBB < MIN_BB_DEPTH)
	const isGameTooLong = computed(() => gameSetup.value.startingDepthBB > MAX_BB_DEPTH)
	// TODO: прикрутить
	// if (startingDepthBB < 20) {
	// 	warnings.push(
	// 		`Стартовая глубина слишком маленькая (${startingDepthBB} BB) — игра будет очень короткой. ` +
	// 		'Попробуй уменьшить количество ребаев или выбрать скорость помедленнее.',
	// 	)
	// } else if (startingDepthBB > 200) {
	// 	warnings.push(
	// 		`Стартовая глубина очень большая (${startingDepthBB} BB) — турнир может затянуться дольше запланированного.`,
	// 	)
	// }

	const allBlindLevels = computed(() => gameSetup.value.blindLevels)

	const totalPotInCash = computed(() => config.value.playerCount * config.value.buyIn)
	const prizeInCash = computed(() =>
		config.value.prizes.map(p => Math.round(totalPotInCash.value * p / 100)),
	)

	const addChipDenom = () => {
		const denoms = config.value.chipCase.map(c => c.denomination)
		const maxDenom = denoms.length > 0 ? Math.max(...denoms) : 0
		config.value.chipCase.push({
			denomination: maxDenom * 2,
			color: NEW_CHIP_COLOR_DEFAULT,
			totalCount: NEW_CHIP_COUNT_DEFAULT,
			id: nanoid(),
		})
	}

	const removeChipDenom = (id: string) => {
		if (config.value.chipCase.length <= 1) return
		const index = config.value.chipCase.findIndex(ch => ch.id === id)
		if (index === -1) return
		config.value.chipCase.splice(index, 1)
	}

	const rubInChip = computed(() => {
		const raw = config.value.buyIn / gameSetup.value.startingStack
		return parseFloat(raw.toFixed(4)).toLocaleString('ru-RU', { maximumFractionDigits: 4 })
	})

	const chipsPerRubRaw = computed(() => parseFloat((gameSetup.value.startingStack / config.value.buyIn).toFixed(4)))

	const chipInRub = computed(() => {
		if (config.value.buyIn === 0) return 0
		return chipsPerRubRaw.value.toLocaleString('ru-RU', { maximumFractionDigits: 4 })
	})

	const chipInRubUnit = computed(() => pluralizeChip(chipsPerRubRaw.value))

	const activePlayers = computed<PokerPlayer[]>(() => gameState.value.players.filter(p => !p.isEliminated))

	const activePlayerIndices = computed<number[]>(
		() => gameState.value.players
			.map((p, i) => p.isEliminated ? -1 : i)
			.filter(i => i !== -1),
	)

	const currentBlinds = computed(() => {
		const level = allBlindLevels.value[gameState.value.currentBlindLevel]
		if (!level) {
			// За пределами таблицы — вернуть последний уровень
			const last = allBlindLevels.value[allBlindLevels.value.length - 1]
			return last ? { sb: last.smallBlind, bb: last.bigBlind } : { sb: 25, bb: 50 }
		}
		return { sb: level.smallBlind, bb: level.bigBlind }
	})

	const nextBlinds = computed(() => {
		const nextIdx = gameState.value.currentBlindLevel + 1
		const level = allBlindLevels.value[nextIdx]
		if (!level) {
			const last = allBlindLevels.value[allBlindLevels.value.length - 1]
			return last ? { sb: last.smallBlind, bb: last.bigBlind } : { sb: 50, bb: 100 }
		}
		return { sb: level.smallBlind, bb: level.bigBlind }
	})


	const minBet = computed(() => currentBlinds.value.bb)

	const minRaise = computed(() => currentBlinds.value.bb * 2)

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

	const prizeAmounts = computed<[number, number, number]>(() => {
		const pot = gameState.value.totalPot
		return config.value.prizes.map(p => Math.round(pot * p / 100)) as [number, number, number]
	})

	const prizesSum = computed(() => config.value.prizes[0] + config.value.prizes[1] + config.value.prizes[2])
	const isPrizesValid = computed(() => prizesSum.value === 100)

	// TODO: Курс сколько рублей стоит 1 фишка
	// const chipRate = computed(() => {
	// 	const { buyIn, buyInChips } = config.value
	// 	if (buyInChips === 0) return { rubPerChip: 0, chipsPerRub: 0 }
	// 	const rubPerChip = Math.round(buyIn / buyInChips * 100) / 100
	// 	const chipsPerRub = Math.round(buyInChips / buyIn * 100) / 100
	// 	return { rubPerChip, chipsPerRub }
	// })

	const gameDurationSeconds = computed(() => config.value.gameDurationMinutes * 60)

	const remainingGameSeconds = computed(() => Math.max(0, gameDurationSeconds.value - gameState.value.elapsedSeconds))

	const rebuyPeriodSeconds = computed(() => config.value.rebuyPeriodMinutes * 60)

	const isRebuyPeriod = computed(() => gameState.value.elapsedSeconds < rebuyPeriodSeconds.value && gameState.value.status !== 'idle' && gameState.value.status !== 'finished')

	const isAddOnAvailable = computed(() => !isRebuyPeriod.value && gameState.value.status !== 'idle' && gameState.value.status !== 'finished')

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

	const initGame = (players: PokerPlayer[]) => {

		const firstLevelDuration = gameSetup.value.blindLevels[0]?.durationMinutes ?? 10

		gameState.value = {
			status: 'playing',
			elapsedSeconds: 0,
			currentBlindLevel: 0,
			blindTimerSeconds: firstLevelDuration * 60,
			dealerIndex: 0,
			players,
			totalPot: players.length * config.value.buyIn,
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
		const nextLevel = allBlindLevels.value[gameState.value.currentBlindLevel]
		const duration = nextLevel ? nextLevel.durationMinutes : allBlindLevels.value[0]?.durationMinutes ?? 15
		gameState.value.blindTimerSeconds = duration * 60
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
		config.value = POKER_CONFIG_DEFAULT
		gameState.value = initGameState
	}

	const restoreState = (savedConfig: PokerConfig, savedGameState: PokerGameState) => {
		config.value = savedConfig
		gameState.value = { ...savedGameState, status: 'paused' }
	}

	return {
		// State
		config,
		gameState,
		niceRateEnabled,

		// Getters
		activePlayers,
		currentBlinds,
		nextBlinds,
		prizeAmounts,
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
		tournamentStage,
		allBlindLevels,
		totalPotInCash,
		prizeInCash,
		isPrizesValid,
		prizesSum,
		gameSetup,
		rubInChip,
		chipInRub,
		chipInRubUnit,
		isGameTooShort,
		isGameTooLong,

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
		addChipDenom,
		removeChipDenom,
	}
})
