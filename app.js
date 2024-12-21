const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectId;
      
const app = express();
app.use(express.static("public"));  // статические файлы будут в папке public
app.use(express.json());        // подключаем автоматический парсинг json
    
const mongoClient = new MongoClient("mongodb://localhost:27017/");

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// установка схемы
const userScheme = new Schema({
    name: String,
    age: Number
});
// определяем модель User
const User = mongoose.model("User", userScheme);
// создаем объект модели User
const user = new User({ name: "Bill", age: 41});
 
async function main() {
    // подключемся к базе данных
    await mongoose.connect("mongodb://127.0.0.1:27017/usersdbkolieva");
     
    // сохраняем модель user в базу данных
    await user.save();
    console.log("Сохранен объект", user);
 
    // отключаемся от базы данных
    await mongoose.disconnect();
}
// запускаем подключение и взаимодействие с базой данных
main().catch(console.log);
   
(async () => {
     try {
        await mongoClient.connect();
        app.locals.collection = mongoClient.db("usersdbkolieva").collection("users");
        app.listen(3000);
        console.log("Сервер ожидает подключения...");
    }catch(err) {
        return console.log(err);
    } 
})();
   
app.get("/api/users", async(req, res) => {
           
    const collection = req.app.locals.collection;
    try{
        const users = await collection.find({}).toArray();
        res.send(users);
    }
    catch(err){
        console.log(err);
        res.sendStatus(500);
    }  
});
app.get("/api/users/:id", async(req, res) => {
           
    const collection = req.app.locals.collection;
    try{
        const id = new objectId(req.params.id);
        const user = await collection.findOne({_id: id});
        if(user) res.send(user);
        else res.sendStatus(404);
    }
    catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});
      
app.post("/api/users", async(req, res)=> {
          
    if(!req.body) return res.sendStatus(400);
          
    const userName = req.body.name;
    const userAge = req.body.age;
    const user = {name: userName, age: userAge};
          
    const collection = req.app.locals.collection;
       
    try{
        await collection.insertOne(user);
        res.send(user);
    }
    catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});
       
app.delete("/api/users/:id", async(req, res)=>{
           
    const collection = req.app.locals.collection;
    try{
        const id = new objectId(req.params.id);
        const user = await collection.findOneAndDelete({_id: id});
        if(user) res.send(user);
        else res.sendStatus(404);
    }
    catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});
      
app.put("/api/users", async(req, res)=>{
           
    if(!req.body) return res.sendStatus(400);
    const userName = req.body.name;
    const userAge = req.body.age;
          
    const collection = req.app.locals.collection;
    try{
        const id = new objectId(req.body.id);
        const user = await collection.findOneAndUpdate({_id: id}, { $set: {age: userAge, name: userName}},
         {returnDocument: "after" });
        if(user) res.send(user);
        else res.sendStatus(404);
    }
    catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});
    
// прослушиваем прерывание работы программы (ctrl-c)
process.on("SIGINT", async() => {
       
    await mongoClient.close();
    console.log("Приложение завершило работу");
    process.exit();
});