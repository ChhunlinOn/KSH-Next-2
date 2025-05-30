"use client";
import React, { useEffect, useState } from 'react';
import { FaWpforms, FaEdit, FaPlus, FaSearch, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import { MdArrowForward } from 'react-icons/md';
import axios from "axios";
import { getSession } from '@/app/action/clientauth';

const Assessment: React.FC = () => {
  const session = getSession();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({ title: '', url: '' });
  const [showAddAssessmentModal, setShowAddAssessmentModal] = useState(false);
  const [newAssessmentData, setNewAssessmentData] = useState({
    title: '',
    imageUrl: '',
  });
  const [searchName, setSearchName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const token = session?.jwt;

  const fetchAssessments = async () => {
    try {
      const url = `${api_url}/assessments?populate=*`;
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const fetchedData = response.data.data.map((item: any) => ({
        id: item.id,
        title: item.attributes.title,
        google_form_url: item.attributes.google_form_url,
      }));

      setAssessments(fetchedData);
    } catch (error) {
      console.error("Error fetching assessments:", error);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);
  useEffect(() => {
    localStorage.setItem("assessmentCurrentPage", currentPage.toString());
  }, [currentPage]);
  
  const handleEdit = (id: number, current: { title: string; google_form_url: string }) => {
    setEditId(id);
    setEditValues({ title: current.title, url: current.google_form_url });
  };

  const handleSave = async () => {
    if (!editValues.title || !editValues.url) {
      alert('Please fill in both fields.');
      return;
    }
  
    try {
      await axios.put(
        `${api_url}/assessments/${editId}`,
        {
          data: {
            title: editValues.title,
            google_form_url: editValues.url,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const updatedAssessments = assessments.map((item) =>
        item.id === editId
          ? { ...item, title: editValues.title, google_form_url: editValues.url }
          : item
      );
  
      setAssessments(updatedAssessments);
      localStorage.setItem("assessments", JSON.stringify(updatedAssessments));
  
      setEditId(null);
    } catch (error) {
      console.error('Failed to update assessment:', error);
      alert('Something went wrong while saving. Please try again.');
    }
  };
  
  const handleCancel = () => {
    setEditId(null);
  };



  
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this assessment?');
    if (confirmDelete) {
      try {
        await axios.delete(`${api_url}/assessments/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
  
        const updatedAssessments = assessments.filter((item) => item.id !== id);
        setAssessments(updatedAssessments);
  
        localStorage.setItem("assessmentCurrentPage", currentPage.toString());
  
  
        setEditId(null);
      } catch (error) {
        console.error("Error deleting assessment:", error);
        alert("Failed to delete assessment. Please try again.");
      }
    }
  };
  
  const handleSearch = () => {
    setCurrentPage(1);
    setSearchTerm(searchName.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredAssessments = assessments.filter((assessment) =>
    assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    assessment.google_form_url
  );

  const residentsPerPage = 5;
  const totalPages = Math.ceil(filteredAssessments.length / residentsPerPage);
  const currentResidents = filteredAssessments.slice(
    (currentPage - 1) * residentsPerPage,
    currentPage * residentsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleAddAssessment = () => {
    setShowAddAssessmentModal(true);
  };

  const handleCloseModal = () => {
    setShowAddAssessmentModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAssessmentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (newAssessmentData.title && newAssessmentData.imageUrl) {
      const duplicate = assessments.find(
        (assessment) => assessment.title.toLowerCase() === newAssessmentData.title.toLowerCase()
      );
  
      if (duplicate) {
        alert('An assessment with this title already exists. Please use a different title.');
        return; 
      }
  
      try {
        await axios.post(
          `${api_url}/assessments`,
          {
            data: {
              title: newAssessmentData.title,
              google_form_url: newAssessmentData.imageUrl,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        await fetchAssessments();
  
        localStorage.setItem("assessments", JSON.stringify(assessments));
  
        setShowAddAssessmentModal(false);
        setNewAssessmentData({ title: '', imageUrl: '' });
      } catch (error) {
        console.error('Error creating new assessment:', error);
        alert('Failed to add assessment. Please try again.');
      }
    } else {
      alert('Please fill out all fields!');
    }
  };
  

  return (
        <div className="min-h-screen bg-gradient-to-b py-10 px-6 relative">
  <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-center text-green-800 mb-6 drop-shadow-md">
    Assessments Overview
  </h1>

<div className="w-full max-w-7xl mx-auto mb-4 px-2">
<form
onSubmit={(e) => {
  e.preventDefault();
  handleSearch();
}}
className="flex w-full gap-2 flex-nowrap"
>
<input
  type="text"
  placeholder="Search by assessment name"
  value={searchName}
  onChange={(e) => {
    const value = e.target.value;
    setSearchName(value);
    setCurrentPage(1);
    setSearchTerm(value.trim());
  }}
  className="flex-grow min-w-0 border border-gray-400 rounded-md
  py-[10px] px-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
/>
<button
  type="submit"
  className="bg-green-700 hover:bg-green-800 text-white
  rounded-md flex items-center gap-2 whitespace-nowrap
  min-w-[80px] py-2 lg:py-2 px-3 lg:px-4 text-sm lg:text-base"
>
  <FaSearch className="text-sm" />
  Search
</button>
</form>
</div>



  <div className="w-full max-w-7xl mx-auto grid gap-8">
  {currentResidents.map((assessment) => (

      <div
        key={assessment.id}
        className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 px-8 py-6 space-y-4 sm:space-y-0"
      >
        <div className="flex items-center gap-4 sm:gap-6 flex-1">
          <div className="bg-green-100 text-green-700 p-4 rounded-full text-lg sm:text-2xl">
            <FaWpforms />
          </div>
          <div className="flex flex-col w-full">
            <div className="text-gray-900 font-semibold text-sm sm:text-base md:text-xl">
              {assessment.title}
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-end items-center gap-4 sm:gap-6 w-full sm:w-auto">
          <button
            onClick={() => handleEdit(assessment.id, assessment)}
            className="bg-blue-600 text-white text-sm sm:text-base px-3 py-2 rounded hover:bg-blue-700 transition"
          >
            <FaEdit className="text-xs sm:text-lg" />
          </button>

          <a
            href={assessment.google_form_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-green-700 text-sm sm:text-base font-semibold hover:text-green-900 transition whitespace-nowrap"
          >
            Open <MdArrowForward className="text-xl sm:text-2xl" />
          </a>
        </div>
      </div>
    ))}
  </div>
  <div className="flex justify-center items-center mt-8 gap-4 flex-wrap">
      <button
        onClick={prevPage}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-md text-white ${
          currentPage === 1
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-700'
        }`}
      >
        Previous
      </button>
      <span className="text-base font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={nextPage}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-md text-white ${
          currentPage === totalPages
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-700'
        }`}
      >
        Next
      </button>
    </div>

  <div
    onClick={handleAddAssessment}
    className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg shadow cursor-pointer border border-dashed border-gray-400 hover:bg-gray-50 mt-5 w-full max-w-7xl mx-auto"
  >
    <FaPlus className="text-green-600" />
    <span className="text-sm font-medium text-green-600">Add New Assessment</span>
  </div>

  {showAddAssessmentModal && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2 sm:px-4">
<div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl p-6 bg-white rounded-2xl shadow-2xl">
  <button
    onClick={handleCloseModal}
    className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-red-500"
  >
    &times;
  </button>

  <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 text-green-800">Add New Assessment</h3>

  <div className="flex flex-col gap-4">
    <input
      type="text"
      name="title"
      placeholder="Enter Assessment Title"
      value={newAssessmentData.title}
      onChange={handleInputChange}
      className="p-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
    />
    <input
      type="text"
      name="imageUrl"
      placeholder="Enter Google Form URL"
      value={newAssessmentData.imageUrl}
      onChange={handleInputChange}
      className="p-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  </div>

  <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
    <button
      onClick={handleCloseModal}
      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-md w-full sm:w-auto"
    >   <FaTimes className="inline mr-2" />
      Cancel
    </button>
    <button
      onClick={handleSubmit}
      className="bg-green-800 hover:bg-green-700 text-white px-5 py-2 rounded-md w-full sm:w-auto"
    >
      Add
    </button>
  </div>
</div>
</div>
)}

 

{editId !== null && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2 sm:px-4">
<div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl p-6 bg-white rounded-2xl shadow-2xl">
  <button
    onClick={handleCancel}
    className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-red-500"
  >
    &times;
  </button>

  <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-green-800">Edit Assessment</h2>

  <input
    className="border border-gray-300 rounded px-4 py-3 w-full mb-4 text-sm sm:text-base"
    value={editValues.title}
    onChange={(e) => setEditValues((prev) => ({ ...prev, title: e.target.value }))}
    placeholder="Assessment Title"
  />
  <input
    className="border border-gray-300 rounded px-4 py-3 w-full mb-6 text-sm sm:text-base"
    value={editValues.url}
    onChange={(e) => setEditValues((prev) => ({ ...prev, url: e.target.value }))}
    placeholder="Google Form URL"
  />

  <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
      <button
        onClick={handleCancel}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-md w-full sm:w-auto"
      >
        <FaTimes className="inline mr-2" /> Cancel
      </button>
      <button
        onClick={() => handleDelete(editId!)}
        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md w-full sm:w-auto"
      >
        <FaTrash className="inline mr-2" /> Delete
      </button>
    </div>

    <button
      onClick={handleSave}
      className="bg-green-800 hover:bg-green-700 text-white px-5 py-2 rounded-md w-full sm:w-auto"
    >
      <FaSave className="inline mr-2" /> Save
    </button>
  </div>
</div>
</div>
)}

</div>
);;
};

export default Assessment;
