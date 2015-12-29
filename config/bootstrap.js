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
    
    var facilities = [{"name":'BadmintonNC', "noOfCourts":7}];
    var persons = [
        {"name":'Amit', "email":'amitrke@gmail.com', "password":'abcd'},
		    {"name":'Dennis', "email":'dennis@gmail.com', "password":'abcd'}
    ];
    
    Facility.count().exec(function(err, count) {
        if(err) {
          sails.log.error('Error occured while getting a count of facility records.');
            cb(err);
        }
        if(count == 0) {
            sails.log.info('Creating facilities..');
            Facility.create(facilities).exec(afterFacilities);
        }
        else{
            sails.log.info('Already have facility data.');
            cb();
        }
    });
	
	var afterFacilities = function(){
        Person.count().exec(function(err,count){
			if(err){
				sails.log.error('Error while getting a count of person records.');
				cb(err);
			}
			else if (count == 0){
				sails.log.info('Creating Person records..');
				Person.create(persons).exec(afterPerson);
			}
			else{
				sails.log.info('Already have person data.');
				cb();
			}
		});
    };
	
	var afterPerson = function(){
		Personfacility.count().exec(function(err,count){
			if(err){
				sails.log.error('Error while getting a count of personfacility records.');
				cb(err);
			}else if (count == 0){
				sails.log.info('Creating Personfacility records..');
				
				Facility.find({'name':"BadmintonNC"}).exec(function findFac(err, results){
					if (err){ //TODO: Probably if condition is not needed
						sails.log.error('Error while retreving facility data:'+err);
						cb();
					}
					else if (results.length > 0){
						var facilityId = results[0].id;
						
						Person.find({'name':"Amit"}).exec(function findPer(err, results){
							if(err){ //TODO: Probably if condition is not needed
								sails.log.error('Error while retreving facility data:'+err);
								cb();
							}
							else if (results.length > 0){
								var personID = results[0].id;
								var personfacilityarray = [];
								personfacilityarray.push({'personid':personID, 'facilityid':facilityId, 'role':'member'});
								Personfacility.create(personfacilityarray).exec(afterPersonFacility);
							}
							else{
								sails.log.error('Error while retreving person data.');
								cb();
							}
						});
					}
					else{
						sails.log.error('Error while retreving facility data.');
						cb();
					}
				});
			}
			else{
				sails.log.info('Already have Personfacility data.');
				cb();
			}
		});
	};
	
	var afterPersonFacility = function(){
		cb();
	};
};
