const axios = require('axios'),
      auth = require('../auth/auth');

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

module.exports.ClassObject = class CustomReportClassObject {
  constructor(classObj) {
    this.inst = classObj.institution_name;
    this.className = classObj.name;
    this.classID = classObj.classe_uid;
    this.primaryTeacher = `${classObj.official_staff.first_name} ${classObj.official_staff.last_name}`;
    this.students = [];
  }
};

module.exports.StudentObject =  class CustomReportStudentObject {
  constructor(studentObj) {
    this.fullName = studentObj.FullName;
    this.aquaID = studentObj.UserId;
    this.gradeLevel = studentObj.GradeLevel;
    this.timePlayed = undefined;
  }
};

module.exports.CustomReport =  class CustomReportObject {
  constructor(classObj, studentObj) {
    this.inst = classObj.inst;
    this.className = classObj.className;
    this.fullName = studentObj.fullName;
    this.gradeLevel = studentObj.gradeLevel;
    this.timePlayed = studentObj.timePlayed;
    this.primaryTeacher = classObj.primaryTeacher;
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
  return `${hours} hours, and ${minutes} minutes`;
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
