export default function HomeScreen() {
  return (
    <div className="py-10 flex flex-col container gap-6">
      <button className="py-2 px-10 rounded text-white bg-blue-500 font-medium self-start">Add Task</button>

      <div className="flex items-center gap-4 p-4 rounded-md shadow-lg">
        {/* <span className="font-medium text-lg">Search</span> */}
        <input type="search" placeholder="Search" className="w-full p-2 border rounded" />

        <label className="font-medium shrink-0">Sort By</label>
        <input type="search" placeholder="Search" className="w-full p-2 border rounded" />
      </div>
    </div>
  )
}
