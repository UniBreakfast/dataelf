
const fsp = require('fs').promises

module.exports = filename => ({
  read: async queryFn =>
    await queryFn(JSON.parse(await fsp.readFile(filename, 'utf8') || '{}')),

  update: async queryFn => {
    const file = await fsp.readFile(filename, 'utf8') || '{}',
          store = JSON.parse(file)
    try {
      const result = await queryFn(store),
            json = JSON.stringify(store, null, 2)
      if (file != json) await fsp.writeFile(filename, json)
      return result
    }
    catch {
      throw new Error('New store state must be JSON-stringifiable!')
    }
  }
})
