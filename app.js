const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const date = require(__dirname + '/timedata.js');

const hostname = '127.0.0.1';
const port = 5500;

let Today = date.getDate();

const app = express();
app.set('view engine', 'ejs')
app.use('/public', express.static('public'));
app.use(bodyparser.urlencoded({ extended: true }));
mongoose.connect('mongodb://127.0.0.1:27017/todolistDB', { useNewUrlParser: true, useUnifiedTopology: true });

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
         res.render('index', { date: Today, items: result });
      }
   })
});

app.post('/', function (req, res) {
   let todoData = req.body.data;
   const itemName = new todoDBitem({
      name: todoData
   });
   itemName.save();
   res.redirect('/')
});


app.post('/delete', (req, res) => {
   let checkData = req.body.checkboxData;
   todoDBitem.deleteMany({ _id: checkData }, function (err1) {
      if (err1) {
         // console.log('there was an error' + err1)
      } else {
         // console.log("deleted successfully");
      }
      res.redirect('/');
   });
});

app.get('/:id', function (req, res) {
   const CustomRoot = req.params.id;
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
               res.redirect('/' + CustomRoot, { date: result.name, items: result.item });
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
