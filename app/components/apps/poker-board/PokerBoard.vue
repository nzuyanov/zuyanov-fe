<template>
	<div class="board">
		<div class="board__left">
			<PokerHeader
				:title="store.config.name || 'Poker Tournament'"
				:is-paused="store.gameState.status === 'paused'"
				:is-muted="sound.muted.value"
				@back="requestBack"
				@toggle-pause="store.togglePause()"
				@toggle-sound="sound.toggleMute()"
			/>

			<PokerPlayersGrid
				:players="store.gameState.players"
				class="board__players"
				@rebuy="handleRebuy"
				@eliminate="requestElimination"
				@show-blinds-modal="showBlindsModal = true"
			/>
		</div>

		<PokerInfoPanel
			class="board__info"
			@next-deal="handleNextDeal"
			@finish="requestFinish"
		/>

		<!-- Модалка подтверждения выбывания -->
		<PokerConfirmModal
			v-if="eliminatingPlayer"
			:title="eliminatingPlayer.name + ' выбывает?'"
			message="Это действие нельзя отменить."
			confirm-text="Выбыл"
			cancel-text="Отмена"
			variant="danger"
			@confirm="confirmElimination"
			@cancel="eliminatingPlayer = null"
		/>

		<!-- Модалка подтверждения завершения -->
		<PokerConfirmModal
			v-if="showFinishConfirm"
			title="Завершить турнир?"
			message="Будут определены итоговые места."
			confirm-text="Завершить"
			cancel-text="Отмена"
			variant="danger"
			@confirm="confirmFinish"
			@cancel="showFinishConfirm = false"
		/>

		<!-- Модалка подтверждения выхода -->
		<PokerConfirmModal
			v-if="showBackConfirm"
			title="Уходите?"
			message="Игра будет поставлена на паузу. Вы уверены, что хотите покинуть страницу?"
			confirm-text="Покинуть"
			cancel-text="Остаться"
			variant="danger"
			@confirm="confirmBack"
			@cancel="showBackConfirm = false"
		/>

		<!-- Оверлей паузы -->
		<Transition name="pause-overlay">
			<div v-if="store.gameState.status === 'paused'" class="board__pause-overlay" @click.self="store.resume()">
				<div class="board__pause-content">
					<span class="board__pause-icon">⏸</span>
					<span class="board__pause-text">ПАУЗА</span>
					<button class="board__pause-resume" @click="store.resume()">
						▶ Продолжить
					</button>
				</div>
			</div>
		</Transition>

		<!-- Уведомления -->
		<Transition name="toast">
			<div v-if="blindsUpNotice" class="board__toast board__toast--blinds">
				🔺 Блайнды повышены!
				<span class="board__toast-blinds-value">{{ store.currentBlinds.sb }} / {{ store.currentBlinds.bb }}</span>
			</div>
		</Transition>

		<Transition name="toast">
			<div v-if="rebuyEndNotice" class="board__toast board__toast--addon">
				🔄 Ребай-период завершён. Доступен Add-on
			</div>
		</Transition>

		<Transition name="toast">
			<div v-if="timeUpNotice" class="board__toast board__toast--danger">
				⏰ Время вышло! Завершите турнир вручную или продолжайте игру.
				<button class="board__toast-close" @click="timeUpNotice = false">✕</button>
			</div>
		</Transition>

		<Transition name="toast">
			<div v-if="bubbleNotice" class="board__toast board__toast--bubble">
				🔴 БАББЛ!
			</div>
		</Transition>

		<Transition name="toast">
			<div v-if="inPrizesNotice" class="board__toast board__toast--in-prizes">
				🎉 ВСЕ В ПРИЗАХ!
			</div>
		</Transition>

		<!-- Модалка уровней блайндов -->
		<PokerBlindsModal
			v-if="showBlindsModal"
			@close="showBlindsModal = false"
		/>
	</div>
</template>

