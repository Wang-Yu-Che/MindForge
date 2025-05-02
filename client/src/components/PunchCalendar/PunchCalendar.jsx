import React, { useEffect, useState } from 'react';
import { Message, Spin, Button, Modal, Input } from '@arco-design/web-react';
import dayjs from 'dayjs';
import Calendar from 'react-calendar';

import 'react-calendar/dist/Calendar.css';
import './PunchCalendar.css';

const PunchCalendar = () => {
  const [punchDates, setPunchDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPunches, setTotalPunches] = useState(0);
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null); 
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false); 
  const [schedule, setSchedule] = useState(''); 
  const [events, setEvents] = useState({}); 

  const fetchPunchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3002/api/punch-records/${localStorage.getItem('userId')}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      const formattedDates = data.map(date => dayjs(date).format('YYYY-MM-DD'));
      setPunchDates(formattedDates);
      setTotalPunches(formattedDates.length);

      let consecutive = 0;
      const today = dayjs();
      let checkDate = today;

      while (formattedDates.includes(checkDate.format('YYYY-MM-DD'))) {
        consecutive++;
        checkDate = checkDate.subtract(1, 'day');
      }
      setConsecutiveDays(consecutive);
    } catch (error) {
      Message.error('获取打卡记录失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`http://localhost:3002/api/events/${localStorage.getItem('userId')}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      const formattedEvents = data.map(event => ({
        ...event,
        date: dayjs(event.date).format('YYYY-MM-DD'),
      }));
      const eventsMap = formattedEvents.reduce((acc, event) => {
        if (!acc[event.date]) acc[event.date] = [];
        acc[event.date].push(event);
        return acc;
      }, {});

      setEvents(eventsMap);
    } catch (error) {
      Message.error('获取日程失败');
    }
  };

  useEffect(() => {
    fetchPunchRecords();
    fetchEvents();
  }, []);

  const handlePunch = async () => {
    try {
      const res = await fetch(`http://localhost:3002/api/punch/${localStorage.getItem('userId')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        Message.success('打卡成功');
        fetchPunchRecords();
      } else {
        const errorData = await res.json();
        Message.error(errorData.message || '打卡失败');
      }
    } catch (error) {
      Message.error('打卡请求失败');
    }
  };

  const tileClassName = ({ date }) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const isPunched = punchDates.includes(dateStr);
    const isToday = dateStr === dayjs().format('YYYY-MM-DD');
    const hasEvent = events[dateStr] && events[dateStr].length > 0;
    return isPunched
      ? 'punched'
      : isToday
      ? 'today'
      : hasEvent
      ? 'has-event'
      : '';
  };

  const tileContent = ({ date }) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const eventList = events[dateStr];

    if (eventList && eventList.length > 0) {
      return <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'red', margin: '0 auto' }} />;
    }
    return null;
  };

  const handleDateClick = (date) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    setSelectedDate(formattedDate);
    setScheduleModalVisible(true);
  };

  const handleAddSchedule = async () => {
    if (!schedule.trim()) {
      Message.error('日程内容不能为空');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3002/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          date: selectedDate,
          schedule,
        }),
      });

      if (res.ok) {
        Message.success('日程添加成功');
        fetchEvents();
        setSchedule('');
        setScheduleModalVisible(false);
      } else {
        const errorData = await res.json();
        Message.error(errorData.message || '添加日程失败');
      }
    } catch (error) {
      Message.error('日程请求失败');
    }
  };

  const handleDeleteSchedule = async (eventId) => {
    try {
      const res = await fetch(`http://localhost:3002/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (res.ok) {
        Message.success('日程删除成功');
        fetchEvents();
      } else {
        const errorData = await res.json();
        Message.error(errorData.message || '删除日程失败');
      }
    } catch (error) {
      Message.error('删除日程请求失败');
    }
  };

  return (
    <Spin loading={loading} style={{ height: '100%', overflow: 'hidden' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#86909c' }}>总打卡天数</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{totalPunches}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#86909c' }}>连续打卡天数</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{consecutiveDays}</div>
        </div>
      </div>
      <Calendar
        tileClassName={tileClassName}
        tileContent={tileContent}
        view="month"
        showNeighboringMonth={false}
        onClickDay={handleDateClick}
      />
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Button type="primary" onClick={handlePunch}>今日打卡</Button>
      </div>

      <Modal
        title={`管理 ${selectedDate} 的日程`}
        visible={scheduleModalVisible}
        onCancel={() => setScheduleModalVisible(false)}
        onOk={handleAddSchedule}
      >
        <Input
          value={schedule}
          onChange={(value) => setSchedule(value)}
          placeholder="请输入日程内容"
          autoFocus
        />
        <div style={{ marginTop: 16 }}>
    {Array.isArray(events[selectedDate]) && events[selectedDate].length > 0 ? (
      events[selectedDate].map((item) => (
        <div key={item.id} style={{ padding: '8px', borderBottom: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>{item.schedule}</div>
          <Button
            type="text"
            size="small"
            onClick={() => handleDeleteSchedule(item.id)}
          >
            删除
          </Button>
        </div>
      ))
    ) : (
      <div style={{ color: '#86909c', textAlign: 'center' }}>暂无日程</div>
    )}
  </div>
      </Modal>
    </Spin>
  );
};

export default PunchCalendar;
