import { useState, useEffect } from "react";
import axios from "axios";

import { db } from "../../firebase";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

export default function Revision() {

  const [questionNumber,setQuestionNumber]=useState("");
  const [questionTitle,setQuestionTitle]=useState("");
  const [weekdays,setWeekdays]=useState([]);
  const [email,setEmail]=useState("");

  const [loading,setLoading]=useState(false);
  const [fetchLoading,setFetchLoading]=useState(false);
  const [calendarLoading,setCalendarLoading]=useState(false);

  const [tasks,setTasks]=useState([]);

  const [revisionStatus,setRevisionStatus]=useState({});

  const days=[
    "Monday","Tuesday","Wednesday",
    "Thursday","Friday","Saturday","Sunday"
  ];

  /* ================= LOAD TASKS ================= */

  const loadTasks=async()=>{

    const snapshot=await getDocs(collection(db,"revisionTasks"));

    const list=snapshot.docs.map(doc=>({
      id:doc.id,
      ...doc.data()
    }));

    setTasks(list);

  };

  useEffect(()=>{
    loadTasks();
  },[]);

  /* ================= FETCH QUESTION ================= */

  const fetchQuestion=async()=>{

    if(!questionNumber) return;

    setFetchLoading(true);

    const res=await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/visualize`,
      {questionNumber}
    );

    setQuestionTitle(res.data.question);

    setFetchLoading(false);

  };

  /* ================= SELECT WEEKDAY ================= */

  const toggleDay=(day)=>{

    if(weekdays.includes(day))
      setWeekdays(weekdays.filter(d=>d!==day))
    else
      setWeekdays([...weekdays,day])

  };

  /* ================= ADD TASK ================= */

  const addRevisionTask=async()=>{

    if(!questionNumber || !email || weekdays.length===0){
      alert("Fill all fields");
      return;
    }

    setLoading(true);

    const createdAt=new Date();

    const docRef=await addDoc(
      collection(db,"revisionTasks"),
      {
        questionNumber,
        questionTitle,
        weekdays,
        email,
        createdAt,
        emailStatus:"Pending"
      }
    );

    try{

      const res=await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/email/send-revision-email`,
        {
          email,
          questionNumber,
          questionTitle,
          weekdays,
          createdAt,
          id:docRef.id
        }
      );

      if(res.data.success){

        await updateDoc(
          doc(db,"revisionTasks",docRef.id),
          {emailStatus:"Success"}
        );

      }

    }catch(err){

      await updateDoc(
        doc(db,"revisionTasks",docRef.id),
        {emailStatus:"Failed"}
      );

    }

    loadTasks();

    setLoading(false);

  };

  /* ================= GOOGLE CALENDAR ================= */

  const addToCalendar=()=>{

    if(!questionTitle) return;

    setCalendarLoading(true);

    const text=`Revision: ${questionTitle}`;
    const details=`Revise LeetCode question ${questionNumber}`;

    const calendarUrl=
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&details=${encodeURIComponent(details)}`;

    window.open(calendarUrl,"_blank");

    setTimeout(()=>{
      setCalendarLoading(false);
    },1000);

  };

  /* ================= DELETE TASK ================= */

  const deleteTask=async(id)=>{

    await deleteDoc(doc(db,"revisionTasks",id));

    loadTasks();

  };

  /* ================= FORMAT DATE ================= */

  const formatDate=(date)=>{

    const d=new Date(date.seconds*1000);

    return d.toLocaleDateString();

  };

  const formatTime=(date)=>{

    const d=new Date(date.seconds*1000);

    return d.toLocaleTimeString();

  };

  const today = new Date().toLocaleDateString("en-US",{weekday:"long"});

  return(

    <div className="max-w-6xl mx-auto px-6 py-14 space-y-10">

      {/* HEADER */}

      <div>

        <h1 className="text-3xl font-bold text-white">
          Revision Planner
        </h1>

        <p className="text-gray-400 mt-2">
          Schedule LeetCode questions for revision, Add it to your calendar and get email reminders on revision days.
        </p>

      </div>

      {/* FORM */}

      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 space-y-6">

        <div>

          <label className="text-gray-300 text-sm">
            LeetCode Question Number
          </label>

          <div className="flex gap-3 mt-2">

            <input
              type="number"
              value={questionNumber}
              onChange={(e)=>setQuestionNumber(e.target.value)}
              className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-white"
            />

            <button
              onClick={fetchQuestion}
              className="border border-blue-400 text-blue-400 px-4 py-2 rounded-lg"
            >

              {fetchLoading ? "Fetching..." : "Fetch"}

            </button>

          </div>

        </div>

        {questionTitle &&(

          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 text-white">

            {questionTitle}

          </div>

        )}

        {/* WEEKDAYS */}

        <div>

          <label className="text-gray-300 text-sm">
            Select Weekdays
          </label>

          <div className="grid grid-cols-3 gap-3 mt-3">

            {days.map(day=>(

              <button
                key={day}
                onClick={()=>toggleDay(day)}
                className={`px-3 py-2 rounded-lg border ${
                  weekdays.includes(day)
                  ? "bg-green-500 text-black"
                  : "border-[#30363d] text-gray-400"
                }`}
              >
                {day}
              </button>

            ))}

          </div>

        </div>

        {/* EMAIL */}

        <div>

          <label className="text-gray-300 text-sm">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-white mt-2"
          />

        </div>

        {/* BUTTONS */}

        <div className="flex gap-4">

          <button
            onClick={addRevisionTask}
            className="border border-green-400 text-green-400 px-6 py-2 rounded-lg"
          >
            {loading?"Saving...":"Add Revision Task Email"}
          </button>

          <button
            onClick={addToCalendar}
            className="border border-yellow-400 text-yellow-400 px-6 py-2 rounded-lg"
          >
            {calendarLoading?"Opening...":"Add to Google Calendar"}
          </button>

        </div>

      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">

        <table className="w-full text-sm text-left text-gray-400">

          <thead className="bg-[#161b22]">

            <tr>

              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">Question</th>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Weekdays</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Email Alert</th>
              <th className="px-6 py-3">Action</th>

            </tr>

          </thead>

          <tbody>

            {tasks.map(task=>(

              <tr key={task.id}>

                <td className="px-6 py-4">
                  {formatDate(task.createdAt)}
                </td>

                <td className="px-6 py-4">
                  {formatTime(task.createdAt)}
                </td>

                <td className="px-6 py-4">
                  {task.questionNumber}
                </td>

                <td className="px-6 py-4">
                  {task.questionTitle}
                </td>

                <td className="px-6 py-4">
                  {task.weekdays.join(", ")}
                </td>

                <td className="px-6 py-4">
                  {task.email}
                </td>

                <td className="px-6 py-4">
                  {task.emailStatus}
                </td>

                <td className="px-6 py-4">

                  <button
                    onClick={()=>deleteTask(task.id)}
                    className="text-red-400"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* REVISION TRACKER */}

      <div className="space-y-6">

        <h2 className="text-2xl font-semibold text-white">
          Revision Tracker
        </h2>

        {tasks.map(task=>(

          <div
            key={task.id}
            className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4"
          >

            <p className="text-white font-semibold">
              {task.questionNumber} - {task.questionTitle}
            </p>

            <div className="grid grid-cols-4 gap-3">

              {days.map(day=>{

                const selected=task.weekdays.includes(day);

                const key=`${task.id}-${day}`;

                const status=revisionStatus[key];

                return(

                  <div
                    key={day}
                    className="flex justify-between bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2"
                  >

                    <label className="flex items-center gap-2 text-sm">

                      <input
                        type="checkbox"
                        disabled={!selected}
                        checked={status==="Completed"}
                        onChange={()=>{

                          setRevisionStatus(prev=>({
                            ...prev,
                            [key]:"Completed"
                          }));

                        }}
                      />

                      {day}

                    </label>

                    <span className="text-xs">

                      {!selected && "N/A"}

                      {selected && day===today && !status &&(
                        <span className="text-yellow-400">
                          Pending
                        </span>
                      )}

                      {status==="Completed" &&(
                        <span className="text-green-400">
                          Completed
                        </span>
                      )}

                      {selected && day!==today && !status &&(
                        <span className="text-red-400">
                          Loss Day
                        </span>
                      )}

                    </span>

                  </div>

                );

              })}

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}