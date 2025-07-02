import React from "react";
import TaskCard from "./TaskCard";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const STAGES = [
  { key: "todo", label: "To Do" },
  { key: "in progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const BoardView = ({ tasks = [], onStageChange, activeStage, refetch }) => {
  // Group tasks by stage
  const tasksByStage = STAGES.reduce((acc, stage) => {
    acc[stage.key] = tasks.filter((t) => t.stage === stage.key);
    return acc;
  }, {});

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    const fromStage = source.droppableId;
    const toStage = destination.droppableId;
    if (fromStage !== toStage && onStageChange) {
      onStageChange(draggableId, toStage);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="w-full py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 2xl:gap-10">
        {STAGES.map((stage) => (
          <Droppable droppableId={stage.key} key={stage.key}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-gray-50 dark:bg-gray-900 rounded p-2 min-h-[200px]"
              >
                <div className={
                  "font-bold mb-2 text-center " +
                  (activeStage === stage.key ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300")
                }>
                  {stage.label}
                </div>
                {tasksByStage[stage.key]?.map((task, idx) => (
                  <Draggable draggableId={task._id} index={idx} key={task._id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="mb-4"
                      >
                        <TaskCard task={task} refetch={refetch} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {tasksByStage[stage.key]?.length === 0 && activeStage && activeStage === stage.key && (
                  <div className="text-center text-gray-400 py-8 select-none">
                    No tasks
                  </div>
                )}
                {tasksByStage[stage.key]?.length === 0 && activeStage && activeStage !== stage.key && (
                  <div className="text-center text-gray-400 py-8 select-none">
                    Drag and drop a task here
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default BoardView;
