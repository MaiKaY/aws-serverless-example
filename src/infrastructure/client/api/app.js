import BodyParser from 'body-parser';
import Express from 'express';
import morgan from 'morgan';
import cors from 'cors';

const { DEBUG, DEVELOPMENT_MODE } = process.env;
const app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(morgan('tiny', {
    skip: (req, res) => !(DEBUG || DEVELOPMENT_MODE || res.statusCode >= 400)
}));

app.get('/', cors(), (req, res) => {
    res.json({
        message: 'Hello on /'
    });
});

app.get('/foo', cors(), (req, res) => {
    res.json({
        message: 'Hello on /foo'
    });
});

app.get('/foo/bar', cors(), (req, res) => {
    res.json({
        message: 'Hello on /foo/bar'
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
