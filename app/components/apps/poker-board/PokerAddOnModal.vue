<template>
	<Teleport to="body">
		<div class="overlay poker-shimmer-overlay">
			<div class="modal">
				<h2 class="title">🔄 Ребай-период завершён</h2>
				<p class="subtitle">Выбери игроков, которые хотят сделать Add-on</p>

				<!-- Сетка игроков -->
				<div class="playersGrid">
					<button
						v-for="player in allPlayers"
						:key="player.id"
						class="playerCard"
						:class="{
							'playerCardActive': player.addOnUsed,
							'playerCardEliminated': player.isEliminated && !player.addOnUsed,
						}"
						@click="toggleAddOn(player.id)"
					>
						<img
							:src="getAvatarDataUri(player.avatarId, player.gender, player.avatarBackground)"
							alt=""
							class="avatar"
							:class="{ 'avatarEliminated': player.isEliminated && !player.addOnUsed }"
						>
						<span class="playerName">{{ player.name }}</span>
						<span v-if="player.isEliminated && !player.addOnUsed" class="badge badgeEliminated">Выбыл</span>
						<span v-else-if="player.addOnUsed" class="badge badgeUsed">Add-on ✓</span>
						<span v-else class="badge badgeAvailable">Добавить</span>
					</button>
				</div>

				<!-- Банк крупно -->
				<div class="bankBlock">
					<span class="bankLabel">Банк</span>
					<span class="bankValue">{{ formatMoney(store.gameState.totalPot) }} ₽</span>
				</div>

				<!-- Кнопка продолжить -->
				<button class="poker-btn-green resumeButton" @click="$emit('resume')">
					▶ Продолжить игру
				</button>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
const emit = defineEmits<{
	resume: []
	addOn: [playerId: number]
	undoAddOn: [playerId: number]
}>()

const store = usePokerStore()
const { getAvatarDataUri } = usePokerAvatars()

// Все игроки — включая выбывших (аддон может вернуть в игру)
const allPlayers = computed(() => store.gameState.players)

const toggleAddOn = (playerId: number) => {
	const player = store.gameState.players.find(p => p.id === playerId)
	if (!player) return

	if (player.addOnUsed) {
		emit('undoAddOn', playerId)
	}
	else {
		emit('addOn', playerId)
	}
}

const formatMoney = (value: number): string => value.toLocaleString('ru-RU')
</script>

<style scoped>
.overlay {
	position: fixed;
	inset: 0;
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
	backdrop-filter: blur(6px);
}

.modal {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 24px;
	max-width: 800px;
	width: 100%;
	padding: 36px 40px;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	background: var(--poker-bg-card, #21252D);
	border: 1px solid var(--poker-gold);
	border-radius: var(--poker-radius, 12px);
	box-shadow:
		0 16px 48px rgb(0 0 0 / 50%),
		0 0 30px rgb(245 158 11 / 15%);
}

.title {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.8rem;
	font-weight: 900;
	color: var(--poker-gold);
	text-align: center;
	line-height: 1.2;
}

.subtitle {
	font-size: 1.25rem;
	font-weight: 600;
	color: var(--poker-text-muted);
	text-align: center;
	margin-top: -12px;
}

/* Сетка игроков */
.playersGrid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	gap: 10px;
	width: 100%;
	max-height: 360px;
	overflow-y: auto;
}

.playersGrid::-webkit-scrollbar {
	width: 6px;
}

.playersGrid::-webkit-scrollbar-track {
	background: transparent;
}

.playersGrid::-webkit-scrollbar-thumb {
	background: rgb(255 255 255 / 15%);
	border-radius: 3px;
}

.playerCard {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	padding: 14px 10px;
	background: var(--poker-bg-input, #2D333B);
	border: 2px solid var(--poker-border, rgb(255 255 255 / 8%));
	border-radius: var(--poker-radius-sm, 8px);
	cursor: pointer;
	transition: border-color 0.2s, background 0.2s;
}

.playerCard:hover {
	background: var(--poker-bg-elevated, #2C2C32);
	border-color: var(--poker-gold-dim, rgb(245 158 11 / 30%));
}

.playerCardActive {
	border-color: var(--poker-gold);
	background: var(--poker-gold-dim, rgb(245 158 11 / 15%));
}

.playerCardActive:hover {
	border-color: var(--poker-gold);
	cursor: default;
}

.avatar {
	width: 64px;
	height: 64px;
	border-radius: 50%;
	background: var(--poker-bg-input);
}

.playerName {
	font-size: 1.1rem;
	font-weight: 700;
	color: var(--poker-text);
	text-align: center;
	line-height: 1.2;
	word-break: break-word;
}

.badge {
	font-size: 0.95rem;
	font-weight: 700;
	padding: 3px 10px;
	border-radius: 9999px;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	line-height: 1.2;
	min-height: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.badgeAvailable {
	background: rgb(255 255 255 / 8%);
	color: var(--poker-text-muted);
}

.badgeUsed {
	background: var(--poker-gold);
	color: #000;
}

.badgeEliminated {
	background: rgb(239 68 68 / 15%);
	color: var(--poker-red, #EF4444);
}

/* Выбывший игрок */
.playerCardEliminated {
	opacity: 0.5;
}

.playerCardEliminated:hover {
	opacity: 0.8;
}

.avatarEliminated {
	filter: grayscale(1);
}

/* Банк */
.bankBlock {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}

.bankLabel {
	font-size: 1.05rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: var(--poker-text-muted);
}

.bankValue {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 2.4rem;
	font-weight: 900;
	color: var(--poker-gold);
	text-shadow: 0 0 20px rgb(245 158 11 / 25%);
	line-height: 1;
}

/* Кнопка продолжить */
.resumeButton {
	padding: 16px 48px;
}
</style>
