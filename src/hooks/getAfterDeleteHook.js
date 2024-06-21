import bunnyDelete from '../utils/-bunnyDelete';


export default function ({ collection, credentials, prefix }) {
    return async ({ req, doc }) => {
        try {
            const filesToDelete = [
                doc.filename,
                ...Object.values(doc?.sizes || []).map(resizedFileData => resizedFileData?.filename),
            ]

            const promises = filesToDelete.map(async filename => {
                if (filename) await bunnyDelete({ collection, doc, req, filename, credentials, prefix })
            })

            await Promise.all(promises)
        } catch (err) {
            req.payload.logger.error(
                `There was an error while deleting files corresponding to the ${collection.labels?.singular} with ID ${doc.id}:`,
            )
            req.payload.logger.error(err)
        }
        return doc
    }
}
