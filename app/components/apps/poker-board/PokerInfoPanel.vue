<template>
	<aside class="info-panel">
		<!-- Блайнды -->
		<section class="info-section" :class="{ 'info-section--blinds-pulse': blindsPulse }">
			<h3 class="info-section__label">Блайнды</h3>
			<div class="info-blinds">
				<span class="info-blinds__current">
					<span class="info-blinds__value">{{ store.currentBlinds.sb }}</span>
					<span class="info-blinds__sep">/</span>
					<span class="info-blinds__value">{{ store.currentBlinds.bb }}</span>
				</span>
				<span class="info-blinds__min-raise">Мин. рейз: {{ store.minRaise }}</span>
				<span class="info-blinds__next">
					След.: {{ store.nextBlinds.sb }} / {{ store.nextBlinds.bb }}
				</span>
				<span
					v-for="preview in nextLevelsPreviews"
					:key="preview.level"
					class="info-blinds__preview"
				>
					→ {{ preview.sb }} / {{ preview.bb }}
				</span>
			</div>
			<div class="info-timer info-timer--blinds" :class="{ 'info-timer--warning': isBlindTimerLow }">
				<Icon name="ph:clock-bold" class="info-timer__icon" />
				<span class="info-timer__value">{{ formatBlindTimer }}</span>
			</div>
			<button class="info-blinds-all" @click="$emit('showBlindsModal')">
				📋 Все уровни
			</button>
		</section>

		<!-- Таймер игры -->
		<section class="info-section">
			<h3 class="info-section__label">Таймер игры</h3>
			<div class="info-timer info-timer--game" :class="{ 'info-timer--danger': isTimeLow }">
				<span class="info-timer__value info-timer__value--large">{{ formatGameTimer }}</span>
			</div>
		</section>

		<!-- Ребай-статус -->
		<section v-if="rebuyStatusText" class="info-section">
			<div class="info-rebuy-status" :class="rebuyStatusClass">
				{{ rebuyStatusText }}
			</div>
		</section>

		<!-- Банк -->
		<section class="info-section">
			<h3 class="info-section__label">Банк</h3>
			<span class="info-pot">{{ formatMoney(store.gameState.totalPot) }} <Icon name="material-symbols:currency-ruble-rounded" class="rub-icon" /></span>
			<div class="info-stats">
				<span class="info-stats__item">
					Игроков: {{ store.activePlayers.length }} / {{ store.gameState.players.length }}
				</span>
			</div>
		</section>

		<!-- Призовые -->
		<section class="info-section">
			<h3 class="info-section__label">Призовые</h3>
			<div class="info-prizes">
				<div class="info-prize">
					<img :src="trophyGoldImg" alt="1" class="info-prize__trophy">
					<span class="info-prize__amount">{{ formatMoney(store.prizeAmounts[0]) }} <Icon name="material-symbols:currency-ruble-rounded" class="rub-icon" /></span>
					<span class="info-prize__pct">{{ store.config.prizes[0] }}%</span>
				</div>
				<div class="info-prize">
					<img :src="trophySilverImg" alt="2" class="info-prize__trophy">
					<span class="info-prize__amount">{{ formatMoney(store.prizeAmounts[1]) }} <Icon name="material-symbols:currency-ruble-rounded" class="rub-icon" /></span>
					<span class="info-prize__pct">{{ store.config.prizes[1] }}%</span>
				</div>
				<div class="info-prize">
					<img :src="trophyBronzeImg" alt="3" class="info-prize__trophy">
					<span class="info-prize__amount">{{ formatMoney(store.prizeAmounts[2]) }} <Icon name="material-symbols:currency-ruble-rounded" class="rub-icon" /></span>
					<span class="info-prize__pct">{{ store.config.prizes[2] }}%</span>
				</div>
			</div>
		</section>

		<!-- Курс фишки -->
		<section class="info-section">
			<h3 class="info-section__label">Курс фишки</h3>
			<div class="info-chips">
				<span class="info-chip">
					<span class="info-chip__denom">1 фишка</span>
					<span class="info-chip__eq">=</span>
					<span class="info-chip__rate">{{ store.rubInChip }} <Icon name="material-symbols:currency-ruble-rounded" class="rub-icon" /></span>
				</span>
				<span class="info-chip">
					<span class="info-chip__denom">1 <Icon name="material-symbols:currency-ruble-rounded" class="rub-icon" /></span>
					<span class="info-chip__eq">=</span>
					<span class="info-chip__rate">{{ store.chipInRub }} {{ store.chipInRubUnit }}</span>
				</span>
			</div>
		</section>

		<!-- Кнопки управления -->
		<div class="info-actions">
			<button class="info-next-deal" @click="$emit('nextDeal')">
				Следующая раздача →
			</button>
			<button class="info-finish" @click="$emit('finish')">
				Завершить турнир
			</button>
		</div>
	</aside>
