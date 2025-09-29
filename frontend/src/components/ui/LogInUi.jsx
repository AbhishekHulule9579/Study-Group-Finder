import React from 'react'

const LogInUi = () => {
  return (
   <div className='w-[50%] h-full bg-blue-950 flex flex-col  justify-center items-center'>
      <img src="./public/heroimage.png" alt="hero img"  width={500} style={{borderRadius:"30px"}}/>
      <h1 className='text-white text-[25px] m-[40px] text-center animate-pulse'>
        <span className='text-blue-400'>" Log in "</span> to join your study groups, share knowledge, and grow together.
      </h1>
      </div>
  )
}

export default LogInUi