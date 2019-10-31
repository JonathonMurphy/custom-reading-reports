'use strict'
const fs = require('fs'),
      axios = require('axios'),
      es = require('event-stream'),
      jsoncsv = require('json-csv'),
      crr = require('./lib/custom-reading-reports'),
      // Name of the school or district that the report is for
      schoolName = '',
      // Enter all Inst SID's that are being used to pull the report
      instIDArray = [],
      options = {fields: [
          {name: 'inst', label: 'Institution'},
          {name: 'className', label: 'Class Name'},
          {name: 'primaryTeacher', label: 'Primary Teacher of Class'},
          {name: 'fullName', label: 'Students Name'},
          {name: 'gradeLevel', label: 'Grade Level'},
          {name: 'timePlayed', label: 'Time Played since October 2, 2019'}
        ]};

// These will all be left empty
let obj, res, classe, student;
let classArray = [];
let studentArray = [];

let timeSpentPostData = {
  StudentIds : [],
  Days: crr.daysSince('October 2, 2019')
};

(async () => {
  // Pull class data from admin and make a new object with it
  // Does not pull any student data
  let classDataRes = await crr.getClassData(instIDArray);
  for (classe of classDataRes.classes) {
    let tempObj = new crr.ClassObject(classe);
    classArray.push(tempObj);
  };
  // Get the student data from the Aqua servers using the class eid's
  for (classObj of classArray) {
    let classStateRes = await crr.getClassState(classObj.classID);
    for (student of classStateRes) {
      let tempObj = new crr.StudentObject(student, classObj);
      studentArray.push(tempObj);
      timeSpentPostData.StudentIds.push(tempObj.aquaID);
    };
  };
  // Pull the usage time for all the students and
  // merge the two arrays (timeSpentRes and studentArray)
  // together
  let timeSpentRes = await crr.getUsageStats(timeSpentPostData);
  for (res of timeSpentRes) {
    for (student of studentArray) {
      if (res.user_id == student.aquaID) {
        student.timePlayed = crr.secondsToHoursAndMinutes(res.duration);
      };
    };
  };

  let out = fs.createWriteStream(`./reports/${schoolName}CustomReport.csv`, {encoding: 'utf8'});
  let readable = es.readArray(studentArray);
  readable
    .pipe(jsoncsv.csv(options))
    .pipe(out);
})();
