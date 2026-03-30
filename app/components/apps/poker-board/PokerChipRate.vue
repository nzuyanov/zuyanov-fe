<template>
	<div class="chip-rate-card">
		<div class="rate">
			<span class="label">1 <img :src="imgPokerChip" alt="" class="chipImage"> =</span>
			<span class="value">
				{{ store.rubInChip }} ₽
			</span>
		</div>
		<div class="divider">/</div>
		<div class="rate">
			<span class="label">1 ₽ =
			</span>
			<span class="value">{{ store.chipInRub }} <img :src="imgPokerChip" alt="" class="chipImage"></span>
		</div>
	</div>
</template>

<script setup lang="ts">
import imgPokerChip from '~/assets/images/poker-chip.png'

const store = usePokerStore()
</script>

<style scoped>
	.chip-rate-card {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 14px 24px;
		border-radius: var(--poker-radius-sm, 8px);
		border: 1px solid var(--poker-border);
		background: var(--poker-bg-input, #2D333B);
	}

	.rate {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 0;
	}

	.label {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-family: var(--font-body, 'Inter Variable', sans-serif);
		font-size: 1.25rem;
		color: var(--poker-text-muted);
	}

	.value {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
		font-size: 1.375rem;
		font-weight: 800;
		color: var(--poker-gold);
		font-variant-numeric: tabular-nums;
	}

	.chipImage {
		height: 28px;
		width: 28px;
	}

	.divider {
		font-family: var(--font-body, 'Inter Variable', sans-serif);
		font-size: 1.375rem;
		color: var(--poker-text-muted);
	}
</style>