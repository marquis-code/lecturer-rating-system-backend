const express = require("express");
const app = express();
const morgan = require("morgan");
const helment = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");
// const { requireAuth, checkUser } = require("./middleware/auth.middleware");
dotenv.config();

const cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;
const connectDB = require("./config/db.cofig");

connectDB();

// middleware
const corsOptions = {
  // origin:'http://localhost:3000',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(helment());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const authRouter = require("./routes/auth.routes");
const complainsRouter = require("./routes/complain.routes");
const courseRouter = require("./routes/course.routes");
const adminRouter = require("./routes/admin.routes");
const departmentRouter = require("./routes/department.routes");

const lecturerRouter = require("./routes/lecturer.routes");
const studentRouter = require("./routes/student.routes");

// map URL starts:
// app.get("*", checkUser);
app.use("/api/auth", authRouter);
app.use("/api/complains", complainsRouter);

app.use("/api/course", courseRouter);
app.use("/api/admin", adminRouter);
app.use("/api/department", departmentRouter);

app.use("/api/lecturer", lecturerRouter);
app.use("/api/student", studentRouter);

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log(res.locals, 'locals here')
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // // render the error page
  // res.status(err.status || 500);
  // res.render('error');
});
// app.use(function(req, res, next) {
//   next(createError(404));
// });

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});


module.exports = app;
