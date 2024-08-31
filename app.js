const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); 
const jwt = require('jsonwebtoken');

app.use(express.json());

const mongoUrl = "mongodb+srv://brunonasserodrigues:Hb74mCDdeTDKMmcP@cluster0.nirll.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const JWT_SECRET = "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jdsds039[]]pou89ywe";

mongoose
    .connect(mongoUrl)
    .then(() => {
        console.log("Database connected");
    })
    .catch((e) => {
        console.log(e);
    });

app.get("/", (req,res) => { //request, response
    res.send({status: "started"});
});

require("./UserDetails");
const User = mongoose.model("UserInfo");

app.post("/register", async (req, res) => {
    //const {name, email, mobile, password, userType} = req.body;
    const {name, email, birth, password, userType} = req.body;

    const oldUser = await User.findOne({ email: email });

    if(oldUser){
        return res.send({ data: "User already exists!" });
    }

    const encryptedPassword = await bcrypt.hash(password,10);

    try{
        await User.create({
            name: name,
            email: email,
            birth: birth,
            password: encryptedPassword,
            userType: userType,
        });
        res.send({ status: "ok", data: "User Created" });
    }catch(error){
        res.send({ status: "error", data: error });
    };
});

app.post("/login-user", async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    const oldUser = await User.findOne({ email: email });
  
    if (!oldUser) {
      return res.send({ data: "Usuário não encontrado" });
    }
  
    if (await bcrypt.compare(password, oldUser.password)) {
      const token = jwt.sign({ email: oldUser.email }, JWT_SECRET);
      //console.log(token);
      if (res.status(201)) {
        return res.send({
          status: "ok",
          data: token,
          userType: oldUser.userType,
        });
      } else {
        return res.send({ 
            status: 'error', 
            data: "Erro ao realizar login",
            userType: oldUser.userType,
         });
      }
    }
  });

app.post("/userdata", async(req,res) => {
    const {token} = req.body;
    try{
        const user = jwt.verify(token, JWT_SECRET);
        const useremail = user.email;

        User.findOne({email:useremail}).then((data) => {
            return res.send({ status: "Ok", data: data});
        });
    } catch(error){
        return res.send({error: error});
    }
});

app.post("/update-user", async (req, res) => {
    //const { name, email, mobile, image, gender, profession } = req.body;
    const { name, email, image, birth, profession } = req.body;
    console.log(req.body);
    try {
        await User.updateOne(
        { email: email },
        {
            $set: {
            name,
            //mobile,
            image,
            //gender,
            birth,
            profession,
            },
        }
        );
        res.send({status:"Ok",data:"Updated"})
    } catch (error) {
        return res.send({ error: error });
    }
});

app.get("/get-all-user", async (req, res) => {
    try {
        const data = await User.find({});
        res.send({ status: "Ok", data: data });
    } catch (error) {
        return res.send({ error: error });
    }
});

app.post("/delete-user",async (req, res) => {
    const {id}=req.body;
    try {
    await User.deleteOne({_id:id});
    res.send({status:"Ok",data:"User Deleted"});
    } catch (error) {
    return res.send({ error: error });

    }
});

app.post("/get-students-by-user", async(req,res) => {
    const {userId} = req.body;
    
    var students = [];
    try {
        const data = await Class.find({idUser: userId});
        for(var i = 0; i < data.length; i++){
            if(!students.includes(data[i].student)){
                students.push(data[i].student);
            }
        }
        return res.send({ status: "Ok", data: students});
    } catch (error) {
        return res.send({ error: error });
    }
});

require("./ClassDetails");
const Class = mongoose.model("ClassInfo");

app.post("/classData", async(req,res) => {
    const {id} = req.body;
    try{
        User.findOne({_id:id}).then((data) => {
            return res.send({ status: "Ok", data: data});
        });
    } catch(error){
        return res.send({error: error});
    }
});

