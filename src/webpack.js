import path from 'path'
export const extendWebpackConfig =
  (config) =>
    webpackConfig => {
      const existingWebpackConfig =
        typeof config.admin?.webpack === 'function'
          ? config.admin.webpack(webpackConfig)
          : webpackConfig

      const mockModulePath = path.resolve(__dirname, './mocks/mockFile.js')

      const newWebpack = {
        ...existingWebpackConfig,
        module: {
          ...existingWebpackConfig.module,
          rules: [
            ...(existingWebpackConfig.module?.rules || []),
            { test: /\.node$/, use: "node-loader" }
          ]
        },
        resolve: {
          ...(existingWebpackConfig.resolve || {}),
          alias: {
            ...(existingWebpackConfig.resolve?.alias ? existingWebpackConfig.resolve.alias : {}),
            // Add additional aliases here like so:
            // [path.resolve(__dirname, './utils/bunnyUpload.js')]: mockModulePath,
            os: mockModulePath,
            fs: mockModulePath,
            stream: mockModulePath,
            util: mockModulePath,
            sharp: mockModulePath,
            https: mockModulePath,
          },
        },
      }

      return newWebpack
    }
