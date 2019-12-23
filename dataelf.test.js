
const
  { assign, values } = Object,
  c = console.log,
  fsp = require('fs').promises,
  jsonSame =(a, b)=> JSON.stringify(a) == JSON.stringify(b),
  e = e => e,
  test = (title, finish, err) => [
    msg => !err && c("TEST: "+title) || c("FAIL: "+msg) || (err=1),
    ()=> !err && (c("TEST: "+title) || c("OK: "+finish)),
    msg => {!err && c("TEST: "+title) || c("FAIL: "+msg); throw msg}
  ],

  dataElf = require('.'),
  methods = 'addArr, addUser, user'.split(', '),

  runTests = async ()=> {
    await init()
    await users().catch(e)
  },

  init = async ()=> {
    const
      [ fail, ok, crit ] = test("dataElf module supposed to be exporting an object with one method - a function .link(dbStr), that supposed to initialize the dataElf with a reference to a db object and add the rest of the methods, also it supposed to return the dataElf object itself", "and it does all that!"),
      absent = []

    if (typeof dataElf != 'object')
      fail("index.js doesn't export an object")

    if (Object.keys(dataElf).length != 1)
      fail("dataElf object expected to have exactly one property at first")

    if (!dataElf.link || typeof dataElf.link != 'function')
      crit("there's no .link(dbStr) method")
    else {
      if (dataElf.link.length != 1)
        fail("the .link(dbStr) method supposed to expect one argument")

      await fsp.unlink('test.json').catch(e)

      if (await dataElf.link('test.json') != dataElf)
        fail(".link(dbStr) method supposed to return the same dataElf object")

      if (!dataElf.db || typeof dataElf.db != 'object')
        fail("after linking dataElf supposed to have reference to db object")

      methods.splice(0, methods.length,...methods.filter(m =>
        dataElf[m] && typeof dataElf[m] == 'function'? 1 : absent.push(m) && 0))
      if (absent.length)
        fail("dataElf supposed to have methods: "+absent.join(', '))
    }
    ok()
  },

  users = async ()=> {
    const [ fail, ok, crit ] = test("dataElf.addUser(login, hash) supposed to add users and dataElf.user(id | {login}) supposed to get them", "and they work as they should!")

    'addUser, user'.split(', ').forEach(m => {
      if (!methods.includes(m))
        crit(`but dataElf doesn't even have .${m}() method!`)
    })

    await dataElf.addArr('users').catch(c)

    if (await dataElf.user(1) !== null)
      fail("dataElf.user(id) supposed to return null if there is none")

    if (await dataElf.user({login: 'Bob'}) !== null)
      fail("dataElf.user({login}) supposed to return null if there is none")

    const bob = {login: 'Bob', hash: 'sd7f6t87rew98sf9'}

    if (await dataElf.addUser(...values(bob)) != 1)
      fail("dataElf.addUser(login, hash) doesn't return id of added record")

    if (await dataElf.addUser(...values(bob)) != false)
      fail("dataElf.addUser(login, hash) doesn't return false whed login occupied")

    if (!jsonSame({id:1,...bob}, await dataElf.user(1)))
      fail("dataElf.user(id) doesn't find the previously added user's record by id")

    if (!jsonSame({id:1,...bob}, await dataElf.user({login: 'Bob'})))
      fail("dataElf.user({login}) doesn't find the previously added user's record by login")

    ok()
  }

runTests()

// assign(global, {c, dataElf})
// setTimeout(c, 1e7)
