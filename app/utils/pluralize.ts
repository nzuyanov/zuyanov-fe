/**
 * Склонение слова «фишка» по числу
 * 1 фишка, 2 фишки, 5 фишек
 */
export const pluralizeChip = (n: number): string => {
	const abs = Math.abs(n)
	const int = Math.floor(abs)
	const mod10 = int % 10
	const mod100 = int % 100
	if (mod10 === 1 && mod100 !== 11) return 'фишка'
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'фишки'
	return 'фишек'
}
