
import crypto from 'crypto';

export const getHandler = ({ credentials, collection, prefix, access }) => {
  return async (req, { params: { filename } }) => {
    try {

      const staticUrl = `https://${credentials.pullZoneName}.b-cdn.net`;
      let url = prefix ? `${staticUrl}/${prefix}/${filename}` : `${staticUrl}/${filename}`

      // Create signed URL
      if (access === 'private') {
        const expires = Math.floor(Date.now() / 1000) + 3600
        const path = prefix ? `/${prefix}/${filename}` : `/${filename}`
        const tokenString = process.env.BUNNY_CDN_TOKEN + path + expires

        var md5String = crypto.createHash("md5").update(tokenString).digest("binary");
        var token = Buffer.from(md5String, 'binary').toString('base64');
        token = token.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');


        url = `${url}?token=${token}&expires=${expires}`
      }



      const response = await fetch(url);
      if (!response.ok) return new Response(`Failed to fetch ${url}: ${response.statusText}`, { status: 400 })

      const bodyBuffer = await response.arrayBuffer();

      // Extract necessary headers from the response
      const headers = {
        'Accept-Ranges': response.headers.get('Accept-Ranges') || 'bytes',
        'Content-Length': response.headers.get('Content-Length') || bodyBuffer.byteLength.toString(),
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        // 'ETag': response.headers.get('ETag') || '',
      };


      return new Response(bodyBuffer, {
        headers: new Headers(headers),
        status: 200,
      })
    } catch (err) {
      req.payload.logger.error(err)
      return new Response('Internal Server Error', { status: 500 })
    }
  }
}
