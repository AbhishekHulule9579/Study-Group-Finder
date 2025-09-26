import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className='w-full h-[100vh] flex flex-col gap-[30px] justify-center items-center'>
        <h1>Wellcome to 👇</h1>
        <h1>Study Finder Application</h1>
        <button className='w-[150px] h-[50px] rounded border-1 border-black bg-blue-400'>
                <Link to='/Collab'>Join Now</Link>
        </button>
        
    </div>
  )
}

export default Home