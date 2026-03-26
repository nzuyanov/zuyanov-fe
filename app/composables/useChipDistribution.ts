import type { ChipCaseEntry, ChipDistribution, ChipAvailability } from '~/types/poker'
import type { ChipColor } from '~/constants/poker'

/**
 * Рассчитать раздачу фишек на одного игрока из чемодана.
 *
 * Двухпроходный алгоритм:
 *   1) Сверху вниз (от крупных к мелким): берём максимум крупных фишек,
 *      оставляя резерв для меньших номиналов (минимум MIN_RESERVE_PER_DENOM штук каждого).
 *   2) Снизу вверх: если мелких не хватило на остаток — добираем крупными.
 *
 * maxPerPlayer рассчитывается от playerCount (не от totalDistributions),
 * чтобы не занижать крупные номиналы. Достаточность для ребаев/аддонов
 * проверяется отдельно в calculateChipAvailability.
 */
export const calculateChipDistribution = (
	chipCase: ChipCaseEntry[],
	playerCount: number,
	startingStack: number,
	_maxRebuys: number,
	_addOnEnabled: boolean,
): ChipDistribution => {
	if (chipCase.length === 0 || playerCount <= 0 || startingStack <= 0) {
		return { perPlayer: [], totalValue: 0, totalChips: 0, isValid: false, deficit: startingStack }
	}

	// Желаемый минимум фишек каждого меньшего номинала при резервировании
	const MIN_RESERVE_PER_DENOM = 3
	// Максимальная доля стека, которую можно зарезервировать под мелкие номиналы.
	// Без этого ограничения при большом количестве номиналов резерв может
	// превысить половину стека и заблокировать крупные фишки целиком.
	const MAX_RESERVE_RATIO = 0.4

	const sorted = [...chipCase]
		.filter(c => c.denomination > 0 && c.totalCount > 0)
		.sort((a, b) => a.denomination - b.denomination)

	if (sorted.length === 0) {
		return { perPlayer: [], totalValue: 0, totalChips: 0, isValid: false, deficit: startingStack }
	}

	// Доступное количество каждого номинала на одного игрока
	const chipsInfo = sorted.map(chip => ({
		denomination: chip.denomination,
		maxPerPlayer: Math.floor(chip.totalCount / playerCount),
		color: chip.color as ChipColor,
	}))

	// --- Проход 1: сверху вниз ---
	let remaining = startingStack
	const distribution: { denomination: number; count: number; color: ChipColor }[] = []

	for (let i = sorted.length - 1; i >= 0; i--) {
		const chip = chipsInfo[i]!

		if (chip.denomination > remaining && i > 0) continue

		if (i === 0) {
			// Самый мелкий номинал — забирает остаток
			const count = Math.ceil(remaining / chip.denomination)
			const capped = Math.min(count, chip.maxPerPlayer)
			if (capped > 0) {
				distribution.push({ denomination: chip.denomination, count: capped, color: chip.color })
				remaining -= capped * chip.denomination
			}
		}
		else {
			const maxByValue = Math.floor(remaining / chip.denomination)
			if (maxByValue <= 0) continue

			// Резерв: оставить место для нескольких фишек каждого меньшего номинала,
			// но не более MAX_RESERVE_RATIO от текущего остатка.
			// В оффлайн-игре мелкие фишки можно обменять на крупные в «банке»,
			// поэтому нет смысла запасать слишком много мелких.
			let rawReserve = 0
			for (let j = 0; j < i; j++) {
				rawReserve += chipsInfo[j]!.denomination * MIN_RESERVE_PER_DENOM
			}
			const reserve = Math.min(rawReserve, remaining * MAX_RESERVE_RATIO)

			const maxByReserve = remaining > reserve
				? Math.floor((remaining - reserve) / chip.denomination)
				: 0

			const count = Math.min(maxByValue, chip.maxPerPlayer, maxByReserve)
			if (count > 0) {
				distribution.push({ denomination: chip.denomination, count, color: chip.color })
				remaining -= count * chip.denomination
			}
		}
	}

	// --- Проход 2: снизу вверх --- добираем дефицит, если мелких не хватило
	if (remaining > 0) {
		for (let i = 0; i < chipsInfo.length; i++) {
			if (remaining <= 0) break
			const chip = chipsInfo[i]!
			const existing = distribution.find(d => d.denomination === chip.denomination)
			const usedCount = existing?.count ?? 0
			const availableMore = chip.maxPerPlayer - usedCount

			if (availableMore <= 0) continue

			const needed = Math.ceil(remaining / chip.denomination)
			const extra = Math.min(needed, availableMore)
			if (extra > 0) {
				if (existing) {
					existing.count += extra
				}
				else {
					distribution.push({ denomination: chip.denomination, count: extra, color: chip.color })
				}
				remaining -= extra * chip.denomination
			}
		}
	}

	distribution.sort((a, b) => a.denomination - b.denomination)

	const totalValue = distribution.reduce((s, d) => s + d.denomination * d.count, 0)
	const totalChips = distribution.reduce((s, d) => s + d.count, 0)

	return {
		perPlayer: distribution,
		totalValue,
		totalChips,
		isValid: totalValue === startingStack,
		deficit: totalValue >= startingStack ? 0 : startingStack - totalValue,
	}
}

