const lasync = require('lasync')

const execute = (callbacks) => {
  return new Promise((resolve, reject) => {
    lasync.series(callbacks, (error, results) => {
      if (error) {
        reject(error)
      } else {
        resolve(results)
      }
    })
  })
}

const buildResolver = (middleware) => {
  return async (req, context) => {
    req.middleware = {}
    const callbacks = middleware.map((cb) => {
      return (done) => {
        cb(req, context, (value) => {
          req.middleware = {
            ...req.middleware,
            ...(value || {})
          }
          if (value instanceof Error) {
            done(value)
          } else {
            done(null, value)
          }
        })
      }
    })

    return (await execute(callbacks)).pop()
  }
}

module.exports = buildResolver
