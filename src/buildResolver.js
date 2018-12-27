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
  if (middleware && !Array.isArray(middleware)) {
    middleware = [middleware]
  }

  return async (req, context) => {
    const callbacks = middleware.map((cb) => {
      return (done) => {
        cb(req, context, (value) => {
          req = {
            ...req,
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