</template>

<script setup lang="ts">
import trophyGoldImg from '~/assets/images/trophy-gold.png'
import trophySilverImg from '~/assets/images/trophy-silver.png'
import trophyBronzeImg from '~/assets/images/trophy-bronze.png'

const store = usePokerStore()

defineEmits<{
	nextDeal: []
	finish: []
	showBlindsModal: []
}>()

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

// Менее 5 минут — красный таймер
const isTimeLow = computed(() => store.remainingGameSeconds < 300 && store.remainingGameSeconds > 0)

// Статус ребаев / add-on
const rebuyStatusText = computed(() => {
	if (store.gameState.status === 'idle' || store.gameState.status === 'finished') return null

	if (store.isRebuyPeriod) {
		const remaining = store.rebuyPeriodSeconds - store.gameState.elapsedSeconds
		const m = Math.floor(remaining / 60)
		const s = remaining % 60
		return `Ребай-период: ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
	}

	if (store.isAddOnAvailable) {
		// Проверяем, остались ли игроки без add-on
		const hasAvailable = store.activePlayers.some(p => !p.addOnUsed)
		if (hasAvailable) return 'Доступен Add-on'
		return 'Дозакупки завершены'
	}

	return 'Дозакупки завершены'
})

const rebuyStatusClass = computed(() => {
	if (store.isRebuyPeriod) return 'info-rebuy-status--active'
	if (store.isAddOnAvailable && store.activePlayers.some(p => !p.addOnUsed)) return 'info-rebuy-status--addon'
	return 'info-rebuy-status--done'
})

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

// Предупреждение — 1 минута до повышения блайндов
const isBlindTimerLow = computed(() => store.gameState.blindTimerSeconds <= 60 && store.gameState.blindTimerSeconds > 0)

onUnmounted(() => {
	if (blindsPulseTimeout) clearTimeout(blindsPulseTimeout)
})

// Превью следующих 2–3 уровней (после nextBlinds)
const nextLevelsPreviews = computed(() => {
	const startIdx = store.gameState.currentBlindLevel + 2
	const levels = store.allBlindLevels
	const result: { level: number; sb: number; bb: number }[] = []
	for (let i = startIdx; i < Math.min(startIdx + 2, levels.length); i++) {
		const lvl = levels[i]
		if (lvl) {
			result.push({ level: lvl.level, sb: lvl.smallBlind, bb: lvl.bigBlind })
		}
	}
	return result
})

const formatMoney = (value: number): string => value.toLocaleString('ru-RU')
</script>

<style scoped>
.info-panel {
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 20px;
	background: var(--poker-bg-surface);
	border-left: 1px solid var(--poker-border);
	overflow-y: auto;
}

.info-panel::-webkit-scrollbar {
	width: 6px;
}

.info-panel::-webkit-scrollbar-track {
	background: transparent;
}

.info-panel::-webkit-scrollbar-thumb {
	background: rgb(255 255 255 / 15%);
	border-radius: 3px;
}

.info-panel::-webkit-scrollbar-thumb:hover {
	background: rgb(255 255 255 / 25%);
}

.info-section {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.info-section__label {
	font-size: 0.7rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: var(--poker-text-muted);
}

/* Блайнды */
.info-blinds {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.info-blinds__current {
	font-family: var(--poker-font-mono);
	font-size: 2rem;
	font-weight: 800;
	color: var(--poker-green);
	line-height: 1.1;
}

.info-blinds__sep {
	margin: 0 2px;
	color: var(--poker-text-muted);
}

.info-blinds__value {
	color: var(--poker-green);
}

.info-blinds__min-raise {
	font-family: var(--poker-font-mono);
	font-size: 1rem;
	font-weight: 600;
	color: var(--poker-text-secondary);
}

.info-blinds__next {
	font-size: 1rem;
	color: var(--poker-text-muted);
}

.info-blinds__preview {
	font-size: 0.85rem;
	color: var(--poker-text-muted);
	opacity: 0.7;
}

.info-blinds-all {
	margin-top: 4px;
	padding: 6px 10px;
	font-size: 0.75rem;
	font-weight: 600;
	color: var(--poker-text-secondary);
	background: var(--poker-bg-card);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius-sm);
	cursor: pointer;
	transition: color 0.2s, border-color 0.2s;
	align-self: flex-start;
}

.info-blinds-all:hover {
	color: var(--poker-text);
	border-color: var(--poker-border-hover);
}

/* Таймеры */
.info-timer {
	display: flex;
	align-items: center;
	gap: 6px;
}

.info-timer__icon {
	font-size: 1rem;
	color: var(--poker-text-muted);
	flex-shrink: 0;
}

.info-timer__value {
	font-family: var(--poker-font-mono);
	font-size: 1rem;
	font-weight: 700;
	color: var(--poker-text-secondary);
}

.info-timer__value--large {
	font-size: 2.25rem;
	font-weight: 800;
	color: var(--poker-text);
	line-height: 1.1;
}

.info-timer--danger .info-timer__value {
	color: var(--poker-red);
	animation: timer-danger-pulse 1s ease-in-out infinite;
}

@keyframes timer-danger-pulse {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.6; }
}

/* Предупреждение — скоро блайнды повысятся */
.info-timer--warning .info-timer__value {
	color: var(--poker-gold);
}

.info-timer--warning .info-timer__icon {
	color: var(--poker-gold);
}

/* Пульсация блайндов при повышении */
.info-section--blinds-pulse {
	animation: blinds-pulse 0.6s ease-out 3;
}

.info-section--blinds-pulse .info-blinds__current {
	animation: blinds-glow 0.6s ease-out 3;
}

@keyframes blinds-pulse {
	0% { background: rgb(16 185 129 / 15%); }
	100% { background: transparent; }
}

@keyframes blinds-glow {
	0% { text-shadow: 0 0 16px rgb(16 185 129 / 60%); }
	100% { text-shadow: none; }
}

/* Ребай-статус */
.info-rebuy-status {
	font-family: var(--poker-font-mono);
	font-size: 0.85rem;
	font-weight: 700;
	padding: 6px 10px;
	border-radius: var(--poker-radius-sm);
	text-align: center;
}

.info-rebuy-status--active {
	background: var(--poker-green-dim);
	color: var(--poker-green);
}

.info-rebuy-status--addon {
	background: var(--poker-gold-dim);
	color: var(--poker-gold);
}

.info-rebuy-status--done {
	background: var(--poker-bg-card);
	color: var(--poker-text-muted);
}

/* Статистика (игроки, средний стек) */
.info-stats {
	display: flex;
	flex-direction: column;
	gap: 2px;
	margin-top: 4px;
}

.info-stats__item {
	font-size: 0.85rem;
	color: var(--poker-text-muted);
}

.info-stats__avg {
	font-family: var(--poker-font-mono);
	font-weight: 700;
}

.info-stats__avg--green {
	color: var(--poker-green);
}

.info-stats__avg--gold {
	color: var(--poker-gold);
}

.info-stats__avg--orange {
	color: #ef9f27;
}

.info-stats__avg--red {
	color: var(--poker-red);
}

/* Банк */
.info-pot {
	font-size: 2.25rem;
	font-weight: 900;
	color: var(--poker-gold);
	line-height: 1.1;
	display: flex;
	align-items: center;
}

/* Призовые */
.info-prizes {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.info-prize {
	display: flex;
	align-items: center;
	gap: 8px;
}

.info-prize__trophy {
	width: 48px;
	height: 48px;
	flex-shrink: 0;
}

.info-prize__amount {
	font-size: 1.05rem;
	font-weight: 700;
	color: var(--poker-text);
}

.info-prize__pct {
	font-size: 0.8rem;
	color: var(--poker-text-muted);
}

/* Курс фишки */
.info-chips {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.info-chip {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 1.05rem;
}

.info-chip__denom {
	font-weight: 700;
	color: var(--poker-text-secondary);
}

.info-chip__eq {
	color: var(--poker-text-muted);
}

.info-chip__rate {
	font-weight: 700;
	color: var(--poker-gold);
	display: flex;
	align-items: center;
}

/* Кнопки управления */
.info-actions {
	margin-top: auto;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.info-next-deal {
	padding: 14px;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1rem;
	font-weight: 800;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	color: #fff;
	background: var(--poker-green);
	border: none;
	border-radius: var(--poker-radius);
	cursor: pointer;
	transition: background 0.2s, transform 0.15s;
}

.info-next-deal:hover {
	background: var(--poker-green-hover);
	transform: translateY(-1px);
}

.info-next-deal:active {
	transform: translateY(0);
}

.info-finish {
	padding: 10px 14px;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.8rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	color: var(--poker-red);
	background: var(--poker-red-dim);
	border: none;
	border-radius: var(--poker-radius);
	cursor: pointer;
	transition: background 0.2s, color 0.2s;
}

.info-finish:hover {
	background: var(--poker-red);
	color: #fff;
}

.rub-icon {
	display: inline-block;
	vertical-align: middle;
	width: 1em;
	height: 1em;
}

.rub-icon :deep(svg) {
	width: 1em;
	height: 1em;
	vertical-align: middle;
}
</style>
