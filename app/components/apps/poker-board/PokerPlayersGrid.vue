<template>
	<div class="tableArea">
		<!-- Покерный стол (овал) -->
		<div class="pokerTable">
			<div class="tableSurface">
				<div class="tableLine"/>
			</div>
		</div>

		<!-- Информация по центру стола -->
		<PokerTableOverlay
			:hand-number="store.gameState.handNumber"
			:stage="isGameRunning ? store.tournamentStage : null"
			@show-blinds-modal="$emit('showBlindsModal')"
		/>

		<!-- Карточки игроков по периметру стола -->
		<div
			v-for="(player, index) in players"
			:key="player.id"
			class="seat"
			:class="sizeClass"
			:style="getSeatStyle(index)"
		>
			<PokerPlayerCard
				:player="player"
				:role="getPlayerRole(player.id)"
				:can-rebuy="store.canRebuy(player.id)"
				:is-add-on="store.isPlayerAddOn(player.id)"
				:max-rebuys="store.config.maxRebuys"
				@rebuy="$emit('rebuy', $event)"
				@eliminate="$emit('eliminate', $event)"
			/>
		</div>

		<!-- Летающие фишки ролей (D / SB / BB) — левый верхний угол карточки -->
		<img
			v-if="dealerSeatIndex !== -1"
			src="~/assets/icons/poker/chip-dealer.svg"
			alt="D"
			class="roleChip"
			:class="chipSizeClass"
			:style="getRoleChipStyle(dealerSeatIndex)"
		>
		<img
			v-if="sbSeatIndex !== -1 && sbSeatIndex !== dealerSeatIndex"
			src="~/assets/icons/poker/chip-sb.svg"
			alt="SB"
			class="roleChip"
			:class="chipSizeClass"
			:style="getRoleChipStyle(sbSeatIndex)"
		>
		<img
			v-if="bbSeatIndex !== -1"
			src="~/assets/icons/poker/chip-bb.svg"
			alt="BB"
			class="roleChip"
			:class="chipSizeClass"
			:style="getRoleChipStyle(bbSeatIndex)"
		>
	</div>
</template>

<script setup lang="ts">
import type { PokerPlayer } from '~/types/poker'
import PokerPlayerCard from './PokerPlayerCard.vue'
import PokerTableOverlay from './PokerTableOverlay.vue'

const props = defineProps<{
	players: PokerPlayer[]
}>()

defineEmits<{
	rebuy: [playerId: number]
	eliminate: [playerId: number]
	showBlindsModal: []
}>()

const store = usePokerStore()

const isGameRunning = computed(
	() => store.gameState.status === 'playing' || store.gameState.status === 'paused',
)

const getPlayerRole = (playerId: number): 'D' | 'SB' | 'BB' | null => {
	if (store.dealerPlayer?.id === playerId) return 'D'
	if (store.sbPlayer?.id === playerId) return 'SB'
	if (store.bbPlayer?.id === playerId) return 'BB'
	return null
}

// --- Размеры и позиционирование ---

// Ширина карточки в зависимости от количества игроков (min-width карточки = 250px)
const cardWidth = computed(() => {
	const count = props.players.length
	if (count <= 4) return 280
	if (count <= 6) return 270
	if (count <= 8) return 260
	if (count <= 10) return 250
	if (count <= 14) return 250
	return 250
})

// Класс размера для компактного отображения
const sizeClass = computed(() => {
	const count = props.players.length
	if (count <= 10) return ''
	if (count <= 14) return 'compact'
	return 'ultraCompact'
})

// Класс размера фишки
const chipSizeClass = computed(() => props.players.length > 14 ? 'roleChipSmall' : '')

// Радиусы эллипса для размещения карточек (% от контейнера)
const seatRadii = computed(() => {
	const count = props.players.length
	if (count <= 4) return { rx: 34, ry: 32 }
	if (count <= 6) return { rx: 37, ry: 35 }
	if (count <= 8) return { rx: 37, ry: 35 }
	if (count <= 10) return { rx: 37, ry: 36 }
	return { rx: 38, ry: 37 }
})

