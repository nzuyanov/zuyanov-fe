<template>
	<Teleport to="body">
		<div class="setup-overlay poker-shimmer-overlay">
			<div class="setup-modal">
				<header class="setup-header">
					<h1 class="setup-header__title"><img :src="imgPokerCards" alt="" class="section-icon"> Настройки турнира</h1>
					<button class="setup-header__close" @click="emit('close')">
						<Icon name="ph:x-bold" />
					</button>
				</header>

				<div class="setup-body">
					<!-- Секция 1: Основные параметры -->
					<section class="setup-section" data-section="basic">
						<h2 class="setup-section__title"><img :src="imgSetting" alt="" class="section-icon"> Основное</h2>
						<div class="setup-grid">
							<div class="field field--wide">
								<label class="field__label">Название турнира</label>
								<PokerInput
									v-model="tournamentName"
									placeholder="Турнир 23.03.2026"
									:error="tournamentName.trim() === ''"
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
								<label class="field__label">Размер закупа (buy-in)</label>
								<PokerInput
									v-model="buyIn"
									type="number"
									:min="1"
									:step="100"
									suffix="₽"
								/>
							</div>
							<div class="field">
								<label class="field__label">Длительность игры</label>
								<PokerTimeInput
									v-model="gameDurationMinutes"
									:min="15"
									:max="1440"
									:step="15"
								/>
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
								<label class="field__label">Период ребаев</label>
								<PokerTimeInput
									v-model="rebuyPeriodMinutes"
									:min="0"
									:max="1440"
									:step="5"
								/>
							</div>
						</div>
					</section>

					<!-- Секция 2: Призовые места -->
					<section class="setup-section" data-section="prizes">
						<h2 class="setup-section__title"><img :src="imgGold" alt="" class="section-icon"> Призовые места</h2>
						<div class="prizes">
							<div class="prizes__rows">
								<div
									v-for="(place, i) in prizeLabels"
									:key="i"
									class="prizes__row"
								>
									<span class="prizes__label">
										<img :src="trophyIcons[i]" alt="" class="prizes__trophy">
										{{ place }}
									</span>
									<div class="prizes__input-wrap">
										<PokerInput
											:model-value="prizes[i] ?? 0"
											type="number"
											:min="0"
											:max="100"
											small
											:step="5"
											suffix="%"
											@update:model-value="prizes[i] = Number($event)"
										/>
									</div>
									<span class="prizes__amount">
										{{ (prizeAmountsPreview[i] ?? 0).toLocaleString('ru-RU') }}
										<Icon name="material-symbols:currency-ruble-rounded" class="rub-icon" />
									</span>
								</div>
							</div>
							<div
								class="prizes__summary"
								:class="{
									'prizes__summary--valid': isPrizesValid,
									'prizes__summary--error': !isPrizesValid,
								}"
							>
								<span class="prizes__summary-value">{{ prizesSum }}%</span>
								<span class="prizes__summary-label">{{ isPrizesValid ? '✓ Сумма ок' : '✗ Должно быть 100%' }}</span>
							</div>
						</div>
					</section>

					<!-- Секция 3: Блайнды -->
					<section class="setup-section" data-section="blinds">
						<h2 class="setup-section__title"><img :src="imgBandit" alt="" class="section-icon"> Блайнды</h2>
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
									<label class="field__label">Начальный BB (= SB × 2)</label>
									<PokerInput
										:model-value="startBB"
										type="number"
										disabled
										hide-steps
									/>
								</div>
								<div class="field">
									<label class="field__label">Интервал роста</label>
									<PokerTimeInput
										v-model="blindInterval"
										:min="1"
										:max="1440"
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
									<colgroup>
										<col style="width: 20%">
										<col style="width: 40%">
										<col style="width: 40%">
									</colgroup>
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
											<td>{{ level.sb }}</td>
											<td>{{ level.bb }}</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</section>

					<!-- Секция 4: Фишки -->
					<section class="setup-section" data-section="chips">
						<h2 class="setup-section__title"><img :src="imgPokerChip" alt="" class="section-icon"> Фишки</h2>
						<div class="chips-layout">
							<div class="field">
								<label class="field__label">Закуп в фишках</label>
								<PokerInput
									v-model="buyInChips"
									type="number"
									:min="1"
									:step="100"
								/>
							</div>
							<div v-if="buyInChips > 0" class="chip-rate-card">
								<div class="chip-rate-card__row">
									<span class="chip-rate-card__label">1 фишка</span>
									<span class="chip-rate-card__eq">=</span>
									<span class="chip-rate-card__value">
										{{ rubPerChipDisplay }}
										<Icon name="material-symbols:currency-ruble-rounded" class="rub-icon" />
									</span>
								</div>
								<div class="chip-rate-card__divider">/</div>
								<div class="chip-rate-card__row">
									<span class="chip-rate-card__label">1
										<Icon name="material-symbols:currency-ruble-rounded" class="rub-icon" />
									</span>
									<span class="chip-rate-card__eq">=</span>
									<span class="chip-rate-card__value">{{ chipsPerRubDisplay }} {{ chipsPerRubUnit }}</span>
								</div>
							</div>
						</div>
					</section>

					<!-- Секция 5: Игроки -->
					<section class="setup-section" data-section="players">
						<h2 class="setup-section__title"><img :src="imgHelmet" alt="" class="section-icon"> Игроки</h2>
						<div class="players-grid">
							<div
								v-for="(player, i) in players"
								:key="player.id"
								class="player-card"
							>
								<button
									v-if="players.length > 3"
									class="player-card__remove"
									@click="removePlayer(i)"
								>
									<Icon name="ph:trash-bold" />
								</button>
								<span class="player-card__num">{{ i + 1 }}</span>
								<button
									class="player-card__avatar"
									@click="cycleAvatar(i)"
								>
									<!-- eslint-disable-next-line vue/no-v-html -->
									<span class="player-avatar-wrapper" v-html="getAvatarSvg(player.avatarId)" />
								</button>
								<div class="player-card__name-row">
									<PokerInput
										v-model="player.name"
										class="player-card__name"
										:error="isNameInvalid(i)"
										:placeholder="`Игрок ${i + 1}`"
									/>
									<button
										class="player-card__reroll"
										@click="rerollName(i)"
									>
										<Icon name="ph:dice-five-bold" />
									</button>
								</div>
							</div>
							<button
								v-if="players.length < 9"
								ref="addBtnRef"
								class="player-card player-card--add"
								@click="addPlayer"
							>
								<Icon name="ph:plus-bold" class="player-card__add-icon" />
								<span class="player-card__add-text">Добавить игрока</span>
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
					<div class="setup-footer__wrapper">
						<button
							ref="startBtnRef"
							class="setup-footer__btn"
							:disabled="!isFormValid"
							@click="startTournament"
							@mouseenter="!isFormValid && (showErrorsTooltip = true)"
							@mouseleave="showErrorsTooltip = false"
						>
							🚀 Начать турнир
						</button>
					</div>
				</footer>
			</div>
		</div>
	</Teleport>
	<Teleport to="body">
		<Transition name="tooltip-fade">
			<div
				v-if="showErrorsTooltip && validationErrors.length > 0"
				class="errors-tooltip"
				:style="errorsTooltipStyle"
				@mouseenter="showErrorsTooltip = true"
				@mouseleave="showErrorsTooltip = false"
			>
				<ul class="errors-tooltip__list">
					<li
						v-for="(err, i) in validationErrors"
						:key="i"
						class="errors-tooltip__item"
						@click="scrollToSection(err.section)"
					>
						{{ err.message }}
					</li>
				</ul>
				<div class="errors-tooltip__arrow" />
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import type { PokerConfig, PokerPlayer } from '~/types/poker'
import PokerInput from '~/components/apps/poker-board/PokerInput.vue'
import PokerTimeInput from '~/components/apps/poker-board/PokerTimeInput.vue'
import trophyGold from '~/assets/images/trophy-gold.png'
import trophySilver from '~/assets/images/trophy-silver.png'
import trophyBronze from '~/assets/images/trophy-bronze.png'
import imgPokerCards from '~/assets/images/poker-cards.png'
import imgBandit from '~/assets/images/bandit.png'
import imgPokerChip from '~/assets/images/poker-chip.png'
import imgHelmet from '~/assets/images/helmet.png'
import imgGold from '~/assets/images/gold.png'
import imgSetting from '~/assets/images/setting.png'

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
const buyIn = ref(1000)
const gameDurationMinutes = ref(180)
const maxRebuys = ref(2)
const rebuyPeriodMinutes = ref(60)

