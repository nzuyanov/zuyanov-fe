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
