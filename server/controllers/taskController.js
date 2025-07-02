import asyncHandler from "express-async-handler";
import Notice from "../models/notis.js";
import Task from "../models/taskModel.js";
import User from "../models/userModel.js";

const createTask = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('DEBUG: userId in createTask:', userId);
    console.log('DEBUG: req.user in createTask:', req.user);
    const { title, team, stage, date, deadline, priority, assets, links, description } =
      req.body;

    //alert users of the task
    let text = "New task has been assigned to you";
    if (team?.length > 1) {
      text = text + ` and ${team?.length - 1} others.`;
    }

    text =
      text +
      ` The task priority is set a ${priority} priority, so check and act accordingly. The task date is ${new Date(
        date
      ).toDateString()}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };
    let newLinks = null;

    if (links) {
      newLinks = links?.split(",");
    }

    const task = await Task.create({
      title,
      team,
      stage: stage.toLowerCase(),
      date,
      deadline,
      priority: priority.toLowerCase(),
      assets,
      activities: activity,
      links: newLinks || [],
      description,
      createdBy: userId,
    });

    console.log('DEBUG: Task saved:', task);

    await Notice.create({
      team,
      text,
      task: task._id,
    });

    const users = await User.find({
      _id: team,
    });

    if (users) {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];

        await User.findByIdAndUpdate(user._id, { $push: { tasks: task._id } });
      }
    }

    res
      .status(200)
      .json({ status: true, task, message: "Task created successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

const duplicateTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.isAdmin;

    const task = await Task.findById(id);

    //alert users of the task
    let text = "New task has been assigned to you";
    if (team.team?.length > 1) {
      text = text + ` and ${task.team?.length - 1} others.`;
    }

    text =
      text +
      ` The task priority is set a ${
        task.priority
      } priority, so check and act accordingly. The task date is ${new Date(
        task.date
      ).toDateString()}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };

    const newTask = await Task.create({
      ...task,
      title: "Duplicate - " + task.title,
    });

    newTask.team = task.team;
    newTask.subTasks = task.subTasks;
    newTask.assets = task.assets;
    newTask.links = task.links;
    newTask.priority = task.priority;
    newTask.stage = task.stage;
    newTask.activities = activity;
    newTask.description = task.description;

    await newTask.save();

    await Notice.create({
      team: newTask.team,
      text,
      task: newTask._id,
    });

    res
      .status(200)
      .json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const isAdmin = req.user.isAdmin;
  const { title, date, deadline, team, stage, priority, assets, links, description } = req.body;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }
    if (!isAdmin && String(task.createdBy) !== String(userId)) {
      return res.status(403).json({ status: false, message: "Not authorized to update this task" });
    }

    let newLinks = [];
    if (links) {
      newLinks = links.split(",");
    }

    task.title = title;
    task.date = date;
    task.deadline = deadline;
    task.priority = priority.toLowerCase();
    task.assets = assets;
    task.stage = stage.toLowerCase();
    task.team = team;
    task.links = newLinks;
    task.description = description;

    await task.save();

    res.status(200).json({ status: true, message: "Task updated successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const updateTaskStage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    const task = await Task.findById(id);

    task.stage = stage.toLowerCase();

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Task stage changed successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const updateSubTaskStage = asyncHandler(async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;
    const { status } = req.body;

    await Task.findOneAndUpdate(
      {
        _id: taskId,
        "subTasks._id": subTaskId,
      },
      {
        $set: {
          "subTasks.$.isCompleted": status,
        },
      }
    );

    res.status(200).json({
      status: true,
      message: status
        ? "Task has been marked completed"
        : "Task has been marked uncompleted",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
});

const createSubTask = asyncHandler(async (req, res) => {
  const { title, tag, date } = req.body;
  const { id } = req.params;

  try {
    const newSubTask = {
      title,
      date,
      tag,
      isCompleted: false,
    };

    const task = await Task.findById(id);

    task.subTasks.push(newSubTask);

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "SubTask added successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const getTasks = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const isAdmin = req.user.isAdmin;
  const { stage, isTrashed, search, lessThan3Days, filter } = req.query;

  let query = { isTrashed: isTrashed ? true : false };

  // Filtering logic
  if (!isAdmin) {
    if (filter === "assignedToMe") {
      query.team = { $all: [userId] };
    } else if (filter === "assignedByMe") {
      query.createdBy = userId;
    } else {
      query.$or = [
        { team: { $all: [userId] } },
        { createdBy: userId }
      ];
    }
  }
  if (stage) {
    query.stage = stage;
  }

  if (lessThan3Days) {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    query.deadline = { $lte: threeDaysLater, $gte: now };
  }

  if (search) {
    const searchQuery = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { stage: { $regex: search, $options: "i" } },
        { priority: { $regex: search, $options: "i" } },
      ],
    };
    query = { ...query, ...searchQuery };
  }

  console.log('DEBUG: getTasks query:', query);
  let queryResult = Task.find(query)
    .populate({
      path: "team",
      select: "name title email",
    })
    .populate({
      path: "createdBy",
      select: "_id name email",
    })
    .sort({ _id: -1 });

  const tasks = await queryResult;
  console.log('DEBUG: getTasks found:', tasks.length);

  res.status(200).json({
    status: true,
    tasks,
  });
});

const getTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate({
        path: "team",
        select: "name title role email",
      })
      .populate({
        path: "activities.by",
        select: "name",
      })
      .populate({
        path: "createdBy",
        select: "_id name email",
      })
      .sort({ _id: -1 });

    res.status(200).json({
      status: true,
      task,
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch task", error);
  }
});

const postTaskActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { type, activity } = req.body;

  try {
    const task = await Task.findById(id);

    const data = {
      type,
      activity,
      by: userId,
    };
    task.activities.push(data);

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Activity posted successfully." });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const trashTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const isAdmin = req.user.isAdmin;
  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }
    if (!isAdmin && String(task.createdBy) !== String(userId)) {
      return res.status(403).json({ status: false, message: "Not authorized to delete this task" });
    }
    task.isTrashed = true;
    await task.save();
    res.status(200).json({ status: true, message: `Task trashed successfully.` });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const deleteRestoreTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const isAdmin = req.user.isAdmin;
  const { actionType } = req.query;
  try {
    const task = id ? await Task.findById(id) : null;
    if (id && task && !isAdmin && String(task.createdBy) !== String(userId)) {
      return res.status(403).json({ status: false, message: "Not authorized to delete/restore this task" });
    }
    if (actionType === "delete") {
      await Task.findByIdAndDelete(id);
    } else if (actionType === "deleteAll") {
      await Task.deleteMany({ isTrashed: true });
    } else if (actionType === "restore") {
      const resp = await Task.findById(id);
      resp.isTrashed = false;
      resp.save();
    } else if (actionType === "restoreAll") {
      await Task.updateMany(
        { isTrashed: true },
        { $set: { isTrashed: false } }
      );
    }
    res.status(200).json({ status: true, message: `Operation performed successfully.` });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

const dashboardStatistics = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.isAdmin;

    // Fetch all tasks from the database
    const allTasks = isAdmin
      ? await Task.find({ isTrashed: false })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .populate({
            path: "createdBy",
            select: "_id name email",
          })
          .sort({ _id: -1 })
      : await Task.find({
          isTrashed: false,
          $or: [
            { team: { $all: [userId] } },
            { createdBy: userId }
          ]
        })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .populate({
            path: "createdBy",
            select: "_id name email",
          })
          .sort({ _id: -1 });

    const users = await User.find({ isActive: true })
      .select("name title role isActive createdAt")
      .limit(10)
      .sort({ _id: -1 });

    // Group tasks by stage and calculate counts (ensure all stages are present)
    const STAGES = ["todo", "in progress", "completed"];
    const groupedTasks = STAGES.reduce((result, stage) => {
      result[stage] = allTasks.filter((t) => t.stage === stage).length;
      return result;
    }, {});

    // Group tasks by priority (ensure all priorities are present)
    const PRIORITIES = ["high", "medium", "normal", "low"];
    const graphData = PRIORITIES.map((priority) => ({
      name: priority,
      total: allTasks.filter((t) => t.priority === priority).length,
    }));

    // Calculate total tasks
    const totalTasks = allTasks.length;
    const last10Task = allTasks?.slice(0, 10);

    // Combine results into a summary object
    const summary = {
      totalTasks,
      last10Task,
      users: isAdmin ? users : [],
      tasks: groupedTasks,
      graphData,
    };

    res
      .status(200)
      .json({ status: true, ...summary, message: "Successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
});

const markTaskCompleted = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const isAdmin = req.user.isAdmin;
  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }
    if (!isAdmin && String(task.createdBy) !== String(userId)) {
      return res.status(403).json({ status: false, message: "Not authorized to mark this task as completed" });
    }
    task.isCompleted = !task.isCompleted;
    if (task.isCompleted) {
      task.stage = "completed";
    } else {
      task.stage = "todo";
    }
    await task.save();
    res.status(200).json({ status: true, message: `Task marked as ${task.isCompleted ? "completed" : "not completed"}.`, isCompleted: task.isCompleted });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
});

export {
  createSubTask,
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  duplicateTask,
  getTask,
  getTasks,
  postTaskActivity,
  trashTask,
  updateSubTaskStage,
  updateTask,
  updateTaskStage,
  markTaskCompleted,
};
