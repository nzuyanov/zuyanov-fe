<script setup lang="ts">
useHead({
  title: 'Зуянов Никита Сергеевич — Frontend разработчик',
})

useSeoMeta({
  description: 'Зуянов Никита Сергеевич — Frontend разработчик. Родился 14.02.1995. Увлекаюсь сноубордом.',
  ogTitle: 'Зуянов Никита Сергеевич — Frontend разработчик',
  ogDescription: 'Frontend разработчик. Люблю сноуборд и качественный код.',
  ogImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop',
  ogType: 'profile',
  ogLocale: 'ru_RU',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Зуянов Никита Сергеевич — Frontend разработчик',
  twitterDescription: 'Frontend разработчик. Люблю сноуборд и качественный код.',
  twitterImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop',
})
</script>

<template>
  <div class="page">
    <div class="glow" />

    <section class="hero">
      <h1 class="hero__name text-heading">
        Зуянов Никита
        <span class="hero__accent">Сергеевич</span>
      </h1>
      <p class="hero__tagline text-body">Frontend разработчик</p>
      <div class="hero__badges">
        <span class="badge text-body">Vue</span>
        <span class="badge text-body">TypeScript</span>
        <span class="badge text-body">Nuxt</span>
      </div>
    </section>

    <div class="divider" />

    <section class="info">
      <div class="info__card">
        <span class="info__label text-caption">Дата рождения</span>
        <span class="info__value text-body">14 февраля 1995</span>
      </div>
      <div class="info__card">
        <span class="info__label text-caption">Специализация</span>
        <span class="info__value text-body">Frontend разработка</span>
      </div>
      <div class="info__card">
        <span class="info__label text-caption">Увлечения</span>
        <span class="info__value text-body">Сноуборд</span>
      </div>
    </section>

    <div class="sections">
      <section class="section">
        <div class="section__header">
          <Icon name="ph:user-circle-duotone" class="section__icon" />
          <h2 class="section__title text-heading">О себе</h2>
        </div>
        <p class="section__text text-body">Здесь будет текст о вас — общее описание, кто вы и чем занимаетесь.</p>
      </section>

      <section class="section">
        <div class="section__header">
          <Icon name="ph:briefcase-duotone" class="section__icon" />
          <h2 class="section__title text-heading">Опыт работы</h2>
        </div>
        <p class="section__text text-body">Здесь будет описание вашего профессионального опыта, ключевых проектов и достижений.</p>
      </section>

      <section class="section">
        <div class="section__header">
          <Icon name="ph:code-duotone" class="section__icon" />
          <h2 class="section__title text-heading">Навыки</h2>
        </div>
        <p class="section__text text-body">Здесь будет перечень технологий и инструментов, которыми вы владеете.</p>
      </section>

      <section class="section">
        <div class="section__header">
          <Icon name="ph:graduation-cap-duotone" class="section__icon" />
          <h2 class="section__title text-heading">Образование</h2>
        </div>
        <p class="section__text text-body">Здесь будет информация о вашем образовании и пройденных курсах.</p>
      </section>

      <section class="section">
        <div class="section__header">
          <Icon name="ph:snowflake-duotone" class="section__icon" />
          <h2 class="section__title text-heading">Увлечения</h2>
        </div>
        <p class="section__text text-body">Здесь будет текст о сноуборде и других увлечениях за пределами кода.</p>
      </section>

      <section class="section">
        <div class="section__header">
          <Icon name="ph:envelope-duotone" class="section__icon" />
          <h2 class="section__title text-heading">Контакты</h2>
        </div>
        <p class="section__text text-body">Здесь будут ваши контактные данные и ссылки на соцсети.</p>
      </section>
    </div>
  </div>
</template>

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
    rgba(189, 52, 254, 0.12) 0%,
    rgba(65, 209, 255, 0.06) 40%,
    transparent 70%
  );
  pointer-events: none;
  z-index: -1;
}

/* Hero */
.hero {
  padding: 96px 0 48px;
  text-align: center;
}

