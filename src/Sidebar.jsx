import { Home, Zap, Cloud, Droplet, Car } from 'lucide-react';

export default function Sidebar({ items, activeItem, onItemClick }) {
  const icons = {
    OVERVIEW: <Home className="w-4 h-4 mr-2" />,
    ELECTRICITY: <Zap className="w-4 h-4 mr-2" />,
    CO2: <Cloud className="w-4 h-4 mr-2" />,
    WATER: <Droplet className="w-4 h-4 mr-2" />,
    "VEHICLE COUNTER": <Car className="w-4 h-4 mr-2" />,
  };

  return (
    <nav
      className="fixed top-14 left-0 bg-green-dark text-white space-y-2 pt-4 z-10
                 w-14 md:w-52 h-[calc(100vh-3.5rem)] transition-all duration-300"
    >
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onItemClick(item)}
          className={`flex items-center w-full text-left px-4 py-2 font-medium transition-all duration-200
            ${activeItem === item
              ? 'bg-gray-100 text-green-dark rounded-r-none rounded-l-xl -mr-px'
              : 'hover:bg-green-light rounded-l-xl'}
          `}
        >
          {icons[item]}
          <span className="hidden md:inline">{item}</span>
        </button>
      ))}
    </nav>
  );
}
