import { useSelector, useDispatch } from "react-redux";
import {
  addTask,
  toggleTask,
  deleteTask,
  editTask,
  sortTasks,
} from "../store/slice";
import { useEffect, useState } from "react";

const TaskList = () => {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasks);
  const [createTask, setCreateTask] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editDeadline, setEditDeadline] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Sort by.");

  const alertedTasks = new Set(); // Track tasks that have already triggered an alert

  // Function to check for tasks due within 1 hour
  const checkDueTasks = () => {
    const now = new Date();
    tasks.forEach((task) => {
      const [date, time] = task.deadline.split(" | ");
      const taskDeadline = new Date(`${date}T${time}`);
      const timeDifference = taskDeadline - now; // Difference in milliseconds
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

      if (timeDifference > 0 && timeDifference <= oneHour && !alertedTasks.has(task.id)) {
        alert(`Task "${task.name}" is due within 1 hour!`);
        alertedTasks.add(task.id); // Mark this task as alerted
      }
    });
  };

  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      checkDueTasks(); // Check for due tasks every second
    }, 1000);

    return () => clearInterval(timer);
  }, [tasks]); // Re-run when tasks change

  const handleSort = (criteria) => {
    dispatch(sortTasks({ sortBy: criteria })); // Ensure `sortTasks` is an action creator
    setSelected(criteria);
    setOpen(false);
  };

  const formatDeadline = (datetime) => {
    const date = new Date(datetime);
    const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
    const formattedTime = date.toTimeString().split(" ")[0].slice(0, 5); // HH:mm
    return `${formattedDate} | ${formattedTime}`;
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskName || !deadline) return;
    const formattedDeadline = formatDeadline(deadline); // Format the deadline
    dispatch(addTask({ name: taskName, deadline: formattedDeadline }));
    setTaskName("");
    setDeadline("");
    setCreateTask(false);
  };

  const handleEditTask = (e) => {
    e.preventDefault();
    if (!editTaskName || !editDeadline) return;
    const formattedDeadline = formatDeadline(editDeadline); // Format the deadline
    dispatch(editTask({ id: editingId, name: editTaskName, deadline: formattedDeadline }));
    setEditTaskName("");
    setEditDeadline("");
    setEditingId(null);
    setEditDialog(false);
  };

  const handleDeleteTask = () => {
    dispatch(deleteTask(editingId));
    setConfirmDelete(false);
    setEditingId(null);
  };

  const options = { weekday: "short", month: "short", day: "numeric" };
  const formattedDate = currentTime.toLocaleDateString("en-US", options);
  const time = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="main w-full h-screen fixed flex flex-col">
      <div className="nav border-b flex items-center justify-between border-[#] w-full px-5 py-3">
        <div className="left gap-2 justify-center flex items-center">
          <h1 className="text-xl select-none font-mono tracking-tighter">
            {time} |
          </h1>
          <h1 className="text-xl select-none font-mono tracking-tighter">
            {" "}
            {formattedDate}
          </h1>
        </div>
        <div className="right gap-1 select-none items-center flex justify-center">
          <button
            onClick={() => setCreateTask(true)}
            className="p-2 cursor-pointer transition-all rounded-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
          <h1 className="font-mono font-semibold text-xl">Task</h1>
          <div className="dot w-[15px] h-[15px] rounded-full bg-red-500"></div>
        </div>
      </div>

      <div className="hero font-mono flex items-center justify-center w-full h-full">
        <div className="sort absolute left-0  top-1/5 ">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 font-bold  outline-0 cursor-pointer  bg-white text-black border-r border-y"
          >
            <h1 className="select-none tracking-tighter">{selected}</h1>
          </button>
          {open && (
            <div className="absolute mt-2 w-40 bg-white border-r border-y ">
              <button
                onClick={() => handleSort("Deadline")}
                className="block px-4 py-2 w-full text-left hover:bg-gray-100"
              >
                Deadline
              </button>
              <button
                onClick={() => handleSort("Name")}
                className="block px-4 py-2 w-full text-left hover:bg-gray-100"
              >
                Name
              </button>
              <button
                onClick={() => handleSort("Completed")}
                className="block px-4 py-2 w-full text-left hover:bg-gray-100"
              >
                Completed
              </button>
            </div>
          )}
        </div>
        {tasks.length === 0 ? (
          <div className="quote absolute w-full top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center gap-5">
            <h1 className="text-2xl text-[#aaaaaa] select-none font-semibold tracking-tighter">
              "The best way to predict the future is to create it.”
            </h1>
            <h1 className="text-xl text-[#dadada] select-none font-semibold tracking-tighter">
              - Abraham Lincoln
            </h1>
          </div>
        ) : (
          <div className="todos-list w-[70%] z-[10]  px-5 py-5 gap-5 h-full flex flex-col overflow-y-auto pb-20 scrollbar-hide">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`task-box select-none flex items-center justify-between tracking-tighter border px-5 py-2 rounded ${
                  task.completed
                    ? "bg-green-500 text-white"
                    : "bg-white text-black"
                }`}
              >
                <div className="task-left flex items-center gap-3 w-[70%] justify-start p-2">
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => dispatch(toggleTask(task.id))}
                      className="hidden"
                    />
                    <span className="checkbox-icon"></span>
                  </label>
                  <h1
                    className={` task text-xl font-semibold ${
                      task.completed ? "line-through" : ""
                    }`}
                  >
                    {task.name}
                  </h1>
                </div>
                <div className="task-right flex items-center justify-end gap-5 w-[30%]">
                  <h1
                    className={`deadline text-md font-semibold ${
                      task.completed ? "line-through" : ""
                    }`}
                  >
                    {task.deadline}
                  </h1>
                  <div className="flex items-center justify-end gap-5">
                    {!task.completed && (
                      <button
                        onClick={() => {
                          setEditDialog(true);
                          setEditingId(task.id);
                          setEditTaskName(task.name);
                          setEditDeadline(task.deadline);
                        }}
                        className="border-none cursor-pointer transition-all"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l2.651 2.651-12.01 12.01H4.852v-2.651l12.01-12.01zM19.5 2.25a.75.75 0 011.06 0l1.19 1.19a.75.75 0 010 1.06l-1.19 1.19-2.25-2.25 1.19-1.19z"
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setConfirmDelete(true);
                        setEditingId(task.id);
                      }}
                      className="cursor-pointer transition-all border-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {createTask && (
          <div className="border z-[999] bg-white p-5 flex flex-col gap-5 items-center justify-center create-todo absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
            <button
              onClick={() => setCreateTask(false)}
              className="absolute top-0 right-0 p-2 cursor-pointer transition-all rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h1 className="text-xl select-none font-semibold tracking-tighter">
              Create a Task
            </h1>
            <form onSubmit={handleAddTask} className="flex flex-col items-start gap-3">
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                required
                placeholder="Task name"
                className="w-full px-5 py-2 border-none bg-[#f1f1f1] outline-0"
              />
              <div className="flex gap-2 items-center">
                <label htmlFor="deadline" className="text-black select-none font-semibold">
                  Deadline
                </label>
                <input
                  type="datetime-local" // Use datetime-local for both date and time
                  id="deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="cursor-pointer px-5 py-2 border-none bg-[#f1f1f1] outline-0"
                />
              </div>
              <div className="w-full pt-2">
                <input
                  type="submit"
                  value="Add"
                  className="font-bold text-lg tracking-tighter border cursor-pointer active:text-white active:bg-black w-full py-1"
                />
              </div>
            </form>
          </div>
        )}

        {editDialog && (
          <div className="border z-[999] bg-white p-5 flex flex-col gap-5 items-center justify-center create-todo absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
            <button
              onClick={() => setEditDialog(false)}
              className="absolute top-0 right-0 p-2 cursor-pointer transition-all rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h1 className="text-xl select-none font-semibold tracking-tighter">
              Edit Task.
            </h1>
            <form onSubmit={handleEditTask} className="flex flex-col items-start gap-3">
              <input
                type="text"
                value={editTaskName}
                onChange={(e) => setEditTaskName(e.target.value)}
                required
                placeholder="Task name"
                className="w-full px-5 py-2 border-none bg-[#f1f1f1] outline-0"
              />
              <div className="flex gap-2 items-center">
                <label htmlFor="editDeadline" className="text-black select-none font-semibold">
                  Deadline
                </label>
                <input
                  type="datetime-local" // Use datetime-local for both date and time
                  id="editDeadline"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="cursor-pointer px-5 py-2 border-none bg-[#f1f1f1] outline-0"
                />
              </div>
              <div className="w-full pt-2">
                <input
                  type="submit"
                  value="Save"
                  className="font-bold text-lg tracking-tighter border cursor-pointer active:text-white active:bg-black w-full py-1"
                />
              </div>
            </form>
          </div>
        )}

        {confirmDelete && (
          <div className="border z-[999] bg-white p-5 flex  flex-col gap-5 items-center justify-center create-todo  absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
            <h1 className="text-xl font-semibold tracking-tighter">
              Are you sure?
            </h1>
            <div className="flex gap-5 items-center justify-center">
              <button
                onClick={() => handleDeleteTask()}
                className="cursor-pointer border bg-white w-full py-1 px-5  text-xl font-bold tracking-tighter active:bg-black active:text-white"
              >
                Delete.
              </button>
              <button
                onClick={(e) => setConfirmDelete(false)}
                className="cursor-pointer border bg-white w-full py-1 px-5 text-xl font-bold tracking-tighter active:bg-black active:text-white"
              >
                Close.
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
