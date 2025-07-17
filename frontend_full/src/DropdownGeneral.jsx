import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';

export default function DropdownGeneral({
  options = [],
  value,
  onChange,
  placeholder = 'Seleciona...',
  allowEmpty = false,
  emptyLabel = 'Todos'
}) {
  const finalOptions = allowEmpty ? ['', ...options.filter(Boolean)] : options.filter(Boolean);

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className="relative w-full">
          <Listbox.Button className="bg-[#2a2a2a] text-white p-3 pr-10 rounded w-full text-left transition-all">
            {value || placeholder}
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {open ? (
                <ChevronUpIcon className="h-4 w-4 text-white" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-white" />
              )}
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            show={open}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-1"
          >
            <Listbox.Options className="absolute mt-1 w-full bg-[#2a2a2a] text-white rounded shadow-lg z-10 max-h-60 overflow-auto">
              {finalOptions.map((opt, index) => (
                <Listbox.Option
                  key={index}
                  value={opt}
                  className="p-2 hover:bg-[#3a3a3a] cursor-pointer"
                >
                  {(opt || emptyLabel).charAt(0).toUpperCase() + (opt || emptyLabel).slice(1)}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}