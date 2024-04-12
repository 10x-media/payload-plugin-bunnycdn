import getAfterDeleteHook from "./hooks/getAfterDeleteHook"
import getBeforeChangeHook from "./hooks/getBeforeChangeHook"
import slugifyFileNameHook from "./hooks/slugifyFileNameHook"
import { extendWebpackConfig } from "./webpack";

/**
 * @param {Object} pluginOptions - Options for the plugin.
 * @param {Object} pluginOptions.collections - Collection configurations.
 * @param {boolean} pluginOptions.disableLocalStorage - Flag to disable local storage.
 * @param {Object} pluginOptions.credentials - Bunny CDN credentials.
 * 
 * 
 * @returns {Function} - A function that takes in a configuration object and returns a modified configuration object.
 */
export function pluginBunnyCdn(pluginOptions) {
  const { credentials, credentials: { hostname, storageZoneName, pullZoneName, accessKey } = {} } = pluginOptions || {};
  const collections = pluginOptions.collections || {}
  const disableLocalStorage = pluginOptions.disableLocalStorage || true;

  return (
    (incomingConfig) => {
      const newConfig = { ...incomingConfig }

      const webpack = extendWebpackConfig(incomingConfig)

      newConfig.admin = {
        ...(newConfig.admin || {}),
        // If you extended the webpack config, add it back in here
        // If you did not extend the webpack config, you can remove this line
        webpack,

        // Add additional admin config here

        // components: {
        //   ...(config.admin?.components || {}),
        //   // Add additional admin components here
        //   afterDashboard: [
        //     ...(config.admin?.components?.afterDashboard || []),
        //     AfterDashboard,
        //   ],
        // },
      }

      newConfig.collections = newConfig.collections.map(collectionConfig => {
        // Currently only prefix
        const specificConfigs = collections[collectionConfig.slug]
        const prefix = specificConfigs?.prefix

        if (!specificConfigs) return collectionConfig

        console.log('applying bunny cdn to collection', collectionConfig.slug)

        const staticUrl = `https://${credentials.pullZoneName}.b-cdn.net`
        console.log('staticUrl', staticUrl)

        return ({
          ...collectionConfig,
          hooks: {
            ...(collectionConfig.hooks || {}),
            beforeValidate: [
              ...(collectionConfig.hooks?.beforeValidate || []),
              slugifyFileNameHook({ collection: collectionConfig.slug, credentials })
            ].filter(Boolean),
            beforeChange: [
              ...(collectionConfig.hooks?.beforeChange || []),
              getBeforeChangeHook({ collection: collectionConfig.slug, prefix, credentials, pluginOptions })
            ].filter(Boolean),
            afterDelete: [
              ...(collectionConfig.hooks?.afterDelete || []),
              getAfterDeleteHook({ collection: collectionConfig.slug, prefix, credentials })
            ].filter(Boolean),
          },
          upload: {
            ...(collectionConfig.upload || {}),
            disableLocalStorage,
            staticURL: prefix ? `${staticUrl}/${prefix}` : staticUrl,
            ...specificConfigs.upload
          }
        })
      })


      return newConfig
    })
}