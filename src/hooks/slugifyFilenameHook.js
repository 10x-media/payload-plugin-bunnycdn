import { flatten, unflatten } from "flattenizer";
import slugify from "slugify";

export default function ({ collection }) {
    return async function ({ data, req }) {

        let sluggedFilename = slugify(data.filename, { lower: true });
        const currentDate = Date.now();

        // Check for files with same name that already exist
        const res = await req.payload.find({
            collection: collection,
            where: {
                filename: {
                    equals: sluggedFilename
                }
            },
            req
        })

        console.log('found file!')

        // If there is a file with the same name, add a timestamp to the filename
        let fileExists = false;
        if (res.docs?.length) {
            fileExists = true;
            sluggedFilename = [`${sluggedFilename.split('.')[0]}-${currentDate}`, sluggedFilename.split('.')[1]].join('.')
        }

        // Adjust filename for every size
        const nestedFileNames = flatten(data.sizes) || {};
        for (const [key, value] of Object.entries(nestedFileNames)) {
            if (key.includes('filename')) {
                if (!value) continue;
                const slu = slugify(value, { lower: true })
                const newFileName = fileExists ? [`${slu.split('.')[0]}-${currentDate}`, slu.split('.')[1]].join('.') : slu
                nestedFileNames[key] = newFileName
            }
        }
        const newSizes = unflatten(nestedFileNames);

        return ({
            ...data,
            filename: sluggedFilename,
            sizes: newSizes
        })
    }
}