JSON.same =(a, b)=> JSON.stringify(a) == JSON.stringify(b)

const
  c = console.log,
  test = (title, finish, err) => [
    msg => !err && c("TEST: "+title) || c("FAIL: "+msg) || (err=1),
    ()=> !err && (c("TEST: "+title) || c("OK: "+finish)),
    msg => {!err && c("TEST: "+title) || c("FAIL: "+msg) || (err=1); throw msg}
  ],
  makeTest =(title, ok, checkFn)=> async swallow => {
    const [ fail, end, crit ] = test(title, ok)
    await checkFn(fail, crit).catch(err => {if (!swallow) throw err})
    end()
  }

module.exports = makeTest