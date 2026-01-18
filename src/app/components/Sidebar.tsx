'use client';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Tooltip from '@radix-ui/react-tooltip';

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const menuItems = [
    {
      href: '/',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" >
          <g clipPath="url(#clip0_409_52885)">
            <path d="M10.4861 2.17812C10.2049 1.94062 9.79548 1.94062 9.51423 2.17812L1.26424 9.17812C0.94861 9.44688 0.91111 9.91875 1.17674 10.2344C1.44236 10.55 1.91736 10.5875 2.23299 10.3219L3.00173 9.67188V15.5C3.00173 16.8813 4.12049 18 5.50174 18H14.5017C15.883 18 17.0017 16.8813 17.0017 15.5V9.67188L17.7674 10.3219C18.083 10.5906 18.558 10.55 18.8236 10.2344C19.0892 9.91875 19.0517 9.44375 18.7361 9.17812L10.4861 2.17812ZM4.50173 15.5V8.4L10.0017 3.73438L15.5017 8.4V15.5C15.5017 16.0531 15.0549 16.5 14.5017 16.5H13.0017V11.75C13.0017 11.0594 12.4424 10.5 11.7517 10.5H8.25174C7.56111 10.5 7.00174 11.0594 7.00174 11.75V16.5H5.50174C4.94861 16.5 4.50173 16.0531 4.50173 15.5ZM8.50174 16.5V12H11.5017V16.5H8.50174Z" fill="currentColor"/>
          </g>
          <defs>
            <clipPath id="clip0_409_52885">
              <rect width="18" height="16" fill="white" transform="translate(1 2)"/>
            </clipPath>
          </defs>
        </svg>
      ),
      label: 'Inicio'
    },
    {
      href: '/cotizacion-express',
      icon: (
        <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_409_52891)">
            <path d="M1.5 14V2C1.5 1.725 1.725 1.5 2 1.5H7V4C7 4.55312 7.44688 5 8 5H10.5V14C10.5 14.275 10.275 14.5 10 14.5H2C1.725 14.5 1.5 14.275 1.5 14ZM2 0C0.896875 0 0 0.896875 0 2V14C0 15.1031 0.896875 16 2 16H10C11.1031 16 12 15.1031 12 14V4.82812C12 4.29688 11.7906 3.7875 11.4156 3.4125L8.58438 0.584375C8.20938 0.209375 7.70312 0 7.17188 0H2ZM6.75 8.75C6.75 8.33438 6.41563 8 6 8C5.58437 8 5.25 8.33438 5.25 8.75V12.75C5.25 13.1656 5.58437 13.5 6 13.5C6.41563 13.5 6.75 13.1656 6.75 12.75V8.75ZM9.5 9.75C9.5 9.33438 9.16562 9 8.75 9C8.33438 9 8 9.33438 8 9.75V12.75C8 13.1656 8.33438 13.5 8.75 13.5C9.16562 13.5 9.5 13.1656 9.5 12.75V9.75ZM4 10.75C4 10.3344 3.66563 10 3.25 10C2.83437 10 2.5 10.3344 2.5 10.75V12.75C2.5 13.1656 2.83437 13.5 3.25 13.5C3.66563 13.5 4 13.1656 4 12.75V10.75Z" fill="currentColor"/>
          </g>
          <defs>
            <clipPath id="clip0_409_52891">
              <rect width="12" height="16" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      ),
      label: 'Cotización Express',
    },
  ];

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="hidden md:block h-[calc(100vh-5rem)] py-4 pl-4">
        <div className="bg-white rounded-3xl shadow-sm h-full flex flex-col py-6 w-16">
          <nav className="flex-1">
            <ul className="space-y-4 px-3">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href} className="w-full">
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <Link
                          href={item.href}
                          className={`flex items-center justify-center h-12 w-full rounded-xl transition-colors ${
                            isActive ? 'bg-[#ECF1FD]' : 'hover:bg-gray-50'
                          }`}
                        >
                          <span className={`${isActive ? 'text-[#4570EB]' : 'text-[#67676F]'}`}>
                            {item.icon}
                            <span className="sr-only">{item.label}</span>
                          </span>
                        </Link>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="right"
                          sideOffset={8}
                          className="px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg z-50"
                        >
                          {item.label}
                          <Tooltip.Arrow className="fill-gray-900" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </Tooltip.Provider>
  );
} 