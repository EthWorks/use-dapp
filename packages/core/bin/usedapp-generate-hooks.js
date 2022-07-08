#!/usr/bin/env ts-node
'use strict';

// TS-Node is required because we need to be importing typechain files.
// Unless a different approach is possible?

require('ts-node/register/transpile-only')

console.log('EXPERIMENTAL: UseDApp automatic hook generation tool')

const usage = () => {
  console.log(`
  Usage:
  
  USEDAPP_OUT_DIR=<destination directory> \
  USEDAPP_TYPES_DIR=<typechain files> \
  USEDAPP_ABIS_DIR=<contract abis> \
  usedapp-generate-hooks
  `)
}

if (!process.env.USEDAPP_OUT_DIR || !process.env.USEDAPP_TYPES_DIR || !process.env.USEDAPP_ABIS_DIR) {
  usage()
  process.exit(-1)
}

const generate = require('../generate/generate')
generate()
  .then(() => console.log('✅ All done.'))
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
