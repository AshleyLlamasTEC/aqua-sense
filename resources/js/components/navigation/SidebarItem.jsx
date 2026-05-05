// resources/js/Components/Sidebar/SidebarItem.jsx
import { Link } from '@inertiajs/react';
import { Tooltip } from '@ark-ui/react';
import clsx from 'clsx';

const SidebarItem = ({
  icon: Icon,
  label,
  href,
  active = false,
  collapsed = false,
  badge
}) => {
  const linkContent = (
    <Link
      href={href}
      className={clsx(
        'flex items-center h-10 rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
        collapsed ? 'justify-center px-0' : 'px-3',
        active
          ? 'bg-gradient-to-r from-blue-500/10 to-cyan-400/10 text-blue-600'
          : 'text-gray-600 hover:bg-gray-100'
      )}
    >
      <div className="relative flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>

      <span className={clsx(
        'ml-3 whitespace-nowrap transition-all duration-200',
        collapsed && 'w-0 opacity-0 overflow-hidden'
      )}>
        {label}
      </span>

      {badge && !collapsed && (
        <span className="ml-auto px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
          {badge}
        </span>
      )}

      {active && (
        <div className="absolute left-0 w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-r-full" />
      )}
    </Link>
  );

  // Tooltip solo cuando está colapsado
  if (collapsed) {
    return (
      <Tooltip.Root openDelay={200} closeDelay={100}>
        <Tooltip.Trigger asChild>
          <div className="w-full">{linkContent}</div>
        </Tooltip.Trigger>
        <Tooltip.Positioner>
          <Tooltip.Content className="z-50 px-3 py-1.5 text-sm text-white bg-gray-900 rounded-lg shadow-lg">
            {label}
            {badge && ` (${badge})`}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Tooltip.Root>
    );
  }

  return linkContent;
};

export default SidebarItem;
