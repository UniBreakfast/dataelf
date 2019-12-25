
const
  makeTest = require('./tester'),
  { assign, keys, values } = Object,
  c = console.log,
  fsp = require('fs').promises,

  dataElf = require('.'),
  methods = 'addArr, user, addUser, updUser'.split(', '),

  runTests = async ()=> {
    await init()
    await users(1)
  },

  init = makeTest("dataElf module supposed to be exporting an object with one method - a function .link(dbStr), that supposed to initialize the dataElf with a reference to a db object and add the rest of the methods, also it supposed to return the dataElf object itself", "and it does all that!",
    async (fail, crit)=> {

    const absent = []

    if (typeof dataElf != 'object')
      fail("index.js doesn't export an object")

    if (keys(dataElf).length != 1)
      fail("dataElf object expected to have exactly one property at first")

    if (!dataElf.link || typeof dataElf.link != 'function')
      crit("there's no .link(dbStr) method")
    else {
      if (dataElf.link.length != 1)
        fail("the .link(dbStr) method supposed to expect one argument")

      await fsp.unlink('test.json').catch(_=>0)

      if (await dataElf.link('test.json') != dataElf)
        fail(".link(dbStr) method supposed to return the same dataElf object")

      if (!dataElf.db || typeof dataElf.db != 'object')
        fail("after linking dataElf supposed to have reference to db object")

      methods.splice(0, methods.length,...methods.filter(m =>
        dataElf[m] && typeof dataElf[m] == 'function'? 1 : absent.push(m) && 0))
      if (absent.length)
        fail("dataElf supposed to have methods: "+absent.join(', '))
    }
  }),

  users = makeTest("dataElf.addUser(login, hash) supposed to add users, dataElf.updUser(id | {prop}, {prop}) supposed to update them and dataElf.user(id | {prop}) supposed to get them", "and they work as they should!", async (fail, crit)=> {

    'user, addUser, updUser'.split(', ').forEach(m => {
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

    if (await dataElf.addUser(...values(bob)) !== false)
      fail("dataElf.addUser(login, hash) doesn't return false whed login occupied")

    if (!JSON.same({id:1,...bob}, await dataElf.user(1)))
      fail("dataElf.user(id) doesn't find the previously added user's record by id")

    if (!JSON.same({id:1,...bob}, await dataElf.user(bob)))
      fail("dataElf.user({login}) doesn't find the previously added user's record by login")

    if (await dataElf.updUser(2, {guess: 3}) !== false)
      fail("dataElf.updUser(id, {prop}) doesn't return false when there's no user with that id")

    if (await dataElf.updUser(1, {guess: 3}) !== true)
      fail("dataElf.updUser(id, {prop}) doesn't return true when record updated")

    if (!JSON.same({id:1,...bob, guess: 3}, await dataElf.user(1)))
      fail("dataElf.updUser(id, {prop}) didn't update the user record")
  })

runTests()
