<template>
	<header class="poker-header">
		<button class="poker-header__back" @click="$emit('back')">
			<Icon name="ph:arrow-left-bold" />
			<span>Назад</span>
		</button>

		<h1 class="poker-header__title">🃏 Poker Tournament</h1>

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
defineProps<{
	isPaused: boolean
	isMuted: boolean
}>()

defineEmits<{
	back: []
	togglePause: []
	toggleSound: []
}>()
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
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.5rem;
	font-weight: 800;
	letter-spacing: 0.04em;
	text-transform: uppercase;
	color: var(--poker-green);
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
