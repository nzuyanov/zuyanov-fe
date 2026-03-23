<template>
	<Teleport to="body">
		<div class="setup-overlay poker-shimmer-overlay">
			<div class="setup-modal">
				<header class="setup-header">
					<h1 class="setup-header__title">🃏 Настройка турнира</h1>
					<button class="setup-header__close" @click="emit('close')">
						<Icon name="ph:x-bold" />
					</button>
				</header>

				<div class="setup-body">
					<!-- Секция 1: Основные параметры -->
					<section class="setup-section">
						<h2 class="setup-section__title">⚙️ Основные параметры</h2>
						<div class="setup-grid">
							<div class="field field--wide">
								<label class="field__label">Название турнира</label>
								<PokerInput
									v-model="tournamentName"
									placeholder="Турнир 23.03.2026"
								/>
							</div>
							<div class="field">
								<label class="field__label">Количество игроков</label>
								<PokerInput
									v-model="playerCount"
									type="number"
									:min="3"
									:max="9"
								/>
							</div>
							<div class="field">
								<label class="field__label">Размер закупа (buy-in), <Icon name="material-symbols:currency-ruble-rounded" class="rub-icon" /></label>
								<PokerInput
									v-model="buyIn"
									type="number"
									:min="1"
									:step="100"
								/>
							</div>
							<div class="field">
								<label class="field__label">Длительность игры</label>
								<div class="field__row">
									<PokerInput
										v-model="durationHours"
										type="number"
										:min="0"
										:max="23"
										small
									/>
									<span class="field__unit">ч</span>
									<PokerInput
										v-model="durationMinutes"
										type="number"
										:min="0"
										:max="59"
										:step="5"
										small
									/>
									<span class="field__unit">мин</span>
								</div>
								<span
									v-if="totalDurationMinutes < 10"
									class="field__error"
								>Минимум 10 минут</span>
							</div>
							<div class="field">
								<label class="field__label">Макс. ребаев на игрока</label>
								<PokerInput
									v-model="maxRebuys"
									type="number"
									:min="0"
								/>
							</div>
							<div class="field">
								<label class="field__label">Период ребаев, мин</label>
								<PokerInput
									v-model="rebuyPeriodMinutes"
									type="number"
									:min="0"
									:step="5"
								/>
							</div>
						</div>
					</section>

					<!-- Секция 2: Призовые места -->
					<section class="setup-section">
						<h2 class="setup-section__title">🏆 Призовые места</h2>
						<div class="prizes">
							<div
								v-for="(place, i) in prizeLabels"
								:key="i"
								class="prizes__row"
							>
								<span class="prizes__label">{{ place }}</span>
								<div class="prizes__input-wrap">
									<PokerInput
										:model-value="prizes[i]"
										type="number"
										:min="0"
										:max="100"
										small
										@update:model-value="prizes[i] = Number($event)"
									/>
									<span class="field__unit">%</span>
								</div>
								<span class="prizes__amount">
									{{ (prizeAmountsPreview[i] ?? 0).toLocaleString('ru-RU') }}
									<Icon name="material-symbols:currency-ruble-rounded" class="rub-icon" />
								</span>
							</div>
							<div
								class="prizes__total"
								:class="{ 'prizes__total--error': !isPrizesValid }"
							>
								Сумма: {{ prizesSum }}%
								<span v-if="!isPrizesValid" class="field__error">
									(должна быть 100%)
								</span>
							</div>
						</div>
					</section>

					<!-- Секция 3: Блайнды -->
					<section class="setup-section">
						<h2 class="setup-section__title">🎰 Блайнды</h2>
						<div class="blinds-layout">
							<div class="blinds-fields">
								<div class="field">
									<label class="field__label">Начальный SB</label>
									<PokerInput
										v-model="startSB"
										type="number"
										:min="1"
										:step="5"
									/>
								</div>
								<div class="field">
									<label class="field__label">Начальный BB</label>
									<PokerInput
										v-model="startBB"
										type="number"
										:min="1"
										:step="10"
									/>
								</div>
								<div class="field">
									<label class="field__label">Интервал роста, мин</label>
									<PokerInput
										v-model="blindInterval"
										type="number"
										:min="1"
										:step="5"
									/>
								</div>
								<div class="field">
									<label class="field__label">Множитель роста</label>
									<PokerInput
										v-model="blindMultiplier"
										type="number"
										:min="1.1"
										:step="0.1"
										allow-decimals
									/>
								</div>
							</div>

							<div class="blinds-preview">
								<h3 class="blinds-preview__title">Превью уровней</h3>
								<table class="blinds-table">
									<thead>
										<tr>
											<th>Ур.</th>
											<th>SB</th>
											<th>BB</th>
										</tr>
									</thead>
									<tbody>
										<tr
											v-for="level in blindLevelsPreview"
											:key="level.level"
										>
											<td class="blinds-table__level">{{ level.level }}</td>
											<td class="mono">{{ level.sb }}</td>
											<td class="mono">{{ level.bb }}</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</section>

					<!-- Секция 4: Фишки -->
					<section class="setup-section">
						<h2 class="setup-section__title">🪙 Фишки</h2>
						<div class="chips-list">
							<div
								v-for="(chip, i) in chips"
								:key="i"
								class="chips-row"
							>
								<div class="field">
									<label v-if="i === 0" class="field__label">Номинал</label>
									<PokerInput
										v-model="chip.denomination"
										type="number"
										:min="1"
										:step="25"
										:error="isDuplicateChip(i)"
									/>
								</div>
								<div class="field">
									<label v-if="i === 0" class="field__label">Количество</label>
									<PokerInput
										v-model="chip.totalCount"
										type="number"
										:min="1"
										:step="10"
									/>
								</div>
								<button
									class="chips-row__remove"
									:class="{ 'chips-row__remove--hidden': chips.length <= 1 }"
									@click="removeChip(i)"
								>
									<Icon name="ph:trash-bold" />
								</button>
							</div>
						</div>
						<button class="btn-add" @click="addChip">
							+ Добавить номинал
						</button>

						<div v-if="chipsSummary" class="chips-summary">
							<div class="chips-summary__stats">
								<div class="chips-summary__stat">
									<span class="chips-summary__stat-label">Всего фишек</span>
									<span class="chips-summary__stat-value">{{ chipsSummary.totalValue.toLocaleString('ru-RU') }}</span>
								</div>
								<div class="chips-summary__stat">
									<span class="chips-summary__stat-label">На 1 игрока</span>
									<span class="chips-summary__stat-value">{{ chipsSummary.perPlayer.toLocaleString('ru-RU') }}</span>
								</div>
							</div>

							<h4 class="chips-summary__title">Курс фишки</h4>
							<table class="chips-rate-table">
								<thead>
									<tr>
										<th>Номинал</th>
										<th>Курс</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="rate in chipRatesPreview" :key="rate.denomination">
										<td class="mono">{{ rate.denomination }}</td>
										<td class="mono chips-rate-table__rub">{{ rate.rate }} <Icon name="material-symbols:currency-ruble-rounded" class="rub-icon" /></td>
									</tr>
								</tbody>
							</table>
						</div>
					</section>

					<!-- Секция 5: Игроки -->
					<section class="setup-section">
						<h2 class="setup-section__title">👥 Игроки</h2>
						<div class="players-list">
							<div
								v-for="(player, i) in players"
								:key="player.id"
								class="player-row"
							>
								<span class="player-row__num">{{ i + 1 }}</span>
								<button
									class="player-row__avatar"
									@click="cycleAvatar(i)"
								>
									<!-- eslint-disable-next-line vue/no-v-html -->
									<span v-html="getAvatarSvg(player.avatarId)" />
								</button>
								<PokerInput
									v-model="player.name"
									class="player-row__name"
									:error="isNameDuplicate(i)"
									:placeholder="`Игрок ${i + 1}`"
								/>
								<button
									v-if="players.length > 3"
									class="player-row__remove"
									@click="removePlayer(i)"
								>
									<Icon name="ph:trash-bold" />
								</button>
							</div>
						</div>
						<div class="players-actions">
							<button
								v-if="players.length < 9"
								class="btn-add"
								@click="addPlayer"
							>
								+ Добавить игрока
							</button>
						</div>
						<p
							v-if="hasDuplicateNames"
							class="field__error"
						>
							Имена игроков должны быть уникальными
						</p>
						<p
							v-if="hasEmptyNames"
							class="field__error"
						>
							Имена не могут быть пустыми
						</p>
					</section>
				</div>

				<footer class="setup-footer">
					<button
						class="setup-footer__btn"
						:disabled="!isFormValid"
						@click="startTournament"
					>
						🚀 Начать турнир
					</button>
				</footer>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import type { PokerConfig, PokerPlayer, PokerChipConfig } from '~/types/poker'
