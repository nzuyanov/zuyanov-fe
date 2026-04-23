<template>
	<Teleport to="body">
		<div class="overlay poker-shimmer-overlay" @click.self="$emit('close')">
			<div class="modal">
				<header class="header">
					<h2 class="title">ℹ️ Информация об игре</h2>
					<button class="closeBtn" @click="$emit('close')">
						<RxCross2 />
					</button>
				</header>

				<div class="body">
					<!-- Раздача фишек -->
					<section class="section">
						<h3 class="subtitle">Раздача фишек</h3>
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
					</section>

					<!-- Горячие клавиши -->
					<section class="section">
						<h3 class="subtitle">⌨️ Горячие клавиши</h3>
						<div class="hotkeyGrid">
							<div class="hotkeyItem">
								<span class="hotkeyLabel">Пауза / Продолжить</span>
								<kbd class="hotkeyBadge">Space</kbd>
							</div>
							<div class="hotkeyItem">
								<span class="hotkeyLabel">Следующая раздача</span>
								<kbd class="hotkeyBadge">Enter</kbd>
							</div>
							<div class="hotkeyItem">
								<span class="hotkeyLabel">Настройки</span>
								<kbd class="hotkeyBadge">S</kbd>
							</div>
							<div class="hotkeyItem">
								<span class="hotkeyLabel">Звук вкл / выкл</span>
								<kbd class="hotkeyBadge">M</kbd>
							</div>
							<div class="hotkeyItem">
								<span class="hotkeyLabel">Информация</span>
								<kbd class="hotkeyBadge">I</kbd>
							</div>
							<div class="hotkeyItem">
								<span class="hotkeyLabel">Беспалевный режим</span>
								<kbd class="hotkeyBadge">H</kbd>
							</div>
							<div class="hotkeyItem">
								<span class="hotkeyLabel">Закрыть окно</span>
								<kbd class="hotkeyBadge">Esc</kbd>
							</div>
						</div>
					</section>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import PokerChip from './PokerChip.vue'
import { RxCross2 } from 'vue-icons-plus/rx'

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
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 32px;
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

.section {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.subtitle {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.25rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: var(--poker-text-muted);
}

.sectionHint {
	font-size: 1.05rem;
	color: var(--poker-text-secondary, #D1D5DB);
	margin-top: -8px;
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

/* Горячие клавиши */
.hotkeyGrid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
}

.hotkeyItem {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 14px;
	padding: 12px 16px;
	background: var(--poker-bg-input, #2D333B);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius-sm);
}

.hotkeyLabel {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.05rem;
	font-weight: 700;
	color: var(--poker-text);
	letter-spacing: 0.01em;
}

.hotkeyBadge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 48px;
	padding: 7px 14px;
	font-family: var(--poker-font-mono, 'JetBrains Mono Variable', monospace);
	font-size: 1.05rem;
	font-weight: 800;
	color: var(--poker-text);
	background: linear-gradient(180deg, rgb(255 255 255 / 10%) 0%, transparent 100%), var(--poker-bg-elevated, #363640);
	border: 1px solid rgb(255 255 255 / 16%);
	border-bottom: 3px solid rgb(0 0 0 / 40%);
	border-radius: 8px;
	letter-spacing: 0.03em;
	flex-shrink: 0;
}
</style>
