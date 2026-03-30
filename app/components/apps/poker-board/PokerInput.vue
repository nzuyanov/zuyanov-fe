<template>
	<div
		class="wrapper"
		:class="{
			'focused': isFocused,
			'error': error,
			'small': small,
			'disabled': disabled,
		}"
	>
		<button
			v-if="type === 'number' && !hideSteps"
			class="step"
			tabindex="-1"
			@mousedown.prevent="startDecrement"
			@mouseup="stopRepeat"
			@mouseleave="stopRepeat"
		>
			<Icon name="ph:minus-bold" />
		</button>

		<input
			ref="inputRef"
			:type="type === 'number' ? 'text' : type"
			:inputmode="type === 'number' ? (allowDecimals ? 'decimal' : 'numeric') : undefined"
			class="input"
			:class="{ 'center': type === 'number' }"
			:value="displayValue"
			:placeholder="placeholder"
			:disabled="disabled"
			@input="onInput"
			@focus="isFocused = true"
			@blur="onBlur"
			@keydown="onKeydown"
		>

		<div v-if="suffix" class="suffix">{{ suffix }}</div>

		<button
			v-if="showClear"
			class="clear"
			tabindex="-1"
			@mousedown.prevent="onClear"
		>
			<Icon name="ph:x-bold" />
		</button>

		<button
			v-if="type === 'number' && !hideSteps"
			class="step"
			tabindex="-1"
			@mousedown.prevent="startIncrement"
			@mouseup="stopRepeat"
			@mouseleave="stopRepeat"
		>
			<Icon name="ph:plus-bold" />
		</button>
	</div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
	modelValue: number | string
	type?: 'text' | 'number'
	placeholder?: string
	min?: number
	max?: number
	step?: number
	error?: boolean
	small?: boolean
	allowDecimals?: boolean
	suffix?: string
	disabled?: boolean
	hideSteps?: boolean
}>(), {
	type: 'text',
	placeholder: '',
	min: undefined,
	max: undefined,
	step: 1,
	error: false,
	small: false,
	allowDecimals: false,
	suffix: '',
	disabled: false,
	hideSteps: false,
})

