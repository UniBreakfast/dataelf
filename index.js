
let db, read, update

const
{ assign, entries } = Object,
jsonStore = require('./jsonstore'),

addArr = async (...names)=>
  await update(store => names.forEach(name => store[name] = store[name] || [])),

select =(arr, opt)=> arr.find(
  typeof opt=='object'? u => entries(opt).every(([key, val])=> u[key]==val) :
    typeof opt=='number'? u => u.id==opt : 0) || null

user = async opt => await read(store => select(store.users, opt)),

addUser = async (login, hash)=>
  await update((store, newId)=> store.users.find(u => u.login==login)? false :
    store.users.push({id: newId=newId(), login, hash}) && newId),

updUser = async (opt, upd)=> await update(store => {
  const user = select(store.users, opt)
  return user? assign(user, upd) && true : false
}),

siftSess = async ()=> {

},

sess = async num => {

},

ses = async sid => {

},

addSes = async ses => {

},

updSes = async (sid, upd)=> {

},


link = async str => assign(exports,
  {db: { read, update } = db = await jsonStore(str),
    addArr, user, addUser, updUser, siftSess, sess, ses, addSes, updSes})


assign(exports, {link})