import PokerInput from '~/components/apps/poker-board/PokerInput.vue'

const emit = defineEmits<{
	start: [config: PokerConfig, players: PokerPlayer[]]
	close: []
}>()

const { getAvatarSvg, getRandomSeed, getNextSeed } = usePokerAvatars()

// --- Название турнира ---
const defaultTournamentName = `Турнир ${new Date().toLocaleDateString('ru-RU')}`
const tournamentName = ref(defaultTournamentName)

// --- Секция 1: Основные параметры ---
const playerCount = ref(6)
const buyIn = ref(500)
const durationHours = ref(3)
const durationMinutes = ref(0)
const maxRebuys = ref(3)
const rebuyPeriodMinutes = ref(60)

const totalDurationMinutes = computed(() => durationHours.value * 60 + durationMinutes.value)

// --- Секция 2: Призовые ---
const prizes = ref<[number, number, number]>([50, 30, 20])
const prizeLabels = ['🥇 1 место', '🥈 2 место', '🥉 3 место']
const prizesSum = computed(() => prizes.value[0] + prizes.value[1] + prizes.value[2])
const isPrizesValid = computed(() => prizesSum.value === 100)

const totalPotPreview = computed(() => playerCount.value * buyIn.value)
const prizeAmountsPreview = computed(() =>
	prizes.value.map(p => Math.round(totalPotPreview.value * p / 100)),
)

