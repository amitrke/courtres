/**
 * PersonController
 *
 * @description :: Server-side logic for managing people
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    login: function (req, res) {
        
        var username = req.body.email;
        var password = req.body.password;
        if (username != null && password != null){
            Person.find({})
                .where({ email: username })
                .where({ password: password})
                .limit(2)
                .exec(function(err, persons) {
                    if (persons != null && persons.length > 0 ){
                        if (persons.length > 1){
                            console.log('We have more than one entry for Person' + username+", ideally there should be only one");
                        }
                        req.session.userId = persons[0].id;
                        return res.json({
                          auth: 'success',
                          person: persons[0]
                        });
                    }
                    else{
                        return res.json({
                          auth: 'failure'
                        });
                    }
                });
        }
        else{ //Incorrect input
            return res.json({
              error: 'Incorrect input.'
            });
        }
    }
};

