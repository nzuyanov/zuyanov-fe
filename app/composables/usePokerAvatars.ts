import { createAvatar } from '@dicebear/core'
import * as style from '@dicebear/avataaars'
import type { AvatarBackground, PlayerGender } from '~/types/poker'

const AVATAR_COUNT = 30
const DEFAULT_SEED = 'poker-avatar-0'

const AVATAR_SEEDS = Array.from({ length: AVATAR_COUNT }, (_, i) => `poker-avatar-${i}`)

// Мужские причёски и головные уборы
const MALE_TOPS = [
	'dreads01',
	'dreads02',
	'frizzle',
	'shaggy',
	'shaggyMullet',
	'shortCurly',
	'shortFlat',
	'shortRound',
	'shortWaved',
	'sides',
	'theCaesar',
	'theCaesarAndSidePart',
	'hat',
	'turban',
	'winterHat1',
	'winterHat02',
	'winterHat03',
	'winterHat04',
]

// Женские причёски и головные уборы
const FEMALE_TOPS = [
	'bob',
	'bun',
	'curly',
	'curvy',
	'dreads',
	'frida',
	'fro',
	'froBand',
	'longButNotTooLong',
	'miaWallace',
	'shavedSides',
	'straight02',
	'straight01',
	'straightAndStrand',
	'bigHair',
	'hijab',
]

// Растительность на лице только у мужчин
const MALE_FACIAL_HAIR = [
	'beardLight',
	'beardMajestic',
	'beardMedium',
	'moustacheFancy',
	'moustacheMagnum',
]

// Палитра насыщенных цветов для градиентного фона аватарки
// Без решётки — формат DiceBear backgroundColor
const BG_PALETTE = [
	'ff6b6b', // коралловый
	'feca57', // жёлтый
	'48dbfb', // небесный
	'1dd1a1', // изумрудный
	'5f27cd', // фиолетовый
	'ff9ff3', // розовый
	'54a0ff', // васильковый
	'00d2d3', // бирюзовый
	'c56cf0', // лиловый
	'f368e0', // фуксия
	'ff9500', // оранжевый
	'05c46b', // травяной
	'3742fa', // индиго
	'ff6348', // томатный
	'7bed9f', // мятный
	'70a1ff', // лавандовый
	'eccc68', // золотистый
	'a55eea', // сиреневый
]

const svgCache = new Map<string, string>()

/** Генерирует случайный градиентный фон для аватарки */
export const generateRandomBackground = (): AvatarBackground => {
	const i1 = Math.floor(Math.random() * BG_PALETTE.length)
	let i2 = Math.floor(Math.random() * BG_PALETTE.length)
	// Гарантируем, что второй цвет отличается от первого
	if (i2 === i1) i2 = (i2 + 1) % BG_PALETTE.length


	return {
		color1: BG_PALETTE[i1]!,
		color2: BG_PALETTE[i2]!,
		rotation: Math.floor(Math.random() * 360),
	}
}

export const usePokerAvatars = () => {
	const getAvatarSvg = (
		seed: string,
		gender: PlayerGender = 'male',
		background: AvatarBackground,
	): string => {
		const bg = background
		const cacheKey = `${gender}:${seed}:${bg.color1}:${bg.color2}:${bg.rotation}`
		const cached = svgCache.get(cacheKey)
		if (cached) return cached

		const isMale = gender === 'male'
		const avatar = createAvatar(style, {
			seed,
			size: 64,
			radius: 50,
			// @ts-expect-error — schema типы dicebear не экспортируют сужающий union для top
			top: isMale ? MALE_TOPS : FEMALE_TOPS,
			// @ts-expect-error — то же
			facialHair: isMale ? MALE_FACIAL_HAIR : [],
			facialHairProbability: isMale ? 40 : 0,
			backgroundColor: [bg.color1, bg.color2],
			backgroundType: ['gradientLinear'],
			backgroundRotation: [bg.rotation, bg.rotation],
		})
		const svg = avatar.toString().replaceAll('backgroundLinear', `backgroundLinear-${seed}`)
		svgCache.set(cacheKey, svg)
		return svg
	}

	const getAvatarDataUri = (
		seed: string,
		gender: PlayerGender = 'male',
		background: AvatarBackground,
	): string => {
		const svg = getAvatarSvg(seed, gender, background)
		return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
	}

	const getRandomSeed = (exclude: string[] = []): string => {
		const available = AVATAR_SEEDS.filter(s => !exclude.includes(s))
		const pool = available.length > 0 ? available : AVATAR_SEEDS
		return pool[Math.floor(Math.random() * pool.length)] ?? DEFAULT_SEED
	}

	const getNextSeed = (currentSeed: string): string => {
		const currentIndex = AVATAR_SEEDS.indexOf(currentSeed)
		const nextIndex = (currentIndex + 1) % AVATAR_SEEDS.length
		return AVATAR_SEEDS[nextIndex] ?? DEFAULT_SEED
	}

	return {
		AVATAR_SEEDS,
		getAvatarSvg,
		getAvatarDataUri,
		getRandomSeed,
		getNextSeed,
		generateRandomBackground,
	}
}

