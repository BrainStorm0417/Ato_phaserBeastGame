module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true
	},
	extends: 'eslint:recommended',
	parserOptions: {
		sourceType: 'module'
	},
	rules: {
		'accessor-pairs': 'error',
		'array-callback-return': 'error',
		'array-element-newline': 'off',
		'arrow-body-style': 'error',
		'block-scoped-var': 'error',
		'callback-return': 'error',
		camelcase: [
			'error',
			{
				properties: 'never'
			}
		],
		'capitalized-comments': 'off',
		'class-methods-use-this': 'off',
		'comma-dangle': 'off',
		complexity: 'off',
		'consistent-return': 'off',
		'consistent-this': 'error',
		curly: 'error',
		'default-case': 'off',
		'dot-notation': 'error',
		eqeqeq: 'off',
		'for-direction': 'error',
		'func-name-matching': 'error',
		'func-names': ['error', 'never'],
		'func-style': 'error',
		'function-paren-newline': 'off',
		'getter-return': 'error',
		'global-require': 'error',
		'guard-for-in': 'error',
		'handle-callback-err': 'error',
		'id-blacklist': 'error',
		'id-length': 'off',
		'id-match': 'error',
		indent: 'off',
		'indent-legacy': 'off',
		'init-declarations': 'off',
		'line-comment-position': 'off',
		'linebreak-style': ['error', 'unix'],
		'lines-around-comment': 'off',
		'lines-around-directive': 'error',
		'lines-between-class-members': ['error', 'always'],
		'max-depth': 'off',
		'max-len': 'off',
		'max-lines': 'off',
		'max-nested-callbacks': 'error',
		'max-statements': 'off',
		'max-statements-per-line': 'error',
		'multiline-comment-style': 'off',
		'new-cap': 'error',
		'newline-after-var': 'off',
		'newline-before-return': 'off',
		'no-alert': 'error',
		'no-array-constructor': 'error',
		'no-await-in-loop': 'error',
		'no-bitwise': 'error',
		'no-buffer-constructor': 'error',
		'no-caller': 'error',
		'no-catch-shadow': 'error',
		'no-confusing-arrow': 'error',
		'no-continue': 'off',
		'no-console': 1,
		'no-div-regex': 'error',
		'no-duplicate-imports': 'error',
		'no-else-return': 'off',
		'no-empty-function': 'off',
		'no-eq-null': 'error',
		'no-eval': 'error',
		'no-extend-native': 'error',
		'no-extra-bind': 'error',
		'no-extra-label': 'error',
		'no-extra-parens': 'off',
		'no-extra-semi': 'off',
		'no-implicit-coercion': 'error',
		'no-implicit-globals': 'error',
		'no-implied-eval': 'error',
		'no-inline-comments': 'off',
		'no-invalid-this': 'error',
		'no-iterator': 'error',
		'no-label-var': 'error',
		'no-labels': 'error',
		'no-lone-blocks': 'error',
		'no-lonely-if': 'off',
		'no-loop-func': 'off',
		'no-magic-numbers': 'off',
		'no-mixed-operators': 'off',
		'no-mixed-requires': 'error',
		'no-mixed-spaces-and-tabs': 'off',
		'no-multi-assign': 'error',
		'no-multi-str': 'error',
		'no-native-reassign': 'error',
		'no-negated-condition': 'off',
		'no-negated-in-lhs': 'error',
		'no-nested-ternary': 'error',
		'no-new': 'error',
		'no-new-func': 'error',
		'no-new-object': 'error',
		'no-new-require': 'error',
		'no-new-wrappers': 'error',
		'no-octal-escape': 'error',
		'no-param-reassign': 'off',
		'no-path-concat': 'error',
		'no-plusplus': 'off',
		'no-process-env': 'off',
		'no-process-exit': 'error',
		'no-proto': 'error',
		'no-prototype-builtins': 'error',
		'no-restricted-globals': 'error',
		'no-restricted-imports': 'error',
		'no-restricted-modules': 'error',
		'no-restricted-properties': 'error',
		'no-restricted-syntax': 'error',
		'no-return-assign': 'error',
		'no-return-await': 'error',
		'no-script-url': 'error',
		'no-self-compare': 'error',
		'no-sequences': 'error',
		'no-shadow': 'error',
		'no-shadow-restricted-names': 'error',
		'no-sync': 'error',
		'no-tabs': 'off',
		'no-template-curly-in-string': 'error',
		'no-ternary': 'off',
		'no-throw-literal': 'error',
		'no-undef-init': 'error',
		'no-undefined': 'off',
		'no-underscore-dangle': 'error',
		'no-unexpected-multiline': 'off',
		'no-unmodified-loop-condition': 'error',
		'no-unneeded-ternary': 'off',
		'no-unused-expressions': 'error',
		'no-use-before-define': 'error',
		'no-useless-call': 'error',
		'no-useless-computed-key': 'error',
		'no-useless-concat': 'error',
		'no-useless-constructor': 'error',
		'no-useless-rename': 'error',
		'no-useless-return': 'off',
		'no-var': 'error',
		'no-void': 'error',
		'no-warning-comments': 'off',
		'no-with': 'error',
		'object-curly-newline': 'off',
		'object-shorthand': 'off',
		'one-var': 'off',
		'operator-assignment': 'off',
		'padded-blocks': 'off',
		'padding-line-between-statements': 'error',
		'prefer-arrow-callback': 'off',
		'prefer-const': 'off',
		'prefer-destructuring': 'off',
		'prefer-numeric-literals': 'error',
		'prefer-promise-reject-errors': 'error',
		'prefer-reflect': 'off',
		'prefer-rest-params': 'off',
		'prefer-spread': 'error',
		'prefer-template': 'off',
		'quote-props': 'off',
		quotes: 'off',
		radix: 'error',
		'require-await': 'error',
		'require-jsdoc': 'error',
		'sort-imports': 'off',
		'sort-keys': 'off',
		'sort-vars': 'off',
		'space-before-function-paren': 'off',
		'spaced-comment': 'off',
		strict: 'error',
		'symbol-description': 'error',
		'valid-jsdoc': 'error',
		'vars-on-top': 'error',
		yoda: ['error', 'never']
	}
};
