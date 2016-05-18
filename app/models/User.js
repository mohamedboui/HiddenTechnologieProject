var bcrypt = require('bcrypt-nodejs'),
    globalConfig = require('../../public/js/globalConfig'),
    _ = require('underscore'),
    mongoosePaginate = require('mongoose-paginate');
module.exports = function(mongoose) {
    var Schema = mongoose.Schema,
        deepPopulate = require('mongoose-deep-populate')(mongoose);
    var UserSchema = new Schema({
        username: String,
        password: String,
        phone: String,
        firstName: String,
        lastName: String,
        email: {type:String,unique:true},
        role: {
            type: String,
            enum: _.pluck(globalConfig.roles, 'code')
        },
        admin: {
            type: Boolean,
            default: false
        },
        superAdmin: {
            type: Boolean,
            default: false
        },
        active: {
            type: Boolean,
            default: true
        },
        contacts: [String],
        // Times
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }, {
        collection: "user"
    });
    // generating a hash
    UserSchema.methods.generateHash = function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };
    // checking if password is valid
    UserSchema.methods.validPassword = function(password) {
        return bcrypt.compareSync(password, this.password);
    };
    UserSchema.plugin(mongoosePaginate);
    UserSchema.plugin(deepPopulate, {});
    module.exports = mongoose.model('User', UserSchema);
}