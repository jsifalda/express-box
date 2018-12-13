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

const getContext = (modules) => {
  return (...args) => {
    return build(modules.context, args)
  }
}

const ExpressBox = (modules) => {
  const build = (modules || []).reduce((obj, { resolvers, model, context }) => {
    return {
      ...obj,
      resolvers: resolvers ? [...(obj.resolvers || []), resolvers] : obj.resolvers,
      model: model ? [...(obj.model || []), model] : obj.model,
      context: context ? [...(obj.context || []), context] : obj.context
    }
  }, {})

  return {
    getModel: getModel(build),
    getResolvers: getResolvers(build),
    getContext: getContext(build)
  }
}

module.exports = ExpressBox
