export const Media = {
    slug: 'media',
    upload: {
        imageSizes: [
            {
                name: 'cropped',
                width: 1920,
                // height: undefined,
                height: 1280,
                position: 'centre',
                withoutEnlargement: false,
                formatOptions: {
                    format: 'webp',
                    options: {
                        quality: 60,
                    }
                },
            },
            {
                name: 'croppedWatermarked',
                width: 1923,
                withoutEnlargement: false,
                // height: undefined,
                height: 1282,
                position: 'centre',
                formatOptions: {
                    format: 'webp',
                    options: {
                        quality: 60,
                    }
                },
            },
            {
                name: 'portrait',
                width: 1440,
                // height: undefined,
                height: 1920,
                position: 'centre',
                formatOptions: {
                    format: 'webp',
                    options: {
                        quality: 60,
                    }
                },
            },
        ]
    },
    access: {
        read: () => true,
    },
    fields: []
}