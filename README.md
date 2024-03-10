# App description

- This mobile application represents the alarm clock, similar to Google's alarm clock
- App allows to set alarms, name them and assign a songs to them if necessary
- Songs can be uploaded to the app and can be played in the app

# Development info

- App was being developed in the period april 2022
- App was uploaded from school repository to this repository in may 2022, which was at the end in the last year of secondary school
- In august 2023, outdated packages were updated, starting from commit [eab9c64](https://github.com/JanDostal/spsse-web-react-native-wake-app/commit/eab9c64c4e8a7047b72ec3e39e251662e9c9fa67)

# App design

- There is a database containing two tables: Songs, Times
- Each entry in the Times table contains the alarm trigger time (precision in minutes, not seconds), the specified days (Mon - Sun, implemented as numbers or enum), a description of the alarm, an optional song and the status of the alarm (active or deactivated)
- Each entry in the Songs table contains the song name, file path to the song on a device and song duration (duration precision in seconds)
- If a entry from the Times table does not have a song, the vibration is used
- The app is divided into alarms section and songs section (UI)
- In the songs section it is possible to select song from the device (picker) and then add it to the database with the obtained information about song (it is possible to play a sample of the song)
- In the songs section it is possible to choose alarm trigger time (picker) and choose specific days by radio buttons
- Repeatedly every 3 seconds, a query is made to the database, which compares the current time and the current day of the week with all entries in Times table in the database and if a match is found, an alarm for the given Times table entry is triggered in the app

# Instructions for starting app

1. It is ideal to open a dedicated command line in a given operating system
2. On the command line, change the current directory to a directory representing this repository
3. Then enter the command ***npm install***
4. Enter command ***npx expo start***
5. According to the manual on https://reactnative.dev/docs/environment-setup?guide=quickstart install the **Expo Go** app on mobile phone and then scan the QR code in the command line using the downloaded app

- The source code can be viewed using **Visual Studio Code**, the used tool is **React Native**
