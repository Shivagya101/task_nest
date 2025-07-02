import clsx from "clsx";
import React from "react";
import { FaTasks, FaTrashAlt, FaUsers } from "react-icons/fa";
import {
  MdDashboard,
  MdOutlineAddTask,
  MdOutlinePendingActions,
  MdSettings,
  MdTaskAlt,
  MdAccessTime,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { setOpenSidebar } from "../redux/slices/authSlice";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { useGetAllTaskQuery } from "../redux/slices/api/taskApiSlice";

const linkData = [
  {
    label: "Dashboard",
    link: "dashboard",
    icon: <MdDashboard />,
  },
  {
    label: "Tasks",
    link: "tasks",
    icon: <FaTasks />,
  },
  {
    label: "Completed",
    link: "completed/completed",
    icon: <MdTaskAlt />,
  },
  {
    label: "In Progress",
    link: "in-progress/in progress",
    icon: <MdOutlinePendingActions />,
  },
  {
    label: "To Do",
    link: "todo/todo",
    icon: <MdOutlinePendingActions />,
  },
  {
    label: "Team",
    link: "team",
    icon: <FaUsers />,
  },
  {
    label: "Status",
    link: "status",
    icon: <IoCheckmarkDoneOutline />,
  },
  {
    label: "Trash",
    link: "trashed",
    icon: <FaTrashAlt />,
  },
];

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const sidebarLinks = user?.isAdmin ? linkData : linkData.slice(0, 5);

  // Fetch tasks due in less than 3 days
  const { data: lessThan3DaysData, isLoading: loadingLessThan3Days } = useGetAllTaskQuery({
    strQuery: "",
    isTrashed: "",
    search: "",
    lessThan3Days: true,
  });
  const lessThan3DaysTasks = lessThan3DaysData?.tasks || [];

  const closeSidebar = () => {
    dispatch(setOpenSidebar(false));
  };

  const NavLink = ({ el }) => {
    return (
      <Link
        onClick={closeSidebar}
        to={el.link}
        className={clsx(
          "w-full lg:w-3/4 flex gap-2 px-2 sm:px-3 py-2 rounded-full items-center text-gray-800 dark:text-gray-400 text-sm sm:text-base md:text-lg hover:bg-emerald-100/40",
          path === el.link.split("/")[0] ? "bg-emerald-700 text-white" : ""
        )}
      >
        {el.icon}
        <span className='hover:text-emerald-700'>{el.label}</span>
      </Link>
    );
  };

  return (
    <div className='w-full h-full flex flex-col gap-4 sm:gap-6 p-2 sm:p-5'>
      <h1 className='flex gap-1 items-center'>
        <p className='bg-emerald-600 p-1 sm:p-2 rounded-full'>
          <MdOutlineAddTask className='text-white text-xl sm:text-2xl font-black' />
        </p>
        <span className='text-xl sm:text-2xl font-bold text-black dark:text-white'>
          TaskNest
        </span>
      </h1>

      <div className='flex-1 flex flex-col gap-y-3 sm:gap-y-5 py-4 sm:py-8'>
        {sidebarLinks.map((link) => (
          <NavLink el={link} key={link.label} />
        ))}
      </div>

      <div className=''>
        <button className='w-full flex gap-2 p-2 items-center text-base sm:text-lg text-gray-800 dark:text-white'>
          <MdSettings />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
