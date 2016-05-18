var bcrypt   = require('bcrypt-nodejs'),
    mongoosePaginate = require('mongoose-paginate'),
    globalConfig  = require('../../public/js/globalConfig');

module.exports = function(mongoose) {
    var Schema = mongoose.Schema,
        deepPopulate = require('mongoose-deep-populate')(mongoose);

    var MessageSchema = new Schema({
        text : {type : String},
        subject: {type : String},
        isReaded : {type : Boolean,default:false},
        viewedAt : {type:Date},
        createdAt : { type: Date, default : Date.now},        
        writer:  {type: Schema.Types.ObjectId,ref: 'User'},
        toemail:{type:String}
        
    });

    MessageSchema.plugin(mongoosePaginate);
    MessageSchema.plugin(deepPopulate, {});
    
    module.exports = mongoose.model('Message', MessageSchema);
}
