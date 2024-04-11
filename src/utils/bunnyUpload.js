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


        // Calculate the height of the rectangle as 10% of the image's height
        const rectangleHeight = Math.floor(mainMetadata.height * 0.11);

        // Create a white rectangle overlay
        const whiteRectangle = Buffer.from(
            //         `<svg width="${mainMetadata.width}" height="${rectangleHeight}">
            //     <defs>
            //       <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            //         <stop offset="0%" style="stop-color:rgba(255, 255, 255, 0); stop-opacity:0" />
            //         <stop offset="100%" style="stop-color:rgba(255, 255, 255, 1); stop-opacity:1" />
            //       </linearGradient>
            //     </defs>
            //     <rect x="0" y="0" width="${mainMetadata.width}" height="${rectangleHeight}" fill="url(#grad1)" />
            //   </svg>`
            `<svg width="${watermarkWidth * 1.02}" height="${rectangleHeight}">
    <rect x="0" y="0" width="${watermarkWidth * 1.02}" height="${rectangleHeight}" fill="white" />
  </svg>`
        );

        // Calculate position for watermark with some space from edges
        // Assuming a 5% padding from the bottom right corner
        const paddingX = Math.floor(mainMetadata.width * 0.01);
        const paddingY = Math.floor(mainMetadata.height * 0.01);
        const watermarkX = mainMetadata.width - watermarkWidth - paddingX;
        const watermarkY = mainMetadata.height - watermarkHeight - paddingY;

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
