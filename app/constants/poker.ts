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

export type ChipColor = (typeof CHIP_COLORS)[keyof typeof CHIP_COLORS]