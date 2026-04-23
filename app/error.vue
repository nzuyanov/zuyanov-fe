<template>
	<div class="error-page">
		<div class="glow"/>

		<div class="error-page__content">
			<h1 class="error-page__code text-heading">
				{{ error?.statusCode || 404 }}
			</h1>
			<p class="error-page__message text-body">
				{{ message }}
			</p>
			<NuxtLink to="/" class="error-page__link text-inter">
				<Fa6ArrowLeft />
				На главную
			</NuxtLink>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
import { Fa6ArrowLeft } from 'vue-icons-plus/fa6'

const props = defineProps<{
	error: NuxtError
}>()

const message = computed(() => {
	if (props.error?.statusCode === 404) {
		return 'Такой страницы не существует :('
	}
	return props.error?.message || 'Что-то пошло не так 😵'
})
</script>

<style scoped>
.error-page {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	padding: 24px;
}

.glow {
	position: fixed;
	top: -40%;
	left: 50%;
	transform: translateX(-50%);
	width: 600px;
	height: 600px;
	border-radius: 50%;
	background: radial-gradient(
		circle,
		rgb(189 52 254 / 12%) 0%,
		rgb(65 209 255 / 6%) 40%,
		transparent 70%
	);
	pointer-events: none;
	z-index: -1;
}

.error-page__content {
	text-align: center;
}

.error-page__code {
	font-size: clamp(5rem, 15vw, 10rem);
	font-weight: 900;
	letter-spacing: -0.04em;
	line-height: 1;
	background: linear-gradient(135deg, var(--accent) 20%, var(--accent-2));
	background-clip: text;
	-webkit-text-fill-color: transparent;
	margin-bottom: 16px;
}

.error-page__message {
	font-size: 1.2rem;
	color: var(--text-2);
	margin-bottom: 32px;
}

.error-page__link {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 10px 24px;
	border-radius: 9999px;
	border: 1px solid var(--border);
	background: var(--bg-card);
	color: var(--accent-light);
	font-size: 0.9rem;
	font-weight: 500;
	text-decoration: none;
	transition: background 0.25s, border-color 0.25s;
}

.error-page__link:hover {
	background: var(--bg-card-hover);
	border-color: rgb(189 52 254 / 20%);
}

.error-page__link-icon {
	font-size: 1rem;
}
</style>