// --- Секция 3: Блайнды ---
const startSB = ref(25)
const startBB = ref(50)
const blindInterval = ref(15)
const blindMultiplier = ref(2)

const blindLevelsPreview = computed(() => {
	const denominations = chips.value.map(c => c.denomination).filter(d => d > 0)
	const minDenom = denominations.length > 0 ? Math.min(...denominations) : 1

	const levels: { level: number; sb: number; bb: number }[] = []
	for (let i = 0; i < 8; i++) {
		const rawSB = startSB.value * (blindMultiplier.value ** i)
		const rawBB = startBB.value * (blindMultiplier.value ** i)
		const sb = Math.max(Math.ceil(rawSB / minDenom) * minDenom, minDenom)
		const bb = Math.max(Math.ceil(rawBB / minDenom) * minDenom, minDenom)
		levels.push({ level: i + 1, sb, bb })
	}
	return levels
})

// --- Секция 4: Фишки ---
const chips = ref<PokerChipConfig[]>([
	{ denomination: 25, totalCount: 50 },
	{ denomination: 50, totalCount: 50 },
	{ denomination: 100, totalCount: 50 },
	{ denomination: 500, totalCount: 20 },
])

const addChip = () => {
	chips.value.push({ denomination: 0, totalCount: 0 })
}

const removeChip = (index: number) => {
	if (chips.value.length > 1) {
		chips.value.splice(index, 1)
	}
}

const isDuplicateChip = (index: number): boolean => {
	const chip = chips.value[index]
	if (!chip) return false
	const denom = chip.denomination
	return chips.value.some((c, i) => i !== index && c.denomination === denom && denom > 0)
}

const chipsSummary = computed(() => {
	const totalValue = chips.value.reduce((sum, c) => sum + c.denomination * c.totalCount, 0)
	if (totalValue === 0) return null
	const perPlayer = Math.round(totalValue / (playerCount.value || 1))
	return { totalValue, perPlayer }
})

const chipRatesPreview = computed(() => {
	const totalValue = chips.value.reduce((sum, c) => sum + c.denomination * c.totalCount, 0)
	const perPlayer = totalValue / (playerCount.value || 1)
	if (perPlayer === 0) return []
	const rate = buyIn.value / perPlayer
	return chips.value
		.filter(c => c.denomination > 0)
		.map(c => ({
			denomination: c.denomination,
			rate: Math.round(c.denomination * rate * 100) / 100,
		}))
})

// --- Секция 5: Игроки ---
interface SetupPlayer {
	id: number
	name: string
	avatarId: string
}

const players = ref<SetupPlayer[]>([])

const generatePlayers = (count: number) => {
	const usedSeeds: string[] = []
	const newPlayers: SetupPlayer[] = []
	for (let i = 0; i < count; i++) {
		// Сохраняем существующего игрока, если он есть
		const existing = players.value[i]
		if (existing) {
			newPlayers.push(existing)
			usedSeeds.push(existing.avatarId)
		}
		else {
			const seed = getRandomSeed(usedSeeds)
			usedSeeds.push(seed)
			newPlayers.push({
				id: i + 1,
				name: `Игрок ${i + 1}`,
				avatarId: seed,
			})
		}
	}
	players.value = newPlayers
}

