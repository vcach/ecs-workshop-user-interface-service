// app-server.js
import express from 'express'
import hogan from 'hogan-express'
import http_module from 'http'
import bodyParser from 'body-parser'
import compression from 'compression'
import session from 'express-session'
import config from './config'
import cors from 'cors'

import AWS, {
    Config,
    CognitoIdentityCredentials
} from 'aws-sdk';

const app = express()

AWS.config.update({
  	credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: config.aws_cognito_identity_pool_id
  },{
  	region: config.aws_region
  }),
  region: config.aws_region
});

var DynamoDBStore = require('connect-dynamodb')({session: session});
app.use(session({store: new DynamoDBStore({
    AWSConfigJSON: {
      region: config.aws_region
    }
  }
  ), secret: 'keyboard cat'}));

app.use(cors({credentials: true, origin: true}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(compression())
app.set('views', __dirname + '/views')
app.engine('html', hogan)
app.set('port',  process.env.PORT || 3000)
app.use(express.static(__dirname + '/public'))
app.set('trust proxy', 1) // trust first proxy
var cookieParser = require('cookie-parser'),
cookie = cookieParser('keyboard cat');
app.use(cookie);

// myelasticachecluster.yo9dr6.0001.use1.cache.amazonaws.com
const partials = {
  header: 'partials/header',
  footer: 'partials/footer'
}
require('./routes')(app, config, partials)
const http = http_module.Server(app)
http.listen(app.get('port'), () => {
  console.info('==> 🌎  Go to http://localhost:%s', app.get('port'));
})