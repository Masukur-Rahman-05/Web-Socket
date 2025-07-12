import React from "react";

export const Output = () => {
  return (
    <div>
      <button className="bg-green-800 text-white px-5 py-[8px] rounded-md mb-5">
        Run
      </button>
      <div>
        <div className="w-full h-[90vh] bg-stone-800 p-4 rounded-md">
          <h2 className="text-xl text-green-700 font-semibold mb-2 tracking-widest">
            Output
          </h2>
        </div>
      </div>
    </div>
  );
};
