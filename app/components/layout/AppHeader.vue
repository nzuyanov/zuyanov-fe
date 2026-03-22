<template>
	<header class="header">
		<nav class="header__nav">
			<NuxtLink
				v-for="link in links"
				:key="link.to"
				:to="link.to"
				class="header__link text-inter"
				:class="{ 'header__link--active': route.path === link.to }"
			>
				{{ link.label }}
			</NuxtLink>
		</nav>
	</header>
</template>

<script setup lang="ts">
interface NavLink {
	to: string
	label: string
}

const route = useRoute()

const links: NavLink[] = [
	{ to: '/', label: 'Главная' },
	{ to: '/tlp', label: 'TLP' },
]
</script>

<style scoped>
.header {
	position: sticky;
	top: 0;
	z-index: 100;
	backdrop-filter: blur(12px);
	background: rgb(27 27 31 / 80%);
	border-bottom: 1px solid var(--border);
}

.header__nav {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 32px;
	max-width: 768px;
	margin: 0 auto;
	padding: 12px 24px;
}

.header__link {
	font-size: 0.9rem;
	font-weight: 500;
	color: var(--text-3);
	text-decoration: none;
	padding: 4px 0;
	position: relative;
	transition: color 0.25s;
}

.header__link:hover {
	color: var(--text);
}

.header__link--active {
	color: var(--text);
}

.header__link--active::after {
	content: '';
	position: absolute;
	bottom: -2px;
	left: 0;
	right: 0;
	height: 2px;
	border-radius: 1px;
	background: linear-gradient(135deg, var(--accent), var(--accent-2));
}
</style>
