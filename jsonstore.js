
const { max } = Math, { isArray } = Array, { values } = Object,
e = e => 0,
fsp = require('fs').promises,

findMaxId = obj => max(+obj.id||0,...(isArray(obj)? obj : values(obj))
  .filter(prop => typeof prop=='object').map(findMaxId))


module.exports = async filename => {
  const
    read = async queryFn =>
      await queryFn(JSON.parse(await fsp.readFile(filename, 'utf8')
        .catch(e) || '{}')),

    update = async queryFn => {
      const file = await fsp.readFile(filename, 'utf8').catch(e) || '{}',
            store = JSON.parse(file)
      try {
        const result = await queryFn(store, newId),
              json = JSON.stringify(store, null, 2)
        if (file != json) await fsp.writeFile(filename, json)
        return result
      }
      catch {
        throw new Error('New store state must be JSON-stringifiable!')
      }
    },

    newId =()=> ++maxId

  let maxId = await read(store => findMaxId(store))
  return {read, update}
}
