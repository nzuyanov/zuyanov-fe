<template>
	<Teleport to="body">
		<div class="setup-overlay poker-shimmer-overlay">
			<div class="setup-modal">
				<header class="setup-header">
					<h1 class="setup-header__title"><img :src="imgPokerCards" alt="" class="section-icon"> Настройки турнира</h1>
					<button class="setup-header__close" @click="emit('close')">
						<RxCross2 />
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
									v-model="store.config.name"
									placeholder="Турнир 23.03.2026"
									:error="store.config.name.trim() === ''"
								/>
							</div>
							<div class="field">
								<label class="field__label">Количество игроков</label>
								<PokerInput
									v-model="store.config.playerCount"
									type="number"
									:min="PLAYERS_MIN"
									:max="PLAYERS_MAX"
								/>
							</div>
							<div class="field">
								<label class="field__label">Размер закупа (buy-in)</label>
								<PokerInput
									v-model="store.config.buyIn"
									type="number"
									:min="0"
									:step="100"
									suffix="₽"
									:error="store.config.buyIn <= 0"
								/>
							</div>
							<div class="field">
								<label class="field__label">Длительность игры</label>
								<PokerTimeInput
									v-model="store.config.gameDurationMinutes"
									:min="GAME_DURATION_MIN"
									:max="GAME_DURATION_MAX"
									:step="15"
								/>
							</div>
							<div class="field">
								<label class="field__label">Ребаев на игрока</label>
								<PokerInput
									v-model="store.config.maxRebuys"
									type="number"
									:min="0"
									:error="store.config.maxRebuys < 0"
								/>
							</div>
							<div class="field">
								<label class="field__label">Период ребаев</label>
								<PokerTimeInput
									v-model="store.config.rebuyPeriodMinutes"
									:min="0"
									:max="store.config.gameDurationMinutes"
									:step="5"
								/>
							</div>
						</div>
					</section>

					<!-- Секция 2: Призовые места -->
					<section class="setup-section" data-section="prizes">
						<h2 class="setup-section__title"><img :src="moneyCase" alt="" class="section-icon"> Призовые места</h2>
						<div class="prizes">
							<div class="prizes__rows">
								<div
									v-for="(place, i) in store.config.prizes"
									:key="place"
									class="prizes__row"
								>
									<span class="prizes__label">
										<img :src="trophyIcons[i]" alt="" class="prizes__trophy">
										{{ i + 1 }} место
									</span>
									<div class="prizes__input-wrap">
										<PokerInput
											:model-value="store.config.prizes[i] ?? 0"
											type="number"
											:min="0"
											:max="100"
											small
											:step="5"
											suffix="%"
											@update:model-value="store.config.prizes[i] = Number($event)"
										/>
									</div>
									<span class="prizes__amount">
										{{ (store.prizeInCash[i] ?? 0).toLocaleString('ru-RU') }} ₽
									</span>
								</div>
							</div>
							<div
								class="prizes__summary"
								:class="{
									'prizes__summary--valid': store.isPrizesValid,
									'prizes__summary--error': !store.isPrizesValid,
								}"
							>
								<span class="prizes__summary-value">{{ store.prizesSum }}%</span>
								<span class="prizes__summary-label">{{ store.isPrizesValid ? 'Сумма ок' : 'Должно быть 100%' }}</span>
							</div>
						</div>
					</section>

					<!-- Секция 3: Блайнды -->
					<section class="setup-section" data-section="blinds">
						<h2 class="setup-section__title"><img :src="imgBandit" alt="" class="section-icon"> Скорость игры и блайнды</h2>
						<div class="blinds-layout-v2">
							<div class="speed-selector">
								<button
									v-for="speed in speedOptions"
									:key="speed.value"
									:class="getSpeedButtonClass(speed, store.config.gameSpeed === speed.value)"
									@click="store.config.gameSpeed = speed.value"
								>
									<img :src="speed.image" alt="" class="section-speed-icon">
									<span class="speed-button__label">{{ speed.label }}</span>
								</button>
							</div>

							<div class="blinds-info">
								<span class="blinds-info__item">Стартовая глубина: <strong>{{ store.gameSetup.startingDepthBB }} BB</strong></span>
								<span class="blinds-info__sep">•</span>
								<span class="blinds-info__item">Ожидаемое завершение: уровень <strong>{{ store.gameSetup.expectedEndLevel }}</strong></span>
							</div>

							<div v-if="store.isGameTooShort" class="blinds-warn blinds-warn--short">
								<span class="blinds-warn__icon">⚡</span>
								<span>Стартовая глубина всего {{ store.gameSetup.startingDepthBB }} BB — игра будет очень быстрой для такого чемодана. Попробуй уменьшить количество ребаев, добавить время или выбрать скорость помедленнее.</span>
							</div>
							<div v-if="store.isGameTooLong" class="blinds-warn blinds-warn--long">
								<span class="blinds-warn__icon">🐢</span>
								<span>Стартовая глубина {{ store.gameSetup.startingDepthBB }} BB — игра может затянуться. Попробуй уменьшить чемодан, сократить время или выбрать скорость побыстрее.</span>
							</div>

							<div class="blinds-table-wrap">
								<table class="blinds-table">
									<colgroup>
										<col style="width: 12%">
										<col style="width: 22%">
										<col style="width: 22%">
										<col style="width: 22%">
										<col style="width: 22%">
									</colgroup>
									<thead>
										<tr>
											<th>Уровень</th>
											<th>SB</th>
											<th>BB</th>
											<th>MIN рейз</th>
											<th>Длительность</th>
										</tr>
									</thead>
									<tbody>
										<tr
											v-for="level in store.gameSetup.blindLevels"
											:key="level.level"
											:class="{ 'blinds-table__spare': level.level > store.gameSetup.expectedEndLevel }"
										>
											<td class="blinds-table__level">{{ level.level }}</td>
											<td>{{ level.smallBlind.toLocaleString('ru-RU') }}</td>
											<td>{{ level.bigBlind.toLocaleString('ru-RU') }}</td>
											<td>{{ (level.bigBlind * 2).toLocaleString('ru-RU') }}</td>
											<td>{{ level.durationMinutes }} мин</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</section>

					<!-- Секция 4: Фишки -->
					<section class="setup-section" data-section="chips">
						<h2 class="setup-section__title"><img :src="imgPokerChip" alt="" class="section-icon"> Фишки</h2>
						<div class="chips-layout-v2">
							<!-- Чемодан фишек -->
							<div class="chip-case">
								<label class="field__label">Содержимое чемодана</label>
								<div class="chipCaseTableWrap">
									<table class="chipCaseTable">
										<thead>
											<tr>
												<th class="chipCaseThDrag" />
												<th>Номинал</th>
												<th>Цвет</th>
												<th>Количество</th>
												<th />
											</tr>
										</thead>
										<draggable
											v-model="store.config.chipCase"
											tag="tbody"
											item-key="id"
											handle=".chipCaseDragHandle"
											ghost-class="chipCaseGhost"
											drag-class="chipCaseDrag"
											animation="200"
										>
											<template #item="{ element: chip }">
												<tr>
													<td class="chipCaseTdDrag">
														<button class="chipCaseDragHandle" type="button">
															<MdOutlineDragIndicator />
														</button>
													</td>
													<td>
														<PokerInput
															:model-value="chip.denomination"
															type="number"
															:min="1"
															small
															:error="isDenomDuplicate(chip.id, chip.denomination)"
															@update:model-value="updateDenom(chip, Number($event))"
														/>
													</td>
													<td>
														<PokerChipColorPicker
															:model-value="chip.color"
															:value="chip.denomination"
															@update:model-value="chip.color = $event"
														/>
													</td>
													<td>
														<PokerInput
															:model-value="chip.totalCount"
															type="number"
															:min="0"
															small
															@update:model-value="chip.totalCount = Number($event)"
														/>
													</td>
													<td>
														<button
															v-if="store.config.chipCase.length > 1"
															class="chipCaseRemove"
															@click="store.removeChipDenom(chip.id)"
														>
															<Fa6Trash size="15" />
														</button>
													</td>
												</tr>
											</template>
										</draggable>
									</table>
								</div>
								<button class="chipCaseAdd" @click="store.addChipDenom">
									<Fa6Plus /> Добавить номинал
								</button>
							</div>

							<!-- Стартовый стек + курс + округление -->
							<div class="chip-stack-row">
								<div class="stack-card">
									<span class="stack-card__label">Стартовый стек</span>
									<span class="stack-card__value">{{ store.gameSetup.startingStack.toLocaleString('ru-RU') }}</span>
								</div>
								<PokerChipRate />
								<div v-if="store.gameSetup.niceRateAvailable" class="nice-rate">
									<div class="nice-rate__content">
										<div class="nice-rate__text">
											<span class="nice-rate__icon">💡</span>
											<span>
												Округлить стек до&nbsp;{{ store.gameSetup.niceRateAvailable.niceStack }}&nbsp;— курс
												станет <strong>{{ niceRateFormatted }}&nbsp;₽</strong>
											</span>
										</div>
										<label class="nice-rate__toggle">
											<input
												v-model="store.niceRateEnabled"
												type="checkbox"
												class="nice-rate__checkbox"
											>
											<span class="nice-rate__switch" />
										</label>
									</div>
								</div>
							</div>

							<!-- Раздача на игрока -->
							<div v-if="store.gameSetup.chipDistributionPerPlayer.length > 0" class="chip-dist">
								<label class="field__label">👤 Раздача на игрока</label>
								<div class="chip-dist__list">
									<div
										v-for="entry in store.gameSetup.chipDistributionPerPlayer"
										:key="entry.id"
										class="chip-dist__item"
									>
										<PokerChip :value="entry.denomination" :color="entry.color" :size="60" />
										<div class="chipDistCount">&times;</div>
										<div class="chipDistCount">{{ entry.count }}</div>
									</div>
									<span class="chip-dist__eq">=</span>
									<div class="chip-dist__total-count">
										<span class="chip-dist__total-value">{{ store.gameSetup.startingChipCount }}</span>
										<img :src="imgPokerChip" alt="" class="chipImage">
									</div>
								</div>

								<!-- Статус доступности -->
								<div class="chip-avail">
									<span
										class="chip-avail__badge"
										:class="chipAvailBadgeClass"
									>
										{{ chipAvailBadgeText }}
									</span>
									<span v-if="store.gameSetup.warnings.length > 0" class="chip-avail__hint">
										{{ store.gameSetup.warnings.join(',') }}
									</span>
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
									<Fa6Trash size="15" />
								</button>
								<span class="player-card__num">{{ i + 1 }}</span>
								<div class="player-card__avatar-row">
									<button
										class="player-card__bg"
										@click="setPlayerBg(i)"
									>
										<PiSelectionBackgroundDuotone size="32" />
									</button>
									<button
										class="player-card__avatar"
										@click="cycleAvatar(i)"
									>
										<!-- eslint-disable-next-line vue/no-v-html -->
										<span class="player-avatar-wrapper" v-html="getAvatarSvg(player.avatarId, player.gender, player.avatarBackground)"/>
									</button>
									<div class="player-card__gender-switch" role="group" aria-label="Пол игрока">
										<button
											type="button"
											class="player-card__gender-btn player-card__gender-btn--male"
											:class="{ 'player-card__gender-btn--active': player.gender === 'male' }"
											@click="setGender(i, 'male')"
										>
											♂
										</button>
										<button
											type="button"
											class="player-card__gender-btn player-card__gender-btn--female"
											:class="{ 'player-card__gender-btn--active': player.gender === 'female' }"
											@click="setGender(i, 'female')"
										>
											♀
										</button>
									</div>
								</div>
								<div class="player-card__name-row">
									<PokerInput
										v-model="player.name"
										class="player-card__name"
										:error="isNameInvalid(i)"
										:placeholder="`Игрок ${i + 1}`"
										:maxlength="PLAYER_NAME_MAX_LENGTH"
									/>
									<button
										class="player-card__reroll"
										@click="rerollName(i)"
									>
										<GiPerspectiveDiceSixFacesRandom size="20px" />
									</button>
								</div>
							</div>
							<button
								v-if="players.length < PLAYERS_MAX"
								ref="addBtnRef"
								class="player-card player-card--add"
								@click="addPlayer"
							>
								<Fa6Plus class="player-card__add-icon" />
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
							class="poker-btn-green setup-footer__btn"
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
	import type { AvatarBackground, ChipCaseEntry, GameSpeed, PlayerGender, PokerPlayer } from '~/types/poker'
	import {
		FUN_NAMES,
		GAME_DURATION_MAX,
		GAME_DURATION_MIN,
		PLAYER_NAME_MAX_LENGTH,
		PLAYERS_MAX,
		PLAYERS_MIN,
	} from '~/constants/poker'
	import draggable from 'vuedraggable'
	import PokerInput from '~/components/apps/poker-board/PokerInput.vue'
	import PokerTimeInput from '~/components/apps/poker-board/PokerTimeInput.vue'
	import PokerChip from '~/components/apps/poker-board/PokerChip.vue'
	import PokerChipColorPicker from '~/components/apps/poker-board/PokerChipColorPicker.vue'
	import trophyGold from '~/assets/images/trophy-gold.png'
	import trophySilver from '~/assets/images/trophy-silver.png'
	import trophyBronze from '~/assets/images/trophy-bronze.png'
	import imgPokerCards from '~/assets/images/poker-cards.png'
	import imgBandit from '~/assets/images/bandit.png'
	import imgPokerChip from '~/assets/images/poker-chip.png'
	import imgHelmet from '~/assets/images/helmet.png'
	import moneyCase from '~/assets/images/money-case.png'
	import imgSetting from '~/assets/images/setting.png'
	import pickupCar from '~/assets/images/pickup-car.png'
	import schoolBus from '~/assets/images/school-bus.png'
	import speedCar from '~/assets/images/speed-car.png'
	import PokerChipRate from '~/components/apps/poker-board/PokerChipRate.vue'
	import { RxCross2 } from 'vue-icons-plus/rx'
	import { Fa6Plus, Fa6Trash } from 'vue-icons-plus/fa6'
	import { MdOutlineDragIndicator } from 'vue-icons-plus/md'
	import { PiSelectionBackgroundDuotone } from 'vue-icons-plus/pi'
	import { GiPerspectiveDiceSixFacesRandom } from 'vue-icons-plus/gi'

	const emit = defineEmits<{
	start: [players: PokerPlayer[]]
	close: []
}>()

