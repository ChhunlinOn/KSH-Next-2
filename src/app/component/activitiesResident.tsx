import React, { useState } from "react";

type ProgramBoxProps = {
  profile: string;
  name: string;
  score: string;
  coment: string;
  onValueChange: (val: string) => void;
  onCommentChange?: (comment: string) => void;
};

const ProgramInfoBox: React.FC<ProgramBoxProps> = ({
  profile,
  name,
  score,
  coment,
  onValueChange,
  onCommentChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: "1", label: "Good", icon: "https://res.cloudinary.com/dq5usncvp/image/upload/v1733993278/correct_removebg_preview_9ab70cbf0a.png" },
    { value: "3", label: "50/50", icon: "https://res.cloudinary.com/dq5usncvp/image/upload/v1733993278/medium_removebg_preview_b99a72ec49.png" },
    { value: "2", label: "Not Good", icon: "https://res.cloudinary.com/dq5usncvp/image/upload/v1733993278/incorrect_removebg_preview_b11a69e95e.png" },
    { value: "4", label: "Uncheckable", icon: "❓" },
  ];

  const selectedOption = options.find((opt) => opt.value === String(score));

  const handleSelect = (value: string) => {
    onValueChange(value);
    setIsOpen(false);
  };

  return (
    <tr className="border-b hover:bg-gray-50 transition-all duration-200">
      <td className="px-4 py-6">
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-2xl shadow-md">
          <div className="flex items-center gap-4 w-full md:w-1/3">
            <img
              src={profile}
              alt={name}
              className="w-20 h-20 rounded-full object-cover border-4 border-green-600 shadow"
            />
            <span className="text-lg font-semibold text-gray-800 break-words">
              {name}
            </span>
          </div>

          <div className="w-full md:w-1/3 relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm text-base flex items-center justify-between"
            >
              <span className="flex items-center">
                {selectedOption?.icon?.startsWith("http") ? (
                  <img src={selectedOption.icon} alt={selectedOption.label} className="w-6 h-6 mr-2" />
                ) : (
                  <span className="mr-2">{selectedOption?.icon}</span>
                )}
                {selectedOption?.label} ({score})
              </span>

              <svg
                className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg">
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 flex items-center text-base"
                  >
                    {option.icon.startsWith("http") ? (
                      <img src={option.icon} alt={option.label} className="w-6 h-6 mr-2" />
                    ) : (
                      <span className="mr-2">{option.icon}</span>
                    )}
                    {option.label}
                  </button>
                ))}

              </div>
            )}
          </div>

          <div className="w Nor-full md:w-1/3">
            <input
              value={coment}
              type="text"
              placeholder="Write comment..."
              onChange={(e) => onCommentChange?.(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm text-base"
            />
          </div>
        </div>
      </td>
    </tr>
  );
};

export default ProgramInfoBox;