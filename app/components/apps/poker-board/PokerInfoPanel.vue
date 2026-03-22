<template>
	<aside class="info-panel">
		<!-- Блайнды -->
		<section class="info-section">
			<h3 class="info-section__label">Блайнды</h3>
			<div class="info-blinds">
				<span class="info-blinds__current">
					<span class="info-blinds__value">{{ store.currentBlinds.sb }}</span>
					<span class="info-blinds__sep">/</span>
					<span class="info-blinds__value">{{ store.currentBlinds.bb }}</span>
				</span>
				<span class="info-blinds__next">
					След.: {{ store.nextBlinds.sb }} / {{ store.nextBlinds.bb }}
				</span>
			</div>
			<div class="info-timer info-timer--blinds">
				<Icon name="ph:clock-bold" class="info-timer__icon" />
				<span class="info-timer__value">{{ formatBlindTimer }}</span>
			</div>
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
			<span class="info-pot">{{ formatMoney(store.gameState.totalPot) }}</span>
		</section>

		<!-- Призовые -->
		<section class="info-section">
			<h3 class="info-section__label">Призовые</h3>
			<div class="info-prizes">
				<div class="info-prize">
					<span class="info-prize__icon">🥇</span>
					<span class="info-prize__amount">{{ formatMoney(store.prizeAmounts[0]) }}</span>
					<span class="info-prize__pct">{{ store.config.prizes[0] }}%</span>
				</div>
				<div class="info-prize">
					<span class="info-prize__icon">🥈</span>
					<span class="info-prize__amount">{{ formatMoney(store.prizeAmounts[1]) }}</span>
					<span class="info-prize__pct">{{ store.config.prizes[1] }}%</span>
				</div>
				<div class="info-prize">
					<span class="info-prize__icon">🥉</span>
					<span class="info-prize__amount">{{ formatMoney(store.prizeAmounts[2]) }}</span>
					<span class="info-prize__pct">{{ store.config.prizes[2] }}%</span>
				</div>
			</div>
		</section>

		<!-- Курс фишки -->
		<section class="info-section">
			<h3 class="info-section__label">Курс фишки</h3>
			<div class="info-chips">
				<span v-for="rate in store.chipRates" :key="rate.denomination" class="info-chip">
					<span class="info-chip__denom">{{ rate.denomination }}</span>
					<span class="info-chip__eq">=</span>
					<span class="info-chip__rate">{{ rate.rateInRubles }} ₽</span>
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
const store = usePokerStore()

defineEmits<{
	nextDeal: []
	finish: []
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

const formatMoney = (value: number): string => `${value.toLocaleString('ru-RU')} ₽`
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

.info-blinds__next {
	font-family: var(--poker-font-mono);
	font-size: 0.85rem;
	color: var(--poker-text-muted);
}

/* Таймеры */
.info-timer {
	display: flex;
	align-items: center;
	gap: 6px;
}

.info-timer__icon {
	font-size: 0.9rem;
	color: var(--poker-text-muted);
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
}

/* Ребай-статус */
.info-rebuy-status {
	font-family: var(--poker-font-mono);
	font-size: 0.8rem;
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

/* Банк */
.info-pot {
	font-family: var(--poker-font-mono);
	font-size: 1.75rem;
	font-weight: 800;
	color: var(--poker-gold);
	line-height: 1.1;
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

.info-prize__icon {
	font-size: 1.1rem;
}

.info-prize__amount {
	font-family: var(--poker-font-mono);
	font-size: 0.95rem;
	font-weight: 700;
	color: var(--poker-text);
}

.info-prize__pct {
	font-size: 0.75rem;
	color: var(--poker-text-muted);
}

/* Курс фишки */
.info-chips {
	display: flex;
	flex-wrap: wrap;
	gap: 6px 12px;
}

.info-chip {
	display: flex;
	align-items: center;
	gap: 4px;
	font-family: var(--poker-font-mono);
	font-size: 0.8rem;
}

.info-chip__denom {
	font-weight: 700;
	color: var(--poker-text-secondary);
}

.info-chip__eq {
	color: var(--poker-text-muted);
}

.info-chip__rate {
	color: var(--poker-gold);
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
</style>