const store = usePokerStore()
const { getAvatarSvg, getRandomSeed, getNextSeed, generateRandomBackground } = usePokerAvatars()


const trophyIcons = [trophyGold, trophySilver, trophyBronze]

// --- Секция 3: Блайнды (автогенерация по скорости) ---
type SpeedOption = {
	value: GameSpeed,
	image: string,
	label: string,
}

const speedOptions: SpeedOption[] = [
	{ value: 'slow', image: schoolBus, label: 'Медленная' },
	{ value: 'normal', image: pickupCar, label: 'Стандартная' },
	{ value: 'fast', image: speedCar, label: 'Быстрая' },
]

const getSpeedButtonClass = (option: SpeedOption, isSelected: boolean) => ({
	[`speed-button`]: true,
	[`speed-button-${option.value}`]: true,
	[`speed-button-${option.value}-active`]: isSelected,
})

// --- Секция 4: Фишки — дубликаты номиналов ---
const isDenomDuplicate = (chipId: string, denom: number): boolean =>
	store.config.chipCase.some(c => c.id !== chipId && c.denomination === denom)

const updateDenom = (chip: ChipCaseEntry, value: number) => {
	const duplicate = store.config.chipCase.some(c => c.id !== chip.id && c.denomination === value)
	if (!duplicate) {
		chip.denomination = value
	}
}

