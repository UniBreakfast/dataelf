
const
  makeTest = require('./tester'),
  { assign, keys, values } = Object,
  c = console.log,
  fsp = require('fs').promises,

  dataElf = require('./index-localdb'),
  methods = 'addArr, user, addUser, updUser, siftSess, sess, ses, addSes, updSes, delSes'.split(', '),

  runTests = async ()=> {
    await init()
    await users(1)
    await sessions(1)
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
      if (!dataElf[m]) crit(`but dataElf doesn't even have .${m}() method!`)
    })

    await dataElf.addArr('users').catch(c)

    if (await dataElf.user(1) !== null)
      crit("dataElf.user(id) supposed to return null if there is none")

    if (await dataElf.user({login: 'Bob'}) !== null)
      fail("dataElf.user({login}) supposed to return null if there is none")

    const bob = {login: 'Bob', hash: 'sd7f6t87rew98sf9'},

          id = await dataElf.addUser(...values(bob))

    if (!id)
      fail("dataElf.addUser(login, hash) doesn't return id of added record")

    if (await dataElf.addUser(...values(bob)) !== false)
      fail("dataElf.addUser(login, hash) doesn't return false whed login occupied")

    if (!JSON.same({id,...bob}, await dataElf.user(id)))
      fail("dataElf.user(id) doesn't find the previously added user's record by id")

    if (!JSON.same({id,...bob}, await dataElf.user(bob)))
      fail("dataElf.user({login}) doesn't find the previously added user's record by login")

    if (await dataElf.updUser(2, {guess: 3}) !== false)
      fail("dataElf.updUser(id, {prop}) doesn't return false when there's no user with that id")

    if (await dataElf.updUser(id, {guess: 3}) !== true)
      fail("dataElf.updUser(id, {prop}) doesn't return true when record updated")

    if (!JSON.same({id,...bob, guess: 3}, await dataElf.user(id)))
      fail("dataElf.updUser(id, {prop}) didn't update the user record")
  }),

  sessions = makeTest("dataElf.siftSess() is supposed to delete all sessions that have expired, dataElf.sess(num) is supposed to get num least idle sessions, dataElf.addSes(ses) is supposed to add sessions, dataElf.updSes(sid, {prop}) supposed to update them, dataElf.delSes(sid) supposed to update them and dataElf.ses(sid) supposed to get the certain ones", "and they work as they should!", async (fail, crit, sleep)=> {

    'siftSess, sess, ses, addSes, updSes, delSes'.split(', ').forEach(m => {
      if (!dataElf[m]) crit(`but dataElf doesn't even have .${m}() method!`)
    })

    await dataElf.addArr('sessions').catch(c)

    if (await dataElf.ses(1) !== null)
      crit("dataElf.ses(sid) supposed to return null if there is none")

    const ses1 = {userid: 1, tokens: ['76s7fs6g07fg09s7fg09sd7f09g7d0g97sg67'],
      userTimeout: 123456789, started: 1577822531979, checked: 1577822531989},
      ses2 = {userid: 2, tokens: ['4mb23vm6bvm3246vm23nbv45mn32v5mn35'],
        userTimeout: 234567891, started: 1578438345433, checked: 1578438345443},
      ses3 = {userid: 2, tokens: ['0sadf0a8d7f098a7sd0f987a0d8f70aadsf'],
        userTimeout: 234567891, started: 1576438345433, checked: 1576438345443},

      sid1 = await dataElf.addSes(ses1),
      sid2 = await dataElf.addSes(ses2)

    if (!sid1)
      fail("dataElf.addSes(ses) doesn't return id of added record")

    if (!JSON.same({id: sid1,...ses1}, await dataElf.ses(sid1)))
      crit("dataElf.ses(sid) doesn't find the previously added session record by id")

    if(!JSON.same([{id: sid1,...ses1}, {id: sid2,...ses2}],
        await dataElf.sess()))
      fail("dataElf.sess() doesn't return all previously added sessions")

    const sid3 = await dataElf.addSes(ses3)

    if(!JSON.same([{id: sid1,...ses1}, {id: sid2,...ses2}],
        await dataElf.sess(2)))
      fail("dataElf.sess(num) doesn't return num last checked sessions")

    if (await dataElf.updSes(13, {checked: ses1.checked+10}) !== false)
      fail("dataElf.updSes(sid, {...props}) doesn't return false if record not found")

    if (await dataElf.updSes(sid1,  {checked: ses1.checked+10,
          tokens: [...ses1.tokens, 'o3iu25p3u45p2iu4p52oiu43']}) !== true)
      fail("dataElf.updSes(sid, {...props}) doesn't return true when record is updated")

    if (!JSON.same({id: sid1,...ses1, checked: ses1.checked+10,
      tokens: [...ses1.tokens, 'o3iu25p3u45p2iu4p52oiu43']},
        await dataElf.ses(sid1)))
      fail("dataElf.updSes(sid, {...props}) didn't update the session record")

    if (await dataElf.delSes(13) !== false)
      fail("dataElf.delSes(sid) didn't return false when session is not found")

    if (await dataElf.delSes(sid1) !== true)
      fail("dataElf.delSes(sid) didn't return true when session is deleted")

    if (await dataElf.ses(sid1) !== false)
      fail("dataElf.delSes(sid) didn't delete the session")


    /*
    const minute = 6e4, ten = 10*minute, twenty = 2*ten, forty = 4*ten,
          fifty = 5*ten, now = Date.now()


    'sessions without timeouts or with timeouts in the future should stay, sessions with timeout or userTimeout in the past should disappear'

    await dataElf.updSes(sid1, {}) */
  })

runTests()
