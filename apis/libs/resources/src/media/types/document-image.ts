import { BadRequestException } from '@nestjs/common';
export function documentImageType(data: Buffer): {
  mime: string;
  extension: string;
} {
  if (data.length === 0 || data.length > 10 * 1024 * 1024)
    throw new BadRequestException('Document must be between 1 byte and 10 MB');
  if (
    data.length > 24 &&
    data
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
    data.subarray(12, 16).toString() === 'IHDR' &&
    data.readUInt32BE(16) > 0 &&
    data.readUInt32BE(20) > 0 &&
    data.subarray(-8, -4).toString() === 'IEND'
  )
    return { mime: 'image/png', extension: 'png' };
  if (
    data.length > 12 &&
    data[0] === 255 &&
    data[1] === 216 &&
    data[2] === 255 &&
    data[data.length - 2] === 255 &&
    data[data.length - 1] === 217
  )
    return { mime: 'image/jpeg', extension: 'jpg' };
  if (
    data.length > 20 &&
    data.subarray(0, 4).toString() === 'RIFF' &&
    data.subarray(8, 12).toString() === 'WEBP' &&
    data.readUInt32LE(4) + 8 === data.length &&
    ['VP8 ', 'VP8L', 'VP8X'].includes(data.subarray(12, 16).toString())
  )
    return { mime: 'image/webp', extension: 'webp' };
  throw new BadRequestException('Upload an actual JPEG, PNG, or WebP image');
}

/** PDF content is rendered as pixels in the client; never embedded as active HTML. */
export function documentFileType(data: Buffer): {
  mime: string;
  extension: string;
} {
  if (
    data.length > 0 &&
    data.length <= 10 * 1024 * 1024 &&
    /^%PDF-1\.[0-7]|^%PDF-2\.0/.test(data.subarray(0, 8).toString('ascii')) &&
    /%%EOF\s*$/.test(data.subarray(-1024).toString('ascii'))
  )
    return { mime: 'application/pdf', extension: 'pdf' };
  try { return documentImageType(data); } catch { throw new BadRequestException('Upload an actual JPEG, PNG, WebP, or PDF document up to 10 MB'); }
}
