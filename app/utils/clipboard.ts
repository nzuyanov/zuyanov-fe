export const copyToClipboard = async (value: string, textSuccess = 'Скопировано в буфер обмена'): Promise<void> => {
	const { show } = useNotification()

	try {
		await navigator.clipboard.writeText(value)
		show(textSuccess, 'success', 3000)
	}
	catch {
		show('Не удалось скопировать в буфер обмена', 'error', 3000)
	}
}
