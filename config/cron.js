module.exports.cron = {
    autoCheckout: {
        schedule: '* */1 * * * *',
        onTick: function(){
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
        }
    }
}