"use client";

import React, { useState, useEffect } from "react";
import ProgramInfoBox from "../../../../../../component/residentChecklist";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { getSession } from "@/app/action/clientauth";
import { redirect } from "next/navigation";
import { useParams } from "next/navigation";

const ResidentChecklist = () => {
  const session = getSession();
  if (!session) redirect("/login");
  const [residentChecklist, setResidentChecklist] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOption, setSelectedOption] = useState("today");
  const [customDate, setCustomDate] = useState("");
  const {id} = useParams();

  const itemsPerPage = 4;
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = selectedOption === "today" ? today : customDate;

  const title = "Kim Alysa";
  const image =
    "https://img.freepik.com/free-photo/brunette-business-woman-with-wavy-long-hair-blue-eyes-stands-holding-notebook-hands_197531-343.jpg";


const activityNames = [
    "Hygiene", 
    "Clean Toilet", 
    "Laundry", 
    "Gardening", 
    "Cooking", 
    "Health Check", 
    "Recycling", 
    "Repairs", 
    "Maintenance", 
    "Clean Windows", 
    "Organize Books", 
    "Waste Disposal", 
    "Grocery Shopping"
  ];
  
  useEffect(() => {
  
    const fakeData = Array.from({ length: 13 }, (_, i) => ({
      id: i + 1,
      value: i % 2 === 0 ? "Good" : "Not Good", 
      comment: i % 2 === 0 ? "Well done" : "Needs improvement",
      attributes: {
        description: "Effort noted",
        score_point: { data: { attributes: { score_point: 50 } } },
        resident: {
          data: {
            attributes: {
              fullname_english: activityNames[i] || `Activity ${i + 1}`, 
              profile_img_url: {
                data: {
                  attributes: {
                    formats: {
                      thumbnail: {
                        url: "https://www.cnet.com/a/img/resize/e011748b8487c43f0e85f45100c10ce1511c7e21/hub/2025/04/24/7b3852f4-4ea1-480c-9749-98f0fd05d172/gettyimages-1224808645.jpg?auto=webp&fit=crop&height=900&width=1200",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }));
  
    setTimeout(() => {
      setResidentChecklist(fakeData);
      setTotalPages(Math.ceil(fakeData.length / itemsPerPage));
    }, 1000);
  }, [selectedDate]);
  

  const handleValueChange = (id: number, value: string) => {
    setResidentChecklist((prev) =>
      prev.map((p) => (p.id === id ? { ...p, value } : p))
    );
  };

  const handleCommentChange = (id: number, comment: string) => {
    setResidentChecklist((prev) =>
      prev.map((p) => (p.id === id ? { ...p, comment } : p))
    );
  };

  const handleSave = () => {
    toast.success("Saved successfully!", { position: "top-center" });
    console.log("Saved data:", residentChecklist);
  };

  const getPaginatedData = () => {
    const start = (currentPage - 1) * itemsPerPage;
    return residentChecklist.slice(start, start + itemsPerPage);
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-12">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <Link href={`/dashbaord/pages/resident/residentInfo/${id}`}>
            <button className="bg-gray-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-gray-400 transition duration-300">
              Back
            </button>
          </Link>

          <div className="flex items-center gap-4 flex-wrap">
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="today">Today</option>
              <option value="custom">Custom</option>
            </select>

            {selectedOption === "custom" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-green-500"
              />
            )}
          </div>
        </div>

        <div className="mb-4 text-xl font-semibold text-gray-700">
          Activities:{" "}
          <span className="text-green-700">{residentChecklist.length}</span>
        </div>

        <div className="flex flex-col items-center mb-8">
          <img
            src={image}
            alt="Program"
            className="w-90 h-90 max-w-xs md:max-w-sm rounded-full shadow-md object-cover"
          />
          <h1 className="text-2xl md:text-4xl font-bold text-green-800 mt-4 text-center">
            {title}
          </h1>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow-sm">
            <tbody>
              {getPaginatedData().map((program) => (
                <ProgramInfoBox
                  key={program.id}
                  profile={
                    program.attributes.resident.data.attributes
                      .profile_img_url.data.attributes.formats.thumbnail.url
                  }
                  name={
                    program.attributes.resident.data.attributes
                      .fullname_english
                  }
                  initialValue={program.value}
                  comment={program.comment}
                  onValueChange={(val: string) =>
                    handleValueChange(program.id, val)
                  }
                  onCommentChange={(comment: string) =>
                    handleCommentChange(program.id, comment)
                  }
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === 1
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#207137]"
              }`}
            >
              Previous
            </button>

            <span className="text-gray-700 font-medium text-lg">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
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

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-green-700 hover:bg-green-800 text-white text-base px-6 md:px-8 py-2 md:py-3 rounded-md shadow"
            >
              Save
            </button>
          </div>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
};

export default ResidentChecklist;
