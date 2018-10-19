/* eslint-disable import/prefer-default-export */

import AWS from 'aws-sdk';
import imageType from 'image-type';

const { IMAGE_TABLE } = process.env;
const s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB.DocumentClient();
export const handler = async (event, context, callback) => {
    const originalEvent = JSON.parse(event.Records[0].Sns.Message);
    const {
        bucket: { name: bucketName },
        object: { key: objectKey }
    } = originalEvent.Records[0].s3;

    const { Body, Metadata } = await s3.getObject({
        Bucket: bucketName,
        Key: objectKey
    }).promise();

    const imageId = Metadata.image_id;
    const { ext, mime } = imageType(Body) || {};
    const validContentTypes = [
        'image/jpg',
        'image/jpeg',
        'image/png'
    ];

    let status;
    if (validContentTypes.some(validContentType => validContentType === mime)) {
        await s3.putObject({
            Bucket: bucketName,
            Key: `uploads/${imageId}/original.${ext}`,
            Body,
            ACL: 'public-read',
            ContentType: mime,
            Metadata
        }).promise();
        status = 'waiting_for_thumbnails';
    } else {
        status = 'invalid_content_type';
    }

    const { Item } = await dynamoDb.get({
        TableName: IMAGE_TABLE,
        Key: {
            id: imageId
        }
    }).promise();

    await dynamoDb.put({
        TableName: IMAGE_TABLE,
        Item: {
            ...Item,
            status
        }
    }).promise();

    callback(null, 'Done.');
};