// Инициализация списка игроков
generatePlayers(playerCount.value)

// Обновляем список при изменении количества игроков
watch(playerCount, (count) => {
	const clamped = Math.max(3, Math.min(9, count || 3))
	generatePlayers(clamped)
})

const addPlayer = () => {
	if (players.value.length >= 9) return
	const usedSeeds = players.value.map(p => p.avatarId)
	const seed = getRandomSeed(usedSeeds)
	const id = players.value.length > 0 ? Math.max(...players.value.map(p => p.id)) + 1 : 1
	players.value.push({
		id,
		name: `Игрок ${players.value.length + 1}`,
		avatarId: seed,
	})
	playerCount.value = players.value.length
}

const removePlayer = (index: number) => {
	if (players.value.length <= 3) return
	players.value.splice(index, 1)
	playerCount.value = players.value.length
}

const cycleAvatar = (index: number) => {
	const player = players.value[index]
	if (player) {
		player.avatarId = getNextSeed(player.avatarId)
	}
}

const isNameDuplicate = (index: number): boolean => {
	const player = players.value[index]
	if (!player) return false
	const name = player.name.trim().toLowerCase()
	if (!name) return false
	return players.value.some((p, i) => i !== index && p.name.trim().toLowerCase() === name)
}

const hasDuplicateNames = computed(() => {
	const names = players.value.map(p => p.name.trim().toLowerCase())
	return new Set(names).size !== names.length
})

const hasEmptyNames = computed(() =>
	players.value.some(p => p.name.trim() === ''),
)

// --- Валидация ---
const isFormValid = computed(() => isPrizesValid.value
	&& !hasDuplicateNames.value
	&& !hasEmptyNames.value
	&& playerCount.value >= 3
	&& playerCount.value <= 9
	&& buyIn.value > 0
	&& totalDurationMinutes.value >= 10
	&& maxRebuys.value >= 0
	&& rebuyPeriodMinutes.value >= 0
	&& startSB.value > 0
	&& startBB.value > 0
	&& blindInterval.value > 0
	&& blindMultiplier.value > 1
	&& chips.value.length > 0
	&& chips.value.every(c => c.denomination > 0 && c.totalCount > 0)
	&& !chips.value.some((c, i) => isDuplicateChip(i)))

// --- Старт турнира ---
const startTournament = () => {
	if (!isFormValid.value) return

	const config: PokerConfig = {
		name: tournamentName.value.trim() || defaultTournamentName,
		buyIn: buyIn.value,
		maxRebuys: maxRebuys.value,
		rebuyPeriodMinutes: rebuyPeriodMinutes.value,
		gameDurationMinutes: totalDurationMinutes.value,
		prizes: [...prizes.value],
		blinds: {
			startSB: startSB.value,
			startBB: startBB.value,
			intervalMinutes: blindInterval.value,
			multiplier: blindMultiplier.value,
		},
		chips: chips.value.map(c => ({ ...c })),
	}

	const gamePlayers: PokerPlayer[] = players.value.map(p => ({
		id: p.id,
		name: p.name.trim(),
		avatarId: p.avatarId,
		totalContributed: buyIn.value,
		rebuysUsed: 0,
		addOnUsed: false,
		isEliminated: false,
		eliminationOrder: null,
	}))

	emit('start', config, gamePlayers)
}
</script>

<style scoped>
.setup-overlay {
	position: fixed;
	inset: 0;
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
	backdrop-filter: blur(4px);
}

.setup-modal {
	width: 92vw;
	max-width: 960px;
	max-height: 92vh;
	display: flex;
	flex-direction: column;
	background: var(--poker-bg-surface, #1A1D23);
	border-radius: var(--poker-radius, 12px);
	border: 1px solid var(--poker-border, rgb(255 255 255 / 8%));
	box-shadow: 0 24px 64px rgb(0 0 0 / 50%);
	overflow: hidden;
}

/* --- Header --- */
.setup-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px 28px;
	border-bottom: 1px solid var(--poker-border);
	flex-shrink: 0;
}

.setup-header__title {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.5rem;
	font-weight: 800;
	color: var(--poker-text);
}

.setup-header__close {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border: none;
	border-radius: 8px;
	background: transparent;
	color: var(--poker-text-muted);
	font-size: 1.125rem;
	cursor: pointer;
	transition: background 0.2s, color 0.2s;
}

.setup-header__close:hover {
	background: rgb(255 255 255 / 8%);
	color: var(--poker-text);
}

