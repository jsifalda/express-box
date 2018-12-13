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
    return build(modules.resolvers, args)
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
