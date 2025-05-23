import React, { useEffect, useState } from 'react';
import DraggableColumn from './DraggableColumn';
import PresenceTracker from './PresenceTracker';
import PresenceIndicator from './PresenceIndicator';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';

import { db } from '../firebase/config';
import { onValue, ref, set } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

const Board = () => {
  const [data, setData] = useState(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    const dataRef = ref(db, 'boardData');
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const value = snapshot.val();
      if (
        value &&
        typeof value === 'object' &&
        value.columns &&
        value.tasks &&
        Array.isArray(value.columnOrder)
      ) {
        setData(value);
      } else {
        setData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateFirebase = (newData) => {
    set(ref(db, 'boardData'), newData);
  };

  const handleAddTask = (columnId) => {
    const title = prompt("Enter task title");
    if (!title) return;

    const taskId = uuidv4();
    const newTask = {
      id: taskId,
      title,
      description: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newData = {
      ...data,
      tasks: {
        ...data.tasks,
        [taskId]: newTask,
      },
      columns: {
        ...data.columns,
        [columnId]: {
          ...data.columns[columnId],
          taskIds: [...(data.columns[columnId]?.taskIds || []), taskId],
        },
      },
    };

    setData(newData);
    updateFirebase(newData);
  };

  const handleDeleteTask = (colId, taskId) => {
    const newData = { ...data };
    delete newData.tasks[taskId];
    newData.columns[colId].taskIds = newData.columns[colId].taskIds.filter(
      id => id !== taskId
    );
    setData(newData);
    updateFirebase(newData);
  };

  const handleEditTask = (taskId, newTitle = null, newDescription = null) => {
    const existingTask = data.tasks[taskId];
    if (!existingTask) return;

    const updatedTask = {
      ...existingTask,
      ...(newTitle !== null && { title: newTitle }),
      ...(newDescription !== null && { description: newDescription }),
      updatedAt: new Date().toISOString(),
    };

    const newData = {
      ...data,
      tasks: {
        ...data.tasks,
        [taskId]: updatedTask
      }
    };

    setData(newData);
    updateFirebase(newData);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;

    let sourceColId = null;
    for (const colId in data.columns) {
      if (data.columns[colId].taskIds.includes(activeId)) {
        sourceColId = colId;
        break;
      }
    }
    if (!sourceColId) return;

    let destinationColId = null;
    let destinationIndex = null;

    if (data.columns[overId]) {
      destinationColId = overId;
    } else {
      for (const colId in data.columns) {
        const idx = data.columns[colId].taskIds.indexOf(overId);
        if (idx !== -1) {
          destinationColId = colId;
          destinationIndex = idx;
          break;
        }
      }
    }
    if (!destinationColId) return;

    const sourceTaskIds = Array.from(data.columns[sourceColId].taskIds);
    const sourceIndex = sourceTaskIds.indexOf(activeId);
    if (sourceIndex === -1) return;
    sourceTaskIds.splice(sourceIndex, 1);

    let destinationTaskIds;
    if (sourceColId === destinationColId) {
      destinationTaskIds = sourceTaskIds;
    } else {
      destinationTaskIds = Array.from(data.columns[destinationColId].taskIds);
    }

    if (destinationIndex === null || sourceColId !== destinationColId) {
      if (destinationIndex === null) {
        destinationTaskIds.push(activeId);
      } else {
        destinationTaskIds.splice(destinationIndex, 0, activeId);
      }
    } else {
      let insertAt = destinationIndex;
      if (sourceIndex < destinationIndex) insertAt--;
      destinationTaskIds.splice(insertAt, 0, activeId);
    }

    destinationTaskIds = destinationTaskIds.filter(
      (id, idx, arr) => arr.indexOf(id) === idx
    );

    const newColumns = {
      ...data.columns,
      [sourceColId]: {
        ...data.columns[sourceColId],
        taskIds: sourceColId === destinationColId ? destinationTaskIds : sourceTaskIds,
      },
      [destinationColId]: {
        ...data.columns[destinationColId],
        taskIds: destinationTaskIds,
      },
    };

    const newData = {
      ...data,
      columns: newColumns,
    };

    setData(newData);
    updateFirebase(newData);
  };

  const handleDragEndColumn = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = data.columnOrder.indexOf(active.id);
    const newIndex = data.columnOrder.indexOf(over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newColumnOrder = arrayMove(data.columnOrder, oldIndex, newIndex);

    const newData = {
      ...data,
      columnOrder: newColumnOrder,
    };

    setData(newData);
    updateFirebase(newData);
  };

  const handleAddColumn = () => {
    const title = prompt("Enter column name");
    if (!title) return;

    const columnId = uuidv4();
    const newColumn = {
      id: columnId,
      title,
      taskIds: [],
    };

    const newData = {
      ...data,
      columns: {
        ...data.columns,
        [columnId]: newColumn,
      },
      columnOrder: [...data.columnOrder, columnId],
    };

    setData(newData);
    updateFirebase(newData);
  };

  const handleDeleteColumn = (colId) => {
    if (!window.confirm("Are you sure you want to delete this column?")) return;

    const newData = { ...data };

    const taskIdsToRemove = newData.columns[colId]?.taskIds || [];
    taskIdsToRemove.forEach((taskId) => {
      delete newData.tasks[taskId];
    });

    delete newData.columns[colId];
    newData.columnOrder = newData.columnOrder.filter(id => id !== colId);

    setData(newData);
    updateFirebase(newData);
  };

  const handleRenameColumn = (colId, newTitle) => {
    const newData = {
      ...data,
      columns: {
        ...data.columns,
        [colId]: {
          ...data.columns[colId],
          title: newTitle,
        },
      },
    };

    setData(newData);
    updateFirebase(newData);
  };

  if (!data) {
    return (
      <div className="text-center py-10 text-gray-700">
        <h2 className="text-xl font-semibold mb-2">🚀 Task Board</h2>
        <p>Loading from Firebase...</p>
      </div>
    );
  }

  return (
    <>
      <PresenceTracker />
      <PresenceIndicator />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEndColumn}
      >
        <SortableContext
          items={data.columnOrder}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex gap-6 p-6 items-start w-full overflow-x-auto">
            {data.columnOrder.map((colId) => {
              const column = data.columns[colId];
              const taskIds = column?.taskIds || [];
              const tasks = taskIds
                .map((taskId) => data.tasks?.[taskId])
                .filter(Boolean);

              return (
                <DraggableColumn
                  key={column.id}
                  id={column.id}
                  column={column}
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onDeleteColumn={handleDeleteColumn}
                  onRenameColumn={handleRenameColumn}
                />
              );
            })}

            <button
              onClick={handleAddColumn}
              className="min-w-[200px] h-[200px] bg-blue-100 text-blue-700 border border-blue-300 rounded-md flex items-center justify-center text-sm hover:bg-blue-200 transition"
            >
              ➕ Add Column
            </button>
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
};

export default Board;
