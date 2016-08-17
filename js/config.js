var gConfig = {
	baseUrl: "http://www.daygot.net/api/portal/",
	imagePath: "http://www.daygot.net/mobile/images/",
	loginType: 1,
	loginId: 1
}
 
var gCurrent = {

}

var gTimeslot = [
            'Open 24 hours',
            'Closed',
            '5:00 am' ,'5:15 am','5:30 am','5:45 am',
            '6:00 am' ,'6:15 am','6:30 am','6:45 am',
            '7:00 am' ,'7:15 am','7:30 am','7:45 am',
            '8:00 am' ,'8:15 am','8:30 am','8:45 am',
            '9:00 am' ,'9:15 am','9:30 am','9:45 am',
            '10:00 am' ,'10:15 am','10:30 am','10:45 am',
            '11:00 am' ,'11:15 am','11:30 am','11:45 am',
            '12:00 pm' ,'12:15 pm','12:30 pm','12:45 pm',
            '1:00 pm' ,'1:15 pm','1:30 pm','1:45 pm',
            '2:00 pm' ,'2:15 pm','2:30 pm','2:45 pm',
            '3:00 pm' ,'3:15 pm','3:30 pm','3:45 pm',
            '4:00 pm' ,'4:15 pm','4:30 pm','4:45 pm',
            '5:00 pm' ,'5:15 pm','5:30 pm','5:45 pm',
            '6:00 pm' ,'6:15 pm','6:30 pm','6:45 pm',
            '7:00 pm' ,'7:15 pm','7:30 pm','7:45 pm',
            '8:00 pm' ,'8:15 pm','8:30 pm','8:45 pm',
            '9:00 pm' ,'9:15 pm','9:30 pm','9:45 pm',
            '10:00 pm' ,'10:15 pm','10:30 pm','10:45 pm',
            '11:00 pm' ,'11:15 pm','11:30 pm','11:45 pm',
            '12:00 am' ,'12:15 am','12:30 am','12:45 am'
        ]
        
var gDefaultHour = [
            { 'dayId': 0, 'startTime': '11:00am', 'endTime': '9:00pm'},
            { 'dayId': 1, 'startTime': '11:00am', 'endTime': '9:00pm'},
            { 'dayId': 2, 'startTime': '11:00am', 'endTime': '9:00pm'},
            { 'dayId': 3, 'startTime': '11:00am', 'endTime': '9:00pm'},
            { 'dayId': 4, 'startTime': '11:00am', 'endTime': '9:00pm'},
            { 'dayId': 5, 'startTime': '11:00am', 'endTime': '9:00pm'},
            { 'dayId': 6, 'startTime': '11:00am', 'endTime': '9:00pm'}
        ]

var gDefaultHours = {
      "weekday": {
            "startTime" : "11:00 am",
            "endTime": "9:00 pm"
      },
      "monday": {
            "startTime" : "11:00 am",
            "endTime": "9:00 pm"
      },
       "tuesday": {
            "startTime" : "11:00 am",
            "endTime": "9:00 pm"
      },
       "wednesday": {
            "startTime" : "11:00 am",
            "endTime": "9:00 pm"
      },
       "thursday": {
            "startTime" : "11:00 am",
            "endTime": "9:00 pm"
      },
       "friday": {
            "startTime" : "11:00 am",
            "endTime": "9:00 pm"
      },
       "saturday": {
            "startTime" : "11:00 am",
            "endTime": "9:00 pm"
      },
       "sunday": {
            "startTime" : "11:00 am",
            "endTime": "9:00 pm"
      }
}
