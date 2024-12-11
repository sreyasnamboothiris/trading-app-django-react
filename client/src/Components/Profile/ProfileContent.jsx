import React,{useEffect,useState} from 'react'

function ProfileContent() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check user's preferred mode from localStorage or system settings
    return (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  // Sync dark mode class with the `html` element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);
  return (
    <div className=''>
      <div className='w-full h-24 bg-[#2D5F8B] flex justify-between rounded-md'>
        <div className='flex flex-col'>
          <div className='flex flex-col lg:m-6 md:m-2 m-1'>
            <h1 className='text-xl text-white font-bold'>My Account</h1>
            <h1 className='text-lg text-white'>Firstname Secondname</h1>
          </div>
        </div>
        <div className='flex flex-row items-center md:m-2 w-[30%] '>
          <div className="grid grid-cols-2 md:gap-12 ">
            <div className=''>
            <button onClick={()=>setDarkMode(!darkMode)}
             className='text-white md:font-bold md:text-lg text-sm'> {darkMode ? 'Light Mode' : 'Dark Mode'}</button>
          </div>
          <div>
            <button className='text-white md:font-bold md:text-lg text-sm'>Logout</button>
          </div>
          </div>
        
        </div>
    </div>
    <div className='grid grid-cols-1 mt-12 md:gap-12 px-16 gap-4'>
      <div className='bg-[#1A3B5D] rounded-2xl p-6'>
      <div>
        <h1 className='text-xl text-white font-bold'>Account Name</h1>
      </div>
      <div className='bg-[#2D5F8B] rounded-md'>
      <div className='md:flex grid md:flex-row justify-between'>
        <div className='p-4'>
          <h1 className="text-lg text-white">
            Trading Balance
          </h1>
          <h1 className='text-sm md:text-2xl text-white md:font-bold'>0.00</h1>
        </div>
        <div className='bg-[#2D5F8B] text-white md:text-2xl md:p-8 p-2 rounded-md'>
            <button className='rounded px-3 bg-[#1A3B5D]'>Add Fund</button>
        </div>
      </div>
        
      </div>
      </div>
      <div className='bg-[#1A3B5D]'>
        kjdsdgjh
      </div>
    </div>

    </div>
  )
}

export default ProfileContent