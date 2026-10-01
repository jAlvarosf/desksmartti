import React, { useState, useRef } from 'react';
import { PlusCircle, Move } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FloatingTicketButton() {
  const navigate = useNavigate();
  const [position, setPosition] = useState({ x: 24, y: 24 }); // Offset from bottom right
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });

  const handlePointerDown = (e) => {
    setIsDragging(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: position.x,
      initialY: position.y
    };

    const handlePointerMove = (moveEvent) => {
      const deltaX = dragStartRef.current.x - moveEvent.clientX;
      const deltaY = dragStartRef.current.y - moveEvent.clientY;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setIsDragging(true);
      }

      const newX = Math.max(12, Math.min(window.innerWidth - 80, dragStartRef.current.initialX + deltaX));
      const newY = Math.max(12, Math.min(window.innerHeight - 80, dragStartRef.current.initialY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleClick = (e) => {
    if (!isDragging) {
      navigate('/tickets/new');
    }
  };

  return (
    <div
      style={{
        right: `${position.x}px`,
        bottom: `${position.y}px`
      }}
      className="fixed z-50 touch-none select-none flex items-center"
    >
      <button
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        className="group relative flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-grab active:cursor-grabbing border-2 border-white dark:border-slate-800"
        title="Abrir Novo Chamado (Arraste para mover)"
      >
        <PlusCircle className="w-6 h-6 shrink-0" />
        <span className="hidden sm:inline text-sm font-bold tracking-tight">Novo Chamado</span>
        <Move className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 ml-1" />
      </button>
    </div>
  );
}
