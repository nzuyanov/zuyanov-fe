<template>
	<ClientOnly>
		<Teleport to="body">
			<TransitionGroup name="notif" tag="div" class="notif-container">
				<div
					v-for="n in notifications"
					:key="n.id"
					class="notif"
					:class="`notif--${n.type}`"
				>
					<component :is="renderIcon(n.type)" />
					<span class="notif__message">{{ n.message }}</span>
					<button class="notif__close" @click="dismiss(n.id)">
						<RxCross2/>
					</button>
				</div>
			</TransitionGroup>
		</Teleport>
	</ClientOnly>
</template>

<script setup lang="ts">
	import { RxCross2 } from 'vue-icons-plus/rx'
	import { EpSuccessFilled } from 'vue-icons-plus/ep'
	import { IpError } from 'vue-icons-plus/ip'
	import { PiWarningFill } from 'vue-icons-plus/pi'

	const {notifications, dismiss} = useNotification()

	const renderIcon = (n: NotificationType) => {
		switch (n) {
			case 'success':
				return h(EpSuccessFilled)
			case 'error':
				return h(IpError)
			case 'warning':
				return h(PiWarningFill)
		}
	}

	defineExpose({ renderIcon })
</script>

<style scoped>
	.notif-container {
		position: fixed;
		top: 16px;
		right: 16px;
		z-index: 10000;
		display: flex;
		flex-direction: column;
		gap: 8px;
		pointer-events: none;
	}

	.notif {
		pointer-events: auto;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		border-radius: 10px;
		border: 1px solid var(--border);
		background: var(--bg-soft);
		color: var(--text);
		font-family: var(--font-body);
		font-size: 0.875rem;
		box-shadow: 0 4px 24px rgb(0 0 0 / 40%);
		max-width: 360px;
	}

	.notif__icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.notif--success .notif__icon {
		color: #4ade80;
	}

	.notif--error .notif__icon {
		color: #f87171;
	}

	.notif--warning .notif__icon {
		color: #fbbf24;
	}

	.notif__message {
		flex: 1;
		line-height: 1.4;
	}

	.notif__close {
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		color: var(--text-3);
		cursor: pointer;
		padding: 2px;
		font-size: 0.875rem;
		transition: color 0.2s;
		flex-shrink: 0;
	}

	.notif__close:hover {
		color: var(--text);
	}

	/* Transitions */
	.notif-enter-active {
		transition: all 0.3s ease;
	}

	.notif-leave-active {
		transition: all 0.25s ease;
	}

	.notif-enter-from {
		opacity: 0;
		transform: translateX(40px);
	}

	.notif-leave-to {
		opacity: 0;
		transform: translateX(40px);
	}

	.notif-move {
		transition: transform 0.25s ease;
	}
</style>
