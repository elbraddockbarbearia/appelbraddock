import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const BarberRoute = () => {
  const token = localStorage.getItem('barberToken');
  return token ? <Outlet /> : <Navigate to="/barber/login" replace />;
};

export default BarberRoute;
