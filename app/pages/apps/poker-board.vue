<template>
	<div class="poker-page">
		<ClientOnly>
			<PokerSetupModal
				v-if="showSetup"
				@start="onTournamentStart"
				@close="onClose"
			/>

			<PokerBoard
				v-else-if="isGameActive"
				@back="onBack"
				@finished="onGameFinished"
			/>

			<div v-else class="poker-start">
				<h1 class="poker-start__title">🃏 Poker Tournament</h1>
				<p class="poker-start__desc">Настрой турнир и начинай игру</p>
				<button class="poker-start__btn" @click="showSetup = true">
					🚀 Новый турнир
				</button>
			</div>

			<!-- Модалка восстановления сохранённой игры -->
			<PokerConfirmModal
				v-if="showRestoreModal"
				:message="restoreMessage"
				confirm-text="Продолжить"
				cancel-text="Начать новую"
				variant="primary"
				@confirm="onRestore"
				@cancel="onDeclineRestore"
			/>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
import type { PokerConfig, PokerPlayer, PokerSaveData } from '~/types/poker'
import PokerSetupModal from '~/components/apps/poker-board/PokerSetupModal.vue'
import PokerBoard from '~/components/apps/poker-board/PokerBoard.vue'
import PokerConfirmModal from '~/components/apps/poker-board/PokerConfirmModal.vue'

definePageMeta({
	layout: false,
})

const store = usePokerStore()
const showSetup = ref(false)
const showRestoreModal = ref(false)
const savedData = ref<PokerSaveData | null>(null)

const isGameActive = computed(() =>
	store.gameState.status === 'playing' || store.gameState.status === 'paused',
)

const restoreMessage = computed(() => {
	if (!savedData.value) return ''
	const date = new Date(savedData.value.savedAt)
	const formatted = date.toLocaleString('ru-RU', {
		day: 'numeric',
		month: 'long',
		hour: '2-digit',
		minute: '2-digit',
	})
	const playerCount = savedData.value.gameState.players.length
	const activePlayers = savedData.value.gameState.players.filter(p => !p.isEliminated).length
	return `Обнаружена незавершённая игра (${formatted}, ${playerCount} игроков, ${activePlayers} активных). Продолжить?`
})

// Проверка localStorage при загрузке страницы
onMounted(() => {
	const storage = usePokerStorage()
	const data = storage.load()
	if (data) {
		savedData.value = data
		showRestoreModal.value = true
	}
	else {
		showSetup.value = true
	}
})

const onRestore = () => {
	if (savedData.value) {
		store.restoreState(savedData.value.config, savedData.value.gameState)
		savedData.value = null
		showRestoreModal.value = false
		showSetup.value = false
	}
}

const onDeclineRestore = () => {
	const storage = usePokerStorage()
	storage.clear()
	savedData.value = null
	showRestoreModal.value = false
	showSetup.value = true
}

const onTournamentStart = (config: PokerConfig, players: PokerPlayer[]) => {
	store.initGame(config, players)
	showSetup.value = false
}

const onClose = () => {
	navigateTo('/')
}

const onBack = () => {
	if (isGameActive.value) {
		store.pause()
	}
	navigateTo('/')
}

const onGameFinished = () => {
	const storage = usePokerStorage()
	storage.clear()
}
</script>

<style scoped>
.poker-page {
	--poker-bg: #0D1117;
	--poker-bg-surface: #1A1D23;
	--poker-bg-card: #21252D;
	--poker-bg-input: #2D333B;
	--poker-green: #10B981;
	--poker-green-hover: #059669;
	--poker-green-dim: rgb(16 185 129 / 15%);
	--poker-gold: #F59E0B;
	--poker-gold-hover: #D97706;
	--poker-gold-dim: rgb(245 158 11 / 15%);
	--poker-text: #F9FAFB;
	--poker-text-secondary: #D1D5DB;
	--poker-text-muted: #9CA3AF;
	--poker-red: #EF4444;
	--poker-red-dim: rgb(239 68 68 / 15%);
	--poker-border: rgb(255 255 255 / 8%);
	--poker-border-hover: rgb(255 255 255 / 16%);
	--poker-radius: 12px;
	--poker-radius-sm: 8px;
	--poker-font-mono: 'Courier New', monospace;

	width: 100vw;
	height: 100vh;
	overflow: hidden;
	background: var(--poker-bg);
	color: var(--poker-text);
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	display: flex;
	align-items: center;
	justify-content: center;
}

.poker-start {
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
}

.poker-start__title {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 3rem;
	font-weight: 800;
	letter-spacing: -0.02em;
	color: var(--poker-green);
}

.poker-start__desc {
	font-size: 1.125rem;
	color: var(--poker-text-muted);
}

.poker-start__btn {
	margin-top: 8px;
	padding: 16px 40px;
	font-size: 1.25rem;
	font-weight: 700;
	border: none;
	border-radius: var(--poker-radius);
	background: var(--poker-green);
	color: #fff;
	cursor: pointer;
	transition: background 0.2s, transform 0.15s;
}

.poker-start__btn:hover {
	background: var(--poker-green-hover);
	transform: translateY(-1px);
}

.poker-start__btn:active {
	transform: translateY(0);
}
</style>
