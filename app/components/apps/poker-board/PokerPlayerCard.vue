<template>
	<div
		class="player-card"
		:class="{
			'player-card--eliminated': player.isEliminated,
			'player-card--dealer': role === 'D',
			'player-card--sb': role === 'SB',
			'player-card--bb': role === 'BB',
		}"
	>
		<!-- Бейдж роли (фишка) -->
		<img v-if="role === 'D'" src="~/assets/icons/poker/chip-dealer.svg" alt="D" class="player-card__role-chip">
		<img v-else-if="role === 'SB'" src="~/assets/icons/poker/chip-sb.svg" alt="SB" class="player-card__role-chip">
		<img v-else-if="role === 'BB'" src="~/assets/icons/poker/chip-bb.svg" alt="BB" class="player-card__role-chip">

		<div class="player-card__top">
			<img
				:src="avatarUri"
				alt=""
				class="player-card__avatar"
			>
			<div class="player-card__info">
				<span class="player-card__name">{{ player.name }}</span>
				<span class="player-card__contributed">
					Внёс: <span class="player-card__money">{{ formatMoney(player.totalContributed) }} <Icon name="material-symbols:currency-ruble-rounded" class="rub-icon" /></span>
				</span>
				<span class="player-card__rebuys">
					Ребаев: <span class="player-card__money">{{ player.rebuysUsed }}/{{ maxRebuys }}</span>
				</span>
			</div>
		</div>

		<div v-if="!player.isEliminated" class="player-card__actions">
			<button
				v-if="canRebuy"
				class="player-card__btn player-card__btn--rebuy"
				:class="{ 'player-card__btn--addon': isAddOn }"
				@click="$emit('rebuy', player.id)"
			>
				{{ isAddOn ? '+ Add-on' : '+ Ребай' }}
			</button>
			<button
				class="player-card__btn player-card__btn--eliminate"
				@click="$emit('eliminate', player.id)"
			>
				Выбыл
			</button>
		</div>

		<div v-else class="player-card__eliminated-label">
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

defineEmits<{
	rebuy: [playerId: number]
	eliminate: [playerId: number]
}>()

const { getAvatarDataUri } = usePokerAvatars()

const avatarUri = computed(() => getAvatarDataUri(props.player.avatarId))

const formatMoney = (value: number): string => value.toLocaleString('ru-RU')
</script>

<style scoped>
.player-card {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 14px;
	background: var(--poker-bg-card);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius);
	transition: opacity 0.3s, border-color 0.3s;
}

.player-card--eliminated {
	opacity: 0.4;
	border-color: transparent;
}

.player-card__avatar {
	width: 48px;
	height: 48px;
	border-radius: 50%;
	background: var(--poker-bg-input);
	flex-shrink: 0;
}


.player-card--eliminated .player-card__avatar {
	filter: grayscale(1);
}

.player-card--dealer {
	border-color: rgb(255 255 255 / 70%);
	box-shadow:
		0 0 8px rgb(255 255 255 / 25%),
		0 0 20px rgb(255 255 255 / 15%),
		inset 0 0 8px rgb(255 255 255 / 5%);
}

.player-card--sb {
	border-color: #4a8fd4;
	box-shadow:
		0 0 8px rgb(74 143 212 / 35%),
		0 0 20px rgb(37 99 168 / 25%),
		inset 0 0 8px rgb(74 143 212 / 8%);
}

.player-card--bb {
	border-color: #d4a020;
	box-shadow:
		0 0 8px rgb(212 160 32 / 35%),
		0 0 20px rgb(212 160 32 / 25%),
		inset 0 0 8px rgb(240 200 96 / 8%);
}

.player-card__role-chip {
	position: absolute;
	top: -14px;
	right: 8px;
	width: 28px;
	height: 28px;
	filter: drop-shadow(0 2px 4px rgb(0 0 0 / 50%));
}

.player-card__top {
	display: flex;
	gap: 12px;
	align-items: center;
}

.player-card__info {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
}

.player-card__name {
	font-size: 0.95rem;
	font-weight: 700;
	color: var(--poker-text);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.player-card__contributed,
.player-card__rebuys {
	font-size: 0.8rem;
	color: var(--poker-text-muted);
}

.player-card__money {
	font-family: var(--poker-font-mono);
	color: var(--poker-text-secondary);
}

.player-card__actions {
	display: flex;
	gap: 6px;
}

.player-card__btn {
	flex: 1;
	padding: 6px 8px;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.75rem;
	font-weight: 700;
	border: none;
	border-radius: var(--poker-radius-sm);
	cursor: pointer;
	transition: background 0.2s, transform 0.15s;
}

.player-card__btn:active {
	transform: scale(0.97);
}

.player-card__btn--rebuy {
	background: var(--poker-green-dim);
	color: var(--poker-green);
}

.player-card__btn--rebuy:hover {
	background: var(--poker-green);
	color: #fff;
}

.player-card__btn--addon {
	background: var(--poker-gold-dim);
	color: var(--poker-gold);
}

.player-card__btn--addon:hover {
	background: var(--poker-gold);
	color: #000;
}

.player-card__btn--eliminate {
	background: var(--poker-red-dim);
	color: var(--poker-red);
}

.player-card__btn--eliminate:hover {
	background: var(--poker-red);
	color: #fff;
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

.player-card__eliminated-label {
	text-align: center;
	font-size: 0.8rem;
	font-weight: 700;
	color: var(--poker-red);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}
</style>