// --- Секция 2: Призовые ---
const prizes = ref<[number, number, number]>([50, 30, 20])
const prizeLabels = ['1 место', '2 место', '3 место']
const trophyIcons = [trophyGold, trophySilver, trophyBronze]
const prizesSum = computed(() => prizes.value[0] + prizes.value[1] + prizes.value[2])
const isPrizesValid = computed(() => prizesSum.value === 100)

const totalPotPreview = computed(() => playerCount.value * buyIn.value)
const prizeAmountsPreview = computed(() =>
	prizes.value.map(p => Math.round(totalPotPreview.value * p / 100)),
)

// --- Секция 3: Блайнды ---
const startSB = ref(25)
const startBB = computed(() => startSB.value * 2)
const blindInterval = ref(15)
const blindMultiplier = ref(2)

const blindLevelsPreview = computed(() => {
	const levels: { level: number; sb: number; bb: number }[] = []
	for (let i = 0; i < 8; i++) {
		const rawSB = startSB.value * (blindMultiplier.value ** i)
		const rawBB = startBB.value * (blindMultiplier.value ** i)
		const sb = Math.max(Math.round(rawSB), 1)
		const bb = Math.max(Math.round(rawBB), 1)
		levels.push({ level: i + 1, sb, bb })
	}
	return levels
})