app.post("/update-class", async (req, res) => {
    const {idClass, userId, beginHour, endHour, busGo, busBack, priceClass, student, content} = req.body;
    console.log(req.body);

    if(userId == ''){
        return res.send({ status: "error", data: "Usuário não encontrado" });
    }

    if(idClass == null || idClass == undefined){
        return res.send({ status: "error", data: "Classe não encontrada" });
    }
    
    var oldClass = null;
    if(idClass != ''){
        oldClass = await Class.findOne({ _id: idClass });
    }

    const operation = (oldClass == null || !oldClass ? "Cadastro" : "Update");
    if(operation == "Cadastro"){
        try{
            await Class.create({
                idUser: userId,
                beginHour: beginHour,
                endHour: endHour,
                busGo: busGo,
                busBack: busBack,
                priceClass: priceClass,
                student: student,
                content: content,
            });
            res.send({ status: "Ok", data: "Class created" });
        }catch(error){
            res.send({ status: "error", data: error });
        };
    }else{
        try {
            await Class.updateOne(
            { idUser: userId },
            {
                $set: {
                beginHour,
                endHour,
                busGo,
                busBack,
                priceClass,
                student,
                content,
                },
            }
            );
            res.send({status:"Ok",data:"Atualizado"})
        } catch (error) {
            return res.send({ error: error });
        }
    }
});

app.post("/get-all-classes", async (req, res) => {
    const {userId} = req.body;
    var id = userId;

    if(userId == null){
        return res.send({ error: 'Usuário não identificado' });
    }

    try {
        const data = await Class.find({idUser: id}).sort({beginHour: -1});
        res.send({ status: "Ok", data: data });
    } catch (error) {
        return res.send({ error: error });
    }
});

app.post("/delete-class",async (req, res) => {
    const {id}=req.body;
    try {
    await Class.deleteOne({_id:id});
    res.send({status:"Ok",data:"Classe removida"});
    } catch (error) {
    return res.send({ error: error });
    }
});

app.post("/get-report", async(req,res) => {
    const {userId, beginDate, endDate, students} = req.body;
    
    var numeroHoras = 0;
    var horasAula = [];
    var gastoBus = 0;
    var total = 0;
    var liquido = 0;

    var relatorio = [];
    try {
        var numeroRelatorio = 0;
        const data = await Class.find({idUser: userId}).sort({beginHour: 1});
        var mes = 0;
        var ano = 0;
        var mesInicial = (data.length > 0 ? new Date(data[0].beginHour).getMonth() : 0);
        var anoInicial = (data.length > 0 ? new Date(data[0].beginHour).getFullYear() : 0);
        mes = mesInicial;
        ano = anoInicial;
        for(var i = 0; i < data.length; i++){
            const begin = new Date(data[i].beginHour);
            const end = new Date(data[i].endHour);

            var haveStudent = (students.length == 0);
            if(!haveStudent){
                haveStudent = students.includes(data[i].student);
            }

            var haveBeginDate = false;
            if(data[i].beginHour != null){
                var beginDateToDate = new Date(beginDate);
                beginDateToDate.setHours(0);
                beginDateToDate.setMinutes(0);
                beginDateToDate.setSeconds(0);
                beginDateToDate.setMilliseconds(0);
                haveBeginDate = (beginDateToDate <= begin);
            }

            var haveEndDate = false;
            if(data[i].endHour != null){
                var endDateToDate = new Date(endDate);
                endDateToDate.setHours(23);
                endDateToDate.setMinutes(59);
                endDateToDate.setSeconds(59);
                haveEndDate = (endDateToDate >= end);
            }

            //console.log(haveStudent);
            //console.log(haveBeginDate);
            //console.log(haveEndDate);

            if(haveStudent && haveBeginDate && haveEndDate){
                if((mes != begin.getMonth() || ano != begin.getFullYear()) && (mes != 0 && ano != 0)){
                    const sumHorasAula = horasAula.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
                    const averageHorasAula = (horasAula.length > 0 ? sumHorasAula / horasAula.length : 0);

                    numeroRelatorio = numeroRelatorio + 1;
                    relatorio.push({id: numeroRelatorio, mes: mes, ano: ano, horas: numeroHoras, horasAula: averageHorasAula, bus: gastoBus, total: total, liquido: ((total-gastoBus).toFixed(2))});
                    mes = begin.getMonth();
                    ano = begin.getFullYear();
                    numeroHoras = 0;
                    horasAula = [];
                    gastoBus = 0;
                    total = 0;
                    liquido = 0;
                }

                var durationFloat = end - begin;
                const hours = Math.floor((durationFloat / (1000 * 60 * 60)) % 24); //ele só sabe contar até 24, logo as horas a serem comparadas tem que ser no mesmo dia
                const minutes = Math.floor((durationFloat / (1000 * 60)) % 60);

                const singleClassHour = hours + parseFloat((minutes/60.0).toFixed(2));
                const price = data[i].priceClass;

                numeroHoras = numeroHoras + singleClassHour;
                horasAula.push(price);
                gastoBus = gastoBus + data[i].busGo + data[i].busBack;
                total = total + singleClassHour*price;
            }
        }

        if(numeroHoras == 0 && horasAula.length == 0 && gastoBus == 0 && total == 0){
            return res.send({status: "Ok", data: []});
        }

        const sumHorasAula = horasAula.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        const averageHorasAula = (horasAula.length > 0 ? (sumHorasAula / horasAula.length) : 0);

        numeroRelatorio = numeroRelatorio + 1;
        relatorio.push({id: numeroRelatorio, mes: mes, ano: ano, horas: numeroHoras, horasAula: averageHorasAula, bus: gastoBus, total: total, liquido: ((total + gastoBus).toFixed(2))});
        console.log(relatorio);
        return res.send({ status: "Ok", data: relatorio});
    } catch (error) {
        console.log(error);
        return res.send({ error: error });
    }
});