<script setup lang="ts">
import type { PokerPlayer } from '~/types/poker'
import PokerHeader from './PokerHeader.vue'
import PokerPlayersGrid from './PokerPlayersGrid.vue'
import PokerInfoPanel from './PokerInfoPanel.vue'
import PokerConfirmModal from './PokerConfirmModal.vue'
import PokerBlindsModal from './PokerBlindsModal.vue'

const emit = defineEmits<{
	back: []
	finished: []
}>()

const store = usePokerStore()
const sound = usePokerSound()
const storage = usePokerStorage()

// Запуск автосохранения и beforeunload при монтировании доски
onMounted(() => {
	storage.setupAutoSaveListeners()
})

onUnmounted(() => {
	storage.cleanupAutoSaveListeners()
})

// --- Модалка уровней блайндов ---
const showBlindsModal = ref(false)

const isGameRunning = computed(
	() => store.gameState.status === 'playing' || store.gameState.status === 'paused',
)

// --- Стадия турнира: звуки и тосты ---
const bubbleNotice = ref(false)
const inPrizesNotice = ref(false)
let bubbleNoticeTimeout: ReturnType<typeof setTimeout> | null = null
let inPrizesNoticeTimeout: ReturnType<typeof setTimeout> | null = null

watch(() => store.tournamentStage, (newStage, oldStage) => {
	if (!isGameRunning.value) return

	if (newStage === 'bubble') {
		sound.play('bubbleReached')
		bubbleNotice.value = true
		if (bubbleNoticeTimeout) clearTimeout(bubbleNoticeTimeout)
		bubbleNoticeTimeout = setTimeout(() => { bubbleNotice.value = false }, 4000)
	}

	if (oldStage === 'bubble' && (newStage === 'in-prizes' || newStage === 'final-table')) {
		sound.play('bubbleBurst')
		inPrizesNotice.value = true
		if (inPrizesNoticeTimeout) clearTimeout(inPrizesNoticeTimeout)
		inPrizesNoticeTimeout = setTimeout(() => { inPrizesNotice.value = false }, 4000)
	}
})

// --- Таймеры и уведомления ---
const timeUpNotice = ref(false)
const blindsUpNotice = ref(false)
const rebuyEndNotice = ref(false)

let blindsUpTimeout: ReturnType<typeof setTimeout> | null = null
let rebuyEndTimeout: ReturnType<typeof setTimeout> | null = null

const showBlindsUpNotice = () => {
	blindsUpNotice.value = true
	if (blindsUpTimeout) clearTimeout(blindsUpTimeout)
	blindsUpTimeout = setTimeout(() => {
		blindsUpNotice.value = false
	}, 3000)
}

const showRebuyEndNotice = () => {
	rebuyEndNotice.value = true
	if (rebuyEndTimeout) clearTimeout(rebuyEndTimeout)
	rebuyEndTimeout = setTimeout(() => {
		rebuyEndNotice.value = false
	}, 4000)
}

usePokerTimer({
	onBlindsUp: () => {
		sound.play('blindsUp')
		showBlindsUpNotice()
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
		showRebuyEndNotice()
	},
})

