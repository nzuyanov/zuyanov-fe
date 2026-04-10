<template>
	<div
		class="card"
		:class="{
			'eliminated': player.isEliminated,
			'dealer': role === 'D',
			'smallBlind': role === 'SB',
			'bigBlind': role === 'BB',
		}"
	>
		<div class="top">
			<img
				:src="avatarUri"
				alt=""
				class="avatar"
			>
			<div class="info">
				<span class="name">{{ player.name }}</span>
				<span class="totalCash">
					Внёс: <span class="value">{{ formatMoney(player.totalContributed) }} ₽</span>
				</span>

				<!-- Индикаторы ребаев (лампочки) + аддон -->
				<div class="lives">
					<span
						v-for="i in maxRebuys"
						:key="'r' + i"
						class="life"
						:class="i <= player.rebuysUsed ? 'lifeActive' : 'lifeInactive'"
					/>
					<!-- Индикатор аддона -->
					<span
						class="addonIndicator"
						:class="player.addOnUsed ? 'addonUsed' : 'addonAvailable'"
					>
						A
					</span>
				</div>
			</div>
		</div>

		<!-- Дропдаун-меню действий -->
		<div v-if="!player.isEliminated" class="menuWrapper">
			<button
				class="menuButton"
				@click="toggleMenu"
			>
				⋮
			</button>
			<div v-if="menuOpen" class="menuDropdown">
				<button
					v-if="canRebuy"
					class="menuItem rebuy"
					:class="{ 'addon': isAddOn }"
					@click="onRebuy"
				>
					{{ isAddOn ? '+ Add-on' : '+ Ребай' }}
				</button>
				<button
					class="menuItem eliminate"
					@click="onEliminate"
				>
					Выбыл
				</button>
			</div>
		</div>

		<div v-else class="eliminatedLabel">
			Выбыл
		</div>
	</div>
</template>

<script setup lang="ts">
import type { PokerPlayer } from '~/types/poker'

const props = defineProps<{
	player: PokerPlayer
	role: 'D' | 'SB' | 'BB' | null
	canRebuy: boolean
	isAddOn: boolean
	maxRebuys: number
}>()

const emit = defineEmits<{
	rebuy: [playerId: number]
	eliminate: [playerId: number]
}>()

const { getAvatarDataUri } = usePokerAvatars()

const avatarUri = computed(() => getAvatarDataUri(props.player.avatarId, props.player.gender, props.player.avatarBackground))

const formatMoney = (value: number): string => value.toLocaleString('ru-RU')

// --- Дропдаун-меню ---
const menuOpen = ref(false)

const toggleMenu = () => {
	menuOpen.value = !menuOpen.value
}

const onRebuy = () => {
	menuOpen.value = false
	emit('rebuy', props.player.id)
}

const onEliminate = () => {
	menuOpen.value = false
	emit('eliminate', props.player.id)
}

// Закрытие дропдауна при клике вне
const closeMenu = (e: MouseEvent) => {
	const target = e.target as HTMLElement
	if (!target.closest('.menuWrapper')) {
		menuOpen.value = false
	}
}

watch(menuOpen, (val) => {
	if (val) {
		document.addEventListener('click', closeMenu)
	} else {
		document.removeEventListener('click', closeMenu)
	}
})

onUnmounted(() => {
	document.removeEventListener('click', closeMenu)
})
</script>

<style scoped>
.card {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 16px;
	background: var(--poker-bg-card);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius);
	transition: opacity 0.3s, border-color 0.5s ease-in-out, box-shadow 0.5s ease-in-out;
	min-width: 250px;
	min-height: 150px;
}

.eliminated {
	opacity: 0.4;
	border-color: transparent;
}

.avatar {
	width: 64px;
	height: 64px;
	border-radius: 50%;
	background: var(--poker-bg-input);
	flex-shrink: 0;
}

.eliminated .avatar {
	filter: grayscale(1);
}

.dealer {
	border-color: rgb(255 255 255 / 70%);
	box-shadow:
		0 0 8px rgb(255 255 255 / 25%),
		0 0 20px rgb(255 255 255 / 15%),
		inset 0 0 8px rgb(255 255 255 / 5%);
}