.hero__name {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  background: linear-gradient(135deg, #c4b5fd 30%, var(--accent-2));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero__accent {
  background: linear-gradient(135deg, var(--accent) 20%, var(--accent-2));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero__tagline {
  margin-top: 16px;
  font-size: 1.25rem;
  color: var(--text-2);
  font-weight: 400;
}

.hero__badges {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
}

.badge {
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-2);
  font-size: 0.875rem;
  font-weight: 500;
  transition: border-color 0.25s, color 0.25s;
}

.badge:hover {
  border-color: var(--accent);
  color: var(--text);
}

/* Divider */
.divider {
  height: 1px;
  background: var(--divider);
  margin: 0 0 48px;
}

/* Info cards */
.info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 64px;
}

.info__card {
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  transition: background 0.25s, border-color 0.25s;
}

.info__card:hover {
  background: var(--bg-card-hover);
  border-color: rgba(189, 52, 254, 0.3);
}

.info__label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-3);
  margin-bottom: 8px;
}

.info__value {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text);
}

/* Content sections */
.sections {
  display: flex;
  flex-direction: column;
  gap: 48px;
  padding-bottom: 96px;
}

.section {
  padding: 32px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  transition: background 0.25s, border-color 0.25s, box-shadow 0.25s;
}

.section:hover {
  background: var(--bg-card-hover);
  border-color: rgba(189, 52, 254, 0.2);
  box-shadow: 0 0 40px rgba(189, 52, 254, 0.04);
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
  filter:
    drop-shadow(0 0 6px var(--accent))
    drop-shadow(0 0 14px var(--accent))
    drop-shadow(0 0 28px rgba(189, 52, 254, 0.4));
  animation: neon-flicker 2.5s infinite;
}

@keyframes neon-flicker {
  0%, 100% {
    opacity: 1;
    filter:
      drop-shadow(0 0 6px var(--accent))
      drop-shadow(0 0 14px var(--accent))
      drop-shadow(0 0 28px rgba(189, 52, 254, 0.4));
  }
  4% {
    opacity: 0.7;
    filter:
      drop-shadow(0 0 2px var(--accent))
      drop-shadow(0 0 6px rgba(189, 52, 254, 0.2));
  }
  8% {
    opacity: 1;
    filter:
      drop-shadow(0 0 6px var(--accent))
      drop-shadow(0 0 14px var(--accent))
      drop-shadow(0 0 28px rgba(189, 52, 254, 0.4));
  }
  40% {
    opacity: 1;
    filter:
      drop-shadow(0 0 8px var(--accent))
      drop-shadow(0 0 18px var(--accent))
      drop-shadow(0 0 32px rgba(189, 52, 254, 0.5));
  }
  42% {
    opacity: 0.6;
    filter:
      drop-shadow(0 0 2px var(--accent))
      drop-shadow(0 0 4px rgba(189, 52, 254, 0.15));
  }
  43% {
    opacity: 0.85;
    filter:
      drop-shadow(0 0 4px var(--accent))
      drop-shadow(0 0 10px var(--accent));
  }
  45% {
    opacity: 0.5;
    filter:
      drop-shadow(0 0 1px var(--accent));
  }
  46% {
    opacity: 1;
    filter:
      drop-shadow(0 0 6px var(--accent))
      drop-shadow(0 0 14px var(--accent))
      drop-shadow(0 0 28px rgba(189, 52, 254, 0.4));
  }
  75% {
    opacity: 1;
    filter:
      drop-shadow(0 0 6px var(--accent))
      drop-shadow(0 0 14px var(--accent))
      drop-shadow(0 0 28px rgba(189, 52, 254, 0.4));
  }
  77% {
    opacity: 0.8;
    filter:
      drop-shadow(0 0 3px var(--accent))
      drop-shadow(0 0 8px rgba(189, 52, 254, 0.25));
  }
  78% {
    opacity: 1;
    filter:
      drop-shadow(0 0 6px var(--accent))
      drop-shadow(0 0 14px var(--accent))
      drop-shadow(0 0 28px rgba(189, 52, 254, 0.4));
  }
}

.section__title {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #c4b5fd 40%, var(--accent-2));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section__text {
  color: var(--text-2);
  line-height: 1.7;
}

/* Responsive */
@media (max-width: 640px) {
  .hero {
    padding: 64px 0 32px;
  }

  .info {
    grid-template-columns: 1fr;
  }

  .section {
    padding: 24px;
  }
}
</style>
