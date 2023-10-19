import { useEffect, useState } from "react";
import Task from "./Task";
import { TaskForm } from "./TaskForm";
import { toast } from 'react-toastify';
import axios from "axios";
import { URL } from "../App";
import loadingImg from "../assets/loader.gif";

export const TaskList = () => {
  const [formData, setFormData] = useState({
    name: "",
    completed: false
  });
  const {name} = formData;
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [taskID, setTaskID] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = async (event) => {
    const {name, value} = event.target;
    setFormData({
      ...formData,
      [name]:value
    });
  }

  //Get the task from the database

  const getTasks = async () => {
    setIsLoading(true);
    try {
      const {data} = await axios.get(`${URL}/api/tasks`);
      console.log(data);
      setTasks(data);
      setIsLoading(false);
    } catch (error) {
      toast.error(error.message);
      setIsLoading(false);
      console.log(error);
    }
  }

  //Fetch the data from the database 
  useEffect(() => {
    getTasks()
  }, []);

  const createTask = async (event) => {
    event.preventDefault();
    console.log(formData);
    if(name === ""){
      return toast.error('Please enter some text');
    }
    try {
      await axios.post(`${URL}/api/tasks`, formData);
      toast.success("Successfully Added a Task");
      setFormData({
        ...formData,
        name: ""
      });
      getTasks();
      
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  }

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${URL}/api/tasks/${id}`);
      getTasks();
    } catch (error) {
      toast.error(error.message);
    }
  }

  const getSingleTask = async (task) => {
    setFormData({
      name: task.name,
      completed: false
    });
    setTaskID(task._id);
    setIsEditing(true);
  }

  const updateTask = async (event) => {
    event.preventDefault();
    if(name === ""){
      return toast.error("Input field cannot be empty");
    }
    try {
      await axios.put(`${URL}/api/tasks/${taskID}`, formData);
      setFormData({
        ...formData,
        name: ""
      });
      setIsEditing(false);
      getTasks();
    } catch (error) {
      toast.error()
    }
  }

  const setTaskComplete = async (task) => {
    const newFormData = {
      name: task.name,
      completed: true
    };
    try {
      await axios.put(`${URL}/api/tasks/${task._id}`, newFormData);
      getTasks();
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    const cTasks = tasks.filter((c_task) =>{
      return c_task.completed === true;
    });
    setCompletedTasks(cTasks);
  }, [tasks])
  
  return (
    <div>
        <h2>Task Manager</h2>
        <TaskForm 
          handleInputChange={handleInputChange}
          name={name}
          createTask={createTask}
          isEditing={isEditing}
          updateTask={updateTask}
        />
        <div className="--flex-between --pb">
            <p>
                <b>Total Tasks: </b> {tasks.length > 0 && (tasks.length)}
            </p>
            <p>
                <b>Completed Tasks: </b> {completedTasks.length}
            </p>
        </div>
        <hr />
        {
          isLoading && 
          <div className="--flex-center">
            <img src={loadingImg} alt="loading" />
          </div>
        }

        {
          !isLoading && tasks.length === 0 ? (
            <p>No Tasks Added</p>
          ): (
            <>
              {tasks.map((task, index) => {
                return (
                  <Task 
                    key={task._id}
                    task={task}
                    index={index}
                    deleteTask={deleteTask}
                    getSingleTask={getSingleTask}
                    setTaskComplete={setTaskComplete}
                  />
                )
              })}
            </>
          )
        }
        
    </div>
  )
}
