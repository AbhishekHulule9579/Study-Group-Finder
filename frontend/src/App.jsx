import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';

// Lazy-loaded components
const Home = lazy(() => import('./components/Home'));
const About = lazy(() => import('./components/About'));
const Collab = lazy(() => import('./components/Collab'));
const Register = lazy(() => import('./components/auth/Register'));
const LogIn = lazy(() => import('./components/auth/LogIn'));

const App = () => {
  return (
    <div>
      <Nav />
      {/* Suspense wrapper with fallback */}
      <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/About' element={<About />} />
          <Route path='/Collab' element={<Collab />} />
          <Route path='/Register' element={<Register />} />
          <Route path='/LogIn' element={<LogIn />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  )
}

export default App;
