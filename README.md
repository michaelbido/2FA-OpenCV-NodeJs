# Login Authentication via Facial Recognition, OpenCV
## Two factor authentication via password and OpenCV Face Recognition

Name       : Michael Bido-Chavez
Class      : CSCE 4550

## Project Synopsis
### This project will be updated Feb. 2019, WIP
This project is under the biometric portion of security which measures human characteristics
for authentication. This is important since, as hackers attempt to find new ways to break
into accounts belonging to other users, computer security experts must find other ways 
to prevent them from doing so. Having multiple levels of authentication can help do that
(e.g. making a user enter a special code sent to their phone when they log in from a new 
device for the first time). Employing biometrics as an additional level of authentication 
to ensure that the correct user is accessing certain information will improve security.

This project is about using live face detection and recognition as authentication to login 
to an account. As a user will attempt to log in, they will be asked to take a picture to proceed.
That picture’s data will be used to determine if they are in fact a valid user.

## Requirements and Installation

You must have OpenCV installed on your system, as well as Node v9.2.0.
Then, you must install all of the required modules. This is done by the following line:

```
npm install
```

## How to Execute

Run the server before connecting to http://127.0.0.1:8081/index.html
within a web browser. While within the directory, type 
the following line to start the server:

```
node server.js
```

For the server, press Control+C to stop the server and end the process.
You can access the web-app by connecting to http://127.0.0.1:8081/index.html.
This does require a webcam to work.

## Useful Sources for This Project

https://docs.opencv.org/2.4/modules/contrib/doc/facerec/facerec_tutorial.html
https://docs.opencv.org/2.4/doc/tutorials/objdetect/cascade_classifier/cascade_classifier.html
https://www.npmjs.com/package/opencv4nodejs
https://nodejs.org/dist/latest-v8.x/docs/api/
https://expressjs.com/en/4x/api.html
