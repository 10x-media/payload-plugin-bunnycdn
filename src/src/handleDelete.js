import axios from 'axios';

export const getHandleDelete = ({ credentials }) => {
  return async ({ doc: { prefix = '' }, filename }) => {

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
  }


}
