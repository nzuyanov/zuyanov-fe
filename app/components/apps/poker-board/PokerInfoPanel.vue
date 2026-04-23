<template>
	<aside class="infoPanel">
		<!-- Банк -->
		<section v-if="!stealthMode" class="section">
			<h3 class="label">Банк</h3>
			<span class="pot">{{ formatMoney(store.gameState.totalPot) }} ₽</span>
		</section>

		<!-- Призовые -->
		<section v-if="!stealthMode" class="section">
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
		<section v-if="!stealthMode" class="section">
			<h3 class="label">Курс фишки</h3>
			<PokerChipRate variant="column" />
		</section>

		<!-- Ребай-статус -->
		<section v-if="rebuyStatusText" class="section rebuySection">
			<div class="rebuyStatus" :class="rebuyStatusClass">
				<span class="rebuyLabel">{{ rebuyLabel }}</span>
				<span v-if="rebuyTimer" class="rebuyTimer">{{ rebuyTimer }}</span>
			</div>
		</section>

		<!-- Кнопки управления -->
		<div class="actions">
			<span v-if="store.gameState.blindsPending" class="nextDealHint">
				⏳ Новый уровень: {{ store.nextBlinds.sb }} / {{ store.nextBlinds.bb }}
			</span>
			<button
				class="poker-btn-green nextDeal"
				:class="{ 'nextDealPending': store.gameState.blindsPending }"
				@click="$emit('nextDeal')"
			>
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

defineProps<{
	stealthMode: boolean
}>()

defineEmits<{
	nextDeal: []
	finish: []
}>()

// Статус ребаев / add-on — разделяем на текст и таймер
const rebuyStatusText = computed(() => {
	if (store.gameState.status === 'idle' || store.gameState.status === 'finished') return null

	if (store.isRebuyPeriod) return 'rebuy'

	// Аддон обрабатывается модалкой — в панели не показываем
	if (store.isAddOnAvailable) return 'done'

	return 'done'
})

const rebuyLabel = computed(() => {
	if (rebuyStatusText.value === 'rebuy') return 'Add-on через'
	return 'Дозакупки завершены'
})

const rebuyTimer = computed(() => {
	if (rebuyStatusText.value !== 'rebuy') return null
	const remaining = store.rebuyPeriodSeconds - store.gameState.elapsedSeconds
	const m = Math.floor(remaining / 60)
	const s = remaining % 60
	return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const rebuyStatusClass = computed(() => {
	if (store.isRebuyPeriod) return 'rebuyStatusActive'
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
	font-size: 1rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: var(--poker-text-muted);
}

/* Ребай-статус */
.rebuySection {
	gap: 0;
}

.rebuyStatus {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	padding: 14px 16px;
	border-radius: var(--poker-radius);
	text-align: center;
}

.rebuyLabel {
	font-size: 1.1rem;
	font-weight: 800;
	text-transform: uppercase;
	letter-spacing: 0.06em;
}

.rebuyTimer {
	font-family: var(--poker-font-mono);
	font-size: 2rem;
	font-weight: 900;
	line-height: 1;
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
	font-size: 1.05rem;
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
	font-size: 1.25rem;
	font-weight: 700;
	color: var(--poker-text);
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
}

.nextDealPending {
	animation: nextDealPulse 1.4s ease-in-out infinite;
	box-shadow: 0 0 24px rgb(93 255 186 / 60%), 0 0 48px rgb(93 255 186 / 30%);
}

@keyframes nextDealPulse {
	0%, 100% { box-shadow: 0 0 24px rgb(93 255 186 / 60%), 0 0 48px rgb(93 255 186 / 30%); }
	50% { box-shadow: 0 0 32px rgb(93 255 186 / 90%), 0 0 64px rgb(93 255 186 / 50%); }
}

.nextDealHint {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	padding: 8px 12px;
	font-size: 1rem;
	font-weight: 700;
	color: #5dffba;
	background: rgb(93 255 186 / 12%);
	border: 1px solid rgb(93 255 186 / 30%);
	border-radius: var(--poker-radius);
	letter-spacing: 0.02em;
}

.finish {
	padding: 10px 14px;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 1rem;
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
