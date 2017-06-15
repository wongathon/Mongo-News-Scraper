var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

//Web Scraping items
var cheerio = require("request");
var request = require("cheerio");
//set mongoose to leverage JS ES6 Promises
mongoose.Promise = Promise;

var app = express();

//use bodyparser
app.use(bodyParser.urlencoded({
  extended: false
}));

//make public a static dir
app.use(express.static("public"));

//Handlebars setup
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//DB config mongoose
mongoose.connect("mongodb://localhost");
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful!");
})


//App use routes in ??
app.get('/scrape', function(req, res){

  request('https://www.nytimes.com/', function(err, res, html){
    
    var $ = cheerio.load(html);

    $('article.story').each(function (i, element){

      var result = {};

      result.title = $(this).find('.story-heading').find('a').text();
      
      var subtitle = $(element).find('p.summary').text().trim();

      if (subtitle === null){
        var subList = $(element).find('ul').find('li').each(function(i, element) {
          subtitle.push($(element).text().trim());
        });
      }

      result.subtitle = subtitle;

      var entry = new Article(result);

      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        } else {
          console.log(doc);
        }
      });

    });  
  });
  res.send("Scrape complete!");
});

//main get 
app.get("/articles", function(req, res){

  Article.find({}, function(err, doc){
    if (err) {
      res.send(err);
    } else {
      res.send(doc);
    }
  });

});

//get article by id to update notes
app.get("/articles/:id", function(req, res) {

  Article.findOne({ "_id": req.params.id })
    .populate("notes")
    .exec(function(err, doc){
      if (err) {
        res.send(err);
      } else {
        res.send(doc);
      }
    });

});

//post note or replace note
app.post("/articles/:id", function(req, res) {
  var newNote = new Note(req.body);

  newNote.save(function(err, doc){
    if (err) {
      res.send(err);
    } else {

      Article.findOneAndUpdate({ "_id" : req.params.id }, {"note": doc._id })
      .exec(function(err, doc) {
        if (err) {
          res.send(err);
        } else {
          res.send(doc);
        }
      });
    }

  });
});

//listener
app.listen(3030, function(){
  console.log("App running on port 3030!");
});