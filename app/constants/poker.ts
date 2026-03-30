import type { GameSpeed, PokerConfig } from '~/types/poker'

export const CHIP_COLORS = {
	RED: '#EF4444',
	ORANGE: '#F97316',
	GOLD: '#F59E0B',
	GREEN: '#10B981',
	CYAN: '#06B6D4',
	SILVER: '#6B7280',
	VIOLET: '#8B5CF6',
	PINK: '#EC4899',
	BLUE: '#3B82F6',
} as const

export const NEW_CHIP_COLOR_DEFAULT = CHIP_COLORS.SILVER

export const NEW_CHIP_COUNT_DEFAULT = 50

/**
 * Параметры скорости:
 * - levelMinutes — продолжительность одного уровня блайндов
 * - startingBBRatio — стартовый стек / стартовый BB (глубина на старте в BB)
 */
export const SPEED_PARAMS: Record<GameSpeed, { levelMinutes: number; startingBBRatio: number }> = {
	slow:   { levelMinutes: 20, startingBBRatio: 100 },
	normal: { levelMinutes: 15, startingBBRatio: 50 },
	fast:   { levelMinutes: 10, startingBBRatio: 25 },
}

export const POKER_CONFIG_DEFAULT: PokerConfig = {
	name: `Турнир ${new Date().toLocaleDateString('ru-RU')}`,
	buyIn: 1000,
	maxRebuys: 2,
	rebuyPeriodMinutes: 60,
	gameDurationMinutes: 180,
	gameSpeed: 'normal',
	prizes: [50, 30, 20],
	playerCount: 6,
	// по реальному примеру на 300 фишек https://ozon.ru/t/Jmkr6YT
	chipCase: [
		{ denomination: 5, color: CHIP_COLORS.RED, totalCount: 75 },
		{ denomination: 25, color: CHIP_COLORS.GREEN, totalCount: 75 },
		{ denomination: 50, color: CHIP_COLORS.BLUE, totalCount: 50 },
		{ denomination: 100, color: CHIP_COLORS.SILVER, totalCount: 75 },
		{ denomination: 500, color: CHIP_COLORS.VIOLET, totalCount: 25 },
	],
}

export const PLAYERS_MAX = 9
export const PLAYERS_MIN = 3

export const GAME_DURATION_MIN = 60
export const GAME_DURATION_MAX = 24 * 60

export const FUN_NAMES = [
	'Дама ДикПик', 'Блефмастер', 'Покерфейс', 'Ва-банк Ёбанк', 'Туз в жопе',
	'Шулер-хуюлер', 'BigDick Stack', 'Картёжник', 'All-in Алкаш', 'Фишкожор',
	'Хуяльный Флеш', 'Royal Хуяль', 'Чипоед', 'Ебать-колл', 'Кинг-Хуинг',
	'Full Хаус', 'Дилер Хуилер', 'PokerМамка', 'Тузик-Пузик', 'River Крыса',
	'Казиноёб', 'Флопзилла', 'Мистер Фолд', 'Бет-мен', 'Ривер Кинг',
	'Чек-Хуек', 'Донк Ёбт', 'Nuts Мэн', 'Колл-машина', 'Тильт Тоха',
	'Слоу Ролл Бл*', 'Фишка Судьбы', 'Крупье Хуюпье', 'Мёртвый Хенд', 'Стрит Боец',
	'Барон Блайнд', 'Pocket Ракета', 'Мадам Ребай', 'Флеш Гордон', 'Дядя Фолд',
	'Ас Хуяс', 'Пиковый Хер', 'Chip Licker', 'Раздатчик Зла', 'The Гриндер',
	'Катала-Ебала', 'Bubble Бой', 'Рыба-пила', 'Хитрожопый Лис', 'Шортстек Саня',
	'Монстр-хуёт', 'Трефовый Хрен', 'Lady Дрюк', 'Блайнд Спот', 'Турнирный Волк',
	'Fish & Tits', 'Бубновый Хуб', 'Нитовый Нил', 'Sharkboy', 'Оверпара Оля',
	'Paul Fector', 'Сл@вянин', 'Индус', 'Mister BIG', 'ПалСаныч'
]

export const MIN_BB_DEPTH = 20
export const MAX_BB_DEPTH = 200