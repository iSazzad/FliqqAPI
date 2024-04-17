const mongooseDB = require("mongoose");

mongooseDB
    .connect(
        `${process.env.DB_NAME}`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => {
        mongooseDB
        console.log("mongoose database connection successfully.......");
    })
    .catch((error) => {
        console.log("mongoose database connection fails.......", error);
    });