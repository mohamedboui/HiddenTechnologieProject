module.exports = function(mongoose) {
    var Schema = mongoose.Schema;

    var ConfigSchema = new Schema({
        config : {}
    });
    module.exports = mongoose.model('Config', ConfigSchema);
}
