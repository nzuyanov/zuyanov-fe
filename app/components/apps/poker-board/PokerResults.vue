<template>
	<div class="results">
		<h1 class="results__title">🏆 Турнир завершён!</h1>

		<!-- Подиум: 1/2/3 место -->
		<div class="results__podium">
			<div
				v-for="(entry, i) in podium"
				:key="entry.player.id"
				class="results__podium-item"
				:class="`results__podium-item--place-${i + 1}`"
			>
				<span class="results__place-icon">{{ placeIcons[i] }}</span>
				<img
					:src="getAvatarDataUri(entry.player.avatarId)"
					alt=""
					class="results__avatar"
					:class="`results__avatar--place-${i + 1}`"
				>
				<span class="results__name">{{ entry.player.name }}</span>
				<span class="results__prize">
					<template v-if="entry.prize > 0">{{ formatMoney(entry.prize) }} <Icon name="material-symbols:currency-ruble-rounded" class="rub-icon" /></template>
					<template v-else>—</template>
				</span>
				<span class="results__percent">
					{{ entry.percent > 0 ? `${entry.percent}%` : '' }}
				</span>
			</div>
		</div>

		<!-- Остальные игроки -->
		<div v-if="otherPlayers.length > 0" class="results__others">
			<h2 class="results__others-title">Остальные участники</h2>
			<div
				v-for="(player, i) in otherPlayers"
				:key="player.id"
				class="results__others-row"
			>
				<span class="results__others-place">{{ i + 4 }}</span>
				<img
					:src="getAvatarDataUri(player.avatarId)"
					alt=""
					class="results__others-avatar"
				>
				<span class="results__others-name">{{ player.name }}</span>
			</div>
		</div>

		<!-- Статистика -->
		<div class="results__stats">
			<div class="results__stat">
				<span class="results__stat-label">Банк</span>
				<span class="results__stat-value">{{ formatMoney(store.gameState.totalPot) }} <Icon name="material-symbols:currency-ruble-rounded" class="rub-icon" /></span>
			</div>
			<div class="results__stat">
				<span class="results__stat-label">Игроков</span>
				<span class="results__stat-value">{{ store.gameState.players.length }}</span>
			</div>
		</div>

		<button class="results__btn" @click="$emit('newGame')">
			🚀 Новый турнир
		</button>
	</div>
</template>

<script setup lang="ts">
defineEmits<{
	newGame: []
}>()

const store = usePokerStore()
const { getAvatarDataUri } = usePokerAvatars()

const placeIcons = ['🥇', '🥈', '🥉']

const results = computed(() => store.getResults)
const prizeAmounts = computed(() => store.prizeAmounts)

const podium = computed(() => {
	const top = results.value.slice(0, 3)
	return top.map((player, i) => ({
		player,
		prize: prizeAmounts.value[i] ?? 0,
		percent: store.config.prizes[i] ?? 0,
	}))
})

const otherPlayers = computed(() => results.value.slice(3))

const formatMoney = (value: number): string => value.toLocaleString('ru-RU')
</script>

<style scoped>
.results {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 32px;
	width: 100%;
	height: 100%;
	padding: 48px 32px;
	overflow-y: auto;
}

.results__title {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 2.5rem;
	font-weight: 900;
	letter-spacing: -0.02em;
	color: var(--poker-gold);
	text-align: center;
}

/* Подиум */
.results__podium {
	display: flex;
	gap: 24px;
	align-items: flex-end;
	justify-content: center;
}

.results__podium-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	padding: 24px 28px;
	background: var(--poker-bg-card);
	border-radius: var(--poker-radius);
	border: 1px solid var(--poker-border);
	min-width: 180px;
	transition: transform 0.3s;
}

.results__podium-item--place-1 {
	border-color: var(--poker-gold);
	box-shadow: 0 0 24px rgb(245 158 11 / 20%);
	transform: scale(1.08);
	order: 2;
}

.results__podium-item--place-2 {
	border-color: var(--poker-text-muted);
	box-shadow: 0 0 16px rgb(156 163 175 / 10%);
	order: 1;
}

.results__podium-item--place-3 {
	border-color: #CD7F32;
	box-shadow: 0 0 16px rgb(205 127 50 / 10%);
	order: 3;
}

.results__place-icon {
	font-size: 2rem;
}

.results__avatar {
	border-radius: 50%;
	background: var(--poker-bg-input);
}

.results__avatar--place-1 {
	width: 80px;
	height: 80px;
}

.results__avatar--place-2,
.results__avatar--place-3 {
	width: 64px;
	height: 64px;
}

.results__name {
	font-size: 1.1rem;
	font-weight: 700;
	color: var(--poker-text);
	text-align: center;
}

.results__prize {
	font-family: var(--poker-font-mono);
	font-size: 1.2rem;
	font-weight: 800;
	color: var(--poker-green);
}

.results__percent {
	font-family: var(--poker-font-mono);
	font-size: 0.85rem;
	color: var(--poker-text-muted);
}

/* Остальные игроки */
.results__others {
	width: 100%;
	max-width: 500px;
}

.results__others-title {
	font-size: 1rem;
	font-weight: 700;
	color: var(--poker-text-muted);
	margin-bottom: 12px;
	text-align: center;
}

.results__others-row {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 10px 16px;
	border-bottom: 1px solid var(--poker-border);
}

.results__others-row:last-child {
	border-bottom: none;
}

.results__others-place {
	font-family: var(--poker-font-mono);
	font-size: 0.9rem;
	font-weight: 700;
	color: var(--poker-text-muted);
	width: 24px;
	text-align: center;
}

.results__others-avatar {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: var(--poker-bg-input);
}

.results__others-name {
	font-size: 0.95rem;
	font-weight: 600;
	color: var(--poker-text-secondary);
}

/* Статистика */
.results__stats {
	display: flex;
	gap: 32px;
}

.results__stat {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}

.results__stat-label {
	font-size: 0.8rem;
	color: var(--poker-text-muted);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.results__stat-value {
	font-family: var(--poker-font-mono);
	font-size: 1.1rem;
	font-weight: 700;
	color: var(--poker-text);
}

/* Кнопка */
.results__btn {
	margin-top: 8px;
	padding: 16px 40px;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.15rem;
	font-weight: 700;
	border: none;
	border-radius: var(--poker-radius);
	background: var(--poker-green);
	color: #fff;
	cursor: pointer;
	transition: background 0.2s, transform 0.15s;
}

.results__btn:hover {
	background: var(--poker-green-hover);
	transform: translateY(-1px);
}

.results__btn:active {
	transform: translateY(0);
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
