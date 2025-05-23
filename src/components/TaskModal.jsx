import React from 'react';

const TaskModal = ({ task, onClose, onSave }) => {
  const [description, setDescription] = React.useState(task.description || '');

  const handleSave = () => {
    onSave(task.id, description);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-2">{task.title}</h2>
        <textarea
          className="w-full border rounded p-2 text-sm min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task details..."
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-gray-500 text-sm">Cancel</button>
          <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">Save</button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
