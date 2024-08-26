const mongoose=require('mongoose');

function connectMongo(database){
    mongoose
    .connect("mongodb://127.0.0.1:27017/"+database)
    .then(()=>console.log("Mongo DB Connected"))
    .catch((err)=>console.log("Mongo connection Failed: ",err));
}

module.exports = {connectMongo}