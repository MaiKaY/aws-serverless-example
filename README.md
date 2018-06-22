# AWS Serverless Example

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
