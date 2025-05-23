import React, { useState } from 'react';
import TaskCard from './TaskCard';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const Column = ({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDeleteColumn,
  onRenameColumn
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(column.title);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (newTitle !== column.title) {
      onRenameColumn(column.id, newTitle);
    }
  };

  return (
    <div className="flex-1 bg-white rounded-xl p-6 shadow-md space-y-4 mx-2 relative">
      <div className="flex justify-between items-center mb-3">
        {isEditingTitle ? (
          <input
            className="text-lg font-semibold border px-2 py-1 rounded w-full"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleBlur();
            }}
            autoFocus
          />
        ) : (
          <h2
            className="font-bold text-xl cursor-pointer"
            onDoubleClick={() => setIsEditingTitle(true)}
            title="Double-click to rename"
          >
            {column.title}
          </h2>
        )}

        <button
          onClick={() => {
            const confirmDelete = window.confirm(`Delete column "${column.title}" and all its tasks?`);
            if (confirmDelete) {
              onDeleteColumn(column.id);
            }
          }}
          title="Delete Column"
          className="text-red-500 hover:text-red-700 text-sm ml-2"
        >
          🗑️
        </button>
      </div>

      <SortableContext
        items={tasks.map(task => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 mb-4">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={(taskId) => onDeleteTask(column.id, taskId)}
            />
          ))}
        </div>
      </SortableContext>

      <button
        onClick={() => onAddTask(column.id)}
        className="w-full mt-2 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition duration-200"
      >
        ➕ Add Task
      </button>
    </div>
  );
};

export default Column;
