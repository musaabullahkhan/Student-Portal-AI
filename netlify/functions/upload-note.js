// This function will upload a file and store it in Netlify's storage.
const Busboy = require('busboy');
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const busboy = new Busboy({ headers: event.headers });
    let fileData = null;
    let fileName = null;

    return new Promise((resolve, reject) => {
        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            console.log(`Uploading: ${filename}`);
            fileName = filename;
            const chunks = [];
            file.on('data', chunk => chunks.push(chunk));
            file.on('end', () => {
                fileData = Buffer.concat(chunks);
            });
        });

        busboy.on('finish', async () => {
            if (!fileData) {
                return reject({ statusCode: 400, body: 'No file uploaded.' });
            }

            try {
                // The file will be saved in your repository's /uploads folder.
                const filePath = path.join(process.env.LAMBDA_TASK_ROOT, '..', '..', 'uploads', fileName);
                fs.writeFileSync(filePath, fileData);

                resolve({
                    statusCode: 200,
                    body: JSON.stringify({ message: 'File uploaded successfully!', path: `/uploads/${fileName}` })
                });
            } catch (err) {
                console.error(err);
                reject({ statusCode: 500, body: 'File upload failed.' });
            }
        });

        busboy.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
        busboy.end();
    });
};