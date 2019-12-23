
const dataElf = require('.'),
      { assign } = Object,
      c = console.log

assign(global, {c, dataElf})

setTimeout(c, 1e7)