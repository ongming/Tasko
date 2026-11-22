import React from 'react'
import { useDroppable } from '@dnd-kit/core'

export interface BacklogDroppableContainerProps {
  id: string
  isActiveSprint?: boolean
  children: React.ReactNode
}

export const BacklogDroppableContainer: React.FC<BacklogDroppableContainerProps> = ({
  id,
  isActiveSprint = false,
  children,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'Container',
      containerId: id,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-xl border transition-all overflow-hidden ${
        isOver
          ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-sm'
          : isActiveSprint
            ? 'border-indigo-200 shadow-xs'
            : 'border-slate-200/90 shadow-2xs'
      }`}
    >
      {children}
    </div>
  )
}

export default BacklogDroppableContainer