/**
 * Проверить достаточность фишек в чемодане для турнира.
 */
export const calculateChipAvailability = (
	chipCase: ChipCaseEntry[],
	playerCount: number,
	startingStack: number,
	maxRebuys: number,
	addOnEnabled: boolean,
): ChipAvailability => {
	if (chipCase.length === 0 || playerCount <= 0 || startingStack <= 0) {
		return {
			totalDistributions: 0,
			enoughForStart: false,
			enoughForRebuys: false,
			enoughForAddOns: false,
			bottleneck: 'Чемодан пуст',
		}
	}

	const sorted = [...chipCase].sort((a, b) => a.denomination - b.denomination)

	// Рассчитать, сколько раздач можно сделать из чемодана
	// Для каждого номинала — сколько раздач можно сделать, если бы использовали только его
	// Реальное ограничение — по самому дефицитному номиналу

	// Сначала рассчитаем раздачу на одного игрока
	const dist = calculateChipDistribution(chipCase, playerCount, startingStack, maxRebuys, addOnEnabled)
	if (dist.perPlayer.length === 0) {
		return {
			totalDistributions: 0,
			enoughForStart: false,
			enoughForRebuys: false,
			enoughForAddOns: false,
			bottleneck: 'Невозможно собрать стек',
		}
	}

	// Для каждого номинала в раздаче — сколько полных раздач можно сделать
	let minDistributions = Infinity
	let bottleneckDenom: number | undefined

	for (const entry of dist.perPlayer) {
		const caseEntry = sorted.find(c => c.denomination === entry.denomination)
		if (!caseEntry || entry.count === 0) continue

		const possible = Math.floor(caseEntry.totalCount / entry.count)
		if (possible < minDistributions) {
			minDistributions = possible
			bottleneckDenom = entry.denomination
		}
	}

	if (minDistributions === Infinity) minDistributions = 0

	const maxRebuysTotal = playerCount * maxRebuys
	const maxAddOnsTotal = addOnEnabled ? playerCount : 0

	const enoughForStart = minDistributions >= playerCount
	const enoughForRebuys = minDistributions >= playerCount + maxRebuysTotal
	const enoughForAddOns = minDistributions >= playerCount + maxRebuysTotal + maxAddOnsTotal

	let bottleneck: string | undefined
	if (!enoughForStart && bottleneckDenom !== undefined) {
		bottleneck = `Не хватает фишек номиналом ${bottleneckDenom}`
	}
	else if (!enoughForRebuys && bottleneckDenom !== undefined) {
		bottleneck = `Фишки ${bottleneckDenom} — узкое место для ребаев`
	}
	else if (!enoughForAddOns && bottleneckDenom !== undefined) {
		bottleneck = `Фишки ${bottleneckDenom} — узкое место для аддонов`
	}

	return {
		totalDistributions: minDistributions,
		enoughForStart,
		enoughForRebuys,
		enoughForAddOns,
		bottleneck,
	}
}

export const useChipDistribution = () => ({
	calculateChipDistribution,
	calculateChipAvailability,
})
