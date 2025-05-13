
import React from "react";
import { Link, useLocation } from "react-router-dom";

export const GuestNavigation = () => {
  const location = useLocation();

  return (
    <>
      <Link 
        to="/tutors" 
        className={`${location.pathname === "/tutors" ? "text-primary font-medium" : "text-gray-700"} hover:text-primary`}
      >
        Репетиторы
      </Link>
      <Link 
        to="/about" 
        className={`${location.pathname === "/about" ? "text-primary font-medium" : "text-gray-700"} hover:text-primary`}
      >
        О нас
      </Link>
    </>
  );
};
