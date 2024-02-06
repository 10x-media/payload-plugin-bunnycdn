import { getIncomingFiles } from '../utils/getIncomingFiles';
import bunnyDelete from '../utils/bunnyDelete';
import bunnyUpload from '../utils/bunnyUpload';


export default function ({ collection, prefix, credentials, watermarkImagePath }) {

    return async ({ req, data, originalDoc }) => {
        try {
            console.time('File Upload')
            const files = getIncomingFiles({ req, data })
            console.log(files)
            if (files.length > 0) {
                // If there is an original doc,
                // And we have new files,
                // We need to delete the old files before uploading new
                if (originalDoc) {
                    let filesToDelete = []

                    if (typeof originalDoc?.filename === 'string') {
                        filesToDelete.push(originalDoc.filename)
                    }

                    if (typeof originalDoc.sizes === 'object') {
                        filesToDelete = filesToDelete.concat(
                            Object.values(originalDoc?.sizes || []).map(
                                resizedFileData => resizedFileData?.filename,
                            ),
                        )
                    }

                    const deletionPromises = filesToDelete.map(async filename => {
                        if (filename) {
                            bunnyDelete({ collection, req, filename, prefix, credentials })
                        }
                    })

                    await Promise.all(deletionPromises)
                }

                const promises = files.map(async file => {
                    await bunnyUpload({ collection, data, req, file, prefix, credentials, watermark: !data?.disableWatermark && watermarkImagePath, watermarkImagePath })
                    console.log(`Uploading file ${file.filename} for collection ${collection}`)
                })

                await Promise.all(promises)
                console.timeEnd('File Upload')
            }
        } catch (err) {
            req.payload.logger.error(
                `There was an error while uploading files corresponding to the collection ${collection} with filename ${data.filename}:`,
            )
            req.payload.logger.error(err)
        }
        return data
    }
}

