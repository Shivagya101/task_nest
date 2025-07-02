import clsx from "clsx";
import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { useGetSingleTaskQuery } from "../../redux/slices/api/taskApiSlice";

import {
  BGS,
  PRIOTITYSTYELS,
  TASK_TYPE,
  formatDate,
} from "../../utils/index.js";
import UserInfo from "../UserInfo.jsx";
import { TaskAssets, TaskColor, TaskDialog } from "./index";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const TaskCard = ({ task, refetch }) => {
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(task.isCompleted);

  const creatorId = task.createdBy?._id || task.createdBy;
  const canMarkCompleted = user.isAdmin || String(creatorId) === String(user._id);

  const isAssignedToMe = task.team?.some((u) => String(u._id) === String(user._id));

  const handleMarkCompleted = async () => {
    try {
      const res = await fetch(`/api/task/${task._id}/mark-completed`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (data.status) {
        setIsCompleted(data.isCompleted);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to update task status");
    }
  };

  return (
    <>
      <div className='w-full h-fit bg-white dark:bg-[#1f1f1f] shadow-md p-4 rounded'>
        <div className='w-full flex justify-between'>
          <div
            className={clsx(
              "flex flex-1 gap-1 items-center text-sm font-medium",
              PRIOTITYSTYELS[task?.priority]
            )}
          >
            <span className='text-lg'>{ICONS[task?.priority]}</span>
            <span className='uppercase'>{task?.priority} Priority</span>
          </div>
          <TaskDialog task={task} refetch={refetch} />
        </div>
        <>
          <Link to={`/task/${task._id}`}>
            <div className='flex items-center gap-2'>
              <TaskColor className={TASK_TYPE[task.stage]} />
              <h4 className='text- line-clamp-1 text-black dark:text-white'>
                {task?.title}
              </h4>
              {isAssignedToMe && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-200 text-blue-800">
                  Assigned to You
                </span>
              )}
            </div>
          </Link>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            Created: {formatDate(new Date(task?.date))}
          </span>
          {task.deadline && (
            <span className='text-sm text-red-600 dark:text-red-400 block'>
              Deadline: {formatDate(new Date(task.deadline))}
            </span>
          )}
          {canMarkCompleted && (
            <button
              onClick={handleMarkCompleted}
              className={`mt-2 px-3 py-1 rounded text-xs font-semibold ${isCompleted ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"}`}
            >
              {isCompleted ? "Mark as Not Completed" : "Mark as Completed"}
            </button>
          )}
        </>

        <div className='w-full border-t border-gray-200 dark:border-gray-700 my-2' />
        <div className='flex items-center justify-between mb-2'>
          <TaskAssets
            activities={task?.activities?.length}
            assets={task?.assets?.length}
          />

          <div className='flex flex-row-reverse'>
            {task?.team?.length > 0 &&
              task?.team?.map((m, index) => (
                <div
                  key={index}
                  className={clsx(
                    "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                    BGS[index % BGS?.length]
                  )}
                >
                  <UserInfo user={m} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskCard;
