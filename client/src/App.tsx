import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

const App: React.FC = () => {
     // State variables to manage file upload and user roles
  const [file, setFile] = useState<File | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [uploadedFileId, setUploadedFileId] = useState<number |null>(null)
  const [role, setRole] = useState<'role1' | 'role2' | 'role3' | ''>('');
  const [role1Email, setRole1Email] = useState('');
  const [role2Email, setRole2Email] = useState('');
  const [role3Email, setRole3Email] = useState('');
  const [role1Name, setRole1Name] = useState('');
  const [role2Name, setRole2Name] = useState('');
    const [role3Name, setRole3Name] = useState('');
    const [role2Id, setRole2Id] = useState(null)
    const [role3Id, setRole3Id] = useState(null)

     // Dropzone configuration for file upload
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => setFile(acceptedFiles[0]),
  });
// Function to handle file upload
 const uploadFile = async () => {
  if (!file) {
    alert('Please select a file.');
    return;
  }
   // Validate required fields for Role 1
  if (!role1Email || !role2Email || !role1Name) {
    alert('All fields are required for Role 1.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('role1Email', role1Email);
  formData.append('role2Email', role2Email);
  formData.append('role1Name', role1Name);

     try {
      // Send the file and user details to the server
    const response = await axios.post('http://localhost:3001/pdf/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // console.log("Upload Response:", response.data); // Debugging
        //Set the uploaded file name and ID from the response
      setUploadedFileName(response.data.filename);
      setUploadedFileId(response.data.res.document.id)

    // Extract recipients safely
    const recipients = response.data.res?.document.recipients;
    if (recipients && recipients.length > 1) {
      setRole2Id(recipients[1].id || null); // Fallback to empty string if undefined
    } else {
      console.warn("Role 2 recipient not found in response.");
    }
      
  } catch (error) {
    console.error('Upload error:', error);
  }
};

     // Function to create a new recipient for Role 3
  const createRecipient = async () => {
    if (!uploadedFileId || !role3Email) {
      alert('All fields are required for Role 2.');
      return;
    }
    
      try {
         // Send request to create a new recipient
     const res = await axios.post('http://localhost:3001/pdf/recipients/create', {
        documentId: uploadedFileId,
        role3Email,
      });
        // console.log("createRecipient", res.data)
        setRole3Id(res.data.id)
      alert('Recipient added successfully');
    } catch (error) {
      console.error('Error creating recipient:', error);
    }
  };
// Function to update recipient information
  const updateRecipient = async (name: string) => {
    if (!uploadedFileId || !name) {
      alert('All fields are required.');
      return;
    }
    
      try {
        // Send request to update recipient information
     const res=  await axios.post('http://localhost:3001/pdf/recipients/update', {
        documentId: uploadedFileId,
        name,
        recipientId: role === 'role2' ? role2Id:role3Id,
      });
        alert('Signed successfully');
        // console.log("updateRecipient",res.data)
    } catch (error) {
      console.error('Error updating recipient:', error);
    }
  };
//   console.log("id",role2Id,role3Id,"role2 name", role2Name, "role3name",role3Name)
  return (
    
      <div className="p-6 bg-gray-100">
  <h1 className="text-2xl font-bold mb-4">E-Sign Workflow</h1>
  <select value={role} onChange={(e) => setRole(e.target.value as any)} className="mb-4 p-2 border border-gray-300 rounded">
    <option value=''>Select Role</option>
    <option value='role1'>Role 1 - Upload & Tag</option>
    <option value='role2'>Role 2 - Sign & Forward</option>
    <option value='role3'>Role 3 - Final Sign</option>
  </select>
{/* Role 1: Upload & Tag */}
  {role === 'role1' && (
    <div className="mb-4">
      <div {...getRootProps()} className="border border-black p-4 mb-2">
        <input {...getInputProps()} />
        {file ? <p>{file.name}</p> : <p className="text-gray-500">Drag & drop a PDF here, or click to select one</p>}
      </div>
      <input type='text' placeholder='Your Name' value={role1Name} onChange={(e) => setRole1Name(e.target.value)} className="mb-2 p-2 border border-gray-300 rounded" />
      <input type='email' placeholder='Your Email' value={role1Email} onChange={(e) => setRole1Email(e.target.value)} className="mb-2 p-2 border border-gray-300 rounded" />
      <input type='email' placeholder='Role 2 Email' value={role2Email} onChange={(e) => setRole2Email(e.target.value)} className="mb-2 p-2 border border-gray-300 rounded" />
      <button onClick={uploadFile} className="bg-blue-500 text-white p-2 rounded">Upload & Send</button>
    </div>
  )}
{/* Role 2: Sign & Forward */}
  {role === 'role2' && uploadedFileId && (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Sign & Forward</h2>
      <input type='text' placeholder='Your Name' value={role2Name} onChange={(e) => setRole2Name(e.target.value)} className="mb-2 p-2 border border-gray-300 rounded" />
      <input type='email' placeholder='Role 3 Email' value={role3Email} onChange={(e) => setRole3Email(e.target.value)} className="mb-2 p-2 border border-gray-300 rounded" />
      <button onClick={() => updateRecipient(role2Name)} className="bg-green-500 text-white p-2 rounded">Sign</button>
      <button onClick={createRecipient} className="bg-yellow-500 text-white p-2 rounded ml-2">Forward</button>
    </div>
  )}

  {role === 'role3' && uploadedFileId && (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Final Sign</h2>
      <input type='text' placeholder='Your Name' value={role3Name} onChange={(e) => setRole3Name(e.target.value)} className="mb-2 p-2 border border-gray-300 rounded" />
      <button onClick={() => updateRecipient(role3Name)} className="bg-red-500 text-white p-2 rounded">Final Sign</button>
    </div>
  )}

  {uploadedFileId && (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Preview PDF</h2>
      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
        <Viewer fileUrl={`http://localhost:3001/pdf/preview/${uploadedFileName}`} />
      </Worker>
    </div>
  )}
</div>
  );
};

export default App;
