import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

const publicDir = path.join(process.cwd(), 'public')
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#1a1a1a"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5e6a3"/>
      <stop offset="50%" stop-color="#d4af37"/>
      <stop offset="100%" stop-color="#aa7c11"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="236" fill="none" stroke="url(#gold)" stroke-width="8" opacity="0.6"/>
  <g transform="translate(256, 256) scale(1.1) translate(-256, -256)">
    <path d="M 128 352 L 148 200 L 212 272 L 256 160 L 300 272 L 364 200 L 384 352 Z" fill="url(#gold)"/>
    <rect x="128" y="358" width="256" height="24" rx="6" fill="url(#gold)"/>
    <circle cx="148" cy="190" r="14" fill="#f5e6a3"/>
    <circle cx="256" cy="148" r="18" fill="#f5e6a3"/>
    <circle cx="364" cy="190" r="14" fill="#f5e6a3"/>
    <path d="M 256 100 L 260 118 L 278 122 L 260 126 L 256 144 L 252 126 L 234 122 L 252 118 Z" fill="url(#gold)"/>
  </g>
</svg>`

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent)

function crc32(buf) {
  let table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[i] = c
  }
  let crc = -1
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF]
  }
  return (crc ^ (-1)) >>> 0
}

function makePngChunk(type, data) {
  const len = data.length
  const buf = Buffer.alloc(8 + len + 4)
  buf.writeUInt32BE(len, 0)
  buf.write(type, 4, 4, 'ascii')
  data.copy(buf, 8)
  const typeAndData = buf.subarray(4, 8 + len)
  const crcVal = crc32(typeAndData)
  buf.writeUInt32BE(crcVal, 8 + len)
  return buf
}

function generateSquarePng(size) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
  
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0)
  ihdrData.writeUInt32BE(size, 4)
  ihdrData[8] = 8
  ihdrData[9] = 6
  ihdrData[10] = 0
  ihdrData[11] = 0
  ihdrData[12] = 0
  const ihdrChunk = makePngChunk('IHDR', ihdrData)

  const rawData = Buffer.alloc(size * (size * 4 + 1))
  const center = size / 2
  const radius = size * 0.45
  const goldR = 212, goldG = 175, goldB = 55
  const bgR = 10, bgG = 10, bgB = 10

  for (let y = 0; y < size; y++) {
    const rowOffset = y * (size * 4 + 1)
    rawData[rowOffset] = 0
    for (let x = 0; x < size; x++) {
      const pxOffset = rowOffset + 1 + x * 4
      const dx = x - center
      const dy = y - center
      const dist = Math.sqrt(dx * dx + dy * dy)

      let r = bgR, g = bgG, b = bgB, a = 255

      if (Math.abs(dist - radius) < size * 0.02) {
        r = goldR; g = goldG; b = goldB
      } else if (dist > radius + size * 0.02) {
        r = 0; g = 0; b = 0; a = 0
      } else {
        const normY = (y - (center - size * 0.1)) / (size * 0.4)
        const normX = dx / (size * 0.3)
        if (normY >= 0 && normY <= 0.6) {
          if (normY > 0.5 && Math.abs(normX) < 0.6) {
            r = goldR; g = goldG; b = goldB
          } else if (normY <= 0.5) {
            const peak1 = Math.abs(normX) < 0.1 && normY > (Math.abs(normX) * 2)
            const peak2 = Math.abs(normX) > 0.25 && Math.abs(normX) < 0.55 && normY > ((Math.abs(normX) - 0.4) * (Math.abs(normX) - 0.4) * 4)
            if (peak1 || peak2) {
              r = goldR; g = goldG; b = goldB
            }
          }
        }
      }

      rawData[pxOffset] = r
      rawData[pxOffset + 1] = g
      rawData[pxOffset + 2] = b
      rawData[pxOffset + 3] = a
    }
  }

  const compressedData = zlib.deflateSync(rawData)
  const idatChunk = makePngChunk('IDAT', compressedData)
  const iendChunk = makePngChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk])
}

const png192 = generateSquarePng(192)
const png512 = generateSquarePng(512)
const png180 = generateSquarePng(180)
const png48 = generateSquarePng(48)

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192)
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512)
fs.writeFileSync(path.join(publicDir, 'apple-icon.png'), png180)
fs.writeFileSync(path.join(publicDir, 'icon.png'), png48)
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), png48)

console.log('Successfully generated default static favicons in public/')
