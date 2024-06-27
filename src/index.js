import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { getGenerateURL } from './generateURL.js'
import { getHandleDelete } from './handleDelete.js'
import { getHandleUpload } from './handleUpload.js'
import { getHandler } from './staticHandler.js'

/**
 * Bunny CDN Storage Plugin
 * @param {Object} bunnyStorageOptions Bunny CDN Storage Plugin Options
 * @param {Object} bunnyStorageOptions.credentials Bunny CDN Storage Plugin Credentials
 * @param {string} bunnyStorageOptions.credentials.hostname Bunny CDN Storage Plugin Hostname
 * @param {string} bunnyStorageOptions.credentials.storageZoneName Bunny CDN Storage Plugin Storage Zone Name
 * @param {string} bunnyStorageOptions.credentials.pullZoneName Bunny CDN Storage Plugin Pull Zone Name
 * @param {string} bunnyStorageOptions.credentials.accessKey Bunny CDN Storage Plugin Access Key
 * @param {string} bunnyStorageOptions.access Bunny CDN Storage Plugin Access
 * @param {Object} bunnyStorageOptions.collections Bunny CDN Storage Plugin Collections
 * @param {Object} bunnyStorageOptions.collections.collection Bunny CDN Storage Plugin Collection
 * @param {string} bunnyStorageOptions.collections.collection.prefix Bunny CDN Storage Plugin Collection Prefix
 * @param {boolean} bunnyStorageOptions.collections.collection.disablePayloadAccessControl Bunny CDN Storage Plugin Collection Disable Payload Access Control
 */
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

function bunnyStorageInternal({ credentials, access = 'public' }) {
  return ({ collection, prefix }) => {

    return {
      name: 'bunnycdn',
      generateURL: getGenerateURL({ credentials }),
      handleDelete: getHandleDelete({ credentials }),
      handleUpload: getHandleUpload({ credentials }),

      staticHandler: getHandler({ collection, credentials, prefix, access }),
    }
  }
}
