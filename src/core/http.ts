import { join } from 'path'
import { pipeline } from 'stream'
import { promisify } from 'util'
import { promises as fs, createWriteStream } from 'fs'
import fetch from 'node-fetch'
import config from './config'

const pipe = promisify(pipeline)

/**
 * Send a http request.
 * @param url url
 * @param init init
 */
export const request = async (url: fetch.RequestInfo, init?: fetch.RequestInit): Promise<fetch.Response> => {
  const response = await fetch(url, init)
  // res.status >= 200 && res.status < 300
  if (response.ok) return response
  throw Error(`Unexpected response: ${response.statusText}`)
}

/**
 * Download remote resource to temporary file.
 * @param url remote url
 * @returns temporary filename
 */
export const download = async (url: string): Promise<string> => {
  const response = await request(url)
  // ensure temp dirname
  await fs.mkdir(config.paths.temp, { recursive: true })
  const filename = join(config.paths.temp, Date.now().toString() + '.tmp')
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await pipe(response.body!, createWriteStream(filename))
  return filename
}
