
export function getIncomingFiles({
    req,
    data,
}) {
    const file = req.files?.file

    let files = []

    if (file && data.filename && data.mimeType) {
        const mainFile = {
            filename: data.filename,
            mimeType: data.mimeType,
            buffer: file.data,
            tempFilePath: file.tempFilePath,
            filesize: file.size,
        }

        files = [mainFile]

        if (data?.sizes) {
            Object.entries(data.sizes).forEach(([key, resizedFileData]) => {
                if (req.payloadUploadSizes?.[key] && data.mimeType) {
                    files = files.concat([
                        {
                            sizeName: key,
                            filename: `${resizedFileData.filename}`,
                            mimeType: data.mimeType,
                            buffer: req.payloadUploadSizes[key],
                            filesize: req.payloadUploadSizes[key].length,
                        },
                    ])
                }
            })
        }
    }
    console.log(files)
    return files
}
