import {config} from 'dotenv';
config()
import {nanoid} from 'nanoid'
import fs from 'fs';
import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
    CreateBucketCommand,
    ListBucketsCommand,
} from "@aws-sdk/client-s3";
import path from 'path';

const s3 = new S3Client({
    region: 'region',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    },
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
});

const bucketName = process.env.S3_BUCKET;

const init = async () => {
    try {
        const listBucketsResult = await s3.send(new ListBucketsCommand({}));
        console.log("ListBucketsResult: ", listBucketsResult.Buckets);

        if (
            listBucketsResult.Buckets.length < 1
            || !listBucketsResult.Buckets.some(obj => obj?.Name === bucketName)
        ) {
            console.log("No buckets in storage. Creating new one.");

            const result = await s3.send(new CreateBucketCommand({
                Bucket: bucketName,
                
            }));
            console.log("ResultPath: ", result.Location);
        }

    } catch (err) {
        console.log("Error", err);
    }
}

const uploadFile = async (file) => {
    try {
        const fileObjectData = fs.readFileSync(file);
        const fileObjectKey = 'temp-' + nanoid() + path.extname(file)

        const result = await s3.send(
            new PutObjectCommand({
                Bucket: bucketName,
                Key: fileObjectKey,
                Body: fileObjectData,
                Expires: new Date(Date.now() + 30000),
            })
        );

        console.log(`Successfully uploaded ${bucketName}/${fileObjectKey}`);
    } catch (err) {
        console.log("Error", err);
    }
}

const readFile = async (file) => {
    try {
        const readObjectResult = await s3.send(
            new GetObjectCommand({Bucket: bucketName, Key: file})
        );

        const writeStream = fs.createWriteStream(file);
        readObjectResult.Body.on("data", (chunk) => writeStream.write(chunk));

    } catch (err) {
        console.log("Error: ", err);
    }
}


// await init()
// await uploadFile("./statue-of-liberty-full-base.jpg")
await readFile('temp-Hbzd9m8iuQ6DDIyKNFvgR.jpg')