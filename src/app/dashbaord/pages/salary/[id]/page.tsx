"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { getSession } from "@/app/action/clientauth"
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const session = getSession();
const TOKEN = session?.jwt;

interface SalaryData {
  id?: number
  month: string
  day: number
  year: number
  amount: number
  balance: number 
  comments?: string
}

const formatMoney = (value: number) =>
  `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const formatDate = (month: string, day: number, year: number) => {
  return `${month} ${day}, ${year}`
}

export default function SalaryPage() {
  const {id} = useParams();
  console.log("Resident ID:", id);
  interface Resident {
    id?: number;
    name?: string;
    image?: string;
    dob?: string;
    salary?: [];
  }
  
  const [resident, setResident] = useState<Resident>({});
  
  const fetchResident = async () => {
    try {
      const response = await fetch(`${API_URL}/salary-residents/${id}?populate[resident][populate]=*&populate=internship_salaries`,
         {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      const data = await response.json();
  
      const transformed = {
        id: data.data.id,
        name: data.data.attributes?.resident?.data?.attributes?.fullname_english || 'No Name',
        image: data.data.attributes?.resident?.data?.attributes?.profile_img_url?.data?.attributes?.url || "No Image URL",
        dob: data.data.attributes?.resident?.data?.attributes?.date_of_birth,
        salary: data.data.attributes?.internship_salaries.data || [],
      };
  
      console.log('Fetched info_salary_residents:', data.data);
      setResident(transformed);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchResident();
  }, []);
  const salaryData = {
    fullname_english: resident.name || "No Name",
    profile_img_url: {
      data: {
        attributes: {
          formats: {
            thumbnail: {
              url: resident.image || "/placeholder.svg",
            },
          },
        },
      },
    },
  }

  const profileImageUrl = salaryData.profile_img_url?.data?.attributes?.formats?.thumbnail?.url || null

  const calculateBalances = (salaries: SalaryData[]): SalaryData[] => {
    // let runningBalance = 0;
    return salaries.map((salary) => {
      // runningBalance += salary.amount;
      return {
        ...salary,
        // balance: runningBalance,
        comments: salary.comments || 'No comments',
      };
    });
  };
  const [monthlySalaries, setMonthlySalaries] = useState<SalaryData[]>([]);

  // Recalculate salary balances after resident data is fetched
  useEffect(() => {
    if (resident.salary && Array.isArray(resident.salary)) {
      const rawSalaries = resident.salary.map((s: any) => {
        const dateStr = s.attributes.date || "2025-01-01"; // Example field name
        const dateObj = new Date(dateStr);
      
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
      
        return {
          month: monthNames[dateObj.getMonth()],  // getMonth returns 0-based index
          day: dateObj.getDate(),
          year: dateObj.getFullYear(),
          amount: s.attributes.salary || 0,
          balance: s.attributes.balance || 0, // will be calculated
          comments: s.attributes.commment || "No comments",
        };
      });      
  
      setMonthlySalaries(calculateBalances(rawSalaries));
    }
  }, [resident.salary]);

  const [newSalary, setNewSalary] = useState<SalaryData>({
    month: "",
    day: 1,
    year: 2025,
    amount: 0,
    balance: 0, 
    comments: "",
  })

  const [isFormVisible, setIsFormVisible] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [editingSalary, setEditingSalary] = useState<SalaryData | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const salariesPerPage = 10
  const totalPages = Math.ceil(monthlySalaries.length / salariesPerPage)
  const currentSalaries = monthlySalaries.slice((currentPage - 1) * salariesPerPage, currentPage * salariesPerPage)

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const updatedValue =
      name === "amount" || name === "day" || name === "year" || name === "balance" ? Number.parseInt(value) : value

    if (isEditMode && editingSalary) {
      setEditingSalary((prev) => ({
        ...prev!,
        [name]: updatedValue,
      }))
    } else {
      setNewSalary((prev) => ({
        ...prev,
        [name]: updatedValue,
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isEditMode && editingSalary) {
      const updatedSalaries = monthlySalaries.map((salary) =>
        salary.month === editingSalary.month && salary.day === editingSalary.day && salary.year === editingSalary.year
          ? editingSalary
          : salary,
      )
      setMonthlySalaries(calculateBalances(updatedSalaries))
      setIsEditMode(false)
      setEditingSalary(null)
    } else {
      if (!newSalary.month || !newSalary.day || !newSalary.year || newSalary.amount <= 0) {
        alert("Please fill in all fields correctly.")
        return
      }
      const updatedSalaries = [...monthlySalaries, newSalary]
      setMonthlySalaries(calculateBalances(updatedSalaries))
      setNewSalary({ month: "", day: 1, year: 2025, amount: 0, balance: 0, comments: "" })
    }

    setIsFormVisible(false)
  }

  const handleEdit = (salary: SalaryData) => {
    setEditingSalary(salary)
    setIsEditMode(true)
    setIsFormVisible(true)
  }

  const handleDelete = (salary: SalaryData) => {
    if (confirm("Are you sure you want to delete this salary record?")) {
      const filteredSalaries = monthlySalaries.filter(
        (s) => !(s.month === salary.month && s.day === salary.day && s.year === salary.year),
      )
      setMonthlySalaries(calculateBalances(filteredSalaries))
    }
  }

  const handleCloseForm = () => {
    setIsFormVisible(false)
    setIsEditMode(false)
    setEditingSalary(null)
  }

  const totalSalary = monthlySalaries.reduce((sum, salary) => sum + salary.amount, 0)

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
          <Link href="/dashbaord/pages/salary">
            <button className="bg-gray-500 text-white px-4 sm:px-6 py-2 rounded-lg shadow-md hover:bg-gray-400 transition duration-300 flex items-center gap-2 text-sm sm:text-base">
              Back
            </button>
          </Link>
        </div>

        <div className="mb-6 lg:mb-8 overflow-hidden rounded-xl shadow-md">
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                {profileImageUrl ? (
                  <Image src={profileImageUrl || "/placeholder.svg"} alt="Profile" fill className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 text-xs sm:text-sm">No Image</span>
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{salaryData.fullname_english}</h2>
                <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-6">
                  <div className="text-emerald-100 text-sm sm:text-base lg:text-lg">
                    Total Earnings: {formatMoney(totalSalary)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg sm:text-xl font-semibold">Salary History</h3>
            <button
              onClick={() => {
                setIsEditMode(false)
                setNewSalary({ month: "", day: 1, year: 2025, amount: 0, balance: 0, comments: "" })
                setIsFormVisible(true)
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 sm:px-4 py-2 rounded-md flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <FaPlus className="h-3 w-3 sm:h-4 sm:w-4" /> Add New Salary
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <div className="block lg:hidden space-y-4">
              {currentSalaries.length > 0 ? (
                currentSalaries.map((salary, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium text-gray-900 text-sm sm:text-base">
                          {formatDate(salary.month, salary.day, salary.year)}
                        </div>
                        <div className="text-emerald-700 font-semibold text-lg sm:text-xl">
                          {formatMoney(salary.amount)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(salary)}
                          className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(salary)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-gray-100"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Balance:</span>
                        <span className="font-medium">{formatMoney(salary.balance || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Comments:</span>
                        <span className="text-right max-w-[60%] truncate">{salary.comments || "No comments"}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No salary records found</div>
              )}
            </div>

            <div className="hidden lg:block rounded-md border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentSalaries.length > 0 ? (
                    currentSalaries.map((salary, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatDate(salary.month, salary.day, salary.year)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-700">
                          {formatMoney(salary.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatMoney(salary.balance || 0)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {salary.comments || "No comments"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(salary)}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(salary)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-gray-100"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No salary records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left order-2 sm:order-1">
                  Showing {(currentPage - 1) * salariesPerPage + 1} to{" "}
                  {Math.min(currentPage * salariesPerPage, monthlySalaries.length)} of {monthlySalaries.length} entries
                </div>
                <div className="flex gap-3 sm:gap-4 order-1 sm:order-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md text-white ${currentPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-[#207137]"}`}
                  >
                    Previous
                  </button>
                  <div className="flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-md text-white ${currentPage === totalPages ? "bg-gray-400 cursor-not-allowed" : "bg-[#207137]"}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isFormVisible && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex justify-center items-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                {isEditMode ? "Edit Salary Record" : "Add New Salary"}
              </h2>
              <button onClick={handleCloseForm} className="text-gray-500 hover:text-gray-700 p-1">
                <FaTimes className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <input
                    id="month"
                    name="month"
                    value={isEditMode ? editingSalary?.month : newSalary.month}
                    onChange={handleChange}
                    placeholder="Enter month (e.g. January)"
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                      Day
                    </label>
                    <input
                      type="number"
                      id="day"
                      name="day"
                      value={isEditMode ? editingSalary?.day : newSalary.day}
                      onChange={handleChange}
                      min={1}
                      max={31}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      value={isEditMode ? editingSalary?.year : newSalary.year}
                      onChange={handleChange}
                      min={2000}
                      max={2100}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={isEditMode ? editingSalary?.amount : newSalary.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    min={0}
                    step={0.01}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
                    Balance
                  </label>
                  <input
                    type="number"
                    id="balance"
                    name="balance"
                    value={isEditMode ? editingSalary?.balance : newSalary.balance}
                    onChange={handleChange}
                    placeholder="Enter balance"
                    min={0}
                    step={0.01}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                    Comments
                  </label>
                  <textarea
                    id="comments"
                    name="comments"
                    value={isEditMode ? editingSalary?.comments : newSalary.comments}
                    onChange={handleChange}
                    placeholder="Add any comments about this salary payment"
                    rows={3}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 text-sm sm:text-base"
                >
                  {isEditMode ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


