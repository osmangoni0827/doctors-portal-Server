const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
require('dotenv').config()
const app = express()
app.use(express.static('doctors'));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}))
app.use(cors());
app.use(bodyParser.json())
const port = process.env.PORT || 5000
const MongoClient = require('mongodb').MongoClient;
const { static } = require('express');
console.log(process.env.DB_PASS, process.env.DB_USER)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.77ufn.mongodb.net/DoctorsPortal?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointment = client.db("DoctorsPortal").collection("appointment");
  const doctorCollection = client.db("DoctorsPortal").collection("doctors");
  // perform actions on the collection object
  app.post('/addAppointment', (req, res) => {
    console.log(req.body);
    appointment.insertOne(req.body)
      .then(result => {
        console.log(result)
        res.send(result.insertedCount > 0);
      })
  })

  app.post('/appointmentByDate', (req, res) => {

    const date = req.body.date.Selecteddate;
    const email = req.body.email;
    doctorCollection.find({ email: email })
      .toArray((err, doctor) => {
        const filter = { date: date };
        if (doctor.length === 0) {
          filter.email = email;
        }
        appointment.find(filter)
          .toArray((err, document) => {
            res.send(document)
          })
      })
  })

  app.post('/addDoctor', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const Newimage = file.data;
    const encImg = Newimage.toString('base64');
    const Image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    }
    doctorCollection.insertOne({ name, email, Image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/doctors', (req, res) => {
    doctorCollection.find({})
      .toArray((err, result) => {
        res.send(result);
      })
  })

  app.post('/isDoctor', (req, res) => {
    const email = req.body.email

    doctorCollection.find({ email: email })
      .toArray((err, doctor) => {
        res.send(doctor.length > 0)
      })
  })

});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})