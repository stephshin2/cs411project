var express = require('express');
var router = express.Router();

var request = require('request');



//database
var wordLyrics = require('../models/word_lyrics');
var User = require('../models/User')


//Get the api key
let Clarifai_api_key = require('../config/clarifai').CONSUMER_KEY;

const Clarifai = require("clarifai");
const Clarifai_app = new Clarifai.App({
    apiKey: Clarifai_api_key
});
console.log("Called the caption.js")





router.get('/clarifai/:user/:name', function(req, res, next) {

    // sample clarifai image : https://samples.clarifai.com/metro-north.jpg

    // predict the contents of an image by passing in a url
    let searchkey = req.params.name;
    let userId = req.params.user;
    console.log("*****");
    console.log(req.params.name);
    console.log(searchkey);

    Clarifai_app.models.predict(Clarifai.GENERAL_MODEL, searchkey).then(
        function(response) {
            console.log(JSON.stringify(response));
            res.send(response.outputs[0].data.concepts);
        },
        function(err) {
            console.error(err);
        }
    );
});

let Genius_api_key = require('../config/genius').CLIENT_ACCESS_TOKEN;

const Genius = require('genius-api');
const Genius_app = new Genius(Genius_api_key);

const Lyrics = require('lyric-get');


//get the lyrics for the input word
router.get('/genius/:name', function(req, res, next) {


    let searchkey = req.params.name;
    console.log(searchkey);

    Genius_app.search(searchkey).then(
        function(response) {
            console.log(response.hits);
            var word = searchkey;
            console.log(word);
            var title = response.hits[0].result.title;
            var artist = response.hits[0].result.full_title.split("by")[1];

            wordLyrics.count({word: word},function(err, result){
                console.log(result);
                if(result != 0){
                    wordLyrics.findOne({word: word}, function(err, result){
                        res.json(result['lyrics']);
                    })

                }
                else{
                    Lyrics.get(artist, title, function(err, results) {
                        if(err) {
                            console.log(err);
                            res.send("error");
                        }
                        else {
                            console.log("Called the lyrics API");
                            //console.log(res);
                            var parsed_result = results.split('\n');
                            wordLyrics.create({word: String(word), lyrics: parsed_result});
                            res.json(parsed_result);
                        }
                    })
                }
            })


        },
        function(err) {
            console.error(err);
        }
    )
});

let TextRazor_api_key = require('../config/razor').headers;

