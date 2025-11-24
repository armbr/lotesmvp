#!/usr/bin/env node
const crypto = require('crypto')

function usage(){
  console.log('Usage: node scripts/sign.js <json-body> <secret>')
  console.log('Or: cat payload.json | node scripts/sign.js - <secret>')
}

async function main(){
  const args = process.argv.slice(2)
  if (args.length < 2) { usage(); process.exit(1) }
  const bodyArg = args[0]
  const secret = args[1]
  let body = ''
  if (bodyArg === '-'){
    // read stdin
    body = await new Promise((res, rej)=>{
      let s = ''
      process.stdin.setEncoding('utf8')
      process.stdin.on('data', d=>s+=d)
      process.stdin.on('end', ()=>res(s))
      process.stdin.on('error', rej)
    })
  } else {
    body = bodyArg
  }

  try {
    // normalize spacing for json strings
    let normalized = body
    try { const parsed = JSON.parse(body); normalized = JSON.stringify(parsed) } catch(e) { /* keep raw */ }
    const sig = crypto.createHmac('sha256', secret).update(normalized).digest('hex')
    console.log(sig)
  } catch(e){
    console.error('Error creating signature', e)
    process.exit(2)
  }
}

main()
