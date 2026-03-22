<template>
	<div class="board">
		<PokerHeader
			:is-paused="store.gameState.status === 'paused'"
			:is-muted="isMuted"
			@back="$emit('back')"
			@toggle-pause="store.togglePause()"
			@toggle-sound="isMuted = !isMuted"
		/>

		<div class="board__body">
			<PokerPlayersGrid
				:players="store.gameState.players"
				class="board__players"
				@rebuy="$emit('rebuy', $event)"
				@eliminate="$emit('eliminate', $event)"
			/>

			<PokerInfoPanel
				class="board__info"
				@next-deal="store.nextDeal()"
			/>
		</div>

		<PokerPositionsBar />
	</div>
</template>

<script setup lang="ts">
import PokerHeader from './PokerHeader.vue'
import PokerPlayersGrid from './PokerPlayersGrid.vue'
import PokerInfoPanel from './PokerInfoPanel.vue'
import PokerPositionsBar from './PokerPositionsBar.vue'

defineEmits<{
	back: []
	rebuy: [playerId: number]
	eliminate: [playerId: number]
}>()

const store = usePokerStore()
const isMuted = ref(true)
</script>

<style scoped>
.board {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

.board__body {
	display: flex;
	flex: 1;
	min-height: 0;
}

.board__players {
	flex: 1;
	min-width: 0;
}

.board__info {
	width: 320px;
	flex-shrink: 0;
}
</style>
