


export const getHandler = ({ credentials, collection, prefix }) => {
  return async (req, { params: { filename } }) => {
    try {

      const staticUrl = `https://${credentials.pullZoneName}.b-cdn.net`;
      const url = prefix ? `${staticUrl}/${prefix}/${filename}` : `${staticUrl}/${filename}`

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

      const bodyBuffer = await response.buffer();

      return new Response(bodyBuffer, {
        headers: new Headers({
          'Accept-Ranges': String(object.AcceptRanges),
          'Content-Length': String(object.ContentLength),
          'Content-Type': String(object.ContentType),
          ETag: String(object.ETag),
        }),
        status: 200,
      })
    } catch (err) {
      req.payload.logger.error(err)
      return new Response('Internal Server Error', { status: 500 })
    }
  }
}