<!--Razor api-->
router.get('/lyrics/:name', function(req,res,next){
    console.log(req.body.textblock);

    let searchkey = req.params.name;
    console.log("******");
    console.log(searchkey);
    console.log("******");

    console.log("made it to razor")

    var dataString = 'extractors=phrases,words&text='+searchkey;

    var options = {
        url: 'https://api.textrazor.com/',
        method: 'POST',
        headers: TextRazor_api_key,
        body: dataString
    };


    function callback(error, response, body) {
        console.log("callback called");
        if (!error && response.statusCode == 200) {
            console.log("text razor working...");
            var jsonObj = JSON.parse(response.body);
            var numberRan1 = Math.floor(Math.random() * 1);
            var numberRan2 = Math.floor(Math.random() * 1);
            var numberRan3 = Math.floor(Math.random() * 1);
            var numberRan4 = Math.floor(Math.random() * 1);
            var token1 = String(jsonObj.response.sentences[0].words[numberRan1].token);
            var token2 = String(jsonObj.response.sentences[0].words[numberRan2].token);
            var token3 = String(jsonObj.response.sentences[0].words[numberRan3].token);
            var token4 = String(jsonObj.response.sentences[0].words[numberRan4].token);

            <!-- Finding Noun1 -->
            for (i=0; i < jsonObj.response.sentences[0].words.length; i++) {
              if(jsonObj.response.sentences[0].words[i].partOfSpeech === "NN" || jsonObj.response.sentences[0].words[i].partOfSpeech === "NNS" || jsonObj.response.sentences[0].words[i].partOfSpeech === "NNS") {
                token1 = jsonObj.response.sentences[0].words[i].token;
              }
              else {
                i++;
              }
            }

            <!-- Finding Noun2-->
            for (i=0; i < jsonObj.response.sentences[0].words.length; i++) {

              if(jsonObj.response.sentences[0].words[i].partOfSpeech === "NN" || jsonObj.response.sentences[0].words[i].partOfSpeech === "NNS") {
                if(jsonObj.response.sentences[0].words[i].token != token1) {
                  token2 = jsonObj.response.sentences[0].words[i].token;
                }
              }
              else {
                i++;
                }
            }

            <!-- Finding Noun3-->
            for (i=0; i < jsonObj.response.sentences[0].words.length; i++) {

              if(jsonObj.response.sentences[0].words[i].partOfSpeech === "NN" || jsonObj.response.sentences[0].words[i].partOfSpeech === "NNS") {
                if(jsonObj.response.sentences[0].words[i].token != token1 && jsonObj.response.sentences[0].words[i].token != token2) {
                  token3 = jsonObj.response.sentences[0].words[i].token;
                }
              }
                else {
                  i++;
              }

            }

            <!-- Finding Noun4-->
            for (i=0; i < jsonObj.response.sentences[0].words.length; i++) {

              if(jsonObj.response.sentences[0].words[i].partOfSpeech === "NN" || jsonObj.response.sentences[0].words[i].partOfSpeech === "NNS") {
                if(jsonObj.response.sentences[0].words[i].token != token1 && jsonObj.response.sentences[0].words[i].token != token2 && jsonObj.response.sentences[0].words[i].token != token3) {
                  token4 = jsonObj.response.sentences[0].words[i].token;
                };
              }
              else {
                i++;
              }

            }

            <!-- Finding Noun5-->
            for (i=0; i < jsonObj.response.sentences[0].words.length; i++) {
              if(jsonObj.response.sentences[0].words[i].partOfSpeech === "NN" || jsonObj.response.sentences[0].words[i].partOfSpeech === "NNS" || jsonObj.response.sentences[0].words[i].partOfSpeech === "NNP" || jsonObj.response.sentences[0].words[i].partOfSpeech === "NNPS") {
                if(jsonObj.response.sentences[0].words[i].token != token1 && jsonObj.response.sentences[0].words[i].token != token2 && jsonObj.response.sentences[0].words[i].token != token3 && jsonObj.response.sentences[0].words[i].token != token4) {
                  token5 = jsonObj.response.sentences[0].words[i].token;

                  };
                }
                else {
                  i++;
              }
            }

            <!-- Finding Noun6-->
            for (i=0; i < jsonObj.response.sentences[0].words.length; i++) {
              console.log("hi" + jsonObj.response.sentences[0].words[i].partOfSpeech);
              if(jsonObj.response.sentences[0].words[i].partOfSpeech === "NN" || jsonObj.response.sentences[0].words[i].partOfSpeech === "NNS" || jsonObj.response.sentences[0].words[i].partOfSpeech === "NNP" || jsonObj.response.sentences[0].words[i].partOfSpeech === "NNPS") {
                if(jsonObj.response.sentences[0].words[i].token != token1 && jsonObj.response.sentences[0].words[i].token != token2 && jsonObj.response.sentences[0].words[i].token != token3 && jsonObj.response.sentences[0].words[i].token != token4 && jsonObj.response.sentences[0].words[i].token != token5) {
                  token6 = jsonObj.response.sentences[0].words[i].token;
                };
                }
                else {
                  i++;
              }

            }



            <!-- Finding Verb1 -->
            for (i=0; i < jsonObj.response.sentences[0].words.length; i++) {
              console.log("hi" + jsonObj.response.sentences[0].words[i].partOfSpeech);
              if(jsonObj.response.sentences[0].words[i].partOfSpeech === "VB" || jsonObj.response.sentences[0].words[i].partOfSpeech === "VBD" || jsonObj.response.sentences[0].words[i].partOfSpeech === "VBG" || jsonObj.response.sentences[0].words[i].partOfSpeech === "VBN" || jsonObj.response.sentences[0].words[i].partOfSpeech === "VBZ") {
                token7 = jsonObj.response.sentences[0].words[i].token;
              }
              else {
                i++;
              }
            }

            <!-- Finding Verb2 -->
            for (i=0; i < jsonObj.response.sentences[0].words.length; i++) {
              console.log("hi" + jsonObj.response.sentences[0].words[i].partOfSpeech);
              if(jsonObj.response.sentences[0].words[i].partOfSpeech === "VB" || jsonObj.response.sentences[0].words[i].partOfSpeech === "VBD" || jsonObj.response.sentences[0].words[i].partOfSpeech === "VBG" || jsonObj.response.sentences[0].words[i].partOfSpeech === "VBN" || jsonObj.response.sentences[0].words[i].partOfSpeech === "VBZ") {
                if(jsonObj.response.sentences[0].words[i].token != token1) {
                token8 = jsonObj.response.sentences[0].words[i].token;
              }
              else {
                i++;
              }
            }
          }
            if(typeof token2 === "undefined") {
              token2 = token1;
            }
            var string1 = "I only love my " + token1 + " and my " + token2 + ", I'm sorry!";
            if(typeof token3 === "undefined") {
              token3 = token2;
            }
            var string2 = "That face when you look at " + token3 + "!";

            if(typeof token4 === "undefined") {
              token4 = token3;
            }
            var string3 = "My favorite " + token4 + ".";
            if(typeof token5 === "undefined") {
              token5 = token4;
            }
            var string4 = "I'm here for a good time not " + token5 + ".";
            if(typeof token6 === "undefined") {
              token6 = token5;
            }
            var string5 = "Know yourself, know your " + token6 + ".";
            var string6 = "I'm way up, I feel " + token2 + ".";
            if(typeof token7 === "undefined") {
              token7 = token6;
            }
            var string7 = "You think this is a " + token7 + ".";
            if(typeof token8 === "undefined") {
              token8 = token7;
            }
            var string8 = "You like " + token8 + "?" + "Thats cute.";


            res.json([string1, string2, string3, string4, string5, string6, string7, string8]);
        }
    }

    var body;

    request(options, callback);


});



module.exports = router;
