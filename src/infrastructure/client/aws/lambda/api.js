/* eslint-disable import/prefer-default-export */

import AwsServerlessExpress from 'aws-serverless-express';

import app from '../../api/app';

const server = AwsServerlessExpress.createServer(app);
export const handler = (event, context) => (
    AwsServerlessExpress.proxy(server, event, context)
);