// --- Секция 4: Фишки ---
const buyInChips = ref(2000)

const rubPerChipDisplay = computed(() => {
	if (buyInChips.value === 0) return '0'
	const raw = buyIn.value / buyInChips.value
	return parseFloat(raw.toFixed(4)).toLocaleString('ru-RU', { maximumFractionDigits: 4 })
})

const chipsPerRubRaw = computed(() => {
	if (buyIn.value === 0) return 0
	return parseFloat((buyInChips.value / buyIn.value).toFixed(4))
})

const chipsPerRubDisplay = computed(() => chipsPerRubRaw.value.toLocaleString('ru-RU', { maximumFractionDigits: 4 }))

// pluralizeChip — auto-imported из utils/pluralize.ts

const chipsPerRubUnit = computed(() => pluralizeChip(chipsPerRubRaw.value))

// --- Секция 5: Игроки ---
const FUN_NAMES = [
	'Дама ДикПик', 'Блефмастер', 'Покерфейс', 'Ва-банк Ёбанк', 'Туз в жопе',
	'Шулер-хуюлер', 'BigDick Stack', 'Картёжник', 'All-in Алкаш', 'Фишкожор',
	'Хуяльный Флеш', 'Royal Хуяль', 'Чипоед', 'Ебать-колл', 'Кинг-Хуинг',
	'Full Хаус', 'Дилер Хуилер', 'PokerМамка', 'Тузик-Пузик', 'River Крыса',
	'Казиноёб', 'Флопзилла', 'Мистер Фолд', 'Бет-мен', 'Ривер Кинг',
	'Чек-Хуек', 'Донк Ёбт', 'Nuts Мэн', 'Колл-машина', 'Тильт Тоха',
	'Слоу Ролл Бл*', 'Фишка Судьбы', 'Крупье Хуюпье', 'Мёртвый Хенд', 'Стрит Боец',
	'Барон Блайнд', 'Pocket Ракета', 'Мадам Ребай', 'Флеш Гордон', 'Дядя Фолд',
	'Ас Хуяс', 'Пиковый Хер', 'Chip Licker', 'Раздатчик Зла', 'The Гриндер',
	'Катала-Ебала', 'Bubble Бой', 'Рыба-пила', 'Хитрожопый Лис', 'Шортстек Саня',
	'Монстр-хуёт', 'Трефовый Хрен', 'Lady Дрюк', 'Блайнд Спот', 'Турнирный Волк',
	'Fish & Tits', 'Бубновый Хуб', 'Нитовый Нил', 'Sharkboy', 'Оверпара Оля',
]

