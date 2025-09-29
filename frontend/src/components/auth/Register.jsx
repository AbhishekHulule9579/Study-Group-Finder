import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    pincode: "",
    secondarySchoolPercentage: "",
    higherSecondaryPercentage: "",
    password: "",
    avatarUrl: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await axios.post("http://localhost:8080/api/register", formData);
      if (res.status === 201 || res.status === 200) {
        alert("Registration successful!");
        navigate("/LogIn");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setErrors(err.response.data); // assuming backend sends validation errors in response
      } else {
        alert("Something went wrong. Try again!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 mb-20 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">Register</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* First Name */}
        <div>
          <label className="font-semibold">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
        </div>

        {/* Last Name */}
        <div>
          <label className="font-semibold">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="font-semibold">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="font-semibold">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>

        {/* City */}
        <div>
          <label className="font-semibold">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
        </div>

        {/* Pincode */}
        <div>
          <label className="font-semibold">Pincode</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.pincode && <p className="text-red-500 text-sm">{errors.pincode}</p>}
        </div>

        {/* Secondary School Percentage */}
        <div>
          <label className="font-semibold">Secondary School Percentage</label>
          <input
            type="number"
            step="0.01"
            name="secondarySchoolPercentage"
            value={formData.secondarySchoolPercentage}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.secondarySchoolPercentage && <p className="text-red-500 text-sm">{errors.secondarySchoolPercentage}</p>}
        </div>

        {/* Higher Secondary Percentage */}
        <div>
          <label className="font-semibold">Higher Secondary Percentage</label>
          <input
            type="number"
            step="0.01"
            name="higherSecondaryPercentage"
            value={formData.higherSecondaryPercentage}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.higherSecondaryPercentage && <p className="text-red-500 text-sm">{errors.higherSecondaryPercentage}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="font-semibold">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        {/* Avatar URL */}
        <div>
          <label className="font-semibold">Avatar URL (optional)</label>
          <input
            type="text"
            name="avatarUrl"
            value={formData.avatarUrl}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-900 text-white font-bold py-2 px-4 rounded hover:bg-blue-800 transition-colors mt-4"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
