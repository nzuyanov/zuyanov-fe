<template>
	<div class="players-grid" :class="gridClass">
		<PokerPlayerCard
			v-for="player in players"
			:key="player.id"
			:player="player"
			:role="getPlayerRole(player.id)"
			:can-rebuy="store.canRebuy(player.id)"
			:is-add-on="store.isPlayerAddOn(player.id)"
			:max-rebuys="store.config.maxRebuys"
			:chip-distribution="store.chipDistribution"
			@rebuy="$emit('rebuy', $event)"
			@eliminate="$emit('eliminate', $event)"
		/>
	</div>
</template>

<script setup lang="ts">
import type { PokerPlayer } from '~/types/poker'
import PokerPlayerCard from './PokerPlayerCard.vue'

const props = defineProps<{
	players: PokerPlayer[]
}>()

defineEmits<{
	rebuy: [playerId: number]
	eliminate: [playerId: number]
}>()

const store = usePokerStore()

const getPlayerRole = (playerId: number): 'D' | 'SB' | 'BB' | null => {
	if (store.dealerPlayer?.id === playerId) return 'D'
	if (store.sbPlayer?.id === playerId) return 'SB'
	if (store.bbPlayer?.id === playerId) return 'BB'
	return null
}

// Адаптивная сетка в зависимости от количества игроков
const gridClass = computed(() => {
	const count = props.players.length
	if (count <= 4) return 'players-grid--2cols'
	if (count <= 6) return 'players-grid--3cols'
	if (count <= 9) return 'players-grid--3cols players-grid--compact'
	if (count <= 12) return 'players-grid--4cols players-grid--compact'
	return 'players-grid--5cols players-grid--compact'
})
</script>

<style scoped>
.players-grid {
	display: grid;
	gap: 12px;
	padding: 16px;
	align-content: start;
	overflow-y: auto;
}

.players-grid--2cols {
	grid-template-columns: repeat(2, 1fr);
}

.players-grid--3cols {
	grid-template-columns: repeat(3, 1fr);
}

.players-grid--4cols {
	grid-template-columns: repeat(4, 1fr);
}

.players-grid--5cols {
	grid-template-columns: repeat(5, 1fr);
}

.players-grid--compact :deep(.player-card) {
	padding: 10px;
	gap: 8px;
}

.players-grid--compact :deep(.player-card__avatar) {
	width: 36px;
	height: 36px;
}

.players-grid--compact :deep(.player-card__name) {
	font-size: 0.85rem;
}

.players-grid--compact :deep(.player-card__contributed),
.players-grid--compact :deep(.player-card__rebuys) {
	font-size: 0.7rem;
}

.players-grid--compact :deep(.player-card__btn) {
	font-size: 0.65rem;
	padding: 4px 6px;
}
</style>
