/* eslint-disable import/prefer-default-export */

import AWS from 'aws-sdk';
import moment from 'moment';
import path from 'path';
import im from 'imagemagick';

const { IMAGE_TABLE } = process.env;
const s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const thumbnails = [
    {
        name: 'small',
        maxHeight: 100,
        maxWidth: 100
    },
    {
        name: 'medium',
        maxHeight: 500,
        maxWidth: 500
    },
    {
        name: 'large',
        maxHeight: 1000,
        maxWidth: 1000
    }
];
export const handler = async (event, context, callback) => {
    const originalEvent = JSON.parse(event.Records[0].Sns.Message);
    const {
        bucket: { name: bucketName },
        object: { key: objectKey }
    } = originalEvent.Records[0].s3;

    const { Body, ContentType, Metadata } = await s3.getObject({
        Bucket: bucketName,
        Key: objectKey
    }).promise();

    const imageId = Metadata.image_id;
    const extension = path.extname(objectKey);

    await Promise.all(thumbnails.map(thumbnail => (
        new Promise((resolve, reject) => {
            im.resize({
                srcData: Body,
                height: thumbnail.maxHeight,
                width: thumbnail.maxWidth
            }, (resizeError, resizeData) => {
                if (resizeError) {
                    reject(resizeError);
                }
                s3.putObject({
                    Bucket: bucketName,
                    Key: `thumbnails/${imageId}/${thumbnail.name}${extension}`,
                    Body: Buffer.from(resizeData, 'binary'),
                    ACL: 'public-read',
                    ContentType,
                    Metadata
                }, (error, data) => (
                    error ? reject(error) : resolve(data)
                ));
            });
        })
    )));

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
