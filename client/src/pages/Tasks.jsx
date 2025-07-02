import React, { useEffect, useState } from "react";
import { FaList } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { MdGridView, MdAccessTime } from "react-icons/md";
import { useParams, useSearchParams } from "react-router-dom";
import { Button, Loading, Table, Tabs, Title } from "../components";
import { AddTask, BoardView } from "../components/tasks";
import { useGetAllTaskQuery, useChangeTaskStageMutation } from "../redux/slices/api/taskApiSlice";
import { TASK_TYPE } from "../utils";
import { useSelector } from "react-redux";

const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
  { title: "Less Than 3 Days", icon: <MdAccessTime /> },
];

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Assigned to Me", value: "assignedToMe" },
  { label: "Assigned by Me", value: "assignedByMe" },
];

const Tasks = () => {
  const params = useParams();
  const { user } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const category = searchParams.get("category");

  // Auto-select the 'Less Than 3 Days' tab if category=lessThan3Days
  const [selected, setSelected] = useState(category === "lessThan3Days" ? 2 : 0);
  const [open, setOpen] = useState(false);

  const status = params?.status || "";

  // Determine if the "Less Than 3 Days" tab is selected
  const isLessThan3Days = selected === 2;

  const [filter, setFilter] = useState("all");

  const { data, isLoading, refetch } = useGetAllTaskQuery({
    strQuery: status,
    isTrashed: "",
    search: searchTerm,
    lessThan3Days: isLessThan3Days,
    filter,
    userId: user?._id,
  });

  const [changeTaskStage] = useChangeTaskStageMutation();

  // Handler for drag-and-drop Kanban
  const handleStageChange = async (taskId, newStage) => {
    try {
      await changeTaskStage({ id: taskId, stage: newStage }).unwrap();
      refetch();
    } catch (err) {
      // Optionally show a toast
    }
  };

  useEffect(() => {
    refetch();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [open, selected, status]);

  // Refetch tasks when filter changes
  useEffect(() => {
    refetch();
  }, [filter]);

  // Refetch tasks when searchTerm changes
  useEffect(() => {
    refetch();
  }, [searchTerm]);

  // Listen to changes in the URL search param and update searchTerm
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setSearchTerm(urlSearch);
  }, [searchParams]);

  console.log('DEBUG: tasks from backend', data?.tasks);
  return isLoading ? (
    <div className='py-10'>
      <Loading />
    </div>
  ) : (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-4'>
        <Title title={status ? `${status} Tasks` : "Tasks"} />

        {!status && (
          <Button
            label='Create Task'
            icon={<IoMdAdd className='text-lg' />}
            className='flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md py-2 2xl:py-2.5'
            onClick={() => setOpen(true)}
          />
        )}
      </div>

      {/* Color legend for task types */}
      {!status && (
        <div className='flex gap-4 items-center mb-2'>
          <span className='flex items-center gap-1'><span className='inline-block w-3 h-3 rounded bg-blue-600'></span> To Do</span>
          <span className='flex items-center gap-1'><span className='inline-block w-3 h-3 rounded bg-yellow-600'></span> In Progress</span>
          <span className='flex items-center gap-1'><span className='inline-block w-3 h-3 rounded bg-green-600'></span> Completed</span>
        </div>
      )}

      <div>
        <Tabs tabs={TABS} setSelected={setSelected}>
          {selected === 0 ? (
            <BoardView tasks={data?.tasks} onStageChange={handleStageChange} activeStage={status} refetch={refetch} />
          ) : selected === 1 ? (
            <Table tasks={data?.tasks} />
          ) : (
            // Less Than 3 Days tab: show BoardView by default
            <BoardView tasks={data?.tasks} onStageChange={handleStageChange} activeStage={status} refetch={refetch} />
          )}
        </Tabs>
      </div>
      <AddTask open={open} setOpen={setOpen} />
    </div>
  );
};

export default Tasks;
