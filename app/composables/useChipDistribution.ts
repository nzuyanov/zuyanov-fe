import type { ChipCaseEntry, ChipDistribution, ChipAvailability } from '~/types/poker'
import type { ChipColor } from '~/constants/poker'

/**
 * Рассчитать раздачу фишек на одного игрока из чемодана.
 * Жадный алгоритм: набираем стек, приоритет мелким номиналам.
 */
export const calculateChipDistribution = (
	chipCase: ChipCaseEntry[],
	playerCount: number,
	startingStack: number,
	maxRebuys: number,
	addOnEnabled: boolean,
): ChipDistribution => {
	if (chipCase.length === 0 || playerCount <= 0 || startingStack <= 0) {
		return { perPlayer: [], totalValue: 0, totalChips: 0, isValid: false, deficit: startingStack }
	}

	const sorted = [...chipCase].sort((a, b) => a.denomination - b.denomination)

	// Шаг 1: Оценка количества раздач (старт + ребаи + аддоны)
	const estimatedRebuys = Math.ceil(playerCount * maxRebuys * 0.6)
	const estimatedAddOns = addOnEnabled ? playerCount : 0
	const totalDistributions = playerCount + estimatedRebuys + estimatedAddOns

	// Шаг 2: Доступное количество фишек каждого номинала на одну раздачу
	const availablePerDistribution = sorted.map(chip => ({
		denomination: chip.denomination,
		totalCount: chip.totalCount,
		maxPerPlayer: Math.floor(chip.totalCount / Math.max(totalDistributions, 1)),
		color: chip.color as ChipColor,
	}))

	// Шаг 3: Жадный алгоритм — набираем стек от крупных к мелким
	let remaining = startingStack
	const distribution: { denomination: number; count: number; color: ChipColor }[] = []

	for (let i = sorted.length - 1; i >= 0; i--) {
		const chip = availablePerDistribution[i]!
		if (chip.denomination > remaining && i > 0) continue

		if (i === 0) {
			// Самый мелкий номинал — забирает весь остаток
			const count = Math.ceil(remaining / chip.denomination)
			if (count > 0) {
				distribution.unshift({
					color: chip.color,
					denomination: chip.denomination,
					count }
				)
				remaining -= count * chip.denomination
			}
		}
		else {
			// Крупные фишки — берём умеренно (25% от доступного, минимум 1)
			const maxByValue = Math.floor(remaining / chip.denomination)
			if (maxByValue <= 0) continue

			const moderate = Math.max(1, Math.min(
				Math.ceil(chip.maxPerPlayer * 0.25),
				maxByValue,
			))
			distribution.unshift({
				denomination: chip.denomination,
				count: moderate,
				color: chip.color,
			})
			remaining -= moderate * chip.denomination
		}
	}

	// Сортируем по номиналу (от мелких к крупным)
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
