//
//
import mongoose, { Model, Schema, Document } from "mongoose";
// import bcrypt from "bcryptjs";
//
// import { T } from "../../../__PKG__/X";
//
//
type ObjDoc = Document; // & T.ObjDat;
//
//
const schema = new Schema(
    {
        obj_id: {
            type: Schema.Types.String,
            required: true,
        },
        user_id: {
            type: Schema.Types.String,
            required: true,
        },
    },
    {
        collection: "ObjDat",
        timestamps: true,
    }
);
//
//
// schema.pre("save", async function (next) {
//     //
//     //
//     if (this.isModified("password")) {
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//     }
//     //
//     //
//     if (!this.isNew) {
//         return next();
//     }
//     //
//     //
//     const User = this.constructor as Model<ObjDoc>;
//     const existingUser = await User.findOne({
//         $or: [{ email: this.email }, { user_id: this.user_id }],
//     });
//     //
//     //
//     if (existingUser) {
//         const field = existingUser.email === this.email ? "email" : "alias";
//         const error = new Error(`${field} already in use`);
//         return next(error);
//     }
//     //
//     //
//     next();
// });
// schema.methods.matchPassword = async function (enteredPassword: string) {
//     return await bcrypt.compare(enteredPassword, this.password);
// };
//
//
schema.methods.toJSON = function () {
    var obj = this.toObject();
    //
    obj.id = obj._id;
    //
    delete obj._id;
    delete obj.__v;
    delete obj.createdAt;
    delete obj.updatedAt;
    return obj;
};
//
//
export default mongoose.model<ObjDoc>("ObjDat", schema);
