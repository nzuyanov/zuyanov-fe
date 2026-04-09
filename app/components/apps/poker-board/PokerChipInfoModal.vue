<template>
	<Teleport to="body">
		<div class="overlay poker-shimmer-overlay" @click.self="$emit('close')">
			<div class="modal">
				<header class="header">
					<h2 class="title">🎰 Раздача фишек</h2>
					<button class="closeBtn" @click="$emit('close')">
						<Icon name="ph:x-bold" />
					</button>
				</header>

				<div class="body">
					<p class="subtitle">Каждому игроку выдать:</p>
					<div
						v-if="store.gameSetup.chipDistributionPerPlayer.length > 0"
						class="distList"
					>
						<div
							v-for="entry in store.gameSetup.chipDistributionPerPlayer"
							:key="entry.id"
							class="distItem"
						>
							<PokerChip :value="entry.denomination" :color="entry.color" :size="80" />
							<span class="distCount">&times; {{ entry.count }}</span>
						</div>
					</div>

					<div class="totals">
						<div class="totalItem">
							<span class="totalLabel">Фишек</span>
							<span class="totalValue">{{ store.gameSetup.startingChipCount }}</span>
						</div>
						<div class="totalItem">
							<span class="totalLabel">Стек</span>
							<span class="totalValue">{{ store.gameSetup.startingStack.toLocaleString('ru-RU') }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import PokerChip from './PokerChip.vue'

const store = usePokerStore()

defineEmits<{
	close: []
}>()
</script>

<style scoped>
.overlay {
	position: fixed;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 300;
	backdrop-filter: blur(6px);
}

.modal {
	background: var(--poker-bg-card, #21252D);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius);
	width: 700px;
	max-height: 85vh;
	display: flex;
	flex-direction: column;
	box-shadow: 0 16px 64px rgb(0 0 0 / 50%);
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px 28px;
	border-bottom: 1px solid var(--poker-border);
	flex-shrink: 0;
}

.title {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.7rem;
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

.body {
	padding: 28px;
	display: flex;
	flex-direction: column;
	gap: 24px;
}

.subtitle {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.25rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: var(--poker-text-muted);
}

.distList {
	display: flex;
	flex-wrap: wrap;
	gap: 14px;
}

.distItem {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 16px 22px;
	background: var(--poker-bg-input, #2D333B);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius-sm);
	transition: border-color 0.2s;
}

.distItem:hover {
	border-color: var(--poker-border-hover);
}

.distCount {
	font-family: var(--poker-font-mono, 'JetBrains Mono Variable', monospace);
	font-size: 1.8rem;
	font-weight: 800;
	color: var(--poker-text);
	font-variant-numeric: tabular-nums;
}

.totals {
	display: flex;
	gap: 32px;
	padding: 16px 20px;
	background: var(--poker-bg-input, #2D333B);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius-sm);
}

.totalItem {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.totalLabel {
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.85rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: var(--poker-text-muted);
}

.totalValue {
	font-family: var(--poker-font-mono, 'JetBrains Mono Variable', monospace);
	font-size: 1.6rem;
	font-weight: 800;
	color: var(--poker-text);
	font-variant-numeric: tabular-nums;
}
</style>
