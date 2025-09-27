import React from 'react'
import { Link } from 'react-router-dom'

const SignIn = () => {
  return (
    <div>
        <h1>wellcome to SignIn page</h1>
        <p>dont have and account? <span className='text-red-600'>create new one </span> 
        <Link to='/SignUp' 
        className='text-blue-600 hover:underline'
        >
        SignUp
        </Link> 
        </p>
    </div>
  )
}

export default SignIn