/* --- Body --- */
.setup-body {
	flex: 1;
	overflow-y: auto;
	padding: 24px 28px;
	display: flex;
	flex-direction: column;
	gap: 32px;
}

/* --- Section --- */
.setup-section__title {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.125rem;
	font-weight: 700;
	color: var(--poker-text);
	margin-bottom: 16px;
}

/* --- Grid --- */
.setup-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 16px;
}

/* --- Field --- */
.field--wide {
	grid-column: 1 / -1;
}

.field__label {
	display: flex;
	align-items: center;
	gap: 4px;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 0.8125rem;
	font-weight: 600;
	color: var(--poker-text-muted);
	margin-bottom: 6px;
}


.field__row {
	display: flex;
	align-items: center;
	gap: 8px;
}

.field__unit {
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.875rem;
	font-weight: 500;
	color: var(--poker-text-muted);
}

.field__error {
	display: block;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.8125rem;
	font-weight: 500;
	color: var(--poker-red);
	margin-top: 4px;
}

/* --- Prizes --- */
.prizes {
	display: flex;
	flex-direction: column;
	gap: 12px;
	max-width: 480px;
}

.prizes__row {
	display: flex;
	align-items: center;
	gap: 12px;
}

.prizes__label {
	width: 100px;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 0.9375rem;
	font-weight: 600;
	flex-shrink: 0;
}

.prizes__input-wrap {
	display: flex;
	align-items: center;
	gap: 4px;
}

.prizes__amount {
	display: inline-flex;
	align-items: center;
	gap: 2px;
	font-family: var(--poker-font-mono);
	font-size: 0.9375rem;
	color: var(--poker-gold);
	white-space: nowrap;
}

.prizes__total {
	padding-top: 8px;
	border-top: 1px solid var(--poker-border);
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 0.9375rem;
	font-weight: 700;
	color: var(--poker-green);
}

.prizes__total--error {
	color: var(--poker-red);
}

/* --- Blinds layout --- */
.blinds-layout {
	display: flex;
	gap: 28px;
	align-items: stretch;
}

.blinds-fields {
	display: flex;
	flex-direction: column;
	gap: 16px;
	flex-shrink: 0;
	width: 220px;
}

/* --- Blinds preview --- */
.blinds-preview {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
}

.blinds-preview__title {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 0.875rem;
	font-weight: 700;
	color: var(--poker-text-muted);
	margin-bottom: 10px;
}

