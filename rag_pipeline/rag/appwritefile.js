const sdk = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1') // Your API Endpoint
    .setProject('683073a1002d010defbb') // Your project ID
    .setSession(''); // The user session to authenticate with


const storage = new sdk.Storage(client);

const result = await storage.getFileDownload(
    '6835aad80024a2754e5e', // bucketId
    '68380abb0033ce4e1a60', // fileId
);
