import React, { useState } from "react";
import { uploadVideo } from "../services/detectionService";


export default function UploadPanel({ onResult }) {

    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            setSelectedFile(file);
            setError("");
        }
    };


    const handleUpload = async () => {

        if (!selectedFile) {
            setError("Please select a video first.");
            return;
        }


        try {

            setLoading(true);
            setError("");


            const result = await uploadVideo(selectedFile);


            console.log(
                "Detection Result:",
                result
            );


            if (onResult) {
                onResult(result);
            }


        } catch (err) {

            console.error(
                "Upload failed:",
                err
            );

            setError(
                err.response?.data?.error ||
                "Video processing failed"
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div
            className="panel"
            style={{
                padding: "1.5rem"
            }}
        >

            <h3>
                Upload Crowd Video
            </h3>


            <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
            />


            {selectedFile && (
                <p>
                    Selected:
                    {" "}
                    {selectedFile.name}
                </p>
            )}


            <button
                className="btn-primary"
                onClick={handleUpload}
                disabled={loading}
                style={{
                    marginTop:"1rem"
                }}
            >

                {loading
                    ? "Processing AI..."
                    : "Analyze Video"
                }

            </button>


            {error && (

                <p
                    style={{
                        color:"red",
                        marginTop:"1rem"
                    }}
                >
                    {error}
                </p>

            )}

        </div>

    );
}