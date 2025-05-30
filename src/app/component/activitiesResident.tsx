import React from "react";

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

          <div className="w-full md:w-1/3">
            <select
              value={score}
              onChange={(e) => onValueChange(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm text-base"
            >
              <option value="1">✅ Good</option>
              <option value="3">🔄 50/50</option>
              <option value="2">❌ Not Good</option>
              <option value="4">❓ Uncheckable</option>
            </select>
          </div>

          <div className="w-full md:w-1/3">
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