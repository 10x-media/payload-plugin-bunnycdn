import { buildConfig } from 'payload/config';
import path from 'path';
import Users from './collections/Users';
import Examples from './collections/Examples';
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { slateEditor } from '@payloadcms/richtext-slate'
import { pluginBunnyCdn, samplePlugin } from '../../src/index'

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
    webpack: config => {
      const newConfig = {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...(config?.resolve?.alias || {}),
            react: path.join(__dirname, '../node_modules/react'),
            'react-dom': path.join(__dirname, '../node_modules/react-dom'),
            payload: path.join(__dirname, '../node_modules/payload'),
          },
        },
      }
      return newConfig
    },
  },
  editor: slateEditor({}),
  collections: [
    Examples, Users,
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  plugins: [pluginBunnyCdn({
    credentials: {
      hostname: process.env.PAYLOAD_PUBLIC_BUNNY_CDN_REGION ? `${process.env.PAYLOAD_PUBLIC_BUNNY_CDN_REGION}.${(process.env.PAYLOAD_PUBLIC_BUNNY_CDN_BASE_HOSTNAME || 'storage.bunnycdn.com')}` : (process.env.PAYLOAD_PUBLIC_BUNNY_CDN_BASE_HOSTNAME || 'storage.bunnycdn.com'),
      storageZoneName: process.env.PAYLOAD_PUBLIC_BUNNY_CDN_STORAGE_ZONE_NAME,
      pullZoneName: process.env.PAYLOAD_PUBLIC_BUNNY_CDN_PULL_ZONE_NAME,
      accessKey: process.env.BUNNY_CDN_API_KEY,
    },
    collections: {
      media: {
        prefix: 'media'
      }
    }
  })],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),
})
