import 'dotenv/config';
import AWS from 'aws-sdk';
import BodyParser from 'body-parser';
import Express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import moment from 'moment';
import uuid from 'uuid/v4';

const {
    BUCKET_NAME,
    DEBUG,
    DEVELOPMENT_MODE,
    IMAGE_TABLE
} = process.env;
const s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(morgan('tiny', {
    skip: (req, res) => !(DEBUG || DEVELOPMENT_MODE || res.statusCode >= 400)
}));

app.get('/', cors(), async (req, res) => {
    const imageId = uuid();

    await dynamoDb.put({
        TableName: IMAGE_TABLE,
        Item: {
            id: imageId,
            createdAt: moment().utc().toISOString(),
            status: 'waiting_for_upload'
        }
    }).promise();

    const signedUrl = s3.getSignedUrl('putObject', {
        Bucket: BUCKET_NAME,
        Key: `temp/${imageId}`,
        ContentType: 'application/x-www-form-urlencoded',
        Metadata: {
            image_id: imageId
        }
    });

    res.json({
        imageId,
        uploadUrl: signedUrl,
        statusUrl: `${req.protocol}://${req.headers.host}/${imageId}`
    });
});

app.get('/:imageId', cors(), async ({ params: { imageId } }, res) => {
    const {
        Item: {
            createdAt,
            publishedAt,
            status,
            image
        }
    } = await dynamoDb.get({
        TableName: IMAGE_TABLE,
        Key: {
            id: imageId
        }
    }).promise();

    res.json({
        createdAt,
        status,
        publishedAt: publishedAt || '',
        image: status === 'published' ? `https://s3-eu-west-1.amazonaws.com/${BUCKET_NAME}/${image}` : ''
    });
});

app.use((req, res) => {
    res.status(404).json({
        message: 'Sorry cant find that!'
    });
});

if (DEVELOPMENT_MODE) {
    app.listen(4040, () => {
        console.info('Listening on port 4040'); // eslint-disable-line
    });
}

export default app;
