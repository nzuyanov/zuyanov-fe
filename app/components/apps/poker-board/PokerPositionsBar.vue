<template>
	<footer class="positions-bar">
		<Transition name="position-swap" mode="out-in">
			<div v-if="store.dealerPlayer" :key="store.dealerPlayer.id" class="positions-bar__item">
				<img src="~/assets/icons/poker/chip-dealer.svg" alt="D" class="positions-bar__chip">
				<span class="positions-bar__name">{{ store.dealerPlayer.name }}</span>
			</div>
		</Transition>
		<Transition name="position-swap" mode="out-in">
			<div v-if="store.sbPlayer" :key="store.sbPlayer.id" class="positions-bar__item">
				<img src="~/assets/icons/poker/chip-sb.svg" alt="SB" class="positions-bar__chip">
				<span class="positions-bar__name">{{ store.sbPlayer.name }}</span>
			</div>
		</Transition>
		<Transition name="position-swap" mode="out-in">
			<div v-if="store.bbPlayer" :key="store.bbPlayer.id" class="positions-bar__item">
				<img src="~/assets/icons/poker/chip-bb.svg" alt="BB" class="positions-bar__chip">
				<span class="positions-bar__name">{{ store.bbPlayer.name }}</span>
			</div>
		</Transition>
	</footer>
</template>

<script setup lang="ts">
const store = usePokerStore()
</script>

<style scoped>
.positions-bar {
	display: flex;
	align-items: center;
	gap: 32px;
	padding: 10px 24px;
	background: var(--poker-bg-surface);
	border-top: 1px solid var(--poker-border);
	flex-shrink: 0;
}

.positions-bar__item {
	display: flex;
	align-items: center;
	gap: 10px;
}

.positions-bar__chip {
	width: 32px;
	height: 32px;
	flex-shrink: 0;
	filter: drop-shadow(0 1px 3px rgb(0 0 0 / 40%));
}

.positions-bar__name {
	font-size: 0.9rem;
	font-weight: 600;
	color: var(--poker-text-secondary);
}

/* Анимация смены позиций */
.position-swap-enter-active {
	transition: opacity 0.25s ease, transform 0.25s ease;
}

.position-swap-leave-active {
	transition: opacity 0.15s ease, transform 0.15s ease;
}

.position-swap-enter-from {
	opacity: 0;
	transform: translateY(8px);
}

.position-swap-leave-to {
	opacity: 0;
	transform: translateY(-8px);
}
</style>
