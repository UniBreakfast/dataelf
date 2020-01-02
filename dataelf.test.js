
const
  makeTest = require('./tester'),
  { assign, keys, values } = Object,
  c = console.log,
  csv =(...strs)=> [].concat(...strs.map(str => str.split(', '))),

  dataElf = require('.'),
  { MongoClient, ObjectId } = require('mongodb'),

  mongoOptions = {useUnifiedTopology: true},
  mongoConnect = 'mongodb+srv://testman:k9OgRrtXvly4U2vm'+
    '@gfcluster-o2r1m.mongodb.net/test?retryWrites=true&w=majority',
  dbName = 'testdb',

  methods = csv('user, addUser, updUser',
    'ses, addSes, updSes, delSes, sess, siftSess'),
  absent = [],

  runTests = async ()=> {
    await link()
    await addUser(1)
  },

  link = makeTest("dataElf module is supposed to be exporting an object with .link method to initialize the dataElf with a reference to the db object and add the rest of the methods, also it supposed to return the dataElf object itself", "and it does all that!",
    async (fail, crit)=> {

    if (typeof dataElf != 'object')
      fail("dataElf's index.js doesn't export an object")

    if (!dataElf.link || typeof dataElf.link != 'function')
      crit("dataElf doesn't have a .link(dbStr) method")

    const db =
      (await MongoClient(mongoConnect, mongoOptions).connect()).db(dbName)

    await db.collection('users').drop()

    const linkReturn = await dataElf.link(mongoConnect, {db: dbName})

    if (linkReturn != dataElf)
      fail(".link(dbStr) didn't return the same dataElf object")

    if (!dataElf.db || typeof dataElf.db != 'object')
      fail(".link didn't add a db reference to the dataElf object")

    methods.splice(0, methods.length,...methods.filter(m =>
      dataElf[m] && typeof dataElf[m] == 'function'? 1 : absent.push(m) && 0))

    if (absent.length)
      fail(".link didn't add methods: "+absent.join(', '))

    if (!dataElf.db.users || dataElf.db.users.namespace!="testdb.users")
      fail(".link didn't add the db.users collection shorthand")
  })

  addUser = makeTest("dataElf.addUser(login, hash) is supposed to add a user record to the users collection in the db and should return that record's id", "and it does.", async (fail, crit)=> {

    if (!methods.includes('addUser')) crit('method not found')

    const bob = {login: 'Bob', hash: 'a098d7f0a8s7df'},
          timestamp = Date.now(),

          id = await dataElf.addUser(...values(bob))

    if (!id || typeof id != 'string')
      crit("dataElf.addUser(login, hash) didn't return the record id")

    const accepted = await dataElf.addUser(...values(bob))

    if (accepted) fail("dataElf.addUser(login, hash) didn't return false when login occupied")

    const record =
      await dataElf.db.collection('users').findOne({_id: ObjectId(id)})

    if (record._id.toString()!=id || record.login!=bob.login ||
        record.hash!=bob.hash || record.created-timestamp<0 ||
        record.created-timestamp>3e4)
      fail("dataElf.addUser(login, hash) didn't add the record correctly")
  })

runTests()

assign(global, {dataElf, c, ObjectId})