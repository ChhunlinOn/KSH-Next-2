"use client";
import React, { useState, useEffect } from "react";
import ProgramInfoBox from "@/app/component/activitiesResident";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch } from "react-icons/fa";
import Link from "next/link";
import dotenv from "dotenv";
import { useParams } from "next/navigation";
import { downloadExcel } from "react-export-table-to-excel";
import { getSessionForClient } from "@/app/action/clientauth";

const ActivitiesResident = () => {
  dotenv.config();
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const session = getSessionForClient();
  const token = session?.jwt;
  const { id } = useParams();
  const { activityid } = useParams();
  // const id = params.id;
  // const activityid = params.activityId;
  console.log(id);
  console.log(activityid);
  const [programInfo, setProgramInfo] = useState<any[]>([]);
  const [filteredProgramInfo, setFilteredProgramInfo] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOption, setSelectedOption] = useState("today");
  const [customDate, setCustomDate] = useState("");
  const [searchName, setSearchName] = useState("");
  const [loading, setLoading] = useState(true);
  const [programActivities, setProgramActivities] = useState<any>({});

  console.log('programInfo', filteredProgramInfo);
  const itemsPerPage = 4;
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = selectedOption === "today" ? today : customDate;
  

  const handlefetchActivities = async () => {
    try {
      const response = await fetch(
        `${api_url}/program-activities/${activityid}?populate=*`, // Replace with your API endpoint
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Replace with your API token
          },
        }
      );
      const data = await response.json();
      console.log(data.data);
      setProgramActivities(data.data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };
  useEffect(() => {
    handlefetchActivities();
  }
    , []);

  const title = programActivities.attributes?.program_activity_name || "";
  const image = programActivities.attributes?.img_url.data[0].attributes.url || "https://ui-avatars.com/api/";

  const handftchprograminfo = async () => {
  try {
    const response = await fetch(
      `${api_url}/resident-checklists?filters[checklist_date][$eq]=${selectedDate}&filters[program_activity][program_activity_name][$eq]=${title}&populate[program_activity]=true&populate[score_point]=true&populate[resident][populate]=profile_img_url&pagination[page]=1&pagination[pageSize]=100`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    console.log(data.data);

    // Null/undefined check
    const safeData = Array.isArray(data.data) ? data.data : [];
    setProgramInfo(safeData);
    setFilteredProgramInfo(safeData);
    setTotalPages(Math.ceil(safeData.length / itemsPerPage));
  } catch (error) {
    console.error("Error fetching activities:", error);
    setProgramInfo([]);
    setFilteredProgramInfo([]);
    setTotalPages(1);
  }
};

  useEffect(() => {
    setLoading(true);
    handftchprograminfo();

    setTimeout(() => {
      handftchprograminfo();
      setLoading(false);
    }, 500);
  }, [selectedDate, title]);

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDate(e.target.value);
  };

  const handleValueChange = (id: number, value: string) => {
    setFilteredProgramInfo((prev) =>
      prev.map((p) => (p.id === id ? { ...p, value } : p))
    );
  };

  const handleCommentChange = (id: number, comment: string) => {
    setFilteredProgramInfo((prev) =>
      prev.map((p) => (p.id === id ? { ...p, comment } : p))
    );
  }

 const handleSave = async () => {
  try {
    // Only process items that were actually changed
    const changedPrograms = filteredProgramInfo.filter((program) => {
      return program.value !== undefined || program.comment !== undefined;
    });

    const promises = changedPrograms.map(async (program) => {
      const id = program.id;
      const currentScore = program.attributes?.score_point?.data?.attributes?.score_point?.id;
      const currentComment = program.attributes?.description;

      const value = program.value ?? currentScore;
      const comment = program.comment ?? currentComment ?? "";

      const score_point =
        value === "1" ? 1 : value === "3" ? 3 : value === "4" ? 4 : 2;

      const response = await fetch(`${api_url}/resident-checklists/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            score_point,
            description: comment,
          },
        }),
      });

      console.log("Sending to ID:", id, {
        score_point,
        description: comment,
      });

      return response;
    });

    const responses = await Promise.all(promises);
    const allSuccessful = responses.every((res) => res.ok);

    if (allSuccessful) {
      toast.success("All residents saved successfully!", {
        position: "top-center",
        autoClose: 5000,
      });
    } else {
      toast.error("Some saves may have failed. Please check again.", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  } catch (error) {
    toast.error("Failed to save the data. Please try again.", {
      position: "top-center",
      autoClose: 5000,
    });
    console.error("Error updating resident-checklists:", error);
  }
};


  const handleSearch = () => {
    const term = searchName.trim().toLowerCase();
    const filtered = programInfo.filter((p) =>
      p.attributes.resident.data.attributes.fullname_english
        .toLowerCase()
        .includes(term)
    );
    setFilteredProgramInfo(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getPaginatedData = () => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProgramInfo.slice(start, start + itemsPerPage);
  };

  

const handleDownload = () => {
  downloadExcel({
    fileName: "resident-checklist",
    sheet: "Sheet1",
    tablePayload: {
      header: ["Name", "Score", "Comment"],
      body: filteredProgramInfo.map((program) => [
        program.attributes.resident.data.attributes.fullname_english,
        program.value
          ? program.value === 1
            ? "Good"
            : program.value === 2
            ? "Bad"
            : program.value === 3
            ? "Medium"
            : "Uncheckable"
          : program.attributes.score_point?.data?.attributes?.score_name || "Uncheckable",
        program.comment || program.attributes.description || "No comment",
      ]),
    },
  });
};


  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-12 ">
      <div className="max-w-7xl mx-auto w-full">

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:justify-between">
          <div className="flex justify-between items-center w-full lg:w-1/2">
            <Link href={`/dashbaord/pages/program/programActivities/${id}`}>
              <button className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-500 transition">
                Back
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <select
                className="border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-green-500"
                value={selectedOption}
                onChange={handleOptionChange}
              >
                <option value="today">Today</option>
                <option value="custom">Custom</option>
              </select>

              {selectedOption === "custom" && (
                <input
                  type="date"
                  value={customDate}
                  onChange={handleDateChange}
                  className="border border-gray-300 px-3 py-1 rounded-md focus:ring-2 focus:ring-green-500
                 w-24 sm:w-28 md:w-32 lg:w-36"
                />
              )}
            </div>


          </div>

          <div className="flex sm:flex-row items-stretch gap-3 w-full mt-4 lg:mt-0 lg:w-1/2">
            <input
              type="text"
              placeholder="Search by resident name"
              value={searchName}
              onChange={(e) => {
                const value = e.target.value;
                setSearchName(value);
                setCurrentPage(1);

                if (value.trim() === "") {
                  setFilteredProgramInfo(programInfo);
                  setTotalPages(Math.ceil(programInfo.length / itemsPerPage));
                } else {
                  const filtered = programInfo.filter((p) =>
                    p.attributes.resident.data.attributes.fullname_english
                      .toLowerCase()
                      .includes(value.toLowerCase())
                  );
                  setFilteredProgramInfo(filtered);
                  setTotalPages(Math.ceil(filtered.length / itemsPerPage));
                }
              }}
              className="border border-gray-400 rounded-md flex-grow min-w-0
         py-2 lg:py-2 px-2 lg:px-3 text-sm lg:text-base
         focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <button
              onClick={handleSearch}
              className="bg-green-700 hover:bg-green-800 text-white rounded-md flex items-center justify-center gap-2 py-2 px-4"
            >
              <FaSearch />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>

        <div className="mb-4 text-lg font-semibold text-gray-700 text-center sm:text-left">
          Residents:{" "}
          <span className="text-green-700">{filteredProgramInfo.length}</span>
        </div>

        <div className="flex flex-col items-center mb-8">
          <img
            src={image}
            alt="Program"
            className="w-full max-w-[300px] md:max-w-sm rounded-lg shadow-md object-cover"
          />
          <h1 className="text-2xl md:text-4xl font-bold text-green-800 mt-4 text-center">
            {title}
          </h1>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full  rounded-lg shadow-sm">
            <tbody>
              {getPaginatedData().length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500 text-lg">
                    There no resident to checklist on this date
                  </td>
                </tr>
              ) : (
                getPaginatedData().map((program) => (
                  <ProgramInfoBox
                    key={program.id}
                    profile={
                      program.attributes.resident.data.attributes
                        .profile_img_url?.data?.attributes?.formats?.thumbnail?.url ||
                      "https://ui-avatars.com/api/?name=No+Image"
                    }
                    name={program.attributes.resident.data.attributes.fullname_english}
                    score={program.value || program.attributes.score_point.data.id || "1"}
                    coment={program.comment || program.attributes.description || "No comment"}
                    onValueChange={(val: string) => handleValueChange(program.id, val)}
                    onCommentChange={(comment: string) => handleCommentChange(program.id, comment)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-white ${currentPage === 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-800"
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
              className={`px-4 py-2 rounded-md text-white ${currentPage === totalPages
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-800"
                }`}
            >
              Next
            </button>
          </div>

          <div className="w-full flex justify-between items-center gap-4">
            <button
              onClick={handleDownload}
              className="bg-green-700 hover:bg-green-800 active:bg-green-900 text-white font-semibold text-lg px-6 py-2 rounded-lg shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-75 w-full sm:w-full md:w-auto max-w-full sm:max-w-full md:max-w-xs"
            >
              Export
            </button>
            <button
              onClick={handleSave}
              className="bg-green-700 hover:bg-green-800 active:bg-green-900 text-white font-semibold text-lg px-6 py-2 rounded-lg shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-75 w-full sm:w-full md:w-auto max-w-full sm:max-w-full md:max-w-xs"
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

export default ActivitiesResident;
