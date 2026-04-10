<template>
	<div class="seating poker-shimmer-overlay">
		<h1 class="title">Рассадка за столом</h1>

		<!-- Стол с местами -->
		<div class="tableArea">
			<div class="pokerTable">
				<div class="tableSurface">
					<div class="tableLine" />
				</div>
			</div>

			<!-- Места игроков — рисуем previewPlayers для ghost-эффекта -->
			<div
				v-for="(player, index) in previewPlayers"
				:key="'seat-' + index"
				class="seat"
				:style="getSeatStyle(index)"
				:class="{
					seatDragOver: dragOverIndex === index && dragIndex !== index,
					seatDragSource: dragIndex !== null && isOriginalPosition(index),
				}"
				@pointerdown="onPointerDown(index, $event)"
				@pointerenter="onPointerEnter(index)"
				@pointerleave="onPointerLeave"
			>
				<div
					class="seatCard"
					:class="{
						seatCardGhost: isGhostCard(index),
						seatCardDragSource: dragIndex !== null && isOriginalPosition(index),
					}"
				>
					<span class="seatNum">{{ index + 1 }}</span>
					<img
						:src="getAvatarDataUri(player.avatarId, player.gender, player.avatarBackground)"
						alt=""
						class="seatAvatar"
					>
					<span class="seatName">{{ player.name }}</span>
				</div>
			</div>
		</div>

		<!-- Кнопки -->
		<div class="actions">
			<button class="btnShuffle" @click="shuffle">
				<Icon name="ph:shuffle-bold" />
				Перемешать
			</button>
			<button class="poker-btn-green btnStart" @click="$emit('confirm', orderedPlayers)">
				🚀 Начать игру
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { PokerPlayer } from '~/types/poker'

const props = defineProps<{
	players: PokerPlayer[]
}>()

defineEmits<{
	confirm: [players: PokerPlayer[]]
}>()

const { getAvatarDataUri } = usePokerAvatars()

const orderedPlayers = ref<PokerPlayer[]>([...props.players])

// --- Позиционирование по эллипсу ---
const seatRadii = computed(() => {
	const count = orderedPlayers.value.length
	if (count <= 3) return { rx: 28, ry: 26 }
	if (count <= 4) return { rx: 32, ry: 28 }
	if (count <= 6) return { rx: 34, ry: 30 }
	if (count <= 8) return { rx: 38, ry: 34 }
	return { rx: 40, ry: 36 }
})

const getSeatStyle = (index: number) => {
	const { rx, ry } = seatRadii.value
	const angle = Math.PI / 2 + (2 * Math.PI * index / orderedPlayers.value.length)
	const x = 50 + rx * Math.cos(angle)
	const y = 50 + ry * Math.sin(angle)
	return {
		left: `${x}%`,
		top: `${y}%`,
	}
}

// --- Shuffle (Фишер-Йейтс) ---
const shuffle = () => {
	const arr = [...orderedPlayers.value]
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		const temp = arr[i]!
		arr[i] = arr[j]!
		arr[j] = temp
	}
	orderedPlayers.value = arr
}

// --- Drag с live-превью перестановки ---
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

// Превью: показывает массив с уже применённым свопом
const previewPlayers = computed(() => {
	if (dragIndex.value === null || dragOverIndex.value === null || dragIndex.value === dragOverIndex.value) {
		return orderedPlayers.value
	}
	const arr = [...orderedPlayers.value]
	const temp = arr[dragIndex.value]!
	arr[dragIndex.value] = arr[dragOverIndex.value]!
	arr[dragOverIndex.value] = temp
	return arr
})

// Определяет, является ли карточка «призрачной» (перемещённой в превью)
const isGhostCard = (index: number): boolean => {
	if (dragIndex.value === null || dragOverIndex.value === null || dragIndex.value === dragOverIndex.value) return false
	return index === dragIndex.value || index === dragOverIndex.value
}

// Определяет, является ли место исходным для перетаскиваемого игрока
const isOriginalPosition = (index: number): boolean => {
	if (dragIndex.value === null) return false
	return index === dragIndex.value
}

const onPointerDown = (index: number, e: PointerEvent) => {
	// Только левая кнопка мыши
	if (e.button !== 0) return
	dragIndex.value = index

	// Создаём плавающий клон, который следует за курсором
	const target = (e.currentTarget as HTMLElement).querySelector('.seatCard') as HTMLElement
	if (!target) return

	const rect = target.getBoundingClientRect()
	const clone = target.cloneNode(true) as HTMLElement
	clone.style.position = 'fixed'
	clone.style.width = `${rect.width}px`
	clone.style.left = `${rect.left}px`
	clone.style.top = `${rect.top}px`
	clone.style.zIndex = '1000'
	clone.style.pointerEvents = 'none'
	clone.style.opacity = '0.85'
	clone.style.transform = 'scale(1.06)'
	clone.style.transition = 'none'
	clone.style.boxShadow = '0 8px 32px rgb(0 0 0 / 50%), 0 0 20px rgb(16 185 129 / 20%)'
	clone.style.borderColor = 'var(--poker-green)'
	clone.style.borderRadius = 'var(--poker-radius)'
	document.body.appendChild(clone)

	const offsetX = e.clientX - rect.left
	const offsetY = e.clientY - rect.top

	const onPointerMove = (ev: PointerEvent) => {
		clone.style.left = `${ev.clientX - offsetX}px`
		clone.style.top = `${ev.clientY - offsetY}px`
	}

	const onPointerUp = () => {
		// Коммитим своп если есть цель
		if (dragIndex.value !== null && dragOverIndex.value !== null && dragIndex.value !== dragOverIndex.value) {
			const arr = [...orderedPlayers.value]
			const temp = arr[dragIndex.value]!
			arr[dragIndex.value] = arr[dragOverIndex.value]!
			arr[dragOverIndex.value] = temp
			orderedPlayers.value = arr
		}
		dragIndex.value = null
		dragOverIndex.value = null
		clone.remove()
		document.removeEventListener('pointermove', onPointerMove)
		document.removeEventListener('pointerup', onPointerUp)
	}

	document.addEventListener('pointermove', onPointerMove)
	document.addEventListener('pointerup', onPointerUp)
}

