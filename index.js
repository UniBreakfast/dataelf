
let db

const
  { assign, entries } = Object,
  { MongoClient, ObjectId } = require('mongodb'),
  c = console.log,

  prepUsers = async ()=> {
    await db.createCollection("users", {validator: {$jsonSchema: {
      bsonType: "object",
      required: ["login", "hash"],
      properties: {
        login: {bsonType: "string", minLength: 2, maxLength: 32},
        hash: {bsonType: "string", minLength: 10}
      }
    }}})
    db.users = db.collection('users')
    await db.users.createIndex({login: 1}, {unique: true})

  },

  addUser = async (login, hash)=> {
    try {
      return (await db.users.insertOne({login, hash, created: Date.now()}))
        .insertedId.toString()
    } catch (err) {
      if ([121, 11000].includes(err.code)) return false
      else throw err
    }
  },

  user = async ref => {
    const id = typeof ref=='string'? ref :0,
          query = id? {_id: ObjectId(ref)} : ref
    let record = await db.users.findOne(query)
    if (record) {
      record = {id: id || record._id.toString(), ...record}
      delete record._id
    }
    return record
  },

  link = async (str, options={})=> {
    db = (await MongoClient(str, {useUnifiedTopology: true}).connect())
      .db(options.db || 'lldb')
    await prepUsers()
    return assign(exports, {db, addUser, user})
  }



assign(exports, { link })