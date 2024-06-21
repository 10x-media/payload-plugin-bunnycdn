import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { getGenerateURL } from './generateURL.js'
import { getHandleDelete } from './handleDelete.js'
import { getHandleUpload } from './handleUpload.js'
import { getHandler } from './staticHandler.js'

export const bunnyStorage = (bunnyStorageOptions) => (incomingConfig) => {
  if (bunnyStorageOptions.enabled === false) {
    return incomingConfig
  }

  const adapter = bunnyStorageInternal(bunnyStorageOptions)

  const collectionsWithAdapter = Object.entries(bunnyStorageOptions.collections).reduce(
    (acc, [slug, collOptions]) => ({
      ...acc,
      [slug]: {
        ...(collOptions === true ? {} : collOptions),
        adapter,
      },
    }),
    {}
  )

  const config = {
    ...incomingConfig,
    collections: (incomingConfig.collections || []).map((collection) => {
      if (!collectionsWithAdapter[collection.slug]) {
        return collection
      }

      return {
        ...collection,
        upload: {
          ...(typeof collection.upload === 'object' ? collection.upload : {}),
          disableLocalStorage: true,
        },
      }
    }),
  }

  return cloudStoragePlugin({
    collections: collectionsWithAdapter,
  })(config)
}

function bunnyStorageInternal({ credentials }) {
  return ({ collection, prefix }) => {

    return {
      name: 'bunnycdn',
      generateURL: getGenerateURL({ credentials }),
      handleDelete: getHandleDelete({ credentials }),
      handleUpload: getHandleUpload({
        credentials,
        //  prefix:
      }),

      staticHandler: getHandler({ collection, credentials, prefix }),
    }
  }
}
