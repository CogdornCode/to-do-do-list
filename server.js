console.log('Node is Noding')



const express = require('express');
const app = express();
const bodyParser= require('body-parser')
const port = 3000
const MongoClient = require('mongodb').MongoClient
//require('dotenv').config




app.listen(port, function() {
    console.log(`Hey yo listening on ${port}`)
  })

  
// ========================
// Link to Database
// ========================

const urlMongo = 'mongodb+srv://clchea07:ZOdRN8ifqb1nElIl@cluster0.qeejkip.mongodb.net/?retryWrites=true&w=majority'

MongoClient.connect(urlMongo, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const db = client.db('To-Do-List')
    const toDoListCollection = db.collection('dbItems')

  
  
  // ========================
  // Middlewares
  // ========================
  app.set('view engine', 'ejs')
  app.use(express.static('public'))
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())

  // ========================
  // Routes
  // ========================

  app.get('/',async (request, response)=>{
    //finding todo list and setting up in an array. Added await function to operate in the background
    const todoItems = await toDoListCollection.find().toArray()
    //Counting documents
    const itemsLeft = await toDoListCollection.countDocuments({completed: false})
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
    
  })

  app.post('/addToDoForm', (request,response) => {
    //taking itemFormName as value for property of postItem to be used in for loop for ejs. Also set property of completed
    toDoListCollection.insertOne({postItem: request.body.itemFormName, completed: false}) 
    .then(result => {
      console.log('ToDo Added')
      //goes back to main page, and "refreshes" page
      response.redirect('/')
      
    })
    .catch(error => console.error(error))

  })

  app.put('/markComplete', (request, response) => {
    toDoListCollection.updateOne({postItem: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.put('/markUnComplete', (request, response) => {
  toDoListCollection.updateOne({postItem: request.body.itemFromJS},{
      $set: {
          completed: false
        }
  },{
      sort: {_id: -1},
      upsert: false
  })
  .then(result => {
      console.log('Marked Complete')
      response.json('Marked Complete')
  })
  .catch(error => console.error(error))

})

app.delete('/deleteItem', (request, response) => {
  toDoListCollection.deleteOne({postItem: request.body.itemFromJS})
  .then(result => {
      console.log('Todo Deleted')
      response.json('Todo Deleted')
  })
  .catch(error => console.error(error))

})


})
  .catch(console.error)