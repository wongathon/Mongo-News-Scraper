var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
const logger = require('morgan');
var methodOverride = require("method-override");

var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

//Web Scraping items
var cheerio = require("cheerio");
var request = require("request");
//set mongoose to leverage JS ES6 Promises
mongoose.Promise = Promise;

var app = express();


//use bodyparser
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(methodOverride("_method"));


//make public a static dir
app.use(express.static("public"));


//Handlebars setup
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


//DB config mongoose
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
} else {
  mongoose.connect("mongodb://localhost/nytScraper")
}
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful!");
})


//APP USE ROUTES
app.get("/", function(req, res) {
  res.render("index");
});

app.get("/scrape", function(req, res){
  var articleCount = 0;
  var results = [];

  request("https://www.nytimes.com/", function(error, response, html) {    
    var $ = cheerio.load(html);

    $("article.story").each(function (i, element){
      var title = $(this).find('.story-heading').find('a').text();
      var link = $(this).find('.story-heading').find('a').attr("href");
      var subtitle = $(element).find('p.summary').text().trim();

      if (subtitle == ""){
        subtitle = [];
        var subList = $(element).find('ul').find('li').each(function(i, element) {
          subtitle.push($(element).text().trim());
        });
      }
      results.push({
        title: title,
        link: link,
        subtitle: subtitle
      });
      articleCount++;
    });  
    console.log("scrape complete, pulled "+articleCount+ " articles.");
    res.json(results);
  });
});

//saved articles get 
app.get("/articles", function(req, res){

  Article.find({})
  .populate("notes")
  .exec(function(err, doc){
    if (err) {
      res.send(err);
    } else {
      res.render("artnotes", { articles: doc });
    }
  });

});

//Post new article to "saved" on button click
app.post("/new/article", function(req, res){
  var newArticle = new Article(req.body);

  newArticle.save(function(err, doc){
    if (err) {
      console.log(err);
    } else {
      console.log('item saved')
    }
  })

  res.redirect("/");
});

//post note or replace note
app.post("/articles/:id", function(req, res) {

  console.log("REQ", req.body);
  var newNote = new Note(req.body);

  newNote.save(function(err, doc){
    if (err) {
      res.send(err);
    } else {
      console.log("DOC", doc);
      //maybe this works? _id or id?
      Article.findOneAndUpdate({ "_id" : req.params.id }, { $push: {"notes": doc._id } }, {new: true})
      .exec(function(err, doc) {
        if (err) {
          res.send(err);
        } else {
          res.redirect("/articles");
        }
      });
    }

  });
});

//DELETE IT!
app.delete("/articles/delete", function(req, res) {
  var _id = req.body._id;
  Article.findByIdAndRemove(_id, function(){ 
    res.redirect("/articles");
  });
});


//Port
const PORT = process.env.PORT || 3030;
//listener
app.listen(PORT, function(){
  console.log("App running on port 3030!");
});