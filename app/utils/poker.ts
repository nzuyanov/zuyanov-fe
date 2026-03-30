import { SPEED_PARAMS } from '~/constants/poker'
import type {
	ChipCaseEntry,
	ChipDistribution,
	ChipDistributionEntry,
	ChipAvailability,
	GameSpeed,
	PokerConfig,
	TournamentSetup,
	BlindLevel,
} from '~/types/poker'

/**
 * Округляет значение ВВЕРХ до ближайшего кратного заданному шагу.
 * Гарантирует целочисленный результат не меньше step.
 */
export const roundUpToChip = (value: number, step: number): number => {
	if (step <= 0) return Math.max(1, Math.ceil(value))
	if (value <= 0) return step
	return Math.ceil(value / step) * step
}

/**
 * Определяет шаг округления блайнда в зависимости от его величины.
 *
 * Порог = номинал × 10. Пока блайнд ниже порога следующего номинала,
 * округляем до текущего. Мелкая фишка перестаёт влиять на блайнд,
 * когда составляет ~10% от ставки — логичный порог.
 *
 * Пример (номиналы [5, 25, 100, 500]):
 *   value < 250  (25×10) → шаг 5
 *   value < 1000 (100×10) → шаг 25
 *   value < 5000 (500×10) → шаг 100
 *   value >= 5000          → шаг 500
 */