const onPointerEnter = (index: number) => {
	if (dragIndex.value !== null && dragIndex.value !== index) {
		dragOverIndex.value = index
	}
}

const onPointerLeave = () => {
	if (dragIndex.value !== null) {
		dragOverIndex.value = null
	}
}
</script>

<style scoped>
.seating {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 24px;
	position: relative;
}

.title {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 2.2rem;
	font-weight: 800;
	color: var(--poker-text);
	letter-spacing: 0.04em;
	text-transform: uppercase;
	z-index: 1;
}

/* Стол */
.tableArea {
	position: relative;
	width: 80%;
	height: 68%;
	z-index: 1;
}

.pokerTable {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	width: 56%;
	height: 56%;
	border-radius: 9999px;
	pointer-events: none;
	background: linear-gradient(160deg, #4a3525 0%, #2e1c10 50%, #1c0f06 100%);
	padding: 9px;
	box-shadow:
		0 4px 30px rgb(0 0 0 / 50%),
		0 0 80px rgb(0 0 0 / 30%),
		inset 0 1px 3px rgb(255 255 255 / 12%);
}

.tableSurface {
	width: 100%;
	height: 100%;
	border-radius: 9999px;
	background: radial-gradient(
		ellipse at 40% 38%,
		#1b7e3c 0%,
		#15642e 45%,
		#0f4e23 100%
	);
	box-shadow: inset 0 2px 40px rgb(0 0 0 / 40%);
	position: relative;
}

.tableLine {
	position: absolute;
	inset: 11% 6%;
	border-radius: 9999px;
	border: 2px solid rgb(255 255 255 / 5%);
}

/* Места */
.seat {
	position: absolute;
	transform: translate(-50%, -50%);
	z-index: 1;
	cursor: grab;
	transition: left 0.4s ease, top 0.4s ease;
	user-select: none;
}

.seat:active {
	cursor: grabbing;
}

.seatCard {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	padding: 12px 16px;
	width: 120px;
	background: var(--poker-bg-card);
	border: 2px solid var(--poker-border);
	border-radius: var(--poker-radius);
	transition: border-color 0.25s, transform 0.25s, opacity 0.25s, box-shadow 0.25s;
	position: relative;
}

.seatCard:hover {
	border-color: var(--poker-border-hover);
}

/* Карточки, участвующие в ghost-превью перестановки */
.seatCardGhost {
	border-color: var(--poker-green);
	box-shadow: 0 0 16px rgb(16 185 129 / 25%);
	transform: scale(1.04);
}

/* Карточка-источник — полупрозрачная пока таскаем (оригинал на месте) */
.seatCardDragSource {
	opacity: 0.35;
	transform: scale(0.96);
	border-color: var(--poker-border);
}

/* Место-источник перетаскивания (пока мышка зажата, но не над другим) */
.seatDragSource .seatCard:not(.seatCardGhost, .seatCardDragSource) {
	border-color: var(--poker-gold);
	box-shadow: 0 0 12px rgb(245 158 11 / 25%);
}

.seatNum {
	position: absolute;
	top: 5px;
	left: 8px;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 0.8rem;
	font-weight: 800;
	color: var(--poker-text-muted);
}

.seatAvatar {
	width: 56px;
	height: 56px;
	border-radius: 50%;
	background: var(--poker-bg-input);
	flex-shrink: 0;
	pointer-events: none;
}

.seatName {
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.95rem;
	font-weight: 700;
	color: var(--poker-text);
	text-align: center;
	overflow-wrap: break-word;
	word-break: keep-all;
	line-height: 1.2;
	pointer-events: none;
}

/* Кнопки */
.actions {
	display: flex;
	gap: 16px;
	z-index: 1;
}

.btnShuffle {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 14px 32px;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.15rem;
	font-weight: 700;
	color: var(--poker-text);
	background: var(--poker-bg-card);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius);
	cursor: pointer;
	transition: background 0.2s, border-color 0.2s, transform 0.15s;
}

.btnShuffle:hover {
	background: var(--poker-bg-input);
	border-color: var(--poker-border-hover);
}

.btnShuffle:active {
	transform: scale(0.97);
}

.btnStart {
	padding: 14px 40px;
	font-size: 1.25rem;
}
</style>