const hasDuplicateDenoms = computed(() => {
	const denoms = store.config.chipCase.map(c => c.denomination)
	return new Set(denoms).size !== denoms.length
})

// --- Секция 4: Фишки — округление курса ---
const niceRateFormatted = computed(() => {
	const info = store.gameSetup.niceRateAvailable
	if (!info) return ''
	const rate = info.niceRubPerChip
	return Number.isInteger(rate) ? String(rate) : rate.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
})

const chipAvailBadgeClass = computed(() => {
	if (!store.gameSetup.chipAvailability.enoughForStart) return 'chip-avail__badge--red'
	if (!store.gameSetup.chipAvailability.enoughForRebuys) return 'chip-avail__badge--yellow'
	if (!store.gameSetup.chipAvailability.enoughForAddOns) return 'chip-avail__badge--yellow'
	return 'chip-avail__badge--green'
})

const chipAvailBadgeText = computed(() => {
	if (!store.gameSetup.chipAvailability.enoughForStart) return '❌ Не хватает на старт'
	if (!store.gameSetup.chipAvailability.enoughForRebuys) return '⚠️ Размен на ребаях'
	if (!store.gameSetup.chipAvailability.enoughForAddOns) return '⚠️ Размен на аддонах'
	return '✅ Фишек достаточно'
})


