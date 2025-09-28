import React from 'react'
import LogInUi from '../ui/LogInUi'
import LoginForm from '../ui/LoginForm'

const LogIn = () => {
  return (
    <div className='w-full h-[91vh] flex flex-row'>
      {/* left hero text */}
      <LogInUi/>

      {/* login form */}
      <div className='w-[50%] h-full bg-blue-500 flex justify-center items-center shadow-black ' >
     <LoginForm/>
     


      </div>
    </div>
  )
}

export default LogIn