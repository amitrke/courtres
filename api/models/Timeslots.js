/**
* Timeslots.js
* 
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      startMin:'INTEGER',
      duration:'INTEGER',
	  reservation:{
		  collection:'person',
		  via:'reservation'
	  },
      court:{
          model:'courts',
          via:'timeSlots'
      }
  }
};

