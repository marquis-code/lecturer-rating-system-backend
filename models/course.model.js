const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let courseSchema = new mongoose.Schema(
    {
        level: {
            type: String,
            enum: ['100 level', '200 level', '300 level', '400 level', '400 level', '500 level'],
            required: [true, "please enter your academic level"],
        },
        courseCode: {
            type: String,
            required: [true, "Please enter course code"],

        },
        courseName: {
            type: String,
            required: [true, "Please enter course name"],
        },
        semester: {
            type: String,
            enum: ['first', 'second'],
            required: [true, "Please enter semester"],
        },
        academicSession: {
            type: String,
            required: [true, "Please enter academic session"],
        },
        complains: {
            type: [],
            default: []
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

courseSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

courseSchema.set("toJSON", {
    virtuals: true,
});

courseSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
});


const Course = mongoose.model("course", courseSchema);

module.exports = Course;