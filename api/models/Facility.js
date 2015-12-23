/**
* Facility.js
*
* @description :: Model class that represents the business Facility.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      name:'STRING',
      noOfCourts:'INTEGER',
      members:{
          collection:'person',
          via:'facilities'
      }
  }
};

