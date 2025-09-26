import React from 'react'
import Home from './components/Home'
import Nav from './components/Nav'
import { Route,Routes } from 'react-router-dom'
import Collab from './components/Collab'
import About from './components/About'

const App = () => {
  return (
    <div>
      <Nav/>
      <div>

        <Routes>
            <Route path='/' element={<Home/>} />
            <Route path='/About' element={<About/>} />
            <Route path='/Collab' element={<Collab/>} />
        </Routes>

      </div>
      
    </div>
  )
}

export default App