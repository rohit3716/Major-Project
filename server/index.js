const express = require('express');
const app = express();

const userRoute = require("./routes/User");
const profileRoute = require('./routes/Profile');
const paymentRoute = require('./routes/Payment');
const courseRoute = require('./routes/Course');


const database = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {cloudinaryConnect} = require('./config/cloudinary');
const fileUpload = require('express-fileupload');

require('dotenv').config();
const PORT = process.env.PORT;

//database connect
database.connect();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"http://localhost:3000",
        credentials:true,
    })
);
app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp",
    })
)


//clodinary connection
cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoute);
app.use("/api/v1/profile", profileRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/payment", paymentRoute);

//default route
app.get("/", (req, res) => {
    return res.json({
        success:true,
        message:'Server is up and running..',
    })
})  

app.listen(PORT, () => {
    console.log(`App is running at PORT:${PORT}`);
})