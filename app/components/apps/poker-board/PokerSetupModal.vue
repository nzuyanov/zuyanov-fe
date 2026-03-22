<template>
	<Teleport to="body">
		<div class="setup-overlay">
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
							<div class="field">
								<label class="field__label">Количество игроков</label>
								<input
									v-model.number="playerCount"
									type="number"
									class="field__input"
									min="2"
									max="20"
								>
							</div>
							<div class="field">
								<label class="field__label">Размер закупа (buy-in), ₽</label>
								<input
									v-model.number="buyIn"
									type="number"
									class="field__input"
									min="1"
								>
							</div>
							<div class="field">
								<label class="field__label">Длительность игры</label>
								<div class="field__row">
									<input
										v-model.number="durationHours"
										type="number"
										class="field__input field__input--small"
										min="0"
										max="23"
									>
									<span class="field__unit">ч</span>
									<input
										v-model.number="durationMinutes"
										type="number"
										class="field__input field__input--small"
										min="0"
										max="59"
										step="5"
									>
									<span class="field__unit">мин</span>
								</div>
								<span
									v-if="totalDurationMinutes < 10"
									class="field__error"
								>Минимум 10 минут</span>
							</div>
							<div class="field">
								<label class="field__label">Макс. ребаев на игрока</label>
								<input
									v-model.number="maxRebuys"
									type="number"
									class="field__input"
									min="0"
								>
							</div>
							<div class="field">
								<label class="field__label">Период ребаев, мин</label>
								<input
									v-model.number="rebuyPeriodMinutes"
									type="number"
									class="field__input"
									min="0"
								>
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
									<input
										v-model.number="prizes[i]"
										type="number"
										class="field__input field__input--small"
										min="0"
										max="100"
									>
									<span class="field__unit">%</span>
								</div>
								<span class="prizes__amount">
									{{ formatMoney(prizeAmountsPreview[i] ?? 0) }}
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
						<div class="setup-grid">
							<div class="field">
								<label class="field__label">Начальный SB</label>
								<input
									v-model.number="startSB"
									type="number"
									class="field__input"
									min="1"
								>
							</div>
							<div class="field">
								<label class="field__label">Начальный BB</label>
								<input
									v-model.number="startBB"
									type="number"
									class="field__input"
									min="1"
								>
							</div>
							<div class="field">
								<label class="field__label">Интервал роста, мин</label>
								<input
									v-model.number="blindInterval"
									type="number"
									class="field__input"
									min="1"
								>
							</div>
							<div class="field">
								<label class="field__label">Множитель роста</label>
								<input
									v-model.number="blindMultiplier"
									type="number"
									class="field__input"
									min="1.1"
									step="0.1"
								>
							</div>
						</div>

						<div class="blinds-preview">
							<h3 class="blinds-preview__title">Превью уровней</h3>
							<table class="blinds-table">
								<thead>
									<tr>
										<th>Уровень</th>
										<th>SB</th>
										<th>BB</th>
									</tr>
								</thead>
								<tbody>
									<tr
										v-for="level in blindLevelsPreview"
										:key="level.level"
									>
										<td>{{ level.level }}</td>
										<td class="mono">{{ level.sb }}</td>
										<td class="mono">{{ level.bb }}</td>
									</tr>
								</tbody>
							</table>
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
									<input
										v-model.number="chip.denomination"
										type="number"
										class="field__input"
										min="1"
										:class="{ 'field__input--error': isDuplicateChip(i) }"
									>
								</div>
								<div class="field">
									<label v-if="i === 0" class="field__label">Количество</label>
									<input
										v-model.number="chip.totalCount"
										type="number"
										class="field__input"
										min="1"
									>
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
							<div class="chips-summary__row">
								<span>Всего фишек:</span>
								<span class="mono">{{ chipsSummary.totalValue }} фишек</span>
							</div>
							<div class="chips-summary__row">
								<span>На 1 игрока:</span>
								<span class="mono">{{ chipsSummary.perPlayer }} фишек</span>
							</div>
							<div class="chips-summary__title">Курс фишки:</div>
							<div
								v-for="rate in chipRatesPreview"
								:key="rate.denomination"
								class="chips-summary__rate"
							>
								<span class="mono">{{ rate.denomination }}</span> фишка
								= <span class="mono">{{ rate.rate }} ₽</span>
							</div>
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
								<input
									v-model="player.name"
									type="text"
									class="field__input player-row__name"
									:class="{ 'field__input--error': isNameDuplicate(i) }"
									:placeholder="`Игрок ${i + 1}`"
								>
							</div>
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

