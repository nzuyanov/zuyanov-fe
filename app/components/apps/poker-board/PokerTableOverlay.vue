<template>
	<div class="overlay">
		<!-- Верхняя строка: бейдж стадии + бейдж мин. рейза -->
		<div class="topBadges">
			<span v-if="stage" class="stage" :class="`stage--${stage}`">
				{{ stageLabel }}
			</span>
			<span class="minRaise">MIN РЕЙЗ: {{ store.minRaise }}</span>
		</div>

		<!-- Три колонки -->
		<div class="columns">
			<!-- Левая: таймер до смены блайндов -->
			<div class="col colLeft">
				<img :src="imgSandTimer" alt="" class="timer" :class="{ 'timerPending': store.gameState.blindsPending }">
				<span
					class="blindTimerValue"
					:class="{
						'blindTimerWarning': isBlindTimerLow && !store.gameState.blindsPending,
						'blindTimerPending': store.gameState.blindsPending,
					}"
				>{{ formatBlindTimer }}</span>
				<span class="blindTimerLabel" :class="{ 'blindTimerLabelPending': store.gameState.blindsPending }">{{ store.gameState.blindsPending ? 'ждёт раздачу' : 'до смены' }}</span>
			</div>

			<!-- Разделитель -->
			<div class="divider" />

			<!-- Центр: текущие блайнды -->
			<div class="col colCenter" :class="{ 'blindsPulse': blindsPulse }">
				<span class="blindsLabel">Блайнды</span>
				<span class="blindsValue">
					{{ store.currentBlinds.sb }}<span class="blindsSep"> / </span>{{ store.currentBlinds.bb }}
				</span>
			</div>

			<!-- Разделитель -->
			<div class="divider" />

			<!-- Правая: след. уровень + кнопка -->
			<div class="col colRight">
				<span class="nextLabel">Далее:</span>
				<span class="nextValue">{{ store.nextBlinds.sb }} / {{ store.nextBlinds.bb }}</span>
				<button class="allLevelsBtn" @click="$emit('showBlindsModal')">
					📋 Все уровни
				</button>
			</div>
		</div>

		<!-- Нижняя строка: таймер игры + раздача -->
		<div class="bottom">
			<span class="gameTimerValue" :class="{ 'gameTimerDanger': isTimeLow }">{{ formatGameTimer }}</span>
			<span v-if="handNumber > 0" class="bottomSep">·</span>
			<span v-if="handNumber > 0" class="hand">Раздача #{{ handNumber }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { TournamentStage } from '~/types/poker'
import imgSandTimer from '~/assets/images/sand-timer.png'

const props = defineProps<{
	handNumber: number
	stage: TournamentStage | null
}>()

defineEmits<{
	showBlindsModal: []
}>()

const store = usePokerStore()

const STAGE_LABELS: Record<TournamentStage, string> = {
	'early': 'Ранняя стадия',
	'middle': 'Средняя стадия',
	'bubble': '🔴 Баббл!',
	'in-prizes': 'В призах',
	'final-table': '🏆 Финальный стол',
	'heads-up': 'Хедз-ап',
}

const stageLabel = computed(() => props.stage ? STAGE_LABELS[props.stage] : '')

