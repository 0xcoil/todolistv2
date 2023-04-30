//jshint esversion:6

const express = require("express");
const PORT = process.env.PORT || 3030;
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
var _ = require('lodash');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://hashiramae:nfvHEYD7DfK9Dz2f@cluster0.snnqxpb.mongodb.net/todolistDB');

const itemsSchema = {
  name: String
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: 'Welcome to your todolist!'
});

const item2 = new Item({
  name: 'Hit the + button to add new item'
});

const item3 = new Item({
  name: '<-- Hit this to delete an item'
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);

// Item.insertMany(defaultItems)
// .then(function(){
//   console.log('Items successfully added!');
// })
// .catch(function (err){
//   console.log(err);
// });

// Item.find().then(function(items){
//   items.forEach(function(item) {
//     console.log(item.name);
//   });

async function insertDefaults() {
  if (!await Item.exists()) {
    Item.insertMany(defaultItems).
    then(() => console.log("Inserted Default items successfully."));
  }
}
insertDefaults();

app.get("/", async function(req, res) {
  const items = await Item.find({});
  res.render("list", {
    listTitle: 'Today',
    newListItems: items.map((item) => {
      return item
    })
  });
});

// app.get("/", function(req, res) {
//       res.render('list', {listTitle: 'Today', newListItems: items});
//   });
//
// });

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === 'Today'){
    item.save();
    res.redirect('/');
  } else {
    List.findOne({
      name: listName
    })
    .then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    });
  }
});

app.get('/:customListName', function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
      name: customListName
    })
    .then(function(foundList) {
      if (foundList === null) {

        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect('/' + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    })
    .catch(function(e) {

      console.log(e);
    })
});


app.post("/delete", function (req, res) {

  const listName = req.body.listName;
  const checkItemId = req.body.checkbox;

  if (listName == "Today") {
    deleteCheckedItem();
  } else {

    deleteCustomItem();
  }

  async function deleteCheckedItem() {
    await Item.deleteOne({ _id: checkItemId });
    res.redirect("/");
  }

  async function deleteCustomItem() {
    await List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkItemId } } }
    );
    res.redirect("/" + listName);
  }
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