.blinds-table {
	width: 100%;
	flex: 1;
	border-collapse: separate;
	border-spacing: 0;
	font-size: 0.875rem;
	background: var(--poker-bg-card, #21252D);
	border-radius: var(--poker-radius-sm);
	overflow: hidden;
}

.blinds-table th {
	text-align: left;
	padding: 8px 14px;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 0.75rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: var(--poker-text-muted);
	background: var(--poker-bg-input, #2D333B);
	border-bottom: 1px solid var(--poker-border);
}

.blinds-table td {
	padding: 8px 14px;
	color: var(--poker-text-secondary);
	border-bottom: 1px solid var(--poker-border);
}

.blinds-table tbody tr:last-child td {
	border-bottom: none;
}

.blinds-table tbody tr:first-child td {
	color: var(--poker-green);
	font-weight: 700;
}

.blinds-table tbody tr:hover td {
	background: rgb(255 255 255 / 3%);
}

.blinds-table__level {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-weight: 700;
	color: var(--poker-text-muted);
}

/* --- Chips --- */
.chips-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.chips-row {
	display: flex;
	align-items: flex-end;
	gap: 12px;
}

.chips-row .field {
	flex: 1;
	max-width: 200px;
}

.chips-row__remove {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border: none;
	border-radius: var(--poker-radius-sm);
	background: transparent;
	color: var(--poker-text-muted);
	cursor: pointer;
	transition: color 0.2s, background 0.2s;
	flex-shrink: 0;
}

.chips-row__remove:hover {
	color: var(--poker-red);
	background: var(--poker-red-dim);
}

.chips-row__remove--hidden {
	visibility: hidden;
}

.btn-add {
	align-self: flex-start;
	margin-top: 4px;
	padding: 8px 16px;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.875rem;
	font-weight: 600;
	color: var(--poker-green);
	background: var(--poker-green-dim, rgb(16 185 129 / 15%));
	border: 1px dashed var(--poker-green);
	border-radius: var(--poker-radius-sm);
	cursor: pointer;
	transition: background 0.2s;
}

.btn-add:hover {
	background: rgb(16 185 129 / 25%);
}

.chips-summary {
	margin-top: 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.chips-summary__stats {
	display: flex;
	gap: 24px;
}

.chips-summary__stat {
	display: flex;
	flex-direction: column;
	gap: 2px;
	padding: 10px 16px;
	background: var(--poker-bg-card, #21252D);
	border-radius: var(--poker-radius-sm);
}

.chips-summary__stat-label {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 0.7rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: var(--poker-text-muted);
}

.chips-summary__stat-value {
	font-family: var(--poker-font-mono, 'Courier New', monospace);
	font-size: 1rem;
	font-weight: 700;
	color: var(--poker-text);
}

.chips-summary__title {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 0.875rem;
	font-weight: 700;
	color: var(--poker-gold);
}

.chips-rate-table {
	width: 100%;
	max-width: 280px;
	border-collapse: separate;
	border-spacing: 0;
	font-size: 0.875rem;
	background: var(--poker-bg-card, #21252D);
	border-radius: var(--poker-radius-sm);
	overflow: hidden;
}

.chips-rate-table th {
	text-align: left;
	padding: 8px 14px;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 0.75rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: var(--poker-text-muted);
	background: var(--poker-bg-input, #2D333B);
	border-bottom: 1px solid var(--poker-border);
}

.chips-rate-table td {
	padding: 8px 14px;
	color: var(--poker-text-secondary);
	border-bottom: 1px solid var(--poker-border);
}

.chips-rate-table tbody tr:last-child td {
	border-bottom: none;
}

.chips-rate-table__rub {
	color: var(--poker-gold);
}

.chips-rate-table tbody tr:hover td {
	background: rgb(255 255 255 / 3%);
}

/* --- Players --- */
.players-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.player-row {
	display: flex;
	align-items: center;
	gap: 12px;
}

.player-row__num {
	width: 28px;
	text-align: center;
	font-family: var(--poker-font-mono, 'Courier New', monospace);
	font-size: 0.875rem;
	font-weight: 600;
	color: var(--poker-text-muted);
	flex-shrink: 0;
}

.player-row__avatar {
	width: 44px;
	height: 44px;
	border-radius: 50%;
	border: 2px solid var(--poker-border);
	background: var(--poker-bg-input);
	cursor: pointer;
	padding: 2px;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	flex-shrink: 0;
	transition: border-color 0.2s;
}

.player-row__avatar:hover {
	border-color: var(--poker-green);
}

.player-row__avatar :deep(svg) {
	width: 100%;
	height: 100%;
}

.player-row__name {
	flex: 1;
	max-width: 320px;
}

.player-row__remove {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border: none;
	border-radius: var(--poker-radius-sm);
	background: transparent;
	color: var(--poker-text-muted);
	cursor: pointer;
	transition: color 0.2s, background 0.2s;
	flex-shrink: 0;
}

.player-row__remove:hover {
	color: var(--poker-red);
	background: var(--poker-red-dim);
}

.players-actions {
	margin-top: 8px;
}

/* --- Footer --- */
.setup-footer {
	display: flex;
	justify-content: flex-end;
	padding: 16px 28px;
	border-top: 1px solid var(--poker-border);
	flex-shrink: 0;
}

.setup-footer__btn {
	padding: 14px 36px;
	font-size: 1.0625rem;
	font-weight: 700;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	border: none;
	border-radius: var(--poker-radius-sm);
	background: var(--poker-green);
	color: #fff;
	cursor: pointer;
	transition: background 0.2s, opacity 0.2s, transform 0.15s;
}

.setup-footer__btn:hover:not(:disabled) {
	background: var(--poker-green-hover);
	transform: translateY(-1px);
}

.setup-footer__btn:active:not(:disabled) {
	transform: translateY(0);
}

.setup-footer__btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

/* --- Utility --- */
.mono {
	font-family: var(--poker-font-mono, 'Courier New', monospace);
}

.rub-icon {
	display: inline-block;
	vertical-align: middle;
	width: 1em;
	height: 1em;
}

.rub-icon :deep(svg) {
	width: 1em;
	height: 1em;
	vertical-align: middle;
}

/* --- Scrollbar --- */
.setup-body::-webkit-scrollbar {
	width: 6px;
}

.setup-body::-webkit-scrollbar-track {
	background: transparent;
}

.setup-body::-webkit-scrollbar-thumb {
	background: rgb(255 255 255 / 15%);
	border-radius: 3px;
}

.setup-body::-webkit-scrollbar-thumb:hover {
	background: rgb(255 255 255 / 25%);
}
</style>
