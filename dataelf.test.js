
const
  makeTest = require('./tester'),
  { assign, keys, values } = Object,
  c = console.log,
  csv =(...strs)=> [].concat(...strs.map(str => str.split(', '))),

  dataElf = require('.'),

  mongoConnect = 'mongodb+srv://testman:k9OgRrtXvly4U2vm'+
    '@gfcluster-o2r1m.mongodb.net/test?retryWrites=true&w=majority',

  runTests = async ()=> {
    await link()
  },

  // Expectations from dataElf module are as follows:
  // exports an object
  // it has a link method
    // it takes a connection string and options
    // it returns the same object
    // as side effect it adds to that object a db reference as a prop
    // and multiple methods to work through it

  link = makeTest("dataElf module supposed to be exporting an object with .link method to initialize the dataElf with a reference to the db object and add the rest of the methods, also it supposed to return the dataElf object itself", "and it does all that!",
    async (fail, crit)=> {

    const methods = csv('user, addUser, updUser',
      'ses, addSes, updSes, delSes, sess, siftSess'), absent = []

    if (typeof dataElf != 'object')
      fail("dataElf's index.js doesn't export an object")

    if (!dataElf.link || typeof dataElf.link != 'function')
      crit("dataElf doesn't have a .link(dbStr) method")

    const linkReturn = await dataElf.link(mongoConnect, {db: 'testdb'})

    if (linkReturn != dataElf)
      fail(".link(dbStr) didn't return the same dataElf object")

    if (!dataElf.db || typeof dataElf.db != 'object')
      fail("dataElf didn't aquire a reference to the db object after .link call")

    methods.splice(0, methods.length,...methods.filter(m =>
      dataElf[m] && typeof dataElf[m] == 'function'? 1 : absent.push(m) && 0))

    if (absent.length)
      fail("dataElf supposed to have methods: "+absent.join(', '))
  })


runTests()

assign(global, {dataElf, c})