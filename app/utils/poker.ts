// ============================================================
// Утилиты для расчёта покерного турнира
// Входные данные: чемодан фишек, количество игроков, настройки
// Выходные данные: стартовый стек, раздача фишек, структура блайндов
// ============================================================

// ─────────────────────────────────────────────
// Типы
// ─────────────────────────────────────────────

export type GameSpeed = 'slow' | 'standard' | 'fast'

/** Одна запись в чемодане: номинал + количество физических фишек */
export interface ChipCaseEntry {
	denomination: number
	totalCount: number
}

/** Одна строка раздачи: сколько фишек данного номинала даётся игроку */
export interface ChipDistributionEntry {
	denomination: number
	count: number
	totalValue: number
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

/** Входные параметры турнира */
export interface TournamentParams {
	/** Содержимое чемодана с фишками */
	chipCase: ChipCaseEntry[]
	/** Количество игроков */
	playerCount: number
	/** Максимальное количество ребаев на одного игрока */
	maxRebuys: number
	/** Общая длительность турнира, минуты */
	gameDurationMinutes: number
	/** Скорость игры — определяет длину уровней и стартовую глубину */
	gameSpeed: GameSpeed
	/** Время, в течение которого доступны ребаи (от старта), минуты */
	rebuyPeriodMinutes: number
}

/** Результат расчёта турнира */
export interface TournamentSetup {
	/** Стартовый стек одного игрока (в фишечных единицах) */
	startingStack: number
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

// ─────────────────────────────────────────────
// Константы
// ─────────────────────────────────────────────

/**
 * Параметры скорости:
 * - levelMinutes     — продолжительность одного уровня блайндов
 * - startingBBRatio  — стартовый стек / стартовый BB (глубина на старте в BB)
 */
const SPEED_PARAMS: Record<GameSpeed, { levelMinutes: number; startingBBRatio: number }> = {
	slow:     { levelMinutes: 20, startingBBRatio: 100 },
	standard: { levelMinutes: 15, startingBBRatio: 50 },
	fast:     { levelMinutes: 10, startingBBRatio: 25 },
}

// ─────────────────────────────────────────────
// Вспомогательные функции
// ─────────────────────────────────────────────

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
export const calculateChipDistribution = (
	chipCase: ChipCaseEntry[],
	totalDistributions: number,
): { distribution: ChipDistributionEntry[]; startingStack: number } => {
	if (totalDistributions <= 0) return { distribution: [], startingStack: 0 }

	const distribution: ChipDistributionEntry[] = chipCase
		.map(entry => {
			const count = Math.floor(entry.totalCount / totalDistributions)
			return {
				denomination: entry.denomination,
				count,
				totalValue: entry.denomination * count,
			}
		})
		.filter(entry => entry.count > 0)
		.sort((a, b) => a.denomination - b.denomination)

	const startingStack = distribution.reduce((sum, d) => sum + d.totalValue, 0)

	return { distribution, startingStack }
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
export const calculateTournament = (params: TournamentParams): TournamentSetup => {
	const {
		chipCase,
		playerCount,
		maxRebuys,
		gameDurationMinutes,
		gameSpeed,
	} = params

	const warnings: string[] = []

	// ── Базовая валидация ────────────────────────────────────────
	if (chipCase.length === 0) {
		return {
			startingStack: 0,
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
			warnings: ['Чемодан с фишками не задан'],
		}
	}

	if (playerCount < 2) {
		return {
			startingStack: 0,
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
			warnings: ['Количество игроков должно быть не менее 2'],
		}
	}

	if (gameDurationMinutes < 10) {
		warnings.push('Слишком короткое время игры — рекомендуется не менее 10 минут')
	}

	// ── Раздача фишек ────────────────────────────────────────────
	// Суммарных раздач одного стека: старт + все ребаи + аддон на каждого игрока
	const totalDistributions = playerCount * (1 + maxRebuys + 1)

	const { distribution, startingStack } = calculateChipDistribution(chipCase, totalDistributions)

	if (startingStack === 0) {
		warnings.push(
			`Фишек недостаточно для раздачи при ${maxRebuys} ребаях на игрока. ` +
			'Уменьши количество ребаев или добавь фишки в чемодан.',
		)
		return {
			startingStack: 0,
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
			warnings,
		}
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

	if (startingDepthBB < 20) {
		warnings.push(
			`Стартовая глубина слишком маленькая (${startingDepthBB} BB) — игра будет очень короткой. ` +
			'Попробуй уменьшить количество ребаев или выбрать скорость помедленнее.',
		)
	} else if (startingDepthBB > 200) {
		warnings.push(
			`Стартовая глубина очень большая (${startingDepthBB} BB) — турнир может затянуться дольше запланированного.`,
		)
	}

	return {
		startingStack,
		chipDistributionPerPlayer: distribution,
		chipAvailability,
		blindLevels,
		expectedEndLevel,
		startingDepthBB,
		warnings,
	}
}

// ─────────────────────────────────────────────
// Пример использования
// ─────────────────────────────────────────────

/*
const result = calculateTournament({
	// Чемодан: 200 белых по 25, 150 красных по 50, 100 синих по 100, 40 чёрных по 500
	chipCase: [
		{ denomination: 25,  totalCount: 200 },
		{ denomination: 50,  totalCount: 150 },
		{ denomination: 100, totalCount: 100 },
		{ denomination: 500, totalCount: 40  },
	],
	playerCount:          6,    // 6 игроков
	maxRebuys:            2,    // до 2 ребаев на игрока
	gameDurationMinutes:  120,  // 2 часа
	gameSpeed:            'standard',
	rebuyPeriodMinutes:   40,   // ребаи доступны первые 40 минут
})

// Стартовый стек и раздача фишек каждому игроку:
// totalDistributions = 6 × (1 + 2 + 1) = 24 раздачи
// перДистрибуция: {25: 8, 50: 6, 100: 4, 500: 1}
// startingStack = 200 + 300 + 400 + 500 = 1400

console.log(result.startingStack)
// → 1400

console.log(result.chipDistributionPerPlayer)
// → [
//     { denomination: 25,  count: 8, totalValue: 200 },
//     { denomination: 50,  count: 6, totalValue: 300 },
//     { denomination: 100, count: 4, totalValue: 400 },
//     { denomination: 500, count: 1, totalValue: 500 },
//   ]

// Анализ фишек:
console.log(result.chipAvailability)
// → { totalDistributions: 24, enoughForStart: true, enoughForRebuys: true, enoughForAddOns: true }

// Стартовая глубина (standard → startingBBRatio = 50):
// startBB = roundUp(1400 / 50 / 2 = 14, 25) * 2 = 25 * 2 = 50
// startingDepthBB = 1400 / 50 = 28 BB
console.log(result.startingDepthBB)
// → 28

// Таблица блайндов (15 мин/уровень, 8 уровней + 2 запасных):
// Финальный BB = 1400 * 6 * 0.05 = 420 → SB = roundUp(210, 25) = 225 → BB = 450
console.log(result.blindLevels)
// → [
//     { level: 1, smallBlind:  25, bigBlind:   50, durationMinutes: 15, isBuffer: false },
//     { level: 2, smallBlind:  50, bigBlind:  100, durationMinutes: 15, isBuffer: false },
//     { level: 3, smallBlind:  75, bigBlind:  150, durationMinutes: 15, isBuffer: false },
//     { level: 4, smallBlind: 100, bigBlind:  200, durationMinutes: 15, isBuffer: false },
//     { level: 5, smallBlind: 125, bigBlind:  250, durationMinutes: 15, isBuffer: false },
//     { level: 6, smallBlind: 175, bigBlind:  350, durationMinutes: 15, isBuffer: false },
//     { level: 7, smallBlind: 225, bigBlind:  450, durationMinutes: 15, isBuffer: false },
//     { level: 8, smallBlind: 325, bigBlind:  650, durationMinutes: 15, isBuffer: true  },
//     { level: 9, smallBlind: 425, bigBlind:  850, durationMinutes: 15, isBuffer: true  },
//   ]

// Ожидаемый уровень завершения:
// threshold = 1400 * 6 * 0.05 = 420 → первый уровень с BB >= 420 → уровень 7 (BB = 450)
console.log(result.expectedEndLevel)
// → 7
*/
