
let db

const
  { assign, entries } = Object,
  { MongoClient, ObjectId, Timestamp } = require('mongodb'),
  c = console.log,

  link = async (str, options={})=> {
    db = (await new MongoClient(str, {useUnifiedTopology: true}).connect())
      .db(options.db || 'lldb')
    return assign(exports, {db})
  }



assign(exports, { link })