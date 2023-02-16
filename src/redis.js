import { promisify } from 'util'

const isObject = (value) => {
  const type = typeof value
  return value != null && (type === 'object' || type === 'function')
}

const mapObject = (value, fn) => {
  if (!isObject(value)) return []
  return Object.keys(value).map(key => fn(value[key], key))
}
class RedisStore {
  constructor(client, HASH_KEY = 'axios-cache') {

    this.client = client
    this.HASH_KEY = HASH_KEY
    this.hgetAsync = promisify(client.HGET).bind(client)
    this.hsetAsync = promisify(client.HSET).bind(client)
    this.hdelAsync = promisify(client.HDEL).bind(client)
    this.delAsync = promisify(client.DEL).bind(client)
    this.hlenAsync = promisify(client.HLEN).bind(client)
    this.hgetallAsync = promisify(client.HGETALL).bind(client)
  }

  async getItem(key) {
    const item = (await this.hgetAsync(this.HASH_KEY, key)) || null
    return JSON.parse(item)
  }

  async setItem(key, value) {
    await this.hsetAsync(this.HASH_KEY, key, JSON.stringify(value))
    return value
  }

  async removeItem(key) {
    await this.hdelAsync(this.HASH_KEY, key)
  }

  async clear() {
    await this.delAsync(this.HASH_KEY)
  }

  async length() {
    return this.hlenAsync(this.HASH_KEY)
  }

  async iterate(fn) {
    const hashData = await this.hgetallAsync(this.HASH_KEY)
    return Promise.all(mapObject(hashData, fn))
  }
}

export default RedisStore