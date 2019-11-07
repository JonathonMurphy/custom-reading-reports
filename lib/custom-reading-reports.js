const axios = require('axios'),
      auth = require('../auth/auth');

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

// Accepts the Admin AOI Classes endpoint Res as it's object
module.exports.ClassObject = class CustomReportClassObject {
  constructor(classOfGetClassDataRes) {
    this.inst = classOfGetClassDataRes.institution_name;
    this.className = classOfGetClassDataRes.name;
    this.classID = classOfGetClassDataRes.classe_uid;
    this.primaryTeacher = `${classOfGetClassDataRes.official_staff.first_name} ${classOfGetClassDataRes.official_staff.last_name}`;
  }
};

// Accepts the Class State Aqua Res, and the ClassObject as it's arguments
module.exports.StudentObject =  class CustomReportStudentObject {
  constructor(studentOfGetClassStateRes, classObj) {
    this.inst = classObj.inst;
    this.className = classObj.className;
    this.primaryTeacher = classObj.primaryTeacher;
    this.fullName = studentOfGetClassStateRes.FullName;
    this.gradeLevel = studentOfGetClassStateRes.GradeLevel;
    this.timePlayed = undefined;
  }
};


// Helper function for getting the number of days between today and
// the requested start date as a date string argument
module.exports.daysSince = function daysSince (dateString) {
  const oneDay = 24 * 60 * 60 * 1000, // hours*minutes*seconds*milliseconds
        firstDate = new Date(dateString),
        secondDate = new Date(),
        diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
  return diffDays;
}

// Helper function for converting the time played value from
// seconds to hours and minutes
module.exports.secondsToHoursAndMinutes = function secondsToHoursAndMinutes (seconds) {
  let sec = Number(seconds);
  let hours = Math.floor(sec / 3600);
  let minutes = Math.floor(sec % 3600 / 60);
  if (hours == 0) {
    return `${minutes} minutes`;
  } else {
    return `${hours} hours, and ${minutes} minutes`;
  }
}



// Wrapper for htting the Admin API Classes endpoint
// This endpoint is used to get the list of all classes for an inst and all the students in those classes
module.exports.getClassData = async function getClassData(instIDArray) {
  try {
    let classData = {classes: []};
    for (let instID of instIDArray) {
      const res = await axios.request({
        url: `/adminapi/classes?institution_uid=${instID}&with_demo=false`,
        method: 'GET',
        baseURL:'https://mclass.amplify.com',
        headers: {
          cookie: auth.cookie
        }
      });
      console.log(`Getting data for students in classes in Inst ID: ${instID}`);
      for (let classes of res.data) {
        classData.classes.push(classes);
      }
    }
    return classData;
  } catch (err) {
    console.error(err);
  }
};

// Wrapper for hitting the Reading K-5 usage stats endpoint
// Takes an object containing an array of AQUA student IDs and
// the number of days to pull usage stats for
module.exports.getUsageStats = async function getUsageStats(timeSpentPostData) {
  try {
    let timeSpentRes = await axios.request({
      url: `/results/v3/timeSpentInGames`,
      method: 'POST',
      baseURL:'https://aquaapi.amplify.com',
      headers: {
        Authorization: auth.bearer
      },
      data: timeSpentPostData
    })
    return timeSpentRes.data
  } catch (err) {
    console.error(err);
  }
};

// Wrapper for hitting the Reading K-5 class state endpoint
// Takes the class UID / EID (from the Admin API endpoint) as an argument
// Returns a JSON response containing the game state data for all the
//  in the given class
module.exports.getClassState = async function getClassState(classID) {
  try {
    let gameStateClassRes = await axios.request({
        url: `/games/v3/gameStateClass?classId=${classID}`,
        method: 'GET',
        baseURL:'https://aquaapi.amplify.com',
        headers: {
          Authorization: auth.bearer
        }
      })
    return gameStateClassRes.data.Students
  } catch (err) {
    console.error(err);
  }
};
