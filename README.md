# courtres

Court Reservation application.

This project is a work-in-progress, the first version should be completed by 15th Jan 2016.
The application can be used by a sports facility to reserve courts for its members, some of the features include..
* Member signup
* Facility to checkin members as they come to play
* Checked in members can reserve the court using their smartphone or the facility admin can reserve court for them
* After 20 mins ( or whatever time set for the facility) the system puts the members back into the queue for reservation.
* The system logs out all members at the end of day, and they can't reserve the court using smartphone until then are checked in by the facility again.

There is a free OpenShift cloud hosted instance of this project, So you don't even have to worry about deployment.

Technologies used:
* [Sails](http://sailsjs.org)
* NodeJS
* Restangular
* AngularJS
* Bower
* Twitter Bootstrap