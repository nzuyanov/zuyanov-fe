<template>
	<aside class="infoPanel">
		<!-- Ребай-статус -->
		<section v-if="rebuyStatusText" class="section">
			<div class="rebuyStatus" :class="rebuyStatusClass">
				{{ rebuyStatusText }}
			</div>
		</section>

		<!-- Банк -->
		<section class="section">
			<h3 class="label">Банк</h3>
			<span class="pot">{{ formatMoney(store.gameState.totalPot) }} ₽</span>
			<div class="stats">
				<span class="statsItem">
					Игроков: {{ store.activePlayers.length }} / {{ store.gameState.players.length }}
				</span>
			</div>
		</section>

		<!-- Призовые -->
		<section class="section">
			<h3 class="label">Призовые</h3>
			<div class="prizes">
				<div class="prize">
					<img :src="trophyGoldImg" alt="1" class="prizeTrophy">
					<span class="prizeAmount">{{ formatMoney(store.prizeAmounts[0]) }} ₽</span>
				</div>
				<div class="prize">
					<img :src="trophySilverImg" alt="2" class="prizeTrophy">
					<span class="prizeAmount">{{ formatMoney(store.prizeAmounts[1]) }} ₽</span>
				</div>
				<div class="prize">
					<img :src="trophyBronzeImg" alt="3" class="prizeTrophy">
					<span class="prizeAmount">{{ formatMoney(store.prizeAmounts[2]) }} ₽</span>
				</div>
			</div>
		</section>

		<!-- Курс фишки -->
		<section class="section">
			<h3 class="label">Курс фишки</h3>
			<PokerChipRate variant="column" />
		</section>

		<!-- Кнопки управления -->
		<div class="actions">
			<button class="nextDeal" @click="$emit('nextDeal')">
				Следующая раздача →
			</button>
			<button class="finish" @click="$emit('finish')">
				Завершить турнир
			</button>
		</div>
	</aside>
</template>

<script setup lang="ts">
import trophyGoldImg from '~/assets/images/trophy-gold.png'
import trophySilverImg from '~/assets/images/trophy-silver.png'
import trophyBronzeImg from '~/assets/images/trophy-bronze.png'
import PokerChipRate from '~/components/apps/poker-board/PokerChipRate.vue'

const store = usePokerStore()

defineEmits<{
	nextDeal: []
	finish: []
}>()

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
		const hasAvailable = store.activePlayers.some(p => !p.addOnUsed)
		if (hasAvailable) return 'Доступен Add-on'
		return 'Дозакупки завершены'
	}

	return 'Дозакупки завершены'
})

const rebuyStatusClass = computed(() => {
	if (store.isRebuyPeriod) return 'rebuyStatusActive'
	if (store.isAddOnAvailable && store.activePlayers.some(p => !p.addOnUsed)) return 'rebuyStatusAddon'
	return 'rebuyStatusDone'
})

const formatMoney = (value: number): string => value.toLocaleString('ru-RU')
</script>

<style scoped>
.infoPanel {
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 20px;
	background: var(--poker-bg-surface);
	border-left: 1px solid var(--poker-border);
	overflow-y: auto;
}

.infoPanel::-webkit-scrollbar {
	width: 6px;
}

.infoPanel::-webkit-scrollbar-track {
	background: transparent;
}

.infoPanel::-webkit-scrollbar-thumb {
	background: rgb(255 255 255 / 15%);
	border-radius: 3px;
}

.infoPanel::-webkit-scrollbar-thumb:hover {
	background: rgb(255 255 255 / 25%);
}

.section {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.label {
	font-size: 0.7rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: var(--poker-text-muted);
}

/* Ребай-статус */
.rebuyStatus {
	font-family: var(--poker-font-mono);
	font-size: 0.85rem;
	font-weight: 700;
	padding: 6px 10px;
	border-radius: var(--poker-radius-sm);
	text-align: center;
}

.rebuyStatusActive {
	background: var(--poker-green-dim);
	color: var(--poker-green);
}

.rebuyStatusAddon {
	background: var(--poker-gold-dim);
	color: var(--poker-gold);
}

.rebuyStatusDone {
	background: var(--poker-bg-card);
	color: var(--poker-text-muted);
}

/* Статистика */
.stats {
	display: flex;
	flex-direction: column;
	gap: 2px;
	margin-top: 4px;
}

.statsItem {
	font-size: 0.85rem;
	color: var(--poker-text-muted);
}

/* Банк */
.pot {
	font-size: 2.25rem;
	font-weight: 900;
	color: var(--poker-gold);
	line-height: 1.1;
	display: flex;
	align-items: center;
}

/* Призовые */
.prizes {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.prize {
	display: flex;
	align-items: center;
	gap: 8px;
}

.prizeTrophy {
	width: 48px;
	height: 48px;
	flex-shrink: 0;
}

.prizeAmount {
	font-size: 1.05rem;
	font-weight: 700;
	color: var(--poker-text);
}

.blindsAllBtn {
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

.blindsAllBtn:hover {
	color: var(--poker-text);
	border-color: var(--poker-border-hover);
}

/* Курс фишки */
.chips {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.chip {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 1.05rem;
}

.chipDenom {
	font-weight: 700;
	color: var(--poker-text-secondary);
}

.chipEq {
	color: var(--poker-text-muted);
}

.chipRate {
	font-weight: 700;
	color: var(--poker-gold);
	display: flex;
	align-items: center;
}

/* Кнопки управления */
.actions {
	margin-top: auto;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.nextDeal {
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

.nextDeal:hover {
	background: var(--poker-green-hover);
	transform: translateY(-1px);
}

.nextDeal:active {
	transform: translateY(0);
}

.finish {
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

.finish:hover {
	background: var(--poker-red);
	color: #fff;
}
</style>
