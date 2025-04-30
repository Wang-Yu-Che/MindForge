import React, { useEffect, useState } from 'react';
import { Calendar, Message, Spin, Button } from '@arco-design/web-react';
import dayjs from 'dayjs';

const PunchCalendar = () => {
  const [punchDates, setPunchDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPunches, setTotalPunches] = useState(0);
  const [consecutiveDays, setConsecutiveDays] = useState(0);

  // 获取打卡记录
  const fetchPunchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3002/api/punch-records/${localStorage.getItem('userId')}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      console.log(data)
      setPunchDates(data);
      setTotalPunches(data.length);
      
      // 计算连续打卡天数
      let consecutive = 0;
      const today = dayjs();
      let checkDate = today;
      
      while (data.includes(checkDate.format('YYYY-MM-DD'))) {
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

  useEffect(() => {
    fetchPunchRecords();
  }, []);

  // 打卡操作
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

  // 自定义日期单元格
  const dateCellRender = (current) => {
    const dateStr = current.format('YYYY-MM-DD');
    const isPunched = punchDates.includes(dateStr);
    const isToday = dateStr === dayjs().format('YYYY-MM-DD');
    return (
      <div
        style={{
          backgroundColor: isPunched ? '#00b42a' : isToday ? '#f53f3f' : undefined,
          color: isPunched || isToday ? '#fff' : undefined,
          borderRadius: '50%',
          width: 24,
          height: 24,
          lineHeight: '24px',
          textAlign: 'center',
          margin: '0 auto',
        }}
      >
        {current.date()}
      </div>
    );
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
        dateCellRender={dateCellRender}
        style={{ height: 'calc(100% - 120px)', overflow: 'hidden' }}
        fullscreen
      />
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Button type="primary" onClick={handlePunch}>今日打卡</Button>
      </div>
    </Spin>
  );
};

export default PunchCalendar;
