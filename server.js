// server.js

// init project
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const dialogflow = require('dialogflow');
const assets = require('./assets');
const structjson = require('structjson');
const expressSession = require('express-session');
const FileStore = require('session-file-store')(expressSession);

const parseString = require('xml2js').parseString;
const fs = require('fs');
require('events').EventEmitter.defaultMaxListeners = 15;

const neo4j = require('neo4j-driver').v1;
const uri = 'bolt://localhost:7687';
const driver = neo4j.driver(uri, neo4j.auth.basic("neo4j", "chatbot"));
const session = driver.session();

const dialogflow_api = require('./dialogflow-admin-api');
const UE = require('./UE');
const Licence = require('./Licence');

const projectLanguageCode = 'fr-FR';
const projectId = 'formation-bdx';
// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient();

app.use(expressSession({
      store: new FileStore("./.sessions/"),
      secret: '%]N.]x5QYP?3xH2C',
      resave: true,
      saveUninitialized: true,
      messages: []
    })
);

app.use(express.static('public'));
app.use("/assets", assets);

//Used to parse POST requests
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/admin', function (req, res) {

  clearBdd()
  .then(() => {

    readXML()
    .then(() => {
      getAllUE().then((result) => {

        result.forEach(ue => {
          console.log(ue.name);
        });
        driver.close();
        session.close();
        res.sendStatus(200);

      });
    });
  })
});

// listen for requests
const listener = app.listen('8080', function () {
  console.log(
      'Rendez vous sur la page web suivante pour converser avec le chatbot: http://localhost:8080');

});

app.post('/sendMsg', function (request, response) {
  const messageContent = request.body.message;
  let currentSession = request.sessionID;
  console.log("SessionID = " + currentSession);
  detectTextIntent(projectId, currentSession, messageContent,
      projectLanguageCode)
  .then(dialogflowResponse => {
    var botMessage = dialogflowResponse[0].queryResult.fulfillmentMessages[0].text.text[0];
    console.log("Response = " + botMessage);
    response.send(botMessage);
  });
});

function detectTextIntent(projectId, sessionId, query, languageCode) {
  // [START dialogflow_detect_intent_text]

  // Instantiates a session client
  const sessionClient = new dialogflow.SessionsClient(
      {keyFilename: "auth_file.json"});

  if (!query) {
    return;
  }

  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);
  console.log(sessionPath);

  let promise;

  // Detects the intent of the query
  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  if (!promise) {
    // First query.
    console.log(`Sending query "${query}"`);
    promise = sessionClient.detectIntent(request);

  } else {
    promise = promise.then(responses => {
      console.log('Detected intent');
      const response = responses[0];

      // Use output contexts as input contexts for the next query.
      response.queryResult.outputContexts.forEach(context => {
        // There is a bug in gRPC that the returned google.protobuf.Struct
        // value contains fields with value of null, which causes error
        // when encoding it back. Converting to JSON and back to proto
        // removes those values.
        context.parameters = structjson.jsonToStructProto(
            structjson.structProtoToJson(context.parameters)
        );
      });
      request.queryParams = {
        contexts: response.queryResult.outputContexts,
      };

      console.log(`Sending query "${query}"`);
      return sessionClient.detectIntent(request);
    });
  }
  return promise;

  // [END dialogflow_detect_intent_text]

}

function readXML() {

  console.log("readXML... ");

  let Info = new Licence('PRLIIN_110', 'Informatique', session);

  return new Promise((resolve, reject) => {
    let description, courseID, courseName;

    Info.addBdd().then(() => {
      fs.readFile('formation_licence_info.xml', 'utf-8', function (err, buf) {
        parseString(buf, function (err, result) {

          console.log("Nb elements : " + result.CDM['ns3:course'].length);

          for (let i = 0; i < result.CDM['ns3:course'].length; i++) {

            courseID = (((result.CDM['ns3:course'][i]['ns3:courseID'])[0]._).replace(
                /\n|\r/g, ""));
            courseName = (((result.CDM['ns3:course'][i]['ns3:courseName'])[0]._).replace(
                /\n|\r/g, ""));

            if (typeof ((result.CDM['ns3:course'][i]['ns3:learningObjectives'])[0]._)
                !== "undefined") {
              description = (((result.CDM['ns3:course'][i]['ns3:learningObjectives'])[0]._).replace(
                  /\n|\r/g, ""));
            } else {
              description = courseName;
            }

            let ue = new UE(courseID, courseName, description, session);

            ue.addBdd().then(() => {

              ue.linkTo(Info.name).then(() => {

                if (i + 1 === result.CDM['ns3:course'].length) {
                  console.log("readXML terminé !");
                  resolve();
                }
              });

            }).catch((err) => {
              console.log(err);
            });
          }
        });

      });
    });
  });

}

function clearBdd() {

  console.log("clear...");

  return new Promise((resolve, reject) => {
    clearRelations().then(() => {

      clearNode().then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      })

    }).catch((err) => {
      reject(err);
    })
  });

}

function clearRelations() {

  console.log("clear relations...");

  return new Promise((resolve, reject) => {
    const requestCypher = 'match ()-[r:isUE]->() delete r';

    const resultPromise = session.run(requestCypher);

    resultPromise.then(() => {

      console.log("clear relations terminé !");
      resolve();

    }).catch((err) => {
      reject(err);
    });
  });
}

function clearNode() {

  console.log("clear node...");

  return new Promise((resolve, reject) => {
    const requestCypher = 'match (a) delete a';

    const resultPromise = session.run(requestCypher);

    resultPromise.then(() => {
      console.log("clear node terminé !");
      resolve();

    }).catch((err) => {
      reject(err);
    });
  });
}

function getAllUE() {

  let tabUE = [];

  return new Promise((resolve, reject) => {
    const requestCypher = 'match (ue:UE) return ue';

    const resultPromise = session.run(requestCypher);

    resultPromise.then((result) => {

      for (let i = 0; i < result.records.length; i++) {

        //console.log(result.records[i].get(0).properties);
        tabUE.push(result.records[i].get(0).properties);

        if (i + 1 === result.records.length) {
          resolve(tabUE);
        }
      }
    }).catch((err) => {
      reject(err);
    });
  });
}

