'use strict'
const fs = require('fs'),
      axios = require('axios'),
      es = require('event-stream'),
      jsoncsv = require('json-csv'),
      crr = require('./lib/custom-reading-reports'),
      schoolName = '',
      instIDArray = [],
      options = {fields: [
          {name: 'inst', label: 'Institution'},
          {name: 'className', label: 'Class Name'},
          {name: 'fullName', label: 'Students Name'},
          {name: 'gradeLevel', label: 'Grade Level'},
          {name: 'timePlayed', label: 'Time Played since October 2, 2019'},
          {name: 'primaryTeacher', label: 'Primary Teacher of Class'}
        ]};

let obj, res, classe, student;
let classArray = [];
let customReport = [];
let timeSpentPostData = {
  StudentIds : [],
  Days: crr.daysSince('October 2, 2019')
};

(async () => {
  let classDataRes = await crr.getClassData(instIDArray);
  for (classe of classDataRes.classes) {
    let tempObj = new crr.ClassObject(classe);
    classArray.push(tempObj);
  };
  for (classe of classArray) {
    let classStateRes = await crr.getClassState(classe.classID);
    for (student of classStateRes) {
      let tempObj = new crr.StudentObject(student);
      classe.students.push(tempObj);
      timeSpentPostData.StudentIds.push(tempObj.aquaID);
    };
  };
  let timeSpentRes = await crr.getUsageStats(timeSpentPostData);
  for (res of timeSpentRes) {
    for (classe of classArray) {
      for (student of classe.students) {
        if (res.user_id == student.aquaID) {
          student.timePlayed = crr.secondsToHoursAndMinutes(res.duration);
          // Re-organize into a structure parsable by json-csv
          let tempObj = new crr.CustomReport(classe, student);
          customReport.push(tempObj);
        };
      };
    };
  };
  let out = fs.createWriteStream(`./reports/${schoolName}CustomReport.csv`, {encoding: 'utf8'});
  let readable = es.readArray(customReport);
  readable
    .pipe(jsoncsv.csv(options))
    .pipe(out);
})();
