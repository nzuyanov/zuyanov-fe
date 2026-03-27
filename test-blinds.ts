const SPEED_PARAMS: Record<string, { levelMinutes: number; startingBBRatio: number }> = {
	slow:   { levelMinutes: 20, startingBBRatio: 100 },
	normal: { levelMinutes: 15, startingBBRatio: 50 },
	fast:   { levelMinutes: 10, startingBBRatio: 25 },
}

const roundUpToChip = (value: number, step: number): number => {
	if (step <= 0) return Math.max(1, Math.ceil(value))
	if (value <= 0) return step
	return Math.ceil(value / step) * step
}

const getBlindRoundingStep = (value: number, denominations: number[]): number => {
	if (denominations.length === 0) return 1
	const sorted = [...denominations].sort((a, b) => a - b)
	let step = sorted[0]!
	for (let i = 1; i < sorted.length; i++) {
		const nextDenom = sorted[i]!
		if (value >= nextDenom * 10) {
			step = nextDenom
		} else {
			break
		}
	}
	return step
}

const generateBlindLevels = (
	startingStack: number,
	playerCount: number,
	gameDurationMinutes: number,
	speed: string,
	denominations: number[],
	maxRebuys: number,
) => {
	const { levelMinutes, startingBBRatio } = SPEED_PARAMS[speed]!
	const minDenom = denominations.length > 0 ? Math.min(...denominations) : 1
	const totalLevels = Math.max(1, Math.ceil(gameDurationMinutes / levelMinutes))
	const levelsWithBuffer = totalLevels + 2

	const rawStartSB = startingStack / (startingBBRatio * 2)
	const startSB = roundUpToChip(rawStartSB, minDenom)
	const startBB = startSB * 2

	const totalBaseChips = startingStack * playerCount
	const rawFinalSB = (totalBaseChips * 0.05) / 2
	const finalSB = roundUpToChip(rawFinalSB, minDenom)
	const finalBB = Math.max(finalSB * 2, startBB * 4)

	const growthRate = totalLevels > 1
		? Math.pow(finalBB / startBB, 1 / (totalLevels - 1))
		: 1.5

	const sortedDenoms = [...denominations].sort((a, b) => a - b)
	const safeStep = sortedDenoms.find(d => d % 10 === 0) ?? sortedDenoms[0]!

	const levels: { level: number; sb: number; bb: number; isBuffer: boolean }[] = []
	let prevBB = 0

	for (let i = 0; i < levelsWithBuffer; i++) {
		const rawSB = startSB * Math.pow(growthRate, i)
		const rawBB = rawSB * 2

		const minStep = rawSB >= 100 ? safeStep : 0
		const step = Math.max(getBlindRoundingStep(rawBB, denominations), minStep)
		let sb = roundUpToChip(rawSB, step)

		for (const denom of sortedDenoms) {
			if (denom >= safeStep * 2 && denom > sb && denom - sb <= safeStep && sb >= denom * 0.8) {
				sb = denom
				break
			}
		}

		const bb = sb * 2
		if (bb === prevBB) continue
		prevBB = bb

		levels.push({
			level: levels.length + 1,
			sb,
			bb,
			isBuffer: i >= totalLevels,
		})
	}

	return levels
}

const denoms = [5, 25, 50, 100, 500]

for (const speed of ['slow', 'normal', 'fast']) {
	console.log(`=== ${speed.toUpperCase()} ===`)
	const levels = generateBlindLevels(1375, 6, 180, speed, denoms, 2)
	for (const l of levels) {
		const buf = l.isBuffer ? '  (запас)' : ''
		console.log(`Ур.${String(l.level).padStart(2)}  SB=${String(l.sb).padStart(5)}  BB=${String(l.bb).padStart(5)}${buf}`)
	}
	console.log('')
}
