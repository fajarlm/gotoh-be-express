const express = require('express')
const app = express()
const port = 3000
const methodOverride = require("method-override");

const db = require("./models")

db.sequelize.authenticate()
.then(()=> console.log("database model"))
.catch((err)=> console.log(err))

// app use untuk mendaftarkan/mengunakna routing
// agar express bisa baca json req
app.use(express.json());

app.use(methodOverride("_method"));

// agar user bisa mengakases upload folder 
app.use('/uploads',express.static('uploads'))

app.use('/', loginRoutes)


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});