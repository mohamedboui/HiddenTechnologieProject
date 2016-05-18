var json2csv = require('json2csv'),
    fs = require('fs');

module.exports = {
    date : {
        // except seconds
        equal : function(d1,d2){
            return d1.getFullYear()===d2.getFullYear() &&
                d1.getMonth()===d2.getMonth() &&
                d1.getDate()===d2.getDate() &&
                d1.getHours()===d2.getHours() &&
                d1.getMinutes()===d2.getMinutes();
        }
    },
    export : {
        csv : function(data, headers, del,fileName, callback){
            json2csv({data: data, fields: headers,del: del,quotes : ''}, function(err, csv) {
                if (err) callback(false);
                fs.writeFile(fileName + '.csv', csv, function (err) {
                    if (err) callback(false);
                    callback(true, fileName + '.csv');

                });
            });
        }

    }
    }



