import React, { useEffect, useRef, useState } from "react";

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment-timezone";
import "react-big-calendar/lib/css/react-big-calendar.css";
import UpcomingEventsModal from "components/ReusableCalendar/UpcomingEventsModal";
import dayjs from "dayjs";
import "./styles.css";

moment.tz.setDefault("Asia/Kolkata");
// const localizer = momentLocalizer(moment);

// moment.locale("en-GB");
const localizer = momentLocalizer(moment);

type Props = {
  events?: any;
  toggleCalendarModal?: any;
  calendarFor?: string;
};

const colors = [
  "hotpink", //default kalend color
  "orange", //light orange - tomato
  "dodgerblue", //dodgerblue
  "orchid", //orchid
  "lightseagreen", //sea green
  "sandybrown", //brown
  "bisque", //bisque
];

const AuditReportCalendar = ({
  events = [],
  toggleCalendarModal,
  calendarFor = "",
}: Props) => {
  const [showEventsModal, setShowEventsModal] = useState<any>(false);
  const [calendarEvents, setCalendarEvents] = useState<any>([]);

  const [currentView, setCurrentView] = useState("month");
  const [eventsData, setEventsData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // console.log("checkaudit events in reusable calendar useEffect[events]", events);
    const formatEvents = events.map((event: any) =>
      convertScheduleDataToEvent(event)
    );
    // console.log("check formatEvents for AuditSchedule", formatEvents);
    setCalendarEvents(formatEvents);
    setEventsData(formatEvents);
  }, [events]);

  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const convertScheduleDataToEvent = (data: any) => {
    const startAt = moment(data?.start).toDate(); // Convert to Date object using moment
    const endAt = moment(data?.start).add(30, "minutes").toDate(); // Convert to Date object using moment

    return {
      ...data,
      id: data.id,
      summary: data.title,
      title: data.title,
      start: startAt,
      end: endAt,
      color: data.color,
    };
  };

  const eventStyleGetter = (
    event: any,
    start: any,
    end: any,
    isSelected: any
  ) => {
    const backgroundColor = event.color || "#f0f0f0"; // use event color or default to gray

    const style = {
      backgroundColor: backgroundColor,
      borderRadius: "0px",
      opacity: 0.8,
      color: "black",
      border: "0px",
      display: "block",
    };
    return {
      style: style,
    };
  };

  const handleViewChange = (view: any) => {
    setCurrentView(view);
  };


  return (
    <div className="App" style={{height : "76vh"}}>
      <Calendar
        views={["day", "week", "month", "agenda"]}
        selectable
        localizer={localizer}
        defaultDate={new Date()}
        defaultView="month"
        events={eventsData}
        // style={{ height: "100vh" }}
        onSelectEvent={(data: any) => toggleCalendarModal(data)}
        eventPropGetter={eventStyleGetter}
        onView={handleViewChange}
        timeslots={2}
        step={15}
        // onSelectSlot={handleSelect}
      />
      {!!showEventsModal && (
        <UpcomingEventsModal
          showEventsModal={showEventsModal}
          setShowEventsModal={setShowEventsModal}
        />
      )}
    </div>
  );
};
export default AuditReportCalendar;
