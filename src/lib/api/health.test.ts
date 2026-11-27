import { NextApiRequest, NextApiResponse } from 'next'

import handler from '../../pages/api/health'

const createResponse = () => {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    setHeader(name: string, value: string) {
      this.headers[name] = value
      return this
    },
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(body: unknown) {
      this.body = body
      return this
    }
  }
  return res
}

const call = (method: string) => {
  const res = createResponse()
  handler({ method } as NextApiRequest, res as unknown as NextApiResponse)
  return res
}

describe('GET /api/health', () => {
  beforeEach(() => {
    jest.spyOn(console, 'info').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('answers 200 with a status payload and is never cached', () => {
    const res = call('GET')
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
    expect(res.headers['Cache-Control']).toBe('no-store')
  })

  it('accepts HEAD for monitors that probe without a body', () => {
    const res = call('HEAD')
    expect(res.statusCode).toBe(200)
  })

  it('rejects other methods with 405 and an Allow header', () => {
    const res = call('POST')
    expect(res.statusCode).toBe(405)
    expect(res.headers.Allow).toBe('GET, HEAD')
  })
})
