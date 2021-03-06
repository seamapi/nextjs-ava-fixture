const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const axios = require("axios")
const getPort = require("get-port")
const { wrappers } = require("nextjs-middleware-wrappers")

async function getServerFixture(t, options = {}) {
  const app = next({
    dev: options.dev === undefined ? true : options.dev,
    quiet: options.quiet,
    dir: options.dir,
  })
  const handle = app.getRequestHandler()
  const port = await getPort()

  if (!options.middlewares) options.middlewares = []

  let server
  await app.prepare().then(() => {
    server = createServer(wrappers(...[...options.middlewares, handle]))
    server.listen(port)
  })

  const teardownFn = () => {
    if (server) server.close()
  }

  const shouldTeardown = options.teardown ?? true
  if (shouldTeardown) {
    t.teardown(teardownFn)
  }

  const serverURL = `http://127.0.0.1:${port}`

  const customAxios = axios.create({
    baseURL: serverURL,
  })

  // Simplify axios errors
  customAxios.interceptors.response.use(
    (res) => res,
    (err) =>
      err.request && err.response
        ? Promise.reject({
            url: err.request.path,
            status: err.response.status,
            statusText: err.response.statusText,
            response: err.response.data,
            headers: err.response.headers,
          })
        : Promise.reject(err)
  )

  return {
    port,
    serverURL,
    axios: customAxios,
    close: () => {
      if (server) {
        server.close()
      }
    },
    teardown: teardownFn,
  }
}

module.exports = getServerFixture
module.exports.getServerFixture = getServerFixture
module.exports.default = getServerFixture
