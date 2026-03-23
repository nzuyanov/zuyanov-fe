<template>
	<Teleport to="body">
		<div class="confirm-overlay poker-shimmer-overlay" @click.self="$emit('cancel')">
			<div class="confirm-dialog">
				<p class="confirm-dialog__message">{{ message }}</p>
				<div class="confirm-dialog__actions">
					<button class="confirm-dialog__btn confirm-dialog__btn--cancel" @click="$emit('cancel')">
						{{ cancelText }}
					</button>
					<button
						class="confirm-dialog__btn confirm-dialog__btn--confirm"
						:class="`confirm-dialog__btn--${variant}`"
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
.confirm-overlay {
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

.confirm-dialog__message {
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 1.05rem;
	font-weight: 600;
	color: var(--poker-text, #F9FAFB);
	line-height: 1.5;
	text-align: center;
	margin-bottom: 24px;
}

.confirm-dialog__actions {
	display: flex;
	gap: 12px;
}

.confirm-dialog__btn {
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

.confirm-dialog__btn:active {
	transform: scale(0.97);
}

.confirm-dialog__btn--cancel {
	background: var(--poker-bg-input, #2D333B);
	color: var(--poker-text-secondary, #D1D5DB);
}

.confirm-dialog__btn--cancel:hover {
	background: var(--poker-border-hover, rgb(255 255 255 / 16%));
}

.confirm-dialog__btn--danger {
	background: var(--poker-red, #EF4444);
	color: #fff;
}

.confirm-dialog__btn--danger:hover {
	background: #DC2626;
}

.confirm-dialog__btn--primary {
	background: var(--poker-green, #10B981);
	color: #fff;
}

.confirm-dialog__btn--primary:hover {
	background: var(--poker-green-hover, #059669);
}
</style>
