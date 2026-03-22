<template>
	<div class="page">
		<div class="glow"/>

		<header class="hero">
			<div class="hero__row">
				<Icon name="ph:rocket-launch-duotone" class="hero__icon"/>
				<h1 class="hero__title text-heading">TLP</h1>
			</div>
			<p class="hero__desc text-body">Разное полезное</p>
		</header>

		<section class="cards">
			<NuxtLink to="/poker-board" class="card">
				<div class="card__cover">
					<NuxtImg
						src="https://storage.yandexcloud.net/tlp-media/poker.jpg"
						alt="Poker Board"
						class="card__cover-img"
					/>
				</div>
				<div class="card__body">
					<h2 class="card__title text-heading">
						Poker Board
					</h2>
					<p class="card__desc text-body">
						Покерная доска для игры с друзьями вживую 🃏
					</p>
				</div>
			</NuxtLink>
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
	max-width: 1280px;
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

/* Hero */
.hero {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	padding: 32px 0 24px;
}

.hero__row {
	display: flex;
	align-items: center;
	gap: 10px;
}

.hero__icon {
	font-size: 1.5rem;
	color: var(--accent-light);
	filter: drop-shadow(0 0 8px rgb(189 52 254 / 30%));
}

.hero__title {
	font-size: 1.25rem;
	font-weight: 800;
	letter-spacing: -0.02em;
	background: linear-gradient(135deg, var(--accent) 20%, var(--accent-2));
	background-clip: text;
	-webkit-text-fill-color: transparent;
}

.hero__desc {
	font-size: 0.85rem;
	color: var(--text-3);
}

/* Cards grid */
.cards {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 24px;
	padding-bottom: 96px;
}

.card {
	display: flex;
	flex-direction: column;
	border-radius: 16px;
	border: 1px solid var(--border);
	background: var(--bg-card);
	overflow: hidden;
	text-decoration: none;
	color: inherit;
	transition: background 0.25s, border-color 0.25s, box-shadow 0.25s, transform 0.25s;
}

.card:hover {
	background: var(--bg-card-hover);
	border-color: rgb(189 52 254 / 20%);
	box-shadow: 0 0 40px rgb(189 52 254 / 4%);
	transform: translateY(-2px);
}

.card__cover {
	height: 160px;
	overflow: hidden;
	border-bottom: 1px solid var(--border);
}

.card__cover-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: transform 0.3s;
}

.card:hover .card__cover-img {
	transform: scale(1.05);
}

.card__body {
	padding: 20px;
}

.card__title {
	font-size: 1.1rem;
	font-weight: 700;
	background: linear-gradient(135deg, var(--accent) 20%, var(--accent-2));
	background-clip: text;
	-webkit-text-fill-color: transparent;
	margin-bottom: 6px;
}

.card__desc {
	font-size: 0.9rem;
	color: var(--text-2);
	line-height: 1.5;
}

@media (width >= 641px) {
	.hero {
		padding: 40px 0 32px;
	}
}
</style>
