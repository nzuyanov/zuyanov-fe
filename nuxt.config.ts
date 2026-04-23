import { META_TITLE, META_DESCRIPTION, META_IMAGE } from './app/constants/meta'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: {enabled: true},
	modules: ['@pinia/nuxt', '@nuxt/eslint', '@nuxt/image'],
	typescript: {
		typeCheck: true,
	},
	css: ['~/assets/css/global.css'],

	app: {
		head: {
			htmlAttrs: {lang: 'ru'},
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1',
			title: META_TITLE,
			link: [
				{rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'},
			],
			meta: [
				{name: 'keywords', content: 'frontend, javascript, tlp, vue, nuxt'},
				{name: 'description', content: META_DESCRIPTION},
				{property: 'og:type', content: 'website'},
				{property: 'og:title', content: META_TITLE},
				{property: 'og:description', content: META_DESCRIPTION},
				{property: 'og:image', content: META_IMAGE},
				{property: 'og:locale', content: 'ru_RU'},
				{property: 'og:url', content: 'https://zuyanov.ru'},
				{name: 'twitter:card', content: 'summary_large_image'},
				{name: 'twitter:title', content: META_TITLE},
				{name: 'twitter:description', content: META_DESCRIPTION},
				{name: 'twitter:image', content: META_IMAGE},
				{name: 'twitter:site', content: 'https://zuyanov.ru'},
			],
			noscript: [
				{
					innerHTML: `
<style>.page{display:none!important}.noscript{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,sans-serif;text-align:center;color:rgba(255,255,255,.87);background:#1b1b1f;z-index:9999}.noscript__inner{max-width:520px}.noscript__title{font-size:4rem;font-weight:900;letter-spacing:-.02em;background:linear-gradient(135deg,#bd34fe,#41d1ff);background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0 0 24px}.noscript__text{font-size:1.125rem;line-height:1.7;color:rgba(255,255,255,.6);margin:0 0 24px}.noscript__links{list-style:none;padding:0;display:flex;flex-wrap:wrap;justify-content:center;gap:12px}.noscript__links a{padding:8px 20px;border-radius:999px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#c75aff;text-decoration:none;font-size:.9rem}.noscript__links a:hover{border-color:#bd34fe;color:#41d1ff}</style>
<div class="noscript">
  <div class="noscript__inner">
    <h1 class="noscript__title">УПС!</h1>
    <p class="noscript__text">Похоже, у вас отключён JavaScript. Этот сайт без него как сноуборд без снега — вроде есть, но не едет. Включите JS в настройках браузера и возвращайтесь:</p>
    <ul class="noscript__links">
      <li><a href="https://support.google.com/adsense/answer/12654?hl=ru">Google Chrome</a></li>
      <li><a href="https://support.mozilla.org/ru/kb/nastrojki-javascript-dlya-interaktivnyh-veb-stranic">Mozilla Firefox</a></li>
      <li><a href="https://support.apple.com/ru-ru/guide/safari/ibrw1074/mac">Safari</a></li>
    </ul>
  </div>
</div>`,
				},
			],
		},
	},

	routeRules: {
		'/': {prerender: true},
		'/tlp': {prerender: true},
	},
})