import axios from 'axios';

export default async function ({ data, collection, req, filename, prefix, credentials }) {
    console.log(`https://${credentials.hostname}/${credentials.storageZoneName}${prefix ? `/${prefix}` : ''}/${filename}`)

    try {

        const res = await axios.delete(`https://${credentials.hostname}/${credentials.storageZoneName}${prefix ? `/${prefix}` : ''}/${filename}`, {
            headers: {
                AccessKey: credentials.accessKey,
            }
        });
        console.log(res.data);
        return res.data;
    } catch (err) {
        console.log(err);
        return err;
    }

};