const emit = defineEmits<{
	start: [config: PokerConfig, players: PokerPlayer[]]
	close: []
}>()

const { getAvatarSvg, getRandomSeed, getNextSeed } = usePokerAvatars()

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
	const clamped = Math.max(2, Math.min(20, count || 2))
	generatePlayers(clamped)
})

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
	&& playerCount.value >= 2
	&& playerCount.value <= 20
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

// --- Форматирование ---
const formatMoney = (value: number): string => `${value.toLocaleString('ru-RU')} ₽`

// --- Старт турнира ---
const startTournament = () => {
	if (!isFormValid.value) return

	const config: PokerConfig = {
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
	background: rgb(0 0 0 / 80%);
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
.field__label {
	display: block;
	font-size: 0.8125rem;
	font-weight: 500;
	color: var(--poker-text-muted);
	margin-bottom: 6px;
}

.field__input {
	width: 100%;
	padding: 10px 14px;
	font-size: 0.9375rem;
	font-family: inherit;
	color: var(--poker-text);
	background: var(--poker-bg-input, #2D333B);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius-sm, 8px);
	outline: none;
	transition: border-color 0.2s, box-shadow 0.2s;
}

.field__input:focus {
	border-color: var(--poker-green);
	box-shadow: 0 0 0 3px var(--poker-green-dim, rgb(16 185 129 / 15%));
}

.field__input--small {
	width: 80px;
}

.field__input--error {
	border-color: var(--poker-red);
}

.field__input--error:focus {
	box-shadow: 0 0 0 3px var(--poker-red-dim, rgb(239 68 68 / 15%));
}

.field__row {
	display: flex;
	align-items: center;
	gap: 8px;
}

.field__unit {
	font-size: 0.875rem;
	color: var(--poker-text-muted);
}

.field__error {
	display: block;
	font-size: 0.8125rem;
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
	font-family: var(--poker-font-mono);
	font-size: 0.9375rem;
	color: var(--poker-gold);
	white-space: nowrap;
}

.prizes__total {
	padding-top: 8px;
	border-top: 1px solid var(--poker-border);
	font-size: 0.9375rem;
	font-weight: 600;
	color: var(--poker-green);
}

.prizes__total--error {
	color: var(--poker-red);
}

/* --- Blinds preview --- */
.blinds-preview {
	margin-top: 16px;
}

.blinds-preview__title {
	font-size: 0.875rem;
	font-weight: 600;
	color: var(--poker-text-muted);
	margin-bottom: 8px;
}

.blinds-table {
	width: 100%;
	max-width: 320px;
	border-collapse: collapse;
	font-size: 0.875rem;
}

.blinds-table th {
	text-align: left;
	padding: 6px 12px;
	color: var(--poker-text-muted);
	font-weight: 600;
	border-bottom: 1px solid var(--poker-border);
}

.blinds-table td {
	padding: 6px 12px;
	border-bottom: 1px solid var(--poker-border);
}

.blinds-table tr:first-child td {
	color: var(--poker-green);
	font-weight: 600;
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
	padding: 14px 18px;
	background: var(--poker-bg-card, #21252D);
	border-radius: var(--poker-radius-sm);
	display: flex;
	flex-direction: column;
	gap: 6px;
	font-size: 0.875rem;
}

.chips-summary__row {
	display: flex;
	justify-content: space-between;
	max-width: 300px;
}

.chips-summary__title {
	font-weight: 600;
	color: var(--poker-gold);
	margin-top: 6px;
}

.chips-summary__rate {
	color: var(--poker-text-secondary);
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
	font-family: inherit;
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