const getRandomName = (usedNames: string[]): string => {
	const available = FUN_NAMES.filter(n => !usedNames.includes(n))
	if (available.length === 0) return `Игрок ${usedNames.length + 1}`
	return available[Math.floor(Math.random() * available.length)]!
}

interface SetupPlayer {
	id: number
	name: string
	avatarId: string
}

const players = ref<SetupPlayer[]>([])

const generatePlayers = (count: number) => {
	const usedSeeds: string[] = []
	const usedNames: string[] = []
	const newPlayers: SetupPlayer[] = []
	for (let i = 0; i < count; i++) {
		// Сохраняем существующего игрока, если он есть
		const existing = players.value[i]
		if (existing) {
			newPlayers.push(existing)
			usedSeeds.push(existing.avatarId)
			usedNames.push(existing.name)
		}
		else {
			const seed = getRandomSeed(usedSeeds)
			usedSeeds.push(seed)
			const name = getRandomName(usedNames)
			usedNames.push(name)
			newPlayers.push({
				id: i + 1,
				name,
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

const addBtnRef = ref<HTMLButtonElement | null>(null)

const addPlayer = () => {
	if (players.value.length >= 9) return
	const usedSeeds = players.value.map(p => p.avatarId)
	const usedNames = players.value.map(p => p.name)
	const seed = getRandomSeed(usedSeeds)
	const name = getRandomName(usedNames)
	const id = players.value.length > 0 ? Math.max(...players.value.map(p => p.id)) + 1 : 1
	players.value.push({
		id,
		name,
		avatarId: seed,
	})
	playerCount.value = players.value.length
	nextTick(() => {
		addBtnRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
	})
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

const rerollName = (index: number) => {
	const player = players.value[index]
	if (!player) return
	const usedNames = players.value
		.filter((_, i) => i !== index)
		.map(p => p.name.trim())
	player.name = getRandomName(usedNames)
}

const isNameEmpty = (index: number): boolean => {
	const player = players.value[index]
	if (!player) return false
	return player.name.trim() === ''
}

const isNameDuplicate = (index: number): boolean => {
	const player = players.value[index]
	if (!player) return false
	const name = player.name.trim().toLowerCase()
	if (!name) return false
	return players.value.some((p, i) => i !== index && p.name.trim().toLowerCase() === name)
}

const isNameInvalid = (index: number): boolean => isNameEmpty(index) || isNameDuplicate(index)

const hasDuplicateNames = computed(() => {
	const names = players.value.map(p => p.name.trim().toLowerCase())
	return new Set(names).size !== names.length
})

const hasEmptyNames = computed(() =>
	players.value.some(p => p.name.trim() === ''),
)

// --- Валидация ---
interface ValidationError {
	message: string
	section: string
}

const validationErrors = computed<ValidationError[]>(() => {
	const errors: ValidationError[] = []

	if (tournamentName.value.trim() === '') {
		errors.push({ message: 'Название турнира не задано', section: 'basic' })
	}
	if (playerCount.value < 3 || playerCount.value > 9) {
		errors.push({ message: 'Количество игроков: от 3 до 9', section: 'basic' })
	}
	if (buyIn.value <= 0) {
		errors.push({ message: 'Размер закупа должен быть больше 0', section: 'basic' })
	}
	if (gameDurationMinutes.value < 15) {
		errors.push({ message: 'Длительность игры — минимум 15 минут', section: 'basic' })
	}
	if (maxRebuys.value < 0) {
		errors.push({ message: 'Количество ребаев не может быть отрицательным', section: 'basic' })
	}
	if (rebuyPeriodMinutes.value < 0) {
		errors.push({ message: 'Период ребаев не может быть отрицательным', section: 'basic' })
	}
	if (!isPrizesValid.value) {
		errors.push({ message: 'Сумма призовых должна быть 100%', section: 'prizes' })
	}
	if (startSB.value <= 0) {
		errors.push({ message: 'Начальный SB должен быть больше 0', section: 'blinds' })
	}
	if (startBB.value <= 0) {
		errors.push({ message: 'Начальный BB должен быть больше 0', section: 'blinds' })
	}
	if (blindInterval.value <= 0) {
		errors.push({ message: 'Интервал роста блайндов должен быть больше 0', section: 'blinds' })
	}
	if (blindMultiplier.value <= 1) {
		errors.push({ message: 'Множитель роста должен быть больше 1', section: 'blinds' })
	}
	if (buyInChips.value <= 0) {
		errors.push({ message: 'Закуп в фишках должен быть больше 0', section: 'chips' })
	}
	if (hasEmptyNames.value) {
		errors.push({ message: 'Имена игроков не могут быть пустыми', section: 'players' })
	}
	if (hasDuplicateNames.value) {
		errors.push({ message: 'Имена игроков должны быть уникальными', section: 'players' })
	}

	return errors
})

const isFormValid = computed(() => validationErrors.value.length === 0)

const showErrorsTooltip = ref(false)
const startBtnRef = ref<HTMLButtonElement | null>(null)

const errorsTooltipStyle = computed(() => {
	const btn = startBtnRef.value
	if (!btn) return {}
	const rect = btn.getBoundingClientRect()
	return {
		position: 'fixed' as const,
		bottom: `${window.innerHeight - rect.top + 8}px`,
		right: `${window.innerWidth - rect.right}px`,
	}
})

const scrollToSection = (sectionId: string) => {
	const el = document.querySelector(`[data-section="${sectionId}"]`)
	if (el) {
		el.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}
	showErrorsTooltip.value = false
}

// --- Старт турнира ---
const startTournament = () => {
	if (!isFormValid.value) return

	const config: PokerConfig = {
		name: tournamentName.value.trim() || defaultTournamentName,
		buyIn: buyIn.value,
		maxRebuys: maxRebuys.value,
		rebuyPeriodMinutes: rebuyPeriodMinutes.value,
		gameDurationMinutes: gameDurationMinutes.value,
		prizes: [...prizes.value],
		blinds: {
			startSB: startSB.value,
			startBB: startBB.value,
			intervalMinutes: blindInterval.value,
			multiplier: blindMultiplier.value,
		},
		buyInChips: buyInChips.value,
		gameSpeed: 'standard',
		chipCase: [],
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
	max-width: 1100px;
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
	display: flex;
	align-items: center;
	gap: 10px;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.5rem;
	font-weight: 800;
	color: var(--poker-text);
}

.setup-header__title .section-icon {
	width: 32px;
	height: 32px;
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
	overflow: hidden auto;
	padding: 24px 28px;
	display: flex;
	flex-direction: column;
	gap: 32px;
}

/* --- Section --- */
.setup-section__title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.125rem;
	font-weight: 700;
	color: var(--poker-text);
	margin-bottom: 16px;
}

.section-icon {
	width: 28px;
	height: 28px;
	flex-shrink: 0;
	vertical-align: middle;
}

/* --- Grid --- */
.setup-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(200px, 1fr));
	gap: 16px;
}

/* --- Field --- */
.field--wide {
	grid-column: 1 / 4;
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
	align-items: flex-start;
	gap: 60px;
}

.prizes__rows {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.prizes__row {
	display: flex;
	align-items: center;
	gap: 12px;
}

.prizes__label {
	display: flex;
	align-items: center;
	gap: 6px;
	width: 120px;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 0.9375rem;
	font-weight: 600;
	flex-shrink: 0;
}

.prizes__trophy {
	width: 28px;
	height: 28px;
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
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.125rem;
	font-weight: 800;
	color: var(--poker-gold);
	white-space: nowrap;
}

.prizes__summary {
	width: 250px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 4px;
	padding: 26px 40px;
	border-radius: var(--poker-radius-sm, 8px);
	border: 1px solid var(--poker-border);
	background: var(--poker-bg-input, #2D333B);
	flex-shrink: 0;
	transition: border-color 0.3s, background 0.3s;
}

.prizes__summary--valid {
	border-color: var(--poker-green);
	background: rgb(16 185 129 / 8%);
}

.prizes__summary--error {
	border-color: var(--poker-red, #EF4444);
	background: rgb(239 68 68 / 8%);
}

.prizes__summary-value {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.5rem;
	font-weight: 800;
	line-height: 1;
}

.prizes__summary--valid .prizes__summary-value {
	color: var(--poker-green);
}

.prizes__summary--error .prizes__summary-value {
	color: var(--poker-red, #EF4444);
}

.prizes__summary-label {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 0.8125rem;
	font-weight: 600;
	letter-spacing: 0.02em;
}

.prizes__summary--valid .prizes__summary-label {
	color: var(--poker-green);
}

.prizes__summary--error .prizes__summary-label {
	color: var(--poker-red, #EF4444);
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
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.8125rem;
	font-weight: 500;
	color: var(--poker-text-muted);
	margin-bottom: 6px;
}

.blinds-table {
	width: 100%;
	flex: 1;
	table-layout: fixed;
	border-collapse: separate;
	border-spacing: 0;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 1.125rem;
	background: var(--poker-bg-card, #21252D);
	border-radius: var(--poker-radius-sm);
	overflow: hidden;
}

.blinds-table th {
	text-align: left;
	padding: 10px 14px;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 0.8125rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: var(--poker-text-muted);
	background: var(--poker-bg-input, #2D333B);
	border-bottom: 1px solid var(--poker-border);
}

.blinds-table td {
	padding: 10px 14px;
	color: var(--poker-text-secondary);
	border-bottom: 1px solid var(--poker-border);
	font-variant-numeric: tabular-nums;
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
.chips-layout {
	display: flex;
	gap: 24px;
	align-items: flex-start;
}

.chips-layout .field {
	max-width: 220px;
}

.chip-rate-card {
	margin-top: 26px;
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 6px 20px;
	border-radius: var(--poker-radius-sm, 8px);
}

.chip-rate-card__row {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 4px 0;
}

.chip-rate-card__label {
	display: inline-flex;
	align-items: center;
	gap: 2px;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 1.125rem;
	color: var(--poker-text-muted);
}

.chip-rate-card__eq {
	font-size: 0.875rem;
	color: var(--poker-text-muted);
}

.chip-rate-card__value {
	display: inline-flex;
	align-items: center;
	gap: 2px;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.125rem;
	font-weight: 800;
	color: var(--poker-gold);
	font-variant-numeric: tabular-nums;
}

.chip-rate-card__divider {
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 1.125rem;
	color: var(--poker-text-muted);
}


/* --- Players Grid --- */
.players-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12px;
	min-width: 0;
}

.player-card {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	padding: 20px 12px 16px;
	min-width: 0;
	height: 180px;
	background: var(--poker-bg-input);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius);
	transition: border-color 0.2s;
}


.player-card__num {
	position: absolute;
	top: 8px;
	left: 10px;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 0.95rem;
	font-weight: 800;
	color: var(--poker-text-muted);
}

.player-card__remove {
	position: absolute;
	top: 6px;
	right: 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	border: none;
	border-radius: var(--poker-radius-sm);
	background: transparent;
	color: var(--poker-text-muted);
	cursor: pointer;
	transition: color 0.2s, background 0.2s;
}

.player-card__remove:hover {
	color: var(--poker-red);
	background: var(--poker-red-dim);
}

.player-card__avatar {
	width: 80px;
	height: 80px;
	border: none;
	border-radius: 50%;
	outline: 2px solid var(--poker-border);
	background: var(--poker-bg-card);
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	flex-shrink: 0;
	transition: outline 0.2s;
}

.player-card__avatar:hover {
	outline: 2px solid var(--poker-green);
}

.player-card__avatar :deep(svg) {
	width: 100%;
	height: 100%;
}

.player-card__name-row {
	display: flex;
	align-items: center;
	gap: 6px;
	width: 100%;
}

.player-card__name {
	flex: 1;
	min-width: 0;
}

.player-card__name :deep(input) {
	text-align: center;
}

.player-card__reroll {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border: none;
	border-radius: var(--poker-radius-sm);
	background: transparent;
	color: var(--poker-text-muted);
	cursor: pointer;
	flex-shrink: 0;
	transition: color 0.2s, background 0.2s, transform 0.2s;
}

.player-card__reroll:hover {
	color: var(--poker-gold);
	background: var(--poker-gold-dim);
}

.player-card__reroll:active {
	transform: rotate(90deg);
}

/* Кнопка добавления игрока */
.player-card--add {
	cursor: pointer;
	border-style: dashed;
	border-color: var(--poker-border);
	background: transparent;
	justify-content: center;
	gap: 8px;
	color: var(--poker-text-muted);
	transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.player-card--add:hover {
	border-color: var(--poker-green);
	color: var(--poker-green);
	background: rgb(16 185 129 / 8%);
}

.player-card__add-icon {
	font-size: 2.5rem;
}

.player-card__add-text {
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.85rem;
	font-weight: 600;
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

.setup-footer__btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

.setup-footer__btn:hover:not(:disabled) {
	background: var(--poker-green-hover);
	transform: translateY(-1px);
}

.setup-footer__btn:active:not(:disabled) {
	transform: translateY(0);
}

.setup-footer__wrapper {
	position: relative;
}


/* --- Utility --- */

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

.player-avatar-wrapper {
	width: 100%;
	height: 100%;
}
</style>

<style>
/* Тултип ошибок — вне scoped, т.к. рендерится через Teleport */
.errors-tooltip {
	min-width: 280px;
	max-width: 380px;
	background: var(--poker-bg-elevated, #2C2C32);
	border: 1px solid var(--poker-border, rgb(255 255 255 / 8%));
	border-radius: 12px;
	box-shadow: 0 8px 24px rgb(0 0 0 / 50%);
	padding: 8px 0;
	z-index: 10000;
}

.errors-tooltip__arrow {
	position: absolute;
	bottom: -5px;
	right: 32px;
	width: 10px;
	height: 10px;
	background: var(--poker-bg-elevated, #2C2C32);
	border-right: 1px solid var(--poker-border, rgb(255 255 255 / 8%));
	border-bottom: 1px solid var(--poker-border, rgb(255 255 255 / 8%));
	transform: rotate(45deg);
}

.errors-tooltip__list {
	list-style: none;
	margin: 0;
	padding: 0;
}

.errors-tooltip__item {
	padding: 8px 16px;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.8rem;
	font-weight: 500;
	color: var(--poker-red, #EF4444);
	cursor: pointer;
	transition: background 0.15s;
}

.errors-tooltip__item:hover {
	background: rgb(255 255 255 / 6%);
}

.errors-tooltip__item::before {
	content: '❗ ';
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
	transition: opacity 0.2s, transform 0.2s;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
	opacity: 0;
	transform: translateY(4px);
}
</style>
