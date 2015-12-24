/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    
    var facilities = [{"name":'BadmintonNC', "noOfCourts":7}];
    var persons = [
        {"name":'Amit Kumar', "email":'amitrke@gmail.com', "password":'abcd', "type":'member', }
    ];
    
    Facility.count().exec(function(err, count) {
        if(err) {
          sails.log.error('Already have data.');
            cb(err);
        }
        if(count == 0) {
            sails.log.info('Creating facilities..');
            Facility.create(facilities).exec(cb);
        }
        else{
            sails.log.info('Already have facility data.');
            cb();
        }
    });
    /*
    
    
    Facility.count().exec(function(err, count) {
        if(err) {
          sails.log.error('Already have data.');
            cb(err);
        }
        if(count == 0) {
            sails.log.info('Creating facilities..');
            Facility.create(facilities).exec(cb);
        }
        else{
            sails.log.info('Already have facility data.');
            cb();
        }
    });
    
    var afterFacilities = function(){
        
    };
    */
};
