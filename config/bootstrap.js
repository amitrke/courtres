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
	var timeslots = [
		{'startMin':0, 'duration':20}, {'startMin':20, 'duration':20}, {'startMin':40, 'duration':20},
        {'startMin':0, 'duration':20}, {'startMin':20, 'duration':20}, {'startMin':40, 'duration':20},
        {'startMin':0, 'duration':20}, {'startMin':20, 'duration':20}, {'startMin':40, 'duration':20},
        {'startMin':0, 'duration':20}, {'startMin':20, 'duration':20}, {'startMin':40, 'duration':20},
        {'startMin':0, 'duration':20}, {'startMin':20, 'duration':20}, {'startMin':40, 'duration':20},
        {'startMin':0, 'duration':20}, {'startMin':20, 'duration':20}, {'startMin':40, 'duration':20},
        {'startMin':0, 'duration':20}, {'startMin':20, 'duration':20}, {'startMin':40, 'duration':20},
	];
    var persons = [
        {"name":'Amit', "email":'amitrke@gmail.com', "password":'abcd', 'type':"member"},
		{"name":'Varun', "email":'varun@gmail.com', "password":'abcd', 'type':"member"},
		{"name":'Abhishek', "email":'abhishek@gmail.com', "password":'abcd', 'type':"member"},
		{"name":'Roy', "email":'roy@gmail.com', "password":'abcd', 'type':"member"},
		{"name":'Tim', "email":'tim@gmail.com', "password":'abcd', 'type':"member"},
		{"name":'Dennis', "email":'dennis@gmail.com', "password":'abcd', 'type':"admin"}
    ];
	var courts = [
		{'name':"1", 'isEnabled':true, 'comments':"Open Play", 'maxNumberOfPeople':4},
		{'name':"2", 'isEnabled':true, 'comments':"Open Play", 'maxNumberOfPeople':4},
		{'name':"3", 'isEnabled':true, 'comments':"Open Play", 'maxNumberOfPeople':4},
		{'name':"4", 'isEnabled':true, 'comments':"Open Play", 'maxNumberOfPeople':4},
		{'name':"5", 'isEnabled':true, 'comments':"Open Play", 'maxNumberOfPeople':4},
		{'name':"6", 'isEnabled':true, 'comments':"Reserved for Kids 7 PM onwards, don't register here, you could be kicked out.", 'maxNumberOfPeople':4},
		{'name':"7", 'isEnabled':true, 'comments':"Reserved for training, don't register here, you could be kicked out.", 'maxNumberOfPeople':4}
	];
    
	var objFacilities = [];
	var objCourts = [];
	
	var afterTimeslotsCreation = function(err, newTimeslots){
		sails.log.info("Associating timeslot records..");
        for (var i=0; i<objCourts.length; i++){
            var thisCourt = objCourts[i];
            var init = i*3;
            var term = init+3;
            for (var j=init; j<term; j++){
                newTimeslots[j].court = thisCourt;
                newTimeslots[j].save();
                thisCourt.timeSlots.add(newTimeslots[j]);
            }
        }
        thisCourt.save();
        
		cb();
	};
	
	var afterCourtsAssociation = function(){
		sails.log.info('Creating Timeslot records..');
		Timeslots.create(timeslots).exec(afterTimeslotsCreation);
	};
	
	var afterCourtsCreation = function(err, newCourts){
		sails.log.info('Associating Court records..');
		while (newCourts.length){
			var thisCourt = newCourts.pop();
			thisCourt.facility = objFacilities[0].id;
			thisCourt.save();
			objCourts.push(thisCourt);
		}
		afterCourtsAssociation();
	};
	
	var afterPersonAssoc = function(){
		sails.log.info('Creating Court records..');
		Courts.create(courts).exec(afterCourtsCreation);
	};
	
    Facility.count().exec(function(err, count) {
        if(err) {
          sails.log.error('Error occured while getting a count of facility records.');
          cb(err);
        }
        else if(count == 0) {
            sails.log.info('Creating facilities..');
            Facility.create(facilities).exec(afterFacilities);
        }
        else{
            sails.log.info('Already have facility data.');
            cb();
        }
    });
	
	var afterFacilities = function(err, newFacilities){
		while (newFacilities.length)
			objFacilities.push(newFacilities.pop())
		
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
	
	var afterPerson = function(err, newPersons){
		sails.log.info('Associating Person records..');
		while (newPersons.length){
			var thisPerson = newPersons.pop();
			thisPerson.facilities.add(objFacilities[0].id);
			thisPerson.save();
		}
		afterPersonAssoc();
	};
};