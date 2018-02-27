var express = require('express');
const cv = require('opencv4nodejs');
var path = require('path');
const fs = require('fs');
var bodyParser = require('body-parser')
// declare that express is being used
var app = express();
// get the absolute path of the files being sent
var absolutePath = path.resolve('../public','index.html');  
//console.log(absolutePath);

// for middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(bodyParser.json({limit: "50mb"}));
// serve the main page at first
app.get('/index.html', function (req, res) {
    console.log("user requested index page");
    res.sendFile(__dirname + "/" + "index.htm");
    // res.sendFile(absolutePath);
})
// once the user requests a login
app.get('/login', function (req, res) {
    // Prepare output in JSON format
    // Place username and password
    response = {
        username:req.query.username,
        password:req.query.password
    };
    console.log("user sent login information");
    console.log(response);
    // test if input is valid, if so, next phase
    if (response.username == "michael" && response.password == "bido") {
        res.sendFile(__dirname + "/public/index2.html");
    }
    // else send the original webpage back to the user
    else {
        res.sendFile(__dirname + "/public/index.html")
    }
});
// set confidence values and the image label that will be
// determined by the face recognition algorithm
var confValue = 0;
var imgLabel = "";
// if user uploads image for facial recognition
app.post('/upload', async (req, res, next) => {

    try {
        var response = {
            fileData:req.body.fileData,
        };
        console.log("user sent photo information");
        // get the base64 encoding of the sent image
        var data = response.fileData;
        // remove misc information sent with it
        var imgData = data.replace(/^data:image\/png;base64,/, "");
        // output for testing
        console.log(imgData);

        // save the encoded png to a file called output
        require("fs").writeFile("images_db/subjects/output.png", imgData, "base64", function(err) {
            console.log(err);
        });
        // wait for image to be processed, then apply facial recognition
        setTimeout(checkFace, 500);
        // if within threshold value and name matches username, then send the final page, else reset
        setTimeout(function() {
            if (confValue < 90.0 && imgLabel == "michael") {
                res.sendFile(__dirname + "/public/final.html");
            }
            else {
                res.sendFile(__dirname + "/public/index.html");
            }
        }, 500);

    } catch (e) {
        next(e)
    }

});
// spin up the server at port 8081
var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Magic is happening at http://%s:%s", host, port)
});


// facial recognition algo
async function checkFace() {
    // set the cascade classifier for the file
    const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
    // detect the face within the grey image.
    const getFaceImage = (grayImage) => {
        const faceRegion = classifier.detectMultiScale(grayImage).objects;
        if (!faceRegion.length) {
            throw new Error('No faces found in the photo');
        }
        return grayImage.getRegion(faceRegion[0]);
    };
    // get the path of the photo directory
    const basePath = '../twoFactorAuthBido/images_db';
    const subjectsPath = path.resolve(basePath, 'subjects');
    const nameMappings = ['conan', 'michael', 'unknwn'];
    // get the absolute path
    const allFiles = fs.readdirSync(subjectsPath);    

    // to see if .DS_store is causing an error
    //console.log(allFiles.map(file => path.resolve(subjectsPath, file)))

    // map absolute file path for all images,
    // then map all the read the image using openCV
    // then turn the image gray, and then resize
    // resizing is required for eigen and fisher faces
    const images = allFiles
        .map(file => path.resolve(subjectsPath, file))
        .map(filePath => cv.imread(filePath))
        .map(image => image.bgrToGray())
        .map(getFaceImage)
        .map(faceImg => faceImg.resize(100, 100));

    const isTargetImage = (_, i) => allFiles[i].includes('output');
    const isTrainingImage = (_, i) => !isTargetImage(_, i);
    // use images without the label for training the recognizer
    const trainImages = images.filter(isTrainingImage);
    // use images with the label for testing with the recognizer
    const testImages = images.filter(isTargetImage);
    // map all names of people to images of them, based on filename
    const labels = allFiles.filter(isTrainingImage)
        .map(file => nameMappings.findIndex(name => file.includes(name)));
    // use local binary patterns histograms algo
    const lbph = new cv.LBPHFaceRecognizer();
    // train the images
    lbph.train(trainImages, labels);
    // run the recognizer
    const runPrediction = (recognizer) => {
        testImages.forEach((image) => {
            //console.log(img);
            const result = recognizer.predict(image);
            confValue = result.confidence;
            imgLabel = nameMappings[result.label]
            console.log('Predicted Individual: %s, Confidence Distance: %s', imgLabel, confValue);
        });
    };
    // output results
    console.log('lbph:');
    runPrediction(lbph);
}