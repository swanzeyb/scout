#!/usr/bin/env node
import { exec as execCB } from 'child_process'

function exec(command, options={}) {
  return new Promise((resolve, reject) => {
    execCB(command, options, (error, stdout) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout)
      }
    })
  })
}

async function main() {
  await exec('gh repo clone swanzeyb/app-template')
}
