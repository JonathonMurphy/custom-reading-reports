module.exports = function endpoints (classID = undefined, staffID = undefined) {
return {
    // as GET requests
    gameStateClass: `/games/v3/gameStateClass?classId=${classID}`, // to get all game states for all students in the class
    contentSets: `/content/v3/content-sets`, // to get static content sets per skill
    gameContentSets: `/content/v3/gameContentSets`, // to get static content sets per game
    profileBulk: `/profiles/v3/profileBulk?userIds=`, // to get student profiles
    classes: `/users/v3/classes?staffId=${staffID}&classId=${classID}`, //to get student enrollment data for the students in the class
    // as POST request
    tfeResults: `/results/v3/tfeResults`, // as POST with StudentIds to get students’ TFE results
    timeSpentInGames: `/results/v3/timeSpentInGames`, // as POST with StudentIds and Days to get time-spent-in-app for each student
    studentDibels: `/mclass-proxy-api/v3/studentDibels`, // as POST with studentIds and institutionId to get DIBELS results for the students
  };
}
