<template>
	<div class="page">
		<div class="glow"/>

		<section class="placeholder">
			<Icon name="ph:hammer-duotone" class="placeholder__icon"/>
			<h1 class="placeholder__title text-heading">
				TLP
			</h1>
			<p class="placeholder__text text-body">
				Тут скоро будет кое-что интересное 👀
			</p>
			<p class="placeholder__hint text-body">
				Страница в разработке — следи за обновлениями!
			</p>
		</section>
	</div>
</template>

<script setup lang="ts">
import { META_TITLE, META_DESCRIPTION, META_IMAGE } from '~/constants/meta'

useHead({
	title: `TLP — ${META_TITLE}`,
})

useSeoMeta({
	description: META_DESCRIPTION,
	ogTitle: `TLP — ${META_TITLE}`,
	ogDescription: META_DESCRIPTION,
	ogImage: META_IMAGE,
	ogType: 'website',
	ogLocale: 'ru_RU',
	twitterCard: 'summary_large_image',
	twitterTitle: `TLP — ${META_TITLE}`,
	twitterDescription: META_DESCRIPTION,
	twitterImage: META_IMAGE,
})
</script>

<style scoped>
.page {
	position: relative;
	max-width: 768px;
	margin: 0 auto;
	padding: 0 24px;
	overflow: hidden;
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

.placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: calc(100vh - 120px);
	text-align: center;
	padding: 64px 0;
}

.placeholder__icon {
	font-size: 4rem;
	color: var(--text-3);
	margin-bottom: 24px;
}

.placeholder__title {
	font-size: clamp(2rem, 5vw, 3rem);
	font-weight: 800;
	letter-spacing: -0.02em;
	background: linear-gradient(135deg, var(--accent) 20%, var(--accent-2));
	background-clip: text;
	-webkit-text-fill-color: transparent;
	margin-bottom: 16px;
}

.placeholder__text {
	font-size: 1.25rem;
	color: var(--text-2);
	margin-bottom: 8px;
}

.placeholder__hint {
	font-size: 0.95rem;
	color: var(--text-3);
}
</style>
