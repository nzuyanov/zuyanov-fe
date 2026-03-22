<template>
	<footer class="positions-bar">
		<div v-if="store.dealerPlayer" class="positions-bar__item positions-bar__item--dealer">
			<span class="positions-bar__badge">D</span>
			<span class="positions-bar__name">{{ store.dealerPlayer.name }}</span>
		</div>
		<div v-if="store.sbPlayer" class="positions-bar__item positions-bar__item--sb">
			<span class="positions-bar__badge">SB</span>
			<span class="positions-bar__name">{{ store.sbPlayer.name }}</span>
		</div>
		<div v-if="store.bbPlayer" class="positions-bar__item positions-bar__item--bb">
			<span class="positions-bar__badge">BB</span>
			<span class="positions-bar__name">{{ store.bbPlayer.name }}</span>
		</div>
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
	gap: 8px;
}

.positions-bar__badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 28px;
	height: 22px;
	padding: 0 6px;
	font-size: 0.7rem;
	font-weight: 800;
	letter-spacing: 0.05em;
	border-radius: 4px;
	text-transform: uppercase;
}

.positions-bar__item--dealer .positions-bar__badge {
	background: var(--poker-gold);
	color: #000;
}

.positions-bar__item--sb .positions-bar__badge {
	background: var(--poker-green);
	color: #000;
}

.positions-bar__item--bb .positions-bar__badge {
	background: var(--poker-red);
	color: #fff;
}

.positions-bar__name {
	font-size: 0.9rem;
	font-weight: 600;
	color: var(--poker-text-secondary);
}
</style>
