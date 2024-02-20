import React from 'react';

const FilterCard = ({ selectedLocations, availableLocations, colorByOptions, handleLocationChange, handleLocationChangeColorby, applyFilters, isColorByDisabled }) => {
  return (              <div className="">
  <div className="flex flex-col w-full p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
<div className="flex flex-row text-center items-center w-full justify-center">
<svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="#737373" height="18px" width="18px" version="1.1" id="Layer_1" viewBox="0 0 300.906 300.906" xmlSpace="preserve">
<g>
<g>
<path d="M288.953,0h-277c-5.522,0-10,4.478-10,10v49.531c0,5.522,4.478,10,10,10h12.372l91.378,107.397v113.978    c0,3.688,2.03,7.076,5.281,8.816c1.479,0.792,3.101,1.184,4.718,1.184c1.94,0,3.875-0.564,5.548-1.68l49.5-33    c2.782-1.854,4.453-4.977,4.453-8.32v-80.978l91.378-107.397h12.372c5.522,0,10-4.478,10-10V10C298.953,4.478,294.476,0,288.953,0    z M167.587,166.77c-1.539,1.809-2.384,4.105-2.384,6.48v79.305l-29.5,19.666V173.25c0-2.375-0.845-4.672-2.384-6.48L50.585,69.531    h199.736L167.587,166.77z M278.953,49.531h-257V20h257V49.531z"/>
</g>
</g>
</svg>
<h2 className="text-xl font-medium text-gray-900 dark:text-white ml-2">Filters</h2>   

</div>
<div className="bg-gray-200 h-1 mt-3 mb-10"></div>

    <div className="flex flex-col items-center space-x-2">

      <h3 className="mb-5 text-lg font-medium text-gray-900 dark:text-white">Select an option</h3>
      <select id="location" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        onChange={(e) => handleLocationChange(e.target.value)}
      >
        <option selected value="all">All Locations</option>
        {availableLocations.map((location) => (
          <option key={location} value={location}>
            {location.charAt(0).toUpperCase() + location.slice(1)}
          </option>
        ))}
      </select>
    </div>

    <div className="mt-10">

<h3 className="mb-5 text-lg font-medium text-gray-900 dark:text-white">Color by</h3>
<ul className="grid w-full gap-6 md:grid-cols-2">
<li>
<input type="radio" id="none" name="none" value="none" className="hidden peer" required checked={isColorByDisabled ? true : colorBy === 'none'}
onChange={handleLocationChangeColorby}
disabled={isColorByDisabled} />
<label htmlFor="none" className={`flex items-center justify-center w-full p-1 text-center text-gray-500 bg-white border border-gray-200 rounded-2xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-custom-green-400 peer-checked:text-custom-green-500  ${isColorByDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'}  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
<div className="block">
<div className="w-full text-center flex justify-center">Default</div>
</div>

</label>
</li>
<li>
<input type="radio" id="treatment" name="treatment" value="treatment" className="hidden peer" checked={isColorByDisabled ? false : colorBy === 'treatment'}
onChange={handleLocationChangeColorby}
disabled={isColorByDisabled} />
<label htmlFor="treatment" className={`flex items-center justify-center w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-2xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-custom-green-400 peer-checked:text-custom-green-500  ${isColorByDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'}  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
<div className="block">
<div className="w-full">Treatment</div>
</div>

</label>
</li>
<li>
<input type="radio" id="age" name="age" value="age" className="hidden peer" checked={isColorByDisabled ? false : colorBy === 'age'}
onChange={handleLocationChangeColorby} />
<label htmlFor="age" className={`flex items-center justify-center w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-2xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-custom-green-400 peer-checked:text-custom-green-500  ${isColorByDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'}  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
<div className="block">
<div className="w-full">Age</div>
</div>

</label>
</li>
{colorByOptions.map((option, index) => (
<li key={index}>
<input
type="radio"
id={option}
name={option}
className="hidden peer"
value={option}
checked={isColorByDisabled ? false : colorBy === option}
onChange={handleLocationChangeColorby}
disabled={isColorByDisabled}
/>
<label
htmlFor={option}
className={`flex items-center justify-center ${
isColorByDisabled
? 'cursor-not-allowed'
: 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'
} w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-2xl cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-custom-green-400 peer-checked:text-custom-green-500  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
>
<div className="block">
<div className="w-full">{(option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1)}</div>
</div>
</label>
</li>
))}
</ul>
</div>
<div className="flex w-full items-center margin-0 justify-center my-8">
    <button
      onClick={applyFilters}
      className="bg-custom-green-400 hover:bg-custom-green-500 text-white font-bold py-2 px-4 rounded-xl"
    >
      Apply Filters
    </button>
  </div>
</div>
  </div>)