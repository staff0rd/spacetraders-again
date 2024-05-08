const fs = require('fs')
const path = require('path')
const parser = require('node-html-parser')
const args = process.argv.slice(2)
const filePath = path.resolve(args[0])
const file = fs.readFileSync(filePath, 'utf-8')
const html = parser.parse(file)

const links = html
  .querySelectorAll('link[rel=stylesheet]')
  .map((s) => s.toString())
  .join('')
const scripts = html
  .querySelectorAll('script')
  .map((s) => s.toString())
  .join('')

fs.writeFileSync('out.html', links + scripts)
