import { resolverForGivenFunction, dataObjBuilder, metaFunctionBuilder } from './core.js'
import { dataDefaults } from './defaults.js'

export default function AsyncDataMixinBuilder(dataGlobalDefaults, meta) {
	const metaRefresh = metaFunctionBuilder('refresh', meta)
	const metaLoading = metaFunctionBuilder('loading', meta)
	const metaError = metaFunctionBuilder('error', meta)
	const metaDefault = metaFunctionBuilder('default', meta)
	const metaMore = metaFunctionBuilder('more', meta)
	const metaReset = metaFunctionBuilder('reset', meta)

	const metas = { metaLoading, metaError, metaDefault, metaReset }

	return {

	beforeCreate() {
		let properties = this.$options.asyncData || {}

		let methods = this.$options.methods = this.$options.methods || {}

		for (const [propName, prop] of Object.entries(properties)) {
			const opt = dataDefaults(prop, dataGlobalDefaults)

			if (!opt.get)
				throw `An asyncData was created without a get method: ${opt}`

			methods[metaRefresh(propName)] = resolverForGivenFunction.call(this, propName, metas, opt.get, opt.default, opt.transform, opt.error)

			// load more stuff
			if (opt.more) {
				methods[metaMore(propName)] = resolverForGivenFunction.call(this, propName, metas, opt.more.get, opt.default, opt.transform, opt.error, opt.more.concat)
			}
		}
	},

	// for all non lazy properties, call refresh methods
	beforeMount() {
		const properties = this.$options.asyncData || {}

		for (const [propName, prop] of Object.entries(properties)) {
			const opt = dataDefaults(prop, dataGlobalDefaults)

			if (!opt.lazy) {
				this[metaRefresh(propName)]()
			}
		}
	},

	data() {
		return dataObjBuilder(this.$options.asyncData, metas, false)
	}
}}