// --- Секция 5: Игроки ---

const getRandomName = (usedNames: string[]): string => {
	const available = FUN_NAMES.filter(n => !usedNames.includes(n))
	if (available.length === 0) return `Игрок ${usedNames.length + 1}`
	return available[Math.floor(Math.random() * available.length)]!
}

interface SetupPlayer {
	id: number
	name: string
	avatarId: string
	gender: PlayerGender
	avatarBackground: AvatarBackground
}

const players = ref<SetupPlayer[]>([])

// Случайный пол для нового игрока
const getRandomGender = (): PlayerGender => (Math.random() < 0.5 ? 'male' : 'female')

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
				gender: getRandomGender(),
				avatarBackground: generateRandomBackground(),
			})
		}
	}
	players.value = newPlayers
}

onMounted(() => {
	generatePlayers(store.config.playerCount)
})

// Обновляем список при изменении количества игроков
watch(() => store.config.playerCount, (count) => {
	const clamped = Math.max(PLAYERS_MIN, Math.min(PLAYERS_MAX, count || PLAYERS_MIN))
	generatePlayers(clamped)
})

const addBtnRef = ref<HTMLButtonElement | null>(null)

const addPlayer = () => {
	if (players.value.length >= PLAYERS_MAX) return
	const usedSeeds = players.value.map(p => p.avatarId)
	const usedNames = players.value.map(p => p.name)
	const seed = getRandomSeed(usedSeeds)
	const name = getRandomName(usedNames)
	const id = players.value.length > 0 ? Math.max(...players.value.map(p => p.id)) + 1 : 1
	players.value.push({
		id,
		name,
		avatarId: seed,
		gender: getRandomGender(),
		avatarBackground: generateRandomBackground(),
	})
	store.config.playerCount = players.value.length
	nextTick(() => {
		addBtnRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
	})
}

