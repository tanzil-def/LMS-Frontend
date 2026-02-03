// src/pages/FillUpForm/FillUpForm.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { format, addDays, differenceInCalendarDays } from "date-fns";
import api from "../../api";

export default function FillUpForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get book data
  const bookData = location.state?.borrowNow || JSON.parse(localStorage.getItem('borrowNow'));

  const [returnDate, setReturnDate] = useState("");
  const [borrowingDays, setBorrowingDays] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!bookData) navigate("/", { replace: true });
  }, [bookData, navigate]);

  if (!bookData) return <div className="text-center py-20">Loading...</div>;

  const today = new Date();
  const maxReturnDate = addDays(today, 14);

  const handleReturnDateChange = (e) => {
    const selected = new Date(e.target.value);
    const diffDays = differenceInCalendarDays(selected, today);

    if (diffDays < 1) {
      alert("Return date cannot be today or in the past.");
      setReturnDate("");
      setBorrowingDays(0);
      return;
    }
    if (diffDays > 14) {
      alert("You cannot borrow a book for more than 14 days.");
      setReturnDate("");
      setBorrowingDays(0);
      return;
    }

    setReturnDate(e.target.value);
    setBorrowingDays(diffDays);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!returnDate || borrowingDays === 0) {
      alert("Please select a valid return date within 14 days.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        user_id: 3,             
        book_id: bookData.id,
        days: borrowingDays
      };

      const response = await api.post("/borrow/create", payload);
      console.log("Borrow response:", response.data);

      alert(`Successfully requested to borrow "${bookData.title}" for ${borrowingDays} days.`);
      localStorage.removeItem('borrowNow');
      navigate(`/book/${bookData.id}`);
    } catch (err) {
      console.error(err.response || err);
      if (err.response?.status === 422) {
        alert("Invalid data. Please check your selection.");
      } else if (err.response?.status === 401) {
        alert("Unauthorized. Please login again.");
      } else {
        alert("Failed to submit borrow request.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const mockAvailableDate = format(today, "MM/dd/yyyy");

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          Fill Up Book Borrow Form
        </h1>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Book Cover */}
          <div className="flex-shrink-0 w-full sm:w-1/3 max-w-[200px]">
            <img
              src={bookData.coverImage}
              alt={bookData.title}
              className="w-full h-auto rounded-md shadow-lg"
            />
          </div>

          {/* Form & Details */}
          <div className="flex-grow">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{bookData.title}</h2>
            <p className="text-gray-600 mt-1">by {bookData.authors}</p>

            <div className="mt-5 p-4 bg-gray-100 rounded-lg text-gray-700 space-y-2">
              <p><span className="font-semibold">Available from:</span> {mockAvailableDate}</p>
              <p><span className="font-semibold">Must return within 14 days</span></p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Borrowing Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Borrowing Days (auto)
                  </label>
                  <input
                    type="text"
                    value={borrowingDays > 0 ? borrowingDays : "—"}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-900 font-semibold"
                  />
                </div>

                {/* Return Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Date (max 14 days)
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={format(today, "yyyy-MM-dd")}
                      max={format(maxReturnDate, "yyyy-MM-dd")}
                      value={returnDate}
                      onChange={handleReturnDateChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500 bg-white"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !returnDate}
                className={`w-full px-4 py-3 text-white font-semibold rounded-md transition duration-150 ${
                  isSubmitting || !returnDate
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-sky-500 hover:bg-sky-600"
                }`}
              >
                {isSubmitting ? "Submitting Request..." : "Confirm Borrow Request"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
