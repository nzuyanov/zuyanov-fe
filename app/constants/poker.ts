export const CHIP_COLORS = {
	GREEN: '#10B981',
	PINK: '#EC4899',
	ORANGE: '#F97316',
	VIOLET: '8B5CF6',
	CYAN: '#06B6D4',
	SILVER: '#6B7280',
	RED: '#EF4444',
	GOLD: '#F59E0B',
	BLUE: '#3B82F6',
} as const

export type ChipColor = (typeof CHIP_COLORS)[keyof typeof CHIP_COLORS]