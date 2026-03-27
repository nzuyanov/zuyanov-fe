<template>
	<div class="poker-page">
		<!-- Заглушка для маленьких экранов -->
		<div v-if="isScreenTooSmall" class="poker-resolution-stub">
			<div class="poker-resolution-stub__content">
				<span class="poker-resolution-stub__icon">🖥️</span>
				<h1 class="poker-resolution-stub__title">Нужен экран побольше</h1>
				<p class="poker-resolution-stub__desc">
					Покерная доска рассчитана на экраны с разрешением от 1280×720 (HD).
					Подключи монитор или телевизор побольше 📺
				</p>
				<NuxtLink to="/tlp" class="poker-resolution-stub__btn">
					← Вернуться
				</NuxtLink>
			</div>
		</div>

		<ClientOnly v-else>
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

			<PokerResults
				v-else-if="showResults"
				@new-game="onNewGame"
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
import { POKER_BOARD_TITLE, POKER_BOARD_DESCRIPTION, POKER_BOARD_IMAGE } from '~/constants/meta'
import PokerSetupModal from '~/components/apps/poker-board/PokerSetupModal.vue'
import PokerBoard from '~/components/apps/poker-board/PokerBoard.vue'
import PokerResults from '~/components/apps/poker-board/PokerResults.vue'
import PokerConfirmModal from '~/components/apps/poker-board/PokerConfirmModal.vue'

definePageMeta({
	layout: false,
})

useHead({
	title: `${POKER_BOARD_TITLE} — ${POKER_BOARD_DESCRIPTION}`,
})

useSeoMeta({
	description: POKER_BOARD_DESCRIPTION,
	ogTitle: `${POKER_BOARD_TITLE} — ${POKER_BOARD_DESCRIPTION}`,
	ogDescription: POKER_BOARD_DESCRIPTION,
	ogImage: POKER_BOARD_IMAGE,
	ogType: 'website',
	ogLocale: 'ru_RU',
	twitterCard: 'summary_large_image',
	twitterTitle: `${POKER_BOARD_TITLE} — ${POKER_BOARD_DESCRIPTION}`,
	twitterDescription: POKER_BOARD_DESCRIPTION,
	twitterImage: POKER_BOARD_IMAGE,
})

// Проверка разрешения экрана (минимум Full HD)
const isScreenTooSmall = ref(false)

const checkScreenSize = () => {
	isScreenTooSmall.value = window.innerWidth < 1280 || window.innerHeight < 720
}

onMounted(() => {
	checkScreenSize()
	window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
	window.removeEventListener('resize', checkScreenSize)
})

const store = usePokerStore()
const showSetup = ref(false)
const showResults = ref(false)
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
	const name = savedData.value.config.name || 'Турнир'
	const playerCount = savedData.value.gameState.players.length
	const activePlayers = savedData.value.gameState.players.filter(p => !p.isEliminated).length
	return `Обнаружена незавершённая игра «${name}» (${formatted}, ${playerCount} игроков, ${activePlayers} активных). Продолжить?`
})

// Проверка localStorage при загрузке страницы!
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

const onTournamentStart = (players: PokerPlayer[]) => {
	store.initGame(players)
	showSetup.value = false
}

const onClose = () => {
	navigateTo('/tlp')
}

const onBack = () => {
	navigateTo('/tlp')
}

const onGameFinished = () => {
	const storage = usePokerStorage()
	storage.clear()
	showResults.value = true
}

const onNewGame = () => {
	store.reset()
	showResults.value = false
	showSetup.value = true
}
</script>

