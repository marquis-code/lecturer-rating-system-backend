const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "please enter department name"],
            unique: true,
        },
        department: {
            type: String,
            required: [true, "Please enter your department"],
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

departmentSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

departmentSchema.set("toJSON", {
    virtuals: true,
});

departmentSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
});


const Department = mongoose.model("department", departmentSchema);

module.exports = Department