<template>
	<Teleport to="body">
		<div class="blinds-modal-overlay" @click.self="$emit('close')">
			<div class="blinds-modal">
				<header class="blinds-modal__header">
					<h2 class="blinds-modal__title">📋 Уровни блайндов</h2>
					<button class="blinds-modal__close" @click="$emit('close')">✕</button>
				</header>

				<div class="blinds-modal__body">
					<table class="blinds-table">
						<thead>
							<tr>
								<th class="blinds-table__th">№</th>
								<th class="blinds-table__th">SB</th>
								<th class="blinds-table__th">BB</th>
								<th class="blinds-table__th">Мин. рейз</th>
								<th class="blinds-table__th">Длит.</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="level in store.allBlindLevels"
								:key="level.level"
								class="blinds-table__row"
								:class="{
									'blinds-table__row--current': level.level - 1 === store.gameState.currentBlindLevel,
									'blinds-table__row--passed': level.level - 1 < store.gameState.currentBlindLevel,
								}"
							>
								<td class="blinds-table__td blinds-table__td--level">{{ level.level }}</td>
								<td class="blinds-table__td blinds-table__td--num">{{ level.smallBlind }}</td>
								<td class="blinds-table__td blinds-table__td--num">{{ level.bigBlind }}</td>
								<td class="blinds-table__td blinds-table__td--num">{{ level.bigBlind * 2 }}</td>
								<td class="blinds-table__td blinds-table__td--num">{{ level.durationMinutes }} мин</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
const store = usePokerStore()

defineEmits<{
	close: []
}>()
</script>

<style scoped>
.blinds-modal-overlay {
	position: fixed;
	inset: 0;
	background: rgb(0 0 0 / 60%);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 300;
	backdrop-filter: blur(4px);
}

.blinds-modal {
	background: var(--poker-bg-surface);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius);
	width: 560px;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	box-shadow: 0 16px 64px rgb(0 0 0 / 50%);
}

.blinds-modal__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 20px;
	border-bottom: 1px solid var(--poker-border);
	flex-shrink: 0;
}

.blinds-modal__title {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.1rem;
	font-weight: 700;
	color: var(--poker-text);
}

.blinds-modal__close {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	font-size: 1rem;
	color: var(--poker-text-muted);
	background: none;
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius-sm);
	cursor: pointer;
	transition: color 0.2s, border-color 0.2s;
}

.blinds-modal__close:hover {
	color: var(--poker-text);
	border-color: var(--poker-border-hover);
}

.blinds-modal__body {
	overflow-y: auto;
	padding: 12px 20px 20px;
}

.blinds-modal__body::-webkit-scrollbar {
	width: 6px;
}

.blinds-modal__body::-webkit-scrollbar-track {
	background: transparent;
}

.blinds-modal__body::-webkit-scrollbar-thumb {
	background: rgb(255 255 255 / 15%);
	border-radius: 3px;
}

.blinds-table {
	width: 100%;
	border-collapse: collapse;
}

.blinds-table__th {
	font-size: 0.7rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: var(--poker-text-muted);
	padding: 8px 12px;
	text-align: right;
	border-bottom: 1px solid var(--poker-border);
}

.blinds-table__th:first-child {
	text-align: center;
	width: 40px;
}

.blinds-table__td {
	padding: 8px 12px;
	font-size: 0.9rem;
	border-bottom: 1px solid rgb(255 255 255 / 4%);
}

.blinds-table__td--level {
	text-align: center;
	font-weight: 600;
	color: var(--poker-text-muted);
}

.blinds-table__td--num {
	text-align: right;
	font-family: var(--poker-font-mono);
	font-weight: 600;
	color: var(--poker-text-secondary);
}

.blinds-table__row--current {
	background: var(--poker-green-dim);
}

.blinds-table__row--current .blinds-table__td--level {
	color: var(--poker-green);
}

.blinds-table__row--current .blinds-table__td--num {
	color: var(--poker-green);
	font-weight: 700;
}

.blinds-table__row--passed {
	opacity: 0.4;
}
</style>
