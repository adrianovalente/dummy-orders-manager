const mongoose = require('mongoose')
mongoose.Promise = Promise

module.exports = {
  init : init
}

const MONGO_URI = process.env.DDUX_MONGO_URL || 'mongodb://localhost/calendarBot'

/**
 * Initializes the mongo database and its models
 *
 * @param {Function} cb
 */
function init(cb) {

  var db = mongoose.connection
  db.on('error', cb)

  db.once('open', function () {
    
    /** TODO @drico move these schemas to a separeted file */
    cb(null, mongoose.model('Orders', new mongoose.Schema({
      product_id : String,
      price      : String,
      cep        : String,
      created_at : Date,
      ip         : String
    })), mongoose.model('OrderStats', new mongoose.Schema({
      config     : String,
      created_at : Date,
      extra_info : {}
    })))

  })

  console.log('database is initializing...')
  mongoose.connect(MONGO_URI)
}
