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
 * Округляет значение ВВЕРХ до ближайшего кратного минимальному номиналу.
 * Гарантирует целочисленный результат не меньше minDenom.
 */
export const roundUpToChip = (value: number, minDenom: number): number => {
	if (minDenom <= 0) return Math.max(1, Math.ceil(value))
	if (value <= 0) return minDenom
	return Math.ceil(value / minDenom) * minDenom
}

/** Возвращает минимальный номинал из чемодана */
export const getMinDenomination = (chipCase: ChipCaseEntry[]): number => {
	if (chipCase.length === 0) return 1
	return Math.min(...chipCase.map(c => c.denomination))
}

/**
 * Рассчитывает набор фишек, выдаваемый за одну раздачу (старт / ребай / аддон).
 *
 * Принцип: каждый номинал делится поровну на totalDistributions (floor),
 * чтобы чемодан гарантированно хватил на все раздачи.
 * Стартовый стек = сумма (номинал × количество на раздачу).
 */
export const calculateChipDistribution = (chipCase: ChipCaseEntry[], totalDistributions: number,): ChipDistribution => {
	if (totalDistributions <= 0) return {
		distribution: [],
		startingStack: 0,
		totalChipCount: 0,
	}

	const distribution: ChipDistributionEntry[] = chipCase
		.map(entry => {
			const count = Math.floor(entry.totalCount / totalDistributions)
			return {
				denomination: entry.denomination,
				count,
				totalValue: entry.denomination * count,
				color: entry.color,
			}
		})
		.filter(entry => entry.count > 0)
		.sort((a, b) => a.denomination - b.denomination)

	const startingStack = distribution.reduce((sum, d) => sum + d.totalValue, 0)
	const totalChipCount = distribution.reduce((sum, d) => sum + d.count, 0)

	return {
		distribution,
		startingStack,
		totalChipCount,
	}
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
 * 5. Соседние уровни с одинаковым BB удаляются
 * 6. Добавляется 2 запасных уровня сверх запланированных
 */
export const generateBlindLevels = (
	startingStack: number,
	playerCount: number,
	gameDurationMinutes: number,
	speed: GameSpeed,
	minDenom: number,
	maxRebuys: number,
): BlindLevel[] => {
	const { levelMinutes, startingBBRatio } = SPEED_PARAMS[speed]

	// Количество уровней в рамках запланированного времени
	const totalLevels = Math.max(1, Math.ceil(gameDurationMinutes / levelMinutes))
	const levelsWithBuffer = totalLevels + 2

	// Стартовый SB → BB
	// rawStartSB = startingStack / startingBBRatio / 2
	// startSB округляем вверх до minDenom, BB = startSB × 2
	const rawStartSB = startingStack / (startingBBRatio * 2)
	const startSB = roundUpToChip(rawStartSB, minDenom)
	const startBB = startSB * 2

	// Целевой финальный BB: ~5% от суммарных базовых фишек
	// Смысл: totalBaseChips * 0.05 = totalBaseChips/2/10 → у 2 финалистов ~10 BB каждому
	const totalBaseChips = startingStack * playerCount
	const rawFinalSB = (totalBaseChips * 0.05) / 2
	const finalSB = roundUpToChip(rawFinalSB, minDenom)
	// Финальный BB должен быть строго больше стартового для осмысленного роста
	const finalBB = Math.max(finalSB * 2, startBB * 4)

	// Коэффициент роста: геометрическая прогрессия от startBB до finalBB
	const growthRate = totalLevels > 1
		? Math.pow(finalBB / startBB, 1 / (totalLevels - 1))
		: 1.5

	const levels: BlindLevel[] = []
	let prevBB = 0

	for (let i = 0; i < levelsWithBuffer; i++) {
		// Вычисляем SB через прогрессию, округляем до minDenom, BB = SB × 2
		const rawSB = startSB * Math.pow(growthRate, i)
		const sb = roundUpToChip(rawSB, minDenom)
		const bb = sb * 2

		// Пропускаем дублирующийся уровень (округление дало тот же BB)
		if (bb === prevBB) continue
		prevBB = bb

		levels.push({
			level: levels.length + 1,
			smallBlind: sb,
			bigBlind: bb,
			durationMinutes: levelMinutes,
			isBuffer: i >= totalLevels,
		})
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
export const calculateTournament = (params: PokerConfig): TournamentSetup => {
	const {
		chipCase,
		playerCount,
		maxRebuys,
		gameDurationMinutes,
		gameSpeed,
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
		warnings: [],
	}

	// ── Базовая валидация ────────────────────────────────────────
	if (chipCase.length === 0) {
		return emptyResult
	}

	// ── Раздача фишек ────────────────────────────────────────────
	// Суммарных раздач одного стека: старт + все ребаи + аддон на каждого игрока
	const totalDistributions = playerCount * (1 + maxRebuys + 1)

	const { distribution, startingStack, totalChipCount } = calculateChipDistribution(chipCase, totalDistributions)

	if (startingStack === 0) {
		warnings.push(
			`Фишек недостаточно для раздачи при ${maxRebuys} ребаях на игрока. ` +
			'Уменьши количество ребаев или добавь фишки в чемодан.',
		)
		emptyResult.warnings = warnings
		return emptyResult
	}

	// ── Анализ доступности фишек ─────────────────────────────────
	const chipAvailability = calculateChipAvailability(chipCase, distribution, playerCount, maxRebuys)

	if (!chipAvailability.enoughForStart) {
		warnings.push('Фишек не хватает даже на стартовую раздачу всем игрокам')
	} else if (!chipAvailability.enoughForRebuys) {
		const bottleneckNote = chipAvailability.bottleneck
			? ` Узкое место: номинал ${chipAvailability.bottleneck}.`
			: ''
		warnings.push(
			`Фишек хватает на старт, но может не хватить на все ${maxRebuys} ребая(-ев).` + bottleneckNote,
		)
	} else if (!chipAvailability.enoughForAddOns) {
		warnings.push('Фишек хватает на старт и ребаи, но не хватает на аддон каждому игроку')
	}

	// ── Структура блайндов ───────────────────────────────────────
	const minDenom = getMinDenomination(chipCase)

	const blindLevels = generateBlindLevels(
		startingStack,
		playerCount,
		gameDurationMinutes,
		gameSpeed,
		minDenom,
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
		warnings,
	}
}
