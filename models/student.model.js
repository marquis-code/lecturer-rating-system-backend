const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let studentSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "please enter username"],
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
        studentId: {
            type: String,
            required: [true, "Please enter your student ID"],

        },
        department: {
            type: String,
            required: [true, "Please enter your department"],
        },
        academicLevel: {
            type: String,
            required: [true, "Please enter your academic level"],
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
        role : {
            type: String,
            emum : ['student'],
            default: 'student'
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

studentSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

studentSchema.set("toJSON", {
    virtuals: true,
});

studentSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
});


const Student = mongoose.model("Student", studentSchema);

module.exports = Student;