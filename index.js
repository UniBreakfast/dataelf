
let db, read, update

const
{ assign, entries } = Object,
jsonStore = require('./jsonstore'),

addArr = async (...names)=>
  await update(store => names.forEach(name => store[name] = store[name] || [])),

addUser = async (login, hash)=>
  await update((store, newId)=> store.users.find(u => u.login==login)? false :
    store.users.push({id: newId=newId(), login, hash}) && newId),

user = async opt => await read(store => store.users.find(
  typeof opt=='object'? u => entries(opt).every(([key, val])=> u[key]==val) :
    typeof opt=='number'? u => u.id==opt : 0) || null),

link = async str => assign(module.exports,
  {db: { read, update } = db = await jsonStore(str), addArr, addUser, user})


module.exports = {link}