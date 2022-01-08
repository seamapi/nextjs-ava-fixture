# NextJS Ava Fixture

This package sets up a testing fixture for NextJS applications.

It's great for testing API endpoints.

## Installation

```sh
npm install --save nextjs-ava-fixture
```

## Usage

```ts
import test from "ava"
import fixture from "nextjs-ava-fixture"

test("api endpoint", async (t) => {
  const { serverURL, axios } = await fixture(t)
  // axios is automatically configured with the base URL of the test server
  const { data: res } = await axios.get("/api/hello")
  t.deepEqual(res, { name: "John Doe" })
})
```

### Usage with Middleware

```ts
// get-test-server.ts
import { createDb } from "lib/db"
import getFixture from "nextjs-ava-fixture"

export default async (t) => {
  const db = await createDb()

  const sharedDbMw = (next) => (req, res) => {
    req.db = db
    return next(req, res)
  }

  const fixture = await getFixture(t, {
    middlewares: [sharedDbMw],
  })

  return {
    ...fixture,
    db,
  }
}
```

## FAQ / Common Issues

### You need to rebuild nsm if you change a frontend page (a non-api route) or introduce a new route

You might see an error like this while running tests:

![image](https://user-images.githubusercontent.com/1910070/148661231-bfb12f6e-5a1c-4a3c-bff9-5d3d818656e0.png)

`nsm build` goes through your files and builds a `routes.ts` index, if it's up to date the file will be missing.
