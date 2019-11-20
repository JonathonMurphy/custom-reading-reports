# custom-reading-reports
Node library for custom reading reports

### Setup
* Node.js installed on your machine
* Run 'npm insall' from your /custom-reading-reports/ directory to install dependencies

##### What you'll need

* Inst SID for school(s) that are requesting the report
* Start date to run the report from
* Username and email address of a system access user at the school / district

##### Amending the script
* Open the index.js file
* Put the Inst SID inside the instIDArray as a string (ex; '183636829')
* Put the name of the school/district in the schoolName variable
* Put the start date under options, after 'Time Played since
* Put the start date into the days section of the timeSpentPostData variable
  * Note: The date format is nameOfMonth day, year (ie; October 1, 2019)

###### Giving your script authorization
* Rename auth/auth.blank.json to auth/auth.json
* In two separate windows one regular and one incognito
* Open the network tab of the dev tools in both
* In the regular window impersonate the user and navigate to the [Teacher Dashboard](https://reading.amplify.com/educator/index.html)
  * Search for the timePlayed POST request in the network tab
  * Copy the bearer token from the request header into the bearer section of auth.json
* In the incognito window pull up the masquerading address
  * With the network tab open log in as the teacher
  * Locate the token request and copy the cookie from the header and place it into the auth.json file

Now your index.js file has been setup to pull data from the correct school(s), for the correct start date, and we have our API access setup with our auth.json file. Open a terminal, navigate to the directory that you downloaded this repo and run 'node index.js'. If all went well you should have a csv file in the reports folder with your custom report.

Hit me up if you run into errors or if you just wanna chat.
