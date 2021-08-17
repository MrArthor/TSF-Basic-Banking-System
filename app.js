const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const User = require('./Models/User');
const Transaction = require('./Models/Transection');


mongoose.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Database Connected")
    })
    .catch(err => {
        console.log("Database Connection Error")
        console.log(err)
    })

mongoose.set('useFindAndModify', false);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/view", async(req, res) => {
    const users = await User.find({})
    res.render("view", { users });
});

app.get("/view/:id", async(req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    const users = await User.find({})
    res.render("transfer", { user, users });
});

app.get("/view/:id1/:id2", async(req, res) => {
    const { id1, id2 } = req.params;
    const fromUser = await User.findById(id1);
    const toUser = await User.findById(id2);
    res.render("form", { fromUser, toUser });
});

app.put("/view/:id1/:id2", async(req, res) => {
    const { id1, id2 } = req.params;
    const credit = parseInt(req.body.credit);
    const fromUser = await User.findById(id1);
    const toUser = await User.findById(id2);

    if (credit <= fromUser.credits && credit > 0) {

        let fromCreditsNew = fromUser.credits - credit;
        let toCreditsNew = parseInt(toUser.credits + credit);
        await User.findByIdAndUpdate(id1, { credits: fromCreditsNew }, { runValidators: true, new: true });
        await User.findByIdAndUpdate(id2, { credits: toCreditsNew }, { runValidators: true, new: true });

        let NewTransection = new Transaction();
        NewTransection.fromName = fromUser.name;
        NewTransection.toName = toUser.name;
        NewTransection.transfer = credit;
        await NewTransection.save();

        res.redirect("/view");
    } else {
        res.render('error');
    }
});

app.get("/history", async(req, res) => {
    const transactions = await Transaction.find({});
    res.render("history", { transactions });
});

app.listen(3000, () => {
    console.log("Serving on port 3000");
});