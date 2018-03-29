import { sha256 } from './Digest'
import base64url from 'base64url'

export function ES256KSigner (recoverable = false) {
  function toJose ({r, s, recoveryParam}) {
    const jose = Buffer.alloc(recoverable ? 65 : 64)
    Buffer.from(r, 'hex').copy(jose, 0)
    Buffer.from(s, 'hex').copy(jose, 32)
    if (recoverable) {
      if (recoveryParam === undefined) throw new Error('Signer did not return a recoveryParam')
      jose[64] = recoveryParam
    }
    return base64url.encode(jose)
  }

  return async function sign (payload, signer) {
    const signature = await signer(sha256(payload))
    return toJose(signature)
  }
}

const algorithms = { ES256K: ES256KSigner(), 'ES256K-R': ES256KSigner(true) }

function SignerAlgorithm (alg) {
  const impl = algorithms[alg]
  if (!impl) throw new Error(`Unsupported algorithm ${alg}`)
  return impl
}
SignerAlgorithm.sha256 = sha256
module.exports = SignerAlgorithm