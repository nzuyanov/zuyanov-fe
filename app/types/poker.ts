// --- Скорость игры ---
export type GameSpeed = 'slow' | 'standard' | 'fast'

// --- Стадия турнира ---
export type TournamentStage = 'early' | 'middle' | 'bubble' | 'in-prizes' | 'final-table' | 'heads-up'

// --- Чемодан фишек ---
export interface ChipCaseEntry {
	denomination: number
	color?: string
	totalCount: number
}

// --- Раздача фишек на игрока ---
export interface ChipDistribution {
	perPlayer: { denomination: number; count: number }[]
	totalValue: number
	totalChips: number
	isValid: boolean
	deficit: number
}

// --- Доступность фишек ---
export interface ChipAvailability {
	totalDistributions: number
	enoughForStart: boolean
	enoughForRebuys: boolean
	enoughForAddOns: boolean
	bottleneck?: string
}

// --- Уровень блайндов (расширенный) ---
export interface BlindLevel {
	level: number
	smallBlind: number
	bigBlind: number
	durationMinutes: number
}

// --- Старые блайнды (будет удалено в фазе 11) ---
export interface PokerBlindsConfig {
	startSB: number
	startBB: number
	intervalMinutes: number
	multiplier: number
}

export interface PokerConfig {
	name: string
	buyIn: number
	buyInChips: number
	maxRebuys: number
	rebuyPeriodMinutes: number
	gameDurationMinutes: number
	prizes: [number, number, number]
	blinds: PokerBlindsConfig
	// Новые поля (фаза 10) — параллельно со старыми до фазы 11
	gameSpeed: GameSpeed
	chipCase: ChipCaseEntry[]
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
	// Новые поля (фаза 10)
	handNumber: number
	totalAddOns: number
}

export interface PokerSaveData {
	version: number
	savedAt: number
	config: PokerConfig
	gameState: PokerGameState
}

export interface PokerBlindLevel {
	level: number
	sb: number
	bb: number
}
