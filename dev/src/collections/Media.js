export const Media = {
    slug: 'media',
    upload: {
        imageSizes: [
            {
                name: 'croppedLarge',
                width: 3840,
                height: 2560,
                position: 'centre',
                formatOptions: {
                    format: 'webp',
                    options: {
                        quality: 60,
                    }
                },
            },
            {
                name: 'croppedWatermarkedLarge',
                width: 3843,
                height: 2562,
                position: 'centre',
                formatOptions: {
                    format: 'webp',
                    options: {
                        quality: 60,
                    }
                },
            },
            {
                name: 'cropped',
                width: 1920,
                withoutEnlargement: false,
                height: 1280,
                position: 'centre',
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
                height: 1482,
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
                height: 1920,
                position: 'centre',
                formatOptions: {
                    format: 'webp',
                    options: {
                        quality: 60,
                    }
                },
            },
        ],
        mimeTypes: ['image/svg+xml', 'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/*', 'audio/*', 'video/*', 'text/*'],
    },
    access: {
        read: () => true,
    },
    fields: []
}