import React, { useEffect, useState } from 'react';
import {
  Input,
  Button,
  List,
  Typography,
  Space,
  Message,
  Modal,
  Checkbox,
} from '@arco-design/web-react';
import {
  IconPlus,
  IconDelete,
  IconEdit,
} from '@arco-design/web-react/icon';

import './TodoList.css';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) setTodos(JSON.parse(saved));
  }, []);

  const saveTodos = (data) => {
    setTodos(data);
    localStorage.setItem('todos', JSON.stringify(data));
  };

  const handleAdd = () => {
    if (!inputValue.trim()) return Message.warning('请输入内容');
    const newTodos = [...todos, { id: Date.now(), text: inputValue, done: false }];
    saveTodos(newTodos);
    setInputValue('');
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该待办事项吗？',
      onOk: () => {
        const newTodos = todos.filter((todo) => todo.id !== id);
        saveTodos(newTodos);
        Message.success('已删除');
      },
    });
  };

  const handleEdit = (todo) => {
    Modal.confirm({
      title: '编辑待办事项',
      content: (
        <Input
          defaultValue={todo.text}
          onChange={(val) => (todo.text = val)}
        />
      ),
      onOk: () => {
        const updated = todos.map((t) => (t.id === todo.id ? todo : t));
        saveTodos(updated);
        Message.success('更新成功');
      },
    });
  };

  const toggleDone = (id) => {
    const updated = todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    );
    saveTodos(updated);
  };

  return (
    <div className="todo-container">
      <h2>✅ 待办事项</h2>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="输入待办事项"
          value={inputValue}
          onChange={setInputValue}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<IconPlus />} onClick={handleAdd}>
          添加
        </Button>
      </Space>

      <List
        bordered
        dataSource={todos}
        render={(item) => (
          <List.Item
            className="todo-item"
            actions={[
              <Button
                type="text"
                icon={<IconEdit />}
                onClick={() => handleEdit(item)}
              />,
              <Button
                type="text"
                status="danger"
                icon={<IconDelete />}
                onClick={() => handleDelete(item.id)}
              />,
            ]}
          >
            <Space>
              <Checkbox checked={item.done} onChange={() => toggleDone(item.id)} />
              <Typography.Text
                delete={item.done}
                type={item.done ? 'secondary' : undefined}
              >
                {item.text}
              </Typography.Text>
            </Space>
          </List.Item>
        )}
        style={{ maxHeight: 300, overflowY: 'auto' }}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default TodoList;
