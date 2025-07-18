import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StudentBookingManager } from "@/components/booking/StudentBookingManager";

const BookingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        <StudentBookingManager />
      </main>
      <Footer className="py-2" />
    </div>
  );
};

export default BookingPage;