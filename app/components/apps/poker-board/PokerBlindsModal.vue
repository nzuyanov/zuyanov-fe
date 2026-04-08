<template>
	<Teleport to="body">
		<div class="overlay poker-shimmer-overlay" @click.self="$emit('close')">
			<div class="modal">
				<header class="header">
					<h2 class="title">📋 Уровни блайндов</h2>
					<button class="closeBtn" @click="$emit('close')">
						<Icon name="ph:x-bold" />
					</button>
				</header>

				<div class="body">
					<table class="table">
						<thead>
							<tr>
								<th class="th thCenter">Уровень</th>
								<th class="th">SB</th>
								<th class="th">BB</th>
								<th class="th">MIN рейз</th>
								<th class="th">Длительность</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="level in store.allBlindLevels"
								:key="level.level"
								class="row"
								:class="{
									'rowCurrent': level.level - 1 === store.gameState.currentBlindLevel,
									'rowPassed': level.level - 1 < store.gameState.currentBlindLevel,
								}"
							>
								<td class="td tdLevel">{{ level.level }}</td>
								<td class="td tdNum">{{ level.smallBlind }}</td>
								<td class="td tdNum">{{ level.bigBlind }}</td>
								<td class="td tdNum">{{ level.bigBlind * 2 }}</td>
								<td class="td tdDuration">{{ level.durationMinutes }} мин</td>
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
	width: 680px;
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
	font-size: 1.4rem;
	font-weight: 800;
	color: var(--poker-text);
}

.closeBtn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	font-size: 1.1rem;
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
	overflow-y: auto;
	padding: 0 28px 28px;
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

.table {
	width: 100%;
	border-collapse: collapse;
}

/* Заголовки — обычный красивый шрифт */
.th {
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.85rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: var(--poker-text-muted);
	padding: 14px 16px;
	text-align: right;
	border-bottom: 1px solid var(--poker-border);
	white-space: nowrap;
	position: sticky;
	top: 0;
	background: var(--poker-bg-card, #21252D);
	z-index: 1;
}

.thCenter {
	text-align: center;
	width: 50px;
}

/* Ячейки — крупный моноширинный шрифт */
.td {
	padding: 14px 16px;
	border-bottom: 1px solid rgb(255 255 255 / 4%);
}

.tdLevel {
	text-align: center;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 1.2rem;
	font-weight: 700;
	color: var(--poker-text-muted);
}

.tdDuration {
	text-align: right;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 1.2rem;
	font-weight: 600;
	color: var(--poker-text-muted);
}

.tdNum {
	text-align: right;
	font-family: var(--poker-font-mono);
	font-size: 1.35rem;
	font-weight: 700;
	color: var(--poker-text-secondary);
}

/* Текущий уровень */
.rowCurrent {
	background: var(--poker-green-dim);
}

.rowCurrent .tdLevel {
	color: var(--poker-green);
}

.rowCurrent .tdNum {
	color: var(--poker-green);
	font-weight: 800;
}

.rowCurrent .tdDuration {
	color: var(--poker-green);
	font-weight: 700;
}

/* Пройденные уровни */
.rowPassed {
	opacity: 0.35;
}
</style>