onUnmounted(() => {
	if (blindsUpTimeout) clearTimeout(blindsUpTimeout)
	if (rebuyEndTimeout) clearTimeout(rebuyEndTimeout)
	if (bubbleNoticeTimeout) clearTimeout(bubbleNoticeTimeout)
	if (inPrizesNoticeTimeout) clearTimeout(inPrizesNoticeTimeout)
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
		eliminatingPlayer.value = null

		// Если игра завершилась после выбывания — очищаем сохранение
		if (store.gameState.status === 'finished') {
			storage.clear()
			emit('finished')
		}
		else {
			storage.saveOnAction()
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
	storage.clear()
	emit('finished')
}

// --- Выход со страницы ---
const showBackConfirm = ref(false)

const requestBack = () => {
	if (store.gameState.status === 'playing' || store.gameState.status === 'paused') {
		showBackConfirm.value = true
	}
	else {
		emit('back')
	}
}

const confirmBack = () => {
	store.pause()
	storage.saveOnAction()
	showBackConfirm.value = false
	emit('back')
}

// Следим за автозавершением (1 игрок остался)
watch(() => store.gameState.status, (status) => {
	if (status === 'finished') {
		storage.clear()
		emit('finished')
	}
})
</script>

<style scoped>
.board {
	display: flex;
	width: 100%;
	height: 100%;
	position: relative;
	background:
		url('/patterns/poker-felt.svg') repeat center center,
		var(--poker-bg);
	background-size: 450px 450px, auto;
}

.board__left {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-width: 0;
}

.board__players {
	flex: 1;
	min-height: 0;
}

.board__info {
	width: 320px;
	flex-shrink: 0;
	height: 100%;
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
	padding: 14px 24px;
	font-size: 1.1rem;
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

/* Оверлей паузы */
.board__pause-overlay {
	position: absolute;
	inset: 0;
	background: rgb(0 0 0 / 60%);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 200;
	backdrop-filter: blur(4px);
}

.board__pause-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
}

.board__pause-icon {
	font-size: 4rem;
	opacity: 0.7;
}

.board__pause-text {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 5rem;
	font-weight: 900;
	letter-spacing: 0.2em;
	color: var(--poker-text);
	text-shadow: 0 0 40px rgb(255 255 255 / 20%);
	animation: pause-pulse 2s ease-in-out infinite;
}

.board__pause-resume {
	margin-top: 16px;
	padding: 14px 40px;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.25rem;
	font-weight: 700;
	color: #fff;
	background: var(--poker-green);
	border: none;
	border-radius: var(--poker-radius);
	cursor: pointer;
	transition: background 0.2s, transform 0.15s;
}

.board__pause-resume:hover {
	background: var(--poker-green-hover);
	transform: translateY(-2px);
}

.board__pause-resume:active {
	transform: translateY(0);
}

@keyframes pause-pulse {
	0%, 100% { opacity: 0.8; }
	50% { opacity: 1; }
}

.pause-overlay-enter-active {
	transition: opacity 0.3s ease;
}

.pause-overlay-leave-active {
	transition: opacity 0.3s ease;
}

.pause-overlay-enter-from,
.pause-overlay-leave-to {
	opacity: 0;
}

/* Toast-уведомления — варианты */
.board__toast--blinds {
	background: var(--poker-green);
	color: #fff;
	animation: toast-glow-green 0.6s ease-out;
}

.board__toast-blinds-value {
	font-family: var(--poker-font-mono);
	font-size: 1.2rem;
	font-weight: 800;
	margin-left: 4px;
}

.board__toast--addon {
	background: var(--poker-gold);
	color: #000;
	animation: toast-glow-gold 0.6s ease-out;
}

@keyframes toast-glow-green {
	0% { box-shadow: 0 0 0 0 rgb(16 185 129 / 60%); }
	100% { box-shadow: 0 8px 32px rgb(0 0 0 / 40%); }
}

.board__toast--bubble {
	background: var(--poker-red);
	color: #fff;
	animation: toast-glow-red 0.6s ease-out;
}

.board__toast--in-prizes {
	background: #85b7eb;
	color: #000;
	animation: toast-glow-blue 0.6s ease-out;
}

@keyframes toast-glow-red {
	0% { box-shadow: 0 0 0 0 rgb(239 68 68 / 60%); }
	100% { box-shadow: 0 8px 32px rgb(0 0 0 / 40%); }
}

@keyframes toast-glow-blue {
	0% { box-shadow: 0 0 0 0 rgb(133 183 235 / 60%); }
	100% { box-shadow: 0 8px 32px rgb(0 0 0 / 40%); }
}

@keyframes toast-glow-gold {
	0% { box-shadow: 0 0 0 0 rgb(245 158 11 / 60%); }
	100% { box-shadow: 0 8px 32px rgb(0 0 0 / 40%); }
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