export const getBlindRoundingStep = (value: number, denominations: number[]): number => {
	if (denominations.length === 0) return 1
	const sorted = [...denominations].sort((a, b) => a - b)

	// Идём от мелких к крупным: пока value >= порог следующего номинала,
	// поднимаем шаг округления
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

/** Возвращает минимальный номинал из чемодана */
export const getMinDenomination = (chipCase: ChipCaseEntry[]): number => {
	if (chipCase.length === 0) return 1
	return Math.min(...chipCase.map(c => c.denomination))
}

/** Возвращает отсортированный массив номиналов из чемодана */
export const getDenominations = (chipCase: ChipCaseEntry[]): number[] =>
	chipCase.map(c => c.denomination).sort((a, b) => a - b)

/**
 * Проверяет, является ли курс buyIn/stack «красивым» — кратным 0.25.
 */
export const isNiceRate = (buyIn: number, stack: number): boolean => {
	if (stack <= 0 || buyIn <= 0) return false
	const rate = buyIn / stack
	return Math.abs(rate - Math.round(rate * 4) / 4) < 1e-9
}

/**
 * Ищет ближайший стек ВНИЗ от rawStack, при котором buyIn/stack кратен 0.25.
 * Возвращает null, если подходящего значения нет (стек ушёл бы ниже 50% от исходного).
 */
export const findNiceRateStack = (buyIn: number, rawStack: number): number | null => {
	const minStack = Math.floor(rawStack * 0.5)
	for (let stack = rawStack; stack >= minStack; stack--) {
		if (stack <= 0) break
		if (isNiceRate(buyIn, stack)) return stack
	}
	return null
}

/**
 * Рассчитывает стартовую раздачу фишек из чемодана.
 *
 * Набирает targetStack жадно от крупных к мелким.
 * Каждый номинал ограничен: floor(totalCount / playerCount),
 * чтобы всем игрокам хватило поровну.
 *
 * Если targetStack не задан — берёт максимум доступного.
 */
export const calculateChipDistribution = (
	chipCase: ChipCaseEntry[],
	playerCount: number,
	targetStack?: number,
): ChipDistribution => {
	if (playerCount <= 0 || chipCase.length === 0) {
		return { distribution: [], startingStack: 0, totalChipCount: 0 }
	}

	chipCase.sort((a, b) => a.denomination - b.denomination)

	// Максимум фишек каждого номинала на одного игрока
	const perPlayer = chipCase
		.map(entry => ({
			denomination: entry.denomination,
			color: entry.color,
			maxCount: Math.floor(entry.totalCount / playerCount),
		}))
		.filter(e => e.maxCount > 0)
		.sort((a, b) => a.denomination - b.denomination)

	if (targetStack === undefined) {
		// Без целевого стека — раздаём максимум доступного
		const distribution: ChipDistributionEntry[] = perPlayer.map(e => ({
			denomination: e.denomination,
			count: e.maxCount,
			totalValue: e.denomination * e.maxCount,
			color: e.color,
		}))
		const startingStack = distribution.reduce((s, d) => s + d.totalValue, 0)
		const totalChipCount = distribution.reduce((s, d) => s + d.count, 0)
		return { distribution, startingStack, totalChipCount }
	}

	// Жадно от крупных к мелким
	const result = perPlayer.map(e => ({
		denomination: e.denomination,
		count: 0,
		totalValue: 0,
		color: e.color,
		maxCount: e.maxCount,
	}))

	let remaining = targetStack
	for (let i = result.length - 1; i >= 0; i--) {
		const entry = result[i]!
		const take = Math.min(entry.maxCount, Math.floor(remaining / entry.denomination))
		entry.count = take
		entry.totalValue = entry.denomination * take
		remaining -= entry.totalValue
	}

	// Размениваем крупные на мелкие: пока можем разбить 1 крупную
	// на эквивалент в мелких фишках — делаем. Это максимизирует
	// количество мелких номиналов для удобства ставок на ранних уровнях.
	let improved = true
	let passes = 0
	while (improved && passes < 100) {
		passes++
		improved = false
		for (let i = result.length - 1; i > 0; i--) {
			if (result[i]!.count < 2) continue

			const largeValue = result[i]!.denomination
			let leftover = largeValue
			const adds: [number, number][] = []

			for (let j = i - 1; j >= 0; j--) {
				const small = result[j]!
				const available = small.maxCount - small.count
				if (available <= 0) continue
				const add = Math.min(available, Math.floor(leftover / small.denomination))
				if (add > 0) {
					adds.push([j, add])
					leftover -= add * small.denomination
				}
			}

			if (leftover === 0 && adds.length > 0) {
				result[i]!.count--
				result[i]!.totalValue = result[i]!.denomination * result[i]!.count
				for (const [j, add] of adds) {
					result[j]!.count += add
					result[j]!.totalValue = result[j]!.denomination * result[j]!.count
				}
				improved = true
				break
			}
		}
	}

	const distribution = result
		.filter(e => e.count > 0)
		.map(({ denomination, count, totalValue, color }) => ({ denomination, count, totalValue, color }))

	const startingStack = distribution.reduce((s, d) => s + d.totalValue, 0)
	const totalChipCount = distribution.reduce((s, d) => s + d.count, 0)

	return { distribution, startingStack, totalChipCount }
}

/**
 * Анализирует достаточность фишек:
 * - хватает ли на старт всем игрокам
 * - хватает ли на все возможные ребаи
 * - хватает ли на аддон каждому
 * - какой номинал является узким местом
 */
export const calculateChipAvailability = (
	chipCase: ChipCaseEntry[],
	distribution: ChipDistributionEntry[],
	playerCount: number,
	maxRebuys: number,
): ChipAvailability => {
	const startDistributions = playerCount
	const rebuyDistributions = playerCount * maxRebuys
	const addOnDistributions = playerCount

	// Ищем узкое место: номинал с минимальным соотношением запаса к расходу
	let bottleneckDenom: number | undefined
	let minRatio = Infinity

	for (const dist of distribution) {
		if (dist.count === 0) continue
		const stock = chipCase.find(c => c.denomination === dist.denomination)
		if (!stock) continue
		const ratio = stock.totalCount / dist.count
		if (ratio < minRatio) {
			minRatio = ratio
			bottleneckDenom = dist.denomination
		}
	}

	const totalAvailable = minRatio === Infinity ? 0 : Math.floor(minRatio)

	return {
		totalDistributions: totalAvailable,
		enoughForStart:   totalAvailable >= startDistributions,
		enoughForRebuys:  totalAvailable >= startDistributions + rebuyDistributions,
		enoughForAddOns:  totalAvailable >= startDistributions + rebuyDistributions + addOnDistributions,
		bottleneck: bottleneckDenom !== undefined ? String(bottleneckDenom) : undefined,
	}
}

/**
 * Генерирует таблицу уровней блайндов по геометрической прогрессии.
 *
 * Алгоритм:
 * 1. Стартовый SB = startingStack / startingBBRatio / 2, округлить вверх до minDenom
 * 2. BB = SB × 2 — гарантирует целые числа и BB = 2×SB на каждом уровне
 * 3. Целевой финальный BB = 5% от базовых фишек (startingStack × playerCount):
 *    на этом уровне у двух финалистов остаётся ~10 BB каждому
 * 4. Прогрессия: BB[i] = startBB × growthRate^i (через SB для округления)
 * 5. Ступенчатое округление: когда блайнд >= номинал × 20,
 *    шаг округления повышается до этого номинала (убирает «некрасивые» значения)
 * 6. Соседние уровни с одинаковым BB удаляются
 * 7. Добавляется 2 запасных уровня сверх запланированных
 */
export const generateBlindLevels = (
	startingStack: number,
	playerCount: number,
	gameDurationMinutes: number,
	speed: GameSpeed,
	denominations: number[],
	maxRebuys: number,
): BlindLevel[] => {
	const { levelMinutes, startingBBRatio } = SPEED_PARAMS[speed]
	const minDenom = denominations.length > 0
		? Math.min(...denominations)
		: 1

	// Количество уровней в рамках запланированного времени
	const totalLevels = Math.max(1, Math.ceil(gameDurationMinutes / levelMinutes))
	// Генерируем с запасом: дедупликация (округление даёт одинаковый BB)
	// может «съесть» значительную часть кандидатов
	const maxIterations = totalLevels * 3

	// Стартовый SB → BB (стартовый уровень всегда округляется до minDenom)
	const rawStartSB = startingStack / (startingBBRatio * 2)
	const startSB = roundUpToChip(rawStartSB, minDenom)
	const startBB = startSB * 2

	// Целевой финальный BB: ~5% от суммарных базовых фишек
	const totalBaseChips = startingStack * playerCount
	const rawFinalSB = (totalBaseChips * 0.05) / 2
	const finalSB = roundUpToChip(rawFinalSB, minDenom)
	// Финальный BB должен быть строго больше стартового для осмысленного роста
	const finalBB = Math.max(finalSB * 2, startBB * 4)

	// Коэффициент роста: геометрическая прогрессия от startBB до finalBB
	const growthRate = totalLevels > 1
		? Math.pow(finalBB / startBB, 1 / (totalLevels - 1))
		: 1.5

	const sortedDenoms = [...denominations].sort((a, b) => a - b)
	const levels: BlindLevel[] = []
	let prevBB = 0
	// Наименьший номинал, кратный 10 — используется как minStep после SB ≥ 100,
	// чтобы убрать значения, оканчивающиеся на 5 (например 105, 115)
	const safeStep = sortedDenoms.find(d => d % 10 === 0) ?? sortedDenoms[0]!

	for (let i = 0; i < maxIterations; i++) {
		// Вычисляем SB через прогрессию, округляем со ступенчатым шагом
		const rawSB = startSB * Math.pow(growthRate, i)
		const rawBB = rawSB * 2

		// Когда SB достигает 100+, повышаем минимальный шаг округления,
		// чтобы убрать «некрасивые» значения (105, 95 и т.д.)
		const minStep = rawSB >= 100 ? safeStep : 0

		const step = Math.max(getBlindRoundingStep(rawBB, denominations), minStep)
		let sb = roundUpToChip(rawSB, step)

		// Притягивание к крупным номиналам (≥ safeStep × 2):
		// если SB уже ≥ 80% номинала и до него ≤ safeStep, подтянуть вверх.
		// Это превращает, например, SB=85 → 100 (safeStep=50, 100-85=15 ≤ 50, 85 ≥ 80)
		for (const denom of sortedDenoms) {
			if (denom >= safeStep * 2 && denom > sb && denom - sb <= safeStep && sb >= denom * 0.8) {
				sb = denom
				break
			}
		}

		const bb = sb * 2

		// Пропускаем дублирующийся уровень (округление дало тот же BB)
		if (bb === prevBB) continue
		prevBB = bb

		levels.push({
			level: levels.length + 1,
			smallBlind: sb,
			bigBlind: bb,
			durationMinutes: levelMinutes,
			// Запасные уровни — сверх запланированного времени турнира (+2 на случай затяжки)
			isBuffer: levels.length >= totalLevels,
		})

		// Набрали достаточно уровней (плановые + 2 запасных)
		if (levels.length >= totalLevels + 2) break
	}

	return levels
}

/**
 * Определяет ожидаемый уровень завершения турнира.
 *
 * Критерий: BB достигает ~5% от базовых фишек (startingStack × playerCount).
 * При этом у двух финалистов остаётся примерно по 10 BB — момент
 * когда игра переходит в режим пуш-или-фолд и быстро завершается.
 */
export const findExpectedEndLevel = (
	blindLevels: BlindLevel[],
	startingStack: number,
	playerCount: number,
): number => {
	if (blindLevels.length === 0) return 0

	const totalBaseChips = startingStack * playerCount
	const threshold = totalBaseChips * 0.05

	const found = blindLevels.find(l => l.bigBlind >= threshold)
	return found ? found.level : (blindLevels[blindLevels.length - 1]?.level ?? 0)
}

// ─────────────────────────────────────────────
// Главная функция
// ─────────────────────────────────────────────

/**
 * Рассчитывает полную конфигурацию покерного турнира.
 *
 * Упрощения для живого оффлайн-турнира:
 * - ребай только при 0 фишках у игрока
 * - ребай и аддон равны начальному стеку (те же фишки)
 * - BB всегда кратен 2×SB, все значения целые
 *
 * @returns TournamentSetup с раздачей фишек, таблицей блайндов и предупреждениями
 */
export const calculateTournament = (params: PokerConfig, niceRate: boolean = false): TournamentSetup => {
	const {
		chipCase,
		playerCount,
		maxRebuys,
		gameDurationMinutes,
		gameSpeed,
		buyIn,
	} = params

	const warnings: string[] = []

	const emptyResult: TournamentSetup = {
		startingStack: 0,
		startingChipCount: 0,
		chipDistributionPerPlayer: [],
		chipAvailability: {
			totalDistributions: 0,
			enoughForStart: false,
			enoughForRebuys: false,
			enoughForAddOns: false,
		},
		blindLevels: [],
		expectedEndLevel: 0,
		startingDepthBB: 0,
		niceRateAvailable: null,
		warnings: [],
	}

	// ── Базовая валидация ────────────────────────────────────────
	if (chipCase.length === 0) {
		return emptyResult
	}

	// ── Раздача фишек (стартовая) ───────────────────────────────
	// Значение стека: делим чемодан на все раздачи (старт + ребаи + аддоны),
	// чтобы зарезервировать фишки на докупки
	const totalDistributions = playerCount * (1 + maxRebuys + 1)
	const rawStackValue = chipCase.reduce((sum, entry) => {
		const perDist = Math.floor(entry.totalCount / totalDistributions)
		return sum + entry.denomination * perDist
	}, 0)

	if (rawStackValue === 0) {
		warnings.push(
			`Фишек недостаточно для раздачи при ${maxRebuys} ребаях на игрока. ` +
			'Уменьши количество ребаев или добавь фишки в чемодан.',
		)
		emptyResult.warnings = warnings
		return emptyResult
	}

	// ── Округление до красивого курса ────────────────────────────
	const rawRateIsNice = isNiceRate(buyIn, rawStackValue)
	let niceRateAvailable: TournamentSetup['niceRateAvailable'] = null

	if (!rawRateIsNice) {
		const niceStack = findNiceRateStack(buyIn, rawStackValue)
		if (niceStack !== null && niceStack < rawStackValue) {
			niceRateAvailable = {
				originalStack: rawStackValue,
				niceStack,
				niceRubPerChip: buyIn / niceStack,
			}
		}
	}

	// Целевой стек: красивый (если включён) или исходный
	const targetStack = (niceRate && niceRateAvailable)
		? niceRateAvailable.niceStack
		: rawStackValue

	// Состав фишек: набираем targetStack с лимитами case/playerCount
	// (больше мелких номиналов доступно, чем при делении на totalDistributions)
	const { distribution, startingStack, totalChipCount } = calculateChipDistribution(
		chipCase, playerCount, targetStack,
	)

	// ── Анализ доступности фишек ─────────────────────────────────
	const chipAvailability = calculateChipAvailability(chipCase, distribution, playerCount, maxRebuys)
	const bottleneckNote = chipAvailability.bottleneck
		? ` Узкое место: номинал ${chipAvailability.bottleneck}`
		: ''

	if (!chipAvailability.enoughForStart) {
		warnings.push('Фишек не хватает даже на стартовую раздачу всем игрокам')
	} else if (!chipAvailability.enoughForRebuys) {
		warnings.push(
			'При выдаче ребая может потребоваться разменять фишки.' + bottleneckNote
		)
	} else if (!chipAvailability.enoughForAddOns) {
		warnings.push(
			'При выдаче аддона может потребоваться разменять фишки.' + bottleneckNote
		)
	}

	// ── Структура блайндов ───────────────────────────────────────
	const denominations = getDenominations(chipCase)
	const minDenom = denominations.length > 0 ? denominations[0]! : 1

	const blindLevels = generateBlindLevels(
		startingStack,
		playerCount,
		gameDurationMinutes,
		gameSpeed,
		denominations,
		maxRebuys,
	)

	const expectedEndLevel = findExpectedEndLevel(blindLevels, startingStack, playerCount)

	// ── Глубина игры на старте ───────────────────────────────────
	const startBB = blindLevels[0]?.bigBlind ?? minDenom * 2
	const startingDepthBB = startBB > 0 ? Math.round(startingStack / startBB) : 0


	return {
		startingStack,
		startingChipCount: totalChipCount,
		chipDistributionPerPlayer: distribution,
		chipAvailability,
		blindLevels,
		expectedEndLevel,
		startingDepthBB,
		niceRateAvailable,
		warnings,
	}
}
