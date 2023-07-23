const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let lecturerSchema = new mongoose.Schema(
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
        lecturer: {
            type: String,
            required: [true, "Please enter lecturer"],
        },
        courseName: {
            type: String,
            required: [true, "Please enter course name"],
        },
        complains: {
            type: String,
            required: [true, "Please enter complain"],
        },
        rating: {
            type: Object,
            required: [true, "Please ensure you rate."],

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