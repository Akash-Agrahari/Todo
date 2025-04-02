import { createSlice } from "@reduxjs/toolkit";

const initialState = [
  {
    id: 1,
    name: "Task 1",
    deadline: "2025-04-02 | 19:00", 
    completed: false,
  },
  {
    id: 2,
    name: "Task 2",
    deadline: "2025-04-02 | 16:00",
    completed: false,
  },
];

const taskSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        addTask: function (state, action) {
            state.push({
                id: Date.now(),
                name: action.payload.name,
                deadline: action.payload.deadline, // Already formatted
                completed: false,
            });
        },
        toggleTask: function (state, action) {
            const task = state.find((task) => task.id === action.payload);
            if (task) task.completed = !task.completed;
        },
        deleteTask: function (state, action) {
            return state.filter((task) => task.id !== action.payload);
        },
        editTask: function (state, action) {
            const task = state.find((task) => task.id === action.payload.id);
            if (task) {
                task.name = action.payload.name;
                task.deadline = action.payload.deadline; // Already formatted
            }
        },
        sortTasks: (state, action) => {
            const { sortBy } = action.payload;
            let sortedTasks = [...state];         
            if (sortBy === "Deadline") {
                sortedTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
            } else if (sortBy === "Name") {
                sortedTasks.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortBy === "Completed") {
                sortedTasks.sort((a, b) => b.completed - a.completed);
            }
        
            return sortedTasks; 
        }
        
    }
});

export const { addTask, toggleTask, deleteTask, editTask, sortTasks } = taskSlice.actions;
export default taskSlice.reducer;