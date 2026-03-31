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
		<!-- Бейдж роли (фишка) -->
		<img v-if="role === 'D'" src="~/assets/icons/poker/chip-dealer.svg" alt="D" class="role">
		<img v-else-if="role === 'SB'" src="~/assets/icons/poker/chip-sb.svg" alt="SB" class="role">
		<img v-else-if="role === 'BB'" src="~/assets/icons/poker/chip-bb.svg" alt="BB" class="role">

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
				<span class="rebuyCount">
					Ребаев: <span class="value">{{ player.rebuysUsed }}/{{ maxRebuys }}</span>
				</span>
			</div>
		</div>

		<div v-if="!player.isEliminated" class="actions">
			<div v-if="canRebuy" class="rebuyWrapper">
				<button
					class="actionButton rebuy"
					:class="{ 'addon': isAddOn }"
					@click="$emit('rebuy', player.id)"
				>
					{{ isAddOn ? '+ Add-on' : '+ Ребай' }}
				</button>
			</div>
			<button
				class="actionButton actionButtonEliminate"
				@click="$emit('eliminate', player.id)"
			>
				Выбыл
			</button>
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

defineEmits<{
	rebuy: [playerId: number]
	eliminate: [playerId: number]
}>()

const { getAvatarDataUri } = usePokerAvatars()

const avatarUri = computed(() => getAvatarDataUri(props.player.avatarId))

const formatMoney = (value: number): string => value.toLocaleString('ru-RU')
</script>

<style scoped>
.card {
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

.eliminated {
	opacity: 0.4;
	border-color: transparent;
}

.avatar {
	width: 48px;
	height: 48px;
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

.role {
	position: absolute;
	top: -14px;
	right: 8px;
	width: 28px;
	height: 28px;
	filter: drop-shadow(0 2px 4px rgb(0 0 0 / 50%));
}

.top {
	display: flex;
	gap: 12px;
	align-items: center;
}

.info {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
}

.name {
	font-size: 0.95rem;
	font-weight: 700;
	color: var(--poker-text);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.totalCash,
.rebuyCount {
	font-size: 0.8rem;
	color: var(--poker-text-muted);
}

.value {
	font-family: var(--poker-font-mono);
	color: var(--poker-text-secondary);
}

.actions {
	display: flex;
	gap: 6px;
	align-items: flex-start;
}

.rebuyWrapper {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 3px;
}

.rebuyWrapper .actionButton {
	width: 100%;
}

.actionButton {
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

.actionButton:active {
	transform: scale(0.97);
}

.rebuy {
	background: var(--poker-green-dim);
	color: var(--poker-green);
}

.rebuy:hover {
	background: var(--poker-green);
	color: #fff;
}

.addon {
	background: var(--poker-gold-dim);
	color: var(--poker-gold);
}

.addon:hover {
	background: var(--poker-gold);
	color: #000;
}

.actionButtonEliminate {
	background: var(--poker-red-dim);
	color: var(--poker-red);
}

.actionButtonEliminate:hover {
	background: var(--poker-red);
	color: #fff;
}

.eliminatedLabel {
	text-align: center;
	font-size: 0.8rem;
	font-weight: 700;
	color: var(--poker-red);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}
</style>
