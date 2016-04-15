module.exports.cron = {
    autoCheckout: { //Runs Hourly.
        schedule: '* */1 * * * *',
        onTick: function(){
        	//Reset checkedInToFacility
            Person.find({"checkedInToFacility":{"!":null}}).exec(function findCB(err, found){
                for (var i=0; i<found.length; i++){
                    var diff = Math.abs(new Date() - new Date(found[i].updatedAt));
                    var hrs = (diff/60000)/60;
                    if (hrs > 8){
                        found[i].checkedInToFacility = null;
                        found[i].reservation = null;
                        found[i].save(function(err,s){
                            console.log("Auto checkedout "+s.name);
                        });
                    }
                }
            });
            //Reset reservation
            Person.find({"reservation":{"!":null}}).exec(function findCB(err, found){
                for (var i=0; i<found.length; i++){
                    var diff = Math.abs(new Date() - new Date(found[i].updatedAt));
                    var hrs = (diff/60000)/60;
                    if (hrs > 8){
                        found[i].checkedInToFacility = null;
                        found[i].reservation = null;
                        found[i].save(function(err,s){
                            console.log("Auto checkedout "+s.name);
                        });
                    }
                }
            });

            //Timeslot reset current status.
            Timeslots.find({"current":{"!":null}}).exec(function findCB(err, found){
                for (var i=0; i<found.length; i++){
                    var diff = Math.abs(new Date() - new Date(found[i].updatedAt));
                    var hrs = (diff/60000)/60;
                    if (hrs > 1){
                        found[i].current = null;
                        found[i].save(function(err,s){
                            console.log("Auto reset timeslot current "+s.name);
                        });
                    }
                }
            });
        }
    },
    
    /*
     * Runy every minute
     * Checks for players that are playing, resets their status depending on the court time limit.
     */
    playCheck: {
        schedule: '*/1 * * * * *',
        onTick: function(){
            
        }
    }
}
