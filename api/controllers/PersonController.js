/**
 * PersonController
 *
 * @description :: Server-side logic for managing people
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    login: function (req, res) {
        var count = "";
        console.log('About to query for ' + req.query.name)
        Person.find({})
            .where({ name: req.query.name })
          .limit(1)
          .exec(function(err, persons) {
            console.log('Found User with name ' + persons)
        });
        return res.send("Hi there!"+count+"<--");
    },
    bye: function (req, res) {
        return res.redirect("http://www.sayonara.com");
    }
};

