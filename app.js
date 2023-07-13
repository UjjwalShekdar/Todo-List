//jshint esversion:6
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "welcome to todoList"
});

const item2 = new Item ({
  name: "click + to add item"
});

const item3 = new Item ({
  name: "Hit submit"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List =  mongoose.model("List", listSchema);

// Item.insertMany([item1, item2, item3]).then(function(){
//   console.log("successfully saved default items")
// })
// .catch(function(err){
//   console.log(err);
// });

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName})
    .then(foundList => {
      if(!foundList){
 
        const list = new List({
          name: customListName,
          items: defaultItems
        });
 
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    })
    .catch((err) => {
      console.log(err);
    });
});


app.get("/", async function(req, res) {

  const foundItems = await Item.find({});

  console.log(foundItems);

  try{
    if (foundItems.length===0){
          foundItems = await Item.insertMany(defaultItems);
    }
  }
  catch(err){
    console.log(err);
  };

  res.render("list", {listTitle: "Today", newListItems: foundItems});

});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
   const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then(function (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
  }
});

app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
 
  if (listName === "Today" && checkedItemId != undefined) {
      await Item.findByIdAndRemove(checkedItemId);
      res.redirect("/");  
  } else {
    await List.findOneAndUpdate( { name: listName },
      { $pull: { items: { _id: checkedItemId } } } );
    res.redirect("/" + listName);
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
