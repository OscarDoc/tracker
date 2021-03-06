/* The WeightsDAO must be constructed with a connected database object */
function WeightsDAO(db) {
    'use strict';
    const LIMIT = 10;

    /* If this constructor is called without the 'new' operator, 'this' points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof WeightsDAO)) {
        console.warn('Warning: WeightsDAO constructor called without "new" operator');
        return new WeightsDAO(db);
    }

    const clWeight = db.collection('weight');

    this.getIdQuery = function(user,year,month,day){
        // note: this _id limits to have only ONE weight entry per user/date - then we can do an upsert and forget about many things
        return {
            '_id': {
                'user': user,
                'year': Number(year),
                'month': Number(month),
                'day': Number(day)
            }
        }
    };

    this.getUserWeights = function(user, callback){
        const query = {'_id.user': user};
        var options = {
	        'sort' : [
                ['_id.year', -1],
                ['_id.month', -1],
                ['_id.day', -1]
            ]
        };
        clWeight.find(query,{},options).toArray(function(err, weights) {
            if (err) return callback(err);
            console.log('Got', weights.length, 'weights for user', user);
            callback(err, weights);
        });
    };

    this.insertWeight = function(user, year, month, day, weight, callback) {
        console.log('inserting weight entry for', user, 'data:', year, month, day, weight);

        const query = this.getIdQuery(user, year, month, day);
        const update = {
            'weight': Number(weight)
        };
        const options = {
            'upsert': true
        };

        // now insert the post
        clWeight.update(query, update, options, function (err, result) {
            if (err) return callback(err);
            callback(err, 'weight ' + (result.nModified===1? 'updated':'inserted' ));
        });
    };

    this.deleteWeight = function(user, year, month, day, callback) {
        console.log('deleting weight entry for', user, 'for date:', year, month, day);

        const query = this.getIdQuery(user, year, month, day);
        console.log(query);
        clWeight.remove(query, function(err, removed) {
            if(err) throw err;
            callback(err, "Successfully updated " + removed + " entries!");
        });

    };

    this.getWeightByDay = function(user, year, month, day, callback) {
        const _id = {
            'user': user,
            'date': new Date(year, month, day)
        };
        clWeight.findOne(_id, function(err, weights) {
            if (err) return callback(err);
            console.log('Found ' + weights );

            callback(err, weights);
        });
    };

};

module.exports.WeightsDAO = WeightsDAO;