const emit = defineEmits<{
	'update:modelValue': [value: number | string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)

const displayValue = computed(() => {
	if (props.type === 'number') {
		return props.modelValue === '' || props.modelValue === undefined ? '' : String(props.modelValue)
	}
	return props.modelValue
})

const showClear = computed(() => {
	// Для числовых инпутов крестик не нужен — есть кнопки +/−
	if (props.type === 'number') return false
	return String(props.modelValue).length > 0
})

const clamp = (val: number): number => {
	let result = val
	if (props.min !== undefined && result < props.min) result = props.min
	if (props.max !== undefined && result > props.max) result = props.max
	return result
}

const parseNumber = (raw: string): number | null => {
	const cleaned = raw.replace(',', '.')
	const num = props.allowDecimals ? parseFloat(cleaned) : parseInt(cleaned, 10)
	return isNaN(num) ? null : num
}

const onInput = (e: Event) => {
	const target = e.target as HTMLInputElement
	const raw = target.value

	if (props.type === 'number') {
		if (raw === '' || raw === '-') {
			emit('update:modelValue', '')
			return
		}
		const num = parseNumber(raw)
		if (num !== null) {
			emit('update:modelValue', num)
		}
	}
	else {
		emit('update:modelValue', raw)
	}
}

const onBlur = () => {
	isFocused.value = false
	// Кламп при потере фокуса
	if (props.type === 'number' && props.modelValue !== '' && props.modelValue !== undefined) {
		const num = typeof props.modelValue === 'string' ? parseNumber(props.modelValue) : props.modelValue
		if (num !== null) {
			emit('update:modelValue', clamp(num))
		}
	}
}

const onKeydown = (e: KeyboardEvent) => {
	if (props.type !== 'number') return

	if (e.key === 'ArrowUp') {
		e.preventDefault()
		increment()
	}
	else if (e.key === 'ArrowDown') {
		e.preventDefault()
		decrement()
	}
}

const increment = () => {
	const current = typeof props.modelValue === 'number' ? props.modelValue : (parseNumber(String(props.modelValue)) ?? 0)
	const next = props.allowDecimals
		? Math.round((current + props.step) * 1000) / 1000
		: current + props.step
	emit('update:modelValue', clamp(next))
}

const decrement = () => {
	const current = typeof props.modelValue === 'number' ? props.modelValue : (parseNumber(String(props.modelValue)) ?? 0)
	const next = props.allowDecimals
		? Math.round((current - props.step) * 1000) / 1000
		: current - props.step
	emit('update:modelValue', clamp(next))
}

// Зажатие кнопок +/- для быстрого изменения
let repeatTimer: ReturnType<typeof setTimeout> | null = null
let repeatInterval: ReturnType<typeof setInterval> | null = null

const startRepeat = (action: () => void) => {
	action()
	repeatTimer = setTimeout(() => {
		repeatInterval = setInterval(action, 80)
	}, 400)
}

const stopRepeat = () => {
	if (repeatTimer) { clearTimeout(repeatTimer); repeatTimer = null }
	if (repeatInterval) { clearInterval(repeatInterval); repeatInterval = null }
}

const startIncrement = () => startRepeat(increment)
const startDecrement = () => startRepeat(decrement)

const onClear = () => {
	if (props.type === 'number') {
		emit('update:modelValue', props.min ?? 0)
	}
	else {
		emit('update:modelValue', '')
	}
	inputRef.value?.focus()
}

onUnmounted(() => {
	stopRepeat()
})
</script>

<style scoped>
.wrapper {
	display: flex;
	align-items: center;
	background: var(--poker-bg-input, #2D333B);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius-sm, 8px);
	transition: border-color 0.2s, box-shadow 0.2s;
	overflow: hidden;
}

.focused {
	border-color: var(--poker-green);
	box-shadow: 0 0 0 3px var(--poker-green-dim, rgb(16 185 129 / 15%));
}

.error {
	border-color: var(--poker-red);
}

.error.focused {
	box-shadow: 0 0 0 3px var(--poker-red-dim, rgb(239 68 68 / 15%));
}

.input {
	flex: 1;
	min-width: 0;
	padding: 10px 12px;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 1.25rem;
	color: var(--poker-text);
	background: transparent;
	border: none;
	outline: none;
	min-height: 46px;
	transition: background-color 0.2s;
}

.center {
	text-align: center;
}

.wrapper:hover .input,
.wrapper:hover .suffix {
	background-color: var(--poker-bg-input-hover);
}

.input::placeholder {
	color: var(--poker-text-muted);
}

/* Убираем системные стрелки для number-подобного инпута */
.input::-webkit-outer-spin-button,
.input::-webkit-inner-spin-button {
	appearance: none;
	margin: 0;
}

/* Суффикс (единица измерения) */
.suffix {
	flex-shrink: 0;
	padding-right: 12px;
	padding-top: 12px;
	padding-bottom: 12px;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.875rem;
	color: var(--poker-text-muted);
	pointer-events: none;
	user-select: none;
	transition: background 0.15s, color 0.15s;
}

/* Кнопки +/- */
.step {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 38px;
	flex-shrink: 0;
	align-self: stretch;
	border: none;
	background: var(--poker-border, rgb(255 255 255 / 8%));
	color: var(--poker-text-muted);
	font-size: 0.875rem;
	cursor: pointer;
	transition: background 0.15s, color 0.15s;
	user-select: none;
}

.step:hover {
	background: var(--poker-border-hover, rgb(255 255 255 / 16%));
	color: var(--poker-text);
}

.step:active {
	background: var(--poker-green-dim, rgb(16 185 129 / 15%));
	color: var(--poker-green);
}

/* Кнопка очистки */
.clear {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 38px;
	flex-shrink: 0;
	border: none;
	background: transparent;
	color: var(--poker-text-muted);
	font-size: 1rem;
	cursor: pointer;
	transition: color 0.15s;
	padding: 0;
}

.clear:hover {
	color: var(--poker-red);
}

/* Маленький вариант */
.small {
	max-width: 140px;
}

.small .input {
	padding: 8px 6px;
	font-size: 1.125rem;
}

.small .step {
	width: 32px;
	font-size: 0.75rem;
}

.small .clear {
	width: 22px;
	font-size: 0.6rem;
}

.disabled {
	opacity: 0.5;
	pointer-events: none;
}
</style>
