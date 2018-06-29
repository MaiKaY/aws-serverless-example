# AWS Serverless Example
This repository is about an article series I wrote on [medium.com](https://medium.com/@maikschmidt).
- Part 1 (tbd): Create a simple API and ship it to AWS ([GitHub Branch](https://github.com/MaiKaY/aws-serverless-example/tree/part-1))
- Part 2 (tbd): Create a DynamoDB table and store data
- Part 3 (tbd): Validate incoming images and create thumbnails from them
- Part 4 (tbd): Implement basic usage of Event-Sourcing and create SNS event publisher
- Part 5 (tbd): Create a simple CI/CD pipeline

It should help the readers to get a deeper look into the code I wrote for that article series.

## How to run it locally?
Install all dependencies
```
npm install
```

Run the application
```
npm start
```

Access the application
```
http://localhost:4040
```

## How to deploy it on AWS?
- Change `config` values in [package.json](package.json) (at least `AWS_CF_TEMPLATE_S3_BUCKET` needs to be set)
- For first-time setup use `npm run aws:install` 
- For further updates use `npm run aws:update`
- To delete your application and all resources connected with it use `npm run aws:uninstall`
