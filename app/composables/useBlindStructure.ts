import type { BlindLevel, GameSpeed } from '~/types/poker'

interface SpeedParams {
	levelMinutes: number
	startingBBRatio: number
}

const SPEED_PARAMS: Record<GameSpeed, SpeedParams> = {
	slow: { levelMinutes: 20, startingBBRatio: 100 },
	standard: { levelMinutes: 15, startingBBRatio: 50 },
	fast: { levelMinutes: 10, startingBBRatio: 25 },
}

/**
 * Округление вверх до ближайшего кратного минимальному номиналу фишки
 */
export const roundToChip = (value: number, denominations: number[]): number => {
	if (denominations.length === 0) return Math.max(Math.ceil(value), 1)
	const sorted = [...denominations].sort((a, b) => a - b)
	const minChip = sorted[0]!
	const rounded = Math.ceil(value / minChip) * minChip
	return Math.max(rounded, minChip)
}

interface GenerateBlindLevelsParams {
	startingStack: number
	playerCount: number
	gameDurationMinutes: number
	speed: GameSpeed
	chipDenominations: number[]
}

/**
 * Генерация таблицы уровней блайндов по скорости игры.
 * Алгоритм из POKER_BOARD_SPEC_ADDON.
 */
export const generateBlindLevels = (params: GenerateBlindLevelsParams): BlindLevel[] => {
	const { startingStack, playerCount, gameDurationMinutes, speed, chipDenominations } = params
	const { levelMinutes, startingBBRatio } = SPEED_PARAMS[speed]

	// Шаг 2: количество уровней
	const totalLevels = Math.ceil(gameDurationMinutes / levelMinutes)
	const levelsWithBuffer = totalLevels + 2

	// Шаг 3: начальный и конечный BB
	const startBB = roundToChip(startingStack / startingBBRatio, chipDenominations)
	const totalChips = startingStack * playerCount
	const finalBB = roundToChip(totalChips * 0.05, chipDenominations)

	// Шаг 4: кривая роста (геометрическая прогрессия)
	// Защита от случая когда finalBB <= startBB
	const effectiveFinalBB = Math.max(finalBB, startBB * 2)
	const growthRate = totalLevels > 1
		? Math.pow(effectiveFinalBB / startBB, 1 / (totalLevels - 1))
		: 2

	const rawLevels: BlindLevel[] = []
	for (let i = 0; i < levelsWithBuffer; i++) {
		const rawBB = startBB * Math.pow(growthRate, i)
		const bb = roundToChip(rawBB, chipDenominations)
		const sb = roundToChip(bb / 2, chipDenominations)

		rawLevels.push({
			level: i + 1,
			smallBlind: sb,
			bigBlind: bb,
			durationMinutes: levelMinutes,
		})
	}

	// Шаг 6: дедупликация соседних уровней с одинаковым BB
	const levels: BlindLevel[] = []
	for (const lvl of rawLevels) {
		const prev = levels[levels.length - 1]
		if (prev && prev.bigBlind === lvl.bigBlind) continue
		levels.push({ ...lvl, level: levels.length + 1 })
	}

	return levels
}

export const useBlindStructure = () => ({
	generateBlindLevels,
	roundToChip,
	SPEED_PARAMS,
})