// Форматирование таймера игры (ЧЧ:ММ:СС)
const formatGameTimer = computed(() => {
	const total = store.remainingGameSeconds
	const h = Math.floor(total / 3600)
	const m = Math.floor((total % 3600) / 60)
	const s = total % 60
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

// Форматирование таймера блайндов (ММ:СС)
const formatBlindTimer = computed(() => {
	const total = store.gameState.blindTimerSeconds
	const m = Math.floor(total / 60)
	const s = total % 60
	return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const isTimeLow = computed(() => store.remainingGameSeconds < 300 && store.remainingGameSeconds > 0)
const isBlindTimerLow = computed(() => store.gameState.blindTimerSeconds <= 60 && store.gameState.blindTimerSeconds > 0)

// Пульсация блайндов при повышении
const blindsPulse = ref(false)
let blindsPulseTimeout: ReturnType<typeof setTimeout> | null = null

watch(() => store.gameState.currentBlindLevel, () => {
	blindsPulse.value = true
	if (blindsPulseTimeout) clearTimeout(blindsPulseTimeout)
	blindsPulseTimeout = setTimeout(() => {
		blindsPulse.value = false
	}, 3000)
})

onUnmounted(() => {
	if (blindsPulseTimeout) clearTimeout(blindsPulseTimeout)
})
</script>

<style scoped>
.overlay {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
	z-index: 2;
	text-align: center;
}

/* Верхняя строка бейджей */
.topBadges {
	display: flex;
	align-items: center;
	gap: 14px;
}

/* Стадия турнира */
.stage {
	padding: 8px 20px;
	font-size: 1.2rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	border-radius: 9999px;
	white-space: nowrap;
	box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

.stage--early {
	background: rgb(16 185 129 / 20%);
	color: #5dffba;
}

.stage--middle {
	background: rgb(245 158 11 / 20%);
	color: #ffd06a;
}

.stage--bubble {
	background-color: rgb(190 24 93 / 50%);
	color: #F9A8D4;
	animation: bubblePulse 1s ease-in-out infinite;
}

.stage--in-prizes {
	background: linear-gradient(45deg, #FF6B6B, #4ECDC4, #96CEB4, #FFEBA7);
	background-size: 400% 400%;
	color: white;
	animation: rainbow-pulse 4s ease infinite;
}

@keyframes rainbow-pulse {
	0% { background-position: 0% 50%; }
	50% { background-position: 100% 50%; }
	100% { background-position: 0% 50%; }
}

.stage--final-table {
	background: linear-gradient(45deg, #000, #D4AF37);
	background-size: 200% 200%;
	color: white;
	animation: gradient-shift 4s ease infinite;
}

@keyframes gradient-shift {
	0% { background-position: 0% 50%; }
	50% { background-position: 100% 50%; }
	100% { background-position: 0% 50%; }
}

.stage--heads-up {
	background-color: rgb(0 0 0 / 60%);
	color: #FF4757;
	backdrop-filter: blur(3px);
	box-shadow: 0 0 0 rgb(255 71 87 / 0%);
	animation: tension-pulse 1.5s infinite;
}

@keyframes tension-pulse {
	0%, 100% { box-shadow: 0 0 10px rgb(255 71 87 / 40%); }
	50% { box-shadow: 0 0 20px rgb(255 71 87 / 80%); }
}

@keyframes bubblePulse {
	0% {
		background-color: rgb(190 24 93 / 50%);
	}

	50% {
		background-color: rgb(210 30 100 / 60%); /* Чуть ярче и насыщеннее */
	}

	100% {
		background-color: rgb(190 24 93 / 50%);
	}
}

/* Три колонки */
.columns {
	display: flex;
	align-items: center;
	gap: 0;
}

.col {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 0 28px;
	gap: 4px;
}

/* Разделитель вертикальный */
.divider {
	width: 1px;
	height: 56px;
	background: rgb(255 255 255 / 15%);
	flex-shrink: 0;
}

.timer {
	height: 36px;
	width: 36px;
}

.blindTimerValue {
	font-family: var(--poker-font-mono);
	font-size: 2rem;
	font-weight: 800;
	color: rgb(255 255 255 / 80%);
	line-height: 1;
	text-shadow: 0 2px 8px rgb(0 0 0 / 40%);
}

.blindTimerWarning {
	color: #ffd06a;
}

.blindTimerPending {
	color: #5dffba;
	animation: pendingPulse 1.2s ease-in-out infinite;
}

.timerPending {
	animation: pendingPulse 1.2s ease-in-out infinite;
}

@keyframes pendingPulse {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.55; }
}

.blindTimerLabel {
	font-size: 1rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: rgb(255 255 255 / 35%);
}

.blindTimerLabelPending {
	color: #5dffba;
	font-weight: 700;
}

/* Центральная колонка: блайнды */
.blindsLabel {
	font-size: 1rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	color: rgb(255 255 255 / 45%);
}

.blindsValue {
	font-family: var(--poker-font-mono);
	font-size: 3.2rem;
	font-weight: 900;
	color: var(--poker-gold);
	line-height: 1;
	text-shadow: 0 2px 12px rgb(0 0 0 / 25%);
}

.blindsSep {
	color: rgb(255 255 255 / 40%);
}

.minRaise {
	font-size: 1.2rem;
	font-weight: 700;
	background: linear-gradient(135deg,
	rgb(59 130 246 / 40%) 0%,
	rgb(37 99 235 / 45%) 100%
);
	color: #DBEEFF;
	box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
	padding: 8px 20px;
	border-radius: 9999px;
	white-space: nowrap;
	letter-spacing: 0.04em;
}

.blindsPulse .blindsValue {
	animation: blindsGlow 0.6s ease-out 3;
}

@keyframes blindsGlow {
	0% {
		text-shadow: 0 0 20px rgb(16 185 129 / 80%), 0 0 40px rgb(16 185 129 / 40%);
		color: #5dffba;
	}

	100% {
		text-shadow: 0 2px 12px rgb(0 0 0 / 50%);
		color: #fff;
	}
}

/* Правая колонка: след. уровень */
.nextLabel {
	font-size: 1rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: rgb(255 255 255 / 35%);
}

.nextValue {
	font-family: var(--poker-font-mono);
	font-size: 1.5rem;
	font-weight: 700;
	color: rgb(255 255 255 / 60%);
	line-height: 1;
}

.allLevelsBtn {
	margin-top: 2px;
	padding: 6px 16px;
	font-size: 1rem;
	font-weight: 600;
	color: #fff;
	background: #2d5a3d;
	border: 1px solid #3d7a52;
	border-radius: 9999px;
	cursor: pointer;
	transition: background 0.15s;
	pointer-events: auto;
	white-space: nowrap;
}

.allLevelsBtn:hover {
	background: #3d7a52;
}

/* Нижняя строка */
.bottom {
	display: flex;
	align-items: center;
	gap: 10px;
	height: 36px;
}

.gameTimerValue {
	font-family: var(--poker-font-mono);
	font-size: 1.6rem;
	font-weight: 800;
	color: rgb(255 255 255 / 70%);
	line-height: 36px;
	text-shadow: 0 2px 8px rgb(0 0 0 / 40%);
}

.gameTimerDanger {
	color: #ff6b6b;
	animation: timerDangerPulse 1s ease-in-out infinite;
}

@keyframes timerDangerPulse {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.5; }
}

.bottomSep {
	font-size: 1.2rem;
	color: rgb(255 255 255 / 25%);
}

.hand {
	font-size: 1rem;
	font-weight: 600;
	line-height: 36px;
	color: rgb(255 255 255 / 35%);
}

/* Адаптация для узких экранов */
@media (width <= 1500px) {
	.stage {
		padding: 5px 14px;
		font-size: 0.95rem;
	}

	.minRaise {
		padding: 5px 14px;
		font-size: 0.95rem;
	}

	.blindsValue {
		font-size: 2.6rem;
	}

	.blindTimerValue {
		font-size: 1.6rem;
	}

	.nextValue {
		font-size: 1.2rem;
	}

	.col {
		padding: 0 20px;
	}

	.overlay {
		gap: 14px;
	}
}
</style>
