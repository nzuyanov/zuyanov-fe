<template>
	<header class="poker-header">
		<button class="poker-header__back" @click="$emit('back')">
			<Icon name="ph:arrow-left-bold" />
			<span>Назад</span>
		</button>

		<h1 class="poker-header__title">
			<span class="poker-header__title-text">{{ title }}</span>
			<span v-if="handNumber > 0" class="poker-header__hand">
				•&nbsp;&nbsp;Раздача #{{ handNumber }}
			</span>
		</h1>

		<span v-if="stage" class="poker-header__stage" :class="`poker-header__stage--${stage}`">
			{{ stageLabel }}
		</span>

		<div class="poker-header__controls">
			<button
				class="poker-header__btn"
				:class="{ 'poker-header__btn--active': !isPaused }"
				@click="$emit('togglePause')"
			>
				<Icon :name="isPaused ? 'ph:play-fill' : 'ph:pause-fill'" />
			</button>
			<button
				class="poker-header__btn"
				:class="{ 'poker-header__btn--active': !isMuted }"
				@click="$emit('toggleSound')"
			>
				<Icon :name="isMuted ? 'ph:speaker-slash-fill' : 'ph:speaker-high-fill'" />
			</button>
		</div>
	</header>
</template>

<script setup lang="ts">
import type { TournamentStage } from '~/types/poker'

const props = defineProps<{
	title: string
	isPaused: boolean
	isMuted: boolean
	handNumber: number
	stage: TournamentStage | null
}>()

defineEmits<{
	back: []
	togglePause: []
	toggleSound: []
}>()

const STAGE_LABELS: Record<TournamentStage, string> = {
	'early': 'Ранняя стадия',
	'middle': 'Средняя стадия',
	'bubble': '🔴 Баббл!',
	'in-prizes': 'В призах',
	'final-table': '🏆 Финальный стол',
	'heads-up': 'Хедз-ап',
}

const stageLabel = computed(() => props.stage ? STAGE_LABELS[props.stage] : '')
</script>

<style scoped>
.poker-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 24px;
	background: var(--poker-bg-surface);
	border-bottom: 1px solid var(--poker-border);
	flex-shrink: 0;
}

.poker-header__back {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 16px;
	font-size: 0.9rem;
	font-weight: 600;
	color: var(--poker-text-secondary);
	background: none;
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius-sm);
	cursor: pointer;
	transition: color 0.2s, border-color 0.2s;
}

.poker-header__back:hover {
	color: var(--poker-text);
	border-color: var(--poker-border-hover);
}

.poker-header__title {
	display: flex;
	align-items: center;
	gap: 12px;
}

.poker-header__title-text {
	font-family: Neoneon, var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 2rem;
	font-weight: normal;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--poker-green);
	text-shadow:
		0 0 7px var(--poker-green),
		0 0 20px var(--poker-green),
		0 0 40px var(--poker-green),
		0 0 80px var(--poker-green);
	animation: neon-flicker 4s ease-in-out infinite;
}

@keyframes neon-flicker {
	0%, 100% {
		text-shadow:
			0 0 7px var(--poker-green),
			0 0 20px var(--poker-green),
			0 0 40px var(--poker-green),
			0 0 80px var(--poker-green);
		opacity: 1;
	}

	50% {
		text-shadow:
			0 0 4px var(--poker-green),
			0 0 12px var(--poker-green),
			0 0 28px var(--poker-green),
			0 0 55px var(--poker-green);
		opacity: 0.92;
	}
}

.poker-header__hand {
	font-family: var(--poker-font-mono);
	font-size: 0.85rem;
	font-weight: normal;
	color: var(--poker-text-muted);
	letter-spacing: 0;
	text-transform: none;
	text-shadow: none;
	animation: none;
}

/* Бейдж стадии турнира */
.poker-header__stage {
	padding: 6px 14px;
	font-size: 0.8rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	border-radius: var(--poker-radius-sm);
	white-space: nowrap;
}

.poker-header__stage--early {
	background: var(--poker-green-dim);
	color: var(--poker-green);
}

.poker-header__stage--middle {
	background: var(--poker-gold-dim);
	color: var(--poker-gold);
}

.poker-header__stage--bubble {
	background: var(--poker-red-dim);
	color: var(--poker-red);
	animation: bubble-pulse 1s ease-in-out infinite;
}

.poker-header__stage--in-prizes {
	background: rgb(133 183 235 / 15%);
	color: #85b7eb;
}

.poker-header__stage--final-table {
	background: var(--poker-gold-dim);
	color: var(--poker-gold);
}

.poker-header__stage--heads-up {
	background: var(--poker-red-dim);
	color: var(--poker-red);
}

@keyframes bubble-pulse {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.6; }
}

.poker-header__controls {
	display: flex;
	gap: 8px;
}

.poker-header__btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 44px;
	height: 44px;
	font-size: 1.25rem;
	color: var(--poker-text-muted);
	background: var(--poker-bg-card);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius-sm);
	cursor: pointer;
	transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.poker-header__btn:hover {
	color: var(--poker-text);
	border-color: var(--poker-border-hover);
}

.poker-header__btn--active {
	color: var(--poker-green);
	border-color: var(--poker-green);
	background: var(--poker-green-dim);
}
</style>
