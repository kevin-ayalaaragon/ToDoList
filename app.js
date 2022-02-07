//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

const date = require(__dirname + '/date.js');
const day = date.getDate();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-kevin:test123@cluster0.zxiq9.mongodb.net/todolistDB', {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model(
  'Item',
  itemsSchema
);

const standUp = new Item ({
  name:'Stand up meeting'
});

const item2 = new Item ({
  name:'Welcome to your todolist!'
});

const item3 = new Item ({
  name:'this is a test'
});

const defaultItems = [standUp, item2, item3];

const customListSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model(
  'List',
  customListSchema
)

app.get("/", function(req, res) {

  const day = date.getDate();

  Item.find({},function(err, foundItems) {
    if(err){
      console.log(err);
    }
    else{
      if (foundItems.length === 0) {
        
        Item.insertMany(defaultItems, function (err) {
          if(err){
            console.log(err);
          }
          else{
            console.log('Successfully inserted many!');
          }
        });

        res.redirect('/');
      }
      res.render("list", {listTitle: day, newListItems: foundItems});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name:itemName
  });

  const day = date.getDate();

  if (listName === day){
    item.save();
    res.redirect('/');
  }
  else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect('/'+listName);
    }); 
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post('/delete', function (req, res) {
  console.log(req.body.deleteItem);
  const checkedItemId = req.body.deleteItem;
  const listName = req.body.listName;

  if(listName===day){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      }
      else{
        console.log('Successfully deleted');
        res.redirect('/');
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName}, {$pull: {items:{_id:checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect('/'+listName);
      }
    });
  }

  // Item.find({_id:checkedItemId}, function(err) {
  //   if (err) {
  //     console.log(err);
  //   }
  //   else{
  //     console.log('Successfully Deleted!');
  //   }
  // })
})

app.get('/:customListName', function(req, res) {
  console.log(req.params.customListName);
  const customListName = req.params.customListName;

  List.findOne({name:customListName}, function(err, foundList) {
    if(err){
      console.log(err);
    }
    else{
      if(!foundList){
        //Create new list
        const list = new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        console.log('New list created');
        res.redirect('/'+customListName);
        // res.render('list', {listTitle:customListName, newListItems:[]});
      }
      else{
        //Show an existing list
        console.log('List exists');
        res.render('list', {listTitle:foundList.name, newListItems:foundList.items});
      }
    }
  });
})

app.post('')

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
