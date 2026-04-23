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
			<h1 class="title text-heading">
				Зуянов Никита Сергеевич
			</h1>
			<p class="job text-body">
				Frontend разработчик
			</p>

			<div class="contacts">
				<a href="https://t.me/the_last_pride" target="_blank" rel="noopener noreferrer" class="contact">
					<Fa6Telegram class="contactIcon telegram" />
					<span class="contactText">@the_last_pride</span>
				</a>
				<div class="contact">
					<Fa6Envelope class="contactIcon" />
					<span class="contactText">zuyanov.ns@yandex.ru</span>
					<UiTooltip text="Скопировать">
						<button class="copyButton"
								@click="copyToClipboard('zuyanov.ns@yandex.ru', 'Почта скопирована')">
							<Fa6RegCopy />
						</button>
					</UiTooltip>
				</div>
			</div>
		</section>

		<div class="sections">
			<section class="section">
				<div class="sectionHeader">
					<Fa6UserAstronaut class="sectionIcon" />
					<h2 class="sectionTitle text-heading">
						О себе
					</h2>
				</div>
				<p class="sectionText text-body">
					Привет! Меня зовут Никита, мне {{ pluralYears(age) }}. Я занимаюсь
					разработкой уже {{ pluralYears(experience) }}. За плечами большой опыт и множество интересных
					проектов от стартапов до бигтеха.
					Сейчас — старший фронтенд-разработчик в Ozon. Люблю, когда под капотом всё сложно, а снаружи —
					просто и красиво. А ещё я активно учусь быть папой.
				</p>
			</section>

			<section class="section">
				<div class="sectionHeader">
					<Fa6Vest class="sectionIcon" />
					<h2 class="sectionTitle text-heading">
						Опыт работы
					</h2>
				</div>
				<div class="jobs">
					<div class="job">
						<div class="jobHeader">
							<span class="company text-body">🎮 Nexters</span>
						</div>
						<p class="jobDescription text-body">
							Админка администрирования мобильных игр, веб-версия
							<a href="https://www.hero-wars.com" target="_blank" rel="noopener noreferrer"
							   class="jobLink">Hero Wars</a>
							(авторизация, комьюнити-портал для игроков)
						</p>
					</div>
					<div class="job">
						<div class="jobHeader">
							<span class="company text-body">📦 Ozon</span>
							<span class="jobBadge">сейчас</span>
						</div>
						<p class="jobDescription text-body">
							Внутреннее облако, платформа фронтенд-проектов, корпоративный мессенджер. Микрофронты,
							большие команды, сложные продукты.
						</p>
					</div>
				</div>
			</section>

			<section class="section">
				<div class="sectionHeader">
					<Fa6Code class="sectionIcon" />
					<h2 class="sectionTitle text-heading">
						Навыки
					</h2>
				</div>
				<div class="skills">
					<UiTooltip text="Vue.js">
						<div class="skill">
							<BiLogoVuejs class="skillIcon skillIcon--vue" size="32" />
						</div>
					</UiTooltip>
					<UiTooltip text="Nuxt">
						<div class="skill">
							<SiNuxtdotjs class="skillIcon skillIcon--nuxt" size="32" />
						</div>
					</UiTooltip>
					<UiTooltip text="Pinia">
						<div class="skill">
							<IpPineapple class="skillIcon skillIcon--pinia" size="32" />
						</div>
					</UiTooltip>
					<UiTooltip text="Node.js">
						<div class="skill">
							<BiLogoNodejs class="skillIcon skillIcon--node" size="32" />
						</div>
					</UiTooltip>
					<UiTooltip text="Git">
						<div class="skill">
							<BiLogoGit class="skillIcon skillIcon--git" size="32" />
						</div>
					</UiTooltip>
					<UiTooltip text="CI/CD">
						<div class="skill">
							<SiGithubactions class="skillIcon skillIcon--cicd" size="32" />
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
				<div class="sectionHeader">
					<Fa6GraduationCap class="sectionIcon"/>
					<h2 class="sectionTitle text-heading">
						Образование
					</h2>
				</div>
				<p class="sectionText text-body">
					МГУ имени М.В. Ломоносова
					<br>
					Факультет ВМК
					<br>
					Прикладная математика и информатика
				</p>
			</section>

			<section class="section">
				<div class="sectionHeader">
					<Fa6RegSnowflake class="sectionIcon" />
					<h2 class="sectionTitle text-heading">
						Увлечения
					</h2>
				</div>
				<p class="sectionText text-body">
					Люблю спорт, кататься на снуоборде, путешествия в новые места, ламповые настолки и коктейли на роме
					🍹
				</p>
			</section>

			<section class="section">
				<div class="sectionHeader">
					<Fa6MicrophoneLines class="sectionIcon" />
					<h2 class="sectionTitle text-heading">
						Выступления
					</h2>
				</div>
				<div class="talk">
					<p class="conference text-caption">
						Evrone podcast
					</p>
					<p class="conferenceName text-body">
						OR: React vs Vue
					</p>
					<div class="conferencePreview">
						<iframe
							src="https://vkvideo.ru/video_ext.php?oid=-117095393&id=456239595&hash=e88864409811ef04&hd=4"
							allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
							allowfullscreen
							frameborder="0"
						/>
					</div>
					<div class="conferenceLinks">
						<a
							href="https://vkvideo.ru/video-117095393_456239595?sh=4"
							target="_blank"
							rel="noopener noreferrer"
							class="conferenceLink text-inter"
						>
							<Fa6CirclePlay class="conferenceLinkIcon conferenceLinkIcon--vk" />
							VK Video
						</a>
						<a
							href="https://youtu.be/wyakGgieWsg"
							target="_blank"
							rel="noopener noreferrer"
							class="conferenceLink text-inter"
						>
							<Fa6Youtube class="conferenceLinkIcon conferenceLinkIcon--yt" />
							YouTube
						</a>
					</div>
					<p class="conference text-caption">
						HolyJS
					</p>
					<p class="conferenceName text-body">
						Вьюххх! Как мы перевели сотни проектов на Vue 3 и не пострадали
					</p>
					<div class="conferencePreview">
						<iframe
							src="https://vk.com/video_ext.php?oid=-119450242&id=456240200&hash=4"
							allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
							allowfullscreen
							frameborder="0"
						/>
					</div>
					<div class="conferenceLinks">
						<a
							href="https://vk.com/video-119450242_456240200?sh=4"
							target="_blank"
							rel="noopener noreferrer"
							class="conferenceLink text-inter"
						>
							<Fa6CirclePlay class="conferenceLinkIcon conferenceLinkIcon--vk" />
							VK Video
						</a>
						<a
							href="https://youtu.be/E33R-HaXMsE?si=bXcUB-A_yqnHuvwd"
							target="_blank"
							rel="noopener noreferrer"
							class="conferenceLink text-inter"
						>
							<Fa6Youtube class="conferenceLinkIcon conferenceLinkIcon--yt" />
							YouTube
						</a>
					</div>
				</div>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
	import {
		Fa6Telegram,
		Fa6Envelope,
		Fa6RegCopy,
		Fa6UserAstronaut,
		Fa6Vest,
		Fa6Code,
		Fa6GraduationCap,
		Fa6RegSnowflake,
		Fa6MicrophoneLines,
		Fa6CirclePlay,
		Fa6Youtube,
	} from 'vue-icons-plus/fa6'
	import {
		BiLogoVuejs,
		BiLogoNodejs,
		BiLogoGit,
	} from 'vue-icons-plus/bi'
	import {
		SiNuxtdotjs,
		SiGithubactions,
	} from 'vue-icons-plus/si'
	import {
		IpPineapple,
	} from 'vue-icons-plus/ip'

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

	.title {
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 800;
		letter-spacing: -0.02em;
		line-height: 1.1;
		background-clip: text;
		background: linear-gradient(135deg, var(--accent) 20%, var(--accent-2));
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.job {
		margin-top: 16px;
		font-size: 1.25rem;
		color: var(--text-2);
		font-weight: 400;
	}

	/* Hero contacts */
	.contacts {
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

	.contactIcon {
		font-size: 1.1rem;
		color: var(--text-3);
		flex-shrink: 0;
	}

	.telegram {
		color: #26a5e4;
	}

	.contactText {
		line-height: 1;
		cursor: pointer;
	}

	.copyButton {
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

	.copyButton:hover {
		color: var(--accent-light);
	}

	.contact:hover .copyButton {
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

	.sectionHeader {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 12px;
	}

	.sectionIcon {
		font-size: 1.75rem;
		color: var(--text-3);
		flex-shrink: 0;
		transition: color 0.3s, filter 0.3s;
	}

	.section:hover .sectionIcon {
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

	.sectionTitle {
		font-size: 1.25rem;
		font-weight: 700;
		background: linear-gradient(135deg, var(--accent) 20%, var(--accent-2));
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.sectionText {
		color: var(--text-2);
		line-height: 1.7;
	}

	/* Jobs */
	.jobs {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.jobHeader {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 6px;
	}

	.company {
		font-weight: 600;
		color: var(--text);
		font-size: 1.05rem;
	}

	.jobBadge {
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

	.jobDescription {
		color: var(--text-2);
		line-height: 1.7;
	}

	.jobLink {
		color: var(--accent-light);
		text-decoration: none;
		transition: color 0.2s;
	}

	.jobLink:hover {
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

	.skillIcon {
		font-size: 2rem;
	}

	.skill__img {
		width: 2rem;
		height: 2rem;
	}

	.skillIcon--ts {
		color: #3178c6;
	}

	.skillIcon--vue {
		color: #4fc08d;
	}

	.skillIcon--nuxt {
		color: #00dc82;
	}

	.skillIcon--pinia {
		color: #ffd859;
	}

	.skillIcon--node {
		color: #5fa04e;
	}

	.skillIcon--git {
		color: #f05032;
	}

	.skillIcon--cicd {
		color: #2088ff;
	}


	/* Talk card */
	.conference {
		margin-top: 30px;
		margin-bottom: 4px;
	}

	.conferenceName {
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--text);
		line-height: 1.5;
		margin-bottom: 16px;
	}

	.conferencePreview {
		position: relative;
		width: 100%;
		padding-bottom: 56.25%;
		border-radius: 12px;
		overflow: hidden;
		margin-bottom: 16px;
		border: 1px solid var(--border);
	}

	.conferencePreview iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	/* Talk links */
	.conferenceLinks {
		display: flex;
		gap: 20px;
	}

	.conferenceLink {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-2);
		text-decoration: none;
		transition: color 0.25s;
	}

	.conferenceLink:hover {
		color: var(--text);
	}

	.conferenceLinkIcon {
		font-size: 1.2rem;
	}

	.conferenceLinkIcon--vk {
		color: #ff3b5c;
	}

	.conferenceLinkIcon--yt {
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
