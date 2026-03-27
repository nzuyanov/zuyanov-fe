// --- Скорость игры ---
import { CHIP_COLORS } from '~/constants/poker'

export type ChipColor = (typeof CHIP_COLORS)[keyof typeof CHIP_COLORS]

export type GameSpeed = 'slow' | 'normal' | 'fast'

// --- Стадия турнира ---
export type TournamentStage = 'early' | 'middle' | 'bubble' | 'in-prizes' | 'final-table' | 'heads-up'

/** Одна запись в чемодане: номинал + количество физических фишек */
export interface ChipCaseEntry {
	denomination: number
	color: ChipColor
	totalCount: number
}

/** Одна строка раздачи: сколько фишек данного номинала даётся игроку */
export interface ChipDistributionEntry {
	denomination: number
	count: number
	color: ChipColor
	totalValue: number
}

export interface ChipDistribution {
	distribution: ChipDistributionEntry[]
	startingStack: number
	totalChipCount: number
}

/** Входные параметры турнира */
export interface PokerConfig {
	/** Название турнира */
	name: string
	/** Содержимое чемодана с фишками */
	chipCase: ChipCaseEntry[]

	/** Сумма закупа в рублях */
	buyIn: number

	/** Максимальное количество ребаев на одного игрока */
	maxRebuys: number

	/** Время, в течение которого доступны ребаи (от старта), минуты */
	rebuyPeriodMinutes: number

	/** Общая длительность турнира, минуты */
	gameDurationMinutes: number

	/** Распределение выигрыша в процентах */
	prizes: [number, number, number]

	/** Скорость игры — определяет длину уровней и стартовую глубину */
	gameSpeed: GameSpeed

	/** Количество игроков */
 	playerCount: number
}

/** Один уровень блайндов */
export interface BlindLevel {
	level: number
	smallBlind: number
	bigBlind: number
	durationMinutes: number
	/** true — запасной уровень за пределами запланированного времени */
	isBuffer: boolean
}

/** Результат расчёта турнира */
export interface TournamentSetup {
	/** Стартовый стек одного игрока (в фишечных единицах) */
	startingStack: number
	/** Суммарное количество фишек в стартовом стеке */
	startingChipCount: number
	/** Набор фишек, который выдаётся каждому игроку */
	chipDistributionPerPlayer: ChipDistributionEntry[]
	/** Анализ хватает ли фишек */
	chipAvailability: ChipAvailability
	/** Таблица уровней блайндов */
	blindLevels: BlindLevel[]
	/** Уровень, на котором ожидается завершение турнира */
	expectedEndLevel: number
	/** Стартовая глубина игры в BB */
	startingDepthBB: number
	/** Предупреждения и замечания */
	warnings: string[]
}

/** Доступность фишек для всего турнира */
export interface ChipAvailability {
	/** Сколько полных раздач (стартовых стеков) поддерживает чемодан */
	totalDistributions: number
	/** Хватает на стартовые стеки всем игрокам */
	enoughForStart: boolean
	/** Хватает на все возможные ребаи */
	enoughForRebuys: boolean
	/** Хватает на аддон каждому игроку */
	enoughForAddOns: boolean
	/** Номинал-узкое место (первым иссякает) */
	bottleneck?: string
}

export interface PokerPlayer {
	id: number
	name: string
	avatarId: string
	totalContributed: number
	rebuysUsed: number
	addOnUsed: boolean
	isEliminated: boolean
	eliminationOrder: number | null
}

export type PokerGameStatus = 'idle' | 'playing' | 'paused' | 'finished'

export interface PokerGameState {
	status: PokerGameStatus
	elapsedSeconds: number
	currentBlindLevel: number
	blindTimerSeconds: number
	dealerIndex: number
	players: PokerPlayer[]
	totalPot: number
	eliminationCounter: number
	handNumber: number
	totalAddOns: number
}

export interface PokerSaveData {
	version: number
	savedAt: number
	config: PokerConfig
	gameState: PokerGameState
}
