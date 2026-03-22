import { createAvatar } from '@dicebear/core'
import * as style from '@dicebear/bottts-neutral'

const AVATAR_COUNT = 30
const DEFAULT_SEED = 'poker-avatar-0'

const AVATAR_SEEDS = Array.from({ length: AVATAR_COUNT }, (_, i) => `poker-avatar-${i}`)

const svgCache = new Map<string, string>()

export const usePokerAvatars = () => {
	const getAvatarSvg = (seed: string): string => {
		const cached = svgCache.get(seed)
		if (cached) return cached

		const avatar = createAvatar(style, {
			seed,
			size: 64,
			radius: 50,
		})
		const svg = avatar.toString()
		svgCache.set(seed, svg)
		return svg
	}

	const getAvatarDataUri = (seed: string): string => {
		const svg = getAvatarSvg(seed)
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
	}
}
