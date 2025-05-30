'use client';
import React, { useState, useEffect } from 'react';
import BoxResident from '../../../component/medicalBox';
import { FaPlus, FaTimes, FaSearch } from 'react-icons/fa';
import dotenv from 'dotenv';
import { getSession } from '@/app/action/clientauth';

const MedicalList: React.FC = () => {
  dotenv.config();
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const session = getSession();
  const token = session?.jwt;
  console.log(api_url);
  console.log(token);
  const [residents, setResidents] = useState<any[]>([]);
  const [allResidents, setAllResidents] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddResidentModal, setShowAddResidentModal] = useState(false);
  const [newResidentData, setNewResidentData] = useState({
    name: '',
    medicalUse: false,
    doctor: '',
    treatment_date: '',
    specialist_doctor_comment: '',
    next_appointment: '',
    next_appointment_time: '',
    next_appointment_remark: '',
    medical_treatment: '',
  });

  const handlefetchResidents = async () => {
    try {
      const response = await fetch(
        `${api_url}/resident-medicals?filters[require_to_use][$eq]=true&populate[resident][populate]=profile_img_url`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      console.log(data);
      setResidents(data.data);
    } catch (error) {
      console.error('Error fetching residents:', error);
    }
  };

  const fetchAllResidents = async () => {
    try {
      const response = await fetch(
        `${api_url}/beneficiaries?populate=profile_img_url&pagination[page]=1&pagination[pageSize]=1000`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setAllResidents(data.data);
    } catch (error) {
      console.error('Error fetching all residents:', error);
    }
  };

  const handleSelect = (resident: any) => {
    setInput(resident.attributes.fullname_english);
    setNewResidentData((prev) => ({
      ...prev,
      name: resident.attributes.fullname_english,
    }));
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

const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;
  setNewResidentData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
};


  const handleSubmit = async () => {
    const selectedResident = allResidents.find(
      (res) => res.attributes.fullname_english === newResidentData.name
    );
    if (!selectedResident) return alert('Resident not found');

    try {
      const response = await fetch(`${api_url}/resident-medicals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            require_to_use: true,
            resident: selectedResident.id,
            doctor: newResidentData.doctor,
            treatment_date: newResidentData.treatment_date,
            specialist_doctor_comment: newResidentData.specialist_doctor_comment,
            next_appointment: newResidentData.next_appointment,
            next_appointment_time: newResidentData.next_appointment_time,
            next_appointment_remark: newResidentData.next_appointment_remark,
            medical_treatment: newResidentData.medical_treatment,
          },
        }),
      });

      if (response.ok) {
        await handlefetchResidents();
        setShowAddResidentModal(false);
        setNewResidentData({
          name: '',
          medicalUse: false,
          doctor: '',
          treatment_date: '',
          specialist_doctor_comment: '',
          next_appointment: '',
          next_appointment_time: '',
          next_appointment_remark: '',
          medical_treatment: '',
        });
        setInput('');
      } else {
        alert('Failed to add new medical record.');
      }
    } catch (err) {
      alert('Error occurred while submitting.');
    }
  };

  

  const handleAddResident = () => {
    setShowAddResidentModal(true);
    fetchAllResidents(); 
  };
  const handleCloseModal = () => setShowAddResidentModal(false);

  const filteredResidents = residents.filter((resident) => {
    const name =
      resident?.attributes?.resident?.data?.attributes?.fullname_english ||
      resident?.name ||
      '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredOptions = allResidents.filter((resident) =>
    resident.attributes.fullname_english
      .toLowerCase()
      .includes(input.toLowerCase())
  );

  const residentsPerPage = 10;
  const totalPages = Math.ceil(filteredResidents.length / residentsPerPage);
  const currentResidents = filteredResidents.slice(
    (currentPage - 1) * residentsPerPage,
    currentPage * residentsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  useEffect(() => {
    handlefetchResidents();
  }, []);

  return (
    <div className="flex justify-center w-full">
      <div className="w-[95%] max-w-screen-xl min-h-screen bg-gradient-to-b py-10 px-6 relative">
        <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-center text-green-800 mb-6 drop-shadow-md">
          Medical
        </h1>

        <div className="flex flex-nowrap items-center gap-2 w-full lg:w-auto mb-4">
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
            onKeyDown={handleKeyDown}
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

        <div className="flex flex-col gap-5">
          {currentResidents.length > 0 ? (
            currentResidents.map((resident) => (
              <BoxResident
                key={resident.id}
                id={resident.id}
                image={
                  resident?.attributes?.resident?.data?.attributes
                    ?.profile_img_url?.data?.attributes?.url
                }
                name={
                  resident?.attributes?.resident?.data?.attributes
                    ?.fullname_english
                }
                medicalUse={resident.attributes?.require_to_use}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 font-medium">
              No medical found.
            </div>
          )}
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
          onClick={handleAddResident}
          className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg shadow cursor-pointer border border-dashed border-gray-400 hover:bg-gray-50 mt-5"
        >
          <FaPlus className="text-green-600" />
          <span className="text-sm font-medium text-green-600">
            Add New Medical
          </span>
        </div>

        {showAddResidentModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2 sm:px-4">
            <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl p-6 bg-white rounded-2xl shadow-2xl">
            <button onClick={() => setShowAddResidentModal(false)} className="absolute top-2 right-3 text-xl">
              <FaTimes />
            </button>
            <h2 className="text-xl font-bold mb-4">Add New Medical Resident</h2>

            <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Select resident name"
                  className="w-full border border-gray-400 rounded-md px-3 py-2 mb-2"
                />
                {filteredOptions.length > 0 && (
                  <ul className="max-h-32 overflow-y-auto border border-gray-200 rounded-md mb-4">
                    {filteredOptions.map((resident) => (
                      <li
                        key={resident.id}
                        onClick={() => handleSelect(resident)}
                        className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100"
                      >
                        {resident.attributes.profile_img_url?.data?.attributes
                          ?.url && (
                          <img
                            src={
                              resident.attributes.profile_img_url.data
                                .attributes.url
                            }
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        {resident.attributes.fullname_english}
                      </li>
                    ))}
                  </ul>
            )}

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm text-gray-600 mb-1">Doctor</label>
    <input
      name="doctor"
      value={newResidentData.doctor}
      onChange={handleInputChange}
      className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  </div>

  <div>
    <label className="block text-sm text-gray-600 mb-1">Treatment Date</label>
    <input
      type="date"
      name="treatment_date"
      value={newResidentData.treatment_date}
      onChange={handleInputChange}
      className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  </div>

  <div className="md:col-span-2">
    <label className="block text-sm text-gray-600 mb-1">Specialist Doctor Comment</label>
    <textarea
      name="specialist_doctor_comment"
      value={newResidentData.specialist_doctor_comment}
      onChange={handleInputChange}
      rows={3}
      className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  </div>

  <div>
    <label className="block text-sm text-gray-600 mb-1">Next Appointment</label>
    <input
      type="date"
      name="next_appointment"
      value={newResidentData.next_appointment}
      onChange={handleInputChange}
      className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  </div>

  <div>
    <label className="block text-sm text-gray-600 mb-1">Next Appointment Time</label>
    <input
      type="time"
      name="next_appointment_time"
      value={newResidentData.next_appointment_time}
      onChange={handleInputChange}
      className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  </div>

  <div className="md:col-span-2">
    <label className="block text-sm text-gray-600 mb-1">Next Appointment Remark</label>
    <input
      name="next_appointment_remark"
      value={newResidentData.next_appointment_remark}
      onChange={handleInputChange}
      className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  </div>

  <div className="md:col-span-2">
    <label className="block text-sm text-gray-600 mb-1">Medical Treatment</label>
    <textarea
      name="medical_treatment"
      value={newResidentData.medical_treatment}
      onChange={handleInputChange}
      rows={3}
      className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  </div>
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
                </div>          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default MedicalList;
