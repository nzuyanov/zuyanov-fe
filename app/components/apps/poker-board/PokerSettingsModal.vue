<template>
	<Teleport to="body">
		<div class="overlay poker-shimmer-overlay" @click.self="$emit('close')">
			<div class="modal">
				<header class="header">
					<h2 class="title">⚙️ Настройки игры</h2>
					<button class="closeBtn" @click="$emit('close')">
						<Icon name="ph:x-bold" />
					</button>
				</header>

				<div class="body">
					<!-- Блайнды -->
					<section class="section">
						<h3 class="sectionTitle">Уровень блайндов</h3>
						<div class="blindsInfo">
							<span class="blindsLabel">Текущий уровень:</span>
							<span class="blindsValue">{{ store.currentBlinds.sb }} / {{ store.currentBlinds.bb }}</span>
							<span class="blindsLevel">({{ store.gameState.currentBlindLevel + 1 }} из {{ store.allBlindLevels.length }})</span>
						</div>
						<div class="actions">
							<button
								class="actionBtn"
								:disabled="store.gameState.currentBlindLevel <= 0"
								@click="handleRevertBlinds"
							>
								<Icon name="ph:arrow-down-bold" />
								Понизить блайнды
							</button>
							<button
								class="actionBtn"
								:disabled="store.gameState.currentBlindLevel >= store.allBlindLevels.length - 1"
								@click="handleAdvanceBlinds"
							>
								<Icon name="ph:arrow-up-bold" />
								Повысить блайнды
							</button>
						</div>
					</section>

					<!-- Аддон -->
					<section v-if="store.isRebuyPeriod" class="section">
						<h3 class="sectionTitle">Ребай-период</h3>
						<div class="actions">
							<button class="actionBtn actionBtnGold" @click="handleSkipToAddOn">
								<Icon name="ph:fast-forward-fill" />
								Перейти к аддонам
							</button>
						</div>
					</section>

					<!-- Отмена выбывания -->
					<section v-if="eliminatedPlayers.length > 0" class="section">
						<h3 class="sectionTitle">Отменить выбывание</h3>
						<div class="playerList">
							<button
								v-for="player in eliminatedPlayers"
								:key="player.id"
								class="playerBtn"
								@click="handleUndoElimination(player.id)"
							>
								<img
									:src="getAvatarDataUri(player.avatarId, player.gender, player.avatarBackground)"
									alt=""
									class="playerAvatar"
								>
								<span class="playerName">{{ player.name }}</span>
								<span class="playerAction">Вернуть</span>
							</button>
						</div>
					</section>

					<!-- Отмена ребая -->
					<section v-if="playersWithRebuys.length > 0" class="section">
						<h3 class="sectionTitle">Отменить ребай / аддон</h3>
						<div class="playerList">
							<button
								v-for="player in playersWithRebuys"
								:key="player.id"
								class="playerBtn"
								@click="handleUndoRebuy(player.id)"
							>
								<img
									:src="getAvatarDataUri(player.avatarId, player.gender, player.avatarBackground)"
									alt=""
									class="playerAvatar"
								>
								<div class="playerInfo">
									<span class="playerName">{{ player.name }}</span>
									<span class="playerMeta">
										<template v-if="player.addOnUsed">Add-on</template>
										<template v-else>Ребаев: {{ player.rebuysUsed }}</template>
									</span>
								</div>
								<span class="playerAction playerActionDanger">Отменить</span>
							</button>
						</div>
					</section>

					<!-- Пустое состояние для отмен -->
					<section v-if="eliminatedPlayers.length === 0 && playersWithRebuys.length === 0" class="section sectionEmpty">
						<p class="emptyText">Нет действий для отмены 👌</p>
					</section>

				</div>
			</div>
		</div></Teleport>
</template>

<script setup lang="ts">
const emit = defineEmits<{
	close: []
	skipToAddOn: []
}>()

const store = usePokerStore()
const storage = usePokerStorage()
const { getAvatarDataUri } = usePokerAvatars()

const eliminatedPlayers = computed(() =>
	store.gameState.players
		.filter(p => p.isEliminated)
		.sort((a, b) => (b.eliminationOrder ?? 0) - (a.eliminationOrder ?? 0)),
)

const playersWithRebuys = computed(() =>
	store.gameState.players.filter(p => !p.isEliminated && (p.rebuysUsed > 0 || p.addOnUsed)),
)

const handleAdvanceBlinds = () => {
	store.advanceBlinds()
	storage.saveOnAction()
}

const handleRevertBlinds = () => {
	store.revertBlinds()
	storage.saveOnAction()
}

const handleSkipToAddOn = () => {
	store.skipToAddOn()
	storage.saveOnAction()
	emit('skipToAddOn')
}

const handleUndoElimination = (playerId: number) => {
	store.undoElimination(playerId)
	storage.saveOnAction()
}

const handleUndoRebuy = (playerId: number) => {
	store.undoRebuy(playerId)
	storage.saveOnAction()
}
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
	gap: 0;
	max-width: 620px;
	width: 100%;
	max-height: 80vh;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	background: var(--poker-bg-card, #21252D);
	border: 1px solid var(--poker-border, rgb(255 255 255 / 8%));
	border-radius: var(--poker-radius, 12px);
	box-shadow: 0 16px 48px rgb(0 0 0 / 50%);
}

.body {
	overflow-y: auto;
}

.body::-webkit-scrollbar {
	width: 6px;
}

.body::-webkit-scrollbar-track {
	background: transparent;
}

.body::-webkit-scrollbar-thumb {
	background: rgb(255 255 255 / 15%);
	border-radius: 3px;
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px 24px;
	border-bottom: 1px solid var(--poker-border);
}

.title {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.6rem;
	font-weight: 800;
	color: var(--poker-text);
}

.closeBtn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 44px;
	height: 44px;
	font-size: 1.3rem;
	color: var(--poker-text-muted);
	background: none;
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius-sm);
	cursor: pointer;
	transition: color 0.2s, border-color 0.2s;
}

.closeBtn:hover {
	color: var(--poker-text);
	border-color: var(--poker-border-hover);
}

/* Секции */
.section {
	padding: 20px 24px;
	border-bottom: 1px solid var(--poker-border);
}

.section:last-child {
	border-bottom: none;
}

.sectionTitle {
	font-size: 1.05rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: var(--poker-text-muted);
	margin-bottom: 12px;
}

.sectionEmpty {
	text-align: center;
}

.emptyText {
	font-size: 1.1rem;
	color: var(--poker-text-muted);
}

/* Блайнды */
.blindsInfo {
	display: flex;
	align-items: baseline;
	gap: 8px;
	margin-bottom: 14px;
}

.blindsLabel {
	font-size: 1.05rem;
	color: var(--poker-text-secondary);
}

.blindsValue {
	font-size: 1.35rem;
	font-weight: 800;
	color: var(--poker-green);
}

.blindsLevel {
	font-size: 1rem;
	color: var(--poker-text-muted);
}

/* Кнопки действий */
.actions {
	display: flex;
	gap: 10px;
}

.actionBtn {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	padding: 12px 16px;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 1.05rem;
	font-weight: 700;
	color: var(--poker-text);
	background: var(--poker-bg-input, #2D333B);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius-sm);
	cursor: pointer;
	transition: background 0.2s, border-color 0.2s, transform 0.15s;
}

.actionBtn:hover:not(:disabled) {
	background: var(--poker-bg-elevated);
	border-color: var(--poker-border-hover);
}

.actionBtn:active:not(:disabled) {
	transform: scale(0.97);
}

.actionBtn:disabled {
	opacity: 0.35;
	cursor: not-allowed;
}

.actionBtnGold {
	color: #000;
	background: var(--poker-gold);
	border-color: var(--poker-gold);
}

.actionBtnGold:hover:not(:disabled) {
	background: #d4910e;
	border-color: #d4910e;
}

/* Список игроков */
.playerList {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.playerBtn {
	display: flex;
	align-items: center;
	gap: 12px;
	width: 100%;
	padding: 10px 14px;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	background: var(--poker-bg-input, #2D333B);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius-sm);
	cursor: pointer;
	transition: background 0.2s, border-color 0.2s;
}

.playerBtn:hover {
	background: var(--poker-bg-elevated);
	border-color: var(--poker-border-hover);
}

.playerAvatar {
	width: 44px;
	height: 44px;
	border-radius: 50%;
	flex-shrink: 0;
}

.playerInfo {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 2px;
	flex: 1;
	min-width: 0;
}

.playerName {
	font-size: 1.1rem;
	font-weight: 700;
	color: var(--poker-text);
	flex: 1;
	text-align: left;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.playerMeta {
	font-size: 0.95rem;
	color: var(--poker-text-muted);
}

.playerAction {
	font-size: 0.95rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	color: var(--poker-green);
	padding: 4px 12px;
	background: var(--poker-green-dim);
	border-radius: 9999px;
	flex-shrink: 0;
}

.playerActionDanger {
	color: var(--poker-red, #EF4444);
	background: rgb(239 68 68 / 12%);
}

</style>
