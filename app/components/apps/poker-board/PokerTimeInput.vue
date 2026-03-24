<template>
	<div class="time-input-wrap">
		<div
			class="time-input"
			:class="{
				'time-input--error': hasError,
				'time-input--focused': isFocused,
			}"
		>
			<button
				class="time-input__step"
				tabindex="-1"
				@mousedown.prevent="startDecrement"
				@mouseup="stopRepeat"
				@mouseleave="stopRepeat"
			>
				<Icon name="ph:minus-bold" />
			</button>
			<input
				ref="inputRef"
				class="time-input__native"
				:value="isFocused ? rawInput : displayValue"
				@focus="onFocus"
				@input="onInput"
				@blur="onBlur"
				@keydown="onKeydown"
			>
			<button
				class="time-input__step"
				tabindex="-1"
				@mousedown.prevent="startIncrement"
				@mouseup="stopRepeat"
				@mouseleave="stopRepeat"
			>
				<Icon name="ph:plus-bold" />
			</button>
		</div>
		<Transition name="time-error">
			<span v-if="hasError" class="time-input__error">
				Неверный формат. Примеры: «90», «1 ч 30 мин», «2 ч»
			</span>
		</Transition>
	</div>
</template>

<script setup lang="ts">
interface Props {
	modelValue: number
	min?: number
	max?: number
	step?: number
}

const props = withDefaults(defineProps<Props>(), {
	min: 0,
	max: 1440,
	step: 15,
})

const emit = defineEmits<{
	'update:modelValue': [value: number]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const rawInput = ref('')
const hasError = ref(false)

// --- Отображение значения в формате «X ч Y мин» ---
const displayValue = computed(() => {
	const m = props.modelValue
	if (m < 60) return `${m} мин`
	const hours = Math.floor(m / 60)
	const mins = m % 60
	if (mins === 0) return `${hours} ч`
	return `${hours} ч ${mins} мин`
})

// --- Парсинг введённого текста ---
const parseTimeInput = (raw: string): number | null => {
	const trimmed = raw.trim()
	if (trimmed === '') return null

	// «X ч Y мин»
	const full = trimmed.match(/^(\d+)\s*ч\s+(\d+)\s*мин?$/)
	if (full) return parseInt(full[1]!) * 60 + parseInt(full[2]!)

	// «X ч»
	const hoursOnly = trimmed.match(/^(\d+)\s*ч$/)
	if (hoursOnly) return parseInt(hoursOnly[1]!) * 60

	// «X мин»
	const minsOnly = trimmed.match(/^(\d+)\s*мин?$/)
	if (minsOnly) return parseInt(minsOnly[1]!)

	// Просто число — минуты
	const justNum = trimmed.match(/^(\d+)$/)
	if (justNum) return parseInt(justNum[1]!)

	return null
}

const onFocus = () => {
	isFocused.value = true
	rawInput.value = displayValue.value
	hasError.value = false
}

const onInput = (e: Event) => {
	const val = (e.target as HTMLInputElement).value
	rawInput.value = val

	const parsed = parseTimeInput(val)
	if (parsed !== null && parsed >= props.min && parsed <= props.max) {
		emit('update:modelValue', parsed)
		hasError.value = false
	}
}

const onBlur = () => {
	isFocused.value = false
	const parsed = parseTimeInput(rawInput.value)
	if (parsed === null || parsed < props.min || parsed > props.max) {
		// Невалидный ввод — показать ошибку, вернуть предыдущее значение
		hasError.value = rawInput.value.trim() !== '' && parsed === null
	} else {
		emit('update:modelValue', parsed)
		hasError.value = false
	}
	rawInput.value = ''
}

// --- Кнопки ± ---
const clamp = (v: number) => Math.max(props.min, Math.min(v, props.max))

const syncRawInput = (newMinutes: number) => {
	if (isFocused.value) {
		const m = newMinutes
		if (m < 60) rawInput.value = `${m} мин`
		else if (m % 60 === 0) rawInput.value = `${Math.floor(m / 60)} ч`
		else rawInput.value = `${Math.floor(m / 60)} ч ${m % 60} мин`
	}
}

const increment = () => {
	const val = clamp(props.modelValue + props.step)
	emit('update:modelValue', val)
	syncRawInput(val)
	hasError.value = false
}

const decrement = () => {
	const val = clamp(props.modelValue - props.step)
	emit('update:modelValue', val)
	syncRawInput(val)
	hasError.value = false
}

const onKeydown = (e: KeyboardEvent) => {
	if (e.key === 'ArrowUp') {
		e.preventDefault()
		increment()
	}
	else if (e.key === 'ArrowDown') {
		e.preventDefault()
		decrement()
	}
}

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

onUnmounted(() => {
	stopRepeat()
})
</script>

<style scoped>
.time-input-wrap {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.time-input {
	display: flex;
	align-items: center;
	background: var(--poker-bg-input, #2D333B);
	border: 1px solid var(--poker-border);
	border-radius: var(--poker-radius-sm, 8px);
	overflow: hidden;
	transition: border-color 0.2s, box-shadow 0.2s;
}

.time-input--focused {
	border-color: var(--poker-green);
	box-shadow: 0 0 0 3px var(--poker-green-dim, rgb(16 185 129 / 15%));
}

.time-input--error {
	border-color: var(--poker-red, #EF4444);
	box-shadow: 0 0 0 3px rgb(239 68 68 / 15%);
}

.time-input__native {
	flex: 1;
	min-width: 0;
	padding: 10px 12px;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 1.25rem;
	color: var(--poker-text);
	background: transparent;
	border: none;
	outline: none;
	text-align: center;
	min-height: 46px;
}

.time-input__step {
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

.time-input__step:hover {
	background: var(--poker-border-hover, rgb(255 255 255 / 16%));
	color: var(--poker-text);
}

.time-input__step:active {
	background: var(--poker-green-dim, rgb(16 185 129 / 15%));
	color: var(--poker-green);
}

.time-input__error {
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.75rem;
	font-weight: 500;
	color: var(--poker-red, #EF4444);
}

.time-error-enter-active,
.time-error-leave-active {
	transition: opacity 0.2s, transform 0.2s;
}

.time-error-enter-from,
.time-error-leave-to {
	opacity: 0;
	transform: translateY(-4px);
}
</style>
