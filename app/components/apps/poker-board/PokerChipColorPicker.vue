<template>
	<div class="chip-color-picker">
		<div ref="referenceRef" class="chip-color-picker__trigger" @click="toggle">
			<PokerChip :value="value" :color="modelValue" :size="size" />
		</div>
		<div v-if="isOpen" class="chip-color-picker__backdrop" @click="close" />
		<Teleport to="body">
			<Transition name="chip-color-dropdown">
				<div
					v-if="isOpen"
					ref="floatingRef"
					class="chip-color-picker__dropdown"
					:style="floatingStyles"
				>
					<button
						v-for="(colorValue, colorKey) in CHIP_COLORS"
						:key="colorKey"
						class="chip-color-picker__option"
						:class="{ 'chip-color-picker__option--active': modelValue === colorValue }"
						@click="select(colorValue)"
					>
						<PokerChip :value="value" :color="colorValue" :size="optionSize" />
					</button>
					<div ref="arrowRef" class="chip-color-picker__arrow" :style="arrowStyles" />
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { useFloating, offset, flip, shift, arrow, autoUpdate } from '@floating-ui/vue'
import type { Placement } from '@floating-ui/vue'
import PokerChip from '~/components/apps/poker-board/PokerChip.vue'
import { CHIP_COLORS, type ChipColor } from '~/constants/poker'

interface ChipColorPickerProps {
	modelValue: ChipColor
	value?: number | string
	size?: number
	optionSize?: number
	placement?: Placement
}

const props = withDefaults(defineProps<ChipColorPickerProps>(), {
	value: '',
	size: 46,
	optionSize: 38,
	placement: 'top',
})

const emit = defineEmits<{
	'update:modelValue': [color: ChipColor]
}>()

const isOpen = ref(false)

const referenceRef = ref<HTMLElement | null>(null)
const floatingRef = ref<HTMLElement | null>(null)
const arrowRef = ref<HTMLElement | null>(null)

const { floatingStyles, middlewareData } = useFloating(referenceRef, floatingRef, {
	placement: props.placement,
	whileElementsMounted: autoUpdate,
	middleware: [
		offset(10),
		flip(),
		shift({ padding: 8 }),
		arrow({ element: arrowRef }),
	],
})

const arrowStyles = computed(() => {
	const arrowData = middlewareData.value.arrow
	if (!arrowData) return {}

	const staticSide: Record<string, string> = {
		top: 'bottom',
		right: 'left',
		bottom: 'top',
		left: 'right',
	}

	const placement = props.placement.split('-')[0]!
	const side = staticSide[placement] ?? 'bottom'

	return {
		left: arrowData.x != null ? `${arrowData.x}px` : '',
		top: arrowData.y != null ? `${arrowData.y}px` : '',
		[side]: '-5px',
	}
})

const toggle = () => {
	isOpen.value = !isOpen.value
}

const close = () => {
	isOpen.value = false
}

const select = (color: ChipColor) => {
	emit('update:modelValue', color)
	isOpen.value = false
}
</script>

<style scoped>
.chip-color-picker {
	position: relative;
	display: inline-flex;
}

.chip-color-picker__trigger {
	cursor: pointer;
	transition: transform 0.15s;

	&:hover {
		transform: scale(1.08);
	}
}

.chip-color-picker__backdrop {
	position: fixed;
	inset: 0;
	z-index: 9998;
}

.chip-color-picker__dropdown {
	z-index: 9999;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 8px;
	padding: 12px;
	background: var(--poker-surface, #232328);
	border: 1px solid var(--poker-border, rgb(255 255 255 / 12%));
	border-radius: var(--radius-md, 12px);
	box-shadow: 0 12px 32px rgb(0 0 0 / 50%);
}

.chip-color-picker__option {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 4px;
	border: 2px solid transparent;
	border-radius: var(--radius-full, 9999px);
	background: none;
	cursor: pointer;
	transition: transform 0.15s, border-color 0.15s, background 0.15s;

	&:hover {
		transform: scale(1.15);
		background: rgb(255 255 255 / 6%);
	}

	&--active {
		border-color: rgb(255 255 255 / 70%);
		background: rgb(255 255 255 / 10%);
	}
}

.chip-color-picker__arrow {
	position: absolute;
	width: 10px;
	height: 10px;
	background: var(--poker-surface, #232328);
	border-right: 1px solid var(--poker-border, rgb(255 255 255 / 12%));
	border-bottom: 1px solid var(--poker-border, rgb(255 255 255 / 12%));
	transform: rotate(45deg);
}

.chip-color-dropdown-enter-active,
.chip-color-dropdown-leave-active {
	transition: opacity 0.1s;
}

.chip-color-dropdown-enter-from,
.chip-color-dropdown-leave-to {
	opacity: 0;
}
</style>
