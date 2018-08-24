/* eslint-disable import/prefer-default-export */

import AWS from 'aws-sdk';
import moment from 'moment';

const { IMAGE_TABLE } = process.env;
const s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB.DocumentClient();
export const handler = async (event, context, callback) => {
    const originalEvent = JSON.parse(event.Records[0].Sns.Message);
    const {
        bucket: { name: bucketName },
        object: { key: objectKey }
    } = originalEvent.Records[0].s3;

    const { Metadata } = await s3.getObject({
        Bucket: bucketName,
        Key: objectKey
    }).promise();

    const imageId = Metadata.image_id;
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
            status: 'published',
            publishedAt: moment().utc().toISOString(),
            image: objectKey
        }
    }).promise();

    callback(null, 'Done.');
};
