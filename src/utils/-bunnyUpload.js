import { Readable } from 'stream';
import https from 'https';
import sharp from 'sharp';

export default async function ({ data, collection, req, file, prefix, credentials, watermark, watermarkImagePath }) {
    // if image, add watermark
    let newBuffer;
    if (file.mimeType.includes('image') && watermark) {
        newBuffer = await addWatermark(file.buffer, watermarkImagePath);
    } else {
        newBuffer = file.buffer;
    }

    const bufferStream = new Readable({
        read() {
            this.push(newBuffer);
            this.push(null); // No more data
        }
    });


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

    return new Promise((resolve, reject) => {
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

        bufferStream.pipe(bunnyReq);
    });

};





// Function to add a watermark
export async function addWatermark(buffer, watermarkImagePath) {
    try {

        // Read the main image and get its metadata
        const mainImage = sharp(buffer);
        const mainMetadata = await mainImage.metadata();

        // Read the watermark image and get its metadata
        const watermarkImage = sharp(watermarkImagePath);
        const watermarkMetadata = await watermarkImage.metadata();

        // Calculate watermark size as a percentage of the main image size, e.g., 10%
        const watermarkWidth = Math.floor(mainMetadata.width * 0.5); // 10% of main image's width
        const scaleFactor = watermarkWidth / watermarkMetadata.width;
        const watermarkHeight = Math.floor(watermarkMetadata.height * scaleFactor);

        // Resize watermark
        const resizedWatermark = await watermarkImage
            .resize(watermarkWidth)
            .toBuffer();


        // Composite the watermark over the main image
        const result = await mainImage
            .composite([{ input: resizedWatermark, gravity: 'center' }])
            // .composite([{ input: whiteRectangle, top: mainMetadata.height - rectangleHeight, left: watermarkX }, { input: resizedWatermark, left: watermarkX, top: watermarkY }])
            .toBuffer();

        // You can then save this buffer to a file or use it as needed
        // For example, to save to a file:
        console.log('Watermark added successfully');
        return result

    } catch (error) {
        console.error('Error adding watermark:', error);
    }
};
