import React from 'react'
import {Link} from 'react-router-dom'

const Nav = () => {
  return (
    <div className='w-full h-[9vh] bg-blue-300 flex flex-row justify-center gap-[20px] items-center sticky top-0 z-50 '>
       <Link to='/' className="hover:underline font-extrabold">Home</Link>
       <Link to='/About' className="hover:underline font-extrabold">About</Link>
       <Link to='/Collab' className="hover:underline font-extrabold">Collab</Link>
    </div>
  )
}

export default Nav