.smallBlind {
	border-color: #4a8fd4;
	box-shadow:
		0 0 8px rgb(74 143 212 / 35%),
		0 0 20px rgb(37 99 168 / 25%),
		inset 0 0 8px rgb(74 143 212 / 8%);
}

.bigBlind {
	border-color: #d4a020;
	box-shadow:
		0 0 8px rgb(212 160 32 / 35%),
		0 0 20px rgb(212 160 32 / 25%),
		inset 0 0 8px rgb(240 200 96 / 8%);
}

.top {
	display: flex;
	gap: 14px;
	align-items: center;
}

.info {
	display: flex;
	flex-direction: column;
	gap: 3px;
	min-width: 0;
}

.name {
	font-size: 1.3rem;
	font-weight: 700;
	color: var(--poker-text);
	word-break: break-word;
	line-height: 1.2;
}

.totalCash {
	font-size: 1.1rem;
	color: var(--poker-text-muted);
}

.value {
	color: var(--poker-text-secondary);
}

/* Индикаторы ребаев — «лампочки» */
.lives {
	display: flex;
	align-items: center;
	gap: 6px;
	margin-top: 4px;
}

.life {
	width: 16px;
	height: 16px;
	border-radius: 50%;
	transition: background 0.3s, box-shadow 0.3s;
}

/* Неиспользованный ребай — погасшая лампочка */
.lifeInactive {
	background: rgb(255 255 255 / 12%);
	box-shadow: none;
}

/* Использованный ребай — зелёная горящая лампочка */
.lifeActive {
	background: var(--poker-green);
	box-shadow: 0 0 6px var(--poker-green);
}

/* Индикатор аддона */
.addonIndicator {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	border-radius: 6px;
	font-size: 0.85rem;
	font-weight: 800;
	line-height: 1;
	margin-left: 4px;
	transition: background 0.3s, color 0.3s, box-shadow 0.3s;
}

/* Аддон ещё не использован */
.addonAvailable {
	background: rgb(255 255 255 / 8%);
	color: rgb(255 255 255 / 25%);
	border: 1px solid rgb(255 255 255 / 12%);
}

/* Аддон использован — золотой */
.addonUsed {
	background: var(--poker-gold);
	color: #000;
	box-shadow: 0 0 6px var(--poker-gold);
	border: 1px solid transparent;
}

/* Кнопка-триггер дропдауна */
.menuWrapper {
	position: absolute;
	bottom: 10px;
	right: 10px;
}

.menuButton {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	font-size: 1.5rem;
	font-weight: 700;
	color: var(--poker-text-muted);
	background: var(--poker-border);
	border: none;
	border-radius: 50%;
	cursor: pointer;
	transition: background 0.15s, color 0.15s;
	line-height: 1;
}

.menuButton:hover {
	background: var(--poker-border-hover, rgb(255 255 255 / 16%));
	color: var(--poker-text);
}

/* Выпадающее меню */
.menuDropdown {
	position: absolute;
	bottom: 100%;
	right: 0;
	margin-bottom: 6px;
	display: flex;
	flex-direction: column;
	gap: 6px;
	padding: 8px;
	background: var(--poker-bg-elevated, #2C2C32);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius-sm);
	box-shadow: 0 4px 20px rgb(0 0 0 / 50%);
	z-index: 20;
	min-width: 150px;
}

.menuItem {
	padding: 10px 16px;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 1.05rem;
	font-weight: 700;
	border: none;
	border-radius: var(--poker-radius-sm);
	cursor: pointer;
	transition: background 0.15s;
	text-align: left;
	white-space: nowrap;
}

.menuItem.rebuy {
	background: var(--poker-green-dim);
	color: var(--poker-green);
}

.menuItem.rebuy:hover {
	background: var(--poker-green);
	color: #fff;
}

.menuItem.addon {
	background: var(--poker-gold-dim);
	color: var(--poker-gold);
}

.menuItem.addon:hover {
	background: var(--poker-gold);
	color: #000;
}

.menuItem.eliminate {
	background: var(--poker-red-dim);
	color: var(--poker-red);
}

.menuItem.eliminate:hover {
	background: var(--poker-red);
	color: #fff;
}

.eliminatedLabel {
	text-align: center;
	font-size: 1rem;
	font-weight: 700;
	color: var(--poker-red);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}
</style>
