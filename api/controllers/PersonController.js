/**
 * PersonController
 *
 * @description :: Server-side logic for managing people
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    hi: function (req, res) {
        var count = "";
        Person.find({})
          .exec(function(err, persons) {
            console.log('Found User with name ' + persons)
            count=persons.length;
        });
        return res.send("Hi there!"+count+"<--");
    },
    bye: function (req, res) {
        return res.redirect("http://www.sayonara.com");
    }
};

