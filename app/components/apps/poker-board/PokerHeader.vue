<template>
	<header class="pokerHeader">
		<button class="back" @click="$emit('back')">
			<Icon name="ph:arrow-left-bold" />
			<span>Назад</span>
		</button>

		<h1 class="title">
			<span class="titleText">{{ title }}</span>
		</h1>

		<div class="controls">
			<button
				class="btn"
				:class="{ 'btnActive': !isPaused }"
				@click="$emit('togglePause')"
			>
				<Icon :name="isPaused ? 'ph:play-fill' : 'ph:pause-fill'" />
			</button>
			<button
				class="btn"
				:class="{ 'btnActive': !isMuted }"
				@click="$emit('toggleSound')"
			>
				<Icon :name="isMuted ? 'ph:speaker-slash-fill' : 'ph:speaker-high-fill'" />
			</button>
			<button
				class="btn"
				@click="$emit('openSettings')"
			>
				<Icon name="ph:gear-six-fill" />
			</button>
		</div>
	</header>
</template>

<script setup lang="ts">
defineProps<{
	title: string
	isPaused: boolean
	isMuted: boolean
}>()

defineEmits<{
	back: []
	togglePause: []
	toggleSound: []
	openSettings: []
}>()
</script>

<style scoped>
.pokerHeader {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 24px;
	background: var(--poker-bg-surface);
	border-bottom: 1px solid var(--poker-border);
	flex-shrink: 0;
}

.back {
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

.back:hover {
	color: var(--poker-text);
	border-color: var(--poker-border-hover);
}

.title {
	display: flex;
	align-items: center;
	gap: 12px;
}

.titleText {
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
	animation: neonFlicker 4s ease-in-out infinite;
}

@keyframes neonFlicker {
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

.controls {
	display: flex;
	gap: 8px;
}

.btn {
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

.btn:hover {
	color: var(--poker-text);
	border-color: var(--poker-border-hover);
}

.btnActive {
	color: var(--poker-green);
	border-color: var(--poker-green);
	background: var(--poker-green-dim);
}
</style>
