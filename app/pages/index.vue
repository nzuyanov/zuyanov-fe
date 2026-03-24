<template>
	<div class="page">
		<div class="glow"/>

		<section class="hero">
			<NuxtImg
				src="https://tlp-media.storage.yandexcloud.net/nikita.jpg"
				alt="Никита Зуянов"
				width="300"
				height="300"
				class="hero__photo"
			/>
			<h1 class="hero__name text-heading hero__accent">
				Зуянов Никита Сергеевич
			</h1>
			<p class="hero__tagline text-body">
				Frontend разработчик
			</p>

			<div class="hero__contacts">
				<a href="https://t.me/the_last_pride" target="_blank" rel="noopener noreferrer" class="contact">
					<Icon name="simple-icons:telegram" class="contact__icon contact__icon--tg"/>
					<span class="contact__text">@the_last_pride</span>
				</a>
				<div class="contact">
					<Icon name="ph:envelope-simple-fill" class="contact__icon"/>
					<span class="contact__text">zuyanov.ns@yandex.ru</span>
					<UiTooltip text="Скопировать">
						<button class="contact__copy" @click="copyToClipboard('zuyanov.ns@yandex.ru', 'Почта скопирована')">
							<Icon name="ph:copy"/>
						</button>
					</UiTooltip>
				</div>
			</div>
		</section>

		<div class="sections">
			<section class="section">
				<div class="section__header">
					<Icon name="ph:user-circle-duotone" class="section__icon"/>
					<h2 class="section__title text-heading">
						О себе
					</h2>
				</div>
				<p class="section__text text-body">
					Привет! Меня зовут Никита, мне {{ pluralYears(age) }}. Я занимаюсь
					разработкой уже {{ pluralYears(experience) }}. За плечами большой опыт и множество интересных проектов от стартапов до бигтеха.
					Сейчас — старший фронтенд-разработчик в Ozon. Люблю, когда под капотом всё сложно, а снаружи — просто и красиво. А ещё я активно учусь быть папой.
				</p>
			</section>

			<section class="section">
				<div class="section__header">
					<Icon name="ph:briefcase-duotone" class="section__icon"/>
					<h2 class="section__title text-heading">
						Опыт работы
					</h2>
				</div>
				<div class="jobs">
					<div class="job">
						<div class="job__header">
							<span class="job__company text-body">🎮 Nexters</span>
						</div>
						<p class="job__desc text-body">
							Админка администрирования мобильных игр, веб-версия
							<a href="https://www.hero-wars.com" target="_blank" rel="noopener noreferrer" class="job__link">Hero Wars</a>
							(авторизация, комьюнити-портал для игроков)
						</p>
					</div>
					<div class="job">
						<div class="job__header">
							<span class="job__company text-body">📦 Ozon</span>
							<span class="job__badge">сейчас</span>
						</div>
						<p class="job__desc text-body">
							Внутреннее облако, платформа фронтенд-проектов, корпоративный мессенджер. Микрофронты, большие команды, сложные продукты.
						</p>
					</div>
				</div>
			</section>

			<section class="section">
				<div class="section__header">
					<Icon name="ph:code-duotone" class="section__icon"/>
					<h2 class="section__title text-heading">
						Навыки
					</h2>
				</div>
				<div class="skills">
					<UiTooltip text="TypeScript">
						<div class="skill">
							<Icon name="simple-icons:typescript" class="skill__icon skill__icon--ts"/>
						</div>
					</UiTooltip>
					<UiTooltip text="Vue.js">
						<div class="skill">
							<Icon name="simple-icons:vuedotjs" class="skill__icon skill__icon--vue"/>
						</div>
					</UiTooltip>
					<UiTooltip text="Nuxt">
						<div class="skill">
							<Icon name="simple-icons:nuxtdotjs" class="skill__icon skill__icon--nuxt"/>
						</div>
					</UiTooltip>
					<UiTooltip text="Pinia">
						<div class="skill">
							<Icon name="simple-icons:pinia" class="skill__icon skill__icon--pinia"/>
						</div>
					</UiTooltip>
					<UiTooltip text="Node.js">
						<div class="skill">
							<Icon name="simple-icons:nodedotjs" class="skill__icon skill__icon--node"/>
						</div>
					</UiTooltip>
					<UiTooltip text="Git">
						<div class="skill">
							<Icon name="simple-icons:git" class="skill__icon skill__icon--git"/>
						</div>
					</UiTooltip>
					<UiTooltip text="CI/CD">
						<div class="skill">
							<Icon name="simple-icons:githubactions" class="skill__icon skill__icon--cicd"/>
						</div>
					</UiTooltip>
					<UiTooltip text="UI/UX">
						<div class="skill">
							<img src="~/assets/icons/figma.svg" alt="Figma" class="skill__img">
						</div>
					</UiTooltip>
				</div>
			</section>

			<section class="section">
				<div class="section__header">
					<Icon name="ph:graduation-cap-duotone" class="section__icon"/>
					<h2 class="section__title text-heading">
						Образование
					</h2>
				</div>
				<p class="section__text text-body">
					МГУ имени М.В. Ломоносова
					<br>
					Факультет ВМК
					<br>
					Прикладная математика и информатика
				</p>
			</section>

			<section class="section">
				<div class="section__header">
					<Icon name="ph:snowflake-duotone" class="section__icon"/>
					<h2 class="section__title text-heading">
						Увлечения
					</h2>
				</div>
				<p class="section__text text-body">
					Люблю спорт, кататься на снуоборде, путешествия в новые места, ламповые настолки и коктейли на роме 🍹
				</p>
			</section>

			<section class="section">
				<div class="section__header">
					<Icon name="ph:microphone-stage-duotone" class="section__icon"/>
					<h2 class="section__title text-heading">
						Выступления
					</h2>
				</div>
				<div class="talk">
					<p class="talk__conference text-caption">
						HolyJS
					</p>
					<p class="talk__name text-body">
						Вьюххх! Как мы перевели сотни проектов на Vue 3 и не пострадали
					</p>
					<div class="talk__preview">
						<iframe
							src="https://vk.com/video_ext.php?oid=-119450242&id=456240200&hash=4"
							allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
							allowfullscreen
							frameborder="0"
						/>
					</div>
					<div class="talk__links">
						<a
							href="https://vk.com/video-119450242_456240200?sh=4"
							target="_blank"
							rel="noopener noreferrer"
							class="talk-link text-inter"
						>
							<Icon name="ph:play-circle-fill" class="talk-link__icon talk-link__icon--vk"/>
							VK Video
						</a>
						<a
							href="https://youtu.be/E33R-HaXMsE?si=bXcUB-A_yqnHuvwd"
							target="_blank"
							rel="noopener noreferrer"
							class="talk-link text-inter"
						>
							<Icon name="ph:youtube-logo-fill" class="talk-link__icon talk-link__icon--yt"/>
							YouTube
						</a>
					</div>
				</div>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import { META_TITLE, META_DESCRIPTION, META_IMAGE } from '~/constants/meta'