const removePlayer = (index: number) => {
	if (players.value.length <= 3) return
	players.value.splice(index, 1)
	store.config.playerCount = players.value.length
}

const cycleAvatar = (index: number) => {
	const player = players.value[index]
	if (player) {
		player.avatarId = getNextSeed(player.avatarId)
	}
}

const setGender = (index: number, gender: PlayerGender) => {
	const player = players.value[index]
	if (!player || player.gender === gender) return
	player.gender = gender
}

const setPlayerBg = (index: number) => {
	const player = players.value[index]
	if (!player) return
	player.avatarBackground = generateRandomBackground()
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

	if (store.config.name.trim() === '') {
		errors.push({ message: 'Название турнира не задано', section: 'basic' })
	}
	if (store.config.playerCount < PLAYERS_MIN || store.config.playerCount > PLAYERS_MAX) {
		errors.push({ message: `Количество игроков: от ${PLAYERS_MIN} до ${PLAYERS_MAX}`, section: 'basic' })
	}
	if (store.config.buyIn <= 0) {
		errors.push({ message: 'Размер закупа должен быть больше 0', section: 'basic' })
	}
	if (store.config.gameDurationMinutes < GAME_DURATION_MIN) {
		errors.push({ message: `Длительность игры — минимум ${GAME_DURATION_MIN} мин`, section: 'basic' })
	}
	if (store.config.maxRebuys < 0) {
		errors.push({ message: 'Количество ребаев не может быть отрицательным', section: 'basic' })
	}
	if (store.config.rebuyPeriodMinutes < 0) {
		errors.push({ message: 'Период ребаев не может быть отрицательным', section: 'basic' })
	}
	if (!store.isPrizesValid) {
		errors.push({ message: 'Сумма призовых должна быть 100%', section: 'prizes' })
	}
	if (store.config.chipCase.length === 0) {
		errors.push({ message: 'Добавьте хотя бы один номинал фишек', section: 'chips' })
	}
	if (hasDuplicateDenoms.value) {
		errors.push({ message: 'Номиналы фишек должны быть уникальными', section: 'chips' })
	}
	if (!store.gameSetup.chipAvailability.enoughForStart) {
		errors.push({ message: 'Не хватает фишек на стартовую раздачу', section: 'chips' })
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

	const gamePlayers: PokerPlayer[] = players.value.map(p => ({
		id: p.id,
		name: p.name.trim(),
		avatarId: p.avatarId,
		gender: p.gender,
		avatarBackground: p.avatarBackground,
		totalContributed: store.config.buyIn,
		rebuysUsed: 0,
		addOnUsed: false,
		isEliminated: false,
		eliminationOrder: null,
	}))

	emit('start', gamePlayers)
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

.section-speed-icon {
	width: 48px;
	height: 48px;
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
	font-size: 1rem;
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

/* --- Blinds layout v2 --- */
.blinds-layout-v2 {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.speed-selector {
	display: flex;
	gap: 10px;
}

.speed-button {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	padding: 12px 16px;
	border: 2px solid transparent;
	border-radius: var(--poker-radius-sm, 8px);
	background: var(--poker-bg-input, #2D333B);
	color: var(--poker-text-secondary);
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 0.9375rem;
	font-weight: 600;
	cursor: pointer;
	transition: border-color 0.2s, background 0.2s, color 0.2s;
}

.speed-button {
	color: var(--poker-text);
}

.speed-button-slow-active {
	color: var(--poker-green-hover);
	background: rgb(16 185 129 / 12%);
	border-color: var(--poker-green);
}

.speed-button-slow:hover {
	color: var(--poker-green-hover);
	background: rgb(16 185 129 / 12%);
}

.speed-button-normal-active {
	border-color: var(--poker-blue);
	background: var(--poker-blue-bg);
	color: var(--poker-blue);
}

.speed-button-normal:hover {
	color: var(--poker-blue-hover);
	background: var(--poker-blue-bg);
}

.speed-button-fast-active {
	border-color: var(--poker-red);
	background: var(--poker-red-dim);
	color: var(--poker-red);
}

.speed-button-fast:hover {
	background: var(--poker-red-dim);
	color: var(--poker-red-hover);
}

.speed-button__label {
	font-size: 0.9375rem;
}

.blinds-info {
	display: flex;
	align-items: center;
	gap: 12px;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 1rem;
	color: var(--poker-text-muted);
}

.blinds-info__item strong {
	color: var(--poker-text-secondary);
	font-weight: 700;
}

.blinds-info__sep {
	color: var(--poker-text-muted);
	opacity: 0.5;
}

/* Предупреждение о длительности */
.blinds-warn {
	display: flex;
	align-items: baseline;
	gap: 8px;
	padding: 10px 14px;
	border-radius: var(--poker-radius-sm, 8px);
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.8125rem;
	line-height: 1.5;
}

.blinds-warn__icon {
	flex-shrink: 0;
}

.blinds-warn--short {
	background: rgb(239 68 68 / 8%);
	border: 1px solid rgb(239 68 68 / 20%);
	color: var(--poker-red, #EF4444);
}

.blinds-warn--long {
	background: rgb(245 158 11 / 8%);
	border: 1px solid rgb(245 158 11 / 20%);
	color: var(--poker-gold, #F59E0B);
}

.blinds-table-wrap {
	max-height: 300px;
	overflow-y: auto;
	border-radius: var(--poker-radius-sm);
	border: 1px solid var(--poker-border);
}

.blinds-table-wrap::-webkit-scrollbar {
	width: 5px;
}

.blinds-table-wrap::-webkit-scrollbar-track {
	background: transparent;
}

.blinds-table-wrap::-webkit-scrollbar-thumb {
	background: rgb(255 255 255 / 15%);
	border-radius: 3px;
}

.blinds-table__spare td {
	opacity: 0.4;
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

/* --- Chips v2 --- */
.chips-layout-v2 {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.chipCaseTableWrap {
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius-sm, 8px);
	overflow: hidden;
}

.chipCaseTable {
	width: 100%;
	border-collapse: separate;
	border-spacing: 0;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.875rem;
}

.chipCaseTable th {
	text-align: left;
	padding: 8px 12px;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 0.75rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: var(--poker-text-muted);
	background: var(--poker-bg-input, #2D333B);
	border-bottom: 1px solid var(--poker-border);
}

.chipCaseThDrag,
.chipCaseTdDrag {
	width: 32px;
	text-align: center;
}

.chipCaseDragHandle {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	margin: 0 auto;
	padding: 0;
	border: none;
	border-radius: var(--poker-radius-sm);
	background: transparent;
	color: var(--poker-text-muted);
	cursor: grab;
	transition: color 0.2s, background 0.2s;
}

.chipCaseDragHandle:hover {
	color: var(--poker-text);
	background: var(--poker-border);
}

.chipCaseDragHandle:active {
	cursor: grabbing;
}

.chipCaseGhost {
	opacity: 0.4;
	background: var(--poker-bg-input, #2D333B);
}

.chipCaseDrag {
	background: var(--poker-bg-elevated, #2C2C32);
	box-shadow: 0 4px 16px rgb(0 0 0 / 40%);
	border-radius: var(--poker-radius-sm);
}

.chipCaseTable th:last-child {
	width: 40px;
}

.chipCaseTable td {
	padding: 6px 8px;
	border-bottom: 1px solid var(--poker-border);
	vertical-align: middle;
}

.chipCaseTable tbody tr:last-child td {
	border-bottom: none;
}

.chipCaseRemove {
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

.chipCaseRemove:hover {
	color: var(--poker-red);
	background: var(--poker-red-dim);
}

.chipCaseAdd {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	margin-top: 8px;
	padding: 8px 16px;
	border: 1px dashed var(--poker-border);
	border-radius: var(--poker-radius-sm, 8px);
	background: transparent;
	color: var(--poker-text-muted);
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 1rem;
	font-weight: 600;
	cursor: pointer;
	transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.chipCaseAdd:hover {
	border-color: var(--poker-green);
	color: var(--poker-green);
	background: rgb(16 185 129 / 8%);
}

.chip-stack-row {
	display: flex;
	gap: 12px;
	align-items: stretch;
}

.stack-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 2px;
	padding: 14px 28px;
	border-radius: var(--poker-radius-sm, 8px);
	border: 1px solid var(--poker-border);
	background: var(--poker-bg-input, #2D333B);
	min-width: 160px;
}

.stack-card__label {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 0.75rem;
	font-weight: 600;
	color: var(--poker-text-muted);
	text-transform: uppercase;
	letter-spacing: 0.04em;
}

.stack-card__value {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.75rem;
	font-weight: 800;
	color: var(--poker-text);
	line-height: 1.2;
}

.stack-card__unit {
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.75rem;
	font-weight: 500;
	color: var(--poker-text-muted);
}

/* Плашка округления курса */
.nice-rate {
	padding: 12px 16px;
	border-radius: var(--poker-radius-sm, 8px);
	background: rgb(245 158 11 / 8%);
	border: 1px solid rgb(245 158 11 / 20%);
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
}

.nice-rate__content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	width: 100%;
}

.nice-rate__text {
	display: flex;
	align-items: baseline;
	gap: 8px;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.8125rem;
	color: var(--poker-text-secondary);
	line-height: 1.5;
}

.nice-rate__text strong {
	color: var(--poker-gold);
	font-weight: 700;
}

.nice-rate__icon {
	flex-shrink: 0;
}

.nice-rate__toggle {
	flex-shrink: 0;
	position: relative;
	display: inline-flex;
	cursor: pointer;
}

.nice-rate__checkbox {
	position: absolute;
	opacity: 0;
	width: 0;
	height: 0;
}

.nice-rate__switch {
	width: 40px;
	height: 22px;
	border-radius: 11px;
	background: var(--poker-bg-input, #2D333B);
	border: 1px solid var(--poker-border);
	position: relative;
	transition: background 0.2s, border-color 0.2s;
}

.nice-rate__switch::after {
	content: '';
	position: absolute;
	top: 2px;
	left: 2px;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: var(--poker-text-muted);
	transition: transform 0.2s, background 0.2s;
}

.nice-rate__checkbox:checked + .nice-rate__switch {
	background: rgb(245 158 11 / 20%);
	border-color: var(--poker-gold);
}

.nice-rate__checkbox:checked + .nice-rate__switch::after {
	transform: translateX(18px);
	background: var(--poker-gold);
}

/* Раздача на игрока */
.chip-dist {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 14px 16px;
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius-sm, 8px);
	background: var(--poker-bg-input, #2D333B);
}

.chip-dist__list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.chip-dist__item {
	padding: 10px;
	border-radius: var(--poker-radius-sm, 8px);
	background: var(--poker-bg-card, #21252D);
	border: 1px solid var(--poker-border);
	font-family: var(--poker-font-mono, 'JetBrains Mono Variable', monospace);
	font-size: 0.8125rem;
	font-weight: 600;
	color: var(--poker-text-secondary);
	font-variant-numeric: tabular-nums;
	display: inline-flex;
	align-items: center;
	gap: 10px;
	min-width: 130px;
}

.chip-dist__summary {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.chip-dist__total {
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.8125rem;
	font-weight: 600;
	color: var(--poker-text-secondary);
	font-variant-numeric: tabular-nums;
}

.chip-dist__warn {
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.8125rem;
	font-weight: 500;
}

.chip-dist__warn--yellow {
	color: var(--poker-gold);
}

.chip-dist__warn--red {
	color: var(--poker-red);
}

/* Статус доступности */
.chip-avail {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-top: 16px;
}

.chip-avail__badge {
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 1rem;
	font-weight: 700;
	padding: 4px 10px;
	border-radius: var(--poker-radius-sm, 8px);
}

.chip-avail__badge--green {
	color: var(--poker-green);
	background: rgb(16 185 129 / 12%);
}

.chip-avail__badge--yellow {
	color: var(--poker-gold);
	background: rgb(245 158 11 / 12%);
}

.chip-avail__badge--red {
	color: var(--poker-red);
	background: rgb(239 68 68 / 12%);
}

.chip-avail__hint {
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 1rem;
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
	gap: 14px;
	padding: 28px 14px 16px;
	min-width: 0;
	height: 232px;
	background: var(--poker-bg-input);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius);
	transition: border-color 0.2s;
}

.player-card__avatar-row {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12px;
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

/* Переключатель пола — вертикальный тумблер справа от аватарки */
.player-card__gender-switch {
	display: flex;
	flex-direction: column;
	gap: 4px;
	padding: 4px;
	background: var(--poker-bg-card);
	border: 1px solid var(--poker-border);
	border-radius: 28px;
	flex-shrink: 0;
}

.player-card__gender-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 44px;
	height: 44px;
	padding: 0;
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.5rem;
	font-weight: 700;
	line-height: 1;
	color: var(--poker-text-muted);
	background: transparent;
	border: none;
	border-radius: 50%;
	cursor: pointer;
	transition: color 0.2s, background 0.2s;
}

.player-card__gender-btn:hover:not(.player-card__gender-btn--active) {
	color: var(--poker-text-primary);
}

/* Мужская — синий */
.player-card__gender-btn--male.player-card__gender-btn--active {
	color: #fff;
	background: #3b82f6;
}

/* Женская — розовый */
.player-card__gender-btn--female.player-card__gender-btn--active {
	color: #fff;
	background: #ec4899;
}

.player-card__avatar {
	width: 120px;
	height: 120px;
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

.player-card__bg {
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	padding: 5px;
	border-radius: var(--poker-radius-sm);
	background: transparent;
	color: var(--poker-text-muted);
	cursor: pointer;
	flex-shrink: 0;
	transition: color 0.2s, background 0.2s, transform 0.2s;
}

.player-card__bg:hover {
	color: var(--poker-green);
	background: var(--poker-green-dim);
}

.player-card__bg:active,
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

.chipDistCount {
	font-size: 1.5rem;
}

.chip-dist__eq {
	font-family: var(--poker-font-mono, 'JetBrains Mono Variable', monospace);
	font-size: 1.5rem;
	font-weight: 700;
	color: var(--poker-text-muted);
	padding: 0 4px;
	align-self: center;
}

.chip-dist__total-count {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 4px;
	align-self: center;
}

.chip-dist__total-value {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 2rem;
	font-weight: 800;
	color: var(--poker-text);
	line-height: 1.2;
}

.chip-dist__total-label {
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.6875rem;
	font-weight: 600;
	color: var(--poker-text-muted);
	text-transform: uppercase;
	letter-spacing: 0.04em;
}

.chipImage {
	height: 40px;
	width: 40px;
}

</style>