app.post("/get-report-content", async(req,res) => {
    const {userId, beginDate, endDate, students} = req.body;
    
    var numeroHoras = 0;
    var horasAula = [];
    var gastoBus = 0;
    var total = 0;
    var liquido = 0;

    var studentsToUse = [];
    var studentsFiltered = [];

    var relatorio = [];
    try {
        var numeroRelatorio = 0;
        const data = await Class.find({idUser: userId}).sort({beginHour: 1});
        for(var i = 0; i < data.length; i++){
            const begin = new Date(data[i].beginHour);
            const end = new Date(data[i].endHour);

            var haveStudent = (students.length == 0);
            if(!haveStudent){
                haveStudent = students.includes(data[i].student);
            }

            var haveBeginDate = false;
            if(data[i].beginHour != null){
                var beginDateToDate = new Date(beginDate);
                beginDateToDate.setHours(0);
                beginDateToDate.setMinutes(0);
                beginDateToDate.setSeconds(0);
                beginDateToDate.setMilliseconds(0);
                haveBeginDate = (beginDateToDate <= begin);
            }

            var haveEndDate = false;
            if(data[i].endHour != null){
                var endDateToDate = new Date(endDate);
                endDateToDate.setHours(23);
                endDateToDate.setMinutes(59);
                endDateToDate.setSeconds(59);
                haveEndDate = (endDateToDate >= end);
            }

            //console.log(haveStudent);
            //console.log(haveBeginDate);
            //console.log(haveEndDate);

            if(haveStudent && haveBeginDate && haveEndDate){
                if(!studentsToUse.includes(data[i].student)){
                    studentsToUse.push(data[i].student);
                }
                studentsFiltered.push({student: data[i].student, date: data[i].beginHour, content: data[i].content});
            }
        }

        if(studentsToUse.length > 0 && studentsFiltered.length > 0){
            for(var i = 0; i < studentsToUse.length; i++){
                var classesStudent = studentsFiltered.filter(x => x.student == studentsToUse[i]);
                var dayContent = [];
                if(classesStudent != null){
                    if(classesStudent.length > 0){
                        for(var j = 0; j < classesStudent.length; j++){
                            var dateClass = new Date(classesStudent[j].date);
                            dayContent.push({date: dateClass, content: classesStudent[j].content});
                        }
                        numeroRelatorio = numeroRelatorio + 1;
                        relatorio.push({id: numeroRelatorio, student: studentsToUse[i], classes: dayContent});
                    }
                }
            }

            console.log(relatorio);
        }

        return res.send({ status: "Ok", data: relatorio});
    } catch (error) {
        console.log(error);
        return res.send({ error: error });
    }
});

app.listen(5002, () => { console.log("Runned") });

//npx nodemon app quando for rodar
//          No Video        Eu
//Project   Application     Clauc
//Cluster   Cluster0        Cluster0
//User      Algum           brunonasserodrigues
//Senha     Algum           Hb74mCDdeTDKMmcP

//IP        177.208.160.217/32