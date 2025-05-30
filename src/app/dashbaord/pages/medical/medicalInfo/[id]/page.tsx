"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaTimes, FaPlus, FaEdit, FaTrash, FaSave } from "react-icons/fa";
import ResidentBoxInfo from "../../../../../component/medicalBoxInfo";
import { useParams } from "next/navigation";
import dotenv, { populate } from "dotenv";
import { all } from "axios";
import { getSession } from "@/app/action/clientauth";

interface CustomInfo {
  id?: string; 
  comment: string;
  title: string;
}

interface Document {
  title: string;
  link: string;
}

const MedicalDetailPage: React.FC = () => {
  const [showAddResidentModal, setShowAddResidentModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showupdateDocModal, setShowupdateDocModal] = useState(false);
  const [showupdateResidentModal, setShowupdateResidentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [newInfo, setNewInfo] = useState<CustomInfo>({
    id: "",
    comment: "",
    title: "",
  });
  const [newDocInfo, setNewDocInfo] = useState<Document>({
    link: "",
    title: "",
  });
  const [customInfos, setCustomInfos] = useState<CustomInfo[]>([]);
  const [residentMedical, setResidentMedical] = useState<any>(null);
  const [residentimg, setResidentImg] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [getcomments, setGetComments] = useState<any>([]);
  const [getDocuments, setGetDocuments] = useState<any>([]);

  console.log("custom  Infos", newInfo);
  console.log("custom Infos", getcomments);

  dotenv.config();
  const session = getSession();
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const token = session?.jwt;
  const params = useParams();
  const id = params.id;

  const handleOpenModal = () => setShowAddResidentModal(true);
  const handleCloseModal = () => setShowAddResidentModal(false);

  const handleOpenDocModal = () => setShowAddDocModal(true);
  const handleCloseDocModal = () => setShowAddDocModal(false);

  const handleOpenUpdateDocModal = () => setShowupdateDocModal(true);
  const handleCloseUpdateDocModal = () => setShowupdateDocModal(false);

  const handleOpenUpdateResidentModal = () =>
    setShowupdateResidentModal(true);
  const handleCloseUpdateResidentModal = () =>
    setShowupdateResidentModal(false);

  const handleEditClose = () => setShowEditModal(false);

  const getDocumentsData = async (id:string) => {
    try {
      const response = await fetch(
        `${api_url}/medical-url-drives/${id}?populate=*`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:`Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (Array.isArray(data.data)) {
        setGetDocuments(data.data.map((item: any) => item.attributes));
      } else {
        setGetDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }

  const handleAddinfoDocument = async () => {
    if (newDocInfo.link && newDocInfo.title) {
      try {
        const response = await fetch(`${api_url}/medical-url-drives?populate=*`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              drive_url: newDocInfo.link,
              title: newDocInfo.title,
              resident_medical: id,
            },
          }),
        });

        if (!response.ok) throw new Error("Failed to add custom info");

        const result = await response.json();
        console.log("response", result);
        return result.data?.id || null;
      } catch (error) {
        console.error("Error adding custom info:", error);
      }
    }
  };
  const handleAddInfo = async () => {
    try {
      const response = await fetch(`${api_url}/medical-comments?populate=*`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            comment: newInfo.comment,
            title: newInfo.title,
          },
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        console.error("Server responded with:", result);
        throw new Error("Failed to add custom info");
      }
  
      console.log("response", result);
      return result.data?.id || null;
    } catch (error) {
      console.error("Error adding custom info:", error);
    }
  };
  
  
  const fetchCustomInfos = async () => {
    try {
      const response = await fetch(
        `${api_url}/custom-medical-infos?filters[resident_medical][id][$eq]=${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (Array.isArray(data.data)) {
        setCustomInfos(data.data.map((item: any) => item.attributes));
      } else {
        setCustomInfos([]);
      }
    } catch (error) {
      console.error("Error fetching custom infos:", error);
    }
  };

  useEffect(() => {
    handlefetchResident();
    fetchCustomInfos();
  }, []);

  const handlefetchResident = async () => {
    try {
      const response = await fetch(
        `${api_url}/resident-medicals/${id}?populate[resident][populate][profile_img_url]=true&populate[medical_comments]=*&populate[medical_url_drives]=*`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      console.log("residentMedical", data.data.attributes);
      setResidentMedical(data.data.attributes);
    } catch (error) {
      console.error("Error fetching resident data:", error);
    }
  };

  const residentid = residentMedical?.resident?.data.id || null;

  const handleResidentdata = async () => {
    if (!residentid) return;
    try {
      const response = await fetch(
        `${api_url}/beneficiaries/${residentid}?populate=*`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setResidentImg(
        data.data?.attributes?.profile_img_url?.data?.attributes?.url
      );
    } catch (error) {
      console.error("Error fetching resident image:", error);
    }
  };

  const handleupdateresident = async (customInfoId: string) => {
    if (!residentid || !customInfoId) return;
    const allId =
      residentMedical?.medical_comments?.data.map((item: any) => item.id) || [];
    try {
      const response = await fetch(
        `${api_url}/resident-medicals/${id}?populate=*`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data: {
              medical_comments: {
                connect: [...allId, customInfoId || null], 
              },
            },
          }),
        }
      );
      if (!response.ok)
        throw new Error("Failed to update resident medical info");
      const result = await response.json();
      console.log("Update response:", result);
      handlefetchResident();
    } catch (error) {
      console.error("Error updating resident medical info:", error);
    }
  };
  const handleDeleteDoc = async (docId: string) => {
    try {
      const response = await fetch(`${api_url}/medical-url-drives/${docId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) throw new Error("Delete document failed");
  
      console.log("Deleted doc:", docId);
      if (typeof id === "string") {
        getDocumentsData(id); 
      } else {
        console.error("Invalid id: Expected a string but got", id);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };
  

  const handleUpdateDoc = async (docId: string) => {
    try {
      const response = await fetch(`${api_url}/medical-url-drives/${docId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            title: newDocInfo.title,
            drive_url: newDocInfo.link,
          },
        }),
      });
  
      const result = await response.json();
      if (!response.ok) throw new Error("Update document failed");
  
      console.log("Updated doc:", result);
      if (typeof id === "string") {
        getDocumentsData(id); 
      } else {
        console.error("Invalid id: Expected a string but got", id);
      }
      setShowupdateDocModal(false);
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };
  

  const addAndUpdateResident = async () => {
    let customInfoId = newInfo.id;
  
    if (!customInfoId) {
      customInfoId = await handleAddInfo(); 
    } else {
      await handleUpdateInfo(customInfoId); 
    }
  
    if (customInfoId) {
      await handleupdateresident(customInfoId); 
    }
  
  };
  const openUpdateResidentModal = (resident: { id: string; comment: string; title: string }) => {
    setNewInfo({
      id: resident.id,
      comment: resident.comment || "",
      title: resident.title || "",
    });
    setShowupdateResidentModal(true);
  };
  

  const openUpdateDocumenttModal = (resident: { id: string; drive_url: string; title: string }) => {
    setNewInfo({
      id: resident.id,
      comment: resident.drive_url || "",
      title: resident.title || "",
    });
    setShowupdateResidentModal(true);
  };
  const handleUpdateInfo = async (customInfoId: string) => {
    try {
      const response = await fetch(`${api_url}/medical-comments/${customInfoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            comment: newInfo.comment,
            title: newInfo.title,
          },
        }),
      });
      await response.json();
    } catch (error) {
      console.error("Error updating info:", error);
    }
  };
  
  const handleDeleteInfo = async (infoId: string) => {
    try {
      const response = await fetch(`${api_url}/medical-comments/${infoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const text = await response.text();
        let errorMessage = "Delete failed";
  
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData?.error?.message || errorMessage;
        } catch {
          errorMessage = text || errorMessage; 
        }
  
        throw new Error(errorMessage);
      }
  
      console.log("Deleted info with id:", infoId);
      fetchCustomInfos();
    } catch (error: any) {
      console.error("Error deleting info:", error.message || error);
      alert("Failed to delete the info. Please try again.");
    }
  };
  
  
  
  
  const addAndUpdateDocResident = async () => {
    const customDocId = await handleAddinfoDocument();
    console.log("customDocId", customDocId); 
  
    if (customDocId) {
   
      await handleupdateresident(customDocId);
    } else {
      console.error("customDocId is null — Add failed");
    }
  };
  
  useEffect(() => {
    handlefetchResident();
  }, []);

  useEffect(() => {
    if (residentid) {
      handleResidentdata();
    }
  }, [residentid]);

  const handleEditSubmit = async () => {
    try {
      const updatedData: any = {};
  
      if (editForm.is_required_medical_use !== undefined) {
        updatedData.require_to_use = editForm.is_required_medical_use;
      }
  
      if (editForm.medical_treatment?.trim()) {
        updatedData.medical_treatment = editForm.medical_treatment;
      }
  
      if (editForm.doctor_name?.trim()) {
        updatedData.doctor = editForm.doctor_name;
      }
  
      if (editForm.comment?.trim()) {
        updatedData.specailist_doctor_comment = editForm.comment;
      }
  
      if (editForm.next_appointment?.trim()) {
        updatedData.next_appointment = new Date(editForm.next_appointment).toISOString();
      }
  
      const response = await fetch(`${api_url}/resident-medicals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: updatedData }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        console.error("Server rejected the request:", result);
        throw new Error("Failed to update");
      }
  
      handlefetchResident();
      handleEditClose();
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };
  
  

  function formatDate(dateString: string | number | Date) {
    if (!dateString) return "";
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const handleEditOpen = () => {
    setEditForm({
      fullname_english: medicalData.fullname_english || "",
      gender: medicalData.gender || "",
      type_of_disability: medicalData.type_of_disability || "",
      date_of_birth: medicalData.date_of_birth || "",
      is_required_medical_use: medicalData.is_required_medical_use || false,
      medical_use: medicalData.medical_use || "",
      is_active: medicalData.is_active || false,
      start_date: medicalData.start_date || "",
      end_date: medicalData.end_date || "",
      medical_treatment: medicalData.medical_treatment || "",
      doctor_name: medicalData.doctor_name || "",
      comment: medicalData.comment || "",
      next_appointment: medicalData.next_appointment || "",
    });
    setShowEditModal(true);
  };

  const medicalData = {
    fullname_english:
      residentMedical?.resident?.data?.attributes?.fullname_english || "none",
    gender: residentMedical?.resident?.data?.attributes?.gender || "none",
    type_of_disability:
      residentMedical?.resident?.data?.attributes?.type_of_disability || "none",
    date_of_birth: formatDate(
      residentMedical?.resident?.data?.attributes?.date_of_birth
    ),
    is_required_medical_use: residentMedical?.require_to_use || false,
    medical_use: residentMedical?.medical_use || "none",
    is_active: residentMedical?.is_active || false,
    start_date: formatDate(residentMedical?.start_date),
    end_date: formatDate(residentMedical?.end_date),
    medical_treatment: residentMedical?.medical_treatment || "none",
    doctor_name: residentMedical?.doctor || "none",
    comment: residentMedical?.specailist_doctor_comment || "none",
    next_appointment: formatDate(residentMedical?.next_appointment),
    info: Array.isArray(residentMedical?.medical_comments?.data)
      ? residentMedical.medical_comments.data.map(
          (item: any) => item?.attributes || {}
        )
      : [],
    documents: Array.isArray(residentMedical?.medical_url_drives?.data)
      ? residentMedical.medical_url_drives.data.map(
          (item: any) => item?.attributes || {}
        )
      : [],
  };
  type DocumentInfo = {
    id: string;
    title: string;
    drive_url: string;
  };
  type MedicalComment = {
    id: string;
    comment?: string;
    title?: string;
  };


return (
  <div className="min-h-screen p-8 relative">
    <div className="w-[90%] mx-auto flex justify-between items-center mb-8 mt-16">
      <Link href="/dashbaord/pages/medical">
        <button className="bg-gray-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-gray-400 transition duration-300">
          Back
        </button>
      </Link>
      <button
        onClick={handleEditOpen}
        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-500"
      >
        <FaEdit />
        Edit
      </button>
    </div>

    <div className="w-[80%] mx-auto flex justify-center items-center mb-6">
      {residentimg ? (
        <img
          src={residentimg}
          alt="Profile"
          className="h-36 w-36 md:h-48 md:w-48 rounded-full object-cover shadow-lg"
        />
      ) : (
        <p className="text-xl font-semibold text-gray-600">
          No Image Available
        </p>
      )}
    </div>

    <h1 className="text-2xl md:text-4xl font-bold text-center mb-6 text-gray-800 w-[80%] mx-auto">
      Medical Information of Resident
    </h1>

    <div className="bg-white w-[90%] mx-auto rounded-lg p-6 shadow-lg border border-gray-200">
      <ResidentBoxInfo
        name="Full Name"
        value={medicalData.fullname_english}
      />
      <ResidentBoxInfo name="Gender" value={medicalData.gender} />
      <ResidentBoxInfo
        name="Disability/Disorder"
        value={medicalData.type_of_disability}
      />
      <ResidentBoxInfo
        name="Date of Birth"
        value={medicalData.date_of_birth}
      />
      <ResidentBoxInfo
        name="Required Medical Use"
        value={medicalData.is_required_medical_use ? "Yes" : "No"}
      />
      <ResidentBoxInfo name="Medical Use" value={medicalData.medical_use} />
      <ResidentBoxInfo
        name="Is Active"
        value={medicalData.is_active ? "Yes" : "No"}
      />
      <ResidentBoxInfo name="Start Date" value={medicalData.start_date} />
      <ResidentBoxInfo name="End Date" value={medicalData.end_date} />
      <ResidentBoxInfo
        name="Medical Treatment"
        value={medicalData.medical_treatment}
      />
      <ResidentBoxInfo name="Doctor Name" value={medicalData.doctor_name} />
      <ResidentBoxInfo name="Comment" value={medicalData.comment} />
      <ResidentBoxInfo
        name="Next Appointment"
        value={medicalData.next_appointment}
      />

{medicalData.info.map((info: MedicalComment, index: number) => (
<div
  key={info.id || index}
  className="border-b-2 border-gray-300 py-6 flex items-center"
>
  <div className="w-1/2 text-left font-bold text-md md:text-lg lg:text-xl">
    {info.comment || "Custom Info"}
  </div>
  <div className="flex-1 flex items-center">
    <div className="text-[16px] md:text-lg lg:text-xl flex-1">
      {info.title || "No Value Provided"}
    </div>
  </div>
  <button
    onClick={openUpdateResidentModal.bind(null, {
      id: info.id,
      comment: info.comment || "",
      title: info.title || "",
    })}
    
    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-500"
  >
    <FaEdit />
  </button>
</div>
))}

    </div>

    {showEditModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white p-6 rounded-2xl max-w-xl w-full relative overflow-y-auto max-h-[90vh]">
          <button
            onClick={handleEditClose}
            className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-red-500"
          >
            <FaTimes />
          </button>
          <h2 className="text-2xl font-bold mb-4">Edit Medical Info</h2>
          <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
         

        

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editForm.is_required_medical_use || false}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    is_required_medical_use: e.target.checked,
                  })
                }
              />
              Required Medical Use
            </label>


            <label className="block mb-1 font-semibold">
              Medical Treatment
            </label>
            <input
              placeholder="Medical Treatment"
              value={editForm.medical_treatment || ""}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  medical_treatment: e.target.value,
                })
              }
              className="p-3 border border-gray-300 rounded-lg"
            />

            <label className="block mb-1 font-semibold">Doctor Name</label>
            <input
              type="text"
              placeholder="Doctor Name"
              value={editForm.doctor_name || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, doctor_name: e.target.value })
              }
              className="p-3 border border-gray-300 rounded-lg"
            />

            <label className="block mb-1 font-semibold">Comment</label>
            <input
              placeholder="Comment"
              value={editForm.comment || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, comment: e.target.value })
              }
              className="p-3 border border-gray-300 rounded-lg"
            />

            <label className="block mb-1 font-semibold">
              Next Appointment
            </label>
            <input
              type="date"
              value={
                editForm.next_appointment
                  ? editForm.next_appointment.split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setEditForm({ ...editForm, next_appointment: e.target.value })
              }
              className="p-3 border border-gray-300 rounded-lg"
            />

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
              <button
                onClick={handleEditClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-md w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <FaTimes className="text-sm" />
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="bg-green-800 hover:bg-green-700 text-white px-5 py-2 rounded-md w-full sm:w-auto flex items-center justify-center gap-2"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    <div
      onClick={handleOpenModal}
      className="flex items-center w-[90%] justify-center gap-2 p-4 bg-white rounded-lg shadow cursor-pointer border border-dashed border-gray-400 hover:bg-gray-50 mt-5  mx-auto"
    >
      <FaPlus className="text-green-600" />
      <span className="text-sm font-medium text-green-600">
        Add Custom Info
      </span>
    </div>

    <div className="mt-8 w-[90%] mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Documents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {medicalData.documents.map((doc: DocumentInfo, index: number) => (
          
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
          >
             <button
        onClick={() => openUpdateDocumenttModal({
          id: doc.id,
          drive_url: doc.drive_url,
          title: doc.title,
        })}
        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-500"
      >
        <FaEdit />
      </button>
            <img
              src="https://plumsail.com/static/eade2ba6d4a6bf0947c24f462853c95b/e46ed/thumbnail.png"
              alt={doc.title}
              className="w-32 h-32 md:w-40 md:h-40 object-cover mb-6 mx-auto"
            />
            <h3 className="font-semibold text-xl text-gray-800 text-center mb-4">
              {doc.title}
            </h3>
            <a
              href={doc.drive_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-center block"
            >
              View Document
            </a>
          </div>
        ))}
      </div>
      <div
        onClick={handleOpenDocModal}
        className="flex items-center w-[100%] justify-center gap-2 p-4 bg-white rounded-lg shadow cursor-pointer border border-dashed border-gray-400 hover:bg-gray-50 mt-5  mx-auto"
      >
        <FaPlus className="text-green-600" />
        <span className="text-sm font-medium text-green-600">
          Add Document Info
        </span>
      </div>
    </div>
    {showAddResidentModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2 sm:px-4">
        <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl p-6 bg-white rounded-2xl shadow-2xl">
          <button
            onClick={handleCloseModal}
            className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-red-500"
          >
            <FaTimes />
          </button>
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Add Custom Info
          </h3>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              placeholder="Enter Info Label (e.g. Allergy)"
              value={newInfo.comment}
              onChange={(e) =>
                setNewInfo({ ...newInfo, comment: e.target.value })
              }
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              name="value"
              placeholder="Enter Info Value (e.g. Penicillin)"
              value={newInfo.title}
              onChange={(e) =>
                setNewInfo({ ...newInfo, title: e.target.value })
              }
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
              onClick={addAndUpdateResident}
              className="bg-green-800 hover:bg-green-700 text-white px-5 py-2 rounded-md w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    )}

    {showAddDocModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2 sm:px-4">
        <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl p-6 bg-white rounded-2xl shadow-2xl">
          <button
            onClick={handleCloseDocModal}
            className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-red-500"
          >
            <FaTimes />
          </button>
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Add Document Info
          </h3>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              placeholder="Enter Document url (e.g. Allergy)"
              value={newDocInfo.link}
              onChange={(e) =>
                setNewDocInfo({ ...newDocInfo, link: e.target.value })
              }
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              name="value"
              placeholder="Enter Document title "
              value={newDocInfo.title}
              onChange={(e) =>
                setNewDocInfo({ ...newDocInfo, title: e.target.value })
              }
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
            <button
              onClick={handleCloseDocModal}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-md w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <FaTimes className="text-sm" />
              Cancel
            </button>
            <button
              onClick={addAndUpdateDocResident}
              className="bg-green-800 hover:bg-green-700 text-white px-5 py-2 rounded-md w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    )}


{showupdateDocModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2 sm:px-4">
        <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl p-6 bg-white rounded-2xl shadow-2xl">
          <button
            onClick={handleCloseUpdateDocModal}
            className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-red-500"
          >
            <FaTimes />
          </button>
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Update Document Info
          </h3>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              placeholder="Enter Info Label (e.g. Allergy)"
              value={newInfo.comment}
              onChange={(e) =>
                setNewInfo({ ...newInfo, comment: e.target.value })
              }
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              name="value"
              placeholder="Enter Info Value (e.g. Penicillin)"
              value={newInfo.title}
              onChange={(e) =>
                setNewInfo({ ...newInfo, title: e.target.value })
              }
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={handleCloseUpdateDocModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-md w-full sm:w-auto"
                >
                  <FaTimes className="inline mr-2" /> Cancel
                </button>
                <button
                  onClick={() => handleDeleteDoc(newInfo.id || "")}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md w-full sm:w-auto"
                >
                  <FaTrash className="inline mr-2" /> Delete
                </button>
              </div>
          
              <button
                onClick={() => handleUpdateDoc(newInfo.id || "")}
                className="bg-green-800 hover:bg-green-700 text-white px-5 py-2 rounded-md w-full sm:w-auto"
              >
                <FaSave className="inline mr-2" /> Save
              </button>
            </div>
        </div>
      </div>
    )}

{showupdateResidentModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2 sm:px-4">
        <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl p-6 bg-white rounded-2xl shadow-2xl">
          <button
            onClick={handleCloseUpdateResidentModal}
            className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-red-500"
          >
            <FaTimes />
          </button>
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Update Custom Info
          </h3>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              placeholder="Enter Info Label (e.g. Allergy)"
              value={newInfo.comment}
              onChange={(e) =>
                setNewInfo({ ...newInfo, comment: e.target.value })
              }
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              name="value"
              placeholder="Enter Info Value (e.g. Penicillin)"
              value={newInfo.title}
              onChange={(e) =>
                setNewInfo({ ...newInfo, title: e.target.value })
              }
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={handleCloseUpdateResidentModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-md w-full sm:w-auto"
                >
                  <FaTimes className="inline mr-2" /> Cancel
                </button>
                <button
                  onClick={() => handleDeleteInfo(newInfo.id || "")}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md w-full sm:w-auto"
                >
                  <FaTrash className="inline mr-2" /> Delete
                </button>
              </div>
          
              <button
                onClick={() => handleUpdateInfo(newInfo.id || "")}
                className="bg-green-800 hover:bg-green-700 text-white px-5 py-2 rounded-md w-full sm:w-auto"
              >
                <FaSave className="inline mr-2" /> Save
              </button>
            </div>
        </div>
      </div>
    )}


  </div>
);
};

export default MedicalDetailPage;
