<template>
	<Teleport to="body">
		<div class="overlay poker-shimmer-overlay" @click.self="$emit('cancel')">
			<div class="confirm-dialog">
				<h3 class="text-heading title">{{ title }}</h3>
				<p class="text-body message" v-html="message"></p>
				<div class="actions">
					<button class="button cancel" @click="$emit('cancel')">
						{{ cancelText }}
					</button>
					<button
						class="button"
						:class="`button-${variant}`"
						@click="$emit('confirm')"
					>
						{{ confirmText }}
					</button>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
	title: string
	message: string
	confirmText?: string
	cancelText?: string
	variant?: 'danger' | 'primary'
}>(), {
	confirmText: 'Подтвердить',
	cancelText: 'Отмена',
	variant: 'danger',
})

defineEmits<{
	confirm: []
	cancel: []
}>()
</script>

<style scoped>
.overlay {
	position: fixed;
	inset: 0;
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
	backdrop-filter: blur(4px);
}

.confirm-dialog {
	max-width: 420px;
	padding: 28px;
	background: var(--poker-bg-card, #21252D);
	border: 1px solid var(--poker-border, rgb(255 255 255 / 8%));
	border-radius: var(--poker-radius, 12px);
	box-shadow: 0 16px 48px rgb(0 0 0 / 40%);
}

.title {
	margin-bottom: 16px;
}

.message {
	font-size: 1.05rem;
	font-weight: 600;
	color: var(--poker-text, #F9FAFB);
	line-height: 1.5;
	text-align: center;
	margin-bottom: 24px;
}

.actions {
	display: flex;
	gap: 12px;
}

.button {
	flex: 1;
	padding: 12px 16px;
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 0.9rem;
	font-weight: 700;
	border: none;
	border-radius: var(--poker-radius-sm, 8px);
	cursor: pointer;
	transition: background 0.2s, transform 0.15s;
}

.button:active {
	transform: scale(0.97);
}

.cancel {
	background: var(--poker-bg-input, #2D333B);
	color: var(--poker-text-secondary, #D1D5DB);
}

.cancel:hover {
	background: var(--poker-border-hover, rgb(255 255 255 / 16%));
}

.button-danger {
	background: var(--poker-red, #EF4444);
	color: #fff;
}

.button-danger:hover {
	background: #DC2626;
}

.button-primary {
	background: var(--poker-green, #10B981);
	color: #fff;
}

.button-primary:hover {
	background: var(--poker-green-hover, #059669);
}
</style>
