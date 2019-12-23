
const
jsonStore = require('./jsonstore'),

addArr = async (...names)=>
  await update(store => names.forEach(name => store[name] = store[name] || [])),

link = str => {
  return Object.assign(module.exports, {db: jsonStore(str), addArr})
}

module.exports = {link}