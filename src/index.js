const buildResolver = require('./buildResolver')

const build = (items, args) => {
  return (items || []).reduce((obj, builder) => {
    return {
      ...obj,
      ...builder(...args)
    }
  }, {})
}

const getModel = (modules) => {
  return (...args) => {
    return build(modules.model, args)
  }
}

const getResolvers = (modules) => {
  return (...args) => {
    return (modules.resolvers || [])
      .map((builder) => {
        if (typeof builder !== 'function') {
          throw new Error('Builder resolver should be builder function')
        }

        return builder(...args)
      })
      .map((resolver) => {
        return Object.keys(resolver || {}).reduce((o, key) => {
          o[key] = buildResolver(resolver[key])
          return o
        }, {})
      })
      .reduce((obj, resolver) => {
        return {
          ...obj,
          ...resolver
        }
      }, {})
  }
}

const getContext = (modules, getModel) => {
  return (config) => {
    const intermediate = build(modules.context, [config])
    const context = {
      ...intermediate,
      ...config,
      models: getModel(intermediate)
    }

    Object.keys(context).forEach((key) => {
      const value = context[key]
      if (Array.isArray(value.afterContext)) {
        value.afterContext.forEach((callback) => {
          callback(context)
        })
      }
    })

    return context
  }
}

const ExpressBox = (modules) => {
  const converged = (modules || []).reduce((obj, { resolvers, model, context }) => {
    return {
      ...obj,
      resolvers: resolvers ? [...(obj.resolvers || []), resolvers] : obj.resolvers,
      model: model ? [...(obj.model || []), model] : obj.model,
      context: context ? [...(obj.context || []), context] : obj.context
    }
  }, {})

  return {
    getResolvers: getResolvers(converged),
    getContext: getContext(converged, getModel(converged))
  }
}

module.exports = ExpressBox
