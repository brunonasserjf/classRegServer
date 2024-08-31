const mongoose = require("mongoose");

const ClassDetailsSchema = new mongoose.Schema(
{
    idUser: String,
    beginHour: Date,
    endHour: Date,
    busGo: Number,
    busBack: Number,
    priceClass: Number,
    student: String,
    content: String,
},
{
    collection: "ClassInfo",
});
mongoose.model("ClassInfo", ClassDetailsSchema);