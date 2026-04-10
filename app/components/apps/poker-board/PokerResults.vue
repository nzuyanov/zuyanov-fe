<template>
	<div class="results">
		<!-- Конфетти-частицы -->
		<div class="confetti">
			<span v-for="n in 40" :key="n" class="confettiPiece" :style="confettiStyle(n)" />
		</div>

		<div class="content">
			<h1 class="title">🏆 Турнир завершён!</h1>

			<!-- Подиум: 1/2/3 место -->
			<div class="podium">
				<div
					v-for="(entry, i) in podium"
					:key="entry.player.id"
					class="card"
					:class="`card--place${i + 1}`"
				>
					<img :src="placeIcons[i]" alt="" class="placeIcon">
					<img
						:src="getAvatarDataUri(entry.player.avatarId, entry.player.gender, entry.player.avatarBackground)"
						alt=""
						class="avatar"
						:class="`avatar--place${i + 1}`"
					>
					<span class="name">{{ entry.player.name }}</span>
					<span class="prize">
						<template v-if="entry.prize > 0">{{ formatMoney(entry.prize) }} ₽</template>
						<template v-else>—</template>
					</span>
				</div>
			</div>

			<button class="poker-btn-green btn" @click="$emit('newGame')">
				🚀 Новый турнир
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import trophyGold from '~/assets/images/trophy-gold.png'
import trophySilver from '~/assets/images/trophy-silver.png'
import trophyBronze from '~/assets/images/trophy-bronze.png'

defineEmits<{
	newGame: []
}>()

const store = usePokerStore()
const { getAvatarDataUri } = usePokerAvatars()
const placeIcons = [trophyGold, trophySilver, trophyBronze]

const results = computed(() => store.getResults)
const prizeAmounts = computed(() => store.prizeAmounts)

const podium = computed(() => {
	const top = results.value.slice(0, 3)
	return top.map((player, i) => ({
		player,
		prize: prizeAmounts.value[i] ?? 0,
	}))
})

const formatMoney = (value: number): string => value.toLocaleString('ru-RU')

// Генерация стилей для конфетти
const confettiStyle = (n: number) => {
	const colors = ['#F59E0B', '#10B981', '#EF4444', '#6366F1', '#EC4899', '#14B8A6', '#F97316']
	const color = colors[n % colors.length]
	const left = Math.random() * 100
	const delay = Math.random() * 5
	const duration = 3 + Math.random() * 4
	const size = 6 + Math.random() * 6
	const rotation = Math.random() * 360

	return {
		'--color': color,
		'--left': `${left}%`,
		'--delay': `${delay}s`,
		'--duration': `${duration}s`,
		'--size': `${size}px`,
		'--rotation': `${rotation}deg`,
	}
}
</script>

<style scoped>
.results {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	overflow: hidden;
	background:
		radial-gradient(ellipse at 50% 30%, rgb(245 158 11 / 12%) 0%, transparent 50%),
		radial-gradient(ellipse at 20% 80%, rgb(16 185 129 / 10%) 0%, transparent 40%),
		radial-gradient(ellipse at 80% 70%, rgb(139 92 246 / 10%) 0%, transparent 40%),
		radial-gradient(ellipse at 50% 100%, rgb(99 102 241 / 8%) 0%, transparent 50%),
		linear-gradient(180deg, #0D1117 0%, #141820 50%, #0D1117 100%);
}

/* Конфетти */
.confetti {
	position: absolute;
	inset: 0;
	pointer-events: none;
	overflow: hidden;
}

.confettiPiece {
	position: absolute;
	top: -20px;
	left: var(--left);
	width: var(--size);
	height: var(--size);
	background: var(--color);
	border-radius: 2px;
	opacity: 0.8;
	animation: confettiFall var(--duration) var(--delay) ease-in infinite;
	transform: rotate(var(--rotation));
}

@keyframes confettiFall {
	0% {
		top: -5%;
		opacity: 1;
		transform: rotate(var(--rotation)) translateX(0);
	}

	100% {
		top: 105%;
		opacity: 0;
		transform: rotate(calc(var(--rotation) + 720deg)) translateX(40px);
	}
}

/* Контент */
.content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 40px;
	z-index: 1;
}

.title {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 3rem;
	font-weight: 900;
	letter-spacing: -0.02em;
	color: var(--poker-gold);
	text-align: center;
	text-shadow:
		0 0 20px rgb(245 158 11 / 30%),
		0 0 60px rgb(245 158 11 / 15%);
	animation: titleGlow 3s ease-in-out infinite;
}

@keyframes titleGlow {
	0%, 100% {
		text-shadow:
			0 0 20px rgb(245 158 11 / 30%),
			0 0 60px rgb(245 158 11 / 15%);
	}

	50% {
		text-shadow:
			0 0 30px rgb(245 158 11 / 45%),
			0 0 80px rgb(245 158 11 / 20%);
	}
}

/* Подиум */
.podium {
	display: flex;
	gap: 28px;
	align-items: flex-end;
	justify-content: center;
}

.card {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	padding: 28px 36px;
	background: rgb(255 255 255 / 4%);
	backdrop-filter: blur(8px);
	border-radius: var(--poker-radius);
	border: 3px solid var(--poker-border);
	min-width: 210px;
}

.card--place1 {
	border-color: var(--poker-gold);
	border-width: 4px;
	box-shadow:
		0 0 40px rgb(245 158 11 / 25%),
		inset 0 0 30px rgb(245 158 11 / 5%);
	transform: scale(1.1);
	order: 2;
	background: rgb(245 158 11 / 6%);
}

.card--place2 {
	border-color: #A0A8B8;
	border-width: 3px;
	box-shadow: 0 0 24px rgb(156 163 175 / 12%);
	order: 1;
}

.card--place3 {
	border-color: #CD7F32;
	border-width: 3px;
	box-shadow: 0 0 24px rgb(205 127 50 / 12%);
	order: 3;
}

.placeIcon {
	width: 52px;
	height: 52px;
	filter: drop-shadow(0 2px 8px rgb(0 0 0 / 30%));
}

.avatar {
	border-radius: 50%;
	background: var(--poker-bg-input);
	box-shadow: 0 4px 16px rgb(0 0 0 / 30%);
}

.avatar--place1 {
	width: 88px;
	height: 88px;
}

.avatar--place2,
.avatar--place3 {
	width: 72px;
	height: 72px;
}

.name {
	font-family: var(--font-body, 'Inter Variable', sans-serif);
	font-size: 1.15rem;
	font-weight: 700;
	color: var(--poker-text);
	text-align: center;
}

.prize {
	font-family: var(--font-heading, 'Montserrat Variable', sans-serif);
	font-size: 1.5rem;
	font-weight: 900;
	color: var(--poker-gold);
	text-shadow: 0 0 16px rgb(245 158 11 / 30%);
}

/* Кнопка */
.btn {
	margin-top: 8px;
	padding: 18px 48px;
	font-size: 1.2rem;
}
</style>
