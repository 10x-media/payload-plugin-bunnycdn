import * as AWS from '@aws-sdk/client-s3'
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

function bunnyStorageInternal({ acl, bucket, config = {}, credentials }) {
  return ({ collection, prefix }) => {
    let storageClient = null
    const getStorageClient = () => {
      if (storageClient) return storageClient
      storageClient = new AWS.S3(config)
      return storageClient
    }

    return {
      name: 'bunnycdn',
      generateURL: getGenerateURL({ credentials }),
      handleDelete: getHandleDelete({ credentials }),

      handleUpload: getHandleUpload({
        acl,
        bucket,
        collection,
        getStorageClient,
        prefix,
      }),
      staticHandler: getHandler({ bucket, collection, getStorageClient }),
    }
  }
}
