// import { Upload } from '@aws-sdk/lib-storage'
import fs from 'fs'
// import path from 'path'

// const multipartThreshold = 1024 * 1024 * 50 // 50MB

export const getHandleUpload = ({
  prefix,
  credentials,

}) => {
  return async ({ data, file }) => {

    console.log('data.prefix', data.prefix)

    const newStream = file.tempFilePath
      ? fs.createReadStream(file.tempFilePath)
      : new Readable({
        read() {
          this.push(newBuffer);
          this.push(null); // No more data
        }
      });

    // if (file.buffer.length > 0 && file.buffer.length < multipartThreshold) {

    //   // Upload logic


    //   // await getStorageClient().putObject({
    //   //   ACL: acl,
    //   //   Body: fileBufferOrStream,
    //   //   Bucket: bucket,
    //   //   ContentType: file.mimeType,
    //   //   Key: fileKey,
    //   // })

    //   return data
    // }

    // const parallelUploadS3 = new Upload({
    //   client: getStorageClient(),
    //   params: {
    //     ACL: acl,
    //     Body: fileBufferOrStream,
    //     Bucket: bucket,
    //     ContentType: file.mimeType,
    //     Key: fileKey,
    //   },
    //   partSize: multipartThreshold,
    //   queueSize: 4,
    // })



    console.log(file.filename)
    const options = {
      method: 'PUT',
      host: credentials.hostname,
      path: `/${credentials.storageZoneName}${prefix ? `/${prefix}` : ''}/${file.filename}`,
      headers: {
        AccessKey: credentials.accessKey,
        'Content-Type': 'application/octet-stream',
      },
    };

    // console.log(options);

    await new Promise((resolve, reject) => {
      const bunnyReq = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk.toString('utf8');
        });
        res.on('end', () => {
          console.log(responseData);
          resolve(responseData); // Resolve when the upload is finished
        });
      });

      bunnyReq.on('error', (error) => {
        console.error(error);
        reject(error); // Reject the promise on error
      });

      newStream.pipe(bunnyReq);
    });


    return data
  }
}
