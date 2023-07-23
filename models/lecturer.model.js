const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let lecturerSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "please enter your full name"],
            unique: true,
        },
        email: {
            type: String,
            lowercase: true,
            required: [true, "please enter an email"],
            unique: [true, "email already exists in database!"],
            validate: {
                validator: function (v) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: `${v} is not a valid email!`
            }
        },
        staffId: {
            type: Number,
            required: [true, "Please enter your student ID"],

        },
        gender: {
            type: String,
            emum: ['male', 'female'],
            required: [true, "Please enter your gender"],
        },
        password: {
            type: String,
            required: [true, "please enter a password"],
            minlength: [6, "Minimum password length is 6 characters"],
        },
        courses: {
            type: [
                {
                    semester: String,
                    session: String,
                    courseCode: String
                },
            ],
            default: []
        },
        role: {
            type: String,
            emum: ['lecturer'],
            default: 'lecturer'
        },
        ratings : [
         { 
            question : String,
            star : Number,
            postedBy : {type: mongoose.Schema.Types.ObjectId, ref: 'Student'}
         }
        ],
        totalRatings : {
         type: String,
         default: 0
        },
        created: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
    }
);

lecturerSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

lecturerSchema.set("toJSON", {
    virtuals: true,
});

lecturerSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
});


const Lecturer = mongoose.model("lecturer", lecturerSchema);

module.exports = Lecturer;