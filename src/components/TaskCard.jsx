import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskModal from './TaskModal';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [showModal, setShowModal] = useState(false); 

  const handleBlur = () => {
    if (editedTitle !== task.title) {
      onEdit(task.id, editedTitle, null); 
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="bg-gray-100 px-3 py-2 rounded-md shadow-sm text-sm flex justify-between items-center group hover:bg-gray-200 transition"
        {...attributes}
        {...listeners}
      >
        {isEditing ? (
          <input
            className="w-full p-1 text-sm border rounded-md"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <span className="flex-1 mr-2" onDoubleClick={() => setIsEditing(true)}>
            {task.title}
          </span>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="text-blue-500 hover:text-blue-700 text-xs"
            title="View / Edit Description"
          >
            📝
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-500 hover:text-red-700 text-xs"
            title="Delete Task"
          >
            🗑️
          </button>
        </div>
      </div>

      {showModal && (
        <TaskModal
          task={task}
          onClose={() => setShowModal(false)}
          onSave={(taskId, newDescription) =>
            onEdit(taskId, null, newDescription) 
          }
        />
      )}
    </>
  );
};

export default TaskCard;
