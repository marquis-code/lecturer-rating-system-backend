const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let adminSchema = new mongoose.Schema(
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
        adminPass: {
            type: String,
            required: [true, "Please enter your admin pass key"],

        },
        department: {
            type: String,
            required: [true, "Please enter your department"],
        },
        role : {
           type: String,
           emum : ['admin'],
           default: 'admin'
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

adminSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

adminSchema.set("toJSON", {
    virtuals: true,
});

adminSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
});


const Admin = mongoose.model("admin", adminSchema);

module.exports = Admin;