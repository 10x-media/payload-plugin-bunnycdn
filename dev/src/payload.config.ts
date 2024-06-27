//@ts-nocheck

import { buildConfig } from 'payload'
import path from 'path'
import Users from './collections/Users'
import Examples from './collections/Examples'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { bunnyStorage } from '../../src/index'
import sharp from 'sharp'
import { Media } from './collections/Media'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',
  admin: {
    user: Users.slug,
  },
  editor: lexicalEditor({}),
  collections: [Examples, Users, Media],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  plugins: [
    bunnyStorage({
      credentials: {
        hostname: process.env.PAYLOAD_PUBLIC_BUNNY_CDN_REGION ? `${process.env.PAYLOAD_PUBLIC_BUNNY_CDN_REGION}.${(process.env.PAYLOAD_PUBLIC_BUNNY_CDN_BASE_HOSTNAME || 'storage.bunnycdn.com')}` : (process.env.PAYLOAD_PUBLIC_BUNNY_CDN_BASE_HOSTNAME || 'storage.bunnycdn.com'),
        storageZoneName: process.env.PAYLOAD_PUBLIC_BUNNY_CDN_STORAGE_ZONE_NAME,
        pullZoneName: process.env.PAYLOAD_PUBLIC_BUNNY_CDN_PULL_ZONE_NAME,
        accessKey: process.env.BUNNY_CDN_API_KEY,
      },
      access: 'private',
      collections: {
        media: {
          prefix: 'media',
          // disablePayloadAccessControl: true,
        },
      },
    }),
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
})
