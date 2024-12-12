import React from 'react'
import Header from '../../Components/Admin/Header'
import SideMenu from '../../Components/Admin/SideMenu'

function Admin() {
  return (
    <div>
        <div>
            <Header/>
        </div>
        <div className='flex flex-row'>
            <div className='m-2'>
                <SideMenu/>
            </div>
            <div>
                content side
            </div>
        </div>
    </div>
  )
}

export default Admin