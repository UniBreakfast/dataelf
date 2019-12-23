
const
  { assign } = Object,
  c = console.log,
  test = (title, finish, err) => [
    msg => !err && c("TEST: "+title) || c("FAIL: "+msg) || (err=1),
    ()=> !err && (c("TEST: "+title) || c("OK: "+finish)),
    msg => {!err && c("TEST: "+title) || c("FAIL: "+msg); throw msg}
  ],

  dataElf = require('.'),
  methods = 'addArr'.split(', '),

  runTests = async ()=> {
    await init()
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
  }

runTests()

// assign(global, {c, dataElf})
// setTimeout(c, 1e7)
