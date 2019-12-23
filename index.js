
const
fsp = require('fs').promises,

read = async queryFn =>
  await queryFn(JSON.parse(await fsp.readFile(dbStr, 'utf8') || '{}')),

update = async queryFn => {
  const file = await fsp.readFile(dbStr, 'utf8') || '{}',
        store = JSON.parse(file)
  try {
    const result = await queryFn(store),
          json = JSON.stringify(store, ' ', 2)
    if (file != json) await fsp.writeFile(dbStr, json)
    return result
  }
  catch {
    throw new Error('New store state must be JSON-stringifiable!')
  }
},

addArr = async (...names)=>
  await update(store => names.forEach(name => store[name] = store[name] || [])),

init = str => {
  dbStr = str
  return Object.assign(module.exports, {db: {read, update}, addArr})
}

let dbStr

module.exports = {init}