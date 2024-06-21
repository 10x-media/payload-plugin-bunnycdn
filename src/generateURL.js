

export const getGenerateURL = ({ credentials }) => ({ filename, prefix = '' }) => {
  const staticUrl = `https://${credentials.pullZoneName}.b-cdn.net`;


  return prefix ? `${staticUrl}/${prefix}/${filename}` : `${staticUrl}/${filename}`
}


