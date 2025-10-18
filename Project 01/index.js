const express = require('express');

const fs = require('fs');
const mongoose = require('mongoose');
const { type } = require('os');

const app = express();
const PORT = 8001;

mongoose.connect("mongodb://127.0.0.1:27017/App1")
.then(()=>{
    console.log("Connected to MongoDB");
})
.catch((err)=>{
    console.log("Error connecting to MongoDB", err);
});

const userSechema = new mongoose.Schema({
    firstName: {
        type : String,
        required : true
    },
    lastName: {
        type : String
    },
    email:{
        type : String,
        required : true,
        unique : true
    },
    jobTitle : {
        type : String
    },
    gender:{
        type : String,
    }
}, {timestamps : true});

const User = mongoose.model("user", userSechema);

app.use(express.urlencoded({ extended:false }));
app.use((req,res,next)=>{
    fs.appendFile("log.txt",`${new Date().toISOString()} : ${req.method} : ${req.path}\n`,(err,data)=>{
        if(err) console.log(err);
        next();
    })
});

app.get('/users',async (req,res)=>{
    const AllDBUSERS = await User.find();
    const html = `
    <ul>
        ${AllDBUSERS.map((u)=>`<li>${u.firstName} - ${u.email}</li>`).join('')}
    </ul>
    `;
    return res.send(html);
});
//REST API
app.get('/api/users',async (req,res)=>{
    const AllDBUSERS = await User.find({});
    return res.json(AllDBUSERS);
});

app.route("/api/users/:id")
.get(async (req,res)=>{
    const user = await User.findById(req.params.id);
    return res.json(user);
})
.patch(async (req,res)=>{
    await User.findByIdAndUpdate(req.params.id, req.body);
    return res.json({msg : "Updated"});
})
.delete(async (req,res)=>{
    //Delete user with id
    await User.findByIdAndDelete(req.params.id);
    return res.json({msg : "Deleted"});
});

app.post('/api/users',async (req,res)=>{
    //Create new user
    const body = req.body;
    // console.log(body);
    const result = await User.create({
        firstName : body.first_name,
        lastName : body.last_name,
        email : body.email,
        jobTitle : body.job_title,
        gender : body.gender
});

    console.log(result);

    return res.status(201).json({msg : 'Sucess'});
});

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});