<style>
/* Покерные переменные на :root для доступа из Teleport-модалок */
:root {
	--poker-bg: #0D1117;
	--poker-bg-surface: #1A1D23;
	--poker-bg-card: #21252D;
	--poker-bg-input: #2D333B;
	--poker-bg-input-hover: #242930;
	--poker-green: #10B981;
	--poker-green-hover: #059669;
	--poker-green-dim: rgb(16 185 129 / 15%);
	--poker-blue: #3B82F6;
	--poker-blue-hover: #2563EB;
	--poker-blue-bg: rgba(59, 130, 246, 0.1);
	--poker-gold: #F59E0B;
	--poker-gold-hover: #D97706;
	--poker-gold-dim: rgb(245 158 11 / 15%);
	--poker-text: #F9FAFB;
	--poker-text-secondary: #D1D5DB;
	--poker-text-muted: #9CA3AF;
	--poker-red: #EF4444;
	--poker-red-hover: #DC2626;
	--poker-red-dim: rgb(239 68 68 / 15%);
	--poker-border: rgb(255 255 255 / 8%);
	--poker-border-hover: rgb(255 255 255 / 16%);
	--poker-radius: 12px;
	--poker-radius-sm: 8px;
	--poker-font-mono: 'Courier New', monospace;
	--overlay-gradient: linear-gradient(45deg, hsl(315deg 94% 42%) 0%, hsl(310deg 64% 48%) 5%, hsl(300deg 51% 51%) 10%, hsl(288deg 59% 58%) 14%, hsl(275deg 68% 63%) 19%, hsl(262deg 79% 69%) 24%, hsl(249deg 93% 73%) 29%, hsl(234deg 100% 74%) 33%, hsl(222deg 100% 70%) 38%, hsl(213deg 100% 65%) 43%, hsl(204deg 100% 57%) 48%, hsl(199deg 100% 50%) 52%, hsl(196deg 100% 50%) 57%, hsl(195deg 100% 50%) 62%, hsl(193deg 100% 50%) 67%, hsl(191deg 100% 50%) 71%, hsl(189deg 100% 50%) 76%, hsl(188deg 100% 50%) 81%, hsl(186deg 100% 50%) 86%, hsl(185deg 100% 50%) 90%, hsl(183deg 100% 50%) 95%, hsl(183deg 100% 63%) 100%);
}

/* Переливающийся overlay для покерных модалок */

@keyframes poker-shimmer {
	0% {
		background-position: 0% 50%
	}
	50% {
		background-position: 100% 50%
	}
	100% {
		background-position: 0% 50%
	}
}


.poker-shimmer-overlay {
	background:
		radial-gradient(ellipse at 15% 50%, rgb(16 185 129 / 35%) 0%, transparent 50%),
		radial-gradient(ellipse at 85% 20%, rgb(139 92 246 / 30%) 0%, transparent 50%),
		radial-gradient(ellipse at 50% 85%, rgb(56 189 248 / 28%) 0%, transparent 50%),
		radial-gradient(ellipse at 80% 70%, rgb(99 102 241 / 25%) 0%, transparent 45%),
		linear-gradient(
			135deg,
			#050a0e 0%,
			rgb(16 185 129 / 22%) 20%,
			#070c12 35%,
			rgb(139 92 246 / 20%) 50%,
			#050a0e 65%,
			rgb(56 189 248 / 18%) 80%,
			#070c12 100%
		);
	background-size: 400% 400%;
	animation: poker-shimmer 12s ease infinite;
}
</style>

<style scoped>
.poker-page {
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
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
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

/* Заглушка для маленьких экранов */
.poker-resolution-stub {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 32px;
}

.poker-resolution-stub__content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
	max-width: 480px;
	text-align: center;
}

.poker-resolution-stub__icon {
	font-size: 4rem;
	line-height: 1;
}

.poker-resolution-stub__title {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 2rem;
	font-weight: 800;
	color: var(--poker-text);
	letter-spacing: -0.02em;
}

.poker-resolution-stub__desc {
	font-size: 1.125rem;
	color: var(--poker-text-muted);
	line-height: 1.6;
}

.poker-resolution-stub__btn {
	margin-top: 8px;
	padding: 12px 32px;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1rem;
	font-weight: 700;
	border: none;
	border-radius: var(--poker-radius);
	background: var(--poker-green);
	color: #fff;
	text-decoration: none;
	cursor: pointer;
	transition: background 0.2s, transform 0.15s;
}

.poker-resolution-stub__btn:hover {
	background: var(--poker-green-hover);
	transform: translateY(-1px);
}
</style>