// Приблизительная высота карточки для позиционирования фишек (min-height карточки = 150px)
const approxCardHeight = computed(() => {
	const count = props.players.length
	if (count <= 10) return 150
	if (count <= 14) return 150
	return 150
})

const getSeatAngle = (index: number) => Math.PI / 2 + (2 * Math.PI * index / props.players.length)

const getSeatCenter = (index: number) => {
	const { rx, ry } = seatRadii.value
	const angle = getSeatAngle(index)
	return {
		x: 50 + rx * Math.cos(angle),
		y: 50 + ry * Math.sin(angle),
	}
}

const getSeatStyle = (index: number) => {
	const { x, y } = getSeatCenter(index)
	return {
		left: `${x}%`,
		top: `${y}%`,
		width: `${cardWidth.value}px`,
	}
}

// --- Летающие фишки ролей — позиционирование в левый верхний угол карточки ---

const findSeatIndex = (player: { id: number } | null | undefined) => {
	if (!player) return -1
	return props.players.findIndex(p => p.id === player.id)
}

const dealerSeatIndex = computed(() => findSeatIndex(store.dealerPlayer))
const sbSeatIndex = computed(() => findSeatIndex(store.sbPlayer))
const bbSeatIndex = computed(() => findSeatIndex(store.bbPlayer))

const getRoleChipStyle = (seatIndex: number) => {
	if (seatIndex === -1) return {}

	const { x, y } = getSeatCenter(seatIndex)
	// Левый верхний угол карточки
	const offsetX = -(cardWidth.value / 2) + 6
	const offsetY = -(approxCardHeight.value / 2) + 6

	return {
		left: `calc(${x}% + ${offsetX}px)`,
		top: `calc(${y}% + ${offsetY}px)`,
	}
}
</script>

<style scoped>
.tableArea {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

/* Покерный стол — овал с рейлом и сукном */
.pokerTable {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	width: 60%;
	height: 52%;
	border-radius: 9999px;
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

/* Декоративная линия стола */
.tableLine {
	position: absolute;
	inset: 11% 6%;
	border-radius: 9999px;
	border: 2px solid rgb(255 255 255 / 5%);
}

/* Место игрока — абсолютное позиционирование на эллипсе */
.seat {
	position: absolute;
	transform: translate(-50%, -50%);
	z-index: 1;
	transition: left 0.4s ease, top 0.4s ease;
}

/* Летающие фишки ролей — левый верхний угол карточки */
.roleChip {
	position: absolute;
	width: 36px;
	height: 36px;
	transform: translate(-50%, -50%);
	transition: left 0.5s ease-in-out, top 0.5s ease-in-out;
	z-index: 10;
	pointer-events: none;
	filter: drop-shadow(0 2px 6px rgb(0 0 0 / 60%));
}

.roleChipSmall {
	width: 28px;
	height: 28px;
}

/* Компактный режим (11–14 игроков) */
.compact :deep(.card) {
	padding: 12px;
	gap: 8px;
}

.compact :deep(.avatar) {
	width: 52px;
	height: 52px;
}

.compact :deep(.name) {
	font-size: 1rem;
}

.compact :deep(.totalCash),
.compact :deep(.rebuyCount) {
	font-size: 0.85rem;
}

/* Ультракомпактный режим (15+ игроков) */
.ultraCompact :deep(.card) {
	padding: 10px;
	gap: 6px;
}

.ultraCompact :deep(.avatar) {
	width: 42px;
	height: 42px;
}

.ultraCompact :deep(.top) {
	gap: 10px;
}

.ultraCompact :deep(.name) {
	font-size: 0.9rem;
}

.ultraCompact :deep(.totalCash),
.ultraCompact :deep(.rebuyCount) {
	font-size: 0.8rem;
}
</style>
