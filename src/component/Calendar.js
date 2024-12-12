import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const daysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState([]); // Store events fetched from the backend
  const [newEvent, setNewEvent] = useState({
    event_name: "",
    start_time: "",
    end_time: "",
    description: "",
  }); // New event input
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [showModal, setShowModal] = useState(false); // Control modal visibility
   const [editingEvent, setEditingEvent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from(
    { length: daysInMonth(currentYear, currentMonth) },
    (_, i) => i + 1
  );

  const fetchEventsForDay = async (day) => {
    try {
      const response = await fetch(
        `https://dynamic-event-calender-backend.onrender.com/events_api/get_curr_date_events?curr_date=${currentYear}-${String(
          currentMonth + 1
        ).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      );
      const data = await response.json();
      setEvents(data || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error(`Error fetching events: ${error.message}`);
    }
  };

  const handleAddEvent = async () => {
    if (newEvent.event_name && newEvent.start_time && newEvent.end_time) {
      try {
        const formattedDate =`${currentYear}-${String(currentMonth + 1).padStart(2,"0" )}-${String(selectedDay).padStart(2, "0")}`; // Format as "YYYY-MM-DD
        const formattedDatestart = `${formattedDate}T${String(newEvent.start_time)}:00`;
        const formattedDateend=`${formattedDate}T${String(newEvent.end_time)}:00`;

        const response = await fetch("https://dynamic-event-calender-backend.onrender.com/events_api/add_event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_name:newEvent.event_name,
            start_time:formattedDatestart,
            end_time:formattedDateend,
            description:newEvent.description
          }),
        });
        console.error(response.json());
        if (response.ok) {
          setNewEvent({
            event_name: "",
            start_time: "",
            end_time: "",
            description: "",
          }); // Clear input after adding
          fetchEventsForDay(selectedDay); 
          setShowModal(false); 
        } else {
          const errorData = await response.json(); // Await here
          toast.error(`Error adding event: ${errorData.detail}`);
          console.error(response.json());
        }
      } catch (error) {
        // console.error("Error adding abhi event:", error);
        toast.error(`Error adding event: either start time is before end time(interval should be in the same day) or time interval may be overlapping`);
        // toast.error(`Error adding event: ${error}`);
      }
    }
  };
  const handleEditEvent = async () => {
    try {
      const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
      const formattedDateStart = `${formattedDate}T${String(newEvent.start_time)}:00`;
      const formattedDateEnd = `${formattedDate}T${String(newEvent.end_time)}:00`;
  
      const response = await fetch(`https://dynamic-event-calender-backend.onrender.com/events_api/update_event?event_id=${editingEvent.event_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: newEvent.event_name,
          start_time: formattedDateStart,
          end_time: formattedDateEnd,
          description: newEvent.description,
        }),
      });
  
      if (response.ok) {
        fetchEventsForDay(selectedDay);
        setShowModal(false);
        setIsEditMode(false);
        setEditingEvent(null);
        setNewEvent({
          event_name: "",
          start_time: "",
          end_time: "",
          description: "",
        });
      } else {
        // Extract error details only once
        const errorData = await response.json(); 
        toast.error(`Error updating event: ${errorData.detail}`);
        console.error(errorData); // Log the error data for debugging
      }
    } catch (error) {
      toast.error(
        `Error updating event: Either start time is before end time (interval should be in the same day) or time interval may be overlapping`
      );
      console.error("Error updating event:", error); // Log runtime error
    }
  };
  

        
     
  const handleEditClick = (event) => {
    setIsEditMode(true);
    setEditingEvent(event);
    setNewEvent({
      event_name: event.event_name,
      start_time: event.start_time.split("T")[1].substring(0, 5),
      end_time: event.end_time.split("T")[1].substring(0, 5),
      description: event.description,
    });
    setShowModal(true);
  };
  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await fetch(`https://dynamic-event-calender-backend.onrender.com/events_api/delete_event?event_id=${eventId}`, {
        method: "GET",
      });

      if (response.ok) {
        fetchEventsForDay(selectedDay);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  useEffect(() => {
    fetchEventsForDay(selectedDay);
  }, [selectedDay,currentMonth, currentYear]);

  const handleDayClick = (day) => {
    setSelectedDay(day); 
  };

  const handleCloseModal = () => {
    
    setShowModal(false); 
    setNewEvent({
      event_name: "",
      start_time: "",
      end_time: "",
      description: "",
    });
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };


  return (
    <div>
    <ToastContainer />
    <div className="flex bg-black text-white p-6 rounded-lg max-w-6xl mx-auto shadow-lg">
      <div className="w-1/3">
        <header className="flex justify-between items-center mb-6 pl-4">
          <h2 className="text-2xl font-bold">
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "long",
            })}
            , {currentYear}
          </h2>
          <div className="flex space-x-2 pr-3">
            <button
              onClick={handlePreviousMonth}
              className="bg-gray-700 hover:bg-gray-600 rounded-full p-2 text-white"
            >
              ◀
            </button>
            <button
              onClick={handleNextMonth}
              className="bg-gray-700 hover:bg-gray-600 rounded-full p-2 text-white"
            >
              ▶
            </button>
          </div>
        </header>
        <div className="grid grid-cols-7 text-center text-gray-400 mb-4">
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: (firstDayOfMonth - 1 + 7) % 7 }).map(
            (_, index) => (
              <div key={index}></div>
            )
          )}
          {days.map((day) => (
            <div
              key={day}
              className={clsx(
                "p-2.5 rounded-lg text-center cursor-pointer",
                day === new Date().getDate() &&
                  currentMonth === new Date().getMonth() &&
                  currentYear === new Date().getFullYear() &&
                  "bg-orange-500 text-black font-bold",
                (day + firstDayOfMonth) % 7 === 0 && "border-l border-gray-700",
                day === selectedDay && "bg-green-500 text-black font-bold"
              )}
              onClick={() => handleDayClick(day)}
            >
              <div>{day}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-2/3 items-center pl-14 pr-10">
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg h-full flex flex-col">
          <h3 className="text-lg font-bold mb-4">
            {!(selectedDay === new Date().getDate() &&
                  currentMonth === new Date().getMonth() &&
                  currentYear === new Date().getFullYear()
              )
              ? `Events for ${selectedDay} ${new Date(
                  currentYear,
                  currentMonth
                ).toLocaleString("default", { month: "long" })}`
              : "Today's Events"}
          </h3>
          <div className="text-xs text-gray-300 flex-grow overflow-y-auto max-h-[calc(100vh-300px)]">
            {events.length > 0 ? (
              events.map((event, index) => (
                <div
                  key={index}
                  className="mb-3 flex items-center justify-between p-4 rounded-lg bg-blue-500 text-white max-w-md mx-auto shadow-md"
                >
                  <div className="text-sm font-medium">
                    <div>{event.start_time.split("T")[1].substring(0, 5)}</div>
                    {/* <div> to </div> */}
                    <div>{event.end_time.split("T")[1].substring(0, 5)}</div>
                   </div>
                  <div className="border-l-2 border-white h-10 mx-4"></div>
                  <div className="flex flex-col justify-center items-start text-center flex-grow">
                    <strong className="text-lg">{event.event_name}</strong>
                    <div className="text-sm">{event.description}</div>
                  </div>
                  <div className="flex space-x-2 ml-4">
  <button
    onClick={() => handleEditClick(event)}
    className="p-2 hover:bg-blue-700 rounded"
  >
    <FaEdit size={20} />
  </button>
  <button
    onClick={() => handleDeleteEvent(event.event_id)}
    className="p-2 hover:bg-blue-700 rounded"
  >
    <FaTrash size={20} />
  </button>
</div>
          </div>
              ))
            ) : (
              <div>No events scheduled</div>
            )}
          </div>

          {selectedDay && (
            <button
              onClick={handleOpenModal}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mt-4"
            >
              Add Event
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-lg font-bold mb-4">Add Event on {selectedDay}</h3>
            <input
              type="text"
              placeholder="Event Name"
              value={newEvent.event_name}
              onChange={(e) =>
                setNewEvent({ ...newEvent, event_name: e.target.value })
              }
              className="mb-4 p-2 rounded-md w-full text-black"
            />
            <input
              type="time"
              placeholder="Start Time"
              value={newEvent.start_time}
              onChange={(e) =>{
                setNewEvent({ ...newEvent, start_time: e.target.value})
              }
              }
              className="mb-4 p-2 rounded-md w-full text-black"
            />
            <input
              type="time"
              placeholder="End Time"
              value={newEvent.end_time}
              onChange={(e) =>{
                setNewEvent({ ...newEvent, end_time: e.target.value })
              }
              }
              className="mb-4 p-2 rounded-md w-full text-black"
            />
            <textarea
              placeholder="Description (Optional)"
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
              className="mb-4 p-2 rounded-md w-full text-black"
            />
            <div className="flex space-x-2">
            <button
  onClick={isEditMode ? handleEditEvent : handleAddEvent}
  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full"
>
  {isEditMode ? "Update Event" : "Add Event"}
</button>
<button
  onClick={() => {
    if (isEditMode) setIsEditMode(false);
    handleCloseModal();
  }}
  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md w-full"
>
  Close
</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Calendar;
