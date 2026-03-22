<template>
	<div class="board">
		<PokerHeader
			:is-paused="store.gameState.status === 'paused'"
			:is-muted="sound.muted.value"
			@back="$emit('back')"
			@toggle-pause="store.togglePause()"
			@toggle-sound="sound.toggleMute()"
		/>

		<div class="board__body">
			<PokerPlayersGrid
				:players="store.gameState.players"
				class="board__players"
				@rebuy="handleRebuy"
				@eliminate="requestElimination"
			/>

			<PokerInfoPanel
				class="board__info"
				@next-deal="handleNextDeal"
				@finish="requestFinish"
			/>
		</div>

		<PokerPositionsBar />

		<!-- Модалка подтверждения выбывания -->
		<PokerConfirmModal
			v-if="eliminatingPlayer"
			:message="`${eliminatingPlayer.name} выбывает? Это действие нельзя отменить.`"
			confirm-text="Выбыл"
			cancel-text="Отмена"
			variant="danger"
			@confirm="confirmElimination"
			@cancel="eliminatingPlayer = null"
		/>

		<!-- Модалка подтверждения завершения -->
		<PokerConfirmModal
			v-if="showFinishConfirm"
			message="Завершить турнир? Будут определены итоговые места."
			confirm-text="Завершить"
			cancel-text="Отмена"
			variant="danger"
			@confirm="confirmFinish"
			@cancel="showFinishConfirm = false"
		/>

		<!-- Уведомление о времени -->
		<Transition name="toast">
			<div v-if="timeUpNotice" class="board__toast board__toast--danger">
				⏰ Время вышло! Завершите турнир вручную или продолжайте игру.
				<button class="board__toast-close" @click="timeUpNotice = false">✕</button>
			</div>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import type { PokerPlayer } from '~/types/poker'
import PokerHeader from './PokerHeader.vue'
import PokerPlayersGrid from './PokerPlayersGrid.vue'
import PokerInfoPanel from './PokerInfoPanel.vue'
import PokerPositionsBar from './PokerPositionsBar.vue'
import PokerConfirmModal from './PokerConfirmModal.vue'

const emit = defineEmits<{
	back: []
	finished: []
}>()

const store = usePokerStore()
const sound = usePokerSound()
const storage = usePokerStorage()

// --- Таймеры ---
const timeUpNotice = ref(false)

usePokerTimer({
	onBlindsUp: () => {
		sound.play('blindsUp')
	},
	onGameTimeUp: () => {
		sound.play('gameEnd')
		timeUpNotice.value = true
	},
	onWarning5min: () => {
		sound.play('warning5min')
	},
	onWarning1minBlinds: () => {
		sound.play('warning1min')
	},
	onRebuyPeriodEnd: () => {
		sound.play('rebuyEnd')
	},
})

// --- Ребай ---
const handleRebuy = (playerId: number) => {
	store.rebuy(playerId)
	storage.saveOnAction()
}

// --- Следующая раздача ---
const handleNextDeal = () => {
	store.nextDeal()
	storage.saveOnAction()
}

// --- Выбывание ---
const eliminatingPlayer = ref<PokerPlayer | null>(null)

const requestElimination = (playerId: number) => {
	const player = store.gameState.players.find(p => p.id === playerId)
	if (player && !player.isEliminated) {
		eliminatingPlayer.value = player
	}
}

const confirmElimination = () => {
	if (eliminatingPlayer.value) {
		store.eliminatePlayer(eliminatingPlayer.value.id)
		storage.saveOnAction()
		eliminatingPlayer.value = null

		// Если игра завершилась после выбывания
		if (store.gameState.status === 'finished') {
			emit('finished')
		}
	}
}

// --- Завершение турнира ---
const showFinishConfirm = ref(false)

const requestFinish = () => {
	showFinishConfirm.value = true
}

const confirmFinish = () => {
	store.finishGame()
	showFinishConfirm.value = false
	storage.saveOnAction()
	emit('finished')
}

// Следим за автозавершением (1 игрок остался)
watch(() => store.gameState.status, (status) => {
	if (status === 'finished') {
		emit('finished')
	}
})
</script>

<style scoped>
.board {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	position: relative;
}

.board__body {
	display: flex;
	flex: 1;
	min-height: 0;
}

.board__players {
	flex: 1;
	min-width: 0;
}

.board__info {
	width: 320px;
	flex-shrink: 0;
}

/* Toast-уведомление */
.board__toast {
	position: absolute;
	top: 70px;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 20px;
	font-size: 0.95rem;
	font-weight: 600;
	border-radius: var(--poker-radius);
	box-shadow: 0 8px 32px rgb(0 0 0 / 40%);
	z-index: 100;
}

.board__toast--danger {
	background: var(--poker-red);
	color: #fff;
}

.board__toast-close {
	background: none;
	border: none;
	color: rgb(255 255 255 / 70%);
	font-size: 1rem;
	cursor: pointer;
	padding: 0 4px;
}

.board__toast-close:hover {
	color: #fff;
}

.toast-enter-active,
.toast-leave-active {
	transition: opacity 0.3s, transform 0.3s;
}

.toast-enter-from,
.toast-leave-to {
	opacity: 0;
	transform: translateX(-50%) translateY(-16px);
}
</style>
