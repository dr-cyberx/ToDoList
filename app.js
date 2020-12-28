const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const date = require(__dirname + '/timedata.js');
const _ = require('lodash');

const hostname = '127.0.0.1';
const port = 5500;

let Today = date.getDate();

const app = express();

app.set('view engine', 'ejs')
app.use('/public', express.static('public'));
app.use(bodyparser.urlencoded({ extended: true }));
mongoose.connect('mongodb://127.0.0.1:27017/todolistDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

const todoSchema = mongoose.Schema({
   name: String
});

const todoDBitem = mongoose.model('Item', todoSchema);

const item1 = new todoDBitem({
   name: 'Buy the food'
});
const item2 = new todoDBitem({
   name: 'Cook the food'
});
const item3 = new todoDBitem({
   name: 'Eat the food'
});

const defaultItems = [item1, item2, item3];

const customRootSchema = {
   name: String,
   item: [todoSchema]
}

const customRootList = mongoose.model('List', customRootSchema);

app.get('/', function (req, res) {

   todoDBitem.find({}, function (err, result) {

      if (result.length === 0) {
         todoDBitem.insertMany(defaultItems, function (err, returndata) {
            if (err) {

            } else {
               // console.log('Added successfully');
            }
         });
         res.redirect('/');
      } else {
         res.render('index', { date: "Today", items: result });
      }
   })
});

app.post('/', function (req, res) {
   let todoData = req.body.data;
   let btn2val = req.body.btn2value;
   console.log(btn2val);
   const itemName = new todoDBitem({
      name: todoData
   });
   if (btn2val === 'Today') {

      itemName.save();
      res.redirect('/')
   } else {
      customRootList.findOne({ name: btn2val }, function (err, foundList) {
         foundList.item.push(itemName);
         foundList.save();
         res.redirect("/" + btn2val);
      })
   }

});


app.post('/delete', (req, res) => {
   let checkData = req.body.checkboxData;
   const listTitle = req.body.hiddenInput;

   if (listTitle === 'Today') {
      todoDBitem.deleteMany({ _id: checkData }, function (err1) {
         if (!err1) {
            // console.log('there was an error' + err1)
            res.redirect('/');
         }
      });
   } else {
      customRootList.findOneAndUpdate({ name: listTitle }, { $pull: { item: { _id: checkData } } }, function (err, result) {
         if (!err) {
            res.redirect('/' + listTitle);
         }
      });
   }

});

app.get('/:id', function (req, res) {
   const CustomRoot = _.capitalize(req.params.id);
   // console.log(CustomRoot);
   if (CustomRoot != 'favicon.ico') {
      customRootList.findOne({ name: CustomRoot }, function (err, result) {
         if (!err) {
            if (!result) {
               const customRootlist = new customRootList({
                  name: CustomRoot,
                  item: defaultItems
               });
               customRootlist.save();
               res.redirect('/' + CustomRoot);
            } else {
               res.render('index', { date: result.name, items: result.item });
            }
         }
      });
   }
});

app.listen(port, hostname, function () {
   console.log(`The server is running at http://${hostname}:${port}`);
});
