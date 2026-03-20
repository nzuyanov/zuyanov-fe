export type NotificationType = 'success' | 'error' | 'warning'

export interface Notification {
	id: number
	message: string
	type: NotificationType
	duration: number
}

const notifications = ref<Notification[]>([])
let nextId = 0

export const useNotification = () => {
	const show = (message: string, type: NotificationType = 'success', duration: number = 3000) => {
		const id = nextId++
		notifications.value.push({ id, message, type, duration })

		if (duration > 0) {
			setTimeout(() => dismiss(id), duration)
		}
	}

	const dismiss = (id: number) => {
		notifications.value = notifications.value.filter(n => n.id !== id)
	}

	return { notifications: readonly(notifications), show, dismiss }
}
