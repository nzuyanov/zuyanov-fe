<template>
	<div
		ref="referenceRef"
		class="tooltip-trigger"
		@mouseenter="show"
		@mouseleave="hide"
		@focus="show"
		@blur="hide"
	>
		<slot/>
		<Teleport to="body">
			<div
				ref="floatingRef"
				class="tooltip"
				:class="{ 'tooltip--visible': isShown }"
				:style="floatingStyles"
			>
				{{ text }}
				<div ref="arrowRef" class="tooltip__arrow" :style="arrowStyles"/>
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { useFloating, offset, flip, shift, arrow, autoUpdate } from '@floating-ui/vue'

import type { Placement } from '@floating-ui/vue'

interface TooltipProps {
	text: string
	placement?: Placement
	delay?: number
}

const props = withDefaults(defineProps<TooltipProps>(), {
	placement: 'top',
	delay: 300,
})

const isHovered = ref(false)
const isShown = ref(false)
let showTimeout: ReturnType<typeof setTimeout> | null = null

const referenceRef = ref<HTMLElement | null>(null)
const floatingRef = ref<HTMLElement | null>(null)
const arrowRef = ref<HTMLElement | null>(null)

const { floatingStyles, middlewareData } = useFloating(referenceRef, floatingRef, {
	placement: props.placement,
	whileElementsMounted: autoUpdate,
	middleware: [
		offset(8),
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

	const placement = props.placement.split('-')[0]
	const side = staticSide[placement] ?? 'bottom'

	return {
		left: arrowData.x != null ? `${arrowData.x}px` : '',
		top: arrowData.y != null ? `${arrowData.y}px` : '',
		[side]: '-4px',
	}
})

const show = () => {
	isHovered.value = true
	showTimeout = setTimeout(() => {
		if (isHovered.value) {
			isShown.value = true
		}
	}, props.delay)
}

const hide = () => {
	isHovered.value = false
	if (showTimeout) {
		clearTimeout(showTimeout)
		showTimeout = null
	}
	isShown.value = false
}

onBeforeUnmount(() => {
	if (showTimeout) {
		clearTimeout(showTimeout)
	}
})
</script>

<style scoped>
.tooltip-trigger {
	display: inline-flex;
}

.tooltip {
	z-index: 9999;
	padding: 6px 12px;
	border-radius: 8px;
	background: var(--bg-soft);
	border: 1px solid var(--border);
	color: var(--text);
	font-family: var(--font-body);
	font-size: 0.8rem;
	line-height: 1.4;
	white-space: nowrap;
	pointer-events: none;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
	opacity: 0;
	transition: opacity 0.2s ease;
}

.tooltip--visible {
	opacity: 1;
}

.tooltip__arrow {
	position: absolute;
	width: 8px;
	height: 8px;
	background: var(--bg-soft);
	border-right: 1px solid var(--border);
	border-bottom: 1px solid var(--border);
	transform: rotate(45deg);
}
</style>
