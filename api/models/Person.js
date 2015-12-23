/**
* Person.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      name:'STRING',
      email:'STRING',
      password:'STRING',
      type:'STRING',
      sex: {
        type: 'string',
        enum: ['M', 'F']
      },
      facilities:{
        collection:'facility',
        via:'members'
    }
  }
};

