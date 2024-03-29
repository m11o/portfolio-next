import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  res.setHeader('WWW-authenticate', 'Basic realm="Secure Area"')
  res.status(401)
  return res.json({ message: 'Basic Authentication Required' })
}
