import { useState } from "react";
import axios from "axios";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Revision() {

  const [questionNumber,setQuestionNumber]=useState("");
  const [questionTitle,setQuestionTitle]=useState("");
  const [weekdays,setWeekdays]=useState([]);
  const [email,setEmail]=useState("");
  const [loading,setLoading]=useState(false);

  const days=[
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  /* ================= FETCH QUESTION ================= */

  const fetchQuestion=async()=>{

    if(!questionNumber) return;

    const res=await axios.post(
      "http://localhost:5000/api/visualize",
      {questionNumber}
    );

    setQuestionTitle(res.data.question);

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

    await addDoc(
      collection(db,"revisionTasks"),
      {
        questionNumber,
        questionTitle,
        weekdays,
        email,
        createdAt:new Date()
      }
    );

    alert("Revision task added successfully");

    setLoading(false);

  };

  /* ================= GOOGLE CALENDAR ================= */

  const addToCalendar=()=>{

    if(!questionTitle) return;

    const text=`Revision: ${questionTitle}`;

    const details=`Revise LeetCode question ${questionNumber}`;

    const calendarUrl=
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&details=${encodeURIComponent(details)}`;

    window.open(calendarUrl,"_blank");

  };

  return(

    <div className="max-w-4xl mx-auto px-6 py-14 space-y-8">

      {/* HEADER */}

      <div>

        <h1 className="text-3xl font-bold text-white">
          Revision Planner
        </h1>

        <p className="text-gray-400 mt-2">
          Schedule LeetCode questions for revision.
        </p>

      </div>

      {/* FORM */}

      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 space-y-6">

        {/* QUESTION NUMBER */}

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
              className="border border-blue-400 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-400 hover:text-black transition"
            >
              Fetch
            </button>

          </div>

        </div>

        {/* QUESTION PREVIEW */}

        {questionTitle && (

          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4">

            <p className="text-white font-medium">
              {questionTitle}
            </p>

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
            className="border border-green-400 text-green-400 px-6 py-2 rounded-lg hover:bg-green-400 hover:text-black transition"
          >
            {loading?"Saving...":"Add Revision Task"}
          </button>

          <button
            onClick={addToCalendar}
            className="border border-yellow-400 text-yellow-400 px-6 py-2 rounded-lg hover:bg-yellow-400 hover:text-black transition"
          >
            Add to Google Calendar
          </button>

        </div>

      </div>

    </div>

  );

}