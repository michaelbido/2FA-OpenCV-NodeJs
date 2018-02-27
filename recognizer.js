// import packages
// opencv4nodejs contains the facial recongizers, trainers and cascades
// fs for file system
// path to get the path of files
const cv = require('opencv4nodejs');
const fs = require('fs');
const path = require('path');

// set the cascade classifier for the file
const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
// detect the face within the grey image.
const getFaceImage = (grayImage) => {
  const faceRects = classifier.detectMultiScale(grayImage).objects;
  if (!faceRects.length) {
    throw new Error('No faces found in the photo');
  }
  return grayImage.getRegion(faceRects[0]);
};
// get the path of the photo directory
const basePath = '../twoFactorAuthBido/images_db';
const subjectsPath = path.resolve(basePath, 'subjects');
const nameMappings = ['conan', 'michael', 'thomas'];
// get the absolute path
const allFiles = fs.readdirSync(subjectsPath);

// to see if .DS_store is causing an error
//console.log(allFiles.map(file => path.resolve(subjectsPath, file)))

// map absolute file path for all images,
// then map all the images for reading for using OpenCV
// then turn the image gray, and then resize
// resizing is required for eigen and fisher faces
const images = allFiles
  .map(file => path.resolve(subjectsPath, file))
  .map(filePath => cv.imread(filePath))
  .map(image => image.bgrToGray())
  .map(getFaceImage)
  .map(faceImg => faceImg.resize(100, 100));

  //
const isTargeImage = (_, i) => allFiles[i].includes('111');
const isTrainingImage = (_, i) => !isTargeImage(_, i);
// use images without the label for training the recognizer
const trainImages = images.filter(isTrainingImage);
// use images with the label for testing the recognizer
const testImages = images.filter(isTargeImage);
// make labels
const labels = allFiles.filter(isTrainingImage)
  .map(file => nameMappings.findIndex(name => file.includes(name)));

//algorithms for facial recognition
// const fisher = new cv.FisherFaceRecognizer();
// fisher.train(trainImages, labels);
// const eigen = new cv.EigenFaceRecognizer();
// eigen.train(trainImages, labels);
const lbph = new cv.LBPHFaceRecognizer();
lbph.train(trainImages, labels);

//var confValue = 0;

const runPrediction = (recognizer) => {
  testImages.forEach((img) => {
    //console.log(img);
    const result = recognizer.predict(img);
    confValue = result.confidence;
    console.log('predicted: %s, confidence: %s', nameMappings[result.label], result.confidence);
    cv.imshowWait('face', img);
    cv.destroyAllWindows();
  });
};

// console.log('fisher:');
// runPrediction(fisher);

// console.log('eigen:');
// runPrediction(eigen);

console.log('lbph:');
runPrediction(lbph);