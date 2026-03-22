// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import stylistic from '@stylistic/eslint-plugin'

export default withNuxt(
	{
		plugins: {
			'@stylistic': stylistic,
		},
		rules: {
			// Табуляция вместо пробелов
			'@stylistic/indent': ['error', 'tab'],

			// Стрелочные функции везде
			'prefer-arrow-callback': 'error',
			'arrow-body-style': ['error', 'as-needed'],

			// Без console.log в коммитах
			'no-console': ['warn', { allow: ['warn', 'error'] }],

			// Без any
			'@typescript-eslint/no-explicit-any': 'error',

			// Vue
			'vue/html-indent': ['error', 'tab'],
			'vue/script-indent': ['error', 'tab', { baseIndent: 0 }],
		},
	},
)
