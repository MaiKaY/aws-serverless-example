/* eslint-disable import/prefer-default-export */

import AWS from 'aws-sdk';
import imageType from 'image-type';

const s3 = new AWS.S3();
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

    const { ext, mime } = imageType(Body);
    const validContentTypes = [
        'image/jpg',
        'image/jpeg',
        'image/png'
    ];

    if (validContentTypes.some(validContentType => validContentType === mime)) {
        const imageId = Metadata.image_id;
        await s3.putObject({
            Bucket: bucketName,
            Key: `uploads/${imageId}/${imageId}.${ext}`,
            Body,
            ACL: 'public-read',
            ContentType: mime,
            Metadata
        }).promise();
    }

    callback(null, 'Done.');
};
