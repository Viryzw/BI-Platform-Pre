import { cpSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const projectRoot = resolve(frontendRoot, '..')
const templateRoot = resolve(projectRoot, 'frontend-macos')

mkdirSync(resolve(frontendRoot, 'public'), { recursive: true })
cpSync(resolve(templateRoot, 'index.html'), resolve(frontendRoot, 'index.html'))
cpSync(resolve(templateRoot, 'assets'), resolve(frontendRoot, 'public/assets'), {
  recursive: true,
  force: true,
})

console.log('已将 frontend-macos 界面单向同步到 frontend（模板目录未修改）')
