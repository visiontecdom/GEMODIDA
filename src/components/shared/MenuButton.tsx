'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface MenuButtonProps {
  icon: ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
  badge?: number;
}

export function MenuButton({
  icon,
  label,
  href,
  isActive = false,
  onClick,
  badge,
}: MenuButtonProps) {
  return (
    <Link href={href}>
      <button
        onClick={onClick}
        className={`
          w-full h-12 px-4 rounded-lg
          flex items-center gap-3
          transition-all duration-300 ease-in-out
          relative overflow-hidden
          group
          ${
            isActive
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
          active:scale-95
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
      >
        <div
          className={`
            absolute inset-0 opacity-0 group-hover:opacity-10
            transition-opacity duration-300
            ${isActive ? 'bg-white' : 'bg-blue-600'}
          `}
        />

        <span
          className={`
            text-xl flex-shrink-0
            transition-transform duration-300
            ${isActive ? 'scale-110' : 'group-hover:scale-110'}
          `}
        >
          {icon}
        </span>

        <span
          className={`
            font-medium flex-1 text-left
            transition-all duration-300
            ${isActive ? 'font-semibold' : ''}
          `}
        >
          {label}
        </span>

        {badge !== undefined && badge > 0 && (
          <span
            className={`
              px-2 py-1 rounded-full text-xs font-bold
              transition-all duration-300
              ${
                isActive
                  ? 'bg-white text-blue-600'
                  : 'bg-red-500 text-white'
              }
            `}
          >
            {badge}
          </span>
        )}

        {isActive && (
          <div
            className={`
              absolute right-0 top-0 bottom-0 w-1
              bg-white rounded-l-full
              animate-pulse
            `}
          />
        )}
      </button>
    </Link>
  );
}
