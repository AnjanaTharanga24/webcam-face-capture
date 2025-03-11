import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import '../css/WebcamCapture.css';

export default function WebcamCapture() {
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [imageSource, setImageSource] = useState('webcam'); // 'webcam' or 'device'
  const [zoomLevel, setZoomLevel] = useState(1); // Default zoom level is 1 (no zoom)

  // Capture with zoom applied
  const capture = useCallback(() => {
    if (webcamRef.current) {
      // Get webcam dimensions
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Create a canvas with the same dimensions as the video
      const canvas = document.createElement('canvas');
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const ctx = canvas.getContext('2d');

      // Calculate the scaled dimensions based on the zoom level
      const scaledWidth = videoWidth / zoomLevel;
      const scaledHeight = videoHeight / zoomLevel;

      // Calculate the offset to center the zoomed area
      const offsetX = (videoWidth - scaledWidth) / 2;
      const offsetY = (videoHeight - scaledHeight) / 2;

      // Draw the zoomed portion of the video onto the canvas
      ctx.drawImage(
        video,
        offsetX, // Source X
        offsetY, // Source Y
        scaledWidth, // Source width
        scaledHeight, // Source height
        0, // Destination X
        0, // Destination Y
        videoWidth, // Destination width
        videoHeight // Destination height
      );

      // Get the image data URL
      const imageSrc = canvas.toDataURL('image/jpeg');
      setImage(imageSrc);
      setImageSource('webcam');
      setUploadSuccess(false);
    }
  }, [zoomLevel]);

  const resetImage = () => {
    setImage(null);
    setUploadSuccess(false);
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setImageSource('device');
        setUploadSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const uploadImage = async () => {
    if (image) {
      setUploading(true);
      
      try {
        // Convert base64 to blob before uploading
        const blob = await fetch(image).then(r => r.blob());
        const filename = imageSource === 'webcam' ? "webcam-capture.jpg" : "device-upload.jpg";
        
        const formData = new FormData();
        formData.append("file", blob, filename);

        const response = await axios.post("http://localhost:8080/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Image uploaded successfully:", response.data);
        setUploadSuccess(true);
      } catch (error) {
        console.error("Error uploading image:", error);
        // Add error state handling here if needed
      } finally {
        setUploading(false);
      }
    }
  };

  const handleUserMediaError = (error) => {
    setCameraError("Could not access the camera. Please ensure your camera is connected and permissions are granted.");
    console.error("Camera error:", error);
  };

  // Handle zoom level change
  const handleZoomChange = (e) => {
    setZoomLevel(parseFloat(e.target.value));
  };

  return (
    <div className="webcam-capture-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card webcam-card">
              <div className="card-header">
                <h2 className="text-center">Capture Moment</h2>
              </div>
              <div className="card-body">
                {!image ? (
                  <div className="webcam-container">
                    {cameraError ? (
                      <div className="camera-error">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                        <p>{cameraError}</p>
                        <button 
                          onClick={triggerFileInput}
                          className="btn btn-primary mt-3"
                        >
                          <i className="bi bi-folder-fill me-2"></i>
                          Upload from Device Instead
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="webcam-wrapper">
                          <div className="webcam-inner" style={{ transform: `scale(${zoomLevel})` }}>
                            <Webcam
                              audio={false}
                              ref={webcamRef}
                              screenshotFormat="image/jpeg"
                              videoConstraints={videoConstraints}
                              className="webcam-video"
                              onUserMediaError={handleUserMediaError}
                            />
                          </div>
                          <div className="webcam-overlay">
                            <div className="frame-corners">
                              <div className="corner top-left"></div>
                              <div className="corner top-right"></div>
                              <div className="corner bottom-left"></div>
                              <div className="corner bottom-right"></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Zoom control slider */}
                        <div className="zoom-control">
                          <div className="zoom-label">
                            <i className="bi bi-zoom-out"></i>
                            <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
                            <i className="bi bi-zoom-in"></i>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.1"
                            value={zoomLevel}
                            onChange={handleZoomChange}
                            className="zoom-slider"
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="capture-options">
                      {!cameraError && (
                        <>
                          <button 
                            onClick={capture}
                            className="btn btn-capture"
                            aria-label="Take photo"
                          >
                            <i className="bi bi-camera-fill"></i>
                          </button>
                          
                          <div className="option-divider">
                            <span>OR</span>
                          </div>
                        </>
                      )}
                      
                      <button 
                        onClick={triggerFileInput}
                        className="btn btn-upload"
                      >
                        <i className="bi bi-folder-fill me-2"></i>
                        Upload from Device
                      </button>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="preview-container">
                    <div className="preview-image-wrapper">
                      <img 
                        src={image} 
                        alt="Captured" 
                        className="preview-image"
                      />
                      {uploadSuccess && (
                        <div className="upload-success-overlay">
                          <div className="success-message">
                            <i className="bi bi-check-circle-fill"></i>
                            <span>Upload Complete!</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="action-buttons">
                      <button 
                        onClick={resetImage}
                        className="btn btn-secondary"
                        aria-label="Retake photo"
                      >
                        <i className="bi bi-arrow-counterclockwise me-2"></i>
                        Retake
                      </button>
                      
                      <button 
                        onClick={uploadImage}
                        disabled={uploading || uploadSuccess}
                        className="btn btn-primary"
                      >
                        {uploading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Uploading...
                          </>
                        ) : uploadSuccess ? (
                          <>
                            <i className="bi bi-check-circle-fill me-2"></i>
                            Uploaded
                          </>
                        ) : (
                          <>
                            <i className="bi bi-cloud-arrow-up-fill me-2"></i>
                            Upload Image
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="card-footer text-center">
                <p className="mb-0">Capture your perfect moment or upload from your device</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}