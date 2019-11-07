'use strict'
const fs = require('fs'),
      axios = require('axios'),
      es = require('event-stream'),
      jsoncsv = require('json-csv'),
      crr = require('./lib/custom-reading-reports'),
      // Name of the school or district that the report is for
      schoolName = 'O Melveny Elementary',
      // Enter all Inst SID's that are being used to pull the report
      instIDArray = ['301562928'], // Takes Inst SID's as strings
      options = {fields: [
          {name: 'inst', label: 'Institution'},
          {name: 'className', label: 'Class Name'},
          {name: 'primaryTeacher', label: 'Primary Teacher of Class'},
          {name: 'fullName', label: 'Students Name'},
          {name: 'gradeLevel', label: 'Grade Level'},
          {name: 'timePlayed', label: 'Time Played since September 11, 2019'}
        ]};

// These will all be left empty
let res, classe, student, classObj,
    classArray = [],
    studentArray = [],
    studentHashMap = {};

let timeSpentPostData = {
  StudentIds : [],
  Days: crr.daysSince('September 11, 2019')
};

(async () => {
  // Pull class data from admin and make a new object with it
  // Note: Does not pull any student data
  let classDataRes = await crr.getClassData(instIDArray);
  for (classe of classDataRes.classes) {
    let tempObj = new crr.ClassObject(classe);
    classArray.push(tempObj);
  };
  // Get the student data from the Aqua servers using the class eid's
  for (classObj of classArray) {
    let classStateRes = await crr.getClassState(classObj.classID);
    for (student of classStateRes) {
      studentHashMap[student.UserId] = new crr.StudentObject(student, classObj);
      timeSpentPostData.StudentIds.push(student.UserId);
    };
  };
  // Pull the usage time for all the students and
  // add it to the students entries in the hashmap
  let timeSpentRes = await crr.getUsageStats(timeSpentPostData);
  for (res of timeSpentRes) {
    studentHashMap[res.user_id].timePlayed = crr.secondsToHoursAndMinutes(res.duration);
  };
  // Extracts the student values from the hashmap and places them
  // into an array for export to csv
  for (student of Object.values(studentHashMap)) {
    studentArray.push(student);
  };
  let out = fs.createWriteStream(`./reports/${schoolName} Custom Report.csv`, {encoding: 'utf8'});
  let readable = es.readArray(studentArray);
  readable
    .pipe(jsoncsv.csv(options))
    .pipe(out);
})();
