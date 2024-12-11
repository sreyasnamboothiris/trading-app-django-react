import React,{useState,useEffect} from 'react'
import ProfileIcon from '../../assets/Profle/7.png'
import reportIcon from '../../assets/Profle/reporticon.png'
import subIcon from '../../assets/Profle/subIcon.png'
import supportIcon from '../../assets/Profle/supportIcon.png'
import { useNavigate } from 'react-router-dom'

function AccountSetting() {

  const navigate = useNavigate();
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
    <div className='p-2 rounded'>
      <div>
        <h1 className='text-white font-bold text-xl'>Account setting & other info</h1>
        <div className="flex flex-col grid-cols-1 md:grid grid-cols-2 bg-[#2D5F8B] p-6 gap-4 rounded-xl">
          <div className="p-8 border grid rounded-lg cursor-pointer hover:scale-105 hover:shadow-md hover:shadow-black transform transition duration-300"
               onClick={()=>{navigate('/user/profile/edit')}}
          >
            <div className='flex'>
              <div className='px-2'>
                <img className='w-8 md:mt-4 mt-1' src={ProfileIcon} alt="" />
              </div>
              <div className='text-sm lg:text-sm xl:text-lg text-white'>
                <h1 className="font-bold">Profile</h1>
                <h1 className="">Manage personal details</h1>
              </div>
            </div>
          </div>

          <div className="p-8 border grid rounded-lg cursor-pointer hover:scale-105 hover:shadow-md hover:shadow-black transform transition duration-300"
               
          >
            <div className='flex'>
              <div className='px-2'>
                <img className='w-8 md:mt-4 mt-1' src={reportIcon} alt="" />
              </div>
              <div className='text-sm lg:text-sm xl:text-lg text-white'>
                <h1 className="font-bold">Reports</h1>
                <h1 className="">Detailed reports</h1>
              </div>
            </div>
          </div>
          <div className="p-8 border grid rounded-lg cursor-pointer hover:scale-105 hover:shadow-md hover:shadow-black transform transition duration-300">
            <div className='flex'>
              <div className='px-2'>
                <img className='w-8 md:mt-4 mt-1' src={supportIcon} alt="" />
              </div>
              <div className='text-sm lg:text-sm xl:text-lg text-white'>
                <h1 className="font-bold">Support</h1>
                <h1 className="">Chat with us</h1>
              </div>
            </div>
          </div>
          <div className="p-8 border grid rounded-lg cursor-pointer hover:scale-105 hover:shadow-md hover:shadow-black transform transition duration-300">
            <div className='flex'>
              <div className='px-2'>
                <img className='w-8 md:mt-4 mt-1' src={subIcon} alt="" />
              </div>
              <div className='text-sm lg:text-sm xl:text-lg text-white'>
                <h1 className="font-bold">Subscription Plans</h1>
                <h1 className="">Your plan details and charges</h1>
              </div>
            </div>
          </div>

        </div>
      </div>
    
    </div>
  )
}

export default AccountSetting