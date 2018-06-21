import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import BodyParser from 'body-parser';
import Express from 'express';
import morgan from 'morgan';
import cors from 'cors';

const { DEBUG, DEVELOPMENT_MODE } = process.env;
const app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext());
app.use(morgan('tiny', {
    skip: (req, res) => !(DEBUG || DEVELOPMENT_MODE || res.statusCode >= 400)
}));

app.get('/', cors(), (req, res) => {
    res.json({
        hello: 'world'
    });
});

if (DEVELOPMENT_MODE) {
    app.listen(4040, () => {
        console.info('Listening on port 4040'); // eslint-disable-line
    });
}

export default app;