const BIRTH_DATE = new Date(1995, 1, 14) // 14 февраля 1995
const CAREER_START_YEAR = 2018

const age = computed(() => yearsSince(BIRTH_DATE))
const experience = computed(() => new Date().getFullYear() - CAREER_START_YEAR)

const yearsSince = (date: Date): number => {
	const now = new Date()
	let years = now.getFullYear() - date.getFullYear()
	const monthDiff = now.getMonth() - date.getMonth()
	if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
		years--
	}
	return years
}

const pluralYears = (n: number): string => {
	const mod10 = n % 10
	const mod100 = n % 100
	if (mod10 === 1 && mod100 !== 11) return `${n} год`
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} года`
	return `${n} лет`
}

useHead({
	title: META_TITLE,
})

useSeoMeta({
	description: META_DESCRIPTION,
	ogTitle: META_TITLE,
	ogDescription: META_DESCRIPTION,
	ogImage: META_IMAGE,
	ogType: 'profile',
	ogLocale: 'ru_RU',
	twitterCard: 'summary_large_image',
	twitterTitle: META_TITLE,
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

/* Background glow effect like vite.dev */
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
	padding: 64px 0 32px;
	text-align: center;
}

.hero__photo {
	border-radius: 50%;
	object-fit: cover;
	margin-bottom: 24px;
	border: 2px solid var(--border);
}

.hero__name {
	font-size: clamp(1.75rem, 4vw, 2.5rem);
	font-weight: 800;
	letter-spacing: -0.02em;
	line-height: 1.1;
	background: linear-gradient(135deg, #c4b5fd 30%, var(--accent-2));
	background-clip: text;
	-webkit-text-fill-color: transparent;
}

.hero__accent {
	background: linear-gradient(135deg, var(--accent) 20%, var(--accent-2));
	background-clip: text;
	-webkit-text-fill-color: transparent;
}

.hero__tagline {
	margin-top: 16px;
	font-size: 1.25rem;
	color: var(--text-2);
	font-weight: 400;
}

/* Hero contacts */
.hero__contacts {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 24px;
	margin-top: 20px;
}

.contact {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 4px 0;
	background: none;
	border: none;
	color: var(--text-2);
	font-family: var(--font-body);
	font-size: 0.9rem;
	text-decoration: none;
	transition: color 0.25s;
}

.contact:hover {
	color: var(--accent-light);
}

.contact__icon {
	font-size: 1.1rem;
	color: var(--text-3);
	flex-shrink: 0;
}

.contact__icon--tg {
	color: #26a5e4;
}

.contact__text {
	line-height: 1;
	cursor: pointer;
}

.contact__copy {
	display: flex;
	align-items: center;
	justify-content: center;
	background: none;
	border: none;
	color: var(--text-3);
	cursor: pointer;
	padding: 2px;
	font-size: 1rem;
	opacity: 0;
	transition: color 0.2s, opacity 0.2s;
}

.contact__copy:hover {
	color: var(--accent-light);
}

.contact:hover .contact__copy {
	opacity: 1;
}

/* Content sections */
.sections {
	display: flex;
	flex-direction: column;
	gap: 48px;
	padding-bottom: 96px;
}

.section {
	padding: 24px;
	border-radius: 16px;
	border: 1px solid var(--border);
	background: var(--bg-card);
	transition: background 0.25s, border-color 0.25s, box-shadow 0.25s;
}

.section:hover {
	background: var(--bg-card-hover);
	border-color: rgb(189 52 254 / 20%);
	box-shadow: 0 0 40px rgb(189 52 254 / 4%);
}

.section__header {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 12px;
}

.section__icon {
	font-size: 1.75rem;
	color: var(--text-3);
	flex-shrink: 0;
	transition: color 0.3s, filter 0.3s;
}

.section:hover .section__icon {
	color: var(--accent-light);
	filter: drop-shadow(0 0 6px var(--accent)) drop-shadow(0 0 14px var(--accent)) drop-shadow(0 0 28px rgb(189 52 254 / 40%));
	animation: neon-flicker 2.5s infinite;
}

@keyframes neon-flicker {
	0%, 100% {
		opacity: 1;
		filter: drop-shadow(0 0 6px var(--accent)) drop-shadow(0 0 14px var(--accent)) drop-shadow(0 0 28px rgb(189 52 254 / 40%));
	}

	4% {
		opacity: 0.7;
		filter: drop-shadow(0 0 2px var(--accent)) drop-shadow(0 0 6px rgb(189 52 254 / 20%));
	}

	8% {
		opacity: 1;
		filter: drop-shadow(0 0 6px var(--accent)) drop-shadow(0 0 14px var(--accent)) drop-shadow(0 0 28px rgb(189 52 254 / 40%));
	}

	40% {
		opacity: 1;
		filter: drop-shadow(0 0 8px var(--accent)) drop-shadow(0 0 18px var(--accent)) drop-shadow(0 0 32px rgb(189 52 254 / 50%));
	}

	42% {
		opacity: 0.6;
		filter: drop-shadow(0 0 2px var(--accent)) drop-shadow(0 0 4px rgb(189 52 254 / 15%));
	}

	43% {
		opacity: 0.85;
		filter: drop-shadow(0 0 4px var(--accent)) drop-shadow(0 0 10px var(--accent));
	}

	45% {
		opacity: 0.5;
		filter: drop-shadow(0 0 1px var(--accent));
	}

	46% {
		opacity: 1;
		filter: drop-shadow(0 0 6px var(--accent)) drop-shadow(0 0 14px var(--accent)) drop-shadow(0 0 28px rgb(189 52 254 / 40%));
	}

	75% {
		opacity: 1;
		filter: drop-shadow(0 0 6px var(--accent)) drop-shadow(0 0 14px var(--accent)) drop-shadow(0 0 28px rgb(189 52 254 / 40%));
	}

	77% {
		opacity: 0.8;
		filter: drop-shadow(0 0 3px var(--accent)) drop-shadow(0 0 8px rgb(189 52 254 / 25%));
	}

	78% {
		opacity: 1;
		filter: drop-shadow(0 0 6px var(--accent)) drop-shadow(0 0 14px var(--accent)) drop-shadow(0 0 28px rgb(189 52 254 / 40%));
	}
}

.section__title {
	font-size: 1.25rem;
	font-weight: 700;
	background: linear-gradient(135deg, var(--accent) 20%, var(--accent-2));
	background-clip: text;
	-webkit-text-fill-color: transparent;
}

.section__text {
	color: var(--text-2);
	line-height: 1.7;
}

/* Jobs */
.jobs {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.job__header {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 6px;
}

.job__company {
	font-weight: 600;
	color: var(--text);
	font-size: 1.05rem;
}

.job__badge {
	font-family: var(--font-body);
	font-size: 0.7rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	padding: 2px 8px;
	border-radius: 6px;
	background: rgb(0 220 130 / 12%);
	color: #00dc82;
}

.job__desc {
	color: var(--text-2);
	line-height: 1.7;
}

.job__link {
	color: var(--accent-light);
	text-decoration: none;
	transition: color 0.2s;
}

.job__link:hover {
	text-decoration: underline;
}

/* Skills */
.skills {
	padding-top: 16px;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 20px;
}

.skill {
	display: flex;
	align-items: center;
	justify-content: center;
}

.skill__icon {
	font-size: 2rem;
}

.skill__img {
	width: 2rem;
	height: 2rem;
}

.skill__icon--ts {
	color: #3178c6;
}

.skill__icon--vue {
	color: #4fc08d;
}

.skill__icon--nuxt {
	color: #00dc82;
}

.skill__icon--pinia {
	color: #ffd859;
}

.skill__icon--node {
	color: #5fa04e;
}

.skill__icon--git {
	color: #f05032;
}

.skill__icon--cicd {
	color: #2088ff;
}


/* Talk card */
.talk__conference {
	margin-bottom: 4px;
}

.talk__name {
	font-size: 1.05rem;
	font-weight: 600;
	color: var(--text);
	line-height: 1.5;
	margin-bottom: 16px;
}

.talk__preview {
	position: relative;
	width: 100%;
	padding-bottom: 56.25%;
	border-radius: 12px;
	overflow: hidden;
	margin-bottom: 16px;
	border: 1px solid var(--border);
}

.talk__preview iframe {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

/* Talk links */
.talk__links {
	display: flex;
	gap: 20px;
}

.talk-link {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-size: 0.9rem;
	font-weight: 500;
	color: var(--text-2);
	text-decoration: none;
	transition: color 0.25s;
}

.talk-link:hover {
	color: var(--text);
}

.talk-link__icon {
	font-size: 1.2rem;
}

.talk-link__icon--vk {
	color: #ff3b5c;
}

.talk-link__icon--yt {
	color: #f00;
}

/* Desktop */
@media (width >= 641px) {
	.hero {
		padding: 96px 0 48px;
	}

	.section {
		padding: 32px;
	}
}
</style>
