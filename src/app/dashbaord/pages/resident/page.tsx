"use client";
import React, { useState,useEffect } from "react";
import BoxResident from "../../../component/boxResident";
import DropdownYearResident from "../../../component/dropDownYearResident";
import { FaPlus, FaTimes, FaSearch } from "react-icons/fa";
import { getSession } from "@/app/action/clientauth";

const ResidentList: React.FC = () => {
    const session = getSession();
  const api_url = process.env.NEXT_PUBLIC_API_URL; 
  const token = session?.jwt;
  console.log("API URL:", api_url);
  console.log("Token:", token);
  const [residents, setResidents] = useState<any[]>([]);
  const [totalresident, settotalResident] = useState(0);
  const [selectedYear, setSelectedYear] = useState("2025");
  const [type, setType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  console.log("Current Page:", currentPage);
  const [showAddResidentModal, setShowAddResidentModal] = useState(false);

 const handlefetchResident = async () => {
  try {
    let url = "";

    if (type === "all") {
      url = `${api_url}/beneficiaries?populate=profile_img_url&pagination[page]=1&pagination[pageSize]=1000`;
    } else {
      url = `${api_url}/curriculum-program-levels?filters[program_level][program_level_name][$eq]=Level%20${type}&filters[curriculum][end_date][$lte]=${selectedYear}-12-31&populate[residents][populate]=profile_img_url&populate=*`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched data:", data.data);

    if (type === "all") {
      settotalResident(data.data.length);
      setResidents(data.data);
    } else {
      settotalResident(data.data[0]?.attributes?.residents?.data.length || 0);
      setResidents(data.data[0]?.attributes?.residents?.data || []);
    }

  } catch (error) {
    console.error("Error fetching residents:", error);
  }
};

useEffect(() => {
  setCurrentPage(1);
}, [type, selectedYear]);

useEffect(() => {
  handlefetchResident();
}, [type, selectedYear, currentPage]);

  const [newResidentData, setNewResidentData] = useState({
    name: "",
    age: "",
  });

  const [searchName, setSearchName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const residentsPerPage = 10;

  const filteredResidents = residents.filter((r) => {
    const matchName = searchTerm
      ? r.attributes.fullname_english.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchName;
  });

   const totalResidents = filteredResidents.length;

  const totalPages = Math.ceil(totalResidents / residentsPerPage);
   
  let currentResidents = filteredResidents.slice(
    (currentPage - 1) * residentsPerPage,
    currentPage * residentsPerPage
  );


  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };


  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  

  const handleAddResident = () => {
    setShowAddResidentModal(true);
  };

  const handleCloseModal = () => {
    setShowAddResidentModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewResidentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (newResidentData.name && newResidentData.age) {
      const newResident = {
        id: (residents.length + 1).toString(),
        name: newResidentData.name,
        date_of_birth: newResidentData.age,
        image: "",
      };

      setResidents([...residents, newResident]);
      setNewResidentData({ name: "", age: "" });
      setShowAddResidentModal(false);
    } else {
      alert("Please fill out all fields!");
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setSearchTerm(searchName.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-[95%] max-w-screen-xl min-h-screen bg-gradient-to-b py-12 px-6 relative">
<div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">

<div className="flex justify-between items-center w-full lg:w-auto gap-4">
<DropdownYearResident
  selectedYear={selectedYear}
  setSelectedYear={setSelectedYear}
  className="py-2 lg:py-2 px-2 lg:px-3 text-sm lg:text-base"
/>

  <div className="flex items-center gap-2">
    <label htmlFor="type" className="text-sm sm:text-base font-semibold">
      Level
    </label>
    <select
      id="type"
      value={type}
      onChange={(e) => setType(e.target.value)}
      className="border border-gray-400 rounded-md w-28 sm:w-32
                 py-2 lg:py-2 px-2 lg:px-3 text-sm lg:text-base"
    >
      <option value="all">All Level</option>
      <option value="1">Level 1</option>
      <option value="2">Level 2</option>
      <option value="3">Level 3</option>
      <option value="4">Level 4</option>
      <option value="5-6">Level 5</option>
    </select>
  </div>
</div>

<div className="flex flex-nowrap items-center gap-2 w-full lg:w-auto">
<input
  type="text"
  placeholder="Search by resident name"
  value={searchName}
  onChange={(e) => {
    const value = e.target.value;
    setSearchName(value);
    setCurrentPage(1);       
    setSearchTerm(value.trim()); 
  }}
  className="border border-gray-400 rounded-md flex-grow min-w-0
             py-2 lg:py-2 px-2 lg:px-3 text-sm lg:text-base
             focus:outline-none focus:ring-2 focus:ring-green-500"
/>

  <button
    onClick={handleSearch}
    className="bg-green-700 hover:bg-green-800 text-white
               rounded-md flex items-center gap-2 whitespace-nowrap
               min-w-[80px] py-2 lg:py-2 px-3 lg:px-4 text-sm lg:text-base"
  >
    <FaSearch />
    Search
  </button>
</div>
</div>
<h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-center text-green-800 mb-6 drop-shadow-md">
       Residents
      </h1>
        <div className="flex flex-col gap-5 object-cover">
          {currentResidents.length > 0 ? (
            currentResidents.map((resident) => (
              <BoxResident
                key={resident.id}
                id={resident.id}
                image={resident.attributes.profile_img_url?.data?.attributes?.url
                                    ? resident.attributes.profile_img_url.data.attributes.url
                                    : resident.image}
                name={resident.attributes.fullname_english}
                dob={resident.attributes.date_of_birth}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 font-medium">
              No residents found.
            </div>
          )}
        </div>

        <div className="flex justify-center items-center mt-8 gap-4 flex-wrap">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md text-white ${
              currentPage === 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#207137]"
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
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#207137]"
            }`}
          >
            Next
          </button>
        </div>
        <div
          onClick={handleAddResident}
          className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg shadow cursor-pointer border border-dashed border-gray-400 hover:bg-gray-50 mt-5"
        >
          <FaPlus className="text-green-600" />
          <span className="text-sm font-medium text-green-600">
            Add New Resident
          </span>
        </div>

        {showAddResidentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2 sm:px-4">
            <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl p-6 bg-white rounded-2xl shadow-2xl">
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-red-500"
              >
                &times;
              </button>
              <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
                Add New Resident
              </h3>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Name"
                  value={newResidentData.name}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="date"
                  name="age"
                  placeholder="Enter Date of Birth"
                  value={newResidentData.age}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-md w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <FaTimes className="text-sm" />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-md w-full sm:w-auto"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentList;